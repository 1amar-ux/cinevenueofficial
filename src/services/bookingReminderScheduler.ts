/**
 * CineVenue Smart Ticket Reminder & Notification Scheduler
 * Coordinates local native Android notifications, Web notifications, in-app alerts,
 * and backend dispatch logs for confirmed movie tickets and live event passes.
 */

import { LocalNotifications } from "@capacitor/local-notifications";
import { parseBookingDateTime } from "./venueLocationService";
import apiClient from "./apiClient";

export interface ScheduledReminderItem {
  id: number;
  reminderKey: string;
  bookingId: string;
  type: "MOVIE" | "EVENT";
  title: string;
  venueName: string;
  venueAddress?: string;
  interval: "24h" | "3h" | "1h" | "15m";
  scheduledTime: number; // epoch ms
  targetTimeFormatted: string;
  ticketUrl: string;
  dispatched: boolean;
}

const STORAGE_KEY_REMINDERS = "cine_scheduled_reminders_registry";
const STORAGE_KEY_PREFS = "cine_notification_preferences";

export interface UserNotificationPreferences {
  movieReminders: boolean;
  eventReminders: boolean;
  bookingConfirmations: boolean;
  persistentCountdown: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

export const DEFAULT_USER_PREFS: UserNotificationPreferences = {
  movieReminders: true,
  eventReminders: true,
  bookingConfirmations: true,
  persistentCountdown: false,
  emailAlerts: true,
  smsAlerts: true
};

export function getUserNotificationPreferences(): UserNotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (raw) {
      return { ...DEFAULT_USER_PREFS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_USER_PREFS;
}

export function saveUserNotificationPreferences(prefs: Partial<UserNotificationPreferences>): void {
  try {
    const current = getUserNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cine_notification_prefs_updated", { detail: updated }));
  } catch {}
}

class BookingReminderScheduler {
  private isCapacitorNative(): boolean {
    return (
      typeof window !== "undefined" &&
      !!(window as any).Capacitor?.isNativePlatform?.()
    );
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (this.isCapacitorNative()) {
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === "granted";
      }

      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") return true;
        if (Notification.permission !== "denied") {
          const res = await Notification.requestPermission();
          return res === "granted";
        }
      }
    } catch (err) {
      console.warn("[ReminderScheduler] Permission request note:", err);
    }
    return false;
  }

  private getRegistry(): Record<string, ScheduledReminderItem> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  }

  private saveRegistry(registry: Record<string, ScheduledReminderItem>): void {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(registry));
    } catch {}
  }

  /**
   * Schedule automated reminders (24h, 3h, 1h, 15m) for a confirmed booking.
   * Guarantees idempotency and prevents duplicates.
   */
  public async scheduleBookingReminders(booking: {
    bookingId: string;
    type: "MOVIE" | "EVENT";
    title: string;
    venueName: string;
    venueAddress?: string;
    city?: string;
    date: string;
    time: string;
    status: string;
    recipientEmail?: string;
  }): Promise<void> {
    // 1. Check customer preferences
    const prefs = getUserNotificationPreferences();
    if (booking.type === "MOVIE" && !prefs.movieReminders) return;
    if (booking.type === "EVENT" && !prefs.eventReminders) return;

    // 2. Schedule ONLY for confirmed bookings
    const isConfirmed =
      booking.status &&
      (booking.status.toUpperCase() === "CONFIRMED" ||
        booking.status.toUpperCase() === "SETTLED" ||
        booking.status.toUpperCase() === "ACTIVE");

    if (!isConfirmed) return;

    // 3. Compute show/event start time
    const startDateTime = parseBookingDateTime(booking.date, booking.time);
    const startEpoch = startDateTime.getTime();
    const now = Date.now();

    // If event/show has already passed, do not schedule
    if (startEpoch <= now) return;

    const registry = this.getRegistry();
    const isNative = this.isCapacitorNative();

    // Standard Intervals in Minutes
    const intervals: { id: "24h" | "3h" | "1h" | "15m"; minutes: number; label: string }[] = [
      { id: "24h", minutes: 1440, label: "24 hours" },
      { id: "3h", minutes: 180, label: "3 hours" },
      { id: "1h", minutes: 60, label: "1 hour" },
      { id: "15m", minutes: 15, label: "15 minutes" }
    ];

    const newNotificationsToSchedule: any[] = [];
    const scheduledKeys: string[] = [];

    for (const item of intervals) {
      const reminderKey = `rem_${booking.bookingId}_${item.id}`;
      // Duplicate prevention check
      if (registry[reminderKey]) continue;

      const triggerEpoch = startEpoch - item.minutes * 60 * 1000;
      // If reminder time has already passed, skip
      if (triggerEpoch <= now) continue;

      const numericId = Math.abs(
        (booking.bookingId + item.id).split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      ) % 2147483647;

      const deepLinkUrl =
        booking.type === "MOVIE"
          ? `/booking?bookingId=${booking.bookingId}&viewTicket=true`
          : `/events?passId=${booking.bookingId}`;

      const notificationTitle =
        booking.type === "MOVIE"
          ? `Your movie starts in ${item.label}!`
          : `Your event starts in ${item.label}!`;

      const notificationBody =
        booking.type === "MOVIE"
          ? `"${booking.title}" starts soon at ${booking.venueName}. Tap to view your ticket and get directions.`
          : `"${booking.title}" starts soon at ${booking.venueName}. Check your ticket and venue location on CineVenue.`;

      registry[reminderKey] = {
        id: numericId,
        reminderKey,
        bookingId: booking.bookingId,
        type: booking.type,
        title: booking.title,
        venueName: booking.venueName,
        venueAddress: booking.venueAddress,
        interval: item.id,
        scheduledTime: triggerEpoch,
        targetTimeFormatted: new Date(triggerEpoch).toLocaleString(),
        ticketUrl: deepLinkUrl,
        dispatched: false
      };
      scheduledKeys.push(item.id);

      if (isNative) {
        newNotificationsToSchedule.push({
          id: numericId,
          title: notificationTitle,
          body: notificationBody,
          schedule: { at: new Date(triggerEpoch) },
          sound: "default",
          extra: {
            bookingId: booking.bookingId,
            type: booking.type,
            deepLinkUrl
          }
        });
      }
    }

    this.saveRegistry(registry);

    // Schedule on Android via Capacitor
    if (isNative && newNotificationsToSchedule.length > 0) {
      try {
        await LocalNotifications.schedule({
          notifications: newNotificationsToSchedule
        });
      } catch (nativeErr) {
        console.warn("[ReminderScheduler] Native schedule note:", nativeErr);
      }
    }

    // Synchronize to backend logs for administrative tracking
    if (scheduledKeys.length > 0) {
      try {
        await apiClient.post("/notifications/reminders/schedule", {
          bookingId: booking.bookingId,
          type: booking.type,
          title: booking.title,
          venueName: booking.venueName,
          recipient: booking.recipientEmail || "customer@cinevenue.com",
          intervals: scheduledKeys
        });
      } catch (apiErr) {
        // Silently preserve offline resilience
      }
    }
  }

  /**
   * Cancel pending reminders when a booking is cancelled or refunded.
   */
  public async cancelBookingReminders(bookingId: string): Promise<void> {
    const registry = this.getRegistry();
    const idsToCancel: number[] = [];

    Object.keys(registry).forEach((key) => {
      if (registry[key].bookingId === bookingId) {
        idsToCancel.push(registry[key].id);
        delete registry[key];
      }
    });

    this.saveRegistry(registry);

    if (this.isCapacitorNative() && idsToCancel.length > 0) {
      try {
        await LocalNotifications.cancel({
          notifications: idsToCancel.map((id) => ({ id }))
        });
      } catch (err) {
        console.warn("[ReminderScheduler] Native cancel note:", err);
      }
    }

    try {
      await apiClient.post("/notifications/reminders/cancel", {
        bookingId,
        reason: "Customer booking status changed"
      });
    } catch {}
  }

  /**
   * Run client-side check to dispatch any due web notifications and in-app alerts.
   */
  public checkAndDispatchDueReminders(): void {
    const registry = this.getRegistry();
    const now = Date.now();
    let updated = false;

    Object.keys(registry).forEach((key) => {
      const item = registry[key];
      // Due if within 2 minutes of scheduled time and not yet dispatched
      if (!item.dispatched && now >= item.scheduledTime && now - item.scheduledTime < 24 * 3600 * 1000) {
        item.dispatched = true;
        updated = true;

        // Show Web Notification if allowed
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            const notif = new Notification(`CineVenue: ${item.title} starts soon!`, {
              body: `Your ${item.type === "MOVIE" ? "movie" : "event"} begins in ${item.interval} at ${item.venueName}. Tap to view ticket.`,
              icon: "/favicon.ico"
            });
            notif.onclick = () => {
              window.focus();
              if (item.ticketUrl) {
                window.location.href = item.ticketUrl;
              }
            };
          } catch {}
        }

        // Fire in-app custom event for live dynamic banner alert
        window.dispatchEvent(
          new CustomEvent("cine_reminder_triggered", {
            detail: item
          })
        );
      }
    });

    if (updated) {
      this.saveRegistry(registry);
    }
  }
}

export const bookingReminderScheduler = new BookingReminderScheduler();
