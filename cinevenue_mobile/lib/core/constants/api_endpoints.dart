/// Canonical API endpoint constants for CineVenue Mobile Application.
/// Matches server/routes.ts and canonical REST controllers under /api/v1.
class ApiEndpoints {
  ApiEndpoints._();

  // Root Health
  static const String health = '/health';
  static const String platformConfig = '/public/platform-config';

  // Auth & Profile
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String googleAuth = '/auth/google';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String getProfile = '/auth/me';
  static const String updateProfile = '/auth/me';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Movies
  static const String movies = '/movies';
  static String movieDetail(String id) => '/movies/$id';

  // Theatres
  static const String theatres = '/theatres';
  static String theatreDetail(String id) => '/theatres/$id';

  // Shows & Showtimes
  static const String shows = '/shows';
  static const String theatresAndShowtimes = '/shows/theatres-and-showtimes';
  static String showSeats(String showId) => '/shows/$showId/seats';

  // Bookings & Seat Locking
  static const String lockSeats = '/bookings/lock-seats';
  static const String releaseSeats = '/bookings/release-seats';
  static const String createBooking = '/bookings';
  static const String myBookings = '/bookings/my';

  // Centralized Pricing
  static const String calculatePricing = '/pricing/calculate';

  // Payments
  static const String razorpayCreateOrder = '/payments/razorpay/create-order';
  static const String razorpayVerifyPayment = '/payments/razorpay/verify-payment';
  static const String cashfreeCreateOrder = '/payments/cashfree/create-order';
  static const String cashfreeVerifyPayment = '/payments/cashfree/verify-payment';
  static const String testConfirmPayment = '/payments/test-confirm';

  // Tickets
  static const String verifyTicket = '/tickets/verify';

  // Events
  static const String events = '/events';
  static String eventDetail(String id) => '/events/$id';
  static String eventCreateOrder(String eventId) => '/events/$eventId/create-order';
  static String eventVerifyAndRegister(String eventId) => '/events/$eventId/verify-and-register';
  static String eventCancelRegistration(String regId) => '/events/registrations/$regId/cancel';

  // Push Notifications
  static const String registerDeviceToken = '/notifications/device-token';
  static const String deactivateDeviceToken = '/notifications/device-token/deactivate';
  static const String reminderSettings = '/notifications/reminders/settings';

  // CineCoins Loyalty (Gated until Dec 2026)
  static const String myWallet = '/cinecoins/my-wallet';
  static const String claimDaily = '/cinecoins/claim-daily';
  static const String redeemCoins = '/cinecoins/redeem';

  // Feedback
  static const String submitFeedback = '/feedback';
  static const String myFeedback = '/feedback/my';
}

