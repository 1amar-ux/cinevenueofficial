const fs = require("fs");
const MovieTicket = require("../models/MovieTicket");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { generateMovieTicketPDF } = require("../services/movieTicketPdf.service");
const { sendTicketEmail } = require("../services/email.service");

// 1. GET /api/v1/movie-tickets/:ticketId
exports.getMovieTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await MovieTicket.findOne({ ticketId })
      .populate("movieId", "title poster language duration")
      .populate("theatreId", "name address city")
      .populate("screenId", "name")
      .populate("showtimeId", "date startTime endTime");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Movie ticket not found" });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/v1/movie-tickets/:ticketId/download
exports.downloadMovieTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await MovieTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Movie ticket not found" });
    }

    let filePath = ticket.pdfPath;
    if (!filePath || !fs.existsSync(filePath)) {
      const booking = await Booking.findById(ticket.bookingId);
      const show = await Show.findById(ticket.showtimeId)
        .populate("movie")
        .populate("theatre")
        .populate("screen");

      filePath = await generateMovieTicketPDF({
        ticket,
        booking,
        movie: show?.movie,
        theatre: show?.theatre,
        screen: show?.screen,
        show,
        qrDataOrToken: "recreated_qr_pass",
      });
    }

    res.download(filePath, `${ticket.ticketId}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST /api/v1/movie-tickets/:ticketId/resend
exports.resendMovieTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await MovieTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Movie ticket not found" });
    }

    const booking = await Booking.findById(ticket.bookingId);
    const show = await Show.findById(ticket.showtimeId)
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    let filePath = ticket.pdfPath;
    if (!filePath || !fs.existsSync(filePath)) {
      filePath = await generateMovieTicketPDF({
        ticket,
        booking,
        movie: show?.movie,
        theatre: show?.theatre,
        screen: show?.screen,
        show,
        qrDataOrToken: "recreated_qr_pass",
      });
    }

    await sendTicketEmail({
      customer: ticket.customer,
      event: {
        title: show?.movie?.title || "Movie Presentation",
        date: show?.date,
        startTime: show?.startTime,
        venue: {
          name: show?.theatre?.name,
          city: show?.theatre?.city,
        },
      },
      booking: {
        bookingId: booking?.bookingId,
        pricing: booking?.pricing,
      },
      pdfPath: filePath,
    });

    res.json({
      success: true,
      message: `Movie ticket pass resent successfully to ${ticket.customer?.email}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
