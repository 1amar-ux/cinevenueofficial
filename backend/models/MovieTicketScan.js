const mongoose = require("mongoose");

const movieTicketScanSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MovieTicket",
      required: true,
      index: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
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

movieTicketScanSchema.index({ ticketId: 1, scannedAt: -1 });
movieTicketScanSchema.index({ showtimeId: 1, scannedAt: -1 });

module.exports = mongoose.model("MovieTicketScan", movieTicketScanSchema);
