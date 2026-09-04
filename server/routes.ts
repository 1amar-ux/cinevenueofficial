import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import movieRoutes from "./modules/movies/movie.routes";
import theatreRoutes from "./modules/theatres/theatre.routes";
import showRoutes from "./modules/shows/show.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import cinecoinsRoutes from "./modules/cinecoins/cinecoins.routes";
import eventRoutes from "./modules/events/event.routes";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes";
import adminRoutes from "./modules/admin/admin.routes";
import { checkDatabaseConnection } from "./config/database";
import { redis } from "./config/redis";

const router = Router();

// ==========================================
// 1. HEALTH & READINESS PROBES (Cloud Run / K8s / ECS)
// ==========================================
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CineVenue Canonical API",
    version: "2.0.0"
  });
});

router.get("/ready", async (req, res) => {
  const dbOk = await checkDatabaseConnection();
  const redisOk = await redis.isHealthy();

  const isReady = dbOk && redisOk;
  return res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "degraded",
    checks: {
      database: dbOk ? "connected" : "alert",
      cache: redisOk ? "connected" : "alert"
    }
  });
});

// ==========================================
// 2. DOMAIN MODULE ROUTERS (/api/v1)
// ==========================================
router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/theatres", theatreRoutes);
router.use("/shows", showRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/cinecoins", cinecoinsRoutes);
router.use("/events", eventRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/admin", adminRoutes);

// ==========================================
// 3. PUBLIC APP SETTINGS ROUTE (/api/v1/settings/app)
// ==========================================
router.get("/settings/app", async (req, res, next) => {
  try {
    const { getGlobalAppSettings } = await import("./middleware/maintenance");
    const settings = await getGlobalAppSettings();
    return res.json({
      success: true,
      data: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceTitle: settings.maintenanceTitle,
        maintenanceMessage: settings.maintenanceMessage,
        maintenanceCountdownEnabled: settings.maintenanceCountdownEnabled,
        maintenanceEndTime: settings.maintenanceEndTime,
        globalSubwebsiteEnabled: settings.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: settings.subwebsiteMaintenanceMessage,
        serviceControls: settings.serviceControls
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/settings/subwebsite", async (req, res, next) => {
  try {
    const { getGlobalAppSettings } = await import("./middleware/maintenance");
    const settings = await getGlobalAppSettings();
    return res.json({
      success: true,
      data: {
        globalSubwebsiteEnabled: settings.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: settings.subwebsiteMaintenanceMessage
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
