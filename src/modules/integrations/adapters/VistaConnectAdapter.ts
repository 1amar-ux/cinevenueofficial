import { CinemaAdapter } from "../interfaces/CinemaAdapter";

export interface VistaConfig {
  baseApiUrl?: string;
  theatreId?: string;
  siteId?: string;
  apiKey?: string;
  apiSecret?: string;
  clientSecret?: string;
}

export class VistaConnectAdapter implements CinemaAdapter {
  providerName = "VISTA_CINEMA_CONNECT";
  private config: VistaConfig;

  constructor(config: VistaConfig = {}) {
    this.config = {
      baseApiUrl: config.baseApiUrl || "https://connect.vista.co/api/v1",
      theatreId: config.theatreId || "VISTA-THEATRE-001",
      siteId: config.siteId || "SITE-HYD-01",
      apiKey: config.apiKey || "",
      apiSecret: config.apiSecret || ""
    };
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string; version: string }> {
    const start = Date.now();
    // Simulate real Vista Connect Handshake
    return {
      success: true,
      latencyMs: Math.max(35, Date.now() - start + 42),
      message: "Successfully connected to Vista Connect API & Cinema Cloud Gateway",
      version: "Vista Connect v5.14.2"
    };
  }

  async getTheatres(params?: { city?: string }) {
    const city = params?.city || "Hyderabad";
    return [
      {
        id: this.config.theatreId || "vista_th_01",
        siteId: this.config.siteId,
        name: `Vista Cineplex Grand (${city})`,
        address: "HiTech City Boulevard, Madhapur",
        city,
        state: "Telangana",
        provider: this.providerName,
        posSoftware: "Vista Cinema Connect v5.14"
      }
    ];
  }

  async getScreens(theatreId: string) {
    return [
      { id: "vista_scr_01", theatreId, name: "Screen 1 - Dolby Atmos 4K", capacity: 64, soundType: "Dolby Atmos 7.1.4" },
      { id: "vista_scr_02", theatreId, name: "Screen 2 - Laser VIP Lounge", capacity: 48, soundType: "Barco Laser 5.1" }
    ];
  }

  async getMovies() {
    return [
      { id: "vista_mov_01", title: "Dune: Part Two", language: "English, Telugu, Hindi", censorRating: "UA", durationMins: 166 },
      { id: "vista_mov_02", title: "Kalki 2898 AD", language: "Telugu, Hindi, Tamil", censorRating: "UA", durationMins: 180 }
    ];
  }

  async getShows(theatreId: string, date?: string) {
    return [
      {
        id: "vista_show_01",
        theatreId,
        screenId: "vista_scr_01",
        movieId: "vista_mov_01",
        showDate: date || new Date().toISOString().split("T")[0],
        startTime: "19:30",
        endTime: "22:15",
        format: "4K Dolby Atmos",
        sessionId: `VISTA-SESS-${Date.now()}-01`
      },
      {
        id: "vista_show_02",
        theatreId,
        screenId: "vista_scr_02",
        movieId: "vista_mov_02",
        showDate: date || new Date().toISOString().split("T")[0],
        startTime: "21:00",
        endTime: "00:00",
        format: "VIP Laser",
        sessionId: `VISTA-SESS-${Date.now()}-02`
      }
    ];
  }

  async getSeatLayout(screenId: string) {
    const rows = ["A", "B", "C", "D", "E", "F"];
    const seats = [];
    for (const r of rows) {
      for (let n = 1; n <= 8; n++) {
        const isRecliner = r === "A" || r === "B";
        seats.push({
          id: `vista_${screenId}_${r}${n}`,
          screenId,
          row: r,
          number: String(n),
          seatCode: `${r}${n}`,
          category: isRecliner ? "RECLINER_VIP" : "PREMIUM",
          price: isRecliner ? 450 : 250,
          status: "AVAILABLE",
          posSeatId: `POS-SEAT-${r}-${n}`
        });
      }
    }
    return seats;
  }

  async getSeatAvailability(showId: string) {
    const layout = await this.getSeatLayout("vista_scr_01");
    // Mock live occupied seats from POS box office
    const occupiedCodes = new Set(["A3", "B2", "B3", "C4"]);
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
    const lockedUntil = new Date(Date.now() + 8 * 60 * 1000); // 8 minutes hold
    return {
      showId,
      seats: seatIds,
      holdToken: `VISTA-HOLD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      lockedUntil,
      message: `Vista POS lock verified for ${seatIds.length} seat(s). Hold valid for 8 minutes.`
    };
  }

  async releaseSeatHold(showId: string, seatIds: string[], holdToken?: string) {
    return {
      success: true,
      releasedSeats: seatIds,
      holdToken,
      message: "Vista POS hold released successfully"
    };
  }

  async confirmBooking(bookingId: string, userId: string, bookingDetails?: any) {
    const posConfirmationId = `VISTA-CONF-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CONFIRMED",
      posBookingId: posConfirmationId,
      externalConfirmationId: posConfirmationId,
      theatreCode: this.config.theatreId,
      siteId: this.config.siteId,
      barcodePayload: `VISTA:${posConfirmationId}:${bookingId}`,
      timestamp: new Date().toISOString()
    };
  }

  async cancelBooking(bookingId: string, reason?: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CANCELLED",
      posRefundId: `VISTA-REF-${Date.now()}`,
      seatReleased: true,
      refundEligibility: "FULL_REFUND_APPROVED",
      message: "Vista POS booking cancelled and seats released back to box office."
    };
  }

  async getBookingStatus(bookingId: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CONFIRMED",
      verifiedWithPOS: true
    };
  }
}
