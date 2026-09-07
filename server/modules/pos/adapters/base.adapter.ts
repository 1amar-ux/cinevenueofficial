import {
  IPosProviderAdapter,
  PosCapabilities,
  PosConnectionTestResult,
  PosVenue,
  PosScreen,
  PosMovie,
  PosShow,
  PosSeatMap,
  PosSeatHoldRequest,
  PosSeatHoldResponse,
  PosBookingRequest,
  PosBookingResponse,
  PosCancellationResponse
} from "../pos.types";
import { logger } from "../../../shared/logger";

export abstract class BasePosAdapter implements IPosProviderAdapter {
  abstract providerName: string;

  abstract getCapabilities(): PosCapabilities;

  abstract connect(config: any): Promise<boolean>;

  abstract testConnection(config: any): Promise<PosConnectionTestResult>;

  abstract getVenues(config: any): Promise<PosVenue[]>;

  abstract getScreens(config: any, venueId?: string): Promise<PosScreen[]>;

  abstract getMovies(config: any): Promise<PosMovie[]>;

  abstract getShows(config: any, venueId?: string, date?: string): Promise<PosShow[]>;

  abstract getSeatMap(config: any, showId: string): Promise<PosSeatMap>;

  abstract getSeatAvailability(config: any, showId: string): Promise<Record<string, "AVAILABLE" | "SOLD" | "BLOCKED" | "HELD">>;

  abstract holdSeats(config: any, request: PosSeatHoldRequest): Promise<PosSeatHoldResponse>;

  abstract releaseSeats(config: any, posShowId: string, posHoldId: string, posSeatIds: string[]): Promise<boolean>;

  abstract createBooking(config: any, request: PosBookingRequest): Promise<PosBookingResponse>;

  abstract getBookingStatus(config: any, posBookingId: string): Promise<{ status: string; details?: any }>;

  abstract cancelBooking(config: any, posBookingId: string, reason?: string): Promise<PosCancellationResponse>;

  abstract refundBooking(config: any, posBookingId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }>;

  abstract handleWebhook(payload: any, signatureHeader?: string, secret?: string): Promise<{ eventType: string; eventId: string; data: any; signatureValid: boolean }>;

  protected validateHttpsUrl(url: string): void {
    if (!url || !url.startsWith("https://")) {
      throw new Error("Base API URL must be a valid HTTPS URL in production environments.");
    }
  }

  protected safeLogError(action: string, error: any): void {
    logger.warn(`[POS Adapter: ${this.providerName}] ${action} failed: ${error.message || error}`);
  }
}
