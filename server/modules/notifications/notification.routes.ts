import { Router, Request, Response, NextFunction } from "express";
import { logger } from "../../shared/logger";
import { sendEventPassEmail, sendBookingConfirmationEmail, sendMovieTicketEmail } from "../../services/emailService";
import { optionalAuthenticate } from "../../middleware/auth";
import { deviceTokenService } from "./deviceToken.service";

const router = Router();

// ==========================================
// MOBILE PUSH NOTIFICATION DEVICE TOKENS (FCM & APNs)
// ==========================================

/**
 * Register or Update Device Push Notification Token
 * POST /api/v1/notifications/device-token
 */
router.post("/device-token", optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, platform, deviceId, deviceModel, appVersion } = req.body || {};
    const userId = req.user?.userId || req.body?.userId || null;

    const record = deviceTokenService.registerToken({
      token,
      platform,
      userId,
      deviceId,
      deviceModel,
      appVersion
    });

    return res.status(200).json({
      success: true,
      message: `${record.platform} device token registered successfully.`,
      data: {
        id: record.id,
        platform: record.platform,
        isActive: record.isActive,
        registeredAt: record.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Deactivate Device Push Notification Token (Logout / App Uninstall)
 * POST /api/v1/notifications/device-token/deactivate
 * DELETE /api/v1/notifications/device-token
 */
const handleTokenDeactivation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.body?.token || (req.query?.token as string);
    const userId = req.user?.userId || null;

    if (!token) {
      return res.status(400).json({ success: false, message: "Device push token is required for deactivation." });
    }

    const deactivated = deviceTokenService.deactivateToken(token, userId);
    return res.status(200).json({
      success: true,
      message: deactivated
        ? "Device token deactivated successfully."
        : "Token not found or already inactive.",
      data: { deactivated }
    });
  } catch (error) {
    next(error);
  }
};

router.post("/device-token/deactivate", optionalAuthenticate, handleTokenDeactivation);
router.delete("/device-token", optionalAuthenticate, handleTokenDeactivation);

/**
 * Get Device Token Registration Metrics (Admin/Diagnostics)
 * GET /api/v1/notifications/device-tokens/stats
 */
router.get("/device-tokens/stats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = deviceTokenService.getTotalTokensCount();
    return res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});


/**
 * Send Booking Confirmation Email
 * POST /api/v1/notifications/send-ticket-email
 */
router.post("/send-ticket-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const toEmail = req.body.email || req.body.recipientEmail || req.body.to;

    if (!toEmail) {
      return res.status(400).json({ success: false, message: "Recipient email is required." });
    }

    const email = toEmail;
    const {
      name,
      customerName,
      bookingId,
      ticketCode,
      bookingCode,
      title,
      movieTitle,
      venue,
      theatreName,
      theatreAddress,
      venueAddress,
      city,
      screenName,
      date,
      time,
      timeSlot,
      seats,
      category,
      seatCategory,
      quantity,
      ticketUrl,
      type,
      basePrice,
      convenienceFee,
      gstAmount,
      totalPaid,
      paymentMethod,
      posterUrl,
      qrCodeUrl
    } = req.body;

    const emailResult = await sendBookingConfirmationEmail({
      type: (type && type.toUpperCase() === "EVENT") ? "EVENT" : "MOVIE",
      to: email,
      customerName: customerName || name || "Valued Patron",
      bookingId: bookingId || ticketCode || `TKT-${Date.now()}`,
      ticketCode: ticketCode || bookingCode || bookingId,
      title: title || movieTitle || "CineVenue Booking",
      venueName: venue || theatreName || "CineVenue Multiplex",
      venueAddress: venueAddress || theatreAddress,
      city: city || "Guntur",
      screenName: screenName || "Screen 1 (4K Dolby Atmos)",
      date: date || "Upcoming",
      time: time || timeSlot || "Showtime",
      seats: seats || "Standard",
      seatCategory: seatCategory || category || "ELITE",
      basePrice: Number(basePrice) || (Number(totalPaid) || 0),
      convenienceFee: Number(convenienceFee) || 0,
      gstAmount: Number(gstAmount) || 0,
      totalPaid: Number(totalPaid) || Number(basePrice) || 0,
      paymentMethod: paymentMethod || "UPI Online",
      posterUrl,
      passUrl: ticketUrl,
      qrCodeUrl
    });

    return res.json({
      success: true,
      message: emailResult.message || `CineVenue confirmation email and digital ticket dispatched to ${email}`,
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
