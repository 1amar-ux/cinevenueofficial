const QRCode = require("qrcode");

/**
 * Generate High-Resolution QR Code (Data URL)
 *
 * @param {string} ticketId - e.g. CVT-A8F92D1B
 * @param {string} qrToken - Raw 32-byte hex token
 * @returns {Promise<string>} Data URL
 */
async function generateQRCode(ticketId, qrToken) {
  const clientUrl = process.env.CLIENT_URL || "https://cinevenue.com";
  // Encode secure verification payload
  const payload = JSON.stringify({
    ticketId,
    token: qrToken,
    verifyUrl: `${clientUrl}/ticket/verify/${ticketId}?token=${qrToken}`,
  });

  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });
}

/**
 * Generate QR Code Buffer for PDFKit embedding
 *
 * @param {string} ticketId
 * @param {string} qrToken
 * @returns {Promise<Buffer>}
 */
async function generateQRBuffer(ticketId, qrToken) {
  const clientUrl = process.env.CLIENT_URL || "https://cinevenue.com";
  const payload = JSON.stringify({
    ticketId,
    token: qrToken,
    verifyUrl: `${clientUrl}/ticket/verify/${ticketId}?token=${qrToken}`,
  });

  return await QRCode.toBuffer(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400,
  });
}

module.exports = {
  generateQRCode,
  generateQRBuffer,
};
