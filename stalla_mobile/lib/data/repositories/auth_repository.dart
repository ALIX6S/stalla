import 'dart:convert';
import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/session_storage.dart';

class AuthRepository {
  final ApiClient _api;
  final SessionStorage _session;

  const AuthRepository(this._api, this._session);

  /// Connexion par email ou téléphone ; la session est persistée en cas de succès.
  Future<ApiResponse<User>> login({
    required String identifier,
    required String password,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      body: {'identifier': identifier, 'password': password},
      parse: (json) => json as Map<String, dynamic>,
      errorMessage: 'Erreur de connexion',
    );

    final data = response.data;
    if (!response.success || data == null) {
      return ApiResponse(
        success: false,
        message: response.message,
        statusCode: response.statusCode,
      );
    }

    final userJson = data['user'] as Map<String, dynamic>;
    final user = User.fromJson(userJson);
    if (user.role != AppConstants.roleVendor) {
      return const ApiResponse(
        success: false,
        message: 'Cette application est réservée aux vendeurs.',
      );
    }

    await _session.save(
      token: data['token'] as String,
      userJson: jsonEncode(userJson),
    );
    return ApiResponse(success: true, data: user, message: response.message);
  }

  Future<ApiResponse<void>> submitVendorApplication({
    required String fullName,
    required String businessType,
    required String phone,
    String? email,
    required String desiredZone,
    required String desiredCategory,
    required int budgetMin,
    required int budgetMax,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      ApiEndpoints.vendorApplication,
      body: {
        'full_name': fullName,
        'business_type': businessType,
        'phone': phone,
        'email': (email == null || email.trim().isEmpty) ? null : email.trim(),
        'desired_zone': desiredZone,
        'desired_category': desiredCategory,
        'budget_min': budgetMin,
        'budget_max': budgetMax,
      },
      parse: (json) => json as Map<String, dynamic>,
      errorMessage: "Erreur lors de l'envoi de la demande",
    );
    return ApiResponse(
      success: response.success,
      message: response.message,
    );
  }

  Future<void> logout() => _session.clear();

  /// Utilisateur de la session persistée, `null` si absente ou invalide.
  Future<User?> restoreSession() async {
    final token = await _session.readToken();
    final userJson = await _session.readUser();
    if (token == null || userJson == null) return null;
    try {
      final user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
      return user.role == AppConstants.roleVendor ? user : null;
    } catch (_) {
      return null;
    }
  }
}
