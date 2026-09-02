const crypto = require("crypto");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const User = require("../models/User");

const { createOrder } = require("../services/paymentService");
const { generateQR } = require("../services/ticketService");
const { sendTicketEmail } = require("../services/emailService");

// Create Payment Order
exports.createPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const order = await createOrder(booking.amount);

    const payment = await Payment.create({
      booking: booking._id,
      razorpayOrderId: order.id,
      amount: booking.amount,
    });

    res.json({
      success: true,
      order,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment Verification Failed",
      });
    }

    // Update Payment
    await Payment.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
      },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "success",
      }
    );

    // Update Booking
    const booking = await Booking.findById(bookingId);

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";

    // Generate QR
    booking.qrCode = await generateQR(booking);

    await booking.save();

    // Send email ticket
    try {
      const user = await User.findById(booking.user);
      if (user && user.email) {
        await sendTicketEmail(user.email, booking);
      }
    } catch (emailError) {
      console.error("Email ticket sending failed:", emailError.message);
    }

    // Update seats
    await Show.updateOne(
      {
        _id: booking.show,
        "seats.seatNumber": {
          $in: booking.seats,
        },
      },
      {
        $set: {
          "seats.$[seat].status": "booked",
        },
      },
      {
        arrayFilters: [
          {
            "seat.seatNumber": {
              $in: booking.seats,
            },
          },
        ],
      }
    );

    res.json({
      success: true,
      message: "Booking Confirmed",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
