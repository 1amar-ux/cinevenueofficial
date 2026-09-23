const mongoose = require("mongoose");

const eventBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    tickets: [
      {
        ticketTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EventTicketType",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      bookingFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      cineCoinsDiscount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    bookingType: {
      type: String,
      enum: ["PAID", "FREE_PASS"],
      default: "PAID",
    },
    passCategory: {
      type: String,
      default: "",
    },
    recipient: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      organisation: { type: String, default: "" },
      designation: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    approvalStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_REQUIRED",
    },
    payment: {
      provider: {
        type: String,
        default: "razorpay",
      },
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      signature: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      currency: {
        type: String,
        default: "INR",
      },
      status: {
        type: String,
        enum: ["NOT_REQUIRED", "CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"],
        default: "CREATED",
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    ticketGenerated: {
      type: Boolean,
      default: false,
    },
    ticketEmailed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes specified in prompt
eventBookingSchema.index({ bookingId: 1 }, { unique: true });
eventBookingSchema.index({ userId: 1, createdAt: -1 });
eventBookingSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model("EventBooking", eventBookingSchema);
