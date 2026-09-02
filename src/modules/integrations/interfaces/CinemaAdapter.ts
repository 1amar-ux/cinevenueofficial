export interface CinemaAdapter {
  providerName: string;

  getTheatres(params?: { city?: string }): Promise<any[]>;

  getScreens(theatreId: string): Promise<any[]>;

  getMovies(): Promise<any[]>;

  getShows(theatreId: string, date?: string): Promise<any[]>;

  getSeatLayout(screenId: string): Promise<any[]>;

  getSeatAvailability(showId: string): Promise<any[]>;

  lockSeats(
    showId: string,
    seatIds: string[],
    userId: string
  ): Promise<{
    showId: string;
    seats: string[];
    lockedUntil: Date;
  }>;

  confirmBooking(
    bookingId: string,
    userId: string
  ): Promise<any>;

  cancelBooking(
    bookingId: string
  ): Promise<any>;

  getBookingStatus(
    bookingId: string
  ): Promise<any>;
}
