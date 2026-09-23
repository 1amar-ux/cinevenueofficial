const nodemailer = require("nodemailer");
const fs = require("fs");

// Configure transporter dynamically from SMTP env or service config
let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send Event Ticket Confirmation Email with PDF Pass Attachment
 *
 * @param {Object} params
 * @param {Object} params.customer - { name, email, phone }
 * @param {Object} params.event - Event document
 * @param {Object} params.booking - EventBooking document
 * @param {string|string[]} [params.pdfPath] - Path(s) to generated ticket PDF(s)
 */
async function sendTicketEmail({ customer, event, booking, pdfPath }) {
  if (!customer?.email) return;

  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_USER || "info@cinevenue.com";
  const attachments = [];

  if (pdfPath) {
    const paths = Array.isArray(pdfPath) ? pdfPath : [pdfPath];
    paths.forEach((p, idx) => {
      if (fs.existsSync(p)) {
        attachments.push({
          filename: paths.length === 1 ? `CineVenue-Pass-${booking.bookingId}.pdf` : `CineVenue-Pass-${idx + 1}.pdf`,
          path: p,
          contentType: "application/pdf",
        });
      }
    });
  }

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date TBA";

  const mailOptions = {
    from: `"CineVenue Events" <${fromAddress}>`,
    to: customer.email,
    subject: `🎟️ Your CineVenue Event Ticket – ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #030712; padding: 24px; color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; background: #0B0F17; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; padding: 24px;">
          <div style="border-bottom: 2px solid #E50914; padding-bottom: 12px; margin-bottom: 20px;">
            <h1 style="color: #E50914; margin: 0; font-size: 24px; letter-spacing: 1px;">CINEVENUE</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0 0; font-size: 12px;">Official Event Ticketing & Pass Confirmation</p>
          </div>

          <h2 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 20px;">Booking Confirmed</h2>
          <p style="color: #D1D5DB; font-size: 14px; margin: 0 0 16px 0;">
            Hello <strong>${customer.name}</strong>,<br/>
            Your CineVenue event booking has been confirmed!
          </p>

          <div style="background: #161E2E; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 4px 0; color: #F3F4F6;"><strong>Event:</strong> ${event.title}</p>
            <p style="margin: 4px 0; color: #94A3B8;"><strong>Date:</strong> ${formattedDate} at ${event.startTime || "07:00 PM"}</p>
            <p style="margin: 4px 0; color: #94A3B8;"><strong>Venue:</strong> ${event.venue?.name || ""}, ${event.venue?.city || ""}</p>
            <p style="margin: 4px 0; color: #E50914;"><strong>Booking Reference:</strong> ${booking.bookingId}</p>
            <p style="margin: 4px 0; color: #10B981;"><strong>Total Amount:</strong> ₹${booking.pricing?.total || 0}</p>
          </div>

          <p style="color: #D1D5DB; font-size: 14px; margin-bottom: 16px;">
            Your official PDF ticket pass with entry QR code is attached to this email. You can also download it directly from your CineVenue account.
          </p>

          <div style="background: #1F2937; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #9CA3AF;">
            ⚡ <strong>Gate Entry Tip:</strong> Please keep this PDF ready on your mobile screen or bring a clear printout at the event venue.
          </div>

          <p style="color: #6B7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #1F2937; padding-top: 16px; text-align: center;">
            Regards,<br/>
            <strong>CineVenue Live Team</strong><br/>
            © 2026 CineVenue Entertainment Pvt Ltd.
          </p>
        </div>
      </div>
    `,
    attachments,
  };

  try {
    const isConfigured =
      Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD) ||
      Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (isConfigured) {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Ticket email dispatched for ${booking.bookingId} to ${customer.email}`);
    } else {
      console.log(`[EmailService] SMTP not configured. Simulated ticket dispatch to ${customer.email} (Attachment count: ${attachments.length})`);
    }
  } catch (err) {
    // Critical: Do NOT throw or cancel booking just because email delivery failed
    console.error(`[EmailService] Failed to send ticket email to ${customer.email}:`, err.message);
  }
}

module.exports = {
  sendTicketEmail,
};
