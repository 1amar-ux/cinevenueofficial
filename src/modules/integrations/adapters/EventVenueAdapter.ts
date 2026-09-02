import { CinemaAdapter } from "../interfaces/CinemaAdapter";

export class EventVenueAdapter implements CinemaAdapter {
  providerName = "EVENT_VENUE_LIVE";

  async getTheatres(params?: { city?: string }) {
    const city = params?.city || "Hyderabad";
    return [
      {
        id: "venue_gachibowli_01",
        name: `Gachibowli Indoor Stadium (${city})`,
        address: "Old Mumbai Highway, Gachibowli",
        city,
        state: "Telangana",
        provider: this.providerName
      }
    ];
  }

  async getScreens(theatreId: string) {
    return [
      { id: "event_zone_01", theatreId, name: "Main Arena", capacity: 500 }
    ];
  }

  async getMovies() {
    return [
      { id: "event_ani_live", title: "Anirudh Live Concert 2026", language: "Multilingual Music" }
    ];
  }

  async getShows(theatreId: string, date?: string) {
    return [
      {
        id: "show_event_ani_01",
        theatreId,
        screenId: "event_zone_01",
        eventId: "event_ani_live",
        startTime: new Date(Date.now() + 86400 * 1000 * 2),
        endTime: new Date(Date.now() + 86400 * 1000 * 2 + 4 * 3600 * 1000),
        language: "Live Music",
        format: "Live Concert"
      }
    ];
  }

  async getSeatLayout(screenId: string) {
    const seats = [];
    for (let r of ["VVIP", "VIP", "GA"]) {
      for (let n = 1; n <= 10; n++) {
        seats.push({
          id: `ev_st_${r}_${n}`,
          screenId,
          row: r,
          number: String(n),
          category: r === "VVIP" ? "RECLINER" : r === "VIP" ? "PREMIUM" : "REGULAR",
          price: r === "VVIP" ? 2500 : r === "VIP" ? 1200 : 499,
          status: "AVAILABLE"
        });
      }
    }
    return seats;
  }

  async getSeatAvailability(showId: string) {
    const layout = await this.getSeatLayout("event_zone_01");
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
    return { id: bookingId, status: "CONFIRMED", venueType: "EVENT_VENUE" };
  }

  async cancelBooking(bookingId: string) {
    return { id: bookingId, status: "CANCELLED" };
  }

  async getBookingStatus(bookingId: string) {
    return { id: bookingId, status: "CONFIRMED" };
  }
}
