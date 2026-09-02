import { Router, Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";
import { authenticate } from "../../middleware/auth";
import { prisma } from "../../config/database";

const router = Router();

// 1. Lock Seats
router.post("/lock-seats", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showId, seatIds } = req.body;
    const result = await bookingService.lockSeats(showId, seatIds, req.user!.userId);
    return res.json({
      success: true,
      message: "Seats locked for 5 minutes",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 2. Server-side Calculate Price Breakdown
router.post("/calculate-price", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showId, seatIds, couponCode } = req.body;
    const result = await bookingService.calculateBookingPrice(showId, seatIds, couponCode);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 3. Create Pending Booking
router.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showId, seatIds, couponCode } = req.body;
    const result = await bookingService.createPendingBooking({
      showId,
      showSeatIds: seatIds,
      userId: req.user!.userId,
      couponCode
    });
    return res.status(201).json({
      success: true,
      message: "Pending booking created",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 4. Get User's Bookings
router.get("/my", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      include: {
        show: {
          include: { movie: true, theatre: true, screen: true }
        },
        items: {
          include: { showSeat: { include: { seat: true } } }
        },
        payment: true,
        ticket: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
