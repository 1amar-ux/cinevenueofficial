const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendTicketEmail = async (email, booking) => {
  if (!email) return;

  // Defensive formatting for seats list
  const seatsFormatted = Array.isArray(booking?.seats)
    ? booking.seats.join(", ")
    : (booking?.seats ? String(booking.seats) : "Reserved");

  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply@cinevenue.com",
    to: email,
    subject: "Your CineVenue Ticket Confirmation",
    html: `
      <h2>Booking Confirmed 🎬</h2>
      <p>Booking ID: <b>${booking?.bookingId || booking?._id || "N/A"}</b></p>
      <p>Seats: <b>${seatsFormatted}</b></p>
      <p>Amount: ₹${booking?.amount || booking?.totalAmount || "0"}</p>
      ${booking?.qrCode ? `<img src="${booking.qrCode}" width="200" alt="Booking QR Code" />` : ""}
      <h3>Enjoy Your Movie!</h3>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[EmailService] Notice: EMAIL_USER/EMAIL_PASS not configured. Simulated ticket dispatch to ${email}`);
    }
  } catch (err) {
    console.error(`[EmailService] Failed to send ticket email to ${email}:`, err.message);
  }
};
