import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";

export interface CachedMaintenanceState {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: Date | null;
  globalSubwebsiteEnabled: boolean;
  subwebsiteMaintenanceMessage: string;
  serviceControls: any;
  cachedAt: number;
}

const CONFIG_FILE_PATH = path.resolve(process.cwd(), "server/config/global_settings.json");

export function readPersistedFileSettings(): any {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {}
  return {
    globalSubwebsiteEnabled: false,
    subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance."
  };
}

export function writePersistedFileSettings(settings: any) {
  try {
    const existing = readPersistedFileSettings();
    const merged = { ...existing, ...settings, updatedAt: new Date().toISOString() };
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (e) {}
}

let cachedState: CachedMaintenanceState | null = null;
const CACHE_TTL_MS = 2000; // 2-second short TTL to ensure maximum freshness while preventing DB thrashing

export function invalidateMaintenanceCache() {
  cachedState = null;
}

export function setTestMaintenanceState(state: Partial<CachedMaintenanceState> | null) {
  if (state === null) {
    cachedState = null;
  } else {
    if (state.globalSubwebsiteEnabled !== undefined) {
      writePersistedFileSettings({
        globalSubwebsiteEnabled: state.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: state.subwebsiteMaintenanceMessage
      });
    }

    cachedState = {
      maintenanceMode: state.maintenanceMode ?? false,
      maintenanceTitle: state.maintenanceTitle ?? "Movie Booking Temporarily Unavailable",
      maintenanceMessage: state.maintenanceMessage ?? "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: state.maintenanceCountdownEnabled ?? false,
      maintenanceEndTime: state.maintenanceEndTime ?? null,
      globalSubwebsiteEnabled: state.globalSubwebsiteEnabled ?? false,
      subwebsiteMaintenanceMessage: state.subwebsiteMaintenanceMessage ?? "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
      serviceControls: state.serviceControls ?? {},
      cachedAt: Date.now() + 100000
    };
  }
}

export async function getGlobalAppSettings(): Promise<CachedMaintenanceState> {
  const now = Date.now();
  if (cachedState && now - cachedState.cachedAt < CACHE_TTL_MS) {
    return cachedState;
  }

  const fileSettings = readPersistedFileSettings();

  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "global_default" }
    });

    if (settings) {
      cachedState = {
        maintenanceMode: settings.maintenanceMode,
        maintenanceTitle: settings.maintenanceTitle || "Movie Booking Temporarily Unavailable",
        maintenanceMessage: settings.maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
        maintenanceCountdownEnabled: settings.maintenanceCountdownEnabled,
        maintenanceEndTime: settings.maintenanceEndTime,
        globalSubwebsiteEnabled: settings.globalSubwebsiteEnabled !== false && fileSettings.globalSubwebsiteEnabled !== false,
        subwebsiteMaintenanceMessage: settings.subwebsiteMaintenanceMessage || fileSettings.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
        serviceControls: settings.serviceControls || {},
        cachedAt: now
      };
      return cachedState;
    }

    // Fallback if singleton record hasn't been seeded yet
    cachedState = {
      maintenanceMode: false,
      maintenanceTitle: "Movie Booking Temporarily Unavailable",
      maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: false,
      maintenanceEndTime: null,
      globalSubwebsiteEnabled: fileSettings.globalSubwebsiteEnabled !== undefined ? fileSettings.globalSubwebsiteEnabled : false,
      subwebsiteMaintenanceMessage: fileSettings.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
      serviceControls: {},
      cachedAt: now
    };
    return cachedState;
  } catch (error: any) {
    logger.warn(`Failed to fetch app_settings from database: ${error.message}`);
    // If DB is unreachable and we have cached state, use it
    if (cachedState) {
      return cachedState;
    }
    // Resilient fallback: uses persistent server configuration file
    cachedState = {
      maintenanceMode: false,
      maintenanceTitle: "Movie Booking Temporarily Unavailable",
      maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: false,
      maintenanceEndTime: null,
      globalSubwebsiteEnabled: fileSettings.globalSubwebsiteEnabled !== undefined ? fileSettings.globalSubwebsiteEnabled : false,
      subwebsiteMaintenanceMessage: fileSettings.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
      serviceControls: {},
      cachedAt: now
    };
    return cachedState;
  }
}

/**
 * Middleware: Enforces that movie booking operations cannot proceed when maintenance mode is active.
 * Protects seat locking, pending booking creation, payment order creation, and payment verification.
 */
export async function checkMovieBookingMaintenance(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getGlobalAppSettings();

    if (settings.maintenanceMode) {
      logger.warn(`[MAINTENANCE GATE] Blocked booking request to ${req.method} ${req.originalUrl}`);
      return res.status(503).json({
        success: false,
        code: "MOVIE_BOOKING_MAINTENANCE",
        message: settings.maintenanceMessage || "Movie booking is temporarily unavailable due to scheduled maintenance. Please check again shortly.",
        data: {
          maintenanceMode: true,
          title: settings.maintenanceTitle,
          message: settings.maintenanceMessage,
          countdownEnabled: settings.maintenanceCountdownEnabled,
          endTime: settings.maintenanceEndTime
        }
      });
    }

    next();
  } catch (error: any) {
    logger.error(`Maintenance check failed for ${req.originalUrl}: ${error.message}`);
    // Requirement 18: If database is temporarily unavailable, fail safely for critical booking operations
    return res.status(503).json({
      success: false,
      code: "BOOKING_VERIFICATION_UNAVAILABLE",
      message: "We're temporarily unable to verify booking availability. Please try again shortly."
    });
  }
}
