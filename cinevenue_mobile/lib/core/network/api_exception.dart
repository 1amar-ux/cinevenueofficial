class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';

  factory ApiException.fromDioError(dynamic error) {
    if (error.response != null) {
      final statusCode = error.response?.statusCode;
      final data = error.response?.data;
      String message = 'An unexpected error occurred';

      if (data is Map<String, dynamic>) {
        message = data['message'] ?? data['error'] ?? message;
      }

      return ApiException(
        message: message,
        statusCode: statusCode,
        details: data,
      );
    }

    return ApiException(
      message: error.message ?? 'Network connection failed. Please check your internet connection.',
      statusCode: null,
    );
  }
}
