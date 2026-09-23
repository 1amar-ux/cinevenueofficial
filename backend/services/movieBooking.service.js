const crypto = require("crypto");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const MovieTicket = require("../models/MovieTicket");

const seatLockService = require("./seatLockService");
const { createRazorpayOrder, verifyPaymentSignature } = require("./payment.service");
const { generateQRToken, hashQRToken } = require("./ticket.service");
const { generateMovieTicketPDF } = require("./movieTicketPdf.service");
const { sendTicketEmail } = require("./email.service");

/**
 * 1. Create Movie Booking with Server-Side Authoritative Pricing & Atomic Redis Seat Lock
 */
async function createMovieBooking({
  showtimeId,
  seats, // e.g. ["B12", "B13"] or [{ seatNumber, category, price }]
  customer,
  userId = null,
  discount = 0,
  cineCoinsUsed = 0,
}) {
  if (!showtimeId) throw new Error("showtimeId is required");
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    throw new Error("At least one seat must be selected");
  }
  if (!customer || !customer.email || !customer.name) {
    throw new Error("Customer name and email are required");
  }

  // Normalize seat numbers
  const seatNumbers = seats.map((s) => (typeof s === "string" ? s : s.seatNumber));

  // 1. Fetch Show and verify existence
  const show = await Show.findById(showtimeId)
    .populate("movie")
    .populate("theatre")
    .populate("screen");

  if (!show) {
    const error = new Error("Showtime not found");
    error.status = 404;
    throw error;
  }

  // 2. Validate seat existence in show layout
  const invalidSeats = seatNumbers.filter(
    (sn) => !show.seats.some((s) => s.seatNumber === sn)
  );
  if (invalidSeats.length > 0) {
    const error = new Error(`Invalid seat(s) for this auditorium: ${invalidSeats.join(", ")}`);
    error.status = 400;
    throw error;
  }

  // 3. Validate that none of the seats are permanently booked
  const permanentlyBooked = show.seats.filter(
    (s) => seatNumbers.includes(s.seatNumber) && s.status === "booked"
  );
  if (permanentlyBooked.length > 0) {
    const error = new Error(
      `Seat(s) already booked: ${permanentlyBooked.map((s) => s.seatNumber).join(", ")}`
    );
    error.status = 409;
    error.code = "SEAT_ALREADY_BOOKED";
    throw error;
  }

  // 4. Atomic Redis Seat Lock
  const lockIdentifier = userId || customer.email;
  try {
    await seatLockService.lockSeat(showtimeId, seatNumbers, lockIdentifier, 300);
  } catch (lockErr) {
    const error = new Error(lockErr.message || "One or more seats are currently locked by another customer");
    error.status = 409;
    error.code = "SEAT_ALREADY_LOCKED";
    error.seat = lockErr.seat;
    throw error;
  }

  // 5. Authoritative Price Calculation (Server-Side)
  let ticketAmount = 0;
  const detailedSeats = [];

  seatNumbers.forEach((sn) => {
    const layoutSeat = show.seats.find((s) => s.seatNumber === sn);
    const category = layoutSeat ? layoutSeat.category : "regular";

    let seatPrice = 150;
    if (category === "vip" && show.price?.vip) seatPrice = show.price.vip;
    else if (category === "premium" && show.price?.premium) seatPrice = show.price.premium;
    else if (show.price?.regular) seatPrice = show.price.regular;

    ticketAmount += seatPrice;
    detailedSeats.push({
      seatId: layoutSeat?._id,
      seatNumber: sn,
      category: category.toUpperCase(),
      price: seatPrice,
    });
  });

  // Flat ₹18 convenience fee per ticket + 18% GST
  const convenienceFee = detailedSeats.length * 18;
  const tax = Math.round(convenienceFee * 0.18);
  const cineCoinsDiscount = Math.min(ticketAmount, Math.round(Number(cineCoinsUsed) || 0));
  const appliedDiscount = Math.min(ticketAmount, Math.round(Number(discount) || 0));
  const total = Math.max(0, ticketAmount + convenienceFee + tax - appliedDiscount - cineCoinsDiscount);

  // 6. Create Razorpay Order
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const bookingId = `CVB-MOV-${randomSuffix}`;

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(total, bookingId, {
      showtimeId: String(showtimeId),
      movieTitle: show.movie?.title,
      customerEmail: customer.email,
    });
  } catch (rpErr) {
    // Immediate rollback of held seat locks if gateway call fails
    await seatLockService.unlockSeat(showtimeId, seatNumbers, lockIdentifier);
    throw rpErr;
  }

  // 7. Persist Pending Booking
  let booking;
  try {
    booking = await Booking.create({
      bookingId,
      user: userId || null,
      userId: userId || null,
      movieId: show.movie?._id,
      theatreId: show.theatre?._id,
      screenId: show.screen?._id,
      showtimeId: show._id,
      show: show._id,
      seats: detailedSeats,
      customer,
      pricing: {
        ticketAmount,
        convenienceFee,
        tax,
        discount: appliedDiscount,
        cineCoinsDiscount,
        total,
      },
      amount: total,
      payment: {
        provider: "razorpay",
        orderId: razorpayOrder.id,
        amount: total,
        currency: "INR",
        status: "CREATED",
      },
      status: "PENDING",
      bookingStatus: "pending",
      paymentStatus: "pending",
    });
  } catch (dbErr) {
    await seatLockService.unlockSeat(showtimeId, seatNumbers, lockIdentifier);
    throw dbErr;
  }

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
 * 2. Confirm Movie Booking (Idempotent for client verification and Razorpay Webhook)
 */
async function confirmMovieBooking({
  bookingId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  skipSignatureCheck = false,
}) {
  const booking = await Booking.findOne({
    $or: [{ bookingId }, { "payment.orderId": razorpay_order_id }],
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }

  // Idempotency check: Already processed?
  if (booking.status === "CONFIRMED" && booking.ticketGenerated) {
    const existingTickets = await MovieTicket.find({ bookingId: booking._id });
    return {
      success: true,
      alreadyProcessed: true,
      bookingId: booking.bookingId,
      status: "CONFIRMED",
      tickets: existingTickets,
    };
  }

  // Verify Signature
  if (!skipSignatureCheck && razorpay_signature) {
    const isValid = verifyPaymentSignature(
      razorpay_order_id || booking.payment.orderId,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      booking.payment.status = "FAILED";
      booking.status = "CANCELLED";
      await booking.save();
      const error = new Error("Payment verification failed: Invalid signature");
      error.status = 400;
      throw error;
    }
  }

  // Fetch full Show details
  const show = await Show.findById(booking.showtimeId || booking.show)
    .populate("movie")
    .populate("theatre")
    .populate("screen");

  const seatNumbers = booking.seats.map((s) => (typeof s === "string" ? s : s.seatNumber));

  // Atomic seat confirmation in MongoDB: mark seats as booked
  if (show) {
    await Show.updateOne(
      {
        _id: show._id,
        "seats.seatNumber": { $in: seatNumbers },
      },
      {
        $set: {
          "seats.$[seat].status": "booked",
        },
      },
      {
        arrayFilters: [
          {
            "seat.seatNumber": { $in: seatNumbers },
          },
        ],
      }
    );

    // Free Redis lock hold now that seats are permanently booked
    try {
      await seatLockService.unlockSeat(show._id, seatNumbers);
    } catch (_) {}
  }

  // Update Booking Status
  booking.payment.status = "SUCCESS";
  if (razorpay_payment_id) booking.payment.paymentId = razorpay_payment_id;
  if (razorpay_signature) booking.payment.signature = razorpay_signature;
  booking.status = "CONFIRMED";
  booking.bookingStatus = "confirmed";
  booking.paymentStatus = "paid";
  await booking.save();

  // Generate Individual Movie Ticket Records
  const generatedTickets = [];
  const baseTicketId = booking.bookingId.replace("CVB-", "CVT-");

  for (let i = 0; i < booking.seats.length; i++) {
    const seatObj = booking.seats[i];
    const seatNumber = typeof seatObj === "string" ? seatObj : seatObj.seatNumber;
    const category = typeof seatObj === "string" ? "REGULAR" : seatObj.category || "REGULAR";
    const price = typeof seatObj === "string" ? 150 : seatObj.price || 150;

    const seq = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const ticketId = `${baseTicketId}-${seq}`;

    const qrToken = generateQRToken();
    const qrHash = hashQRToken(qrToken);

    const ticketDoc = await MovieTicket.create({
      ticketId,
      bookingId: booking._id,
      movieId: booking.movieId || show?.movie?._id,
      theatreId: booking.theatreId || show?.theatre?._id,
      screenId: booking.screenId || show?.screen?._id,
      showtimeId: booking.showtimeId || show?._id,
      seat: {
        seatId: typeof seatObj === "object" ? seatObj.seatId : undefined,
        seatNumber,
        category,
        price,
      },
      customer: booking.customer,
      qrHash,
      status: "VALID",
    });

    generatedTickets.push({
      ticket: ticketDoc,
      qrToken,
    });
  }

  booking.ticketGenerated = true;
  await booking.save();

  // Generate PDF Passes for every ticket
  const pdfPaths = [];
  for (const item of generatedTickets) {
    try {
      const pdfPath = await generateMovieTicketPDF({
        ticket: item.ticket,
        booking,
        movie: show?.movie,
        theatre: show?.theatre,
        screen: show?.screen,
        show,
        qrDataOrToken: item.qrToken,
      });
      pdfPaths.push(pdfPath);
    } catch (pdfErr) {
      console.error(`Failed to generate movie ticket PDF for ${item.ticket.ticketId}:`, pdfErr.message);
    }
  }

  // Send Email with PDF pass attachments
  setImmediate(async () => {
    try {
      await sendTicketEmail({
        customer: booking.customer,
        event: {
          title: show?.movie?.title || "Movie Presentation",
          date: show?.date,
          startTime: show?.startTime,
          venue: {
            name: show?.theatre?.name,
            city: show?.theatre?.city,
          },
        },
        booking: {
          bookingId: booking.bookingId,
          pricing: booking.pricing,
        },
        pdfPath: pdfPaths,
      });
      booking.ticketEmailed = true;
      await booking.save();
    } catch (emailErr) {
      console.warn(`Movie ticket email delivery note for ${booking.bookingId}:`, emailErr.message);
    }
  });

  return {
    success: true,
    bookingId: booking.bookingId,
    status: "CONFIRMED",
    tickets: generatedTickets.map((t) => t.ticket),
  };
}

module.exports = {
  createMovieBooking,
  confirmMovieBooking,
};
