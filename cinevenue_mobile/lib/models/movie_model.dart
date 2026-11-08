class MovieModel {
  final String id;
  final String title;
  final String? description;
  final String? posterUrl;
  final String? bannerUrl;
  final String? trailerUrl;
  final String? language;
  final List<String> genres;
  final int durationMinutes;
  final String? certificate;
  final double rating;
  final DateTime? releaseDate;
  final bool isNowShowing;
  final bool isUpcoming;

  MovieModel({
    required this.id,
    required this.title,
    this.description,
    this.posterUrl,
    this.bannerUrl,
    this.trailerUrl,
    this.language,
    this.genres = const [],
    this.durationMinutes = 120,
    this.certificate = 'U/A',
    this.rating = 8.5,
    this.releaseDate,
    this.isNowShowing = true,
    this.isUpcoming = false,
  });

  factory MovieModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedGenres = [];
    if (json['genres'] is List) {
      parsedGenres = (json['genres'] as List).map((e) => e.toString()).toList();
    } else if (json['genre'] is String) {
      parsedGenres = (json['genre'] as String).split(',').map((e) => e.trim()).toList();
    }

    return MovieModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? json['synopsis'],
      posterUrl: json['posterUrl'] ?? json['poster_url'] ?? json['poster'],
      bannerUrl: json['bannerUrl'] ?? json['banner_url'] ?? json['banner'],
      trailerUrl: json['trailerUrl'] ?? json['trailer_url'] ?? json['trailer'],
      language: json['language'] ?? 'Telugu',
      genres: parsedGenres,
      durationMinutes: json['duration'] ?? json['durationMinutes'] ?? 135,
      certificate: json['certificate'] ?? 'U/A',
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 8.5,
      releaseDate: json['releaseDate'] != null ? DateTime.tryParse(json['releaseDate']) : null,
      isNowShowing: json['isNowShowing'] ?? json['status'] == 'NOW_SHOWING' ?? true,
      isUpcoming: json['isUpcoming'] ?? json['status'] == 'UPCOMING' ?? false,
    );
  }
}
