import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../storage/secure_storage_service.dart';

class AuthInterceptor extends QueuedInterceptor {
  final Dio dio;
  final SecureStorageService storageService;
  bool _isRefreshing = false;

  AuthInterceptor({
    required this.dio,
    required this.storageService,
  });

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storageService.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // If request failed with 401 Unauthorized and not already refreshing token
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      final isAuthEndpoint = err.requestOptions.path.contains('/auth/login') ||
          err.requestOptions.path.contains('/auth/refresh') ||
          err.requestOptions.path.contains('/auth/register');

      if (!isAuthEndpoint) {
        _isRefreshing = true;
        try {
          final refreshToken = await storageService.getRefreshToken();
          if (refreshToken != null && refreshToken.isNotEmpty) {
            // Call mobile refresh endpoint
            final refreshResponse = await dio.post(
              ApiEndpoints.refresh,
              data: {'refreshToken': refreshToken},
              options: Options(headers: {'Authorization': ''}),
            );

            if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
              final data = refreshResponse.data;
              final newAccessToken = data['token'] ??
                  data['data']?['tokens']?['accessToken'] ??
                  data['accessToken'];
              final newRefreshToken = data['data']?['tokens']?['refreshToken'] ??
                  data['refreshToken'];

              if (newAccessToken != null) {
                await storageService.saveAccessToken(newAccessToken);
                if (newRefreshToken != null) {
                  await storageService.saveRefreshToken(newRefreshToken);
                }

                // Retry original request with new access token
                final newOptions = err.requestOptions;
                newOptions.headers['Authorization'] = 'Bearer $newAccessToken';

                final retryResponse = await dio.fetch(newOptions);
                _isRefreshing = false;
                return handler.resolve(retryResponse);
              }
            }
          }
        } catch (refreshErr) {
          // Token refresh failed or token revoked
          await storageService.clearAuthSession();
        } finally {
          _isRefreshing = false;
        }
      }
    }

    return handler.next(err);
  }
}
