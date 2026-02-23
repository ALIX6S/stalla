import 'package:dio/dio.dart';
import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import 'session_storage.dart';

/// Client HTTP unique : ajoute le token, détecte les sessions expirées et
/// convertit chaque réponse/erreur en [ApiResponse].
class ApiClient {
  final Dio _dio;
  final SessionStorage _session;

  /// Appelé quand une requête authentifiée reçoit un 401.
  void Function()? onUnauthorized;

  ApiClient(this._session)
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConstants.apiBaseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            headers: const {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _session.readToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isAuthenticatedCall =
              error.requestOptions.headers.containsKey('Authorization');
          if (error.response?.statusCode == 401 && isAuthenticatedCall) {
            await _session.clear();
            onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    required T Function(dynamic json) parse,
    required String errorMessage,
  }) =>
      _send(() => _dio.get(path), parse, errorMessage);

  Future<ApiResponse<T>> post<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(dynamic json) parse,
    required String errorMessage,
  }) =>
      _send(() => _dio.post(path, data: body), parse, errorMessage);

  Future<ApiResponse<T>> _send<T>(
    Future<Response<dynamic>> Function() request,
    T Function(dynamic json) parse,
    String errorMessage,
  ) async {
    try {
      final response = await request();
      final body = response.data as Map<String, dynamic>;
      final raw = body['data'];
      return ApiResponse<T>(
        success: body['success'] as bool? ?? true,
        message: body['message'] as String?,
        data: raw == null ? null : parse(raw),
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      final data = e.response?.data;
      final serverMessage = data is Map ? data['message'] as String? : null;
      final isNetworkError = e.response == null;
      return ApiResponse<T>(
        success: false,
        message: serverMessage ??
            (isNetworkError ? 'Impossible de joindre le serveur' : errorMessage),
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return ApiResponse<T>(success: false, message: errorMessage);
    }
  }
}
