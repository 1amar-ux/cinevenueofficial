export type PosEnvironment = "SANDBOX" | "PRODUCTION";

export type CapabilityStatus = "SUPPORTED" | "NOT_SUPPORTED" | "UNKNOWN" | "NOT_TESTED";

export interface PosCapabilities {
  showSync: CapabilityStatus;
  screenSync: CapabilityStatus;
  seatLayout: CapabilityStatus;
  liveSeatAvailability: CapabilityStatus;
  seatHold: CapabilityStatus;
  releaseSeatHold: CapabilityStatus;
  bookingConfirmation: CapabilityStatus;
  bookingStatus: CapabilityStatus;
  cancellation: CapabilityStatus;
  refund: CapabilityStatus;
  webhooks: CapabilityStatus;
}

export interface PosVenue {
  posVenueId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface PosScreen {
  posScreenId: string;
  posVenueId: string;
  name: string;
  capacity: number;
}

export interface PosMovie {
  posMovieId: string;
  title: string;
  durationMinutes?: number;
  language?: string;
  format?: string;
}

export interface PosShow {
  posShowId: string;
  posVenueId: string;
  posScreenId: string;
  posMovieId: string;
  showTime: string; // ISO String
  endTime?: string;
  categories: {
    categoryName: string;
    price: number;
  }[];
}

export interface PosSeat {
  posSeatId: string;
  row: string;
  number: string;
  category: string;
  price: number;
  status: "AVAILABLE" | "SOLD" | "BLOCKED" | "HELD";
}

export interface PosSeatMap {
  posScreenId: string;
  rows: string[];
  seats: PosSeat[];
}

export interface PosSeatHoldRequest {
  posShowId: string;
  posSeatIds: string[];
  durationMinutes: number;
  customerIdentifier?: string;
  idempotencyKey: string;
}

export interface PosSeatHoldResponse {
  success: boolean;
  posHoldId: string;
  expiresAt: string; // ISO
  heldSeatIds: string[];
  error?: string;
}

export interface PosBookingRequest {
  idempotencyKey: string;
  cinevenueBookingId: string;
  posShowId: string;
  posHoldId?: string;
  posSeatIds: string[];
  totalTicketAmount: number;
  customerDetails: {
    name: string;
    email: string;
    mobile?: string;
  };
}

export interface PosBookingResponse {
  success: boolean;
  posBookingId: string;
  posReferenceNumber?: string;
  barcodeData?: string;
  qrCodeData?: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  error?: string;
}

export interface PosCancellationResponse {
  success: boolean;
  posBookingId: string;
  refundEligible: boolean;
  refundAmount?: number;
  error?: string;
}

export interface PosConnectionTestResult {
  connected: boolean;
  provider: string;
  environment: PosEnvironment;
  latencyMs: number;
  apiStatus: string;
  venueName?: string;
  capabilities: PosCapabilities;
  error?: string;
}

export interface IPosProviderAdapter {
  providerName: string;

  connect(config: any): Promise<boolean>;
  testConnection(config: any): Promise<PosConnectionTestResult>;
  getCapabilities(): PosCapabilities;

  getVenues(config: any): Promise<PosVenue[]>;
  getScreens(config: any, venueId?: string): Promise<PosScreen[]>;
  getMovies(config: any): Promise<PosMovie[]>;
  getShows(config: any, venueId?: string, date?: string): Promise<PosShow[]>;

  getSeatMap(config: any, showId: string): Promise<PosSeatMap>;
  getSeatAvailability(config: any, showId: string): Promise<Record<string, "AVAILABLE" | "SOLD" | "BLOCKED" | "HELD">>;

  holdSeats(config: any, request: PosSeatHoldRequest): Promise<PosSeatHoldResponse>;
  releaseSeats(config: any, posShowId: string, posHoldId: string, posSeatIds: string[]): Promise<boolean>;

  createBooking(config: any, request: PosBookingRequest): Promise<PosBookingResponse>;
  getBookingStatus(config: any, posBookingId: string): Promise<{ status: string; details?: any }>;

  cancelBooking(config: any, posBookingId: string, reason?: string): Promise<PosCancellationResponse>;
  refundBooking(config: any, posBookingId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }>;

  handleWebhook(payload: any, signatureHeader?: string, secret?: string): Promise<{ eventType: string; eventId: string; data: any; signatureValid: boolean }>;
}
