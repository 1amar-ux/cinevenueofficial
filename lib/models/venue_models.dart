class Movie {
  final String id;
  final String title;
  final String posterUrl;
  final String backdropUrl;
  final List<String> genres;
  final String language;
  final int durationMinutes;
  final double rating;
  final String certification;
  final String synopsis;
  final String tagline;
  final String releaseDate;
  final String formatBadge;
  final String badgeText;
  final String theatreName;
  final String city;
  final int cineCoinsReward;
  final String director;
  final List<String> formats;
  final bool isNowShowing;
  final bool isComingSoon;
  final bool isPremiere;

  String get ageRating => certification;
  String get censorRating => certification;
  String get bannerUrl => backdropUrl;

  const Movie({
    required this.id,
    required this.title,
    required this.posterUrl,
    this.backdropUrl = '',
    this.genres = const [],
    this.language = 'Telugu',
    this.durationMinutes = 145,
    this.rating = 8.5,
    this.certification = 'UA 16+',
    String? ageRating,
    this.synopsis = '',
    this.tagline = '',
    this.releaseDate = 'In Cinemas Now',
    this.formatBadge = 'IMAX 70MM',
    this.badgeText = '',
    this.theatreName = '',
    this.city = 'Guntur',
    this.cineCoinsReward = 150,
    this.director = '',
    this.formats = const ['IMAX 70MM', 'DOLBY ATMOS'],
    this.isNowShowing = true,
    this.isComingSoon = false,
    this.isPremiere = false,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    List<String> parsedGenres = [];
    if (json['genres'] is List) {
      parsedGenres = (json['genres'] as List).map((e) => e.toString()).toList();
    } else if (json['genre'] is List) {
      parsedGenres = (json['genre'] as List).map((e) => e.toString()).toList();
    } else if (json['genre'] is String) {
      parsedGenres = (json['genre'] as String).split(',').map((e) => e.trim()).toList();
    }

    List<String> parsedFormats = [];
    if (json['formats'] is List) {
      parsedFormats = (json['formats'] as List).map((e) => e.toString()).toList();
    } else {
      parsedFormats = ['IMAX 70MM', 'DOLBY ATMOS'];
    }

    return Movie(
      id: json['id']?.toString() ?? 'mov-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title']?.toString() ?? 'Untitled Movie',
      posterUrl: json['posterUrl']?.toString() ??
          json['poster']?.toString() ??
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      backdropUrl: json['backdropUrl']?.toString() ??
          json['bannerUrl']?.toString() ??
          json['banner']?.toString() ??
          '',
      genres: parsedGenres.isNotEmpty ? parsedGenres : ['Action', 'Drama'],
      language: json['language']?.toString() ?? 'Telugu',
      durationMinutes: json['durationMinutes'] is num
          ? (json['durationMinutes'] as num).toInt()
          : (int.tryParse(json['durationMinutes']?.toString() ?? '') ?? 145),
      rating: json['rating'] is num
          ? (json['rating'] as num).toDouble()
          : (double.tryParse(json['rating']?.toString() ?? '') ?? 8.5),
      certification: json['certification']?.toString() ?? json['censorRating']?.toString() ?? 'UA 16+',
      synopsis: json['synopsis']?.toString() ?? json['description']?.toString() ?? '',
      releaseDate: json['releaseDate']?.toString() ?? 'In Cinemas Now',
      formatBadge: json['formatBadge']?.toString() ?? 'IMAX 70MM',
      badgeText: json['badgeText']?.toString() ?? '',
      theatreName: json['theatreName']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Guntur',
      cineCoinsReward: json['cineCoinsReward'] is num
          ? (json['cineCoinsReward'] as num).toInt()
          : 150,
      director: json['director']?.toString() ?? '',
      formats: parsedFormats,
      isNowShowing: json['isNowShowing'] == true || json['status'] == 'NOW_SHOWING',
      isComingSoon: json['isComingSoon'] == true || json['status'] == 'COMING_SOON',
      isPremiere: json['isPremiere'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'posterUrl': posterUrl,
      'backdropUrl': backdropUrl,
      'genres': genres,
      'language': language,
      'durationMinutes': durationMinutes,
      'rating': rating,
      'certification': certification,
      'synopsis': synopsis,
      'releaseDate': releaseDate,
      'formatBadge': formatBadge,
      'badgeText': badgeText,
      'theatreName': theatreName,
      'city': city,
      'cineCoinsReward': cineCoinsReward,
      'director': director,
      'formats': formats,
      'isNowShowing': isNowShowing,
      'isComingSoon': isComingSoon,
      'isPremiere': isPremiere,
    };
  }
}

class Theatre {
  final String id;
  final String name;
  final String city;
  final String address;
  final int screenCount;
  final List<String> amenities;
  final List<String> formats;
  final String distance;
  final double rating;
  final String imageUrl;

  const Theatre({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    this.screenCount = 4,
    this.amenities = const ['Recliner Seats', 'Dolby Atmos', 'Gourmet Dine-In', 'Valet Parking'],
    this.formats = const ['IMAX 70MM', 'DOLBY ATMOS', '4DX VIP'],
    this.distance = '1.5 km',
    this.rating = 4.8,
    this.imageUrl = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  });

  factory Theatre.fromJson(Map<String, dynamic> json) {
    return Theatre(
      id: json['id']?.toString() ?? 'th-${DateTime.now().millisecondsSinceEpoch}',
      name: json['name']?.toString() ?? 'CineVenue Multiplex',
      city: json['city']?.toString() ?? 'Guntur',
      address: json['address']?.toString() ?? '',
      screenCount: json['screenCount'] is num ? (json['screenCount'] as num).toInt() : 4,
      amenities: json['amenities'] is List
          ? (json['amenities'] as List).map((e) => e.toString()).toList()
          : ['Recliner Seats', 'Dolby Atmos'],
      formats: json['formats'] is List
          ? (json['formats'] as List).map((e) => e.toString()).toList()
          : ['IMAX 70MM', 'DOLBY ATMOS'],
      distance: json['distance']?.toString() ?? '1.5 km',
      rating: json['rating'] is num ? (json['rating'] as num).toDouble() : 4.8,
      imageUrl: json['imageUrl']?.toString() ??
          'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'city': city,
      'address': address,
      'screenCount': screenCount,
      'amenities': amenities,
      'formats': formats,
      'distance': distance,
      'rating': rating,
      'imageUrl': imageUrl,
    };
  }
}

class EventItem {
  final String id;
  final String title;
  final String subtitle;
  final String city;
  final String venue;
  final String dateStr;
  final String timeStr;
  final int price;
  final String badge;
  final String bannerUrl;
  final String category;
  final int cineCoinsReward;

  String get locationName => venue;

  const EventItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.city,
    required this.venue,
    required this.dateStr,
    this.timeStr = '07:30 PM',
    required this.price,
    this.badge = 'Exclusive VIP Passes',
    required this.bannerUrl,
    this.category = 'Concert',
    this.cineCoinsReward = 200,
  });

  factory EventItem.fromJson(Map<String, dynamic> json) {
    return EventItem(
      id: json['id']?.toString() ?? 'ev-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title']?.toString() ?? 'CineVenue Special Event',
      subtitle: json['subtitle']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Guntur',
      venue: json['venue']?.toString() ?? json['locationName']?.toString() ?? 'CineVenue Arena',
      dateStr: json['dateStr']?.toString() ?? 'Upcoming',
      timeStr: json['timeStr']?.toString() ?? '07:30 PM',
      price: json['price'] is num ? (json['price'] as num).toInt() : 1499,
      badge: json['badge']?.toString() ?? 'Exclusive VIP Passes',
      bannerUrl: json['bannerUrl']?.toString() ??
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
      category: json['category']?.toString() ?? 'Concert',
      cineCoinsReward: json['cineCoinsReward'] is num ? (json['cineCoinsReward'] as num).toInt() : 200,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'city': city,
      'venue': venue,
      'dateStr': dateStr,
      'timeStr': timeStr,
      'price': price,
      'badge': badge,
      'bannerUrl': bannerUrl,
      'category': category,
      'cineCoinsReward': cineCoinsReward,
    };
  }
}

class BookingTicket {
  final String bookingId;
  final String movieTitle;
  final String theaterName;
  final String hallName;
  final String format;
  final String dateStr;
  final String timeStr;
  final List<String> seats;
  final int totalAmount;
  final String qrCodeUrl;
  final String? posterUrl;
  final String status;

  const BookingTicket({
    required this.bookingId,
    required this.movieTitle,
    required this.theaterName,
    required this.hallName,
    required this.format,
    required this.dateStr,
    required this.timeStr,
    required this.seats,
    required this.totalAmount,
    required this.qrCodeUrl,
    this.posterUrl,
    this.status = 'CONFIRMED',
  });
}
