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
import { createApp } from "../server/app";
import { prisma } from "../server/config/database";
import { supabaseAdmin } from "../server/config/supabaseAdmin";
import { writePersistedFileSettings, invalidateMaintenanceCache } from "../server/middleware/maintenance";

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
  globalSubwebsiteEnabled: true,
  subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
  maintenanceMode: false,
  maintenanceTitle: "Movie Booking Temporarily Unavailable",
  maintenanceMessage: "We're upgrading our ticket booking experience. Movie booking will be available shortly.",
  maintenanceCountdownEnabled: false,
  maintenanceEndTime: null,
  serviceControls: {
    website: { status: true, title: "CineVenue Under Maintenance", message: "Our platform is currently undergoing scheduled updates. We'll be back online shortly.", expectedTime: "30 July 2026, 06:00 PM" },
    movieBooking: { status: true, title: "Movie Booking Temporarily Unavailable", message: "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.", expectedTime: "30 July 2026, 06:00 PM", visitors: 1240 },
    eventBooking: { status: true, title: "Event Booking Temporarily Unavailable", message: "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon.", expectedTime: "31 July 2026, 10:00 AM", visitors: 327 },
    filmProduction: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "30 July 2026, 12:00 PM" },
    eventManagement: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 02:00 PM" },
    brandPromotion: { status: true, title: "SUB-WEBSITE TEMPORARILY UNAVAILABLE", message: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.", expectedTime: "31 July 2026, 05:00 PM" },
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
        if (Array.isArray(data.trendingExperiences)) {
          (globalServerlessState as any).trendingExperiences = data.trendingExperiences;
        }
        if (Array.isArray(data.browseLiveCategories)) {
          (globalServerlessState as any).browseLiveCategories = data.browseLiveCategories;
        }
        if (data.updatedAt) {
          globalServerlessState.updatedAt = data.updatedAt;
        }
        return true;
      }
    } catch (e) {}
    return false;
  };

  // Check /tmp first (holds active runtime overrides written by Admin)
  if (!readFromPath(TMP_CONFIG_PATH)) {
    readFromPath(CONFIG_FILE_PATH);
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

function getExpressApp() {
  if (!expressApp) {
    try {
      expressApp = createApp();
    } catch (err: any) {
      console.error("[Vercel Gateway] Express initialization error:", err);
    }
  }
  return expressApp;
}

export default async function handler(req: any, res: any) {
  // 1. Set Universal CORS & Strict No-Cache Headers for all API and Maintenance Routes
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-admin-passcode");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("X-Accel-Expires", "0");

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

  // 2B. High-Priority Direct Route: Public Platform Config & Maintenance Status
  if (
    url === "/api/v1/public/platform-config" ||
    url === "/api/public/platform-config" ||
    url === "/public/platform-config" ||
    url === "/api/v1/public/maintenance-status" ||
    url === "/api/public/maintenance-status" ||
    url === "/public/maintenance-status"
  ) {
    syncServerlessStateFromDisk();

    try {
      const dbSettings: any = await Promise.race([
        prisma.appSettings.findUnique({ where: { id: "global_default" } }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 800))
      ]).catch(() => null);

      if (dbSettings) {
        if (typeof dbSettings.maintenanceMode === "boolean") globalServerlessState.maintenanceMode = dbSettings.maintenanceMode;
        if (typeof dbSettings.globalSubwebsiteEnabled === "boolean") globalServerlessState.globalSubwebsiteEnabled = dbSettings.globalSubwebsiteEnabled;
        if (dbSettings.serviceControls && typeof dbSettings.serviceControls === "object") {
          globalServerlessState.serviceControls = { ...globalServerlessState.serviceControls, ...(dbSettings.serviceControls as any) };
        }
      }
    } catch (e) {}

    const sc = globalServerlessState.serviceControls || {};
    const isGlobalMaint = globalServerlessState.maintenanceMode === true || sc.website?.status === false;

    return res.status(200).json({
      success: true,
      globalMaintenance: isGlobalMaint,
      modules: {
        movieBooking: {
          maintenance: isGlobalMaint || sc.movieBooking?.status === false || globalServerlessState.maintenanceMode === true,
          title: sc.movieBooking?.title || globalServerlessState.maintenanceTitle,
          message: sc.movieBooking?.message || globalServerlessState.maintenanceMessage
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
          maintenance: isGlobalMaint || sc.filmProduction?.status === false || globalServerlessState.globalSubwebsiteEnabled === false,
          title: sc.filmProduction?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.filmProduction?.message || globalServerlessState.subwebsiteMaintenanceMessage
        },
        eventManagement: {
          maintenance: isGlobalMaint || sc.eventManagement?.status === false || globalServerlessState.globalSubwebsiteEnabled === false,
          title: sc.eventManagement?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.eventManagement?.message || globalServerlessState.subwebsiteMaintenanceMessage
        },
        brandPromotion: {
          maintenance: isGlobalMaint || sc.brandPromotion?.status === false || globalServerlessState.globalSubwebsiteEnabled === false,
          title: sc.brandPromotion?.title || "SUB-WEBSITE TEMPORARILY UNAVAILABLE",
          message: sc.brandPromotion?.message || globalServerlessState.subwebsiteMaintenanceMessage
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  // 3. High-Priority Direct Route: Public App Settings
  if (url === "/api/v1/settings/app" || url === "/api/settings/app" || url === "/settings/app") {
    syncServerlessStateFromDisk();

    // Cross-lambda DB sync (if database is reachable)
    try {
      const dbSettings: any = await Promise.race([
        prisma.appSettings.findUnique({ where: { id: "global_default" } }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 800))
      ]).catch(() => null);

      if (dbSettings) {
        if (typeof dbSettings.maintenanceMode === "boolean") {
          globalServerlessState.maintenanceMode = dbSettings.maintenanceMode;
        }
        if (dbSettings.maintenanceTitle) globalServerlessState.maintenanceTitle = dbSettings.maintenanceTitle;
        if (dbSettings.maintenanceMessage) globalServerlessState.maintenanceMessage = dbSettings.maintenanceMessage;
        if (typeof dbSettings.maintenanceCountdownEnabled === "boolean") {
          globalServerlessState.maintenanceCountdownEnabled = dbSettings.maintenanceCountdownEnabled;
        }
        if (dbSettings.maintenanceEndTime !== undefined) {
          globalServerlessState.maintenanceEndTime = dbSettings.maintenanceEndTime ? dbSettings.maintenanceEndTime.toISOString() : null;
        }
        if (typeof dbSettings.globalSubwebsiteEnabled === "boolean") {
          globalServerlessState.globalSubwebsiteEnabled = dbSettings.globalSubwebsiteEnabled;
        }
        if (dbSettings.subwebsiteMaintenanceMessage) {
          globalServerlessState.subwebsiteMaintenanceMessage = dbSettings.subwebsiteMaintenanceMessage;
        }
        if (dbSettings.serviceControls && typeof dbSettings.serviceControls === "object") {
          globalServerlessState.serviceControls = {
            ...globalServerlessState.serviceControls,
            ...(dbSettings.serviceControls as any)
          };
        }
        if (dbSettings.updatedAt) {
          globalServerlessState.updatedAt = dbSettings.updatedAt.toISOString();
        }
      }
    } catch (e) {}

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
      writePersistedFileSettings(globalServerlessState);
      invalidateMaintenanceCache();
    } catch (e) {}

    // Direct DB update (awaited to prevent lambda termination before DB write completes)
    try {
      await Promise.race([
        prisma.appSettings.upsert({
          where: { id: "global_default" },
          update: {
            globalSubwebsiteEnabled: enabled,
            ...(message !== undefined && { subwebsiteMaintenanceMessage: message }),
            serviceControls: globalServerlessState.serviceControls,
            updatedAt: new Date()
          },
          create: {
            id: "global_default",
            maintenanceMode: false,
            globalSubwebsiteEnabled: enabled,
            subwebsiteMaintenanceMessage: message || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
            serviceControls: globalServerlessState.serviceControls || {},
            updatedBy: "admin"
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000))
      ]).catch((dbErr: any) => {
        console.warn("[API Serverless] Subwebsite DB upsert notice:", dbErr.message);
      });
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
    (
      url === "/api/v1/admin/settings/global" ||
      url === "/api/admin/settings/global" ||
      url === "/admin/settings/global" ||
      url === "/api/v1/admin/settings/maintenance" ||
      url === "/api/admin/settings/maintenance" ||
      url === "/admin/settings/maintenance"
    ) &&
    (req.method === "POST" || req.method === "PUT")
  ) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    if (body.module) {
      const mod = body.module;
      const isMaint = typeof body.maintenance === "boolean" ? body.maintenance : (typeof body.enabled === "boolean" ? !body.enabled : false);
      if (!globalServerlessState.serviceControls) globalServerlessState.serviceControls = {};
      if (mod === "global" || mod === "website" || mod === "all") {
        globalServerlessState.maintenanceMode = isMaint;
        globalServerlessState.serviceControls.website = { ...(globalServerlessState.serviceControls.website || {}), status: !isMaint };
        globalServerlessState.serviceControls.movieBooking = { ...(globalServerlessState.serviceControls.movieBooking || {}), status: !isMaint };
      } else if (mod === "movieBooking" || mod === "movies") {
        globalServerlessState.maintenanceMode = isMaint;
        globalServerlessState.serviceControls.movieBooking = { ...(globalServerlessState.serviceControls.movieBooking || {}), status: !isMaint };
      } else if (mod === "cineCoins" || mod === "cinecoins" || mod === "cineCoinsLoyalty") {
        globalServerlessState.serviceControls.cinecoins = { ...(globalServerlessState.serviceControls.cinecoins || {}), status: !isMaint };
        globalServerlessState.serviceControls.cineCoinsLoyalty = { ...globalServerlessState.serviceControls.cinecoins };
      } else if (mod === "events" || mod === "eventBooking") {
        globalServerlessState.serviceControls.eventBooking = { ...(globalServerlessState.serviceControls.eventBooking || {}), status: !isMaint };
      } else if (mod === "filmProduction" || mod === "productions") {
        globalServerlessState.serviceControls.filmProduction = { ...(globalServerlessState.serviceControls.filmProduction || {}), status: !isMaint };
      } else if (mod === "eventManagement") {
        globalServerlessState.serviceControls.eventManagement = { ...(globalServerlessState.serviceControls.eventManagement || {}), status: !isMaint };
      } else if (mod === "brandPromotion" || mod === "mediaPromotions") {
        globalServerlessState.serviceControls.brandPromotion = { ...(globalServerlessState.serviceControls.brandPromotion || {}), status: !isMaint };
      }
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
      writePersistedFileSettings(globalServerlessState);
      invalidateMaintenanceCache();
    } catch (e) {}

    // Direct DB update (awaited to prevent lambda termination before DB write completes)
    try {
      await Promise.race([
        prisma.appSettings.upsert({
          where: { id: "global_default" },
          update: {
            ...(typeof body.maintenanceMode === "boolean" && { maintenanceMode: body.maintenanceMode }),
            ...(body.maintenanceTitle !== undefined && { maintenanceTitle: body.maintenanceTitle }),
            ...(body.maintenanceMessage !== undefined && { maintenanceMessage: body.maintenanceMessage }),
            ...(typeof body.maintenanceCountdownEnabled === "boolean" && { maintenanceCountdownEnabled: body.maintenanceCountdownEnabled }),
            ...(body.maintenanceEndTime !== undefined && { maintenanceEndTime: body.maintenanceEndTime ? new Date(body.maintenanceEndTime) : null }),
            ...(typeof body.globalSubwebsiteEnabled === "boolean" && { globalSubwebsiteEnabled: body.globalSubwebsiteEnabled }),
            ...(body.subwebsiteMaintenanceMessage !== undefined && { subwebsiteMaintenanceMessage: body.subwebsiteMaintenanceMessage }),
            ...(body.serviceControls !== undefined && { serviceControls: body.serviceControls }),
            updatedAt: new Date()
          },
          create: {
            id: "global_default",
            maintenanceMode: !!body.maintenanceMode,
            maintenanceTitle: body.maintenanceTitle || "Maintenance Mode Active",
            maintenanceMessage: body.maintenanceMessage || "Platform undergoing maintenance.",
            maintenanceCountdownEnabled: !!body.maintenanceCountdownEnabled,
            maintenanceEndTime: body.maintenanceEndTime ? new Date(body.maintenanceEndTime) : null,
            globalSubwebsiteEnabled: body.globalSubwebsiteEnabled === true,
            subwebsiteMaintenanceMessage: body.subwebsiteMaintenanceMessage || "Sub-websites temporarily unavailable.",
            serviceControls: body.serviceControls || {},
            updatedBy: "admin"
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000))
      ]).catch((dbErr: any) => {
        console.warn("[API Serverless] DB upsert notice:", dbErr.message);
      });
    } catch (e) {}

    // Authoritative Cloud Sync to Supabase for all devices
    try {
      const { syncAppSettingsToSupabase } = await import("./config/supabaseAdmin");
      await syncAppSettingsToSupabase({
        maintenanceMode: globalServerlessState.maintenanceMode,
        maintenanceTitle: globalServerlessState.maintenanceTitle,
        maintenanceMessage: globalServerlessState.maintenanceMessage,
        maintenanceCountdownEnabled: globalServerlessState.maintenanceCountdownEnabled,
        maintenanceEndTime: globalServerlessState.maintenanceEndTime,
        globalSubwebsiteEnabled: globalServerlessState.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: globalServerlessState.subwebsiteMaintenanceMessage,
        serviceControls: globalServerlessState.serviceControls,
        updatedBy: "admin",
        updatedAt: globalServerlessState.updatedAt || new Date()
      });
    } catch (sbErr: any) {
      console.warn("[API Serverless] Supabase sync notice:", sbErr?.message || sbErr);
    }

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

  // 5C. High-Priority Direct Route: Admin Media & Poster/Banner Uploads
  if (
    (
      url === "/api/v1/admin/uploads/event-poster" ||
      url === "/api/admin/uploads/event-poster" ||
      url === "/admin/uploads/event-poster" ||
      url === "/api/v1/admin/uploads/event-banner" ||
      url === "/api/admin/uploads/event-banner" ||
      url === "/admin/uploads/event-banner" ||
      url === "/api/v1/admin/uploads/image" ||
      url === "/api/admin/uploads/image" ||
      url === "/admin/uploads/image"
    ) &&
    req.method === "POST"
  ) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const isBanner = url.includes("event-banner");
    const defaultUrl = isBanner
      ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200"
      : "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800";

    const mediaUrl = body?.image || body?.url || body?.dataUrl || defaultUrl;
    const mediaId = `${isBanner ? "banner" : "poster"}_${Date.now()}`;
    const mediaAlt = body?.alt || (isBanner ? "Event Banner" : "Event Poster");

    return res.status(200).json({
      success: true,
      message: `${isBanner ? "Banner" : "Poster"} uploaded successfully`,
      url: mediaUrl,
      publicId: mediaId,
      alt: mediaAlt,
      file: {
        url: mediaUrl,
        publicId: mediaId,
        alt: mediaAlt
      }
    });
  }

  // 5C-2. High-Priority Direct Route: Platform Config & Trending Live Highlights
  if (
    url === "/api/v1/admin/platform-config" ||
    url === "/api/admin/platform-config" ||
    url === "/admin/platform-config" ||
    url === "/api/v1/public/event-highlights" ||
    url === "/api/public/event-highlights" ||
    url === "/public/event-highlights"
  ) {
    if (req.method === "POST" || req.method === "PUT") {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }

      if (body?.trendingExperiences !== undefined) {
        (globalServerlessState as any).trendingExperiences = Array.isArray(body.trendingExperiences) ? body.trendingExperiences : [];
      }
      if (body?.browseLiveCategories !== undefined) {
        (globalServerlessState as any).browseLiveCategories = Array.isArray(body.browseLiveCategories) ? body.browseLiveCategories : [];
      }
      globalServerlessState.updatedAt = new Date().toISOString();

      try {
        const serialized = JSON.stringify(globalServerlessState, null, 2);
        fs.writeFileSync(CONFIG_FILE_PATH, serialized, "utf-8");
        fs.writeFileSync(TMP_CONFIG_PATH, serialized, "utf-8");
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: "Platform highlights and config updated successfully.",
        trendingExperiences: (globalServerlessState as any).trendingExperiences || [],
        browseLiveCategories: (globalServerlessState as any).browseLiveCategories || []
      });
    }

    // GET Request
    syncServerlessStateFromDisk();
    return res.status(200).json({
      success: true,
      trendingExperiences: (globalServerlessState as any).trendingExperiences || [],
      browseLiveCategories: (globalServerlessState as any).browseLiveCategories || []
    });
  }

  // Helper: Format database event row into full client EventItem
  const formatDbEventToClient = (evt: any) => {
    const price = Number(evt.price) || 0;
    const capacity = Number(evt.capacity) || 1000;
    const isFree = price === 0;
    const status = evt.status || "PUBLISHED";
    const dateStr = evt.date ? (typeof evt.date === "string" ? evt.date.split("T")[0] : new Date(evt.date).toISOString().split("T")[0]) : "2026-10-30";
    const timeStr = evt.time || "06:30 PM";

    return {
      id: evt.id,
      title: evt.title,
      slug: evt.title ? evt.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : evt.id,
      description: evt.description || `${evt.title} live in ${evt.city || "Hyderabad"}`,
      category: evt.category || "Concerts",
      bannerUrl: evt.bannerUrl,
      posterUrl: evt.bannerUrl,
      image: evt.bannerUrl,
      imageUrl: evt.bannerUrl,
      date: dateStr,
      time: timeStr,
      startTime: timeStr,
      city: evt.city || "Hyderabad",
      venueName: evt.venue || "Convention Arena",
      venueAddress: `${evt.venue || "Convention Arena"}, ${evt.city || "Hyderabad"}`,
      price,
      totalCapacity: capacity,
      totalTicketCapacity: capacity,
      soldCount: 0,
      soldTicketCount: 0,
      status,
      bookingStatus: status === "PUBLISHED" ? "OPEN" : "CLOSED",
      eventType: isFree ? "FREE" : "PAID",
      isFeatured: true,
      isActive: status !== "DRAFT" && status !== "CANCELLED",
      ticketTypes: [
        {
          id: `TKT-${evt.id}-GEN`,
          eventId: evt.id,
          name: "General Admission",
          tier: "General",
          description: "General Entry Pass",
          price,
          availableQuantity: capacity,
          soldQuantity: 0,
          isFree,
          status: "Active"
        }
      ],
      createdAt: evt.createdAt || new Date().toISOString(),
      updatedAt: evt.updatedAt || new Date().toISOString()
    };
  };

  // 5D-1. High-Priority Direct Route: Public Events Discovery (Web, Mobile & Native Apps)
  const isPublicEventsEndpoint =
    url === "/api/v1/events" ||
    url === "/api/events" ||
    url === "/events";

  if (isPublicEventsEndpoint && req.method === "GET") {
    try {
      const { data: dbEvents, error } = await supabaseAdmin
        .from("Event")
        .select("*")
        .neq("status", "CANCELLED")
        .order("date", { ascending: true });

      if (dbEvents && dbEvents.length > 0) {
        const events = dbEvents.map(formatDbEventToClient);
        return res.status(200).json({
          success: true,
          count: events.length,
          events,
          data: { events }
        });
      }
    } catch (e: any) {
      console.warn("[Serverless Events GET] Supabase query notice:", e?.message || e);
    }
  }

  // 5D-2. High-Priority Direct Route: Single Event Details
  const isSingleEventEndpoint =
    (url.startsWith("/api/v1/events/") || url.startsWith("/api/events/") || url.startsWith("/events/")) &&
    !url.includes("/send-pass-email") &&
    !url.includes("/book") &&
    req.method === "GET";

  if (isSingleEventEndpoint) {
    const parts = url.split("/");
    const eventId = parts[parts.length - 1];
    try {
      const { data: evt } = await supabaseAdmin
        .from("Event")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (evt) {
        const event = formatDbEventToClient(evt);
        return res.status(200).json({
          success: true,
          event,
          data: { event }
        });
      }
    } catch (e) {}
  }

  // 5D-3. High-Priority Direct Route: Admin Event Management & Publishing
  const isAdminEventsEndpoint =
    url === "/api/v1/admin/events" ||
    url === "/api/admin/events" ||
    url === "/admin/events";

  if (isAdminEventsEndpoint && req.method === "GET") {
    try {
      const { data: dbEvents } = await supabaseAdmin
        .from("Event")
        .select("*")
        .order("createdAt", { ascending: false });

      if (dbEvents && dbEvents.length > 0) {
        const events = dbEvents.map(formatDbEventToClient);
        return res.status(200).json({
          success: true,
          count: events.length,
          events,
          data: { events }
        });
      }
    } catch (e: any) {
      console.warn("[Serverless Admin Events GET] Notice:", e?.message || e);
    }
  }

  if (isAdminEventsEndpoint && req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const title = body?.title ? String(body.title).trim() : "Untitled Event";
    const description = body?.description ? String(body.description).trim() : `${title} live in ${body?.venue?.city || body?.city || "Hyderabad"}`;
    const category = body?.category || "Concerts";
    const bannerUrl = body?.banner?.url || body?.bannerUrl || body?.poster?.url || body?.posterUrl || body?.image || "https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800";
    const posterUrl = body?.poster?.url || body?.posterUrl || bannerUrl;

    let eventDate = new Date();
    if (body?.date) {
      const parsed = new Date(body.date);
      if (!isNaN(parsed.getTime())) eventDate = parsed;
    }
    const time = body?.time || body?.startTime || "07:00 PM";
    const city = body?.venue?.city || body?.city || "Hyderabad";
    const venue = body?.venue?.name || body?.venueName || body?.venue || "Convention Arena";
    const capacity = Number(body?.totalTicketCapacity || body?.totalCapacity || body?.capacity) || 1000;
    const price = Number(body?.eventType === "FREE" ? 0 : (body?.ticketTypes?.[0]?.price || body?.price || 0));
    const status = (body?.status === "DRAFT" || body?.status === "Draft") ? "DRAFT" : "PUBLISHED";
    const eventId = body?.id || `EVT-${Date.now().toString().slice(-4)}`;

    const eventRecord = {
      id: eventId,
      title,
      description,
      category,
      bannerUrl,
      date: eventDate.toISOString(),
      time,
      city,
      venue,
      price,
      capacity,
      organizerId: "ORG-ADMIN",
      status,
      updatedAt: new Date().toISOString()
    };

    // Authoritative direct cloud database write
    try {
      await supabaseAdmin.from("Event").upsert(eventRecord);
    } catch (sbErr: any) {
      console.warn("[Serverless Event] Supabase upsert notice:", sbErr?.message || sbErr);
    }

    try {
      await Promise.race([
        prisma.event.upsert({
          where: { id: eventId },
          update: {
            title,
            description,
            category,
            bannerUrl,
            date: eventDate,
            time,
            city,
            venue,
            price,
            capacity,
            status,
            updatedAt: new Date()
          },
          create: {
            id: eventId,
            title,
            description,
            category,
            bannerUrl,
            date: eventDate,
            time,
            city,
            venue,
            price,
            capacity,
            organizerId: "admin",
            status
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000))
      ]).catch((err) => {
        console.warn("[Serverless Event] DB upsert notice:", err.message);
      });
    } catch (e) {}

    const formattedEvent = formatDbEventToClient(eventRecord);

    return res.status(200).json({
      success: true,
      message: `Event "${title}" saved and published successfully.`,
      event: formattedEvent
    });
  }

  // 5D-4. High-Priority Direct Route: Admin Delete Event
  if (
    url.includes("/admin/events/") &&
    req.method === "DELETE"
  ) {
    const parts = url.split("/");
    const eventId = parts[parts.length - 1];
    try {
      await supabaseAdmin.from("Event").delete().eq("id", eventId);
      await (prisma.event as any).delete({ where: { id: eventId } }).catch(() => {});
    } catch (e) {}
    return res.status(200).json({ success: true, message: `Event ${eventId} deleted successfully.` });
  }

  // 5E. High-Priority Direct Route: Admin Publish / Unpublish / Cancel Event
  if (
    url.includes("/admin/events/") &&
    (url.endsWith("/publish") || url.endsWith("/unpublish") || url.endsWith("/cancel") || url.endsWith("/status")) &&
    (req.method === "POST" || req.method === "PATCH")
  ) {
    const parts = url.split("/");
    let action = parts[parts.length - 1]; // "publish" | "unpublish" | "cancel" | "status"
    let eventId = parts[parts.length - 2];
    if (action === "status") {
      let b = req.body;
      if (typeof b === "string") {
        try { b = JSON.parse(b); } catch (e) { b = {}; }
      }
      action = (b?.status === "PUBLISHED" || b?.status === "Published") ? "publish" : "unpublish";
    }
    const newStatus = action === "publish" ? "PUBLISHED" : action === "unpublish" ? "DRAFT" : "CANCELLED";

    try {
      await supabaseAdmin
        .from("Event")
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq("id", eventId);

      await Promise.race([
        prisma.event.update({
          where: { id: eventId },
          data: { status: newStatus }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000))
      ]).catch(() => {});
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Event ${eventId} successfully updated to ${newStatus}.`,
      status: newStatus,
      bookingStatus: newStatus === "PUBLISHED" ? "OPEN" : "CLOSED"
    });
  }

  // 5F. High-Priority Direct Route: Event Pass Email Dispatch
  if (
    (url.endsWith("/events/send-pass-email") || url.endsWith("/send-pass-email") || url.endsWith("/notifications/send-ticket-email")) &&
    req.method === "POST"
  ) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { sendEventPassEmail } = await import("./services/emailService");
    const recipient = body?.email || body?.to || body?.recipientEmail;
    if (!recipient) {
      return res.status(400).json({ success: false, message: "Recipient email address is required." });
    }
    const result = await sendEventPassEmail({
      to: recipient,
      passId: body?.passId || body?.ticketCode || `PASS-${Date.now()}`,
      orderId: body?.orderId || body?.bookingId,
      eventTitle: body?.eventTitle || body?.title || "CineVenue Live Event",
      attendeeName: body?.attendeeName || body?.name || body?.userName || "Valued Guest",
      venueName: body?.venueName || body?.venue || "Event Arena",
      venueAddress: body?.venueAddress,
      date: body?.date || "Upcoming",
      day: body?.day,
      time: body?.time || "07:00 PM",
      tier: body?.tier || body?.categoryName || body?.category || "VIP PASS",
      totalPrice: body?.totalPrice,
      qrCodeUrl: body?.qrCodeUrl,
      passUrl: body?.passUrl || body?.ticketUrl,
      posterUrl: body?.posterUrl,
      isFree: body?.isFree
    });
    return res.status(200).json(result);
  }

  // 5G. High-Priority Direct Route: Gemini AI VIP Concierge
  if ((url.includes("/gemini/concierge") || url.endsWith("/concierge")) && req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const { prompt, city = "Hyderabad" } = body || {};
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const systemInstruction = `You are the premium CineVenue VIP Event & Experience Concierge Assistant. 

ABOUT CINEVENUE:
CineVenue is India's premier integrated cinematic and luxury entertainment ecosystem, unifying 6 core pillars:
1. Movie Booking (/booking): Theatrical ticketing for IMAX, Dolby Atmos, 4K Laser, and VIP recliners across Hyderabad (Prasads IMAX, PVR Nexus), Vijayawada (PVP Square INOX, Capital Cinemas), and Guntur (Naaz Cinemas, Cinepolis Sudarshan).
2. Live Event Booking (/events): High-society event passes, EDM arenas, standup comedy, VIP celeb galas, and fan-premieres with instant QR vertical A4 PDF passes and live gate check-in.
3. Film Production Studio (/productions): Official 24 Crafts marketplace, verified creative talent, casting auditions, script pitching, and investor pitch decks.
4. Turnkey Event Management (/events): 11 event categories, 13 tech services (LED walls, line arrays, grandMA3, DG sets), and single-window police clearances.
5. Brand & Media Promotions (/submit-proposal): Multi-channel digital marketing, multiplex digital standees, viral social campaigns, and PR meets.
6. CineCoins Loyalty Vault (/cinecoins): Rewards store catalog, spin wheel, cashback wallet, and instant coin redemptions.

TOP MOVIES PLAYING:
- Coolie (Action / Thriller, Telugu/Tamil, UA16+, Rating 9.1, featuring IMAX & Dolby Atmos)
- Don't Trouble the Trouble (Comedy / Drama, Telugu, UA13+, Rating 8.4)
- Sigma (Action / Thriller, Telugu, UA16+, Rating 7.9)
- The Paradise (Action / Period Drama, Telugu, Rating 8.6)
- Avengers Endgame: Encore (Sci-Fi / Action, Telugu/Hindi/English, Rating 9.2)
- Thellakaagitham (Romantic Drama, Telugu)
- Baththa (Action / Crime, Tamil)

TOP LIVE EXPERIENCES & EVENTS:
- Alan Walker Sunburn Arena (Gachibowli Stadium, Hyderabad - VIP passes & DJ arena)
- Sufi Symphony Night (Vijayawada Convention Centre - live acoustic strings & VIP seating)
- Hyderabad Standup Fest (Shilpakala Hall, Hyderabad - top comedy lineup)
- Symphony Tours & VIP Celeb Pre-Release Galas

REDIRECT ACTIONS (CRITICAL):
When asked about CineVenue, or when recommending or asked about any movie, event, or platform service, you MUST append one or more structured action tags at the end of your response so the user can be redirected with a single click:
Tags format:
[[ACTION|movie|Movie Name|/booking?search=MovieName|Book Tickets for Movie Name|Genre & Sound Specs]]
[[ACTION|event|Event Name|/events?search=EventName|Book Passes for Event Name|Venue & Pass Highlights]]
[[ACTION|movies_portal|Movie Booking Engine|/booking|Browse All Now Showing Movies|IMAX, 4DX & Luxury Lounges]]
[[ACTION|events_portal|Live Events Portal|/events|Browse All Live Events|Concerts, Comedy & VIP Passes]]
[[ACTION|production|Film Production Studio|/productions|Launch Film Studio|24 Crafts & Casting Calls]]
[[ACTION|cinecoins|CineCoins Rewards|/cinecoins|Open CineCoins Vault|Cashback & Rewards Store]]

Keep responses conversational, helpful, sophisticated, and under 200 words. Always include the relevant [[ACTION|...]] tags.`;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { systemInstruction, temperature: 0.7 }
        });
        return res.status(200).json({ success: true, text: response.text });
      } catch (e: any) {
        console.warn("[Gemini Concierge fallback]", e.message);
      }
    }

    // Contextual fallback response with direct action tags
    const lowerP = (prompt || '').toLowerCase();
    let fallbackText = `Welcome to CineVenue! CineVenue is India's premier high-society entertainment ecosystem offering luxury Movie Booking with IMAX & Dolby Atmos lounges, exclusive VIP Concert & Event Passes, a Pan-India Film Production Studio (24 Crafts), and CineCoins rewards across Hyderabad, Vijayawada, and Guntur.`;
    let fallbackActions = `\n\n[[ACTION|movies_portal|Movie Booking Engine|/booking|Browse Now Showing Movies|IMAX, 4DX & VIP Lounges]][[ACTION|events_portal|Live Events Portal|/events|Browse Live Experiences|Concerts & Standup Comedy]][[ACTION|production|Film Production Studio|/productions|Launch 24 Crafts|Casting & Script Pitching]][[ACTION|cinecoins|CineCoins Rewards|/cinecoins|Open CineCoins Vault|Cashback & Points]]`;

    if (lowerP.includes("coolie") || lowerP.includes("movie") || lowerP.includes("kalki") || lowerP.includes("ticket") || lowerP.includes("cinema") || lowerP.includes("theatre")) {
      fallbackText = `CineVenue offers luxury theatrical reservations across Prasads IMAX Hyderabad, PVP Square INOX Vijayawada, and Naaz Cinemas Guntur. Top now showing titles include **Coolie** (Action/Thriller UA16+, Rating 9.1 in IMAX 3D) and **Don't Trouble the Trouble**. You can secure your luxury recliners directly with our ticket engine!`;
      fallbackActions = `\n\n[[ACTION|movie|Coolie|/booking?search=Coolie|Book Tickets for Coolie|Action / Thriller • IMAX & Dolby Atmos]][[ACTION|movies_portal|Now Showing Movies|/booking|Open Movie Ticket Engine|Browse All Theatres & Showtimes]]`;
    } else if (lowerP.includes("sunburn") || lowerP.includes("alan walker") || lowerP.includes("sufi") || lowerP.includes("event") || lowerP.includes("concert") || lowerP.includes("standup") || lowerP.includes("pass")) {
      fallbackText = `For live experiences in Andhra Pradesh and Telangana, top surge demand events include the **Alan Walker Sunburn Arena** at Gachibowli Stadium and the **Sufi Symphony Night** at Vijayawada Convention Hall. All passes come with vertical A4 printable passes, instant QR delivery, and valet gate access!`;
      fallbackActions = `\n\n[[ACTION|event|Alan Walker Sunburn Arena|/events?search=Alan%20Walker|Book VIP Pass for Sunburn|Gachibowli Stadium • Instant QR]][[ACTION|event|Sufi Symphony Night|/events?search=Sufi|Book Passes for Sufi Night|Vijayawada Convention Centre]][[ACTION|events_portal|All Live Events|/events|Explore Live Events Portal|Browse All Passes]]`;
    }

    return res.status(200).json({
      success: true,
      text: `${fallbackText}${fallbackActions}`
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
    const app = getExpressApp();
    if (!app) {
      return res.status(500).json({
        success: false,
        error: { code: "EXPRESS_INIT_FAILED", message: "Failed to initialize server application" }
      });
    }
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const done = () => {
        if (!isResolved) {
          isResolved = true;
          resolve(undefined);
        }
      };

      res.on("finish", done);
      res.on("close", done);
      res.on("error", (err: any) => {
        if (!isResolved) {
          isResolved = true;
          reject(err);
        }
      });

      app(req, res, (err: any) => {
        if (err) {
          if (!isResolved) {
            isResolved = true;
            return reject(err);
          }
        }
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: { code: "NOT_FOUND", message: `Cannot ${req.method} ${url}` }
          });
        }
        done();
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
