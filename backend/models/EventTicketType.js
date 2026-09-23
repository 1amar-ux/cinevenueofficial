const mongoose = require("mongoose");

const eventTicketTypeSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      default: 100,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPerBooking: {
      type: Number,
      default: 10,
      min: 1,
    },
    minPerBooking: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SOLD_OUT", "DISABLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventTicketTypeSchema.index({ eventId: 1, status: 1 });
eventTicketTypeSchema.index({ eventId: 1, status: 1, availableQuantity: 1 });

module.exports = mongoose.model("EventTicketType", eventTicketTypeSchema);
