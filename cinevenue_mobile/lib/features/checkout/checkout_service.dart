import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/booking_model.dart';

class PricingBreakdown {
  final double baseAmount;
  final double convenienceFee;
  final double gst;
  final double discount;
  final double totalAmount;

  PricingBreakdown({
    required this.baseAmount,
    required this.convenienceFee,
    required this.gst,
    required this.discount,
    required this.totalAmount,
  });

  factory PricingBreakdown.fromJson(Map<String, dynamic> json) {
    return PricingBreakdown(
      baseAmount: (json['baseAmount'] is num) ? (json['baseAmount'] as num).toDouble() : (json['basePrice'] is num ? (json['basePrice'] as num).toDouble() : 0.0),
      convenienceFee: (json['convenienceFee'] is num) ? (json['convenienceFee'] as num).toDouble() : (json['convenienceFeeTotal'] is num ? (json['convenienceFeeTotal'] as num).toDouble() : 0.0),
      gst: (json['gst'] is num) ? (json['gst'] as num).toDouble() : (json['tax'] is num ? (json['tax'] as num).toDouble() : 0.0),
      discount: (json['discount'] is num) ? (json['discount'] as num).toDouble() : 0.0,
      totalAmount: (json['totalAmount'] is num) ? (json['totalAmount'] as num).toDouble() : (json['finalTotal'] is num ? (json['finalTotal'] as num).toDouble() : 0.0),
    );
  }
}

class CheckoutService {
  final ApiClient _apiClient = ApiClient();

  Future<PricingBreakdown> calculateAuthoritativePricing({
    required double baseAmount,
    required int seatCount,
    String? couponCode,
    int? cineCoinsRedeemed,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.calculatePricing,
      data: {
        'baseAmount': baseAmount,
        'seatCount': seatCount,
        if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
        if (cineCoinsRedeemed != null && cineCoinsRedeemed > 0) 'cineCoinsRedeemed': cineCoinsRedeemed,
      },
    );

    final data = response.data;
    final pricingJson = data['data']?['breakdown'] ?? data['data'] ?? data['breakdown'] ?? data;
    return PricingBreakdown.fromJson(pricingJson);
  }

  Future<Map<String, dynamic>> createPaymentOrder({
    required String showId,
    required List<String> seatIds,
    required double amount,
    String gateway = 'RAZORPAY',
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.createPaymentOrder,
      data: {
        'showId': showId,
        'seatIds': seatIds,
        'amount': amount,
        'gateway': gateway,
      },
    );

    return response.data['data'] ?? response.data;
  }

  Future<BookingModel> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
    required String showId,
    required List<String> seatIds,
    String gateway = 'RAZORPAY',
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.verifyPayment,
      data: {
        'orderId': orderId,
        'paymentId': paymentId,
        'signature': signature,
        'showId': showId,
        'seatIds': seatIds,
        'gateway': gateway,
      },
    );

    final bookingJson = response.data['data']?['booking'] ?? response.data['booking'] ?? response.data['data'];
    return BookingModel.fromJson(bookingJson);
  }
}
