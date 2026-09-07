import express, { Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import apiV1Router from "./routes";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./shared/logger";
import { checkGlobalSubwebsiteMiddleware } from "./middleware/subwebsiteGate";

export function createApp(): Express {
  const app = express();

  // 1. Basic Security & Correlation Middleware
  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
      credentials: true
    })
  );

  // 2. Request Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. Request Logging in Development
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, { ip: req.ip }, req.id);
    next();
  });

  // 4. Root Health Route
  app.get("/health", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.json({ status: "ok", service: "CineVenue Full Stack Unified Server" });
  });

  // 4B. Strict No-Cache Middleware for settings, health, and admin routes to guarantee global real-time synchronization
  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
      p.includes("/settings") ||
      p.includes("/admin/settings") ||
      p.includes("/health") ||
      p.includes("/ready")
    ) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
      res.setHeader("X-Accel-Expires", "0");
    }
    next();
  });

  // 5. Authoritative Global Sub-Website Gatekeeper
  // Enforces HTTP 503 HTML for direct browser visits & HTTP 503 JSON for subwebsite APIs when disabled
  app.use(checkGlobalSubwebsiteMiddleware);

  // 6. Mount Canonical API Routes under /api/v1 and alias to /api for backward compatibility
  app.use("/api/v1", apiV1Router);

  app.use("/api", apiV1Router);

  // 6. Centralized Error Handler (Must be last middleware)
  app.use(errorHandler);

  return app;
}
