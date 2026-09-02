import { Router } from "express";
import {
  createTheatreHandler,
  updateTheatreHandler,
  getTheatreHandler,
  getTheatresHandler,
  updateTheatreStatusHandler
} from "./theatre.controller";

const router = Router();

// POST /api/theatres
router.post("/theatres", createTheatreHandler);

// GET /api/theatres
router.get("/theatres", getTheatresHandler);

// GET /api/theatres/:id
router.get("/theatres/:id", getTheatreHandler);

// PATCH /api/theatres/:id
router.patch("/theatres/:id", updateTheatreHandler);

// PATCH /api/theatres/:id/status
router.patch("/theatres/:id/status", updateTheatreStatusHandler);

export default router;
