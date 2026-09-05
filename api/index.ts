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
  const readFromPath = (p: string) => {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (typeof data.globalSubwebsiteEnabled === "boolean") {
          globalServerlessState.globalSubwebsiteEnabled = data.globalSubwebsiteEnabled;
        }
        if (data.subwebsiteMaintenanceMessage) {
          globalServerlessState.subwebsiteMaintenanceMessage = data.subwebsiteMaintenanceMessage;
        }
        if (typeof data.maintenanceMode === "boolean") {
          globalServerlessState.maintenanceMode = data.maintenanceMode;
        }
        if (data.maintenanceTitle) globalServerlessState.maintenanceTitle = data.maintenanceTitle;
        if (data.maintenanceMessage) globalServerlessState.maintenanceMessage = data.maintenanceMessage;
        if (typeof data.maintenanceCountdownEnabled === "boolean") {
          globalServerlessState.maintenanceCountdownEnabled = data.maintenanceCountdownEnabled;
        }
        if (data.maintenanceEndTime !== undefined) globalServerlessState.maintenanceEndTime = data.maintenanceEndTime;
        if (data.serviceControls && typeof data.serviceControls === "object") {
          globalServerlessState.serviceControls = {
            ...globalServerlessState.serviceControls,
            ...data.serviceControls
          };
        }
        return true;
      }
    } catch (e) {}
    return false;
  };

  if (!readFromPath(CONFIG_FILE_PATH)) {
    readFromPath(TMP_CONFIG_PATH);
  }
}

function persistServerlessState(enabled: boolean, message?: string) {
  globalServerlessState.globalSubwebsiteEnabled = enabled;
  if (message) globalServerlessState.subwebsiteMaintenanceMessage = message;
  globalServerlessState.updatedAt = new Date().toISOString();

  // Also sync subwebsite serviceControls
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

  const payload = JSON.stringify(globalServerlessState, null, 2);

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
        serviceControls: globalServerlessState.serviceControls,
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
      writePersistedFileSettings(globalServerlessState);
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

  // 5B. High-Priority Direct Route: Admin Update Global Settings (Movie Booking, CineCoins, Platform controls)
  if (
    (url === "/api/v1/admin/settings/global" || url === "/api/admin/settings/global" || url === "/admin/settings/global") &&
    req.method === "POST"
  ) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    if (typeof body.maintenanceMode === "boolean") {
      globalServerlessState.maintenanceMode = body.maintenanceMode;
    }
    if (body.maintenanceTitle !== undefined) globalServerlessState.maintenanceTitle = body.maintenanceTitle;
    if (body.maintenanceMessage !== undefined) globalServerlessState.maintenanceMessage = body.maintenanceMessage;
    if (typeof body.maintenanceCountdownEnabled === "boolean") {
      globalServerlessState.maintenanceCountdownEnabled = body.maintenanceCountdownEnabled;
    }
    if (body.maintenanceEndTime !== undefined) globalServerlessState.maintenanceEndTime = body.maintenanceEndTime;
    if (typeof body.globalSubwebsiteEnabled === "boolean") {
      globalServerlessState.globalSubwebsiteEnabled = body.globalSubwebsiteEnabled;
    }
    if (body.subwebsiteMaintenanceMessage !== undefined) {
      globalServerlessState.subwebsiteMaintenanceMessage = body.subwebsiteMaintenanceMessage;
    }
    if (body.serviceControls && typeof body.serviceControls === "object") {
      globalServerlessState.serviceControls = {
        ...globalServerlessState.serviceControls,
        ...body.serviceControls
      };
    }
    globalServerlessState.updatedAt = new Date().toISOString();

    const serialized = JSON.stringify(globalServerlessState, null, 2);
    try { fs.writeFileSync(CONFIG_FILE_PATH, serialized, "utf-8"); } catch (e) {}
    try { fs.writeFileSync(TMP_CONFIG_PATH, serialized, "utf-8"); } catch (e) {}

    try {
      const { writePersistedFileSettings, invalidateMaintenanceCache } = await import("../server/middleware/maintenance");
      writePersistedFileSettings(globalServerlessState);
      invalidateMaintenanceCache();
    } catch (e) {}

    // Resilient async DB update if available
    try {
      const { prisma } = await import("../server/config/database");
      prisma.appSettings.upsert({
        where: { id: "global_default" },
        update: {
          ...(typeof body.maintenanceMode === "boolean" && { maintenanceMode: body.maintenanceMode }),
          ...(body.maintenanceTitle !== undefined && { maintenanceTitle: body.maintenanceTitle }),
          ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage }),
          ...(typeof body.maintenanceCountdownEnabled === "boolean" && { maintenanceCountdownEnabled: body.maintenanceCountdownEnabled }),
          ...(typeof body.globalSubwebsiteEnabled === "boolean" && { globalSubwebsiteEnabled: body.globalSubwebsiteEnabled }),
          ...(body.subwebsiteMaintenanceMessage !== undefined && { subwebsiteMaintenanceMessage: body.subwebsiteMaintenanceMessage }),
          ...(body.serviceControls !== undefined && { serviceControls: body.serviceControls }),
          updatedAt: new Date()
        },
        create: {
          id: "global_default",
          maintenanceMode: !!body.maintenanceMode,
          globalSubwebsiteEnabled: body.globalSubwebsiteEnabled !== false,
          serviceControls: body.serviceControls || {},
          updatedBy: "admin"
        }
      }).catch(() => {});
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: "Global settings successfully updated across all services.",
      data: {
        settings: {
          maintenanceMode: globalServerlessState.maintenanceMode,
          maintenanceTitle: globalServerlessState.maintenanceTitle,
          maintenanceMessage: globalServerlessState.maintenanceMessage,
          maintenanceCountdownEnabled: globalServerlessState.maintenanceCountdownEnabled,
          maintenanceEndTime: globalServerlessState.maintenanceEndTime,
          globalSubwebsiteEnabled: globalServerlessState.globalSubwebsiteEnabled,
          subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage,
          serviceControls: globalServerlessState.serviceControls,
          updatedAt: globalServerlessState.updatedAt
        }
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
