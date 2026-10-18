import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { logger } from "../../shared/logger";

const router = Router();

/**
 * Public & Gate Terminal Ticket Verification API
 * GET /api/v1/tickets/verify?token=<qrToken>
 * POST /api/v1/tickets/verify
 * 
 * Inspects cryptographic/secure QR token and returns authoritative status:
 * - VALID
 * - ALREADY_USED
 * - CANCELLED
 * - INVALID
 * 
 * Never returns sensitive payment or card credentials.
 */
router.all("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.query.token as string) || (req.body?.token as string);
    const doCheckIn = req.query.checkIn === "true" || req.body?.checkIn === true;
    const operatorName = (req.query.operator as string) || req.body?.operator || "Gate Terminal 1";

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        status: "INVALID",
        message: "Secure QR ticket token is required for verification."
      });
    }

    const cleanToken = token.trim();

    // 1. Check Movie Tickets
    const movieTicket = await prisma.ticket.findFirst({
      where: { OR: [{ qrToken: cleanToken }, { ticketCode: cleanToken }, { id: cleanToken }] },
      include: {
        booking: {
          include: {
            theatre: true,
            show: {
              include: {
                movie: true,
                screen: true
              }
            }
          }
        }
      }
    });

    if (movieTicket) {
      const booking = movieTicket.booking;
      if (booking?.status === "CANCELLED" || booking?.status === "REFUNDED") {
        return res.json({
          success: true,
          status: "CANCELLED",
          message: "This booking has been cancelled or refunded. Entry denied.",
          ticket: {
            ticketCode: movieTicket.ticketCode,
            bookingNumber: booking.bookingNumber,
            title: booking.show?.movie?.title || "Movie Show",
            venue: booking.theatre?.name || "Theatre",
            status: "CANCELLED"
          }
        });
      }

      if (movieTicket.isUsed) {
        return res.json({
          success: true,
          status: "ALREADY_USED",
          message: `Ticket already scanned at ${movieTicket.usedAt ? new Date(movieTicket.usedAt).toLocaleTimeString() : "earlier time"}. Duplicate entry denied.`,
          ticket: {
            ticketCode: movieTicket.ticketCode,
            bookingNumber: booking?.bookingNumber,
            title: booking?.show?.movie?.title || "Movie Show",
            venue: booking?.theatre?.name || "Theatre",
            usedAt: movieTicket.usedAt,
            scannedBy: movieTicket.scannedBy
          }
        });
      }

      // Check show status & eligibility
      if (booking?.show && booking.show.status === "CANCELLED") {
        return res.json({
          success: true,
          status: "CANCELLED",
          message: "The scheduled show for this ticket has been cancelled. Entry denied.",
          ticket: {
            ticketCode: movieTicket.ticketCode,
            bookingNumber: booking.bookingNumber,
            title: booking.show?.movie?.title || "Movie Show",
            venue: booking.theatre?.name || "Theatre",
            status: "CANCELLED"
          }
        });
      }

      // If checkIn requested, mark used atomically to prevent concurrent double check-in
      if (doCheckIn) {
        const updateResult = await prisma.ticket.updateMany({
          where: {
            id: movieTicket.id,
            isUsed: false
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
            scannedBy: operatorName
          }
        });

        if (updateResult.count === 0) {
          // Another scanner terminal checked this ticket in concurrently!
          const refreshedTicket = await prisma.ticket.findUnique({ where: { id: movieTicket.id } });
          return res.json({
            success: true,
            status: "ALREADY_USED",
            message: `Ticket already checked in at ${refreshedTicket?.usedAt ? new Date(refreshedTicket.usedAt).toLocaleTimeString() : "an earlier moment"}. Concurrent duplicate admission blocked.`,
            ticket: {
              ticketCode: movieTicket.ticketCode,
              bookingNumber: booking?.bookingNumber,
              title: booking?.show?.movie?.title || "Movie Show",
              venue: booking?.theatre?.name || "Theatre",
              usedAt: refreshedTicket?.usedAt,
              scannedBy: refreshedTicket?.scannedBy
            }
          });
        }

        logger.info(`Ticket ${movieTicket.ticketCode} safely checked in by ${operatorName}`);
      }

      return res.json({
        success: true,
        status: "VALID",
        message: doCheckIn ? "Gate check-in successful. Welcome to CineVenue!" : "Ticket is valid for admission.",
        checkedIn: doCheckIn,
        ticket: {
          ticketCode: movieTicket.ticketCode,
          bookingNumber: booking?.bookingNumber,
          type: "MOVIE",
          title: booking?.show?.movie?.title || "Movie Show",
          venue: booking?.theatre?.name || "Theatre",
          screen: booking?.show?.screen?.name || "Audi 1",
          showTime: booking?.show?.startTime,
          customerName: booking?.userId || "Valued Patron",
          isUsed: doCheckIn
        }
      });
    }

    // 2. Check Event Registrations
    const eventReg = await prisma.eventRegistration.findFirst({
      where: { OR: [{ passCode: cleanToken }, { id: cleanToken }] }
    });

    if (eventReg) {
      const event = await prisma.event.findUnique({
        where: { id: eventReg.eventId }
      });

      if (eventReg.status === "CANCELLED" || (eventReg as any).status === "REFUNDED") {
        return res.json({
          success: true,
          status: "CANCELLED",
          message: "This event pass has been cancelled. Entry denied.",
          ticket: {
            passCode: eventReg.passCode,
            title: event?.title || "Event",
            venue: event?.venue || "Event Venue",
            status: "CANCELLED"
          }
        });
      }

      return res.json({
        success: true,
        status: "VALID",
        message: "Event admission pass is valid.",
        ticket: {
          passCode: eventReg.passCode,
          type: "EVENT",
          title: event?.title || "Event",
          venue: event?.venue || "Event Venue",
          date: event?.date,
          time: event?.time,
          ticketCount: eventReg.ticketCount,
          customerName: eventReg.userId
        }
      });
    }

    // Strict validation: Reject fabricated and non-existent tokens
    return res.status(404).json({
      success: false,
      status: "INVALID",
      message: "No matching CineVenue ticket or admission pass found in authoritative database. Entry denied."
    });
  } catch (error) {
    next(error);
  }
});

// Alias to ensure both /verify and /validate work consistently
router.all("/validate", async (req: Request, res: Response, next: NextFunction) => {
  // Delegate to /verify handler logic
  req.url = "/verify";
  return router.handle(req, res, next);
});

export default router;
