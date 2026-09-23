const mongoose = require("mongoose");

const movieTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seat: {
      seatId: { type: mongoose.Schema.Types.ObjectId },
      seatNumber: { type: String, required: true },
      category: { type: String, default: "regular" },
      price: { type: Number, default: 150 },
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
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
  },
  {
    timestamps: true,
  }
);

// Indexes
movieTicketSchema.index({ ticketId: 1 }, { unique: true });
movieTicketSchema.index({ qrHash: 1 }, { unique: true });
movieTicketSchema.index({ showtimeId: 1, status: 1 });
movieTicketSchema.index({ bookingId: 1 });

module.exports = mongoose.model("MovieTicket", movieTicketSchema);
