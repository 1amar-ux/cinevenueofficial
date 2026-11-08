import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/booking_model.dart';
import '../../models/event_model.dart';

class EventsService {
  final ApiClient _apiClient = ApiClient();

  Future<List<EventModel>> getEvents({int page = 1, int limit = 20, String? search}) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    final response = await _apiClient.get(
      ApiEndpoints.events,
      queryParameters: queryParams,
    );

    final data = response.data;
    List<dynamic> list = [];
    if (data['data'] is Map && data['data']['events'] is List) {
      list = data['data']['events'];
    } else if (data['events'] is List) {
      list = data['events'];
    } else if (data['data'] is List) {
      list = data['data'];
    } else if (data is List) {
      list = data;
    }

    return list.map((item) => EventModel.fromJson(item)).toList();
  }

  Future<EventModel> getEventById(String id) async {
    final response = await _apiClient.get(ApiEndpoints.eventDetails(id));
    final data = response.data;
    final eventJson = data['data']?['event'] ?? data['event'] ?? data['data'] ?? data;
    return EventModel.fromJson(eventJson);
  }

  Future<BookingModel> bookEventTicket({
    required String eventId,
    required String tierId,
    required int quantity,
    required double amount,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.bookEvent,
      data: {
        'eventId': eventId,
        'tierId': tierId,
        'quantity': quantity,
        'amount': amount,
        'isFreePass': amount <= 0,
      },
    );

    final bookingJson = response.data['data']?['booking'] ?? response.data['booking'] ?? response.data['data'];
    return BookingModel.fromJson(bookingJson);
  }
}
