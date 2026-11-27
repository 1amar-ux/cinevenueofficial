import '../models/cinema_models.dart';

class MockCinemaData {
  static const List<TheaterLocationItem> locations = [
    TheaterLocationItem(
      id: 'th-1',
      name: 'Grand Palais CineVenue',
      city: 'Guntur',
      address: 'Ring Road, Near Collectorate, Guntur, AP',
      distance: '1.2 km',
    ),
    TheaterLocationItem(
      id: 'th-2',
      name: 'The Obsidian CineVenue IMAX',
      city: 'Hyderabad',
      address: 'Road No. 36, Jubilee Hills, Hyderabad, TS',
      distance: '3.4 km',
    ),
    TheaterLocationItem(
      id: 'th-3',
      name: 'The Sovereign Cinema Mayfair',
      city: 'Bengaluru',
      address: 'Lavelle Road, Shanthala Nagar, Bengaluru, KA',
      distance: '2.1 km',
    ),
    TheaterLocationItem(
      id: 'th-4',
      name: 'The Velvet Screen Royale',
      city: 'Mumbai',
      address: 'Bandra West, Linking Road, Mumbai, MH',
      distance: '4.5 km',
    ),
    TheaterLocationItem(
      id: 'th-5',
      name: 'Imperial Gold CineVenue',
      city: 'Delhi',
      address: 'Connaught Place, Barakhamba, New Delhi, DL',
      distance: '5.0 km',
    ),
  ];

  static const List<MovieItem> movies = [
    MovieItem(
      id: 'm-1',
      title: 'Dune: Part Two (IMAX 70mm Experience)',
      tagline: 'Long live the fighters.',
      synopsis:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
      genres: ['Sci-Fi', 'Epic Adventure', 'Action'],
      durationMinutes: 166,
      rating: 9.3,
      ageRating: 'UA 16+',
      formats: ['IMAX 70mm', 'DOLBY ATMOS', '4DX VIP'],
      director: 'Denis Villeneuve',
      isPremiere: true,
      isNowShowing: true,
      isComingSoon: false,
      posterUrl:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
    ),
    MovieItem(
      id: 'm-2',
      title: 'Gladiator II (VIP Premiere Edition)',
      tagline: 'What we do in life echoes in eternity.',
      synopsis:
          'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      genres: ['Action', 'Epic', 'Drama'],
      durationMinutes: 148,
      rating: 9.1,
      ageRating: 'A 18+',
      formats: ['IMAX 70mm', 'VIP RECLINER', 'DOLBY ATMOS'],
      director: 'Ridley Scott',
      isPremiere: true,
      isNowShowing: true,
      isComingSoon: false,
      posterUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85',
    ),
    MovieItem(
      id: 'm-3',
      title: 'Oppenheimer (Exclusive 70mm Master)',
      tagline: 'The world changes forever.',
      synopsis:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Christopher Nolan’s magnum opus projected in glorious native 70mm film stock with unparalleled contrast and clarity.',
      genres: ['Biography', 'Drama', 'Historical'],
      durationMinutes: 180,
      rating: 9.4,
      ageRating: 'A 18+',
      formats: ['IMAX 70mm', 'DOLBY ATMOS'],
      director: 'Christopher Nolan',
      isPremiere: false,
      isNowShowing: true,
      isComingSoon: false,
      posterUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=85',
    ),
    MovieItem(
      id: 'm-4',
      title: 'Pushpa 2: The Rule (The Wildfire Tour)',
      tagline: 'As the wildfire spreads, the kingdom trembles.',
      synopsis:
          'Pushpa Raj expands his syndicate beyond borders, facing ruthless lawmen, rival kingpins, and high-stakes political betrayals in this explosive action spectacle.',
      genres: ['Action', 'Thriller', 'Drama'],
      durationMinutes: 175,
      rating: 9.2,
      ageRating: 'UA 16+',
      formats: ['DOLBY VISION', '4DX VIP', 'ATMOS 7.1'],
      director: 'Sukumar',
      isPremiere: false,
      isNowShowing: true,
      isComingSoon: false,
      posterUrl:
          'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85',
    ),
    MovieItem(
      id: 'm-5',
      title: 'Interstellar (10th Anniversary IMAX 70mm)',
      tagline: 'Mankind was born on Earth. It was never meant to die here.',
      synopsis:
          'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      durationMinutes: 169,
      rating: 9.5,
      ageRating: 'UA 13+',
      formats: ['IMAX 70mm', 'VIP RECLINER'],
      director: 'Christopher Nolan',
      isPremiere: false,
      isNowShowing: false,
      isComingSoon: true,
      posterUrl:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
    ),
    MovieItem(
      id: 'm-6',
      title: 'Kalki 2898 AD (Epic Sci-Fi 3D)',
      tagline: 'The era of darkness beckons the avatar of light.',
      synopsis:
          'In a dystopian post-apocalyptic future set in the sacred city of Kasi, a bounty hunter crosses paths with rebel forces protecting a sacred child destined to end the rule of Supreme Yaskin.',
      genres: ['Sci-Fi', 'Mythology', 'Action'],
      durationMinutes: 181,
      rating: 8.9,
      ageRating: 'UA 13+',
      formats: ['IMAX 3D', 'DOLBY ATMOS', '4DX'],
      director: 'Nag Ashwin',
      isPremiere: false,
      isNowShowing: true,
      isComingSoon: false,
      posterUrl:
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
    ),
  ];

  static const List<CinemaEventItem> events = [
    CinemaEventItem(
      id: 'ev-1',
      title: '70mm IMAX Midnight Gala Premiere',
      subtitle: 'Exclusive Director Q&A, Champagne Toast & Collector Foil Poster',
      dateStr: 'FRI, NOV 14',
      timeStr: '11:45 PM',
      price: 1200,
      bannerUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
      locationName: 'The Obsidian CineVenue IMAX, Jubilee Hills',
    ),
    CinemaEventItem(
      id: 'ev-2',
      title: 'Christopher Nolan 70mm Retrospective Marathon',
      subtitle: 'Interstellar + Oppenheimer back-to-back with Gourmet Dine-In',
      dateStr: 'SAT, NOV 22',
      timeStr: '04:00 PM',
      price: 1800,
      bannerUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
      locationName: 'Grand Palais CineVenue, Guntur',
    ),
    CinemaEventItem(
      id: 'ev-3',
      title: 'Symphony Under the Silver Screen',
      subtitle: 'Live 40-Piece Orchestral Tribute to Hans Zimmer Scores',
      dateStr: 'SUN, DEC 01',
      timeStr: '07:30 PM',
      price: 2500,
      bannerUrl:
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      locationName: 'The Sovereign Cinema Mayfair, Bengaluru',
    ),
  ];

  static const List<BookingTicketItem> sampleTickets = [
    BookingTicketItem(
      bookingId: 'CV-89241',
      movieTitle: 'Dune: Part Two (IMAX 70mm Experience)',
      theaterName: 'Grand Palais CineVenue',
      hallName: 'Auditorium 1 - IMAX Grand Laser',
      format: 'IMAX 70mm',
      dateStr: 'TODAY, NOV 9',
      timeStr: '08:30 PM',
      seats: ['A4', 'A5'],
      totalAmount: 960,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEVENUE-PASS-CV-89241',
      posterUrl:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      status: 'CONFIRMED',
    ),
  ];
}
