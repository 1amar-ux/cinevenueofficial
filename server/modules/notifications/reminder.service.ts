import fs from "fs";
import path from "path";
import { logger } from "../../shared/logger";
import { prisma } from "../../config/database";

export interface ReminderInterval {
  id: string; // e.g., "24h", "3h", "1h", "15m"
  label: string;
  minutes: number;
  enabled: boolean;
}

export interface ReminderTemplate {
  title: string;
  body: string;
}

export interface BookingReminderSettings {
  movieRemindersEnabled: boolean;
  eventRemindersEnabled: boolean;
  intervals: ReminderInterval[];
  templates: {
    movie: ReminderTemplate;
    event: ReminderTemplate;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface ReminderLogEntry {
  id: string;
  bookingId: string;
  type: "MOVIE" | "EVENT";
  title: string;
  venueName: string;
  recipient: string;
  interval: string;
  channel: "PUSH_AND_INAPP" | "PUSH" | "EMAIL" | "SMS";
  status: "SCHEDULED" | "DELIVERED" | "CANCELLED" | "SKIPPED";
  scheduledFor: string;
  dispatchedAt?: string;
  details?: string;
}

const CONFIG_PATH = path.resolve(process.cwd(), "server/config/booking_reminders.json");

const DEFAULT_SETTINGS: BookingReminderSettings = {
  movieRemindersEnabled: true,
  eventRemindersEnabled: true,
  intervals: [
    { id: "24h", label: "24 Hours Before", minutes: 1440, enabled: true },
    { id: "3h", label: "3 Hours Before", minutes: 180, enabled: true },
    { id: "1h", label: "1 Hour Before", minutes: 60, enabled: true },
    { id: "15m", label: "15 Minutes Before", minutes: 15, enabled: true }
  ],
  templates: {
    movie: {
      title: "Your Movie Starts in {timeRemaining}!",
      body: "Your movie \"{movieTitle}\" starts in {timeRemaining} at {theatreName}! Open CineVenue to view your ticket and get directions."
    },
    event: {
      title: "Your Event Starts in {timeRemaining}!",
      body: "Your event \"{eventTitle}\" starts soon at {venueName}! Check your ticket and venue location on CineVenue."
    }
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "Super Admin"
};

class ReminderService {
  private readStore(): { settings: BookingReminderSettings; logs: ReminderLogEntry[] } {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          settings: parsed.settings || DEFAULT_SETTINGS,
          logs: Array.isArray(parsed.logs) ? parsed.logs : []
        };
      }
    } catch (err) {
      logger.error("[ReminderService] Error reading store from disk:", err);
    }
    return { settings: DEFAULT_SETTINGS, logs: [] };
  }

  private writeStore(data: { settings: BookingReminderSettings; logs: ReminderLogEntry[] }) {
    try {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      logger.error("[ReminderService] Error writing store to disk:", err);
    }
  }

  public async getSettings(): Promise<BookingReminderSettings> {
    try {
      // Try to read from prisma AppSettings table if available
      const dbSettings = await prisma.appSettings.findUnique({
        where: { id: "global_default" }
      });
      if (dbSettings && (dbSettings as any).serviceControls?.reminderSettings) {
        return (dbSettings as any).serviceControls.reminderSettings;
      }
    } catch {
      // Fallback cleanly to disk
    }
    const store = this.readStore();
    return store.settings;
  }

  public async updateSettings(
    newSettings: Partial<BookingReminderSettings>,
    updatedBy: string = "Admin"
  ): Promise<BookingReminderSettings> {
    const store = this.readStore();
    const merged: BookingReminderSettings = {
      ...store.settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    store.settings = merged;
    this.writeStore(store);

    try {
      // Synchronize into DB AppSettings if available
      const current = await prisma.appSettings.findUnique({ where: { id: "global_default" } });
      const currentControls = (current?.serviceControls as Record<string, any>) || {};
      await prisma.appSettings.upsert({
        where: { id: "global_default" },
        update: {
          serviceControls: {
            ...currentControls,
            reminderSettings: merged
          },
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          id: "global_default",
          serviceControls: { reminderSettings: merged },
          updatedBy
        }
      });
    } catch (dbErr) {
      logger.warn("[ReminderService] AppSettings DB sync skipped (using file store):", dbErr);
    }

    return merged;
  }

  public async getLogs(limit: number = 100): Promise<ReminderLogEntry[]> {
    const store = this.readStore();
    return store.logs.slice(0, limit);
  }

  public async addLog(entry: Omit<ReminderLogEntry, "id">): Promise<ReminderLogEntry> {
    const store = this.readStore();
    const newEntry: ReminderLogEntry = {
      id: `rem-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...entry
    };

    store.logs.unshift(newEntry);
    if (store.logs.length > 500) {
      store.logs = store.logs.slice(0, 500);
    }

    this.writeStore(store);
    return newEntry;
  }

  public async cancelRemindersForBooking(bookingId: string, reason: string = "Booking cancelled"): Promise<number> {
    const store = this.readStore();
    let updatedCount = 0;
    store.logs = store.logs.map((log) => {
      if (log.bookingId === bookingId && log.status === "SCHEDULED") {
        updatedCount++;
        return {
          ...log,
          status: "CANCELLED" as const,
          details: `Cancelled: ${reason} at ${new Date().toISOString()}`
        };
      }
      return log;
    });

    if (updatedCount > 0) {
      this.writeStore(store);
      logger.info(`[ReminderService] Cancelled ${updatedCount} scheduled reminders for booking ${bookingId}`);
    }
    return updatedCount;
  }
}

export const reminderService = new ReminderService();
