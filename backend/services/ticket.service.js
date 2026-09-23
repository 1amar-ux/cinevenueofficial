const crypto = require("crypto");
const EventTicket = require("../models/EventTicket");
const EventBooking = require("../models/EventBooking");

/**
 * Generate unique Ticket ID: CVT-XXXXXXXXXXXX
 */
function generateTicketId() {
  return `CVT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

/**
 * Generate 32-byte cryptographic QR Token
 */
function generateQRToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash QR Token with SHA-256 for secure storage & verification
 */
function hashQRToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate individual ticket records for a confirmed booking
 * Security note: Raw qrToken is NOT stored in MongoDB; only qrHash is stored.
 *
 * @param {Object} booking - Confirmed EventBooking document
 * @returns {Promise<Array<{ ticket: Object, qrToken: string }>>}
 */
async function generateTicketsForBooking(booking) {
  if (booking.status !== "CONFIRMED") {
    throw new Error("Booking is not confirmed");
  }

  if (booking.ticketGenerated) {
    const existing = await EventTicket.find({ bookingId: booking._id });
    return existing.map((t) => ({ ticket: t, qrToken: null }));
  }

  const tickets = [];
  let ticketIndex = 1;

  for (const item of booking.tickets) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketId = generateTicketId();
      const qrToken = generateQRToken();
      const qrHash = hashQRToken(qrToken);

      const ticket = await EventTicket.create({
        ticketId,
        bookingId: booking._id,
        eventId: booking.eventId,
        userId: booking.userId || null,
        ticketTypeId: item.ticketTypeId,
        ticketNumber: ticketIndex++,
        customer: booking.customer,
        qrToken: undefined, // Never store raw QR token in database
        qrHash,
        status: "VALID",
      });

      tickets.push({
        ticket,
        qrToken,
      });
    }
  }

  booking.ticketGenerated = true;
  await booking.save();

  return tickets;
}

module.exports = {
  generateTicketId,
  generateQRToken,
  hashQRToken,
  generateTicketsForBooking,
};
