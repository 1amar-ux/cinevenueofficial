const crypto = require("crypto");
const { v4: uuid } = require("uuid");
const QRCode = require("qrcode");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");
const { generateTicketPDF } = require("./eventPdfService");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
});

// Initialize Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 1. Create Event Booking Order with Live Inventory Check & Razorpay Order
 */
exports.createEventBookingOrder = async ({
  eventId,
  tickets, // [{ ticketTypeId, quantity }]
  customer, // { name, email, phone }
  userId = null,
  discount = 0,
  cineCoinsUsed = 0,
}) => {
  if (!eventId) throw new Error("eventId is required");
  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    throw new Error("At least one ticket must be selected");
  }
  if (!customer || !customer.email || !customer.name) {
    throw new Error("Customer name and email are required");
  }

  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.status !== "PUBLISHED") {
    throw new Error("This event is not published or currently accepting bookings");
  }
  if (event.bookingStatus !== "OPEN") {
    throw new Error("Ticket booking for this event is closed");
  }

  // Validate Ticket Types & Inventory Availability
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

  // Pricing Calculation
  // Standard 5% platform booking fee (min ₹20) + 18% GST on booking fee
  const bookingFee = Math.max(20, Math.round(subtotal * 0.05));
  const tax = Math.round(bookingFee * 0.18);
  const cineCoinsDiscount = Math.min(subtotal, Math.round(Number(cineCoinsUsed) || 0));
  const appliedDiscount = Math.min(subtotal, Math.round(Number(discount) || 0));
  const total = Math.max(0, subtotal + bookingFee + tax - appliedDiscount - cineCoinsDiscount);

  // Razorpay Order Creation
  let razorpayOrder;
  try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // In paise
        currency: "INR",
        receipt: `EVB_${Date.now()}`,
        notes: {
          eventId: String(eventId),
          eventTitle: event.title,
          customerEmail: customer.email,
        },
      });
    } else {
      // Deterministic fallback for dev/testing when Razorpay credentials are not injected
      razorpayOrder = {
        id: `order_sim_${Date.now()}`,
        amount: Math.round(total * 100),
        currency: "INR",
        status: "created",
      };
    }
  } catch (rpErr) {
    throw new Error(`Payment gateway order creation failed: ${rpErr.message}`);
  }

  // Atomically hold/decrement inventory
  for (const item of ticketBreakdown) {
    await EventTicketType.updateOne(
      { _id: item.ticketTypeId, availableQuantity: { $gte: item.quantity } },
      {
        $inc: {
          availableQuantity: -item.quantity,
          soldQuantity: item.quantity,
        },
      }
    );
  }

  // Create Event Booking record
  const bookingId = "EVB-" + uuid().substring(0, 8).toUpperCase();

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
    booking,
    razorpayOrder,
  };
};

/**
 * 2. Verify Razorpay Signature, Confirm Booking, Generate Individual Physical/Digital Tickets & Dispatch Email
 */
exports.verifyEventPaymentAndConfirm = async ({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const booking = await EventBooking.findOne({
    $or: [{ bookingId }, { "payment.orderId": razorpay_order_id }],
  });

  if (!booking) {
    throw new Error("Event booking not found");
  }

  if (booking.status === "CONFIRMED") {
    // Already confirmed, return existing tickets
    const existingTickets = await EventTicket.find({ bookingId: booking._id });
    return {
      success: true,
      message: "Booking already confirmed",
      booking,
      tickets: existingTickets,
    };
  }

  // Verify Signature
  if (process.env.RAZORPAY_KEY_SECRET) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      booking.payment.status = "FAILED";
      await booking.save();
      throw new Error("Razorpay payment verification failed: Invalid signature");
    }
  }

  // Update Booking Status
  booking.payment.paymentId = razorpay_payment_id;
  booking.payment.signature = razorpay_signature;
  booking.payment.status = "SUCCESS";
  booking.status = "CONFIRMED";

  const event = await Event.findById(booking.eventId);

  // Generate Individual Event Tickets with Cryptographic QR Token & Hash
  const generatedTickets = [];
  let ticketIndex = 1;

  for (const item of booking.tickets) {
    const ticketType = await EventTicketType.findById(item.ticketTypeId);

    for (let i = 0; i < item.quantity; i++) {
      const ticketId = "CVT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      const qrToken = `EVTK_${ticketId}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const qrHash = crypto
        .createHash("sha256")
        .update(qrToken + (process.env.JWT_SECRET || "cinevenue_event_salt"))
        .digest("hex");

      const ticketDoc = await EventTicket.create({
        ticketId,
        bookingId: booking._id,
        eventId: booking.eventId,
        userId: booking.userId,
        ticketTypeId: item.ticketTypeId,
        ticketNumber: ticketIndex++,
        customer: booking.customer,
        qrToken,
        qrHash,
        status: "VALID",
        generatedAt: new Date(),
      });

      generatedTickets.push({
        ticket: ticketDoc,
        ticketType,
      });
    }
  }

  booking.ticketGenerated = true;
  await booking.save();

  // Send Email with Ticket Passes & QR codes asynchronously
  setImmediate(async () => {
    try {
      await exports.sendEventTicketEmail(booking, event, generatedTickets);
      booking.ticketEmailed = true;
      await booking.save();
    } catch (emailErr) {
      console.warn("Event ticket email notification note:", emailErr.message);
    }
  });

  return {
    success: true,
    message: "Event booking confirmed successfully",
    booking,
    tickets: generatedTickets.map((t) => t.ticket),
  };
};

/**
 * 3. Send Professional Ticket Pass Email with QR Codes
 */
exports.sendEventTicketEmail = async (booking, event, ticketEntries) => {
  if (!booking.customer?.email) return;

  const ticketRowsHtml = await Promise.all(
    ticketEntries.map(async ({ ticket, ticketType }) => {
      const qrPayload = JSON.stringify({
        ticketId: ticket.ticketId,
        qrHash: ticket.qrHash,
        eventId: String(event._id),
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 140, margin: 1 });

      return `
        <div style="background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; margin-bottom: 16px; color: #F3F4F6;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top;">
                <div style="font-size: 11px; color: #9CA3AF; text-transform: uppercase;">Ticket ID</div>
                <div style="font-size: 16px; font-weight: bold; color: #E50914; margin-bottom: 8px;">${ticket.ticketId}</div>
                <div style="font-size: 14px; font-weight: 600; color: #F9FAFB;">Category: ${ticketType?.name || "General"}</div>
                <div style="font-size: 13px; color: #D1D5DB; margin-top: 4px;">Attendee: ${ticket.customer?.name}</div>
                <div style="font-size: 11px; color: #10B981; margin-top: 8px; font-weight: 600;">Status: VALID (Present at Venue)</div>
              </td>
              <td width="150" align="center" style="vertical-align: middle;">
                <img src="${qrDataUrl}" width="120" height="120" style="border-radius: 8px; background: #fff; padding: 4px;" alt="QR Pass" />
              </td>
            </tr>
          </table>
        </div>
      `;
    })
  );

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date TBA";

  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply@cinevenue.com",
    to: booking.customer.email,
    subject: `🎟️ Your Tickets for ${event.title} - Booking #${booking.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #030712; padding: 24px; color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; background: #0B0F17; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; padding: 24px;">
          <div style="border-bottom: 2px solid #E50914; padding-bottom: 12px; margin-bottom: 20px;">
            <h1 style="color: #E50914; margin: 0; font-size: 24px; letter-spacing: 1px;">CINEVENUE</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0 0; font-size: 12px;">Official Event Ticketing & Pass Confirmation</p>
          </div>

          <h2 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 20px;">${event.title}</h2>
          <p style="color: #D1D5DB; font-size: 14px; margin: 0 0 16px 0;">
            📅 ${formattedDate} | ⏰ ${event.startTime || "07:00 PM"}<br/>
            📍 ${event.venue?.name}, ${event.venue?.city}, ${event.venue?.state || "India"}
          </p>

          <div style="background: #1F2937; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px;">
            <table width="100%">
              <tr>
                <td style="color: #9CA3AF;">Booking Reference:</td>
                <td align="right" style="color: #FFFFFF; font-weight: bold;">${booking.bookingId}</td>
              </tr>
              <tr>
                <td style="color: #9CA3AF;">Total Paid:</td>
                <td align="right" style="color: #10B981; font-weight: bold;">₹${booking.pricing.total}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #FFFFFF; font-size: 16px; margin: 16px 0 12px 0;">Your Digital QR Passes (${ticketEntries.length})</h3>
          ${ticketRowsHtml.join("")}

          <div style="border-top: 1px solid #1F2937; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #6B7280; text-align: center;">
            <p>Please present the QR code(s) on your mobile screen or printout at the event entrance.</p>
            <p>© 2026 CineVenue Entertainment Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    await transporter.sendMail(mailOptions);
  } else {
    console.log(`[EventBookingService] Simulated email ticket dispatch for ${booking.bookingId} to ${booking.customer.email}`);
  }
};
