import { Router } from "express";
import {
  createSeatsHandler,
  updateSeatHandler,
  blockSeatHandler,
  getSeatLayoutHandler
} from "./seat.controller";

const router = Router();

// POST /api/screens/:screenId/seats
router.post("/screens/:screenId/seats", createSeatsHandler);

// POST /api/screens/:screenId/layout
router.post("/screens/:screenId/layout", createSeatsHandler);

// GET /api/screens/:screenId/layout
router.get("/screens/:screenId/layout", getSeatLayoutHandler);

// PATCH /api/seats/:id
router.patch("/seats/:id", updateSeatHandler);

// PATCH /api/seats/:id/block
router.patch("/seats/:id/block", blockSeatHandler);

export default router;
