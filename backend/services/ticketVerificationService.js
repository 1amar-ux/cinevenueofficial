const EventTicket = require("../models/EventTicket");
const Event = require("../models/Event");
const TicketScan = require("../models/TicketScan");

/**
 * Scan and verify ticket QR token/hash at venue entrance
 *
 * @param {Object} params
 * @param {string} params.qrHash - Scanned QR Hash or Token
 * @param {string} params.eventId - Expected Event ID
 * @param {string} [params.ticketId] - Optional direct Ticket ID fallback
 * @param {string} [params.scannedBy] - User ID of security/staff scanner
 * @param {string} [params.deviceInfo] - Scanner hardware/browser info
 * @param {string} [params.ipAddress] - IP Address of scanner
 * @returns {Promise<{valid: boolean, result: string, message: string, ticket?: Object}>}
 */
exports.scanAndVerifyTicket = async ({
  qrHash,
  ticketId,
  eventId,
  scannedBy = null,
  deviceInfo = "Gate Scanner",
  ipAddress = "127.0.0.1",
}) => {
  if (!qrHash && !ticketId) {
    return {
      valid: false,
      result: "INVALID",
      message: "No QR Hash or Ticket ID provided",
    };
  }

  // Lookup Ticket
  const query = {};
  if (qrHash) query.qrHash = qrHash;
  else if (ticketId) query.ticketId = ticketId;

  const ticket = await EventTicket.findOne(query)
    .populate("ticketTypeId")
    .populate("eventId");

  // Case 1: Ticket not found
  if (!ticket) {
    if (eventId) {
      await TicketScan.create({
        ticketId: null,
        eventId,
        scannedBy,
        result: "INVALID",
        deviceInfo,
        ipAddress,
        scannedAt: new Date(),
      }).catch(() => {});
    }

    return {
      valid: false,
      result: "INVALID",
      message: "Unrecognized ticket or counterfeit QR code",
    };
  }

  // Case 2: Wrong event validation
  if (eventId && ticket.eventId._id.toString() !== eventId.toString()) {
    await TicketScan.create({
      ticketId: ticket._id,
      eventId: ticket.eventId._id,
      scannedBy,
      result: "INVALID",
      deviceInfo,
      ipAddress,
      scannedAt: new Date(),
    });

    return {
      valid: false,
      result: "INVALID",
      message: `Ticket is for a different event: '${ticket.eventId.title}'`,
      ticket: {
        ticketId: ticket.ticketId,
        eventTitle: ticket.eventId.title,
      },
    };
  }

  // Case 3: Already Used / Checked In
  if (ticket.status === "USED") {
    await TicketScan.create({
      ticketId: ticket._id,
      eventId: ticket.eventId._id,
      scannedBy,
      result: "ALREADY_USED",
      deviceInfo,
      ipAddress,
      scannedAt: new Date(),
    });

    return {
      valid: false,
      result: "ALREADY_USED",
      message: `Ticket already checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString("en-IN")}`,
      ticket: {
        ticketId: ticket.ticketId,
        customerName: ticket.customer.name,
        checkedInAt: ticket.checkedInAt,
      },
    };
  }

  // Case 4: Cancelled or Refunded
  if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
    await TicketScan.create({
      ticketId: ticket._id,
      eventId: ticket.eventId._id,
      scannedBy,
      result: "CANCELLED",
      deviceInfo,
      ipAddress,
      scannedAt: new Date(),
    });

    return {
      valid: false,
      result: "CANCELLED",
      message: `Ticket has been ${ticket.status.toLowerCase()}`,
      ticket: {
        ticketId: ticket.ticketId,
        status: ticket.status,
      },
    };
  }

  // Case 5: Valid Check-In!
  if (ticket.status === "VALID") {
    ticket.status = "USED";
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = scannedBy;
    await ticket.save();

    await TicketScan.create({
      ticketId: ticket._id,
      eventId: ticket.eventId._id,
      scannedBy,
      result: "VALID",
      deviceInfo,
      ipAddress,
      scannedAt: new Date(),
    });

    return {
      valid: true,
      result: "VALID",
      message: "Check-in successful! Welcome to the event.",
      ticket: {
        ticketId: ticket.ticketId,
        ticketNumber: ticket.ticketNumber,
        category: ticket.ticketTypeId?.name || "General",
        customerName: ticket.customer.name,
        customerEmail: ticket.customer.email,
        checkedInAt: ticket.checkedInAt,
      },
    };
  }

  return {
    valid: false,
    result: "INVALID",
    message: "Invalid ticket status",
  };
};

/**
 * Get scan history for audit trail
 */
exports.getEventScanHistory = async (eventId, limit = 50) => {
  return await TicketScan.find({ eventId })
    .populate("ticketId")
    .populate("scannedBy", "name email role")
    .sort({ scannedAt: -1 })
    .limit(limit);
};
