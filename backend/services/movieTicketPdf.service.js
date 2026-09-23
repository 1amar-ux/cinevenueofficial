const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { generateQRBuffer } = require("./qr.service");

/**
 * Generate a Movie Ticket PDF Pass with CineVenue branding, movie details, seat numbers, fee breakdown, and QR code
 *
 * @param {Object} ticket - MovieTicket document
 * @param {Object} booking - Booking document
 * @param {Object} movie - Movie document
 * @param {Object} theatre - Theatre document
 * @param {Object} screen - Screen document
 * @param {Object} show - Show document
 * @param {string|Buffer} qrDataOrToken - QR image buffer or token string
 * @returns {Promise<string>} File path to generated PDF
 */
async function generateMovieTicketPDF({
  ticket,
  booking,
  movie,
  theatre,
  screen,
  show,
  qrDataOrToken,
}) {
  const directory = path.join(process.cwd(), "uploads", "tickets", "movies");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const filePath = path.join(directory, `${ticket.ticketId}.pdf`);

  // Obtain QR buffer
  let qrBuffer;
  if (Buffer.isBuffer(qrDataOrToken)) {
    qrBuffer = qrDataOrToken;
  } else if (typeof qrDataOrToken === "string") {
    qrBuffer = await generateQRBuffer(ticket.ticketId, qrDataOrToken);
  } else {
    qrBuffer = await generateQRBuffer(ticket.ticketId, "token_placeholder");
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background Card Styling
    doc.rect(20, 20, 555, 802).fill("#0B0F17");

    // Header Accent Bar
    doc.rect(20, 20, 555, 10).fill("#E50914");

    // CineVenue Brand Logo
    doc.fillColor("#E50914").fontSize(26).font("Helvetica-Bold").text("CINEVENUE", 44, 48);
    doc.fillColor("#94A3B8").fontSize(11).font("Helvetica").text("OFFICIAL CINEMA ADMISSION PASS", 44, 78);

    // Status Badge
    doc.roundedRect(430, 48, 110, 28, 4).fill("#1E293B");
    doc.fillColor("#10B981").fontSize(11).font("Helvetica-Bold").text(booking.status || "CONFIRMED", 450, 56);

    // Separator line
    doc.moveTo(44, 105).lineTo(550, 105).strokeColor("#334155").lineWidth(1).stroke();

    // Movie Title
    doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text(movie?.title || "Movie Presentation", 44, 125, {
      width: 506,
    });

    // Language & Format Tag
    const formatStr = movie?.format || "2D";
    const certificate = movie?.certificate ? `[${movie.certificate}]` : "";
    const languageStr = show?.language || movie?.language || "English";
    doc.fillColor("#E50914").fontSize(11).font("Helvetica-Bold").text(
      `${languageStr.toUpperCase()} • ${formatStr.toUpperCase()} ${certificate}`,
      44,
      155
    );

    // Cinema Theatre & Show Details Box
    doc.roundedRect(44, 180, 506, 90, 8).fill("#161E2E");

    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("THEATRE", 64, 196);
    doc.fillColor("#FFFFFF").fontSize(13).font("Helvetica-Bold").text(theatre?.name || "CineVenue Multiplex", 64, 210);
    doc.fillColor("#64748B").fontSize(9).font("Helvetica").text(theatre?.address || theatre?.city || "", 64, 228);

    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("SCREEN", 330, 196);
    doc.fillColor("#F59E0B").fontSize(13).font("Helvetica-Bold").text(screen?.name || "Audi 1", 330, 210);

    const showDate = show?.date || "Today";
    const showTime = show?.startTime || "07:00 PM";
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("DATE & SHOWTIME", 64, 244);
    doc.fillColor("#10B981").fontSize(12).font("Helvetica-Bold").text(`${showDate} • ${showTime}`, 180, 244);

    // Seat & Identification Box
    doc.roundedRect(44, 285, 506, 75, 8).fill("#1A2234");

    const seatNum = ticket.seat?.seatNumber || "Seat";
    const seatCat = (ticket.seat?.category || "Regular").toUpperCase();
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("SEAT NUMBER", 64, 300);
    doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text(seatNum, 64, 316);
    doc.fillColor("#F59E0B").fontSize(10).font("Helvetica").text(`Category: ${seatCat}`, 64, 344);

    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("BOOKING ID", 240, 300);
    doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold").text(booking.bookingId, 240, 316);

    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("TICKET ID", 380, 300);
    doc.fillColor("#E50914").fontSize(12).font("Helvetica-Bold").text(ticket.ticketId, 380, 316);

    // QR Code Section
    doc.roundedRect(190, 375, 215, 215, 12).fill("#FFFFFF");
    doc.image(qrBuffer, 200, 385, { fit: [195, 195], align: "center" });

    // Gate Entry Notice
    doc.fillColor("#F8FAFC").fontSize(12).font("Helvetica-Bold").text("SCAN AT AUDITORIUM ENTRANCE", 44, 605, {
      align: "center",
      width: 506,
    });

    doc.fillColor("#64748B").fontSize(9).font("Helvetica").text(
      `Customer: ${ticket.customer?.name || "Guest"} • Present this QR pass on mobile or printout`,
      44,
      623,
      { align: "center", width: 506 }
    );

    // Pricing & Tax Breakdown
    doc.moveTo(44, 645).lineTo(550, 645).strokeColor("#334155").lineWidth(1).stroke();

    const priceBreakdown = booking.pricing || {};
    const ticketAmt = priceBreakdown.ticketAmount || booking.amount || 0;
    const convFee = priceBreakdown.convenienceFee || 0;
    const taxAmt = priceBreakdown.tax || 0;
    const totalAmt = priceBreakdown.total || booking.amount || (ticketAmt + convFee + taxAmt);

    doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(
      `Ticket Amount: ₹${ticketAmt}  |  Convenience Fee: ₹${convFee}  |  Taxes: ₹${taxAmt}  |  Total Paid: ₹${totalAmt}`,
      44,
      658,
      { align: "center", width: 506 }
    );

    // Terms & Cancellation Policy
    doc.fillColor("#64748B").fontSize(8).font("Helvetica").text(
      "Cancellation Policy: Tickets can be cancelled up to 2 hours before showtime according to cinema terms.",
      44,
      680,
      { align: "center", width: 506 }
    );
    doc.text(
      "Outside food and beverages are strictly not allowed inside the theatre premises. © 2026 CineVenue Entertainment Pvt Ltd.",
      44,
      696,
      { align: "center", width: 506 }
    );

    doc.end();

    stream.on("finish", async () => {
      try {
        ticket.pdfPath = filePath;
        await ticket.save();
      } catch (_) {}
      resolve(filePath);
    });

    stream.on("error", reject);
  });
}

module.exports = {
  generateMovieTicketPDF,
};
