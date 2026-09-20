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
  const allowedOrigins = [
    "https://cinevenue.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "capacitor://localhost",
    "https://localhost",
    "http://localhost"
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGIN === "*") return callback(null, true);
        const configured = env.CORS_ORIGIN.split(",").map((s) => s.trim());
        if (
          configured.includes(origin) ||
          allowedOrigins.includes(origin) ||
          origin.startsWith("capacitor://") ||
          origin.startsWith("http://localhost") ||
          origin.startsWith("https://localhost")
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true
    })
  );

  // 2. Request Parsers
  app.use((req, res, next) => {
    if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
      (req as any)._body = true;
    }
    next();
  });
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

  // 4A. IAB Authoritative ads.txt Route
  app.get("/ads.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(
      `# CineVenue Authoritative ads.txt\n` +
      `# Authorized Digital Sellers file for CineVenue Entertainment Portal\n` +
      `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n`
    );
  });

  // 4B. Strict No-Cache Middleware for all API and admin routes to guarantee global real-time synchronization
  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
      p.startsWith("/api") ||
      p.includes("/settings") ||
      p.includes("/admin") ||
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
