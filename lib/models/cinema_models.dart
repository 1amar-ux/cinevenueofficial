import 'venue_models.dart';
export 'venue_models.dart';

class MovieItem {
  final String id;
  final String title;
  final String tagline;
  final String synopsis;
  final List<String> genres;
  final int durationMinutes;
  final double rating;
  final String ageRating;
  final List<String> formats;
  final String director;
  final bool isPremiere;
  final bool isNowShowing;
  final bool isComingSoon;
  final String posterUrl;
  final String backdropUrl;

  const MovieItem({
    required this.id,
    required this.title,
    required this.tagline,
    required this.synopsis,
    required this.genres,
    required this.durationMinutes,
    required this.rating,
    required this.ageRating,
    required this.formats,
    required this.director,
    this.isPremiere = false,
    this.isNowShowing = true,
    this.isComingSoon = false,
    required this.posterUrl,
    required this.backdropUrl,
  });

  Movie toMovie({String city = 'Guntur', String theatreName = 'Cinemax Screen 1'}) {
    return Movie(
      id: id,
      title: title,
      posterUrl: posterUrl,
      backdropUrl: backdropUrl,
      genres: genres,
      durationMinutes: durationMinutes,
      rating: rating,
      certification: ageRating,
      synopsis: synopsis,
      tagline: tagline,
      formatBadge: formats.isNotEmpty ? formats.first : 'IMAX 70MM',
      formats: formats,
      director: director,
      isPremiere: isPremiere,
      isNowShowing: isNowShowing,
      isComingSoon: isComingSoon,
      city: city,
      theatreName: theatreName,
    );
  }

  factory MovieItem.fromMovie(Movie movie) {
    return MovieItem(
      id: movie.id,
      title: movie.title,
      tagline: movie.tagline,
      synopsis: movie.synopsis,
      genres: movie.genres,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      ageRating: movie.certification,
      formats: movie.formats,
      director: movie.director,
      isPremiere: movie.isPremiere,
      isNowShowing: movie.isNowShowing,
      isComingSoon: movie.isComingSoon,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
    );
  }
}

class TheaterLocationItem {
  final String id;
  final String name;
  final String city;
  final String address;
  final String distance;

  const TheaterLocationItem({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    required this.distance,
  });

  Theatre toTheatre() {
    return Theatre(
      id: id,
      name: name,
      city: city,
      address: address,
      distance: distance,
    );
  }
}

class CinemaEventItem {
  final String id;
  final String title;
  final String subtitle;
  final String dateStr;
  final String timeStr;
  final int price;
  final String bannerUrl;
  final String locationName;

  const CinemaEventItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.dateStr,
    required this.timeStr,
    required this.price,
    required this.bannerUrl,
    required this.locationName,
  });

  EventItem toEventItem({String city = 'Guntur'}) {
    return EventItem(
      id: id,
      title: title,
      subtitle: subtitle,
      city: city,
      venue: locationName,
      dateStr: dateStr,
      timeStr: timeStr,
      price: price,
      bannerUrl: bannerUrl,
    );
  }
}

class BookingTicketItem extends BookingTicket {
  const BookingTicketItem({
    required super.bookingId,
    required super.movieTitle,
    required super.theaterName,
    required super.hallName,
    required super.format,
    required super.dateStr,
    required super.timeStr,
    required super.seats,
    required super.totalAmount,
    required super.qrCodeUrl,
    super.posterUrl,
    super.status = 'CONFIRMED',
  });

  BookingTicket toBookingTicket() => this;

  factory BookingTicketItem.fromBookingTicket(BookingTicket ticket) {
    return BookingTicketItem(
      bookingId: ticket.bookingId,
      movieTitle: ticket.movieTitle,
      theaterName: ticket.theaterName,
      hallName: ticket.hallName,
      format: ticket.format,
      dateStr: ticket.dateStr,
      timeStr: ticket.timeStr,
      seats: ticket.seats,
      totalAmount: ticket.totalAmount,
      qrCodeUrl: ticket.qrCodeUrl,
      posterUrl: ticket.posterUrl,
      status: ticket.status,
    );
  }
}
