class EventTicketTier {
  final String id;
  final String name; // General, VIP, VVIP, Early Bird
  final double price;
  final int totalCapacity;
  final int availableCapacity;
  final String? description;

  EventTicketTier({
    required this.id,
    required this.name,
    required this.price,
    required this.totalCapacity,
    required this.availableCapacity,
    this.description,
  });

  bool get isFree => price <= 0;
  bool get isSoldOut => availableCapacity <= 0;

  factory EventTicketTier.fromJson(Map<String, dynamic> json) {
    return EventTicketTier(
      id: json['id'] ?? '',
      name: json['name'] ?? 'General Access',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      totalCapacity: json['totalCapacity'] ?? json['capacity'] ?? 100,
      availableCapacity: json['availableCapacity'] ?? json['available'] ?? 100,
      description: json['description'],
    );
  }
}

class EventModel {
  final String id;
  final String title;
  final String? description;
  final String category; // Music, Comedy, Conclave, Workshop
  final String? bannerUrl;
  final String? posterUrl;
  final String venueName;
  final String city;
  final DateTime eventDate;
  final String organizerName;
  final List<EventTicketTier> tiers;
  final bool isFreePassAvailable;
  final bool isFeatured;

  EventModel({
    required this.id,
    required this.title,
    this.description,
    this.category = 'Concert',
    this.bannerUrl,
    this.posterUrl,
    required this.venueName,
    required this.city,
    required this.eventDate,
    required this.organizerName,
    this.tiers = const [],
    this.isFreePassAvailable = false,
    this.isFeatured = false,
  });

  double get startingPrice {
    if (tiers.isEmpty) return 0;
    return tiers.map((t) => t.price).reduce((a, b) => a < b ? a : b);
  }

  factory EventModel.fromJson(Map<String, dynamic> json) {
    List<EventTicketTier> parsedTiers = [];
    if (json['tiers'] is List) {
      parsedTiers = (json['tiers'] as List).map((t) => EventTicketTier.fromJson(t)).toList();
    } else if (json['ticketTypes'] is List) {
      parsedTiers = (json['ticketTypes'] as List).map((t) => EventTicketTier.fromJson(t)).toList();
    }

    if (parsedTiers.isEmpty) {
      final basePrice = (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0;
      parsedTiers.add(EventTicketTier(
        id: 'tier_gen',
        name: basePrice <= 0 ? 'Free Entry Pass' : 'General Admission',
        price: basePrice,
        totalCapacity: json['capacity'] ?? 200,
        availableCapacity: json['availableCapacity'] ?? 150,
      ));
    }

    return EventModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      category: json['category'] ?? 'Live Show',
      bannerUrl: json['bannerUrl'] ?? json['banner'] ?? json['image'],
      posterUrl: json['posterUrl'] ?? json['poster'] ?? json['image'],
      venueName: json['venueName'] ?? json['venue'] ?? json['location'] ?? 'Hyderabad Convention Centre',
      city: json['city'] ?? 'Hyderabad',
      eventDate: DateTime.tryParse(json['date'] ?? json['eventDate'] ?? '') ?? DateTime.now().add(const Duration(days: 7)),
      organizerName: json['organizerName'] ?? json['organizer']?['name'] ?? 'CineVenue Events',
      tiers: parsedTiers,
      isFreePassAvailable: parsedTiers.any((t) => t.isFree),
      isFeatured: json['isFeatured'] ?? false,
    );
  }
}
