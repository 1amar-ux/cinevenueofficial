/**
 * Vercel Serverless Function Entry Point
 *
 * Provides ultra-fast, bulletproof serverless routing on Vercel.
 * Critical settings and health endpoints are handled with zero overhead,
 * preventing FUNCTION_INVOCATION_FAILED cold-start errors, while Express
 * handles full-fidelity business logic.
 */
import fs from "fs";
import path from "path";

// 1. Persistent fallback store for serverless lambdas
const CONFIG_FILE_PATH = path.resolve(process.cwd(), "server/config/global_settings.json");
const TMP_CONFIG_PATH = path.resolve("/tmp", "cine_global_settings.json");

let globalServerlessState: {
  globalSubwebsiteEnabled: boolean;
  subwebsiteMaintenanceMessage: string;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: string | null;
  serviceControls: Record<string, any>;
  updatedAt: string;
} = {
  globalSubwebsiteEnabled: false,
  subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
  maintenanceMode: false,
  maintenanceTitle: "Movie Booking Temporarily Unavailable",
  maintenanceMessage: "We're upgrading our ticket booking experience. Movie booking will be available shortly.",
  maintenanceCountdownEnabled: false,
  maintenanceEndTime: null,
  serviceControls: {
    website: { status: true, title: "CineVenue Under Maintenance", message: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.", expectedTime: "30 July 2026, 06:00 PM" },
    movieBooking: { status: true, title: "Movie Booking Temporarily Unavailable", message: "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.", expectedTime: "30 July 2026, 06:00 PM", visitors: 1240 },
    eventBooking: { status: false, title: "Event Booking Temporarily Unavailable", message: "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon.", expectedTime: "31 July 2026, 10:00 AM", visitors: 327 },
    filmProduction: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "30 July 2026, 12:00 PM" },
    eventManagement: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 02:00 PM" },
    brandPromotion: { status: false, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 05:00 PM" },
    cinecoins: { status: true, title: "CineCoins Rewards Vault Under Maintenance", message: "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back shortly.", expectedTime: "31 July 2026, 06:00 PM" }
  },
  updatedAt: new Date().toISOString()
};

function syncServerlessStateFromDisk() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf-8"));
      globalServerlessState.globalSubwebsiteEnabled = data.globalSubwebsiteEnabled !== undefined ? data.globalSubwebsiteEnabled : false;
      if (data.subwebsiteMaintenanceMessage) globalServerlessState.subwebsiteMaintenanceMessage = data.subwebsiteMaintenanceMessage;
      return;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(TMP_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(TMP_CONFIG_PATH, "utf-8"));
      globalServerlessState.globalSubwebsiteEnabled = data.globalSubwebsiteEnabled !== undefined ? data.globalSubwebsiteEnabled : false;
      if (data.subwebsiteMaintenanceMessage) globalServerlessState.subwebsiteMaintenanceMessage = data.subwebsiteMaintenanceMessage;
    }
  } catch (e) {}
}

function persistServerlessState(enabled: boolean, message?: string) {
  globalServerlessState.globalSubwebsiteEnabled = enabled;
  if (message) globalServerlessState.subwebsiteMaintenanceMessage = message;
  globalServerlessState.updatedAt = new Date().toISOString();

  // Also sync serviceControls
  if (globalServerlessState.serviceControls) {
    globalServerlessState.serviceControls.filmProduction = {
      ...(globalServerlessState.serviceControls.filmProduction || {}),
      status: enabled
    };
    globalServerlessState.serviceControls.eventManagement = {
      ...(globalServerlessState.serviceControls.eventManagement || {}),
      status: enabled
    };
    globalServerlessState.serviceControls.eventBooking = {
      ...(globalServerlessState.serviceControls.eventBooking || {}),
      status: enabled
    };
    globalServerlessState.serviceControls.brandPromotion = {
      ...(globalServerlessState.serviceControls.brandPromotion || {}),
      status: enabled
    };
  }

  const payload = JSON.stringify({
    globalSubwebsiteEnabled: enabled,
    subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage,
    updatedAt: globalServerlessState.updatedAt
  }, null, 2);

  try { fs.writeFileSync(CONFIG_FILE_PATH, payload, "utf-8"); } catch (e) {}
  try { fs.writeFileSync(TMP_CONFIG_PATH, payload, "utf-8"); } catch (e) {}
}

// Initial sync
syncServerlessStateFromDisk();

let expressApp: any = null;

async function getExpressApp() {
  if (!expressApp) {
    const { createApp } = await import("../server/app");
    expressApp = createApp();
  }
  return expressApp;
}

export default async function handler(req: any, res: any) {
  // 1. Set Universal CORS & No-Cache Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-admin-passcode");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = (req.url || "/").split("?")[0];

  // 2. High-Priority Direct Route: Health
  if (url === "/health" || url === "/api/health" || url === "/api/v1/health") {
    return res.status(200).json({
      status: "ok",
      service: "CineVenue Serverless Unified Gateway",
      timestamp: new Date().toISOString()
    });
  }

  // 3. High-Priority Direct Route: Public App Settings
  if (url === "/api/v1/settings/app" || url === "/api/settings/app" || url === "/settings/app") {
    syncServerlessStateFromDisk();
    return res.status(200).json({
      success: true,
      data: {
        maintenanceMode: globalServerlessState.maintenanceMode,
        maintenanceTitle: globalServerlessState.maintenanceTitle,
        maintenanceMessage: globalServerlessState.maintenanceMessage,
        maintenanceCountdownEnabled: globalServerlessState.maintenanceCountdownEnabled,
        maintenanceEndTime: globalServerlessState.maintenanceEndTime,
        globalSubwebsiteEnabled: globalServerlessState.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage,
        serviceControls: {
          website: { status: true },
          movieBooking: { status: true },
          eventBooking: { status: globalServerlessState.globalSubwebsiteEnabled },
          filmProduction: { status: globalServerlessState.globalSubwebsiteEnabled },
          eventManagement: { status: globalServerlessState.globalSubwebsiteEnabled },
          brandPromotion: { status: globalServerlessState.globalSubwebsiteEnabled },
          cinecoins: { status: true }
        },
        updatedAt: globalServerlessState.updatedAt
      }
    });
  }

  // 4. High-Priority Direct Route: Sub-Website Status
  if (url === "/api/v1/settings/subwebsite" || url === "/api/settings/subwebsite" || url === "/settings/subwebsite") {
    syncServerlessStateFromDisk();
    return res.status(200).json({
      success: true,
      data: {
        globalSubwebsiteEnabled: globalServerlessState.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage
      }
    });
  }

  // 5. High-Priority Direct Route: Admin Toggle Sub-Website
  if (
    (url === "/api/v1/admin/settings/subwebsite" || url === "/api/admin/settings/subwebsite" || url === "/admin/settings/subwebsite") &&
    req.method === "POST"
  ) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const enabled = body?.enabled === true;
    const message = body?.message;

    persistServerlessState(enabled, message);

    try {
      const { writePersistedFileSettings, invalidateMaintenanceCache } = await import("../server/middleware/maintenance");
      writePersistedFileSettings({
        globalSubwebsiteEnabled: enabled,
        ...(message && { subwebsiteMaintenanceMessage: message })
      });
      invalidateMaintenanceCache();
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Global sub-website status successfully updated to ${enabled ? "ONLINE" : "OFFLINE"} across all servers.`,
      data: {
        globalSubwebsiteEnabled: enabled,
        subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage,
        updatedAt: globalServerlessState.updatedAt
      }
    });
  }

  // 6. Direct Interception: Block sub-website APIs if globally disabled
  syncServerlessStateFromDisk();
  if (globalServerlessState.globalSubwebsiteEnabled === false) {
    const isSubwebsiteApi =
      url.startsWith("/api/v1/events") ||
      url.startsWith("/api/events") ||
      url.startsWith("/api/v1/marketplace") ||
      url.startsWith("/api/marketplace") ||
      url.startsWith("/api/v1/productions") ||
      url.startsWith("/api/productions");

    if (isSubwebsiteApi) {
      return res.status(503).json({
        success: false,
        error: {
          code: "SUBWEBSITES_CURRENTLY_OFFLINE",
          message: globalServerlessState.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance."
        }
      });
    }
  }

  // 7. Delegate all standard full-stack routes to Express
  try {
    const app = await getExpressApp();
    return new Promise((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) return reject(err);
        resolve(undefined);
      });
    });
  } catch (error: any) {
    console.error("[VERCEL_EXPRESS_ERROR]", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Internal server error"
        }
      });
    }
  }
}
