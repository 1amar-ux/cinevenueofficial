import '../models/venue_models.dart';

/// Abstract contract for venue data access.
/// Both [MockVenueRepository] and [ApiService] implement this interface,
/// allowing the UI to swap between mock data and real backend APIs with zero changes.
abstract class VenueRepository {
  Future<List<Movie>> getMovies({String? city});
  Future<List<Theatre>> getTheatres({String? city});
  Future<List<EventItem>> getEvents({String? city});
  Future<Movie?> getMovieDetails(String id);
  List<String> getAvailableCities();
}

/// Isolated mock venue repository populated with data adapted from the Stitch UI export.
/// Dynamically filters movies, theatres, and events based on the active city (default: 'Guntur').
class MockVenueRepository implements VenueRepository {
  static const String defaultCity = 'Guntur';

  static const List<String> availableCities = [
    'Guntur',
    'Hyderabad',
    'Bengaluru',
    'Mumbai',
    'Delhi',
    'Vijayawada',
  ];

  @override
  List<String> getAvailableCities() => availableCities;

  // ===========================================================================
  // MOCK THEATRES
  // ===========================================================================
  static const List<Theatre> _allTheatres = [
    // Guntur
    Theatre(
      id: 'th-gnt-1',
      name: 'Cinemax Screen 1',
      city: 'Guntur',
      address: 'Ring Road, Near Collectorate, Guntur, AP',
      screenCount: 4,
      amenities: ['IMAX Laser', 'Recliners', 'Gourmet Dine-In', 'Valet'],
      formats: ['IMAX 70MM', 'DOLBY ATMOS'],
      distance: '1.2 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    ),
    Theatre(
      id: 'th-gnt-2',
      name: 'Miraj Cinemas',
      city: 'Guntur',
      address: 'Brodipet 4th Line, Guntur, AP',
      screenCount: 3,
      amenities: ['Dolby Atmos', 'Gold Class Recliners', 'Online Canteen'],
      formats: ['DOLBY ATMOS', '4K DIGITAL'],
      distance: '2.1 km',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    ),
    Theatre(
      id: 'th-gnt-3',
      name: 'Hollywood Bollywood 4K',
      city: 'Guntur',
      address: 'Arundelpet Main Road, Guntur, AP',
      screenCount: 2,
      amenities: ['3D Projection', 'Push-Back Seats', 'Snack Bar'],
      formats: ['3D Gold Class', '7.1 SURROUND'],
      distance: '2.8 km',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
    ),
    Theatre(
      id: 'th-gnt-4',
      name: 'Guntur CineLuxe Platinum',
      city: 'Guntur',
      address: 'Lakshmipuram 2nd Lane, Guntur, AP',
      screenCount: 5,
      amenities: ['Obsidian VIP Lounge', 'Motorized Recliners', 'Private Butler'],
      formats: ['Obsidian VIP', 'DOLBY VISION'],
      distance: '3.4 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    ),

    // Hyderabad
    Theatre(
      id: 'th-hyd-1',
      name: 'Prasads IMAX Multiplex',
      city: 'Hyderabad',
      address: 'NTR Gardens, Khairatabad, Hyderabad, TS',
      screenCount: 6,
      amenities: ['IMAX 70mm Large Format', 'Dolby Atmos', 'VIP Balcony'],
      formats: ['IMAX 70MM', 'DOLBY ATMOS', '4DX'],
      distance: '3.5 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    ),
    Theatre(
      id: 'th-hyd-2',
      name: 'AMB Cinemas VIP Luxe',
      city: 'Hyderabad',
      address: 'Gachibowli - Miyapur Rd, Whitefields, Kondapur, TS',
      screenCount: 7,
      amenities: ['VIP Lounge', 'Gourmet Service', 'Italian Recliners'],
      formats: ['DOLBY ATMOS', 'LASER 4K', 'VIP RECLINER'],
      distance: '5.2 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    ),

    // Bengaluru
    Theatre(
      id: 'th-blr-1',
      name: 'PVR Directors Cut Forum Rex',
      city: 'Bengaluru',
      address: 'Brigade Road, Shanthala Nagar, Bengaluru, KA',
      screenCount: 5,
      amenities: ['Concierge Service', 'Sommelier Dining', 'Ultra Plush Recliners'],
      formats: ['IMAX 70MM', 'DOLBY ATMOS', 'GOLD CLASS'],
      distance: '2.0 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    ),

    // Mumbai
    Theatre(
      id: 'th-mum-1',
      name: 'Maison PVR Jio World Drive',
      city: 'Mumbai',
      address: 'BKC, Bandra East, Mumbai, MH',
      screenCount: 6,
      amenities: ['Rooftop Drive-in', 'Private Screening Rooms', 'Celebrity Lounge'],
      formats: ['IMAX 70MM', 'DOLBY VISION', 'LUXE'],
      distance: '4.1 km',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    ),

    // Delhi
    Theatre(
      id: 'th-del-1',
      name: 'PVR Directors Cut Vasant Kunj',
      city: 'Delhi',
      address: 'Ambience Mall, Vasant Kunj, New Delhi, DL',
      screenCount: 4,
      amenities: ['Fine Dining', 'Champagne Bar', 'Private Recliner Pods'],
      formats: ['IMAX 70MM', 'DOLBY ATMOS'],
      distance: '6.0 km',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    ),
  ];

  // ===========================================================================
  // MOCK MOVIES (Directly adapted from Stitch code.html + CineVenue VIP catalog)
  // ===========================================================================
  static const List<Movie> _allMovies = [
    // 1. Dune: Part Two
    Movie(
      id: 'mov-dune-2',
      title: 'Dune: Part Two',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      language: 'English / Telugu',
      durationMinutes: 166,
      rating: 9.4,
      certification: 'UA 16+',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the universe.',
      releaseDate: 'In Theatres',
      formatBadge: 'IMAX 70MM',
      badgeText: 'Book Fast',
      theatreName: 'Cinemax Screen 1, Guntur',
      city: 'Guntur',
      cineCoinsReward: 150,
      director: 'Denis Villeneuve',
      formats: ['IMAX 70MM', 'DOLBY ATMOS', '4DX VIP'],
      isNowShowing: true,
      isPremiere: true,
    ),

    // 2. Oppenheimer
    Movie(
      id: 'mov-oppenheimer',
      title: 'Oppenheimer',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=85',
      genres: ['Biography', 'Drama', 'Historical'],
      language: 'English',
      durationMinutes: 180,
      rating: 9.2,
      certification: 'A 18+',
      synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project, developing the world’s first atomic weapons.',
      releaseDate: 'Special Archival Master',
      formatBadge: 'Dolby Atmos',
      badgeText: 'Director Cut',
      theatreName: 'Miraj Cinemas, Guntur',
      city: 'Guntur',
      cineCoinsReward: 120,
      director: 'Christopher Nolan',
      formats: ['DOLBY ATMOS', 'IMAX 70MM'],
      isNowShowing: true,
      isPremiere: false,
    ),

    // 3. Kalki 2898 AD
    Movie(
      id: 'mov-kalki-2898',
      title: 'Kalki 2898 AD',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Mythic', 'Action'],
      language: 'Telugu / Hindi',
      durationMinutes: 181,
      rating: 9.1,
      certification: 'UA 13+',
      synopsis: 'Set in a post-apocalyptic future in Kasi, a bounty hunter encounters a rebellion protecting a mother carrying an avatar destined to alter history.',
      releaseDate: 'Blockbuster Screening',
      formatBadge: '3D Gold Class',
      badgeText: 'Blockbuster',
      theatreName: 'Hollywood Bollywood 4K',
      city: 'Guntur',
      cineCoinsReward: 180,
      director: 'Nag Ashwin',
      formats: ['3D Gold Class', 'IMAX 3D', 'DOLBY ATMOS'],
      isNowShowing: true,
      isPremiere: false,
    ),

    // 4. Interstellar
    Movie(
      id: 'mov-interstellar',
      title: 'Interstellar',
      posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      language: 'English',
      durationMinutes: 169,
      rating: 9.8,
      certification: 'UA 13+',
      synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival as Earth faces catastrophic famine.',
      releaseDate: '10th Anniversary Retrospective',
      formatBadge: 'Obsidian VIP',
      badgeText: '10th Anniv.',
      theatreName: 'Guntur CineLuxe Platinum',
      city: 'Guntur',
      cineCoinsReward: 200,
      director: 'Christopher Nolan',
      formats: ['Obsidian VIP', 'IMAX 70MM'],
      isNowShowing: true,
      isPremiere: true,
    ),

    // 5. Gladiator II
    Movie(
      id: 'mov-gladiator-2',
      title: 'Gladiator II',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85',
      genres: ['Action', 'Epic', 'Drama'],
      language: 'English / Telugu',
      durationMinutes: 148,
      rating: 9.1,
      certification: 'A 18+',
      synopsis: 'Lucius enters the Colosseum after his home is conquered by ruthless emperors, drawing on the memory of Maximus to fight for Rome.',
      releaseDate: 'VIP Premiere Edition',
      formatBadge: 'IMAX 70MM',
      badgeText: 'Premiere',
      theatreName: 'Cinemax Screen 1, Guntur',
      city: 'Guntur',
      cineCoinsReward: 160,
      director: 'Ridley Scott',
      formats: ['IMAX 70MM', 'VIP RECLINER'],
      isNowShowing: true,
      isPremiere: true,
    ),

    // 6. Pushpa 2: The Rule
    Movie(
      id: 'mov-pushpa-2',
      title: 'Pushpa 2: The Rule',
      posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85',
      genres: ['Action', 'Thriller', 'Drama'],
      language: 'Telugu',
      durationMinutes: 175,
      rating: 9.3,
      certification: 'UA 16+',
      synopsis: 'Pushpa Raj consolidates his empire across borders, facing fierce opposition from Bhanwar Singh Shekhawat in this explosive confrontation.',
      releaseDate: 'Now Showing',
      formatBadge: 'DOLBY VISION',
      badgeText: 'Blockbuster',
      theatreName: 'Miraj Cinemas, Guntur',
      city: 'Guntur',
      cineCoinsReward: 170,
      director: 'Sukumar',
      formats: ['DOLBY VISION', '4DX VIP', 'ATMOS 7.1'],
      isNowShowing: true,
      isPremiere: false,
    ),

    // Movies in other cities
    Movie(
      id: 'mov-hyd-1',
      title: 'Dune: Part Two (IMAX 70mm Experience)',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Adventure'],
      language: 'English',
      durationMinutes: 166,
      rating: 9.4,
      certification: 'UA 16+',
      theatreName: 'Prasads IMAX Multiplex',
      city: 'Hyderabad',
      cineCoinsReward: 150,
      director: 'Denis Villeneuve',
      formatBadge: 'IMAX 70MM',
      badgeText: 'Book Fast',
      formats: ['IMAX 70MM', 'DOLBY ATMOS'],
      isNowShowing: true,
    ),
    Movie(
      id: 'mov-hyd-2',
      title: 'Kalki 2898 AD (VIP Recliner Experience)',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Action'],
      language: 'Telugu',
      durationMinutes: 181,
      rating: 9.1,
      certification: 'UA 13+',
      theatreName: 'AMB Cinemas VIP Luxe',
      city: 'Hyderabad',
      cineCoinsReward: 180,
      director: 'Nag Ashwin',
      formatBadge: '3D Gold Class',
      formats: ['3D Gold Class', 'DOLBY ATMOS'],
      isNowShowing: true,
    ),
    Movie(
      id: 'mov-blr-1',
      title: 'Interstellar (10th Anniversary IMAX Retrospective)',
      posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
      genres: ['Sci-Fi', 'Drama'],
      language: 'English',
      durationMinutes: 169,
      rating: 9.8,
      certification: 'UA 13+',
      theatreName: 'PVR Directors Cut Forum Rex',
      city: 'Bengaluru',
      cineCoinsReward: 200,
      director: 'Christopher Nolan',
      formatBadge: 'Obsidian VIP',
      formats: ['Obsidian VIP', 'IMAX 70MM'],
      isNowShowing: true,
    ),
    Movie(
      id: 'mov-mum-1',
      title: 'Oppenheimer (Exclusive 70mm Master)',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=85',
      genres: ['Biography', 'Drama'],
      language: 'English',
      durationMinutes: 180,
      rating: 9.3,
      certification: 'A 18+',
      theatreName: 'Maison PVR Jio World Drive',
      city: 'Mumbai',
      cineCoinsReward: 140,
      director: 'Christopher Nolan',
      formatBadge: 'IMAX 70MM',
      formats: ['IMAX 70MM', 'DOLBY VISION'],
      isNowShowing: true,
    ),
  ];

  // ===========================================================================
  // MOCK EVENTS (Directly adapted from Stitch code.html + CineVenue gala events)
  // ===========================================================================
  static const List<EventItem> _allEvents = [
    // 1. A.R. Rahman Live
    EventItem(
      id: 'ev-ar-rahman-live',
      title: 'A.R. Rahman Live',
      subtitle: 'Exclusive VIP Symphony Concert with 60-piece orchestra & special guest vocalists',
      city: 'Guntur',
      venue: 'Guntur Stadium',
      dateStr: 'Oct 28',
      timeStr: '07:30 PM',
      price: 1499,
      badge: 'Exclusive VIP Passes',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      category: 'Concert',
      cineCoinsReward: 250,
    ),

    // 2. Film Gala 2025
    EventItem(
      id: 'ev-film-gala-2025',
      title: 'Film Gala 2025',
      subtitle: 'International director premiere showcase with champagne toast & red carpet',
      city: 'Guntur',
      venue: 'Royal Opera Hall',
      dateStr: 'Nov 04',
      timeStr: '08:00 PM',
      price: 2199,
      badge: 'Director Red Carpet',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
      category: 'Gala',
      cineCoinsReward: 300,
    ),

    // 3. Cinema Con Guntur
    EventItem(
      id: 'ev-cinema-con',
      title: 'Cinema Con Guntur',
      subtitle: 'Pop culture comic and film expo with cosplay, prop galleries & celebrity panels',
      city: 'Guntur',
      venue: 'CineExpo Hall',
      dateStr: 'Nov 15',
      timeStr: '10:00 AM',
      price: 899,
      badge: 'Cosplay & Panels',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
      category: 'Convention',
      cineCoinsReward: 150,
    ),

    // 4. Retro Film & Dine
    EventItem(
      id: 'ev-retro-film-dine',
      title: 'Retro Film & Dine',
      subtitle: 'Private screening of iconic cinema masterworks paired with 5-course artisanal dining',
      city: 'Guntur',
      venue: 'Obsidian Lounge',
      dateStr: 'Nov 22',
      timeStr: '07:00 PM',
      price: 2499,
      badge: '5-Course Dining',
      bannerUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',
      category: 'Dining Experience',
      cineCoinsReward: 350,
    ),

    // Hyderabad Events
    EventItem(
      id: 'ev-hyd-1',
      title: 'Hans Zimmer Score Tribute',
      subtitle: '40-piece live orchestral tribute to Dune, Interstellar, and Inception soundscapes',
      city: 'Hyderabad',
      venue: 'Shilpakala Vedika',
      dateStr: 'Dec 02',
      timeStr: '07:30 PM',
      price: 1899,
      badge: 'Symphony Special',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      category: 'Concert',
      cineCoinsReward: 280,
    ),

    // Bengaluru Events
    EventItem(
      id: 'ev-blr-1',
      title: 'Bengaluru Midnight 70mm Gala',
      subtitle: 'Director Q&A session, midnight screening, and private sommelier champagne lounge',
      city: 'Bengaluru',
      venue: 'The Sovereign Cinema Mayfair',
      dateStr: 'Dec 10',
      timeStr: '11:45 PM',
      price: 2200,
      badge: 'Gala Premiere',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
      category: 'Gala',
      cineCoinsReward: 320,
    ),
  ];

  // ===========================================================================
  // REPOSITORY METHODS (Filtered dynamically by city)
  // ===========================================================================

  @override
  Future<List<Movie>> getMovies({String? city}) async {
    final activeCity = (city ?? defaultCity).toLowerCase().trim();
    final filtered = _allMovies.where((m) => m.city.toLowerCase().trim() == activeCity).toList();
    if (filtered.isNotEmpty) return filtered;
    // Resilient fallback: return default city movies if a newly selected city has no entries yet
    return _allMovies.where((m) => m.city.toLowerCase().trim() == defaultCity.toLowerCase()).toList();
  }

  @override
  Future<List<Theatre>> getTheatres({String? city}) async {
    final activeCity = (city ?? defaultCity).toLowerCase().trim();
    final filtered = _allTheatres.where((t) => t.city.toLowerCase().trim() == activeCity).toList();
    if (filtered.isNotEmpty) return filtered;
    return _allTheatres.where((t) => t.city.toLowerCase().trim() == defaultCity.toLowerCase()).toList();
  }

  @override
  Future<List<EventItem>> getEvents({String? city}) async {
    final activeCity = (city ?? defaultCity).toLowerCase().trim();
    final filtered = _allEvents.where((e) => e.city.toLowerCase().trim() == activeCity).toList();
    if (filtered.isNotEmpty) return filtered;
    return _allEvents.where((e) => e.city.toLowerCase().trim() == defaultCity.toLowerCase()).toList();
  }

  @override
  Future<Movie?> getMovieDetails(String id) async {
    try {
      return _allMovies.firstWhere((m) => m.id == id);
    } catch (_) {
      return null;
    }
  }
}
