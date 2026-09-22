const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    poster: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
    },
    bookingStatus: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    ticketTypes: [
      {
        typeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EventTicketType",
        },
      },
    ],
    termsAndConditions: {
      type: [String],
      default: [
        "Please bring a valid photo ID matching the ticket pass.",
        "Tickets once booked are non-refundable unless the event is cancelled.",
        "Entry will be granted only after physical QR code verification at the gate.",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ "venue.city": 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
