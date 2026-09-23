const { v4: uuid } = require("uuid");
const Event = require("../models/Event");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");
const FreePassRequest = require("../models/FreePassRequest");
const ticketService = require("./ticket.service");
const ticketPdfService = require("./ticketPdf.service");
const emailService = require("./email.service");

/**
 * 1. Admin Issue Single or Multi-Pass Free / Complimentary Pass
 */
async function issueFreePass({
  eventId,
  categoryId,
  recipient, // { name, email, phone, organisation, designation, notes }
  quantity = 1,
  adminUser = null,
}) {
  if (!eventId) throw new Error("eventId is required");
  if (!categoryId) throw new Error("categoryId is required");
  if (!recipient || !recipient.name || !recipient.email) {
    throw new Error("Recipient name and email are required");
  }

  const qty = parseInt(quantity, 10);
  if (!qty || qty <= 0) throw new Error("Quantity must be at least 1");

  // 1. Fetch Event
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.status !== "PUBLISHED") {
    throw new Error("Cannot issue passes for an unpublished event");
  }

  // 2. Validate Category
  const category = (event.freePassCategories || []).find(
    (c) => c.categoryId === categoryId || c.name.toLowerCase() === categoryId.toLowerCase()
  );
  if (!category) {
    throw new Error(`Free pass category '${categoryId}' not found on event`);
  }

  if (category.status === "DISABLED") {
    throw new Error(`Free pass category '${category.name}' is currently disabled`);
  }

  // 3. Enforce Category Limits (maxPerPerson, maxPerOrganisation)
  if (category.maxPerPerson && qty > category.maxPerPerson) {
    throw new Error(
      `Exceeds maximum allowed per person limit (${category.maxPerPerson}) for '${category.name}'`
    );
  }

  if (recipient.email) {
    const existingPersonCount = await EventTicket.countDocuments({
      eventId: event._id,
      "recipient.email": recipient.email.toLowerCase(),
      status: "VALID",
    });
    if (category.maxPerPerson && existingPersonCount + qty > category.maxPerPerson) {
      throw new Error(
        `Recipient '${recipient.email}' has already been issued ${existingPersonCount} pass(es). Maximum per person is ${category.maxPerPerson}.`
      );
    }
  }

  if (recipient.organisation && category.maxPerOrganisation) {
    const existingOrgCount = await EventTicket.countDocuments({
      eventId: event._id,
      "recipient.organisation": new RegExp(`^${recipient.organisation.trim()}$`, "i"),
      status: "VALID",
    });
    if (existingOrgCount + qty > category.maxPerOrganisation) {
      throw new Error(
        `Organisation '${recipient.organisation}' already holds ${existingOrgCount} pass(es). Maximum per organisation is ${category.maxPerOrganisation}.`
      );
    }
  }

  // Check Category Remaining Capacity
  const categoryRemaining = category.allocatedCapacity - (category.issuedCount || 0);
  if (categoryRemaining < qty) {
    throw new Error(
      `Only ${categoryRemaining} pass(es) remaining in '${category.name}' category (Requested: ${qty})`
    );
  }

  // 4. Atomically Consume Event Capacity & Category Count
  const eventUpdate = await Event.findOneAndUpdate(
    {
      _id: event._id,
      availableTicketCount: { $gte: qty },
      "freePassCategories.categoryId": category.categoryId,
    },
    {
      $inc: {
        availableTicketCount: -qty,
        freePassesIssuedCount: qty,
        "freePassCategories.$.issuedCount": qty,
      },
    },
    { new: true }
  );

  if (!eventUpdate) {
    const latestEvent = await Event.findById(event._id);
    const available = latestEvent ? latestEvent.availableTicketCount : 0;
    throw new Error(
      `Insufficient event capacity: Only ${available} ticket(s)/pass(es) currently available.`
    );
  }

  // Check if category is now exhausted
  const updatedCategory = eventUpdate.freePassCategories.find(
    (c) => c.categoryId === category.categoryId
  );
  if (updatedCategory && updatedCategory.issuedCount >= updatedCategory.allocatedCapacity) {
    await Event.updateOne(
      { _id: event._id, "freePassCategories.categoryId": category.categoryId },
      { $set: { "freePassCategories.$.status": "EXHAUSTED" } }
    );
  }

  // Check if entire event is now sold out
  if (eventUpdate.availableTicketCount <= 0) {
    await Event.updateOne({ _id: event._id }, { $set: { bookingStatus: "SOLD_OUT" } });
  }

  // 5. Create Confirmed EventBooking (Bypasses payment)
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const bookingId = `CVB-FREE-${todayStr}-${uuid().substring(0, 5).toUpperCase()}`;

  const booking = await EventBooking.create({
    bookingId,
    eventId: event._id,
    customer: {
      name: recipient.name,
      email: recipient.email.toLowerCase(),
      phone: recipient.phone || "",
    },
    bookingType: "FREE_PASS",
    passCategory: category.name,
    recipient: {
      name: recipient.name,
      email: recipient.email.toLowerCase(),
      phone: recipient.phone || "",
      organisation: recipient.organisation || "",
      designation: recipient.designation || "",
      notes: recipient.notes || "",
    },
    tickets: [
      {
        ticketTypeId: event.ticketTypes?.[0]?.typeId || null,
        name: `${category.name} Pass`,
        quantity: qty,
        unitPrice: 0,
        subtotal: 0,
      },
    ],
    pricing: {
      subtotal: 0,
      bookingFee: 0,
      tax: 0,
      discount: 0,
      cineCoinsDiscount: 0,
      total: 0,
    },
    payment: {
      provider: "complimentary",
      status: "NOT_REQUIRED",
      amount: 0,
    },
    status: "CONFIRMED",
    ticketGenerated: true,
  });

  // 6. Generate Individual Tickets
  const tickets = [];
  const pdfPaths = [];

  for (let i = 1; i <= qty; i++) {
    const ticketId = ticketService.generateTicketId();
    const qrToken = ticketService.generateQRToken();
    const qrHash = ticketService.hashQRToken(qrToken);

    const ticket = await EventTicket.create({
      ticketId,
      bookingId: booking._id,
      eventId: event._id,
      ticketNumber: i,
      ticketTypeClassification: "COMPLIMENTARY_PASS",
      passCategory: category.name,
      recipient: booking.recipient,
      customer: booking.customer,
      qrToken, // Used for PDF rendering
      qrHash,
      status: "VALID",
    });

    try {
      const pdfPath = await ticketPdfService.generateTicketPDF(ticket, event, qrToken);
      pdfPaths.push(pdfPath);
      ticket.pdfPath = pdfPath;
      await ticket.save();
    } catch (pdfErr) {
      console.error(`Failed to generate PDF for free pass ${ticketId}:`, pdfErr.message);
    }

    tickets.push(ticket);
  }

  // 7. Dispatch Email Asynchronously
  if (category.emailDeliveryEnabled !== false && pdfPaths.length > 0) {
    setImmediate(async () => {
      try {
        await emailService.sendTicketEmail({
          customer: booking.customer,
          event,
          booking,
          pdfPath: pdfPaths,
          subject: `Your CineVenue Complimentary Pass – ${event.title}`,
        });
        booking.ticketEmailed = true;
        await booking.save();
      } catch (err) {
        console.warn(`Email notice for free pass ${booking.bookingId}:`, err.message);
      }
    });
  }

  return {
    success: true,
    bookingId: booking.bookingId,
    categoryName: category.name,
    recipient: booking.recipient,
    quantity: qty,
    tickets,
    pdfPaths,
  };
}

/**
 * 2. Bulk Issue Free Passes (from CSV / JSON records)
 */
async function bulkIssueFreePasses({ eventId, categoryId, records, adminUser = null }) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("No recipient records provided for bulk issuance");
  }

  const results = {
    totalSubmitted: records.length,
    successfulCount: 0,
    failedCount: 0,
    issuedBookings: [],
    errors: [],
  };

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    try {
      const issued = await issueFreePass({
        eventId,
        categoryId: rec.categoryId || categoryId,
        recipient: {
          name: rec.name || rec.recipientName,
          email: rec.email,
          phone: rec.phone || "",
          organisation: rec.organisation || rec.company || "",
          designation: rec.designation || "",
          notes: rec.notes || `Bulk issued at index ${i + 1}`,
        },
        quantity: parseInt(rec.quantity || 1, 10),
        adminUser,
      });
      results.successfulCount++;
      results.issuedBookings.push(issued);
    } catch (err) {
      results.failedCount++;
      results.errors.push({
        index: i + 1,
        recipient: rec.email || rec.name,
        error: err.message,
      });
    }
  }

  return results;
}

/**
 * 3. Public Submit Free Pass Request (Pending approval)
 */
async function submitFreePassRequest({
  eventId,
  categoryId,
  applicantName,
  email,
  phone,
  organisation,
  designation = "",
  mediaWebsite = "",
  socialLink = "",
  requestedQuantity = 1,
  reason = "",
}) {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const category = (event.freePassCategories || []).find(
    (c) => c.categoryId === categoryId || c.name.toLowerCase() === categoryId.toLowerCase()
  );
  if (!category) throw new Error("Pass category not found");

  const qty = parseInt(requestedQuantity, 10) || 1;
  if (category.maxPerPerson && qty > category.maxPerPerson) {
    throw new Error(`Maximum allowed per person is ${category.maxPerPerson}`);
  }

  const requestId = `REQ-${Date.now()}-${uuid().substring(0, 4).toUpperCase()}`;

  const request = await FreePassRequest.create({
    requestId,
    eventId: event._id,
    categoryId: category.categoryId,
    categoryName: category.name,
    applicantName,
    email: email.toLowerCase(),
    phone,
    organisation,
    designation,
    mediaWebsite,
    socialLink,
    requestedQuantity: qty,
    reason,
    status: "PENDING",
  });

  return request;
}

/**
 * 4. Admin Approve Public Free Pass Request
 */
async function approveFreePassRequest({ requestId, adminUser = null }) {
  const request = await FreePassRequest.findOne({ requestId });
  if (!request) throw new Error("Pass request not found");
  if (request.status !== "PENDING") {
    throw new Error(`Request has already been marked as ${request.status}`);
  }

  // Issue the free pass using issueFreePass (which consumes inventory)
  const issued = await issueFreePass({
    eventId: request.eventId,
    categoryId: request.categoryId,
    recipient: {
      name: request.applicantName,
      email: request.email,
      phone: request.phone,
      organisation: request.organisation,
      designation: request.designation,
      notes: `Approved public request ${request.requestId}. Reason: ${request.reason}`,
    },
    quantity: request.requestedQuantity,
    adminUser,
  });

  request.status = "APPROVED";
  request.reviewedBy = adminUser?.id || null;
  request.reviewedAt = new Date();
  request.bookingId = issued.bookingId;
  await request.save();

  return {
    success: true,
    request,
    issued,
  };
}

/**
 * 5. Admin Reject Public Free Pass Request
 */
async function rejectFreePassRequest({ requestId, reason = "", adminUser = null }) {
  const request = await FreePassRequest.findOne({ requestId });
  if (!request) throw new Error("Pass request not found");
  if (request.status !== "PENDING") {
    throw new Error(`Request has already been marked as ${request.status}`);
  }

  request.status = "REJECTED";
  request.rejectionReason = reason;
  request.reviewedBy = adminUser?.id || null;
  request.reviewedAt = new Date();
  await request.save();

  return {
    success: true,
    request,
  };
}

/**
 * 6. Admin Cancel an Issued Free Pass (Restores capacity)
 */
async function cancelFreePass({ ticketId, adminUser = null, reason = "" }) {
  const ticket = await EventTicket.findOne({ ticketId });
  if (!ticket) throw new Error("Ticket not found");

  if (ticket.status === "CANCELLED") {
    throw new Error("Ticket is already cancelled");
  }
  if (ticket.status === "USED") {
    throw new Error("Cannot cancel a ticket that has already been checked in/used");
  }

  ticket.status = "CANCELLED";
  await ticket.save();

  // Atomically return 1 capacity back to event
  await Event.findOneAndUpdate(
    { _id: ticket.eventId },
    {
      $inc: {
        availableTicketCount: 1,
        freePassesIssuedCount: -1,
      },
      $set: {
        bookingStatus: "OPEN", // Reopen if it was SOLD_OUT
      },
    }
  );

  // Return to category count if applicable
  if (ticket.passCategory) {
    await Event.updateOne(
      {
        _id: ticket.eventId,
        "freePassCategories.name": ticket.passCategory,
      },
      {
        $inc: { "freePassCategories.$.issuedCount": -1 },
        $set: { "freePassCategories.$.status": "ACTIVE" },
      }
    );
  }

  return {
    success: true,
    message: `Free pass ${ticketId} successfully cancelled and capacity restored`,
    ticket,
  };
}

module.exports = {
  issueFreePass,
  bulkIssueFreePasses,
  submitFreePassRequest,
  approveFreePassRequest,
  rejectFreePassRequest,
  cancelFreePass,
};
