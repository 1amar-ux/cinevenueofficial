import { Request, Response, NextFunction } from "express";
import * as bookingService from "./booking.service";

export async function getAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const availability = await bookingService.getAvailability(req.params.showId);
    res.json(availability);
  } catch (error) {
    next(error);
  }
}

export async function lockSeatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { showId, seats, userId } = req.body;
    const effectiveUserId = userId || (req as any).user?.id || "user_guest";

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "showId and seats array are required" });
    }

    const lockResult = await bookingService.lockSeats(
      showId,
      seats,
      effectiveUserId
    );

    res.json({
      success: true,
      data: lockResult
    });
  } catch (error) {
    next(error);
  }
}

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      userId: req.body.userId || (req as any).user?.id
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function confirmBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.body.userId || (req as any).user?.id || "user_guest";
    const confirmed = await bookingService.confirmBooking(
      req.params.id,
      userId
    );
    res.json(confirmed);
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cancelled = await bookingService.cancelBooking(req.params.id);
    res.json(cancelled);
  } catch (error) {
    next(error);
  }
}

export async function getBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}
