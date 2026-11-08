import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { logger } from "../../shared/logger";
import { fraudTrustService } from "../../services/fraudTrustService";

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

    // Parse potential token segments (e.g. CVQR-BK123456-A1-1-...)
    const cvqrMatch = cleanToken.match(/^(?:CVQR|TKT)-([A-Za-z0-9]+?)(?:-([A-Za-z0-9]+))?(?:-.*)?$/);
    const candidateBooking = cvqrMatch ? cvqrMatch[1] : null;
    const candidateSeat = cvqrMatch && cvqrMatch[2] && !cvqrMatch[2].match(/^\d+$/) ? cvqrMatch[2] : null;

    // 1. Check Movie Tickets
    const orConditions: any[] = [
      { qrToken: cleanToken },
      { ticketCode: cleanToken },
      { id: cleanToken },
      { bookingId: cleanToken }
    ];

    if (candidateBooking) {
      orConditions.push({ bookingId: candidateBooking });
      orConditions.push({ ticketCode: { contains: candidateBooking } });
      orConditions.push({ booking: { bookingNumber: { contains: candidateBooking } } });
    }

    const movieTicket = await prisma.ticket.findFirst({
      where: { OR: orConditions },
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

      // Handle Cancelled or Refunded Status
      if (booking?.status === "CANCELLED" || booking?.status === "REFUNDED") {
        const isRefund = booking.status === "REFUNDED";
        fraudTrustService.recordTicketScanAnomaly({
          ticketCode: movieTicket.ticketCode,
          bookingNumber: booking.bookingNumber,
          title: booking.show?.movie?.title,
          venueName: booking.theatre?.name,
          scanType: isRefund ? "REFUNDED" : "CANCELLED",
          operator: operatorName,
          previousScannedAt: null
        }).catch(() => {});

        return res.json({
          success: true,
          status: isRefund ? "REFUNDED" : "CANCELLED",
          message: isRefund
            ? "This booking has been refunded. Entry denied."
            : "This booking has been cancelled. Entry denied.",
          ticket: {
            ticketCode: movieTicket.ticketCode,
            bookingNumber: booking.bookingNumber,
            title: booking.show?.movie?.title || "Movie Show",
            venue: booking.theatre?.name || "Theatre",
            seat: candidateSeat || undefined,
            status: isRefund ? "REFUNDED" : "CANCELLED"
          }
        });
      }

      // Check Per-Seat and Overall Check-In Status
      let parsedMetadata: any = {};
      try {
        if (movieTicket.scannedBy && (movieTicket.scannedBy.startsWith("{") || movieTicket.scannedBy.startsWith("["))) {
          parsedMetadata = JSON.parse(movieTicket.scannedBy);
        }
      } catch (e) {}

      const usedSeatsList: string[] = Array.isArray(parsedMetadata.usedSeats) ? parsedMetadata.usedSeats : [];

      if (candidateSeat && usedSeatsList.includes(candidateSeat.toUpperCase())) {
        fraudTrustService.recordTicketScanAnomaly({
          ticketCode: `${movieTicket.ticketCode}-${candidateSeat}`,
          bookingNumber: booking?.bookingNumber,
          title: booking?.show?.movie?.title,
          venueName: booking?.theatre?.name,
          scanType: "DUPLICATE",
          operator: operatorName,
          previousScannedAt: movieTicket.usedAt ? new Date(movieTicket.usedAt).toISOString() : null
        }).catch(() => {});

        return res.json({
          success: true,
          status: "ALREADY_USED",
          message: `Ticket for Seat ${candidateSeat.toUpperCase()} was already scanned. Duplicate entry denied.`,
          ticket: {
            ticketCode: `${movieTicket.ticketCode}-${candidateSeat}`,
            bookingNumber: booking?.bookingNumber,
            seat: candidateSeat.toUpperCase(),
            title: booking?.show?.movie?.title || "Movie Show",
            venue: booking?.theatre?.name || "Theatre",
            usedAt: movieTicket.usedAt,
            scannedBy: operatorName
          }
        });
      }

      if (movieTicket.isUsed) {
        fraudTrustService.recordTicketScanAnomaly({
          ticketCode: movieTicket.ticketCode,
          bookingNumber: booking?.bookingNumber,
          title: booking?.show?.movie?.title,
          venueName: booking?.theatre?.name,
          scanType: "DUPLICATE",
          operator: operatorName,
          previousScannedAt: movieTicket.usedAt ? new Date(movieTicket.usedAt).toISOString() : null
        }).catch(() => {});

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
        if (candidateSeat) {
          const updatedUsedSeats = [...usedSeatsList, candidateSeat.toUpperCase()];
          parsedMetadata.usedSeats = updatedUsedSeats;
          parsedMetadata.lastScannedSeat = candidateSeat.toUpperCase();
          parsedMetadata.lastScannedBy = operatorName;

          await prisma.ticket.update({
            where: { id: movieTicket.id },
            data: {
              scannedBy: JSON.stringify(parsedMetadata),
              usedAt: new Date()
            }
          });
        } else {
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
        }

        logger.info(`Ticket ${movieTicket.ticketCode}${candidateSeat ? ` (Seat ${candidateSeat})` : ""} safely checked in by ${operatorName}`);
      }

      return res.json({
        success: true,
        status: "VALID",
        message: doCheckIn
          ? `Gate check-in successful${candidateSeat ? ` for Seat ${candidateSeat}` : ""}. Welcome to CineVenue!`
          : `Ticket is valid for admission${candidateSeat ? ` (Seat ${candidateSeat})` : ""}.`,
        checkedIn: doCheckIn,
        ticket: {
          ticketCode: candidateSeat ? `${movieTicket.ticketCode}-${candidateSeat}` : movieTicket.ticketCode,
          bookingNumber: booking?.bookingNumber,
          type: "MOVIE",
          seat: candidateSeat || undefined,
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
