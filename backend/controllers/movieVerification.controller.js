const crypto = require("crypto");
const MovieTicket = require("../models/MovieTicket");
const MovieTicketScan = require("../models/MovieTicketScan");

// 1. POST /api/v1/movie-tickets/verify
exports.verifyMovieTicket = async (req, res) => {
  try {
    const { ticketId, token, hash: directHash } = req.body;

    if (!ticketId) {
      return res.status(400).json({ valid: false, status: "INVALID", message: "ticketId is required" });
    }

    const hash = token
      ? crypto.createHash("sha256").update(token).digest("hex")
      : directHash;

    const query = { ticketId };
    if (hash) query.qrHash = hash;

    const ticket = await MovieTicket.findOne(query)
      .populate("movieId", "title")
      .populate("theatreId", "name")
      .populate("screenId", "name");

    if (!ticket) {
      return res.json({
        valid: false,
        status: "INVALID",
        message: "Unrecognized ticket or counterfeit QR code",
      });
    }

    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      return res.json({
        valid: false,
        status: ticket.status,
        message: `Ticket has been ${ticket.status.toLowerCase()}`,
      });
    }

    if (ticket.status === "USED") {
      return res.json({
        valid: false,
        status: "ALREADY_USED",
        message: `Ticket was already scanned at ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString("en-IN") : "auditorium entrance"}`,
        checkedInAt: ticket.checkedInAt,
      });
    }

    return res.json({
      valid: true,
      status: "VALID",
      ticket: {
        ticketId: ticket.ticketId,
        movieTitle: ticket.movieId?.title,
        theatre: ticket.theatreId?.name,
        screen: ticket.screenId?.name,
        seatNumber: ticket.seat?.seatNumber,
        category: ticket.seat?.category,
        customerName: ticket.customer?.name,
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, status: "ERROR", message: error.message });
  }
};

// 2. POST /api/v1/movie-tickets/check-in
exports.checkInMovieTicket = async (req, res) => {
  try {
    const { ticketId, token, hash: directHash, deviceInfo } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, status: "INVALID", message: "ticketId is required" });
    }

    const hash = token
      ? crypto.createHash("sha256").update(token).digest("hex")
      : directHash;

    const query = { ticketId, status: "VALID" };
    if (hash) query.qrHash = hash;

    // Atomic update to guarantee single check-in across multiple handheld scanners
    const ticket = await MovieTicket.findOneAndUpdate(
      query,
      {
        $set: {
          status: "USED",
          checkedInAt: new Date(),
          checkedInBy: req.user ? req.user.id : null,
        },
      },
      { new: true }
    )
      .populate("movieId", "title")
      .populate("theatreId", "name")
      .populate("screenId", "name");

    if (!ticket) {
      const existing = await MovieTicket.findOne({ ticketId });
      let resultStatus = "INVALID";
      if (existing) {
        if (existing.status === "USED") resultStatus = "ALREADY_USED";
        else if (existing.status === "CANCELLED" || existing.status === "REFUNDED") resultStatus = "CANCELLED";
      }

      if (existing) {
        await MovieTicketScan.create({
          ticketId: existing._id,
          showtimeId: existing.showtimeId,
          scannedBy: req.user ? req.user.id : null,
          result: resultStatus,
          deviceInfo: deviceInfo || req.headers["user-agent"] || "Auditorium Scanner",
          ipAddress: req.ip || "127.0.0.1",
        }).catch(() => {});
      }

      return res.status(400).json({
        success: false,
        status: "ALREADY_USED_OR_INVALID",
        message: existing?.status === "USED"
          ? `Ticket was already checked in at ${new Date(existing.checkedInAt).toLocaleTimeString("en-IN")}`
          : "Ticket could not be checked in (Invalid or already used)",
      });
    }

    // Record successful scan in audit trail
    await MovieTicketScan.create({
      ticketId: ticket._id,
      showtimeId: ticket.showtimeId,
      scannedBy: req.user ? req.user.id : null,
      result: "VALID",
      deviceInfo: deviceInfo || req.headers["user-agent"] || "Auditorium Scanner",
      ipAddress: req.ip || "127.0.0.1",
    });

    return res.json({
      success: true,
      status: "CHECKED_IN",
      message: "Check-in successful! Enjoy the movie.",
      ticket: {
        ticketId: ticket.ticketId,
        movieTitle: ticket.movieId?.title,
        theatre: ticket.theatreId?.name,
        screen: ticket.screenId?.name,
        seatNumber: ticket.seat?.seatNumber,
        category: ticket.seat?.category,
        customerName: ticket.customer?.name,
        checkedInAt: ticket.checkedInAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, status: "ERROR", message: error.message });
  }
};
