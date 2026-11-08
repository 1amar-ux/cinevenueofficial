class AppConstants {
  static const String appName = 'CineVenue';
  static const String appTagline = 'Luxury Cinema & Live Events';
  static const String appVersion = '1.0.0';
  static const int buildNumber = 1;

  // Default Backend URL (Can be overridden via .env or dart-define)
  static const String defaultBaseUrl = 'http://10.0.2.2:3000/api/v1'; // Android emulator localhost
  static const String defaultIosBaseUrl = 'http://localhost:3000/api/v1';

  // Timeout settings
  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 15000;

  // Seat hold duration in seconds (10 minutes)
  static const int seatHoldDurationSeconds = 600;

  // Storage Keys
  static const String keyAccessToken = 'cv_access_token';
  static const String keyRefreshToken = 'cv_refresh_token';
  static const String keyUserProfile = 'cv_user_profile';
  static const String keySelectedCity = 'cv_selected_city';
  static const String keyDeviceToken = 'cv_device_token';
  static const String keyOnboardingComplete = 'cv_onboarding_complete';

  // Default Cities
  static const List<String> supportedCities = [
    'Hyderabad',
    'Bangalore',
    'Chennai',
    'Mumbai',
    'Delhi NCR',
    'Kolkata',
    'Pune',
    'Kochi'
  ];
}
