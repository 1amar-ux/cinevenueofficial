import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/movie.dart';
import '../models/user.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException(this.message, {this.statusCode, this.details});

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class ApiService {
  // Base URL configured for Android Emulator loopback to local server
  static const String defaultBaseUrl = 'http://10.0.2.2:3000/api';

  final String baseUrl;
  final http.Client _client;
  String? _authToken;

  ApiService({
    String? baseUrl,
    http.Client? client,
  })  : baseUrl = baseUrl ?? defaultBaseUrl,
        _client = client ?? http.Client();

  /// Sets or clears the active JWT authentication token
  void setAuthToken(String? token) {
    _authToken = token;
  }

  /// Helper to generate common request headers
  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_authToken != null && _authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // ==========================================
  // MOVIE ENDPOINTS
  // ==========================================

  /// Fetches the list of active movies
  Future<List<Movie>> fetchMovies() async {
    final uri = Uri.parse('$baseUrl/v1/movies');

    try {
      final response = await _client
          .get(uri, headers: _buildHeaders())
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);

        List<dynamic> list = [];
        if (decoded is List) {
          list = decoded;
        } else if (decoded is Map<String, dynamic>) {
          if (decoded['data'] is List) {
            list = decoded['data'];
          } else if (decoded['data'] is Map && decoded['data']['movies'] is List) {
            list = decoded['data']['movies'];
          } else if (decoded['movies'] is List) {
            list = decoded['movies'];
          }
        }

        if (list.isNotEmpty) {
          return list.map((item) => Movie.fromJson(item as Map<String, dynamic>)).toList();
        }
      } else if (response.statusCode == 404 || response.statusCode == 503) {
        // Fallback endpoint without version prefix if backend mounted at root /api
        return await _fetchMoviesFallback();
      }

      // If server returns empty list or unexpected payload, provide offline resilient fallback
      return _getFallbackMovies();
    } on SocketException catch (_) {
      // Graceful offline fallback during initial frontend development
      return _getFallbackMovies();
    } on TimeoutException catch (_) {
      return _getFallbackMovies();
    } on FormatException catch (e) {
      throw ApiException('Malformed response format received from server', details: e);
    } catch (e) {
      return _getFallbackMovies();
    }
  }

  /// Secondary endpoint probe for /api/movies
  Future<List<Movie>> _fetchMoviesFallback() async {
    try {
      final uri = Uri.parse('$baseUrl/movies');
      final res = await _client.get(uri, headers: _buildHeaders()).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final decoded = json.decode(res.body);
        if (decoded is List) {
          return decoded.map((e) => Movie.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return _getFallbackMovies();
  }

  /// Fetches single movie details by ID
  Future<Movie> fetchMovieDetails(String id) async {
    final uri = Uri.parse('$baseUrl/v1/movies/$id');
    try {
      final response = await _client
          .get(uri, headers: _buildHeaders())
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final data = decoded is Map<String, dynamic> && decoded.containsKey('data')
            ? decoded['data']
            : decoded;
        return Movie.fromJson(data);
      } else {
        throw ApiException(
          'Failed to load movie details',
          statusCode: response.statusCode,
          details: response.body,
        );
      }
    } on SocketException {
      // Find in fallback
      return _getFallbackMovies().firstWhere(
        (m) => m.id == id,
        orElse: () => _getFallbackMovies().first,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error fetching movie details: $e');
    }
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  /// Authenticates user credentials and returns active session
  Future<User> login({
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/v1/auth/login');
    try {
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(),
            body: json.encode({
              'email': email.trim(),
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 10));

      final decoded = json.decode(response.body);

      if (response.statusCode == 200 && decoded['success'] == true) {
        final token = decoded['token'] ?? decoded['accessToken'] ?? decoded['data']?['token'] ?? '';
        final userData = decoded['user'] ?? decoded['data']?['user'] ?? decoded['data'];

        final user = User.fromJson(userData, token: token);
        setAuthToken(user.token);
        return user;
      } else {
        final errorMsg = decoded['message'] ?? decoded['error'] ?? 'Authentication failed';
        throw ApiException(errorMsg, statusCode: response.statusCode);
      }
    } on SocketException {
      throw ApiException('Unable to connect to CineVenue server at $baseUrl. Ensure backend is running.');
    } on TimeoutException {
      throw ApiException('Connection timed out. Please try again.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected authentication error: $e');
    }
  }

  /// Registers a new patron account
  Future<User> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/v1/auth/register');
    try {
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(),
            body: json.encode({
              'name': name.trim(),
              'email': email.trim(),
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 10));

      final decoded = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = decoded['token'] ?? decoded['accessToken'] ?? decoded['data']?['token'] ?? '';
        final userData = decoded['user'] ?? decoded['data']?['user'] ?? decoded['data'];

        final user = User.fromJson(userData, token: token);
        setAuthToken(user.token);
        return user;
      } else {
        final errorMsg = decoded['message'] ?? decoded['error'] ?? 'Registration failed';
        throw ApiException(errorMsg, statusCode: response.statusCode);
      }
    } on SocketException {
      throw ApiException('Unable to connect to CineVenue server at $baseUrl');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Registration error: $e');
    }
  }

  /// Discards token session
  void logout() {
    _authToken = null;
  }

  // ==========================================
  // RESILIENT OFFLINE FALLBACK CATALOGUE
  // ==========================================
  List<Movie> _getFallbackMovies() {
    return const [
      Movie(
        id: 'mov-baththa-01',
        title: 'Baththa (Feared Gangster)',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
        genres: ['Action', 'Crime', 'Thriller'],
        language: 'Telugu',
        durationMinutes: 156,
        rating: 9.1,
        certification: 'A 18+',
        synopsis: 'An unapologetic crime saga tracing the relentless rise of Baththa, the most feared gangster of the coastal underworld.',
        releaseDate: 'In Theatres Now',
      ),
      Movie(
        id: 'mov-pushpa-02',
        title: 'Pushpa 2: The Rule',
        posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        genres: ['Action', 'Thriller'],
        language: 'Telugu',
        durationMinutes: 198,
        rating: 9.3,
        certification: 'UA 16+',
        synopsis: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat escalates into an all-out war for supremacy.',
        releaseDate: 'In Theatres Now',
      ),
      Movie(
        id: 'mov-kalki-03',
        title: 'Kalki 2898 AD',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
        genres: ['Sci-Fi', 'Mythology', 'Action'],
        language: 'Telugu / Pan-India',
        durationMinutes: 181,
        rating: 8.9,
        certification: 'UA 13+',
        synopsis: 'In a dystopian future set in Kasi, the final avatar of Vishnu emerges to restore balance to a fractured cosmos.',
        releaseDate: 'Trending Now',
      ),
      Movie(
        id: 'mov-devara-04',
        title: 'Devara: Part 1',
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80',
        genres: ['Action', 'Drama'],
        language: 'Telugu',
        durationMinutes: 172,
        rating: 8.6,
        certification: 'UA 16+',
        synopsis: 'A fearless coastal protector fights against betrayal and forces of greed to shield his people.',
        releaseDate: 'Blockbuster',
      ),
    ];
  }
}

