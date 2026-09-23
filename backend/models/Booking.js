const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
    },
    // Supports both simple ["A1", "A2"] and rich objects [{ seatId, seatNumber, category, price }]
    seats: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    ],
    customer: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    pricing: {
      ticketAmount: { type: Number, default: 0 },
      convenienceFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      cineCoinsDiscount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    amount: {
      type: Number,
      default: 0,
    },
    payment: {
      provider: { type: String, default: "razorpay" },
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      signature: { type: String, default: "" },
      status: {
        type: String,
        enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        default: "CREATED",
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "PENDING", "CONFIRMED", "CANCELLED"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "PENDING", "PAID", "FAILED"],
      default: "pending",
    },
    ticketGenerated: {
      type: Boolean,
      default: false,
    },
    ticketEmailed: {
      type: Boolean,
      default: false,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ bookingId: 1 }, { unique: true });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showtimeId: 1, status: 1 });
bookingSchema.index({ "payment.orderId": 1 });

module.exports = mongoose.model("Booking", bookingSchema);
