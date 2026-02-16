import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persistance sécurisée de la session (token JWT + utilisateur connecté).
class SessionStorage {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'user_data';

  final FlutterSecureStorage _storage;

  const SessionStorage([this._storage = const FlutterSecureStorage()]);

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<String?> readUser() => _storage.read(key: _userKey);

  Future<void> save({required String token, required String userJson}) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: userJson);
  }

  Future<void> clear() => _storage.deleteAll();
}
