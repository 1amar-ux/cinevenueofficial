const EventTicket = require("../models/EventTicket");
const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");
const { generateTicketPDF } = require("../services/eventPdfService");
const ticketVerificationService = require("../services/ticketVerificationService");

// 1. Get Individual Ticket Pass
exports.getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await EventTicket.findOne({
      $or: [{ ticketId }, { qrHash: ticketId }],
    })
      .populate("eventId")
      .populate("ticketTypeId");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Download Ticket as PDF
exports.downloadTicketPdf = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await EventTicket.findOne({ ticketId })
      .populate("eventId")
      .populate("ticketTypeId");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const pdfBuffer = await generateTicketPDF(ticket, ticket.eventId, ticket.ticketTypeId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CineVenue-Pass-${ticket.ticketId}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Scan & Verify Ticket at Gate
exports.scanTicket = async (req, res) => {
  try {
    const { qrHash, ticketId, eventId, deviceInfo } = req.body;

    const result = await ticketVerificationService.scanAndVerifyTicket({
      qrHash,
      ticketId,
      eventId,
      scannedBy: req.user ? req.user.id : null,
      deviceInfo: deviceInfo || req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    const statusCode = result.valid ? 200 : 400;
    res.status(statusCode).json({
      success: result.valid,
      result: result.result,
      message: result.message,
      ticket: result.ticket || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get Event Gate Scan History (Audit Trail)
exports.getScanAuditTrail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const history = await ticketVerificationService.getEventScanHistory(eventId);

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
