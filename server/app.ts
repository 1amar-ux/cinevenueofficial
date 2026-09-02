import express, { Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import apiV1Router from "./routes";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./shared/logger";

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
    res.json({ status: "ok", service: "CineVenue Full Stack Unified Server" });
  });

  // 5. Mount Canonical API Routes under /api/v1 and alias to /api for backward compatibility
  app.use("/api/v1", apiV1Router);
  app.use("/api", apiV1Router);

  // 6. Centralized Error Handler (Must be last middleware)
  app.use(errorHandler);

  return app;
}
