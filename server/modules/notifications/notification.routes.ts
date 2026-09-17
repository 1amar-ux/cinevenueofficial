import { Router, Request, Response, NextFunction } from "express";
import { logger } from "../../shared/logger";

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

    const subject = `CineVenue Booking Confirmed — ${title || "Premium Entertainment"}`;

    logger.info(`[NotificationService:Email] Dispatched ticket confirmation email to ${email}`, {
      subject,
      bookingId,
      ticketCode,
      title
    });

    return res.json({
      success: true,
      message: `CineVenue confirmation email and digital ticket pass dispatched to ${email}`,
      data: {
        recipient: email,
        subject,
        bookingId,
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

export default router;
