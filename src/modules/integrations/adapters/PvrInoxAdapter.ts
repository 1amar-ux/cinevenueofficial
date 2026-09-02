import { CinemaAdapter } from "../interfaces/CinemaAdapter";

export class PvrInoxAdapter implements CinemaAdapter {
  providerName = "PVR_INOX_EXTERNAL_GATEWAY";

  async getTheatres(params?: { city?: string }) {
    const city = params?.city || "Hyderabad";
    return [
      {
        id: "pvr_inox_ext_01",
        name: `PVR INOX Gold Class & 4DX (${city})`,
        address: "Nexus Mall, City Center",
        city,
        state: "Telangana",
        provider: this.providerName
      }
    ];
  }

  async getScreens(theatreId: string) {
    return [
      { id: "pvr_screen_01", theatreId, name: "Screen 1 - PVR IMAX", capacity: 40 }
    ];
  }

  async getMovies() {
    return [
      { id: "pvr_mov_01", title: "Avatar: Fire and Ash", language: "English, Hindi, Telugu" }
    ];
  }

  async getShows(theatreId: string, date?: string) {
    return [
      {
        id: "pvr_show_01",
        theatreId,
        screenId: "pvr_screen_01",
        movieId: "pvr_mov_01",
        startTime: new Date(Date.now() + 3600 * 1000 * 3),
        endTime: new Date(Date.now() + 3600 * 1000 * 6),
        language: "English",
        format: "IMAX 3D"
      }
    ];
  }

  async getSeatLayout(screenId: string) {
    const seats = [];
    for (let r of ["A", "B", "C"]) {
      for (let n = 1; n <= 6; n++) {
        seats.push({
          id: `pvr_st_${r}_${n}`,
          screenId,
          row: r,
          number: String(n),
          category: r === "A" ? "RECLINER" : "PREMIUM",
          price: r === "A" ? 500 : 350,
          status: "AVAILABLE"
        });
      }
    }
    return seats;
  }

  async getSeatAvailability(showId: string) {
    const layout = await this.getSeatLayout("pvr_screen_01");
    return layout.map(s => ({
      showSeatId: `ss_${showId}_${s.id}`,
      seatId: s.id,
      row: s.row,
      number: s.number,
      category: s.category,
      price: s.price,
      status: s.status,
      lockedUntil: null
    }));
  }

  async lockSeats(showId: string, seatIds: string[], userId: string) {
    return {
      showId,
      seats: seatIds,
      lockedUntil: new Date(Date.now() + 5 * 60 * 1000)
    };
  }

  async confirmBooking(bookingId: string, userId: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CONFIRMED",
      externalConfirmationId: `PVR-${Date.now()}`
    };
  }

  async cancelBooking(bookingId: string) {
    return {
      id: bookingId,
      provider: this.providerName,
      status: "CANCELLED"
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
