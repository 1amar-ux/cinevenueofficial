export interface POSIntegration {
  providerName: string;
  isMock?: boolean;

  connect?(credentials?: any): Promise<boolean>;
  testConnection(): Promise<{
    success: boolean;
    latencyMs?: number;
    message: string;
    version?: string;
    theatreInfo?: any;
    error?: string;
  }>;

  getTheatre(theatreId?: string): Promise<any>;
  getScreens(theatreId?: string): Promise<any[]>;
  getSeats(screenId: string): Promise<any[]>;
  getMovies(): Promise<any[]>;
  getShowtimes(theatreId?: string, date?: string): Promise<any[]>;
  getPrices(showId?: string): Promise<any[]>;
  getSeatAvailability(showId: string): Promise<any[]>;

  holdSeats(
    showId: string,
    seatIds: string[],
    userId: string
  ): Promise<{
    showId: string;
    seats: string[];
    holdToken?: string;
    lockedUntil: Date;
    durationMinutes?: number;
    message?: string;
  }>;

  releaseSeats(
    showId: string,
    seatIds: string[],
    holdToken?: string
  ): Promise<{
    success: boolean;
    releasedSeats: string[];
    message?: string;
  }>;

  createBooking(bookingPayload: {
    bookingId: string;
    theatreId: string;
    screenId: string;
    movieId: string;
    showId: string;
    userId: string;
    seatIds: string[];
    ticketTypes?: any[];
    amount: number;
    holdToken?: string;
  }): Promise<{
    id: string;
    posBookingId: string;
    externalConfirmationId?: string;
    status: string;
    barcodePayload?: string;
    timestamp?: string;
    amount?: number;
  }>;

  getBooking(bookingId: string): Promise<any>;

  cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<{
    id: string;
    posRefundId?: string;
    status: string;
    seatReleased: boolean;
    refundEligibility?: string;
    message?: string;
  }>;

  refundBooking(
    bookingId: string,
    amount?: number
  ): Promise<{
    id: string;
    refundId: string;
    amount: number;
    status: string;
    timestamp: string;
  }>;
}

// Backwards-compatible interface for Native and legacy venue cinema adapters
export interface CinemaAdapter {
  providerName: string;
  isMock?: boolean;
  connect?(credentials?: any): Promise<boolean>;
  testConnection?(): Promise<any>;
  getTheatres?(params?: { city?: string }): Promise<any[]>;
  getScreens?(theatreId: string): Promise<any[]>;
  getSeats?(screenId: string): Promise<any[]>;
  getMovies?(): Promise<any[]>;
  getShows?(theatreId: string, date?: string): Promise<any[]>;
  getShowtimes?(theatreId?: string, date?: string): Promise<any[]>;
  getPrices?(showId?: string): Promise<any[]>;
  getSeatAvailability?(showId: string): Promise<any[]>;
  getSeatLayout?(screenId: string): Promise<any[]>;
  holdSeats?(showId: string, seatIds: string[], userId: string): Promise<any>;
  lockSeats?(showId: string, seatIds: string[], userId: string): Promise<any>;
  releaseSeats?(showId: string, seatIds: string[], holdToken?: string): Promise<any>;
  createBooking?(bookingPayload: any): Promise<any>;
  confirmBooking?(bookingId: string, userId: string): Promise<any>;
  getBooking?(bookingId: string): Promise<any>;
  getBookingStatus?(bookingId: string): Promise<any>;
  cancelBooking?(bookingId: string, reason?: string): Promise<any>;
  refundBooking?(bookingId: string, amount?: number): Promise<any>;
}
