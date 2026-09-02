import express from "express";
import cors from "cors";

import theatreRoutes from "./modules/theatres/theatre.routes";
import screenRoutes from "./modules/screens/screen.routes";
import seatRoutes from "./modules/seats/seat.routes";
import showRoutes from "./modules/shows/show.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import settlementRoutes from "./modules/settlements/settlement.routes";
import theatreBankRoutes from "./modules/theatres/theatreBank.routes";
import { errorHandler } from "./middleware/errorHandler";
import { integrationManager } from "./modules/integrations/IntegrationManager";

export function createCinevenueApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health Endpoint
  app.get("/health", (req, res) => {
    res.json({
      service: "CINEVENUE API",
      status: "OK",
      timestamp: new Date().toISOString()
    });
  });

  // Integrations / Adapters Endpoint
  app.get("/api/integrations/adapters", (req, res) => {
    const adapters = integrationManager.getAllAdapters().map(a => ({
      providerName: a.providerName
    }));
    res.json({
      success: true,
      adapters
    });
  });

  // Mount Core Modular REST APIs under /api
  app.use("/api", theatreRoutes);
  app.use("/api", theatreBankRoutes);
  app.use("/api", screenRoutes);
  app.use("/api", seatRoutes);
  app.use("/api", showRoutes);
  app.use("/api", bookingRoutes);
  app.use("/api", settlementRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createCinevenueApp();
