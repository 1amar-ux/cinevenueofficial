const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { generateQRBuffer } = require("./qr.service");

/**
 * Generate a PDF Ticket pass with CineVenue branding and QR code
 *
 * @param {Object} ticket - EventTicket document
 * @param {Object} event - Event document
 * @param {string|Buffer} qrDataOrToken - QR image buffer or raw token
 * @returns {Promise<string>} File path to generated PDF
 */
async function generateTicketPDF(ticket, event, qrDataOrToken) {
  const directory = path.join(process.cwd(), "uploads", "tickets");

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
    const isComplimentary = ticket.ticketTypeClassification === "COMPLIMENTARY_PASS" || !!ticket.passCategory;
    doc.rect(20, 20, 555, 10).fill(isComplimentary ? "#F59E0B" : "#E50914");

    // CineVenue Brand Logo
    doc.fillColor(isComplimentary ? "#F59E0B" : "#E50914").fontSize(26).font("Helvetica-Bold").text("CINEVENUE", 44, 48);
    doc.fillColor("#94A3B8").fontSize(11).font("Helvetica").text(
      isComplimentary ? "OFFICIAL COMPLIMENTARY PASS" : "OFFICIAL EVENT PASS",
      44,
      78
    );

    // Status Badge
    doc.roundedRect(380, 48, 160, 28, 4).fill("#1E293B");
    doc.fillColor(isComplimentary ? "#F59E0B" : "#10B981").fontSize(10).font("Helvetica-Bold").text(
      isComplimentary ? (ticket.passCategory ? `${ticket.passCategory} PASS` : "COMPLIMENTARY") : (ticket.status || "VALID"),
      390,
      56,
      { width: 140, align: "center" }
    );

    // Separator line
    doc.moveTo(44, 105).lineTo(550, 105).strokeColor("#334155").lineWidth(1).stroke();

    // Event Title
    doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text(event.title || "Live Event", 44, 125, {
      width: 506,
    });

    // Event Date & Time Formatting
    const formattedDate = event.date
      ? new Date(event.date).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Date TBA";

    doc.moveDown(0.5);
    doc.fillColor("#94A3B8").fontSize(12).font("Helvetica").text(`📅  Date: ${formattedDate}`, 44, 170);
    doc.text(`⏰  Time: ${event.startTime || "07:00 PM"}${event.endTime ? ` - ${event.endTime}` : ""}`, 44, 190);
    doc.text(`📍  Venue: ${event.venue?.name || "Main Arena"}`, 44, 210);
    if (event.venue?.address) {
      doc.text(`     Address: ${event.venue.address}, ${event.venue.city || ""}`, 44, 230);
    }

    // Attendee / Recipient Box
    doc.roundedRect(44, 260, 506, 95, 8).fill("#161E2E");
    doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(isComplimentary ? "INVITED GUEST / RECIPIENT" : "ATTENDEE", 64, 274);
    
    const recipientName = ticket.recipient?.name || ticket.customer?.name || "Valued Guest";
    doc.fillColor("#FFFFFF").fontSize(13).font("Helvetica-Bold").text(recipientName, 64, 290);
    
    if (isComplimentary && (ticket.recipient?.organisation || ticket.recipient?.designation)) {
      const orgInfo = [ticket.recipient.designation, ticket.recipient.organisation].filter(Boolean).join(" • ");
      doc.fillColor("#F59E0B").fontSize(10).font("Helvetica-Bold").text(orgInfo, 64, 308);
      doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(ticket.recipient?.email || ticket.customer?.email || "", 64, 326);
    } else {
      doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text(ticket.customer?.email || "", 64, 312);
      if (ticket.customer?.phone) {
        doc.fillColor("#64748B").fontSize(9).font("Helvetica").text(`Phone: ${ticket.customer.phone}`, 64, 328);
      }
    }

    doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(isComplimentary ? "PASS TYPE / ID" : "TICKET ID", 340, 274);
    doc.fillColor(isComplimentary ? "#F59E0B" : "#E50914").fontSize(14).font("Helvetica-Bold").text(ticket.ticketId, 340, 290);
    doc.fillColor("#10B981").fontSize(10).font("Helvetica-Bold").text(
      isComplimentary ? `Admission: Complimentary (Pass #${ticket.ticketNumber || 1})` : `Pass #${ticket.ticketNumber || 1}`,
      340,
      310
    );
    if (ticket.passCategory) {
      doc.fillColor("#94A3B8").fontSize(9).font("Helvetica").text(`Category: ${ticket.passCategory}`, 340, 328);
    }

    // QR Code Section
    doc.roundedRect(185, 375, 225, 225, 12).fill("#FFFFFF");
    doc.image(qrBuffer, 195, 385, { fit: [205, 205], align: "center" });

    // Gate Entry Notice
    doc.fillColor("#F8FAFC").fontSize(12).font("Helvetica-Bold").text(
      isComplimentary ? "COMPLIMENTARY ACCESS PASS - SCAN AT GATES" : "SCAN AT VENUE ENTRANCE TO ENTER",
      44,
      620,
      { align: "center", width: 506 }
    );

    doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("Cryptographically signed with CineVenue Zero-Trust QR Verification", 44, 638, {
      align: "center",
      width: 506,
    });

    // Terms & Conditions Snippet
    doc.moveTo(44, 665).lineTo(550, 665).strokeColor("#334155").lineWidth(1).stroke();
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica-Bold").text("ENTRY TERMS & CONDITIONS", 44, 680);


    const terms = event.termsAndConditions && event.termsAndConditions.length > 0
      ? event.termsAndConditions
      : [
          "• Please present this physical PDF printout or digital QR code on your smartphone.",
          "• Each ticket pass admits one person and is non-transferable once checked in.",
          "• The organizer reserves the right of admission.",
        ];

    let termY = 715;
    terms.slice(0, 3).forEach((term) => {
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text(term, 44, termY, { width: 506 });
      termY += 16;
    });

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
  generateTicketPDF,
};
