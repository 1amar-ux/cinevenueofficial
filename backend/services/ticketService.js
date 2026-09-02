const QRCode = require("qrcode");

exports.generateQR = async (booking) => {
  const data = JSON.stringify({
    bookingId: booking.bookingId,
    seats: booking.seats,
    show: booking.show,
    amount: booking.amount,
  });

  const qr = await QRCode.toDataURL(data);
  return qr;
};
