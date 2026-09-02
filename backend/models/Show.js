const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    price: {
      regular: {
        type: Number,
        default: 150,
      },
      premium: {
        type: Number,
        default: 250,
      },
      vip: {
        type: Number,
        default: 400,
      },
    },
    seats: [
      {
        seatNumber: String,
        category: {
          type: String,
          enum: ["regular", "premium", "vip"],
        },
        status: {
          type: String,
          enum: ["available", "locked", "booked"],
          default: "available",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Show", showSchema);
