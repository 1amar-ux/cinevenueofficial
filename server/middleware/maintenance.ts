import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";

interface CachedMaintenanceState {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceCountdownEnabled: boolean;
  maintenanceEndTime: Date | null;
  serviceControls: any;
  cachedAt: number;
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
    cachedState = {
      maintenanceMode: state.maintenanceMode ?? false,
      maintenanceTitle: state.maintenanceTitle ?? "Movie Booking Temporarily Unavailable",
      maintenanceMessage: state.maintenanceMessage ?? "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: state.maintenanceCountdownEnabled ?? false,
      maintenanceEndTime: state.maintenanceEndTime ?? null,
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
        serviceControls: settings.serviceControls || {},
        cachedAt: now
      };
      return cachedState;
    }

    // Fallback if singleton record hasn't been seeded yet
    return {
      maintenanceMode: false,
      maintenanceTitle: "Movie Booking Temporarily Unavailable",
      maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: false,
      maintenanceEndTime: null,
      serviceControls: {},
      cachedAt: now
    };
  } catch (error: any) {
    logger.warn(`Failed to fetch app_settings from database: ${error.message}`);
    // If DB is unreachable and we have cached state, use it
    if (cachedState) {
      return cachedState;
    }
    // Resilient fallback when running in offline/testing mode without active PostgreSQL connection
    return {
      maintenanceMode: false,
      maintenanceTitle: "Movie Booking Temporarily Unavailable",
      maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
      maintenanceCountdownEnabled: false,
      maintenanceEndTime: null,
      serviceControls: {},
      cachedAt: now
    };
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
