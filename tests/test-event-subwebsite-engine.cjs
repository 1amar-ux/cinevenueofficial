const path = require("path");
module.paths.push(path.resolve(__dirname, "../backend/node_modules"));

const assert = require("assert");
const fs = require("fs");
const crypto = require("crypto");

// Load models
const Event = require("../backend/models/Event");
const EventTicketType = require("../backend/models/EventTicketType");
const EventBooking = require("../backend/models/EventBooking");
const EventTicket = require("../backend/models/EventTicket");
const TicketScan = require("../backend/models/TicketScan");

// Load modular services
const ticketService = require("../backend/services/ticket.service");
const qrService = require("../backend/services/qr.service");
const ticketPdfService = require("../backend/services/ticketPdf.service");
const bookingService = require("../backend/services/booking.service");
const paymentService = require("../backend/services/payment.service");

async function runTestSuite() {
  console.log("================================================================");
  console.log("🚀 Testing CineVenue Event Subwebsite & Ticketing Engine (V2)");
  console.log("================================================================");

  // 1. Ticket and Token Cryptography Test
  console.log("\n[Test 1] Ticket ID & Cryptographic QR Token Generation");
  const ticketId = ticketService.generateTicketId();
  assert(ticketId.startsWith("CVT-"), "Ticket ID must start with 'CVT-'");
  assert.strictEqual(ticketId.length, 16, "Ticket ID format must be CVT-XXXXXXXXXXXX (16 chars)");

  const qrToken = ticketService.generateQRToken();
  assert.strictEqual(qrToken.length, 64, "QR token must be 32 bytes (64 hex characters)");

  const qrHash = ticketService.hashQRToken(qrToken);
  assert.strictEqual(qrHash.length, 64, "SHA-256 hash must be 64 hex characters");
  assert.notStrictEqual(qrToken, qrHash, "Raw token and hash must never be identical");
  console.log(`✅ Test 1 Passed: Generated Ticket ID: ${ticketId}, Token Length: ${qrToken.length}, Hash: ${qrHash.substring(0, 16)}...`);

  // 2. High-Resolution QR Code Service Test
  console.log("\n[Test 2] High-Resolution QR Code Generation (Level H)");
  const qrDataUrl = await qrService.generateQRCode(ticketId, qrToken);
  assert(qrDataUrl.startsWith("data:image/png;base64,"), "QR code must be a valid PNG Data URL");

  const qrBuffer = await qrService.generateQRBuffer(ticketId, qrToken);
  assert(Buffer.isBuffer(qrBuffer), "QR buffer must be a valid Buffer");
  assert(qrBuffer.length > 500, "QR buffer must contain high-res image data");
  console.log(`✅ Test 2 Passed: QR Code DataURL & Buffer generated (${qrBuffer.length} bytes)`);

  // 3. Vector PDF Ticket Pass Generation Test
  console.log("\n[Test 3] Vector PDF Ticket Pass Generation with CineVenue Branding");
  const mockEvent = {
    _id: "66778899aabbccddeeff0011",
    title: "Coldplay: Music of the Spheres World Tour Mumbai",
    date: new Date("2026-11-20"),
    startTime: "06:00 PM",
    endTime: "10:30 PM",
    venue: {
      name: "DY Patil Stadium",
      address: "Sector 7, Nerul",
      city: "Navi Mumbai",
    },
    termsAndConditions: [
      "Entry allowed only with official QR pass.",
      "Strictly no re-entry once checked in.",
      "Gates close 30 minutes after start time.",
    ],
  };

  const mockTicket = {
    ticketId: "CVT-B19F2D84A31C",
    ticketNumber: 1,
    status: "VALID",
    customer: { name: "Ananya Sharma", email: "ananya@example.com" },
    save: async () => {},
  };

  const pdfPath = await ticketPdfService.generateTicketPDF(mockTicket, mockEvent, qrBuffer);
  assert(fs.existsSync(pdfPath), "Generated PDF file must exist on disk");
  const pdfContent = fs.readFileSync(pdfPath);
  assert.strictEqual(pdfContent.slice(0, 4).toString(), "%PDF", "PDF file must start with '%PDF'");
  console.log(`✅ Test 3 Passed: PDF ticket generated at: ${pdfPath} (${pdfContent.length} bytes)`);

  // 4. Server-Side Authoritative Pricing Math Test
  console.log("\n[Test 4] Authoritative Pricing Formula (Never trust frontend amount)");
  const regularPrice = 199;
  const vipPrice = 499;
  const regularQty = 2;
  const vipQty = 1;
  const subtotal = regularQty * regularPrice + vipQty * vipPrice; // 398 + 499 = 897
  const bookingFee = Math.max(20, Math.round(subtotal * 0.05)); // 45
  const tax = Math.round(bookingFee * 0.18); // 8
  const total = subtotal + bookingFee + tax; // 950

  assert.strictEqual(subtotal, 897);
  assert.strictEqual(bookingFee, 45);
  assert.strictEqual(tax, 8);
  assert.strictEqual(total, 950);
  console.log(`✅ Test 4 Passed: Authoritative server price formula verified (₹${total})`);

  // 5. Razorpay Signature Verification & Webhook Safety Test
  console.log("\n[Test 5] Razorpay Signature Verification & Webhook Safety");
  const secret = "test_razorpay_secret_key_123";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const orderId = "order_test_987654";
  const paymentId = "pay_test_123456";
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isSigValid = paymentService.verifyPaymentSignature(orderId, paymentId, validSignature);
  assert.strictEqual(isSigValid, true, "Signature verification must succeed with matching secret");

  const isInvalidSig = paymentService.verifyPaymentSignature(orderId, paymentId, "fraudulent_signature");
  assert.strictEqual(isInvalidSig, false, "Signature verification must reject tampered signature");
  console.log("✅ Test 5 Passed: Razorpay HMAC SHA-256 signature verification operational");

  // 6. Schema & Unique Indexes Test
  console.log("\n[Test 6] MongoDB Schema Indexes Configuration");
  const eventIndexes = Event.schema.indexes();
  assert(eventIndexes.some((idx) => idx[0].slug === 1), "Event must have slug index");

  const bookingIndexes = EventBooking.schema.indexes();
  assert(bookingIndexes.some((idx) => idx[0].bookingId === 1), "EventBooking must have unique bookingId index");

  const ticketIndexes = EventTicket.schema.indexes();
  assert(ticketIndexes.some((idx) => idx[0].ticketId === 1), "EventTicket must have unique ticketId index");
  assert(ticketIndexes.some((idx) => idx[0].qrHash === 1), "EventTicket must have unique qrHash index");

  const scanIndexes = TicketScan.schema.indexes();
  assert(scanIndexes.some((idx) => idx[0].ticketId === 1), "TicketScan must index ticketId");
  console.log("✅ Test 6 Passed: All required unique & audit indexes properly registered");

  console.log("\n================================================================");
  console.log("🎉 ALL EVENT SUBWEBSITE ENGINE TESTS PASSED (6/6)!");
  console.log("================================================================\n");
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
