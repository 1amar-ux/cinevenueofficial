import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class SecureStorageService {
  static final SecureStorageService _instance = SecureStorageService._internal();
  factory SecureStorageService() => _instance;
  SecureStorageService._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  // Access Token
  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: AppConstants.keyAccessToken, value: token);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: AppConstants.keyAccessToken);
  }

  // Refresh Token
  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: AppConstants.keyRefreshToken, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: AppConstants.keyRefreshToken);
  }

  // Tokens Pair
  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await saveAccessToken(accessToken);
    await saveRefreshToken(refreshToken);
  }

  // User Profile
  Future<void> saveUserProfile(String userJson) async {
    await _storage.write(key: AppConstants.keyUserProfile, value: userJson);
  }

  Future<String?> getUserProfile() async {
    return await _storage.read(key: AppConstants.keyUserProfile);
  }

  // Device Token (FCM / APNs)
  Future<void> saveDeviceToken(String token) async {
    await _storage.write(key: AppConstants.keyDeviceToken, value: token);
  }

  Future<String?> getDeviceToken() async {
    return await _storage.read(key: AppConstants.keyDeviceToken);
  }

  // Clear Session (on logout)
  Future<void> clearAuthSession() async {
    await _storage.delete(key: AppConstants.keyAccessToken);
    await _storage.delete(key: AppConstants.keyRefreshToken);
    await _storage.delete(key: AppConstants.keyUserProfile);
  }

  // Clear All Data
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
