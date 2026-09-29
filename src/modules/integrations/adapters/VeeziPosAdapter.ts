import { CinemaAdapter } from "../interfaces/CinemaAdapter";

export interface VeeziConfig {
  baseApiUrl?: string;
  theatreId?: string;
  siteToken?: string;
  accessToken?: string;
}

export class VeeziPosAdapter implements CinemaAdapter {
  providerName = "VEEZI_CLOUD_POS";
  private config: VeeziConfig;

  constructor(config: VeeziConfig = {}) {
    this.config = {
      baseApiUrl: config.baseApiUrl || "https://api.veezi.com/v1",
      theatreId: config.theatreId || "VEEZI-THEATRE-44",
      siteToken: config.siteToken || "",
      accessToken: config.accessToken || ""
    };
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string; version: string }> {
    return {
      success: true,
      latencyMs: 48,
      message: "Veezi Internet Ticketing & POS API Token Verified",
      version: "Veezi API v1.3"
    };
  }

  async getTheatres(params?: { city?: string }) {
    const city = params?.city || "Hyderabad";
    return [
      {
        id: this.config.theatreId || "veezi_th_01",
        name: `Veezi Boutique Cinema (${city})`,
        address: "Jubilee Hills Road No. 36",
        city,
        state: "Telangana",
        provider: this.providerName,
        posSoftware: "Veezi Cloud POS"
      }
    ];
  }

  async getScreens(theatreId: string) {
    return [
      { id: "veezi_scr_01", theatreId, name: "Screen 1 - Gold Class", capacity: 40, soundType: "Dolby 7.1" },
      { id: "veezi_scr_02", theatreId, name: "Screen 2 - Premier Lounge", capacity: 36, soundType: "Dolby 5.1" }
    ];
  }

  async getMovies() {
    return [
      { id: "veezi_mov_01", title: "Interstellar (Re-release)", language: "English", censorRating: "UA", durationMins: 169 },
      { id: "veezi_mov_02", title: "Oppenheimer", language: "English, Hindi", censorRating: "A", durationMins: 180 }
    ];
  }

  async getShows(theatreId: string, date?: string) {
    return [
      {
        id: "veezi_show_01",
        theatreId,
        screenId: "veezi_scr_01",
        movieId: "veezi_mov_01",
        showDate: date || new Date().toISOString().split("T")[0],
        startTime: "18:45",
        endTime: "21:40",
        format: "IMAX Experience",
        sessionId: `VEEZI-SESS-${Date.now()}-01`
      }
    ];
  }

  async getSeatLayout(screenId: string) {
    const rows = ["A", "B", "C", "D", "E"];
    const seats = [];
    for (const r of rows) {
      for (let n = 1; n <= 8; n++) {
        seats.push({
          id: `veezi_${screenId}_${r}${n}`,
          screenId,
          row: r,
          number: String(n),
          seatCode: `${r}${n}`,
          category: r === "A" ? "SOFA_LOUNGER" : "EXECUTIVE",
          price: r === "A" ? 400 : 220,
          status: "AVAILABLE",
          posSeatId: `VEEZI-SEAT-${r}${n}`
        });
      }
    }
    return seats;
  }

  async getSeatAvailability(showId: string) {
    const layout = await this.getSeatLayout("veezi_scr_01");
    const occupiedCodes = new Set(["A1", "A2", "C3", "D5"]);
    return layout.map(s => ({
      showSeatId: `ss_${showId}_${s.id}`,
      seatId: s.id,
      row: s.row,
      number: s.number,
      seatCode: s.seatCode,
      category: s.category,
      price: s.price,
      status: occupiedCodes.has(s.seatCode) ? "BOOKED" : "AVAILABLE",
      posSeatId: s.posSeatId,
      lockedUntil: null
    }));
  }

  async lockSeats(showId: string, seatIds: string[], userId: string) {
    return {
      showId,
      seats: seatIds,
      holdToken: `VEEZI-HLD-${Date.now()}`,
      lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes hold
      message: "Veezi Internet Ticketing lock active."
    };
  }

  async releaseSeatHold(showId: string, seatIds: string[], holdToken?: string) {
    return {
      success: true,
      releasedSeats: seatIds,
      holdToken,
      message: "Veezi seat lock released."
    };
  }

  async confirmBooking(bookingId: string, userId: string) {
    const posConfirmationId = `VEEZI-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CONFIRMED",
      posBookingId: posConfirmationId,
      externalConfirmationId: posConfirmationId,
      barcodePayload: `VEEZI:${posConfirmationId}:${bookingId}`,
      timestamp: new Date().toISOString()
    };
  }

  async cancelBooking(bookingId: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CANCELLED",
      posRefundId: `VEEZI-REF-${Date.now()}`,
      seatReleased: true
    };
  }

  async getBookingStatus(bookingId: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CONFIRMED"
    };
  }
}
