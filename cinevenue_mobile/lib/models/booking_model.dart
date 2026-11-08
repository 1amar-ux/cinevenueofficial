class BookingModel {
  final String id;
  final String bookingNumber;
  final String showId;
  final String movieTitle;
  final String? posterUrl;
  final String theatreName;
  final String screenName;
  final DateTime showTime;
  final List<String> seatLabels;
  final double totalAmount;
  final double basePrice;
  final double convenienceFee;
  final double gst;
  final double discount;
  final String paymentStatus; // PENDING, PAID, FAILED, REFUNDED
  final String bookingStatus; // CONFIRMED, CANCELLED, PENDING
  final String? qrPayload;
  final String? qrCodeUrl;
  final DateTime createdAt;

  BookingModel({
    required this.id,
    required this.bookingNumber,
    required this.showId,
    required this.movieTitle,
    this.posterUrl,
    required this.theatreName,
    required this.screenName,
    required this.showTime,
    required this.seatLabels,
    required this.totalAmount,
    this.basePrice = 0,
    this.convenienceFee = 0,
    this.gst = 0,
    this.discount = 0,
    required this.paymentStatus,
    required this.bookingStatus,
    this.qrPayload,
    this.qrCodeUrl,
    required this.createdAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    List<String> seats = [];
    if (json['seats'] is List) {
      seats = (json['seats'] as List).map((s) => s is Map ? (s['label'] ?? '${s['row']}${s['number']}') : s.toString()).toList();
    } else if (json['seatNumbers'] is List) {
      seats = (json['seatNumbers'] as List).map((s) => s.toString()).toList();
    }

    return BookingModel(
      id: json['id'] ?? '',
      bookingNumber: json['bookingNumber'] ?? json['id'] ?? '',
      showId: json['showId'] ?? '',
      movieTitle: json['movieTitle'] ?? json['show']?['movie']?['title'] ?? 'Movie',
      posterUrl: json['posterUrl'] ?? json['show']?['movie']?['posterUrl'],
      theatreName: json['theatreName'] ?? json['show']?['theatre']?['name'] ?? 'CineVenue Luxe',
      screenName: json['screenName'] ?? json['show']?['screen']?['name'] ?? 'Audi 1',
      showTime: DateTime.tryParse(json['showTime'] ?? json['show']?['startTime'] ?? '') ?? DateTime.now(),
      seatLabels: seats,
      totalAmount: (json['totalAmount'] is num) ? (json['totalAmount'] as num).toDouble() : (json['amount'] is num ? (json['amount'] as num).toDouble() : 0.0),
      basePrice: (json['basePrice'] is num) ? (json['basePrice'] as num).toDouble() : 0.0,
      convenienceFee: (json['convenienceFee'] is num) ? (json['convenienceFee'] as num).toDouble() : 0.0,
      gst: (json['gst'] is num) ? (json['gst'] as num).toDouble() : 0.0,
      discount: (json['discount'] is num) ? (json['discount'] as num).toDouble() : 0.0,
      paymentStatus: json['paymentStatus'] ?? 'PENDING',
      bookingStatus: json['bookingStatus'] ?? json['status'] ?? 'PENDING',
      qrPayload: json['qrPayload'] ?? json['qrCode'] ?? json['bookingNumber'],
      qrCodeUrl: json['qrCodeUrl'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
