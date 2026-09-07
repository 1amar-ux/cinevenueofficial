export type RootStackParamList = {
  MainTabs: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  GlobalSearch: undefined;
  LocationSelect: undefined;
  MovieDetails: { movieId: string; title: string };
  TheatreShowtimes: { movieId: string; title: string; poster?: string };
  SeatSelection: {
    showId: string;
    movieId: string;
    movieTitle: string;
    theatreId: string;
    theatreName: string;
    screenName: string;
    showTime: string;
    date: string;
    pricePerSeat: number;
    integrationType?: string;
  };
  BookingSummary: {
    showId: string;
    movieTitle: string;
    theatreName: string;
    screenName: string;
    showTime: string;
    date: string;
    selectedSeats: string[];
    posHoldId?: string;
    basePrice: number;
  };
  Payment: {
    orderId: string;
    bookingNumber: string;
    amount: number;
    movieTitle: string;
    theatreName: string;
    selectedSeats: string[];
  };
  BookingConfirmation: {
    bookingId: string;
    posBookingId?: string;
    movieTitle: string;
    theatreName: string;
    showTime: string;
    date: string;
    seats: string[];
    amount: number;
    qrCodeData?: string;
  };
  TicketView: { bookingId: string };
  EventDetails: { eventId: string; title: string };
  EventBooking: { eventId: string; title: string; price: number };
  DailySpin: undefined;
  TransactionHistory: undefined;
  ProjectDetails: { projectId: string; title: string };
  TalentProfiles: { category?: string };
  EditProfile: undefined;
  Notifications: undefined;
  SupportPolicies: { type?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  MoviesTab: undefined;
  EventsTab: undefined;
  CineCoinsTab: undefined;
  AccountTab: undefined;
};
