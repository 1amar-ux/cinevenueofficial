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
      enum: ["OPEN", "CLOSED", "SOLD_OUT"],
      default: "OPEN",
    },
    // Capacity & Limits
    totalTicketCapacity: {
      type: Number,
      default: 1000,
      min: 1,
    },
    soldTicketCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    freePassesIssuedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedTicketCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableTicketCount: {
      type: Number,
      default: 1000,
      min: 0,
    },
    maxTicketsPerBooking: {
      type: Number,
      default: 10,
      min: 1,
    },
    minTicketsPerBooking: {
      type: Number,
      default: 1,
      min: 1,
    },
    bookingStartDate: {
      type: Date,
      default: null,
    },
    bookingEndDate: {
      type: Date,
      default: null,
    },
    allowOverbooking: {
      type: Boolean,
      default: false,
    },
    // Free Pass / Complimentary Pass Categories
    freePassCategories: [
      {
        categoryId: { type: String, required: true },
        name: { type: String, required: true }, // e.g. "PRESS / MEDIA", "SPONSOR", "VIP INVITEE", "GUEST", "INDUSTRY", "CREW"
        description: { type: String, default: "" },
        allocatedCapacity: { type: Number, required: true, min: 0 },
        issuedCount: { type: Number, default: 0, min: 0 },
        maxPerPerson: { type: Number, default: 2, min: 1 },
        maxPerOrganisation: { type: Number, default: 5, min: 1 },
        approvalRequired: { type: Boolean, default: false },
        emailDeliveryEnabled: { type: Boolean, default: true },
        entryRules: { type: [String], default: [] },
        status: {
          type: String,
          enum: ["ACTIVE", "EXHAUSTED", "DISABLED"],
          default: "ACTIVE",
        },
      },
    ],
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
eventSchema.index({ bookingStatus: 1, availableTicketCount: 1 });

module.exports = mongoose.model("Event", eventSchema);
