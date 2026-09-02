import http from "http";
import path from "path";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma, checkDatabaseConnection } from "./config/database";
import { logger } from "./shared/logger";

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // In development, attach Vite middleware cleanly
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
      logger.info("Vite development server middleware attached successfully");
    } catch (viteError: any) {
      logger.warn(`Vite middleware initialization note: ${viteError.message}`);
    }
  } else {
    // In production, serve static files from dist
    const distPath = path.resolve(process.cwd(), "dist");
    const express = (await import("express")).default;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Pre-flight database check
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    logger.info("Database connectivity confirmed");
  } else {
    logger.warn("Database connection check completed with warnings; operating in resilient mode.");
  }

  // Start HTTP Listener
  server.listen(env.PORT, () => {
    logger.info(`🚀 CineVenue Unified Server running on http://localhost:${env.PORT}`);
    logger.info(`📡 API v1 Base: http://localhost:${env.PORT}/api/v1`);
    logger.info(`🩺 Health Check: http://localhost:${env.PORT}/health`);
  });

  // ==========================================
  // GRACEFUL SHUTDOWN (SIGTERM / SIGINT)
  // ==========================================
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await prisma.$disconnect();
        logger.info("Database connection closed.");
      } catch (err: any) {
        logger.error(`Error closing database connection: ${err.message}`);
      }
      process.exit(0);
    });

    // Force close after 10s if hanging
    setTimeout(() => {
      logger.error("Forced termination after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error(`Fatal server bootstrap failure: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
