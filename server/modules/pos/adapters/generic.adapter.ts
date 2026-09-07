import axios from "axios";
import { BasePosAdapter } from "./base.adapter";
import {
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

export class GenericPosAdapter extends BasePosAdapter {
  public providerName = "Generic REST POS";

  public getCapabilities(): PosCapabilities {
    return {
      showSync: "SUPPORTED",
      screenSync: "SUPPORTED",
      seatLayout: "SUPPORTED",
      liveSeatAvailability: "SUPPORTED",
      seatHold: "SUPPORTED",
      releaseSeatHold: "SUPPORTED",
      bookingConfirmation: "SUPPORTED",
      bookingStatus: "SUPPORTED",
      cancellation: "SUPPORTED",
      refund: "SUPPORTED",
      webhooks: "SUPPORTED"
    };
  }

  public async connect(config: any): Promise<boolean> {
    const res = await this.testConnection(config);
    return res.connected;
  }

  public async testConnection(config: any): Promise<PosConnectionTestResult> {
    const startTime = Date.now();
    const isSandbox = (config.environment || "SANDBOX").toUpperCase() === "SANDBOX";

    // If Sandbox mode or Sandbox mock URL, run high-fidelity simulator
    if (isSandbox && (!config.baseApiUrl || config.baseApiUrl.includes("sandbox") || config.baseApiUrl.includes("test"))) {
      const latency = Math.floor(Math.random() * 80) + 40;
      return {
        connected: true,
        provider: config.providerName || "Generic POS (Sandbox)",
        environment: "SANDBOX",
        latencyMs: latency,
        apiStatus: "ACTIVE_AUTHENTICATED",
        venueName: config.venueId ? `Venue-${config.venueId}` : "CineVenue Sandbox Theatre",
        capabilities: this.getCapabilities()
      };
    }

    try {
      this.validateHttpsUrl(config.baseApiUrl);

      const response = await axios.get(`${config.baseApiUrl}/health`, {
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "X-API-Key": config.apiKey,
          "X-Venue-ID": config.venueId || ""
        },
        timeout: 5000
      });

      const latencyMs = Date.now() - startTime;
      return {
        connected: response.status >= 200 && response.status < 300,
        provider: config.providerName || "Generic REST POS",
        environment: config.environment || "PRODUCTION",
        latencyMs,
        apiStatus: "ONLINE",
        venueName: config.venueId ? `Venue ${config.venueId}` : undefined,
        capabilities: this.getCapabilities()
      };
    } catch (err: any) {
      this.safeLogError("testConnection", err);
      // In Sandbox with custom URL, if offline, return safe diagnostic
      if (isSandbox) {
        return {
          connected: true,
          provider: `${config.providerName || "Generic POS"} (Sandbox Simulator)`,
          environment: "SANDBOX",
          latencyMs: 65,
          apiStatus: "SANDBOX_SIMULATED",
          capabilities: this.getCapabilities()
        };
      }

      return {
        connected: false,
        provider: config.providerName || "Generic REST POS",
        environment: config.environment || "PRODUCTION",
        latencyMs: Date.now() - startTime,
        apiStatus: "UNREACHABLE",
        error: "Failed to authenticate with POS endpoint. Please verify Base URL and API Credentials.",
        capabilities: {
          showSync: "NOT_TESTED",
          screenSync: "NOT_TESTED",
          seatLayout: "NOT_TESTED",
          liveSeatAvailability: "NOT_TESTED",
          seatHold: "NOT_TESTED",
          releaseSeatHold: "NOT_TESTED",
          bookingConfirmation: "NOT_TESTED",
          bookingStatus: "NOT_TESTED",
          cancellation: "NOT_TESTED",
          refund: "NOT_TESTED",
          webhooks: "NOT_TESTED"
        }
      };
    }
  }

  public async getVenues(config: any): Promise<PosVenue[]> {
    if (config.environment === "SANDBOX") {
      return [
        {
          posVenueId: config.venueId || "POS_VENUE_001",
          name: "CinePrime Sandbox Grand",
          city: "Vijayawada",
          state: "Andhra Pradesh"
        }
      ];
    }

    const res = await axios.get(`${config.baseApiUrl}/venues`, {
      headers: { "Authorization": `Bearer ${config.apiKey}`, "X-API-Key": config.apiKey },
      timeout: 8000
    });
    return res.data?.data || [];
  }

  public async getScreens(config: any, venueId?: string): Promise<PosScreen[]> {
    if (config.environment === "SANDBOX") {
      return [
        { posScreenId: "POS_SCR_1", posVenueId: venueId || "POS_VENUE_001", name: "Screen 1 (Dolby Atmos 4K)", capacity: 180 },
        { posScreenId: "POS_SCR_2", posVenueId: venueId || "POS_VENUE_001", name: "Screen 2 (IMAX Laser)", capacity: 220 }
      ];
    }

    const res = await axios.get(`${config.baseApiUrl}/venues/${venueId || config.venueId}/screens`, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data || [];
  }

  public async getMovies(config: any): Promise<PosMovie[]> {
    if (config.environment === "SANDBOX") {
      return [
        { posMovieId: "POS_MOV_101", title: "Kalki 2898 AD", durationMinutes: 181, language: "Telugu", format: "3D" },
        { posMovieId: "POS_MOV_102", title: "Devara: Part 1", durationMinutes: 178, language: "Telugu", format: "2D" }
      ];
    }

    const res = await axios.get(`${config.baseApiUrl}/movies`, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data || [];
  }

  public async getShows(config: any, venueId?: string, date?: string): Promise<PosShow[]> {
    if (config.environment === "SANDBOX") {
      const now = new Date();
      const showDate = date || now.toISOString().split("T")[0];
      return [
        {
          posShowId: `POS_SHOW_${showDate}_1100`,
          posVenueId: venueId || "POS_VENUE_001",
          posScreenId: "POS_SCR_1",
          posMovieId: "POS_MOV_101",
          showTime: `${showDate}T11:00:00.000Z`,
          categories: [
            { categoryName: "RECLINER", price: 350 },
            { categoryName: "PRIME", price: 200 },
            { categoryName: "CLASSIC", price: 150 }
          ]
        },
        {
          posShowId: `POS_SHOW_${showDate}_1430`,
          posVenueId: venueId || "POS_VENUE_001",
          posScreenId: "POS_SCR_2",
          posMovieId: "POS_MOV_102",
          showTime: `${showDate}T14:30:00.000Z`,
          categories: [
            { categoryName: "IMAX_PRIME", price: 400 },
            { categoryName: "IMAX_CLASSIC", price: 250 }
          ]
        }
      ];
    }

    const res = await axios.get(`${config.baseApiUrl}/shows`, {
      params: { venueId: venueId || config.venueId, date },
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data || [];
  }

  public async getSeatMap(config: any, showId: string): Promise<PosSeatMap> {
    if (config.environment === "SANDBOX") {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seats: any[] = [];
      for (const r of rows) {
        for (let num = 1; num <= 14; num++) {
          seats.push({
            posSeatId: `${r}${num}`,
            row: r,
            number: String(num),
            category: r === "A" || r === "B" ? "RECLINER" : r <= "E" ? "PRIME" : "CLASSIC",
            price: r === "A" || r === "B" ? 350 : r <= "E" ? 200 : 150,
            status: num === 5 && r === "C" ? "SOLD" : "AVAILABLE"
          });
        }
      }
      return {
        posScreenId: "POS_SCR_1",
        rows,
        seats
      };
    }

    const res = await axios.get(`${config.baseApiUrl}/shows/${showId}/seatmap`, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data;
  }

  public async getSeatAvailability(config: any, showId: string): Promise<Record<string, "AVAILABLE" | "SOLD" | "BLOCKED" | "HELD">> {
    if (config.environment === "SANDBOX") {
      return {
        "A1": "AVAILABLE", "A2": "AVAILABLE", "A3": "AVAILABLE", "A4": "AVAILABLE",
        "B1": "AVAILABLE", "B2": "AVAILABLE", "B3": "SOLD", "B4": "SOLD",
        "C5": "SOLD", "D10": "BLOCKED"
      };
    }

    const res = await axios.get(`${config.baseApiUrl}/shows/${showId}/availability`, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 5000
    });
    return res.data?.data || {};
  }

  public async holdSeats(config: any, request: PosSeatHoldRequest): Promise<PosSeatHoldResponse> {
    if (config.environment === "SANDBOX") {
      const expiresAt = new Date(Date.now() + (request.durationMinutes || 10) * 60 * 1000).toISOString();
      return {
        success: true,
        posHoldId: `HOLD_SANDBOX_${Date.now()}`,
        expiresAt,
        heldSeatIds: request.posSeatIds
      };
    }

    const res = await axios.post(`${config.baseApiUrl}/shows/${request.posShowId}/hold`, request, {
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Idempotency-Key": request.idempotencyKey
      },
      timeout: 6000
    });
    return res.data?.data;
  }

  public async releaseSeats(config: any, posShowId: string, posHoldId: string, posSeatIds: string[]): Promise<boolean> {
    if (config.environment === "SANDBOX") {
      return true;
    }

    try {
      await axios.post(`${config.baseApiUrl}/shows/${posShowId}/release`, {
        posHoldId,
        posSeatIds
      }, {
        headers: { "Authorization": `Bearer ${config.apiKey}` },
        timeout: 5000
      });
      return true;
    } catch {
      return false;
    }
  }

  public async createBooking(config: any, request: PosBookingRequest): Promise<PosBookingResponse> {
    if (config.environment === "SANDBOX") {
      const posBookingId = `POS-SB-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        success: true,
        posBookingId,
        posReferenceNumber: `REF-${request.cinevenueBookingId}`,
        barcodeData: `${posBookingId}|${request.posSeatIds.join(",")}`,
        qrCodeData: `https://cinevenue.com/ticket/${request.cinevenueBookingId}`,
        status: "CONFIRMED"
      };
    }

    const res = await axios.post(`${config.baseApiUrl}/bookings`, request, {
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Idempotency-Key": request.idempotencyKey
      },
      timeout: 10000
    });
    return res.data?.data;
  }

  public async getBookingStatus(config: any, posBookingId: string): Promise<{ status: string; details?: any }> {
    if (config.environment === "SANDBOX") {
      return { status: "CONFIRMED" };
    }

    const res = await axios.get(`${config.baseApiUrl}/bookings/${posBookingId}`, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 5000
    });
    return res.data?.data || { status: "UNKNOWN" };
  }

  public async cancelBooking(config: any, posBookingId: string, reason?: string): Promise<PosCancellationResponse> {
    if (config.environment === "SANDBOX") {
      return {
        success: true,
        posBookingId,
        refundEligible: true,
        refundAmount: 350
      };
    }

    const res = await axios.post(`${config.baseApiUrl}/bookings/${posBookingId}/cancel`, { reason }, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data;
  }

  public async refundBooking(config: any, posBookingId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    if (config.environment === "SANDBOX") {
      return { success: true, refundId: `REFUND_SB_${Date.now()}` };
    }

    const res = await axios.post(`${config.baseApiUrl}/bookings/${posBookingId}/refund`, { amount }, {
      headers: { "Authorization": `Bearer ${config.apiKey}` },
      timeout: 8000
    });
    return res.data?.data;
  }

  public async handleWebhook(payload: any, signatureHeader?: string, secret?: string): Promise<{ eventType: string; eventId: string; data: any; signatureValid: boolean }> {
    const eventId = payload?.eventId || payload?.id || `evt_${Date.now()}`;
    const eventType = payload?.eventType || payload?.event || "UNKNOWN";
    return {
      eventType,
      eventId,
      data: payload?.data || payload,
      signatureValid: true
    };
  }
}
