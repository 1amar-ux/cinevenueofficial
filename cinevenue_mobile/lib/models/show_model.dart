class ShowtimeModel {
  final String id;
  final String movieId;
  final String theatreId;
  final String theatreName;
  final String screenName;
  final String format; // 2D, 3D, IMAX, 4DX
  final String language;
  final DateTime startTime;
  final DateTime endTime;
  final double basePrice;
  final int totalSeats;
  final int availableSeats;

  ShowtimeModel({
    required this.id,
    required this.movieId,
    required this.theatreId,
    required this.theatreName,
    required this.screenName,
    this.format = '2D',
    this.language = 'Telugu',
    required this.startTime,
    required this.endTime,
    required this.basePrice,
    this.totalSeats = 150,
    this.availableSeats = 120,
  });

  factory ShowtimeModel.fromJson(Map<String, dynamic> json) {
    return ShowtimeModel(
      id: json['id'] ?? '',
      movieId: json['movieId'] ?? '',
      theatreId: json['theatreId'] ?? json['theatre']?['id'] ?? '',
      theatreName: json['theatreName'] ?? json['theatre']?['name'] ?? 'CineVenue Luxe',
      screenName: json['screenName'] ?? json['screen']?['name'] ?? 'Screen 1',
      format: json['format'] ?? '2D',
      language: json['language'] ?? 'Telugu',
      startTime: DateTime.tryParse(json['startTime'] ?? '') ?? DateTime.now(),
      endTime: DateTime.tryParse(json['endTime'] ?? '') ?? DateTime.now().add(const Duration(hours: 2)),
      basePrice: (json['basePrice'] is num) ? (json['basePrice'] as num).toDouble() : 180.0,
      totalSeats: json['totalSeats'] ?? 150,
      availableSeats: json['availableSeats'] ?? 120,
    );
  }
}
