const crypto = require("crypto");
const EventTicket = require("../models/EventTicket");
const TicketScan = require("../models/TicketScan");

// 1. POST /api/v1/ticket-verification/verify (Check ticket validity without consuming it)
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketId, token, hash: directHash } = req.body;

    if (!ticketId) {
      return res.status(400).json({ valid: false, status: "INVALID", message: "ticketId is required" });
    }

    // Compute SHA-256 hash from provided raw token, or directHash if provided
    const hash = token
      ? crypto.createHash("sha256").update(token).digest("hex")
      : directHash;

    const query = { ticketId };
    if (hash) query.qrHash = hash;

    const ticket = await EventTicket.findOne(query).populate("ticketTypeId");

    if (!ticket) {
      return res.json({
        valid: false,
        status: "INVALID",
        message: "Unrecognized ticket or counterfeit QR code",
      });
    }

    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      return res.json({
        valid: false,
        status: ticket.status,
        message: `Ticket has been ${ticket.status.toLowerCase()}`,
      });
    }

    if (ticket.status === "USED") {
      return res.json({
        valid: false,
        status: "ALREADY_USED",
        message: `Ticket was already scanned at ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString("en-IN") : "venue entrance"}`,
        checkedInAt: ticket.checkedInAt,
      });
    }

    return res.json({
      valid: true,
      status: "VALID",
      ticket: {
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        category: ticket.ticketTypeId?.name || "General Admission",
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, status: "ERROR", message: error.message });
  }
};

// 2. POST /api/v1/ticket-verification/check-in (Atomic transition VALID -> USED)
exports.checkInTicket = async (req, res) => {
  try {
    const { ticketId, token, hash: directHash, deviceInfo } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, status: "INVALID", message: "ticketId is required" });
    }

    const hash = token
      ? crypto.createHash("sha256").update(token).digest("hex")
      : directHash;

    const query = { ticketId, status: "VALID" };
    if (hash) query.qrHash = hash;

    // Atomic update to eliminate race conditions between multiple handheld scanners
    const ticket = await EventTicket.findOneAndUpdate(
      query,
      {
        $set: {
          status: "USED",
          checkedInAt: new Date(),
          checkedInBy: req.user ? req.user.id : null,
        },
      },
      { new: true }
    ).populate("ticketTypeId");

    if (!ticket) {
      // Find reason for rejection for audit logging
      const existing = await EventTicket.findOne({ ticketId });
      let resultStatus = "INVALID";
      if (existing) {
        if (existing.status === "USED") resultStatus = "ALREADY_USED";
        else if (existing.status === "CANCELLED" || existing.status === "REFUNDED") resultStatus = "CANCELLED";
      }

      if (existing) {
        await TicketScan.create({
          ticketId: existing._id,
          eventId: existing.eventId,
          scannedBy: req.user ? req.user.id : null,
          result: resultStatus,
          deviceInfo: deviceInfo || req.headers["user-agent"] || "Gate Scanner",
          ipAddress: req.ip || "127.0.0.1",
        }).catch(() => {});
      }

      return res.status(400).json({
        success: false,
        status: "ALREADY_USED_OR_INVALID",
        message: existing?.status === "USED"
          ? `Ticket was already checked in at ${new Date(existing.checkedInAt).toLocaleTimeString("en-IN")}`
          : "Ticket could not be checked in (Invalid or already used)",
      });
    }

    // Record successful scan in audit trail
    await TicketScan.create({
      ticketId: ticket._id,
      eventId: ticket.eventId,
      scannedBy: req.user ? req.user.id : null,
      result: "VALID",
      deviceInfo: deviceInfo || req.headers["user-agent"] || "Gate Scanner",
      ipAddress: req.ip || "127.0.0.1",
    });

    return res.json({
      success: true,
      status: "CHECKED_IN",
      message: "Check-in successful! Welcome to the event.",
      ticket: {
        ticketId: ticket.ticketId,
        customerName: ticket.customer?.name,
        category: ticket.ticketTypeId?.name || "General",
        checkedInAt: ticket.checkedInAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, status: "ERROR", message: error.message });
  }
};

// 3. GET /api/v1/admin/events/:eventId/check-ins (Audit trail)
exports.adminGetEventCheckIns = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { result, page = 1, limit = 50 } = req.query;

    const query = { eventId };
    if (result) query.result = result;

    const scans = await TicketScan.find(query)
      .populate("ticketId", "ticketId customer")
      .populate("scannedBy", "name email")
      .sort({ scannedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await TicketScan.countDocuments(query);

    res.json({
      success: true,
      count: scans.length,
      total,
      scans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
