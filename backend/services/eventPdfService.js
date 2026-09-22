const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

/**
 * Generate a PDF Ticket pass with embedded QR code, brand styling, and security metadata
 *
 * @param {Object} ticket - EventTicket document
 * @param {Object} event - Event document
 * @param {Object} ticketType - EventTicketType document
 * @returns {Promise<Buffer>}
 */
exports.generateTicketPDF = async (ticket, event, ticketType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [420, 600], // Premium event pass aspect ratio
        margins: { top: 20, bottom: 20, left: 24, right: 24 },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Background card
      doc.rect(0, 0, 420, 600).fill("#0B0F17");

      // Accent Header bar
      doc.rect(0, 0, 420, 8).fill("#E50914");

      // Brand Logo / Header
      doc.fillColor("#E50914").fontSize(20).font("Helvetica-Bold").text("CINEVENUE", 24, 28);
      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("OFFICIAL EVENT PASS", 24, 52);

      // Status Badge
      doc.roundedRect(300, 28, 96, 24, 4).fill("#1E293B");
      doc.fillColor("#10B981").fontSize(10).font("Helvetica-Bold").text(ticket.status || "VALID", 325, 35);

      // Horizontal separator
      doc.moveTo(24, 76).lineTo(396, 76).strokeColor("#334155").lineWidth(1).stroke();

      // Event Title
      doc.fillColor("#FFFFFF").fontSize(18).font("Helvetica-Bold").text(event.title || "Live Event", 24, 90, {
        width: 372,
        ellipsis: true,
      });

      // Venue & Date Info
      const formattedDate = event.date ? new Date(event.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }) : "Date TBA";

      doc.fillColor("#94A3B8").fontSize(11).font("Helvetica").text(`📅  ${formattedDate} | ⏰ ${event.startTime || "07:00 PM"}`, 24, 126);
      doc.fillColor("#94A3B8").fontSize(11).font("Helvetica").text(`📍  ${event.venue?.name || "Main Venue"}, ${event.venue?.city || ""}`, 24, 146);

      // Ticket Type Badge Box
      doc.roundedRect(24, 176, 372, 54, 8).fill("#161E2E");
      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("TICKET CATEGORY", 40, 188);
      doc.fillColor("#F59E0B").fontSize(14).font("Helvetica-Bold").text(ticketType?.name || "General Admission", 40, 204);

      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("PASS ID", 260, 188);
      doc.fillColor("#FFFFFF").fontSize(13).font("Helvetica-Bold").text(ticket.ticketId, 260, 204);

      // Customer Details
      doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("ATTENDEE", 24, 248);
      doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold").text(ticket.customer?.name || "Valued Guest", 24, 262);

      doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("CONTACT", 24, 286);
      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text(ticket.customer?.email || "", 24, 300);

      // Generate QR Code Buffer
      const qrPayload = JSON.stringify({
        ticketId: ticket.ticketId,
        qrHash: ticket.qrHash,
        eventId: String(event._id || event.id),
      });

      const qrImageBuffer = await QRCode.toBuffer(qrPayload, {
        width: 160,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // QR Code Box
      doc.roundedRect(125, 330, 170, 170, 8).fill("#FFFFFF");
      doc.image(qrImageBuffer, 130, 335, { width: 160, height: 160 });

      // Scan Instructions
      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica-Bold").text("SCAN AT VENUE GATE TO ENTER", 24, 516, {
        align: "center",
        width: 372,
      });

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Secured by CineVenue Cryptographic QR Verification", 24, 534, {
        align: "center",
        width: 372,
      });

      // Bottom Barcode / Hash snippet
      doc.fillColor("#475569").fontSize(8).font("Courier").text(`HASH: ${ticket.qrHash.substring(0, 32)}...`, 24, 560, {
        align: "center",
        width: 372,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
