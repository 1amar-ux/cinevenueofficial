const { v4: uuid } = require("uuid");
const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");
const { generateTicketsForBooking } = require("./ticket.service");
const { generateTicketPDF } = require("./ticketPdf.service");
const { sendTicketEmail } = require("./email.service");
const { createRazorpayOrder, verifyPaymentSignature } = require("./payment.service");

/**
 * 1. Create Event Booking with Authoritative Server Pricing, Capacity Enforcement & Razorpay Order
 */
async function createBooking({
  eventId,
  tickets, // [{ ticketTypeId, quantity }]
  customer, // { name, email, phone }
  userId = null,
  discount = 0,
  cineCoinsUsed = 0,
}) {
  if (!eventId) throw new Error("eventId is required");
  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    throw new Error("At least one ticket must be selected");
  }
  if (!customer || !customer.email || !customer.name) {
    throw new Error("Customer name and email are required");
  }

  // 1. Validate Event
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.status !== "PUBLISHED") {
    throw new Error("This event is not published or currently accepting bookings");
  }
  if (event.bookingStatus === "SOLD_OUT" || event.availableTicketCount <= 0) {
    throw new Error("This event is completely SOLD OUT");
  }
  if (event.bookingStatus !== "OPEN") {
    throw new Error("Ticket booking for this event is closed");
  }

  // Booking Date Window Validation
  const now = new Date();
  if (event.bookingStartDate && now < new Date(event.bookingStartDate)) {
    throw new Error(`Booking opens on ${new Date(event.bookingStartDate).toLocaleString("en-IN")}`);
  }
  if (event.bookingEndDate && now > new Date(event.bookingEndDate)) {
    throw new Error(`Booking closed on ${new Date(event.bookingEndDate).toLocaleString("en-IN")}`);
  }

  // 2. Validate Overall Requested Quantities
  const totalRequestedQuantity = tickets.reduce(
    (sum, t) => sum + (parseInt(t.quantity, 10) || 0),
    0
  );

  if (event.maxTicketsPerBooking && totalRequestedQuantity > event.maxTicketsPerBooking) {
    throw new Error(`You can book a maximum of ${event.maxTicketsPerBooking} tickets per booking.`);
  }
  if (event.minTicketsPerBooking && totalRequestedQuantity < event.minTicketsPerBooking) {
    throw new Error(`Minimum ${event.minTicketsPerBooking} ticket(s) required per booking.`);
  }

  if (event.availableTicketCount < totalRequestedQuantity) {
    throw new Error(`Only ${event.availableTicketCount} tickets are currently available.`);
  }

  // 3. Validate Ticket Types & Check Availability
  const ticketBreakdown = [];
  let subtotal = 0;

  for (const item of tickets) {
    const qty = parseInt(item.quantity, 10);
    if (!qty || qty <= 0) {
      throw new Error(`Invalid ticket quantity: ${item.quantity}`);
    }

    const ticketType = await EventTicketType.findById(item.ticketTypeId);
    if (!ticketType || ticketType.eventId.toString() !== eventId.toString()) {
      throw new Error(`Invalid ticket category: ${item.ticketTypeId}`);
    }

    if (ticketType.status === "SOLD_OUT" || ticketType.availableQuantity <= 0) {
      throw new Error(`Ticket category '${ticketType.name}' is SOLD OUT`);
    }

    if (ticketType.status !== "ACTIVE") {
      throw new Error(`Ticket category '${ticketType.name}' is currently unavailable`);
    }

    if (qty > ticketType.maxPerBooking) {
      throw new Error(
        `Maximum allowed per booking for '${ticketType.name}' is ${ticketType.maxPerBooking}`
      );
    }

    if (ticketType.availableQuantity < qty) {
      throw new Error(
        `Only ${ticketType.availableQuantity} ticket(s) remaining for '${ticketType.name}'`
      );
    }

    const itemSubtotal = qty * ticketType.price;
    subtotal += itemSubtotal;

    ticketBreakdown.push({
      ticketTypeId: ticketType._id,
      name: ticketType.name,
      quantity: qty,
      unitPrice: ticketType.price,
      subtotal: itemSubtotal,
    });
  }

  // 4. Calculate Authoritative Price on the Server
  const bookingFee = Math.max(20, Math.round(subtotal * 0.05));
  const tax = Math.round(bookingFee * 0.18);
  const cineCoinsDiscount = Math.min(subtotal, Math.round(Number(cineCoinsUsed) || 0));
  const appliedDiscount = Math.min(subtotal, Math.round(Number(discount) || 0));
  const total = Math.max(0, subtotal + bookingFee + tax - appliedDiscount - cineCoinsDiscount);

  // 5. Atomic Reservation (Event-level & Category-level with rollback compensation)
  const reservedEvent = await Event.findOneAndUpdate(
    {
      _id: event._id,
      availableTicketCount: { $gte: totalRequestedQuantity },
      bookingStatus: "OPEN",
    },
    {
      $inc: {
        availableTicketCount: -totalRequestedQuantity,
        reservedTicketCount: totalRequestedQuantity,
      },
    },
    { new: true }
  );

  if (!reservedEvent) {
    const cur = await Event.findById(event._id);
    const available = cur ? cur.availableTicketCount : 0;
    throw new Error(`Only ${available} tickets are currently available.`);
  }

  const reservedTicketTypes = [];
  try {
    for (const item of ticketBreakdown) {
      const reservedType = await EventTicketType.findOneAndUpdate(
        {
          _id: item.ticketTypeId,
          availableQuantity: { $gte: item.quantity },
          status: "ACTIVE",
        },
        {
          $inc: {
            availableQuantity: -item.quantity,
            reservedQuantity: item.quantity,
          },
        },
        { new: true }
      );

      if (!reservedType) {
        throw new Error(`Only remaining quantity for '${item.name}' is insufficient.`);
      }
      reservedTicketTypes.push({ id: item.ticketTypeId, qty: item.quantity });
    }
  } catch (reservationErr) {
    // Rollback partial ticket type reservations
    for (const r of reservedTicketTypes) {
      await EventTicketType.updateOne(
        { _id: r.id },
        { $inc: { availableQuantity: r.qty, reservedQuantity: -r.qty } }
      );
    }
    // Rollback event capacity reservation
    await Event.updateOne(
      { _id: event._id },
      {
        $inc: {
          availableTicketCount: totalRequestedQuantity,
          reservedTicketCount: -totalRequestedQuantity,
        },
      }
    );
    throw reservationErr;
  }

  // 6. Create Razorpay Order
  const receipt = `CVB-${Date.now()}`;
  const razorpayOrder = await createRazorpayOrder(total, receipt, {
    eventId: String(eventId),
    customerEmail: customer.email,
  });

  // 7. Create Booking Record
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const bookingId = `CVB-${todayStr}-${uuid().substring(0, 5).toUpperCase()}`;

  const booking = await EventBooking.create({
    bookingId,
    userId: userId || null,
    eventId: event._id,
    customer,
    tickets: ticketBreakdown,
    pricing: {
      subtotal,
      bookingFee,
      tax,
      discount: appliedDiscount,
      cineCoinsDiscount,
      total,
    },
    payment: {
      provider: "razorpay",
      orderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
      status: "CREATED",
    },
    status: "PENDING",
  });

  return {
    success: true,
    bookingId: booking.bookingId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    currency: "INR",
    booking,
  };
}

/**
 * 2. Complete Confirmation Flow (Idempotent for API verify & Webhook safety)
 */
async function confirmEventBooking({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  skipSignatureCheck = false,
}) {
  // 1. Find Booking
  const booking = await EventBooking.findOne({
    $or: [{ bookingId }, { "payment.orderId": razorpay_order_id }],
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }

  // 2. Prevent Duplicate Processing (Idempotency)
  if (booking.status === "CONFIRMED" && booking.ticketGenerated) {
    const existingTickets = await EventTicket.find({ bookingId: booking._id });
    return {
      success: true,
      alreadyProcessed: true,
      bookingId: booking.bookingId,
      status: "CONFIRMED",
      tickets: existingTickets,
    };
  }

  // 3. Verify Razorpay Signature (unless invoked by verified webhook)
  if (!skipSignatureCheck && razorpay_signature) {
    const isValid = verifyPaymentSignature(
      razorpay_order_id || booking.payment.orderId,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      booking.payment.status = "FAILED";
      await booking.save();
      // Release reservation on signature mismatch
      await releaseBookingReservation(booking.bookingId);
      const error = new Error("Payment verification failed");
      error.status = 400;
      throw error;
    }
  }

  // 4. Confirm Payment & Booking Status
  booking.payment.status = "SUCCESS";
  if (razorpay_payment_id) booking.payment.paymentId = razorpay_payment_id;
  if (razorpay_signature) booking.payment.signature = razorpay_signature;
  booking.status = "CONFIRMED";
  booking.ticketGenerated = true;
  await booking.save();

  // 5. Convert Reserved Capacity to Confirmed/Sold Inventory Atomically
  const totalQty = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: booking.eventId },
    {
      $inc: {
        reservedTicketCount: -totalQty,
        soldTicketCount: totalQty,
      },
    },
    { new: true }
  );

  for (const item of booking.tickets) {
    const updatedTt = await EventTicketType.findOneAndUpdate(
      { _id: item.ticketTypeId },
      {
        $inc: {
          reservedQuantity: -item.quantity,
          soldQuantity: item.quantity,
        },
      },
      { new: true }
    );
    if (updatedTt && updatedTt.availableQuantity <= 0) {
      await EventTicketType.updateOne({ _id: item.ticketTypeId }, { $set: { status: "SOLD_OUT" } });
    }
  }

  if (updatedEvent && updatedEvent.availableTicketCount <= 0) {
    await Event.updateOne({ _id: booking.eventId }, { $set: { bookingStatus: "SOLD_OUT" } });
  }

  // 6. Generate Individual Tickets
  const ticketEntries = await generateTicketsForBooking(booking);

  // 7. Generate PDFs & Save References
  const event = await Event.findById(booking.eventId);
  const pdfPaths = [];

  for (const entry of ticketEntries) {
    try {
      const pdfPath = await generateTicketPDF(entry.ticket, event, entry.qrToken);
      pdfPaths.push(pdfPath);
    } catch (pdfErr) {
      console.error(`Failed to generate PDF for ticket ${entry.ticket.ticketId}:`, pdfErr.message);
    }
  }

  // 8. Send Email asynchronously with PDF attachments
  setImmediate(async () => {
    try {
      await sendTicketEmail({
        customer: booking.customer,
        event,
        booking,
        pdfPath: pdfPaths,
      });
      booking.ticketEmailed = true;
      await booking.save();
    } catch (emailErr) {
      console.warn(`Email delivery note for ${booking.bookingId}:`, emailErr.message);
    }
  });

  return {
    success: true,
    bookingId: booking.bookingId,
    status: "CONFIRMED",
    tickets: ticketEntries.map((e) => e.ticket),
  };
}

/**
 * 3. Release Temporary Booking Reservation (On payment failure, timeout, or cancellation)
 */
async function releaseBookingReservation(bookingId) {
  const booking = await EventBooking.findOne({ bookingId });
  if (!booking || booking.status !== "PENDING") return;

  const totalQty = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);

  // Return capacity to Event
  await Event.updateOne(
    { _id: booking.eventId },
    {
      $inc: {
        reservedTicketCount: -totalQty,
        availableTicketCount: totalQty,
      },
      $set: { bookingStatus: "OPEN" },
    }
  );

  // Return capacity to EventTicketTypes
  for (const item of booking.tickets) {
    await EventTicketType.updateOne(
      { _id: item.ticketTypeId },
      {
        $inc: {
          reservedQuantity: -item.quantity,
          availableQuantity: item.quantity,
        },
        $set: { status: "ACTIVE" },
      }
    );
  }

  booking.status = "CANCELLED";
  booking.payment.status = "FAILED";
  await booking.save();

  return { success: true, releasedQuantity: totalQty };
}

module.exports = {
  createBooking,
  confirmEventBooking,
  releaseBookingReservation,
};
