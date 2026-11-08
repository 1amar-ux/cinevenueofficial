class Movie {
  final String id;
  final String title;
  final String posterUrl;
  final String bannerUrl;
  final List<String> genres;
  final String language;
  final int durationMinutes;
  final double rating;
  final String certification;
  final String synopsis;
  final String releaseDate;

  const Movie({
    required this.id,
    required this.title,
    required this.posterUrl,
    this.bannerUrl = '',
    this.genres = const [],
    this.language = 'Telugu',
    this.durationMinutes = 145,
    this.rating = 8.5,
    this.certification = 'UA 16+',
    this.synopsis = '',
    this.releaseDate = 'In Cinemas Now',
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    // Parse genres safely from String or List
    List<String> parsedGenres = [];
    if (json['genre'] is List) {
      parsedGenres = (json['genre'] as List).map((e) => e.toString()).toList();
    } else if (json['genre'] is String) {
      parsedGenres = (json['genre'] as String)
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
    } else if (json['genres'] is List) {
      parsedGenres = (json['genres'] as List).map((e) => e.toString()).toList();
    }

    if (parsedGenres.isEmpty) {
      parsedGenres = ['Action', 'Drama'];
    }

    // Parse rating safely from int, double, or String
    double parsedRating = 8.0;
    if (json['rating'] != null) {
      if (json['rating'] is num) {
        parsedRating = (json['rating'] as num).toDouble();
      } else if (json['rating'] is String) {
        parsedRating = double.tryParse(json['rating']) ?? 8.0;
      }
    }

    // Parse duration safely
    int parsedDuration = 145;
    if (json['duration'] != null || json['durationMinutes'] != null) {
      final dur = json['durationMinutes'] ?? json['duration'];
      if (dur is num) {
        parsedDuration = dur.toInt();
      } else if (dur is String) {
        parsedDuration = int.tryParse(dur.replaceAll(RegExp(r'[^0-9]'), '')) ?? 145;
      }
    }

    return Movie(
      id: json['id']?.toString() ?? 'mov-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title']?.toString() ?? 'Untitled Movie',
      posterUrl: json['posterUrl']?.toString() ??
          json['poster']?.toString() ??
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      bannerUrl: json['bannerUrl']?.toString() ??
          json['banner']?.toString() ??
          json['backdropUrl']?.toString() ??
          '',
      genres: parsedGenres,
      language: json['language']?.toString() ?? 'Telugu',
      durationMinutes: parsedDuration,
      rating: parsedRating,
      certification: json['certification']?.toString() ?? json['censorRating']?.toString() ?? 'UA 16+',
      synopsis: json['synopsis']?.toString() ?? json['description']?.toString() ?? '',
      releaseDate: json['releaseDate']?.toString() ?? 'Now Showing',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'posterUrl': posterUrl,
      'bannerUrl': bannerUrl,
      'genres': genres,
      'language': language,
      'durationMinutes': durationMinutes,
      'rating': rating,
      'certification': certification,
      'synopsis': synopsis,
      'releaseDate': releaseDate,
    };
  }

  String get formattedDuration {
    final hours = durationMinutes ~/ 60;
    final minutes = durationMinutes % 60;
    return '${hours}h ${minutes}m';
  }
}

