const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendTicketEmail = async (email, booking) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your CineVenue Ticket Confirmation",
    html: `
      <h2>Booking Confirmed 🎬</h2>
      <p>Booking ID: <b>${booking.bookingId}</b></p>
      <p>Seats: <b>${booking.seats.join(", ")}</b></p>
      <p>Amount: ₹${booking.amount}</p>
      <img src="${booking.qrCode}" width="200" alt="Booking QR Code" />
      <h3>Enjoy Your Movie!</h3>
    `,
  };

  await transporter.sendMail(mailOptions);
};
