import { Router } from "express";
import {
  getAvailabilityHandler,
  lockSeatsHandler,
  createBookingHandler,
  confirmBookingHandler,
  cancelBookingHandler,
  getBookingHandler
} from "./booking.controller";

const router = Router();

// GET /api/shows/:showId/availability
router.get("/shows/:showId/availability", getAvailabilityHandler);

// POST /api/bookings/lock
router.post("/bookings/lock", lockSeatsHandler);

// POST /api/bookings
router.post("/bookings", createBookingHandler);

// POST /api/bookings/:id/confirm
router.post("/bookings/:id/confirm", confirmBookingHandler);

// POST /api/bookings/:id/cancel
router.post("/bookings/:id/cancel", cancelBookingHandler);

// GET /api/bookings/:id
router.get("/bookings/:id", getBookingHandler);

export default router;
