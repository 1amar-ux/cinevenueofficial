const freePassService = require("../services/freePass.service");
const Event = require("../models/Event");
const EventTicket = require("../models/EventTicket");
const EventBooking = require("../models/EventBooking");
const FreePassRequest = require("../models/FreePassRequest");
const ticketPdfService = require("../services/ticketPdf.service");
const emailService = require("../services/email.service");

// 1. POST /api/v1/admin/events/:eventId/free-passes (Admin manual issuance)
exports.adminIssueFreePass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { categoryId, recipient, quantity = 1 } = req.body;

    const result = await freePassService.issueFreePass({
      eventId,
      categoryId,
      recipient,
      quantity,
      adminUser: req.user || null,
    });

    res.status(201).json({
      success: true,
      message: `${quantity} Complimentary Pass(es) successfully issued to ${recipient.name}`,
      bookingId: result.bookingId,
      categoryName: result.categoryName,
      tickets: result.tickets,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. POST /api/v1/admin/events/:eventId/free-passes/bulk (Admin bulk issuance)
exports.adminBulkIssueFreePasses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { categoryId, records } = req.body;

    const results = await freePassService.bulkIssueFreePasses({
      eventId,
      categoryId,
      records,
      adminUser: req.user || null,
    });

    res.json({
      success: true,
      summary: {
        totalSubmitted: results.totalSubmitted,
        successfulCount: results.successfulCount,
        failedCount: results.failedCount,
      },
      errors: results.errors,
      issuedBookings: results.issuedBookings,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. GET /api/v1/admin/events/:eventId/free-passes (List issued free passes)
exports.adminGetFreePasses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, category, page = 1, limit = 50 } = req.query;

    const query = {
      eventId,
      ticketTypeClassification: "COMPLIMENTARY_PASS",
    };
    if (status) query.status = status;
    if (category) query.passCategory = new RegExp(`^${category}$`, "i");

    const passes = await EventTicket.find(query)
      .populate("eventId", "title date venue")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await EventTicket.countDocuments(query);

    res.json({
      success: true,
      count: passes.length,
      total,
      passes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/v1/admin/events/:eventId/free-pass-capacity (Free pass category breakdown)
exports.adminGetFreePassCapacity = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const categories = (event.freePassCategories || []).map((cat) => {
      const remaining = Math.max(0, cat.allocatedCapacity - (cat.issuedCount || 0));
      return {
        categoryId: cat.categoryId,
        name: cat.name,
        allocated: cat.allocatedCapacity,
        issued: cat.issuedCount || 0,
        remaining,
        maxPerPerson: cat.maxPerPerson,
        maxPerOrganisation: cat.maxPerOrganisation,
        approvalRequired: cat.approvalRequired,
        status: cat.status,
      };
    });

    const totalFreeAllocated = categories.reduce((s, c) => s + c.allocated, 0);
    const totalFreeIssued = categories.reduce((s, c) => s + c.issued, 0);
    const totalFreeRemaining = Math.max(0, totalFreeAllocated - totalFreeIssued);

    res.json({
      success: true,
      eventId: event._id,
      totalEventCapacity: event.totalTicketCapacity,
      totalFreeAllocated,
      totalFreeIssued,
      totalFreeRemaining,
      overallAvailableTickets: event.availableTicketCount,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/v1/admin/events/:eventId/free-passes/:ticketId/cancel
exports.adminCancelFreePass = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;

    const result = await freePassService.cancelFreePass({
      ticketId,
      adminUser: req.user || null,
      reason,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. POST /api/v1/admin/events/:eventId/free-passes/:ticketId/resend
exports.adminResendFreePass = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await EventTicket.findOne({ ticketId }).populate("eventId");
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const booking = await EventBooking.findById(ticket.bookingId);
    let filePath = ticket.pdfPath;
    if (!filePath) {
      filePath = await ticketPdfService.generateTicketPDF(ticket, ticket.eventId, "recreated_token");
    }

    await emailService.sendTicketEmail({
      customer: ticket.recipient?.email ? ticket.recipient : ticket.customer,
      event: ticket.eventId,
      booking,
      pdfPath: filePath,
      subject: `Your CineVenue Complimentary Pass – ${ticket.eventId.title}`,
    });

    res.json({
      success: true,
      message: `Pass email resent to ${ticket.recipient?.email || ticket.customer.email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET /api/v1/admin/events/:eventId/free-pass-requests (List public applications)
exports.adminGetPassRequests = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const query = { eventId };
    if (status) query.status = status;

    const requests = await FreePassRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await FreePassRequest.countDocuments(query);

    res.json({
      success: true,
      count: requests.length,
      total,
      requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. POST /api/v1/admin/free-pass-requests/:requestId/approve
exports.adminApprovePassRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await freePassService.approveFreePassRequest({
      requestId,
      adminUser: req.user || null,
    });

    res.json({
      success: true,
      message: `Pass request ${requestId} approved and tickets issued!`,
      request: result.request,
      issued: result.issued,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 9. POST /api/v1/admin/free-pass-requests/:requestId/reject
exports.adminRejectPassRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const result = await freePassService.rejectFreePassRequest({
      requestId,
      reason,
      adminUser: req.user || null,
    });

    res.json({
      success: true,
      message: `Pass request ${requestId} has been rejected.`,
      request: result.request,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 10. POST /api/v1/events/:eventId/free-pass-requests (Public submit request)
exports.publicRequestFreePass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      categoryId,
      applicantName,
      email,
      phone,
      organisation,
      designation,
      mediaWebsite,
      socialLink,
      requestedQuantity = 1,
      reason,
    } = req.body;

    if (!categoryId || !applicantName || !email || !phone || !organisation) {
      return res.status(400).json({
        success: false,
        message: "categoryId, applicantName, email, phone, and organisation are required",
      });
    }

    const request = await freePassService.submitFreePassRequest({
      eventId,
      categoryId,
      applicantName,
      email,
      phone,
      organisation,
      designation,
      mediaWebsite,
      socialLink,
      requestedQuantity,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Pass request submitted successfully. You will be notified once reviewed by organizers.",
      requestId: request.requestId,
      status: request.status,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 11. GET /api/v1/my/free-pass-requests
exports.publicGetMyRequests = async (req, res) => {
  try {
    const email = req.query.email || req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const requests = await FreePassRequest.find({ email: email.toLowerCase() })
      .populate("eventId", "title date venue")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
