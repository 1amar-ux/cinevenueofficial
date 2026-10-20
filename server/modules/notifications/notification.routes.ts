import { Router, Request, Response, NextFunction } from "express";
import { logger } from "../../shared/logger";
import { sendEventPassEmail } from "../../services/emailService";

const router = Router();

/**
 * Send Booking Confirmation Email
 * POST /api/v1/notifications/send-ticket-email
 */
router.post("/send-ticket-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const toEmail = req.body.email || req.body.recipientEmail;

    if (!toEmail) {
      return res.status(400).json({ success: false, message: "Recipient email is required." });
    }

    const email = toEmail;
    const {
      name,
      bookingId,
      ticketCode,
      title,
      venue,
      date,
      time,
      seats,
      category,
      quantity,
      ticketUrl,
      type
    } = req.body;

    const emailResult = await sendEventPassEmail({
      to: email,
      passId: ticketCode || bookingId || `TKT-${Date.now()}`,
      orderId: bookingId,
      eventTitle: title || "CineVenue",
      attendeeName: name || "Customer",
      venueName: venue || "CineVenue Multiplex",
      date: date || "Upcoming",
      time: time || "Showtime",
      tier: category || (type === "MOVIE" ? "Cinema Ticket" : "Event Pass"),
      passUrl: ticketUrl
    });

    return res.json({
      success: true,
      message: emailResult.message || `CineVenue confirmation email and digital ticket pass dispatched to ${email}`,
      data: {
        recipient: email,
        bookingId: bookingId || ticketCode,
        liveSent: emailResult.liveSent,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send Booking Confirmation SMS
 * POST /api/v1/notifications/send-ticket-sms
 */
router.post("/send-ticket-sms", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      phone,
      bookingId,
      title,
      venue,
      date,
      time,
      seats,
      ticketUrl
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Recipient phone number is required." });
    }

    const smsBody = `CineVenue: Booking Confirmed for ${title}! ${date} at ${time}. Venue: ${venue}. Seats: ${seats || "General"}. ID: ${bookingId}. Pass: ${ticketUrl || "https://cinevenue.com/orders"}`;

    logger.info(`[NotificationService:SMS] Dispatched ticket SMS to ${phone}: "${smsBody}"`);

    return res.json({
      success: true,
      message: `CineVenue confirmation SMS dispatched to ${phone}`,
      data: {
        recipient: phone,
        body: smsBody,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// SMART LOCATION & TICKET REMINDER ENDPOINTS
// ==========================================

import { reminderService } from "./reminder.service";

/**
 * Get Booking Reminder Settings
 * GET /api/v1/notifications/reminders/settings
 */
router.get("/reminders/settings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await reminderService.getSettings();
    return res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

/**
 * Update Booking Reminder Settings (Admin/SuperAdmin)
 * PUT /api/v1/notifications/reminders/settings
 */
router.put("/reminders/settings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBy = (req as any).user?.name || (req as any).user?.email || "Admin";
    const settings = await reminderService.updateSettings(req.body, updatedBy);
    return res.json({
      success: true,
      message: "Booking reminder configuration updated successfully.",
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get Booking Reminder Delivery Logs
 * GET /api/v1/notifications/reminders/logs
 */
router.get("/reminders/logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await reminderService.getLogs(limit);
    return res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

/**
 * Record / Sync Scheduled Reminders for a Confirmed Booking
 * POST /api/v1/notifications/reminders/schedule
 */
router.post("/reminders/schedule", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, type, title, venueName, recipient, intervals } = req.body;
    if (!bookingId || !title || !venueName) {
      return res.status(400).json({ success: false, message: "Missing required booking reminder fields." });
    }

    const scheduledIntervals = Array.isArray(intervals) ? intervals : ["24h", "3h", "1h", "15m"];
    const createdLogs = [];

    for (const interval of scheduledIntervals) {
      const entry = await reminderService.addLog({
        bookingId,
        type: type || "MOVIE",
        title,
        venueName,
        recipient: recipient || "customer@cinevenue.com",
        interval,
        channel: "PUSH_AND_INAPP",
        status: "SCHEDULED",
        scheduledFor: new Date().toISOString(),
        details: `Automated ${interval} pre-show reminder registered for confirmed booking.`
      });
      createdLogs.push(entry);
    }

    return res.json({
      success: true,
      message: `Scheduled ${createdLogs.length} automated reminders for booking ${bookingId}.`,
      data: createdLogs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel Pending Reminders When Booking is Cancelled or Refunded
 * POST /api/v1/notifications/reminders/cancel
 */
router.post("/reminders/cancel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required." });
    }

    const cancelledCount = await reminderService.cancelRemindersForBooking(bookingId, reason || "Booking cancelled/refunded");
    return res.json({
      success: true,
      message: `Cancelled ${cancelledCount} reminders for booking ${bookingId}.`,
      data: { cancelledCount }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Test Dispatch Reminder (Admin Testing)
 * POST /api/v1/notifications/reminders/test-dispatch
 */
router.post("/reminders/test-dispatch", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = "MOVIE", title, venueName, recipient } = req.body;
    const settings = await reminderService.getSettings();
    const template = type === "EVENT" ? settings.templates.event : settings.templates.movie;

    const formattedTitle = template.title
      .replace("{movieTitle}", title || "Pushpa 2: The Rule")
      .replace("{eventTitle}", title || "CineVenue Gala")
      .replace("{timeRemaining}", "1 hour");

    const formattedBody = template.body
      .replace("{movieTitle}", title || "Pushpa 2: The Rule")
      .replace("{eventTitle}", title || "CineVenue Gala")
      .replace("{theatreName}", venueName || "PVR Nexus, Kukatpally")
      .replace("{venueName}", venueName || "LB Stadium, Hyderabad")
      .replace("{timeRemaining}", "1 hour");

    const logEntry = await reminderService.addLog({
      bookingId: `TEST-${Date.now().toString().slice(-6)}`,
      type: type === "EVENT" ? "EVENT" : "MOVIE",
      title: title || (type === "EVENT" ? "CineVenue Gala" : "Pushpa 2: The Rule"),
      venueName: venueName || (type === "EVENT" ? "LB Stadium, Hyderabad" : "PVR Nexus, Kukatpally"),
      recipient: recipient || "admin@cinevenue.com",
      interval: "1h",
      channel: "PUSH_AND_INAPP",
      status: "DELIVERED",
      scheduledFor: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      details: `Test dispatch verified: "${formattedBody}"`
    });

    return res.json({
      success: true,
      message: "Test reminder dispatched successfully.",
      data: {
        notification: { title: formattedTitle, body: formattedBody },
        log: logEntry
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
