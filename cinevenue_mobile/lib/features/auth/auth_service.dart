import 'dart:convert';
import 'dart:io';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../models/user_model.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();
  final SecureStorageService _storageService = SecureStorageService();

  Future<UserModel> login({required String email, required String password}) async {
    final response = await _apiClient.post(
      ApiEndpoints.login,
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    final data = response.data;
    final token = data['token'] ?? data['data']?['token'] ?? data['accessToken'];
    final refreshToken = data['refreshToken'] ?? data['data']?['refreshToken'];
    final userJson = data['user'] ?? data['data']?['user'] ?? {};

    if (token != null) {
      await _storageService.saveAccessToken(token);
    }
    if (refreshToken != null) {
      await _storageService.saveRefreshToken(refreshToken);
    }

    final user = UserModel.fromJson(userJson);
    await _storageService.saveUserProfile(jsonEncode(user.toJson()));
    return user;
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    String? mobile,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.register,
      data: {
        'name': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        if (mobile != null && mobile.isNotEmpty) 'mobile': mobile.trim(),
      },
    );

    final data = response.data;
    final token = data['token'] ?? data['data']?['token'] ?? data['accessToken'];
    final refreshToken = data['refreshToken'] ?? data['data']?['refreshToken'];
    final userJson = data['user'] ?? data['data']?['user'] ?? {};

    if (token != null) {
      await _storageService.saveAccessToken(token);
    }
    if (refreshToken != null) {
      await _storageService.saveRefreshToken(refreshToken);
    }

    final user = UserModel.fromJson(userJson);
    await _storageService.saveUserProfile(jsonEncode(user.toJson()));
    return user;
  }

  Future<UserModel?> getProfile() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.profile);
      final userJson = response.data['data']?['user'] ?? response.data['user'] ?? response.data['data'] ?? {};
      final user = UserModel.fromJson(userJson);
      await _storageService.saveUserProfile(jsonEncode(user.toJson()));
      return user;
    } catch (_) {
      // Return cached user if offline
      final cached = await _storageService.getUserProfile();
      if (cached != null) {
        return UserModel.fromJson(jsonDecode(cached));
      }
      return null;
    }
  }

  Future<UserModel> updateProfile({
    String? name,
    String? mobile,
    String? avatarUrl,
  }) async {
    final response = await _apiClient.put(
      ApiEndpoints.profile,
      data: {
        if (name != null) 'name': name.trim(),
        if (mobile != null) 'mobile': mobile.trim(),
        if (avatarUrl != null) 'avatarUrl': avatarUrl.trim(),
      },
    );

    final userJson = response.data['data']?['user'] ?? response.data['user'] ?? response.data['data'] ?? {};
    final user = UserModel.fromJson(userJson);
    await _storageService.saveUserProfile(jsonEncode(user.toJson()));
    return user;
  }

  Future<void> registerDeviceToken({
    required String token,
    String? deviceModel,
    String? appVersion,
  }) async {
    final platform = Platform.isAndroid ? 'ANDROID' : 'IOS';
    await _apiClient.post(
      ApiEndpoints.registerDeviceToken,
      data: {
        'token': token,
        'platform': platform,
        'deviceModel': deviceModel ?? (Platform.isAndroid ? 'Android Device' : 'iOS Device'),
        'appVersion': appVersion ?? '1.0.0',
      },
    );
    await _storageService.saveDeviceToken(token);
  }

  Future<void> logout() async {
    try {
      final token = await _storageService.getDeviceToken();
      if (token != null && token.isNotEmpty) {
        await _apiClient.post(
          ApiEndpoints.deactivateDeviceToken,
          data: {'token': token},
        );
      }
      await _apiClient.post(ApiEndpoints.logout);
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      await _storageService.clearAuthSession();
    }
  }

  Future<bool> isAuthenticated() async {
    final token = await _storageService.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
