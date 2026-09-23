const mongoose = require("mongoose");

const freePassRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    organisation: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    mediaWebsite: {
      type: String,
      default: "",
    },
    socialLink: {
      type: String,
      default: "",
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    bookingId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

freePassRequestSchema.index({ eventId: 1, status: 1 });
freePassRequestSchema.index({ email: 1, eventId: 1 });
freePassRequestSchema.index({ organisation: 1, eventId: 1 });

module.exports = mongoose.model("FreePassRequest", freePassRequestSchema);
