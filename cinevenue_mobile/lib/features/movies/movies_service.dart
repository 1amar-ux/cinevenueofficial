import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/movie_model.dart';

class MoviesService {
  final ApiClient _apiClient = ApiClient();

  Future<List<MovieModel>> getMovies({int page = 1, int limit = 20, String? search}) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    final response = await _apiClient.get(
      ApiEndpoints.movies,
      queryParameters: queryParams,
    );

    final data = response.data;
    List<dynamic> list = [];
    if (data['data'] is Map && data['data']['movies'] is List) {
      list = data['data']['movies'];
    } else if (data['movies'] is List) {
      list = data['movies'];
    } else if (data['data'] is List) {
      list = data['data'];
    } else if (data is List) {
      list = data;
    }

    return list.map((item) => MovieModel.fromJson(item)).toList();
  }

  Future<MovieModel> getMovieById(String id) async {
    final response = await _apiClient.get(ApiEndpoints.movieDetails(id));
    final data = response.data;
    final movieJson = data['data']?['movie'] ?? data['movie'] ?? data['data'] ?? data;
    return MovieModel.fromJson(movieJson);
  }
}
