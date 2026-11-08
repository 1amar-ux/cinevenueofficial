import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/show_model.dart';
import '../../models/theatre_model.dart';

class ShowsService {
  final ApiClient _apiClient = ApiClient();

  Future<List<ShowtimeModel>> getShowsForMovie({
    required String movieId,
    String? city,
    DateTime? date,
  }) async {
    final queryParams = <String, dynamic>{
      'movieId': movieId,
    };
    if (city != null) queryParams['city'] = city;
    if (date != null) queryParams['date'] = date.toIso8601String().split('T')[0];

    final response = await _apiClient.get(
      ApiEndpoints.shows,
      queryParameters: queryParams,
    );

    final data = response.data;
    List<dynamic> list = [];
    if (data['data'] is Map && data['data']['shows'] is List) {
      list = data['data']['shows'];
    } else if (data['shows'] is List) {
      list = data['shows'];
    } else if (data['data'] is List) {
      list = data['data'];
    } else if (data is List) {
      list = data;
    }

    return list.map((item) => ShowtimeModel.fromJson(item)).toList();
  }

  Future<List<TheatreModel>> getTheatres({String? city}) async {
    final queryParams = <String, dynamic>{};
    if (city != null) queryParams['city'] = city;

    final response = await _apiClient.get(
      ApiEndpoints.theatres,
      queryParameters: queryParams,
    );

    final data = response.data;
    List<dynamic> list = [];
    if (data['data'] is Map && data['data']['theatres'] is List) {
      list = data['data']['theatres'];
    } else if (data['theatres'] is List) {
      list = data['theatres'];
    } else if (data['data'] is List) {
      list = data['data'];
    } else if (data is List) {
      list = data;
    }

    return list.map((item) => TheatreModel.fromJson(item)).toList();
  }
}
