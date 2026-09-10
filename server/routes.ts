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
import filmProductionRoutes from "./modules/marketplace/filmProduction.routes";
import adminRoutes from "./modules/admin/admin.routes";
import posRoutes from "./modules/pos/pos.routes";
import { advertisingPublicRouter, adminAdvertisingRouter } from "./modules/advertising/advertising.routes";
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
router.use("/film-production", filmProductionRoutes);
router.use("/marketplace", filmProductionRoutes);
router.use("/advertising", advertisingPublicRouter);
router.use("/admin/advertising", adminAdvertisingRouter);
router.use("/admin", adminRoutes);
router.use("/", posRoutes); // Mounts /admin/integrations and /webhooks/pos

// ==========================================
// 3. PUBLIC APP SETTINGS & CANONICAL PLATFORM CONFIG ROUTES
// ==========================================
router.get(["/public/platform-config", "/public/maintenance-status"], async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

    const { getGlobalAppSettings } = await import("./middleware/maintenance");
    const settings = await getGlobalAppSettings();
    const sc = (settings.serviceControls as any) || {};

    const isGlobalMaint = settings.maintenanceMode === true || sc.website?.status === false;

    return res.json({
      success: true,
      globalMaintenance: isGlobalMaint,
      modules: {
        movieBooking: {
          maintenance: isGlobalMaint || sc.movieBooking?.status === false || settings.maintenanceMode === true,
          title: sc.movieBooking?.title || settings.maintenanceTitle,
          message: sc.movieBooking?.message || settings.maintenanceMessage
        },
        cineCoins: {
          maintenance: isGlobalMaint || sc.cinecoins?.status === false || sc.cineCoinsLoyalty?.status === false,
          title: sc.cinecoins?.title || "CineCoins Rewards Vault Under Maintenance",
          message: sc.cinecoins?.message || "CineCoins operations are undergoing scheduled updates."
        },
        events: {
          maintenance: isGlobalMaint || sc.eventBooking?.status === false,
          title: sc.eventBooking?.title || "Event Booking Temporarily Unavailable",
          message: sc.eventBooking?.message || "Concerts, celebrity shows and live events are currently unavailable."
        },
        filmProduction: {
          maintenance: isGlobalMaint || sc.filmProduction?.status === false || settings.globalSubwebsiteEnabled === false,
          title: sc.filmProduction?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.filmProduction?.message || settings.subwebsiteMaintenanceMessage
        },
        eventManagement: {
          maintenance: isGlobalMaint || sc.eventManagement?.status === false || settings.globalSubwebsiteEnabled === false,
          title: sc.eventManagement?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.eventManagement?.message || settings.subwebsiteMaintenanceMessage
        },
        brandPromotion: {
          maintenance: isGlobalMaint || sc.brandPromotion?.status === false || settings.globalSubwebsiteEnabled === false,
          title: sc.brandPromotion?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.brandPromotion?.message || settings.subwebsiteMaintenanceMessage
        }
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.get("/settings/app", async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

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
        serviceControls: settings.serviceControls,
        updatedAt: (settings as any).updatedAt || new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/settings/subwebsite", async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

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
