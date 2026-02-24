import 'package:flutter/foundation.dart';
import '../../data/models/user.dart';
import '../../data/repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _repository;

  AuthProvider(this._repository);

  User? _user;
  bool _isBusy = false;
  String? _errorMessage;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isBusy => _isBusy;
  String? get errorMessage => _errorMessage;

  /// Restaure la session persistée (appelé une fois au démarrage).
  Future<void> restoreSession() async {
    _user = await _repository.restoreSession();
    if (_user == null) await _repository.logout();
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    _setBusy(true);
    final response =
        await _repository.login(identifier: identifier, password: password);
    _user = response.data;
    _errorMessage = response.success ? null : response.message;
    _setBusy(false);
    return response.success;
  }

  Future<bool> submitVendorApplication({
    required String fullName,
    required String businessType,
    required String phone,
    String? email,
    required String desiredZone,
    required String desiredCategory,
    required int budgetMin,
    required int budgetMax,
  }) async {
    _setBusy(true);
    final response = await _repository.submitVendorApplication(
      fullName: fullName,
      businessType: businessType,
      phone: phone,
      email: email,
      desiredZone: desiredZone,
      desiredCategory: desiredCategory,
      budgetMin: budgetMin,
      budgetMax: budgetMax,
    );
    _errorMessage = response.success ? null : response.message;
    _setBusy(false);
    return response.success;
  }

  Future<void> logout() async {
    await _repository.logout();
    _user = null;
    notifyListeners();
  }

  /// Session invalidée côté serveur (token expiré) : retour à l'écran public.
  void handleSessionExpired() {
    if (_user == null) return;
    _user = null;
    notifyListeners();
  }

  void _setBusy(bool value) {
    _isBusy = value;
    notifyListeners();
  }
}
