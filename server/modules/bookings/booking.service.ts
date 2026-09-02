import Decimal from "decimal.js";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { NotFoundError, ConflictError, ValidationError } from "../../shared/errors";
import { logger } from "../../shared/logger";

const LOCK_TTL_SECONDS = 300; // 5 minutes

export class BookingService {
  // 1. Atomic Seat Lock
  public async lockSeats(showId: string, showSeatIds: string[], userId: string) {
    if (!showSeatIds || showSeatIds.length === 0) {
      throw new ValidationError("At least one seat must be selected");
    }

    const show = await prisma.show.findUnique({
      where: { id: showId }
    });
    if (!show) throw new NotFoundError("Show", showId);

    // Distributed lock check using atomic Redis setnx
    const lockedKeys: string[] = [];
    try {
      for (const ssId of showSeatIds) {
        const key = `lock:show:${showId}:seat:${ssId}`;
        const acquired = await redis.setnx(key, userId, LOCK_TTL_SECONDS);
        if (!acquired) {
          throw new ConflictError(`Seat is currently locked by another customer`);
        }
        lockedKeys.push(key);
      }
    } catch (err) {
      // Rollback acquired locks if any seat fails
      for (const key of lockedKeys) {
        await redis.del(key);
      }
      throw err;
    }

    // Persist lock in DB
    const lockedUntil = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);
    await prisma.showSeat.updateMany({
      where: { id: { in: showSeatIds }, showId },
      data: {
        status: "LOCKED",
        lockedBy: userId,
        lockedUntil
      }
    });

    logger.info(`Seats locked successfully: [${showSeatIds.join(", ")}] for user ${userId}`);

    return {
      showId,
      lockedSeats: showSeatIds,
      lockedUntil
    };
  }

  // 2. Authoritative Price Calculation (Server-Side)
  public async calculateBookingPrice(showId: string, showSeatIds: string[], couponCode?: string) {
    const showSeats = await prisma.showSeat.findMany({
      where: { id: { in: showSeatIds }, showId },
      include: { seat: true }
    });

    if (showSeats.length !== showSeatIds.length) {
      throw new ValidationError("One or more selected seats are invalid for this show");
    }

    let baseTicketTotal = new Decimal(0);
    for (const ss of showSeats) {
      baseTicketTotal = baseTicketTotal.plus(new Decimal(ss.price.toString()));
    }

    // Fixed & Standard Platform Rules
    const ticketCount = showSeats.length;
    const platformFee = new Decimal(18); // ₹18 flat digital access
    const convenienceFee = baseTicketTotal.times(0.05); // 5% convenience fee
    const gstRate = new Decimal(0.18); // 18% GST on platform + convenience
    const taxAmount = platformFee.plus(convenienceFee).times(gstRate).toDecimalPlaces(2);

    let discountAmount = new Decimal(0);
    if (couponCode && couponCode.toUpperCase() === "CINE50" && baseTicketTotal.greaterThanOrEqualTo(200)) {
      discountAmount = new Decimal(50);
    } else if (couponCode && couponCode.toUpperCase() === "FIRST100" && baseTicketTotal.greaterThanOrEqualTo(300)) {
      discountAmount = new Decimal(100);
    }

    const gatewayFee = new Decimal(0);
    const totalAmount = baseTicketTotal
      .plus(platformFee)
      .plus(convenienceFee)
      .plus(taxAmount)
      .minus(discountAmount)
      .toDecimalPlaces(2);

    return {
      ticketCount,
      ticketAmount: baseTicketTotal.toNumber(),
      platformFee: platformFee.toNumber(),
      convenienceFee: convenienceFee.toDecimalPlaces(2).toNumber(),
      taxAmount: taxAmount.toNumber(),
      discountAmount: discountAmount.toNumber(),
      gatewayFee: gatewayFee.toNumber(),
      totalAmount: totalAmount.toNumber()
    };
  }

  // 3. Create Pending Booking with Authoritative Calculated Price
  public async createPendingBooking(data: {
    showId: string;
    showSeatIds: string[];
    userId: string;
    couponCode?: string;
  }) {
    const show = await prisma.show.findUnique({
      where: { id: data.showId },
      include: { theatre: true }
    });
    if (!show) throw new NotFoundError("Show", data.showId);

    const priceBreakdown = await this.calculateBookingPrice(data.showId, data.showSeatIds, data.couponCode);

    const bookingNumber = `CV-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          bookingNumber,
          theatreId: show.theatreId,
          showId: show.id,
          userId: data.userId,
          ticketAmount: priceBreakdown.ticketAmount,
          platformFee: priceBreakdown.platformFee,
          convenienceFee: priceBreakdown.convenienceFee,
          taxAmount: priceBreakdown.taxAmount,
          discountAmount: priceBreakdown.discountAmount,
          gatewayFee: priceBreakdown.gatewayFee,
          totalAmount: priceBreakdown.totalAmount,
          status: "PENDING"
        }
      });

      // Fetch actual seat prices
      const showSeats = await tx.showSeat.findMany({
        where: { id: { in: data.showSeatIds } }
      });

      await tx.bookingItem.createMany({
        data: showSeats.map((ss) => ({
          bookingId: b.id,
          showSeatId: ss.id,
          price: ss.price
        }))
      });

      return b;
    });

    logger.info(`Pending booking created: ${booking.bookingNumber} for total ₹${priceBreakdown.totalAmount}`);

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      totalAmount: priceBreakdown.totalAmount,
      priceBreakdown
    };
  }

  // 4. Confirm Booking upon Verified Payment
  public async confirmBooking(bookingId: string, paymentDetails: { orderId: string; paymentId: string }) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true, show: true }
      });

      if (!booking) throw new NotFoundError("Booking", bookingId);
      if (booking.status === "CONFIRMED") return booking;

      const seatIds = booking.items.map((i) => i.showSeatId);

      // Mark show seats as BOOKED
      await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: "BOOKED",
          lockedBy: null,
          lockedUntil: null
        }
      });

      // Generate Ticket
      const ticketCode = `TKT-${booking.bookingNumber}`;
      const qrToken = `QR_${booking.id}_${Date.now()}`;

      await tx.ticket.create({
        data: {
          bookingId: booking.id,
          ticketCode,
          qrToken
        }
      });

      // Record Payment
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          provider: "RAZORPAY",
          providerId: paymentDetails.paymentId,
          orderId: paymentDetails.orderId,
          amount: booking.totalAmount,
          status: "SUCCESS"
        }
      });

      // Update Booking status
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" }
      });

      // Release Redis locks
      for (const ssId of seatIds) {
        await redis.del(`lock:show:${booking.showId}:seat:${ssId}`);
      }

      logger.info(`Booking confirmed successfully: ${booking.bookingNumber}`);

      return updated;
    });
  }
}

export const bookingService = new BookingService();
