import { Router } from "express";
import {
  createScreenHandler,
  updateScreenHandler,
  getScreensHandler,
  getScreenHandler
} from "./screen.controller";

const router = Router();

// POST /api/theatres/:theatreId/screens
router.post("/theatres/:theatreId/screens", createScreenHandler);

// GET /api/theatres/:theatreId/screens
router.get("/theatres/:theatreId/screens", getScreensHandler);

// GET /api/screens/:id
router.get("/screens/:id", getScreenHandler);

// PATCH /api/screens/:id
router.patch("/screens/:id", updateScreenHandler);

export default router;
