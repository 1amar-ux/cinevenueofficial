const fs = require("fs");
const path = require("path");
const EventTicket = require("../models/EventTicket");
const Event = require("../models/Event");
const EventBooking = require("../models/EventBooking");
const { generateTicketPDF } = require("../services/ticketPdf.service");
const { sendTicketEmail } = require("../services/email.service");

// 1. GET /api/v1/event-tickets/:ticketId
exports.getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId })
      .populate("eventId")
      .populate("ticketTypeId");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/v1/event-tickets/:ticketId/download
exports.downloadTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId }).populate("eventId");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Optional user authorization: allow owner, organizer, or admin
    if (req.user && ticket.userId && req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      if (ticket.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to access this ticket" });
      }
    }

    let filePath = ticket.pdfPath;
    if (!filePath || !fs.existsSync(filePath)) {
      // Regenerate PDF pass dynamically if file not present on disk
      filePath = await generateTicketPDF(ticket, ticket.eventId, "recreated_token");
    }

    res.download(filePath, `${ticket.ticketId}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST /api/v1/event-tickets/:ticketId/resend
exports.resendTicketEmail = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId }).populate("eventId");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const booking = await EventBooking.findById(ticket.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Associated booking not found" });
    }

    let filePath = ticket.pdfPath;
    if (!filePath || !fs.existsSync(filePath)) {
      filePath = await generateTicketPDF(ticket, ticket.eventId, "recreated_token");
    }

    await sendTicketEmail({
      customer: ticket.customer,
      event: ticket.eventId,
      booking,
      pdfPath: filePath,
    });

    res.json({
      success: true,
      message: `Ticket pass successfully resent to ${ticket.customer.email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/v1/admin/events/:eventId/tickets
exports.adminGetEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 100 } = req.query;

    const query = { eventId };
    if (status) query.status = status;

    const tickets = await EventTicket.find(query)
      .populate("ticketTypeId", "name price")
      .sort({ ticketNumber: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await EventTicket.countDocuments(query);

    res.json({
      success: true,
      count: tickets.length,
      total,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/v1/admin/event-tickets/:ticketId/cancel
exports.adminCancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    if (ticket.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Ticket is already cancelled" });
    }

    const previousStatus = ticket.status;
    ticket.status = "CANCELLED";
    await ticket.save();

    // Only restore capacity if ticket was previously confirmed/valid
    if (previousStatus === "VALID") {
      if (ticket.ticketTypeClassification === "COMPLIMENTARY_PASS" || ticket.passCategory) {
        await Event.updateOne(
          { _id: ticket.eventId },
          {
            $inc: { availableTicketCount: 1, freePassesIssuedCount: -1 },
            $set: { bookingStatus: "OPEN" },
          }
        );
        if (ticket.passCategory) {
          await Event.updateOne(
            { _id: ticket.eventId, "freePassCategories.name": ticket.passCategory },
            { $inc: { "freePassCategories.$.issuedCount": -1 }, $set: { "freePassCategories.$.status": "ACTIVE" } }
          );
        }
      } else {
        await Event.updateOne(
          { _id: ticket.eventId },
          {
            $inc: { availableTicketCount: 1, soldTicketCount: -1 },
            $set: { bookingStatus: "OPEN" },
          }
        );
        if (ticket.ticketTypeId) {
          const EventTicketType = require("../models/EventTicketType");
          await EventTicketType.updateOne(
            { _id: ticket.ticketTypeId },
            {
              $inc: { availableQuantity: 1, soldQuantity: -1 },
              $set: { status: "ACTIVE" },
            }
          );
        }
      }
    }

    res.json({ success: true, message: "Ticket cancelled successfully and capacity restored", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. POST /api/v1/admin/event-tickets/:ticketId/refund
exports.adminRefundTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    if (ticket.status === "REFUNDED") {
      return res.status(400).json({ success: false, message: "Ticket is already refunded" });
    }

    const previousStatus = ticket.status;
    ticket.status = "REFUNDED";
    await ticket.save();

    if (previousStatus === "VALID") {
      await Event.updateOne(
        { _id: ticket.eventId },
        {
          $inc: { availableTicketCount: 1, soldTicketCount: -1 },
          $set: { bookingStatus: "OPEN" },
        }
      );
      if (ticket.ticketTypeId) {
        const EventTicketType = require("../models/EventTicketType");
        await EventTicketType.updateOne(
          { _id: ticket.ticketTypeId },
          {
            $inc: { availableQuantity: 1, soldQuantity: -1 },
            $set: { status: "ACTIVE" },
          }
        );
      }
    }

    res.json({ success: true, message: "Ticket marked as refunded and capacity restored", ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

