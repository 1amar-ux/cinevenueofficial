const mongoose = require("mongoose");

const ticketScanSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventTicket",
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    result: {
      type: String,
      enum: ["VALID", "ALREADY_USED", "CANCELLED", "INVALID"],
      required: true,
    },
    deviceInfo: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketScanSchema.index({ ticketId: 1, scannedAt: -1 });
ticketScanSchema.index({ eventId: 1, scannedAt: -1 });

module.exports = mongoose.model("TicketScan", ticketScanSchema);
