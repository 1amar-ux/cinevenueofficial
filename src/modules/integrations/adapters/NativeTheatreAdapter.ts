import { CinemaAdapter } from "../interfaces/CinemaAdapter";
import { prisma } from "../../../lib/prisma";

export class NativeTheatreAdapter implements CinemaAdapter {
  providerName = "NATIVE_CINEVENUE_THEATRE";

  async getTheatres(params?: { city?: string }) {
    return prisma.theatre.findMany({
      where: params?.city ? { city: params.city } : undefined
    });
  }

  async getScreens(theatreId: string) {
    return prisma.screen.findMany({
      where: { theatreId },
      include: { seats: true }
    });
  }

  async getMovies() {
    return [
      { id: "movie_kalki_2898", title: "Kalki 2898 AD", language: "Telugu, Hindi, Tamil" },
      { id: "movie_devara", title: "Devara: Part 1", language: "Telugu, Hindi" },
      { id: "movie_pushpa2", title: "Pushpa 2: The Rule", language: "Telugu, Hindi" }
    ];
  }

  async getShows(theatreId: string, date?: string) {
    return prisma.show.findMany({
      where: {
        theatreId,
        ...(date ? {
          startTime: {
            gte: new Date(`${date}T00:00:00`),
            lt: new Date(`${date}T23:59:59`)
          }
        } : {})
      },
      include: { theatre: true, screen: true }
    });
  }

  async getSeatLayout(screenId: string) {
    return prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ row: "asc" }, { number: "asc" }]
    });
  }

  async getSeatAvailability(showId: string) {
    const seats = await prisma.showSeat.findMany({
      where: { showId },
      include: { seat: true }
    });

    return seats.map(item => ({
      showSeatId: item.id,
      seatId: item.seatId,
      row: (item as any).seat?.row,
      number: (item as any).seat?.number,
      category: (item as any).seat?.category,
      price: item.price,
      status: item.status,
      lockedUntil: item.lockedUntil
    }));
  }

  async lockSeats(showId: string, showSeatIds: string[], userId: string): Promise<{
    showId: string;
    seats: string[];
    lockedUntil: Date;
  }> {
    const LOCK_MINUTES = 5;

    const result = await prisma.$transaction(async (tx) => {
      const seats = await tx.showSeat.findMany({
        where: {
          id: { in: showSeatIds },
          showId
        }
      });

      if (seats.length !== showSeatIds.length) {
        throw new Error("Invalid seats selected");
      }

      const now = new Date();

      for (const seat of seats) {
        if (seat.status === "BOOKED" || seat.status === "SOLD" || seat.status === "BLOCKED") {
          throw new Error(`Seat ${seat.id} is unavailable`);
        }

        if (seat.status === "LOCKED" && seat.lockedUntil && seat.lockedUntil > now && seat.lockedBy !== userId) {
          throw new Error(`Seat ${seat.id} is already locked by another user`);
        }
      }

      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

      await tx.showSeat.updateMany({
        where: {
          id: { in: showSeatIds },
          showId
        },
        data: {
          status: "LOCKED",
          lockedBy: userId,
          lockedUntil
        }
      });

      return {
        showId,
        seats: showSeatIds,
        lockedUntil
      };
    });

    return result as { showId: string; seats: string[]; lockedUntil: Date };
  }

  async confirmBooking(bookingId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true }
      });

      if (!booking) throw new Error("Booking not found");
      if (booking.status === "CONFIRMED") return booking;

      for (const item of (booking as any).items) {
        const seat = await tx.showSeat.findUnique({
          where: { id: item.showSeatId }
        });

        if (!seat) throw new Error("Show seat not found");
        if (seat.status !== "LOCKED" || seat.lockedBy !== userId) {
          throw new Error("Seat is not locked by this user");
        }

        if (seat.lockedUntil && seat.lockedUntil < new Date()) {
          throw new Error("Seat lock expired");
        }
      }

      await tx.showSeat.updateMany({
        where: {
          id: { in: (booking as any).items.map((i: any) => i.showSeatId) }
        },
        data: {
          status: "BOOKED",
          lockedBy: null,
          lockedUntil: null
        }
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" }
      });
    });
  }

  async cancelBooking(bookingId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true }
      });

      if (!booking) throw new Error("Booking not found");
      if (booking.status === "CANCELLED") return booking;

      await tx.showSeat.updateMany({
        where: {
          id: { in: (booking as any).items.map((i: any) => i.showSeatId) }
        },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedUntil: null
        }
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      });
    });
  }

  async getBookingStatus(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        theatre: true,
        show: { include: { screen: true } },
        items: { include: { showSeat: { include: { seat: true } } } },
        payment: true
      }
    });
  }
}
