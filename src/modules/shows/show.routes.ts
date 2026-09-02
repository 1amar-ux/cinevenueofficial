import { Router } from "express";
import {
  createShowHandler,
  updateShowHandler,
  getShowsHandler,
  getShowHandler
} from "./show.controller";

const router = Router();

// POST /api/shows
router.post("/shows", createShowHandler);

// GET /api/shows
router.get("/shows", getShowsHandler);

// GET /api/shows/:id
router.get("/shows/:id", getShowHandler);

// PATCH /api/shows/:id
router.patch("/shows/:id", updateShowHandler);

export default router;
