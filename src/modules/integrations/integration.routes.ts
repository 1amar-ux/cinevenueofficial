import { Router } from "express";
import {
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  testConnection,
  syncTheatre,
  syncScreens,
  syncSeats,
  syncMovies,
  syncShowtimes,
  getShowSeatAvailability,
  holdSeats,
  createBooking,
  cancelBooking,
  runTest,
  getLogs,
  handleWebhook
} from "./integration.controller";

const router = Router();

// Admin POS Integrations CRUD
router.get("/admin/integrations", getIntegrations);
router.post("/admin/integrations", createIntegration);
router.get("/admin/integrations/:id", getIntegration);
router.put("/admin/integrations/:id", updateIntegration);
router.post("/admin/integrations/:id/test", testConnection);
router.get("/admin/integrations/:id/logs", getLogs);
router.post("/admin/integrations/:id/full-test", runTest);

// POS Master Data Sync Endpoints
router.post("/admin/pos/test-connection", testConnection);
router.post("/admin/pos/sync/theatre", syncTheatre);
router.post("/admin/pos/sync/screens", syncScreens);
router.post("/admin/pos/sync/seats", syncSeats);
router.post("/admin/pos/sync/movies", syncMovies);
router.post("/admin/pos/sync/showtimes", syncShowtimes);

// Real-time Show Availability & Seat Hold Hooks
router.get("/shows/:showId/availability", getShowSeatAvailability);
router.post("/bookings/hold-seats", holdSeats);
router.post("/bookings/create-pos-booking", createBooking);
router.post("/bookings/:bookingId/cancel-pos", cancelBooking);

// Inbound POS Webhooks
router.post("/webhooks/integrations/:id", handleWebhook);

export default router;
