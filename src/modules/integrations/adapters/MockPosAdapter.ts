import { POSIntegration } from "../interfaces/CinemaAdapter";

/**
 * ============================================================================
 * MockPosAdapter — DEVELOPMENT / TEST ONLY
 * ============================================================================
 * This adapter simulates a full-featured Cinema Point of Sale (POS) environment
 * for development, local sandboxing, and automated integration testing.
 *
 * DO NOT use this adapter for production theatre ticketing.
 */
export class MockPosAdapter implements POSIntegration {
  providerName = "MOCK_POS_DEVELOPMENT_ONLY";
  isMock = true;

  private heldSeats: Map<string, { seats: string[]; userId: string; expiresAt: Date; holdToken: string }> = new Map();
  private bookings: Map<string, any> = new Map();
  private bookedSeatsByShow: Map<string, Set<string>> = new Map([
    ["mock_show_01", new Set(["A3", "A4", "B5"])]
  ]);

  async connect(credentials?: any): Promise<boolean> {
    return true;
  }

  async testConnection(): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    version: string;
    theatreInfo: any;
  }> {
    return {
      success: true,
      latencyMs: 25,
      message: "✓ [DEVELOPMENT MOCK POS] Authentication & API handshake successful",
      version: "Mock POS Engine v1.0.0-dev",
      theatreInfo: {
        id: "mock_theatre_01",
        name: "CineVenue Sandbox Multiplex (DEVELOPMENT ONLY)",
        city: "Hyderabad",
        screensCount: 2,
        activeShows: 4
      }
    };
  }

  async getTheatre(theatreId?: string) {
    return {
      id: theatreId || "mock_theatre_01",
      name: "CineVenue Sandbox Multiplex (DEVELOPMENT ONLY)",
      address: "Development Sandbox Street, Sector 1",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      postalCode: "500081",
      provider: this.providerName,
      isMock: true
    };
  }

  async getScreens(theatreId?: string) {
    return [
      {
        id: "mock_screen_01",
        theatreId: theatreId || "mock_theatre_01",
        name: "Audi 1 - 4K Laser Dolby Atmos",
        capacity: 40,
        screenType: "4K_LASER_ATMOS"
      },
      {
        id: "mock_screen_02",
        theatreId: theatreId || "mock_theatre_01",
        name: "Audi 2 - VIP Recliner Lounge",
        capacity: 24,
        screenType: "VIP_RECLINER"
      }
    ];
  }

  async getSeats(screenId: string) {
    const isVip = screenId === "mock_screen_02";
    const rows = isVip ? ["A", "B", "C"] : ["A", "B", "C", "D", "E"];
    const cols = isVip ? 8 : 8;
    const seats = [];

    for (const r of rows) {
      for (let n = 1; n <= cols; n++) {
        const seatCode = `${r}${n}`;
        const isRecliner = r === "A" || isVip;
        seats.push({
          posSeatId: `POS-${screenId}-${seatCode}`,
          cinevenueSeatId: `${screenId}-${seatCode}`,
          row: r,
          number: String(n),
          seatCode,
          category: isRecliner ? "RECLINER" : "PREMIUM",
          type: isRecliner ? "SOFA" : "STANDARD",
          status: "AVAILABLE",
          price: isRecliner ? 450 : 250
        });
      }
    }
    return seats;
  }

  async getMovies() {
    return [
      {
        id: "mock_movie_01",
        title: "Avatar: Fire and Ash",
        language: "English, Hindi, Telugu",
        duration: "192 min",
        certificate: "UA",
        format: "3D IMAX"
      },
      {
        id: "mock_movie_02",
        title: "Kalki 2898 AD",
        language: "Telugu, Hindi, Tamil",
        duration: "180 min",
        certificate: "UA",
        format: "4K Dolby Atmos"
      }
    ];
  }

  async getShowtimes(theatreId?: string, date?: string) {
    const showDate = date || new Date().toISOString().split("T")[0];
    return [
      {
        id: "mock_show_01",
        theatreId: theatreId || "mock_theatre_01",
        screenId: "mock_screen_01",
        movieId: "mock_movie_01",
        date: showDate,
        startTime: "19:00",
        endTime: "22:15",
        format: "3D IMAX",
        ticketTypes: [
          { name: "Recliner", price: 450 },
          { name: "Premium", price: 250 }
        ]
      },
      {
        id: "mock_show_02",
        theatreId: theatreId || "mock_theatre_01",
        screenId: "mock_screen_02",
        movieId: "mock_movie_02",
        date: showDate,
        startTime: "21:30",
        endTime: "00:30",
        format: "VIP Laser",
        ticketTypes: [
          { name: "VIP Recliner", price: 450 }
        ]
      }
    ];
  }

  async getPrices(showId?: string) {
    return [
      { category: "RECLINER", basePrice: 450, tax: 81, total: 531 },
      { category: "PREMIUM", basePrice: 250, tax: 45, total: 295 }
    ];
  }

  async getSeatAvailability(showId: string) {
    const layout = await this.getSeats("mock_screen_01");
    const booked = this.bookedSeatsByShow.get(showId) || new Set();

    return layout.map(s => ({
      showSeatId: `ss_${showId}_${s.posSeatId}`,
      posSeatId: s.posSeatId,
      cinevenueSeatId: s.cinevenueSeatId,
      row: s.row,
      number: s.number,
      seatCode: s.seatCode,
      category: s.category,
      price: s.price,
      status: booked.has(s.seatCode) ? "BOOKED" : "AVAILABLE",
      lockedUntil: null
    }));
  }

  async holdSeats(showId: string, seatIds: string[], userId: string) {
    const holdDurationMinutes = 8;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
    const holdToken = `MOCK-HOLD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    this.heldSeats.set(holdToken, {
      seats: seatIds,
      userId,
      expiresAt,
      holdToken
    });

    return {
      showId,
      seats: seatIds,
      holdToken,
      lockedUntil: expiresAt,
      durationMinutes: holdDurationMinutes,
      message: `[MOCK POS] ${seatIds.length} seat(s) held for 8 minutes.`
    };
  }

  async releaseSeats(showId: string, seatIds: string[], holdToken?: string) {
    if (holdToken) {
      this.heldSeats.delete(holdToken);
    }
    return {
      success: true,
      releasedSeats: seatIds,
      message: `[MOCK POS] Held seats released back to available inventory.`
    };
  }

  async createBooking(bookingPayload: {
    bookingId: string;
    theatreId: string;
    screenId: string;
    movieId: string;
    showId: string;
    userId: string;
    seatIds: string[];
    amount: number;
    holdToken?: string;
  }) {
    if (bookingPayload.showId?.includes("decline") || bookingPayload.seatIds?.includes("DECLINE_SEAT")) {
      throw new Error("POS Gateway Error: Box office terminal conflict during commit");
    }

    const posBookingId = `MOCK-POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const record = {
      id: bookingPayload.bookingId,
      posBookingId,
      externalConfirmationId: posBookingId,
      status: "CONFIRMED",
      theatreId: bookingPayload.theatreId,
      screenId: bookingPayload.screenId,
      movieId: bookingPayload.movieId,
      showId: bookingPayload.showId,
      seatIds: bookingPayload.seatIds,
      amount: bookingPayload.amount,
      barcodePayload: `MOCKPOS:${posBookingId}:${bookingPayload.bookingId}`,
      timestamp: new Date().toISOString()
    };

    // Mark seats as booked
    const booked = this.bookedSeatsByShow.get(bookingPayload.showId) || new Set();
    for (const s of bookingPayload.seatIds) {
      booked.add(s);
    }
    this.bookedSeatsByShow.set(bookingPayload.showId, booked);
    this.bookings.set(bookingPayload.bookingId, record);

    if (bookingPayload.holdToken) {
      this.heldSeats.delete(bookingPayload.holdToken);
    }

    return record;
  }

  async getBooking(bookingId: string) {
    return this.bookings.get(bookingId) || {
      id: bookingId,
      posBookingId: `MOCK-POS-RECORD`,
      status: "CONFIRMED"
    };
  }

  async cancelBooking(bookingId: string, reason?: string) {
    const existing = this.bookings.get(bookingId);
    if (existing) {
      existing.status = "CANCELLED";
      const booked = this.bookedSeatsByShow.get(existing.showId);
      if (booked) {
        for (const s of existing.seatIds || []) {
          booked.delete(s);
        }
      }
    }

    const posRefundId = `MOCK-REFUND-${Date.now()}`;
    return {
      id: bookingId,
      posRefundId,
      status: "CANCELLED",
      seatReleased: true,
      refundEligibility: "FULL_REFUND_APPROVED",
      message: "[MOCK POS] Booking cancelled and seats successfully released."
    };
  }

  async refundBooking(bookingId: string, amount: number = 0) {
    const refundId = `MOCK-RFD-${Date.now()}`;
    return {
      id: bookingId,
      refundId,
      amount,
      status: "REFUNDED",
      timestamp: new Date().toISOString()
    };
  }
}
