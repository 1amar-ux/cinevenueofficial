import { prisma } from "../../lib/prisma";
import Decimal from "decimal.js";

// ==========================================
// 1. GET SHOW SEAT AVAILABILITY
// ==========================================
export async function getAvailability(showId: string) {
  const seats = await prisma.showSeat.findMany({
    where: {
      showId
    },
    include: {
      seat: true
    }
  });

  return seats.map((item) => ({
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

// ==========================================
// 2. ATOMIC SEAT LOCKING (5 MINUTE TTL)
// ==========================================
export async function lockSeats(
  showId: string,
  showSeatIds: string[],
  userId: string
) {
  const LOCK_MINUTES = 5;

  return prisma.$transaction(async (tx) => {
    const seats = await tx.showSeat.findMany({
      where: {
        id: {
          in: showSeatIds
        },
        showId
      }
    });

    if (seats.length !== showSeatIds.length) {
      throw new Error("Invalid seats selected");
    }

    const now = new Date();

    for (const seat of seats) {
      if (
        seat.status === "BOOKED" ||
        seat.status === "SOLD" ||
        seat.status === "BLOCKED"
      ) {
        throw new Error(`Seat ${seat.id} is unavailable`);
      }

      if (
        seat.status === "LOCKED" &&
        seat.lockedUntil &&
        seat.lockedUntil > now &&
        seat.lockedBy !== userId
      ) {
        throw new Error(`Seat ${seat.id} is already locked by another customer`);
      }
    }

    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);

    await tx.showSeat.updateMany({
      where: {
        id: {
          in: showSeatIds
        },
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
}

// ==========================================
// 3. CREATE PENDING BOOKING
// ==========================================
export async function createBooking(data: {
  theatreId: string;
  showId: string;
  userId?: string;
  showSeatIds: string[];
  ticketAmount: number | string;
  platformFee?: number | string;
  convenienceFee?: number | string;
  taxAmount?: number | string;
  discountAmount?: number | string;
  gatewayFee?: number | string;
  totalAmount: number | string;
}) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        theatreId: data.theatreId,
        showId: data.showId,
        userId: data.userId || "user_guest",
        ticketAmount: data.ticketAmount,
        platformFee: data.platformFee || 0,
        convenienceFee: data.convenienceFee || 0,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        gatewayFee: data.gatewayFee || 0,
        totalAmount: data.totalAmount,
        status: "PENDING"
      }
    });

    await tx.bookingItem.createMany({
      data: data.showSeatIds.map(seatId => ({
        bookingId: booking.id,
        showSeatId: seatId,
        price: 200
      }))
    });

    return booking;
  });
}

// ==========================================
// 4. CONFIRM BOOKING
// ==========================================
export async function confirmBooking(
  bookingId: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: {
        id: bookingId
      },
      include: {
        items: true
      }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CONFIRMED") {
      return booking;
    }

    for (const item of (booking as any).items) {
      const seat = await tx.showSeat.findUnique({
        where: {
          id: item.showSeatId
        }
      });

      if (!seat) {
        throw new Error("Show seat not found");
      }

      if (
        seat.status !== "LOCKED" ||
        (seat.lockedBy && seat.lockedBy !== userId)
      ) {
        throw new Error("Seat is not locked by this user");
      }

      if (
        seat.lockedUntil &&
        seat.lockedUntil < new Date()
      ) {
        throw new Error("Seat lock expired");
      }
    }

    await tx.showSeat.updateMany({
      where: {
        id: {
          in: (booking as any).items.map((item: any) => item.showSeatId)
        }
      },
      data: {
        status: "BOOKED",
        lockedBy: null,
        lockedUntil: null
      }
    });

    return tx.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status: "CONFIRMED"
      }
    });
  });
}

// ==========================================
// 5. CANCEL BOOKING
// ==========================================
export async function cancelBooking(
  bookingId: string
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: {
        id: bookingId
      },
      include: {
        items: true
      }
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      return booking;
    }

    await tx.showSeat.updateMany({
      where: {
        id: {
          in: (booking as any).items.map((item: any) => item.showSeatId)
        }
      },
      data: {
        status: "AVAILABLE",
        lockedBy: null,
        lockedUntil: null
      }
    });

    return tx.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status: "CANCELLED"
      }
    });
  });
}

// ==========================================
// 6. GET BOOKING DETAILS
// ==========================================
export async function getBooking(
  bookingId: string
) {
  return prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: {
      theatre: true,
      show: {
        include: {
          screen: true
        }
      },
      items: {
        include: {
          showSeat: {
            include: {
              seat: true
            }
          }
        }
      },
      payment: true
    }
  });
}
