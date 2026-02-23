import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/debt.dart';
import '../models/stand.dart';
import '../models/vendor_profile.dart';
import '../services/api_client.dart';

class VendorRepository {
  final ApiClient _api;

  const VendorRepository(this._api);

  /// Profil vendeur + stand actif (un 404 sur le stand signifie « aucun stand »).
  Future<ApiResponse<VendorProfile>> getProfile() async {
    final (profile, stall) = await (
      _api.get<Map<String, dynamic>>(
        ApiEndpoints.vendorProfile,
        parse: (json) => json as Map<String, dynamic>,
        errorMessage: 'Erreur lors de la récupération du profil',
      ),
      _api.get<Stand>(
        ApiEndpoints.vendorMyStall,
        parse: (json) => Stand.fromJson(json as Map<String, dynamic>),
        errorMessage: 'Erreur lors de la récupération du stand',
      ),
    ).wait;

    if (!profile.hasData) {
      return ApiResponse(success: false, message: profile.message);
    }
    if (!stall.success && stall.statusCode != 404) {
      return ApiResponse(success: false, message: stall.message);
    }

    return ApiResponse(
      success: true,
      data: VendorProfile.fromJson(profile.data!, stand: stall.data),
    );
  }

  Future<ApiResponse<Debt>> getDebt() {
    return _api.get<Debt>(
      ApiEndpoints.vendorBalance,
      parse: (json) => Debt.fromJson(json as Map<String, dynamic>),
      errorMessage: 'Erreur lors de la récupération de la balance',
    );
  }

  Future<ApiResponse<void>> resetPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _api.post<Object>(
      ApiEndpoints.vendorResetPassword,
      body: {
        'current_password': currentPassword,
        'new_password': newPassword,
      },
      parse: (json) => json as Object,
      errorMessage: 'Erreur lors de la réinitialisation',
    );
    return ApiResponse(success: response.success, message: response.message);
  }
}
