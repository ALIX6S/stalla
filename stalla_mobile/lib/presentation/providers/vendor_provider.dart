import 'package:flutter/foundation.dart';
import '../../data/models/debt.dart';
import '../../data/models/vendor_profile.dart';
import '../../data/repositories/vendor_repository.dart';

class VendorProvider extends ChangeNotifier {
  final VendorRepository _repository;

  VendorProvider(this._repository);

  VendorProfile? _profile;
  Debt? _debt;
  bool _isLoading = false;
  String? _profileError;
  String? _debtError;

  VendorProfile? get profile => _profile;
  Debt? get debt => _debt;
  bool get isLoading => _isLoading;
  String? get profileError => _profileError;
  String? get debtError => _debtError;

  Future<void> load() async {
    _isLoading = true;
    notifyListeners();

    final (profile, debt) =
        await (_repository.getProfile(), _repository.getDebt()).wait;

    _profile = profile.hasData ? profile.data : _profile;
    _profileError = profile.success ? null : profile.message;
    _debt = debt.hasData ? debt.data : _debt;
    _debtError = debt.success ? null : debt.message;

    _isLoading = false;
    notifyListeners();
  }

  /// Retourne `null` en cas de succès, sinon le message d'erreur.
  Future<String?> resetPassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _repository.resetPassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
    return response.success
        ? null
        : (response.message ?? 'Erreur de réinitialisation');
  }

  void clear() {
    _profile = null;
    _debt = null;
    _profileError = null;
    _debtError = null;
    notifyListeners();
  }
}
