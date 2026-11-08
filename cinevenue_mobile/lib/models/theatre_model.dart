class TheatreModel {
  final String id;
  final String name;
  final String city;
  final String? address;
  final String? state;
  final double? latitude;
  final double? longitude;
  final List<String> amenities;
  final String integrationType; // NATIVE or POS_INTEGRATION

  TheatreModel({
    required this.id,
    required this.name,
    required this.city,
    this.address,
    this.state,
    this.latitude,
    this.longitude,
    this.amenities = const [],
    this.integrationType = 'NATIVE',
  });

  factory TheatreModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedAmenities = [];
    if (json['amenities'] is List) {
      parsedAmenities = (json['amenities'] as List).map((e) => e.toString()).toList();
    }

    return TheatreModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      city: json['city'] ?? 'Hyderabad',
      address: json['address'] ?? json['location'],
      state: json['state'],
      latitude: json['latitude'] is num ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] is num ? (json['longitude'] as num).toDouble() : null,
      amenities: parsedAmenities,
      integrationType: json['integrationType'] ?? 'NATIVE',
    );
  }
}
