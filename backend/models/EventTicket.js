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
      default: null,
    },
    ticketTypeClassification: {
      type: String,
      enum: ["PAID_TICKET", "COMPLIMENTARY_PASS"],
      default: "PAID_TICKET",
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
      default: undefined,
    },
    qrHash: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    pdfPath: {
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
