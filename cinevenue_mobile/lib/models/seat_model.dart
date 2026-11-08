enum SeatStatus { available, selected, booked, locked, vip }

class SeatModel {
  final String id;
  final String row;
  final int number;
  final String category; // Classic, Premium, Recliner, VIP
  final double price;
  final SeatStatus status;

  SeatModel({
    required this.id,
    required this.row,
    required this.number,
    this.category = 'Classic',
    required this.price,
    this.status = SeatStatus.available,
  });

  String get label => '$row$number';

  SeatModel copyWith({
    SeatStatus? status,
  }) {
    return SeatModel(
      id: id,
      row: row,
      number: number,
      category: category,
      price: price,
      status: status ?? this.status,
    );
  }

  factory SeatModel.fromJson(Map<String, dynamic> json) {
    SeatStatus status = SeatStatus.available;
    final isBooked = json['isBooked'] == true || json['status'] == 'BOOKED';
    final isLocked = json['isLocked'] == true || json['status'] == 'LOCKED';
    final isVip = json['isVip'] == true || json['category'] == 'VIP';

    if (isBooked) {
      status = SeatStatus.booked;
    } else if (isLocked) {
      status = SeatStatus.locked;
    } else if (isVip) {
      status = SeatStatus.vip;
    }

    return SeatModel(
      id: json['id'] ?? '',
      row: json['row'] ?? '',
      number: json['number'] is int ? json['number'] : int.tryParse(json['number'].toString()) ?? 1,
      category: json['category'] ?? (isVip ? 'VIP' : 'Classic'),
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 180.0,
      status: status,
    );
  }
}
