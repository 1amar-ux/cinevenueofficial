import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../shared/logger";
import { readPersistedFileSettings } from "../middleware/maintenance";

export interface EventPassEmailParams {
  to: string;
  passId: string;
  orderId?: string;
  eventTitle: string;
  attendeeName: string;
  venueName: string;
  venueAddress?: string;
  date: string;
  day?: string;
  time: string;
  tier?: string;
  totalPrice?: number | string;
  qrCodeUrl?: string;
  passUrl?: string;
  posterUrl?: string;
  isFree?: boolean;
}

export interface GenericTicketEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Returns a configured Nodemailer transporter or null if credentials are not configured.
 */
export function getMailTransporter(): Transporter | null {
  const fileSettings = (typeof readPersistedFileSettings === 'function' ? readPersistedFileSettings() : {}) || {};
  const emailCfg = fileSettings.emailConfig || {};

  const host = process.env.SMTP_HOST || env.SMTP_HOST || emailCfg.smtpHost || emailCfg.host;
  const port = Number(process.env.SMTP_PORT || env.SMTP_PORT || emailCfg.smtpPort || emailCfg.port) || 587;
  const user = process.env.EMAIL_USER || env.EMAIL_USER || process.env.SMTP_USER || env.SMTP_USER || emailCfg.email || emailCfg.user || emailCfg.senderEmail;
  const pass = process.env.EMAIL_PASS || env.EMAIL_PASS || process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || process.env.SMTP_PASS || env.SMTP_PASS || emailCfg.pass || emailCfg.password || emailCfg.appPassword;
  const secure = (process.env.SMTP_SECURE || env.SMTP_SECURE || String(emailCfg.secure)) === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  if (user && pass) {
    // Default to Gmail or standard service when user/pass are provided without custom host
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Sends a rich, branded CineVenue Event Pass email directly to the attendee.
 */
export async function sendEventPassEmail(params: EventPassEmailParams): Promise<{ success: boolean; message: string; liveSent: boolean }> {
  const {
    to,
    passId,
    orderId,
    eventTitle,
    attendeeName,
    venueName,
    venueAddress,
    date,
    day,
    time,
    tier = "VIP PASS",
    totalPrice = 0,
    qrCodeUrl,
    passUrl,
    posterUrl,
    isFree = false
  } = params;

  if (!to || !to.includes("@")) {
    return { success: false, message: "A valid recipient email address is required.", liveSent: false };
  }

  const transporter = getMailTransporter();
  const fromAddress = process.env.SMTP_FROM || env.SMTP_FROM || process.env.EMAIL_USER || env.EMAIL_USER || "tickets@cinevenue.in";
  const fromHeader = `"CineVenue Live" <${fromAddress}>`;

  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(passId)}`;
  const qrImage = qrCodeUrl || fallbackQr;
  const webPassUrl = passUrl || `https://cinevenue.in/events/pass/${encodeURIComponent(passId)}`;
  const priceDisplay = isFree || Number(totalPrice) === 0 ? "COMPLIMENTARY PASS" : `₹${totalPrice}`;

  const subject = `🎟️ Official Pass Confirmed: ${eventTitle} [Pass #${passId}]`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventTitle} - CineVenue Official Pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060608; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Pass Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background: #0F0F14; border: 2px solid #E5A93C; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C190D 0%, #2E250A 50%, #15130A 100%); padding: 18px 24px; border-bottom: 1px solid rgba(229,169,60,0.5);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 800; color: #E5A93C; letter-spacing: 2px; text-transform: uppercase;">OFFICIAL ADMISSION</div>
                    <div style="font-size: 18px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; margin-top: 2px;">CINEVENUE</div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background: #E5A93C; color: #000000; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 6px 14px; border-radius: 999px; text-transform: uppercase;">
                      ${isFree ? "FREE ENTRY" : tier}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${posterUrl ? `
          <!-- Poster Banner -->
          <tr>
            <td style="background: #000000; padding: 12px; text-align: center;">
              <img src="${posterUrl}" alt="${eventTitle}" style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(229,169,60,0.3); display: block;" />
            </td>
          </tr>
          ` : ""}

          <!-- Event Details Body -->
          <tr>
            <td style="padding: 24px;">
              
              <!-- Event Title -->
              <div style="border-left: 3px solid #E5A93C; padding-left: 12px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; line-height: 1.2;">${eventTitle}</h1>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">Pass Holder: <strong style="color: #FFFFFF;">${attendeeName}</strong></p>
              </div>

              <!-- Two Column Date & Venue Block -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <!-- Date Column -->
                  <td width="48%" style="vertical-align: top; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px;">
                    <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">DATE & DAY</div>
                    <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-top: 4px;">${date}</div>
                    ${day ? `<div style="font-size: 12px; font-weight: 700; color: #E5A93C; margin-top: 2px;">${day}</div>` : ""}
                  </td>
                  <td width="4%"></td>
                  <!-- Venue Column -->
                  <td width="48%" style="vertical-align: top; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px;">
                    <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">TIME & VENUE</div>
                    <div style="font-size: 13px; font-weight: 800; color: #E5A93C; margin-top: 4px;">${time}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #FFFFFF; margin-top: 2px; line-height: 1.3;">${venueName}</div>
                    ${venueAddress ? `<div style="font-size: 10px; color: #6B7280; margin-top: 2px;">${venueAddress}</div>` : ""}
                  </td>
                </tr>
              </table>

              <!-- Order / Tier Bar -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(229,169,60,0.06); border: 1px solid rgba(229,169,60,0.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;">
                <tr>
                  <td align="left">
                    <span style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; display: block;">Registration Fee</span>
                    <strong style="font-size: 14px; color: #E5A93C; font-family: monospace;">${priceDisplay}</strong>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; display: block;">Booking Status</span>
                    <strong style="font-size: 12px; color: #10B981; font-weight: 800;">● CONFIRMED</strong>
                  </td>
                </tr>
              </table>

              <!-- Scannable Barcode & QR Centerpiece -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #08080C; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: #FFFFFF; padding: 10px; border-radius: 12px; border: 2px solid #E5A93C;">
                      <img src="${qrImage}" width="160" height="160" alt="Official Admission QR" style="display: block;" />
                    </div>
                    <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #E5A93C; letter-spacing: 2px; margin-top: 14px;">${passId}</div>
                    <div style="display: inline-block; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10B981; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; margin-top: 8px; text-transform: uppercase;">
                      ● SCAN AT VENUE ENTRY GATE
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button to View Pass -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="${webPassUrl}" style="display: inline-block; background: #E5A93C; color: #000000; text-decoration: none; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 15px rgba(229,169,60,0.35);">
                  View & Download Live Pass
                </a>
                <div style="font-size: 11px; color: #6B7280; margin-top: 10px;">
                  Keep this email or pass ready on your phone screen upon arrival.
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #08080C; padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 10px; color: #E5A93C; font-family: monospace; letter-spacing: 1px; font-weight: 700;">CINEVENUE ENTERTAINMENTS • OFFICIAL PASS</div>
              <div style="font-size: 10px; color: #4B5563; margin-top: 4px;">Order ID: ${orderId || passId} • Verified Digital Security</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const plainText = `
CINEVENUE EVENT PASS CONFIRMATION
=================================
Event: ${eventTitle}
Attendee: ${attendeeName}
Pass ID: ${passId}
Date: ${date} ${day ? `(${day})` : ""}
Time: ${time}
Venue: ${venueName} ${venueAddress ? `- ${venueAddress}` : ""}
Tier: ${tier}
Fee: ${priceDisplay}
Status: CONFIRMED

Live Pass Link: ${webPassUrl}
QR Code Reference: ${qrImage}

Please show this pass ID or the QR code at the venue gate for direct admission.
© CineVenue Entertainments
`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
        text: plainText
      });
      logger.info(`[EmailService] Live email successfully dispatched via SMTP to ${to} for Pass ${passId}`);
      return {
        success: true,
        message: `Official CineVenue Event Pass [${passId}] delivered to ${to}!`,
        liveSent: true
      };
    } catch (err: any) {
      logger.error(`[EmailService] SMTP transmission error to ${to}: ${err.message}`);
      return {
        success: false,
        message: `Failed to deliver email via SMTP: ${err.message}`,
        liveSent: false
      };
    }
  } else {
    logger.warn(`[EmailService] Notice: SMTP credentials (SMTP_HOST/SMTP_USER/SMTP_PASSWORD or EMAIL_USER/EMAIL_PASS) are not configured in .env. Pass [${passId}] prepared for ${to}.`);
    return {
      success: true,
      message: `Pass recorded for ${to}. (Note: configure SMTP in server .env to deliver live emails).`,
      liveSent: false
    };
  }
}
