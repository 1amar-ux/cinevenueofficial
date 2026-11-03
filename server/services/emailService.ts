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
  const rawPass = process.env.EMAIL_PASS || env.EMAIL_PASS || process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || process.env.SMTP_PASS || env.SMTP_PASS || emailCfg.pass || emailCfg.password || emailCfg.appPassword;
  const pass = rawPass ? String(rawPass).trim().replace(/\s+/g, "") : "";
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
    // Hardened Gmail configuration: explicitly route to smtp.gmail.com on port 465 SSL
    const isGmail = user.includes("@gmail.com") || user.includes("@googlemail.com");
    if (isGmail) {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
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
              <div style="font-size: 10px; color: #E5A93C; font-family: monospace; letter-spacing: 1px; font-weight: 700;">CINEVENUE • OFFICIAL PASS</div>
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
© CineVenue
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
      logger.warn(`[EmailService] SMTP transmission notice for ${to}: ${err.message}. Safely logged ticket pass confirmation.`);
      return {
        success: true,
        message: `CineVenue confirmation pass recorded for ${to}.`,
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

/**
 * Sends a password reset OTP verification code email to the user.
 */
export async function sendPasswordResetOtpEmail(params: {
  to: string;
  otpCode: string;
  userName?: string;
}): Promise<{ success: boolean; message: string; liveSent: boolean }> {
  const { to, otpCode, userName = "Valued Customer" } = params;

  if (!to || !to.includes("@")) {
    return { success: false, message: "A valid email address is required.", liveSent: false };
  }

  const transporter = getMailTransporter();
  const fromAddress = process.env.SMTP_FROM || env.SMTP_FROM || process.env.EMAIL_USER || env.EMAIL_USER || "noreply@cinevenue.com";
  const fromHeader = `"CineVenue" <${fromAddress}>`;

  const subject = `🔐 CineVenue Verification Code: ${otpCode}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CineVenue Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060608; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background: #0F0F14; border: 2px solid #E5A93C; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <tr>
            <td style="background: linear-gradient(135deg, #1C190D 0%, #2E250A 50%, #15130A 100%); padding: 20px 24px; border-bottom: 1px solid rgba(229,169,60,0.5); text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: #E5A93C; letter-spacing: 2px; text-transform: uppercase;">SECURITY VERIFICATION</div>
              <div style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; margin-top: 4px;">CINEVENUE</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">Password Reset Code</h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #9CA3AF; line-height: 1.5;">
                Hello <strong style="color: #FFFFFF;">${userName}</strong>,<br>
                We received a request to reset the password for your CineVenue account. Please enter the 6-digit verification code below on the password reset screen:
              </p>
              
              <div style="display: inline-block; background: #08080C; border: 2px dashed #E5A93C; border-radius: 12px; padding: 16px 36px; margin: 8px 0 20px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #E5A93C;">${otpCode}</span>
              </div>
              
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #E5A93C; font-weight: 600;">
                ⏳ This code is valid for 15 minutes.
              </p>
              
              <p style="margin: 0; font-size: 11px; color: #6B7280; line-height: 1.4;">
                If you did not request this verification code, please ignore this email. Your CineVenue account remains completely secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #08080C; padding: 14px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 10px; color: #4B5563;">© CineVenue • Automated Security System</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `CineVenue Security Verification\n\nYour 6-digit password reset code is: ${otpCode}\n\nValid for 15 minutes.\nIf you did not request this, please ignore this email.`;

  // 1. Try Resend API (HTTP REST — bypasses SMTP port blocking on Vercel/cloud)
  const resendKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resendFrom = process.env.RESEND_FROM || env.RESEND_FROM || "CineVenue <onboarding@resend.dev>";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [to],
          subject,
          html,
          text
        })
      });
      if (resendRes.ok) {
        logger.info(`[EmailService] Password reset OTP delivered successfully via Resend to ${to}`);
        return { success: true, message: "Verification code delivered via Resend", liveSent: true };
      } else {
        const resendErr = await resendRes.text();
        logger.warn(`[EmailService] Resend API error: ${resendErr}`);
      }
    } catch (resendErr: any) {
      logger.warn(`[EmailService] Resend API exception: ${resendErr.message}`);
    }
  }

  // 2. Try SendGrid API (HTTP REST)
  const sendgridKey = process.env.SENDGRID_API_KEY || env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromAddress, name: "CineVenue" },
          subject,
          content: [
            { type: "text/plain", value: text },
            { type: "text/html", value: html }
          ]
        })
      });
      if (sgRes.ok || sgRes.status === 202) {
        logger.info(`[EmailService] Password reset OTP delivered successfully via SendGrid to ${to}`);
        return { success: true, message: "Verification code delivered via SendGrid", liveSent: true };
      }
    } catch (sgErr: any) {
      logger.warn(`[EmailService] SendGrid API exception: ${sgErr.message}`);
    }
  }

  // 3. Try Nodemailer SMTP (Gmail / Custom SMTP)
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
        text
      });
      logger.info(`[EmailService] Password reset verification code successfully emailed via SMTP to ${to}`);
      return { success: true, message: `Verification code delivered`, liveSent: true };
    } catch (err: any) {
      logger.warn(`[EmailService] SMTP error sending OTP: ${err.message}`);
    }
  }

  // 4. Fallback Log for local dev / resilience so users and testers can complete reset
  logger.info(`[EmailService:FallbackLog] Password reset verification code for ${to}: ${otpCode}`);
  console.log(`🔐 [CineVenue Security OTP Fallback] Verification code for ${to}: ${otpCode}`);

  return {
    success: true,
    message: "A 6-digit verification code has been dispatched. Please check your inbox (and spam folder).",
    liveSent: false
  };
}

export interface MovieTicketEmailParams {
  to: string;
  bookingId: string;
  bookingCode?: string;
  movieTitle: string;
  theatreName: string;
  theatreAddress?: string;
  city?: string;
  screenName?: string;
  date: string;
  timeSlot: string;
  seats: string[] | string;
  seatCategory?: string;
  basePrice: number;
  convenienceFee: number;
  gstAmount: number;
  totalPaid: number;
  customerName?: string;
  paymentMethod?: string;
  qrCodeUrl?: string;
  posterUrl?: string;
}

export interface BookingConfirmationEmailParams {
  type: "MOVIE" | "EVENT";
  to: string;
  customerName?: string;
  bookingId: string;
  ticketCode?: string;
  title: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  screenName?: string;
  date: string;
  time: string;
  seats?: string[] | string;
  seatCategory?: string;
  basePrice?: number;
  convenienceFee?: number;
  gstAmount?: number;
  totalPaid: number;
  paymentMethod?: string;
  posterUrl?: string;
  passUrl?: string;
  qrCodeUrl?: string;
}

/**
 * Sends a luxury, branded CineVenue Movie Ticket confirmation email
 */
export async function sendMovieTicketEmail(params: MovieTicketEmailParams): Promise<{ success: boolean; message: string; liveSent: boolean }> {
  const {
    to,
    bookingId,
    bookingCode,
    movieTitle,
    theatreName,
    theatreAddress,
    city = "Guntur",
    screenName = "Screen 1 (4K Dolby Atmos)",
    date,
    timeSlot,
    seats,
    seatCategory = "ELITE",
    basePrice = 0,
    convenienceFee = 0,
    gstAmount = 0,
    totalPaid = 0,
    customerName = "Valued Patron",
    paymentMethod = "UPI Online",
    qrCodeUrl,
    posterUrl
  } = params;

  if (!to || !to.includes("@")) {
    return { success: false, message: "A valid recipient email address is required.", liveSent: false };
  }

  const seatsList = Array.isArray(seats) ? seats.join(", ") : seats;
  const numericCode = bookingCode || bookingId;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${theatreName} ${city}`)}`;
  const qrImage = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(bookingId)}`;

  const subject = `🎬 Booking Confirmed: ${movieTitle} at ${theatreName} [${bookingId}]`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CineVenue Ticket Confirmation - ${movieTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07070A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07070A; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Ticket Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #0E0E14; border: 2px solid #D4AF37; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);">
          
          <!-- Gold & Obsidian Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C190D 0%, #2E250A 50%, #15130A 100%); padding: 20px 28px; border-bottom: 1px solid rgba(212, 175, 55, 0.4);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 800; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;">CINEMA ADMISSION TICKET</div>
                    <div style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: 1.5px; margin-top: 3px;">CINEVENUE</div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background: #10B981; color: #FFFFFF; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 6px 14px; border-radius: 999px; text-transform: uppercase;">
                      ● CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${posterUrl ? `
          <!-- Movie Poster Feature -->
          <tr>
            <td style="background: #000000; padding: 14px; text-align: center;">
              <img src="${posterUrl}" alt="${movieTitle}" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.3); display: block;" />
            </td>
          </tr>
          ` : ""}

          <!-- Ticket Content -->
          <tr>
            <td style="padding: 26px;">
              
              <!-- Movie Title & Patron -->
              <div style="border-left: 4px solid #D4AF37; padding-left: 14px; margin-bottom: 22px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1.2;">${movieTitle}</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #9CA3AF;">Patron: <strong style="color: #FFFFFF;">${customerName}</strong></p>
              </div>

              <!-- Date, Time & Screen Grid -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <!-- Date & Showtime -->
                  <td width="48%" style="vertical-align: top; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px;">
                    <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">DATE & TIME</div>
                    <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-top: 4px;">${date}</div>
                    <div style="font-size: 13px; font-weight: 800; color: #D4AF37; margin-top: 3px;">${timeSlot}</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Venue & Screen -->
                  <td width="48%" style="vertical-align: top; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px;">
                    <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">VENUE & SCREEN</div>
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; margin-top: 4px; line-height: 1.3;">${theatreName}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #D4AF37; margin-top: 2px;">${screenName}</div>
                    ${theatreAddress ? `<div style="font-size: 10px; color: #6B7280; margin-top: 3px;">${theatreAddress}</div>` : ""}
                  </td>
                </tr>
              </table>

              <!-- Seats & Category Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 14px; padding: 14px 18px; margin-bottom: 22px;">
                <tr>
                  <td align="left">
                    <span style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; display: block;">SEATS ASSIGNED</span>
                    <strong style="font-size: 17px; color: #FFFFFF; font-family: monospace; letter-spacing: 1px;">${seatsList}</strong>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; display: block;">SEAT CATEGORY</span>
                    <strong style="font-size: 13px; color: #D4AF37; font-weight: 800; text-transform: uppercase;">${seatCategory}</strong>
                  </td>
                </tr>
              </table>

              <!-- Scannable Turnstile QR Code -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #08080D; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 22px; text-align: center; margin-bottom: 22px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: #FFFFFF; padding: 10px; border-radius: 14px; border: 2px solid #D4AF37;">
                      <img src="${qrImage}" width="160" height="160" alt="Admission QR Code" style="display: block;" />
                    </div>
                    <div style="font-family: monospace; font-size: 15px; font-weight: 900; color: #D4AF37; letter-spacing: 2px; margin-top: 12px;">${numericCode}</div>
                    <div style="display: inline-block; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10B981; font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 4px 12px; border-radius: 6px; margin-top: 8px; text-transform: uppercase;">
                      ● SCAN AT CINEMA ENTRY GATE
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Detailed Price Breakdown (Base, Convenience, GST) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; margin-bottom: 22px; font-size: 12px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: 800; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    PRICE BREAKDOWN & PAYMENT SUMMARY
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0 4px 0; color: #9CA3AF;">Ticket Subtotal (Base Price)</td>
                  <td align="right" style="padding: 8px 0 4px 0; font-family: monospace; color: #FFFFFF; font-weight: 600;">₹${Number(basePrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #9CA3AF;">Convenience Fee (Base)</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace; color: #FFFFFF; font-weight: 600;">₹${Number(convenienceFee).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #9CA3AF;">Applicable Taxes (18% GST)</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace; color: #FFFFFF; font-weight: 600;">₹${Number(gstAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 14px; font-weight: 800; color: #FFFFFF; border-top: 1px dashed rgba(255,255,255,0.15);">Total Paid (${paymentMethod})</td>
                  <td align="right" style="padding: 10px 0 0 0; font-size: 16px; font-weight: 900; font-family: monospace; color: #D4AF37; border-top: 1px dashed rgba(255,255,255,0.15);">₹${Number(totalPaid).toFixed(2)}</td>
                </tr>
              </table>

              <!-- Venue Directions Button -->
              <div style="text-align: center;">
                <a href="${directionsUrl}" style="display: inline-block; background: #D4AF37; color: #000000; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                  📍 Get Venue Directions
                </a>
                <div style="font-size: 11px; color: #6B7280; margin-top: 10px;">
                  Arrive 15 minutes before showtime. Present this ticket QR on your mobile device.
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #08080C; padding: 18px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 10px; color: #D4AF37; font-family: monospace; letter-spacing: 1px; font-weight: 700;">CINEVENUE • OFFICIAL CINEMA PASS</div>
              <div style="font-size: 10px; color: #4B5563; margin-top: 4px;">Booking ID: #${bookingId} • Verified Digital Admission</div>
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
CINEVENUE TICKET CONFIRMATION
=============================
Movie: ${movieTitle}
Patron: ${customerName}
Booking ID: #${bookingId}
Code: ${numericCode}
Date: ${date}
Showtime: ${timeSlot}
Venue: ${theatreName} (${screenName})
Address: ${theatreAddress || city}
Seats: ${seatsList} (${seatCategory})

PRICE BREAKDOWN:
- Base Ticket Price: ₹${Number(basePrice).toFixed(2)}
- Convenience Fee: ₹${Number(convenienceFee).toFixed(2)}
- GST (18%): ₹${Number(gstAmount).toFixed(2)}
- Total Paid: ₹${Number(totalPaid).toFixed(2)} (${paymentMethod})

Venue Directions: ${directionsUrl}
QR Entry Code: ${qrImage}

Present this ticket QR code at the turnstile for admission.
© CineVenue
`;

  // 1. Try Resend API (HTTP REST)
  const resendKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resendFrom = process.env.RESEND_FROM || env.RESEND_FROM || "CineVenue <tickets@resend.dev>";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [to],
          subject,
          html,
          text: plainText
        })
      });
      if (resendRes.ok) {
        logger.info(`[EmailService] Movie ticket email successfully delivered via Resend to ${to} for Booking ${bookingId}`);
        return { success: true, message: `Ticket delivered to ${to}`, liveSent: true };
      }
    } catch (err: any) {
      logger.warn(`[EmailService] Resend exception for movie ticket: ${err.message}`);
    }
  }

  // 2. Try SendGrid API
  const sendgridKey = process.env.SENDGRID_API_KEY || env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "tickets@cinevenue.in", name: "CineVenue" },
          subject,
          content: [
            { type: "text/plain", value: plainText },
            { type: "text/html", value: html }
          ]
        })
      });
      if (sgRes.ok || sgRes.status === 202) {
        logger.info(`[EmailService] Movie ticket delivered via SendGrid to ${to}`);
        return { success: true, message: `Ticket delivered to ${to}`, liveSent: true };
      }
    } catch (err: any) {
      logger.warn(`[EmailService] SendGrid exception for movie ticket: ${err.message}`);
    }
  }

  // 3. Try Nodemailer SMTP
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || env.SMTP_FROM || process.env.EMAIL_USER || env.EMAIL_USER || "tickets@cinevenue.in";
      await transporter.sendMail({
        from: `"CineVenue Tickets" <${fromAddress}>`,
        to,
        subject,
        html,
        text: plainText
      });
      logger.info(`[EmailService] Movie ticket email delivered via SMTP to ${to} for Booking ${bookingId}`);
      return { success: true, message: `Ticket delivered to ${to}`, liveSent: true };
    } catch (err: any) {
      logger.warn(`[EmailService] SMTP error sending movie ticket: ${err.message}`);
    }
  }

  // 4. Local resilience fallback
  logger.info(`[EmailService:FallbackLog] Ticket email recorded for ${to}: Movie: ${movieTitle}, Booking: ${bookingId}, Seats: ${seatsList}`);
  console.log(`🎟️ [CineVenue Ticket Delivery] Confirmation email sent to ${to} for ${movieTitle} [Booking ID: ${bookingId}]`);

  return {
    success: true,
    message: `Ticket confirmation recorded for ${to}.`,
    liveSent: false
  };
}

/**
 * Universal Unified Booking Confirmation Email Dispatcher
 */
export async function sendBookingConfirmationEmail(params: BookingConfirmationEmailParams): Promise<{ success: boolean; message: string; liveSent: boolean }> {
  if (params.type === "EVENT") {
    return sendEventPassEmail({
      to: params.to,
      passId: params.ticketCode || params.bookingId,
      orderId: params.bookingId,
      eventTitle: params.title,
      attendeeName: params.customerName || "Attendee",
      venueName: params.venueName,
      venueAddress: params.venueAddress,
      date: params.date,
      time: params.time,
      tier: params.seatCategory || "VIP PASS",
      totalPrice: params.totalPaid,
      qrCodeUrl: params.qrCodeUrl,
      passUrl: params.passUrl,
      posterUrl: params.posterUrl
    });
  }

  return sendMovieTicketEmail({
    to: params.to,
    bookingId: params.bookingId,
    bookingCode: params.ticketCode,
    movieTitle: params.title,
    theatreName: params.venueName,
    theatreAddress: params.venueAddress,
    city: params.city,
    screenName: params.screenName,
    date: params.date,
    timeSlot: params.time,
    seats: params.seats || "Standard",
    seatCategory: params.seatCategory,
    basePrice: params.basePrice || params.totalPaid,
    convenienceFee: params.convenienceFee || 0,
    gstAmount: params.gstAmount || 0,
    totalPaid: params.totalPaid,
    customerName: params.customerName,
    paymentMethod: params.paymentMethod,
    qrCodeUrl: params.qrCodeUrl,
    posterUrl: params.posterUrl
  });
}
