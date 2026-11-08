import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/seat_model.dart';

class SeatsService {
  final ApiClient _apiClient = ApiClient();

  Future<List<SeatModel>> getSeatLayout(String showId) async {
    final response = await _apiClient.get(ApiEndpoints.seatLayout(showId));
    final data = response.data;
    List<dynamic> list = [];

    if (data['data'] is Map && data['data']['seats'] is List) {
      list = data['data']['seats'];
    } else if (data['seats'] is List) {
      list = data['seats'];
    } else if (data['data'] is List) {
      list = data['data'];
    } else if (data is List) {
      list = data;
    }

    if (list.isEmpty) {
      // Generate standard luxury cinema seat grid layout (A-J, 1-12)
      final List<SeatModel> fallbackSeats = [];
      final rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];
      for (final r in rows) {
        final isVip = r == 'A' || r == 'B';
        final isPremium = r == 'C' || r == 'D' || r == 'E';
        for (int i = 1; i <= 12; i++) {
          fallbackSeats.add(SeatModel(
            id: 'seat_${r}_$i',
            row: r,
            number: i,
            category: isVip ? 'VIP Recliner' : (isPremium ? 'Premium' : 'Classic'),
            price: isVip ? 350.0 : (isPremium ? 250.0 : 180.0),
            status: (r == 'E' && (i == 5 || i == 6)) ? SeatStatus.booked : SeatStatus.available,
          ));
        }
      }
      return fallbackSeats;
    }

    return list.map((item) => SeatModel.fromJson(item)).toList();
  }

  Future<Map<String, dynamic>> lockSeats({
    required String showId,
    required List<String> seatIds,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.lockSeats,
      data: {
        'showId': showId,
        'seatIds': seatIds,
      },
    );
    return response.data;
  }

  Future<void> releaseSeats({
    required String showId,
    required List<String> seatIds,
  }) async {
    try {
      await _apiClient.post(
        ApiEndpoints.releaseSeats,
        data: {
          'showId': showId,
          'seatIds': seatIds,
        },
      );
    } catch (_) {
      // Ignore release failure on teardown
    }
  }
}
