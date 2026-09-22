const mongoose = require("mongoose");

const eventTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventBooking",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventTicketType",
      required: true,
    },
    ticketNumber: {
      type: Number,
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    qrToken: {
      type: String,
      required: true,
    },
    qrHash: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["VALID", "USED", "CANCELLED", "REFUNDED"],
      default: "VALID",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes specified in prompt
eventTicketSchema.index({ ticketId: 1 }, { unique: true });
eventTicketSchema.index({ qrHash: 1 }, { unique: true });
eventTicketSchema.index({ eventId: 1, status: 1 });
eventTicketSchema.index({ bookingId: 1 });

module.exports = mongoose.model("EventTicket", eventTicketSchema);
