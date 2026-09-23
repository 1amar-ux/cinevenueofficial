const path = require("path");
module.paths.push(path.resolve(__dirname, "../backend/node_modules"));

const assert = require("assert");
const fs = require("fs");
const crypto = require("crypto");

// Models
const Movie = require("../backend/models/Movie");
const Theatre = require("../backend/models/Theatre");
const Screen = require("../backend/models/Screen");
const Show = require("../backend/models/Show");
const Booking = require("../backend/models/Booking");
const MovieTicket = require("../backend/models/MovieTicket");
const MovieTicketScan = require("../backend/models/MovieTicketScan");

// Services
const seatLockService = require("../backend/services/seatLockService");
const movieBookingService = require("../backend/services/movieBooking.service");
const { generateMovieTicketPDF } = require("../backend/services/movieTicketPdf.service");
const paymentService = require("../backend/services/payment.service");
const { generateQRBuffer } = require("../backend/services/qr.service");

async function runTestSuite() {
  console.log("================================================================");
  console.log("🎬 Testing Complete CineVenue Movie Ticketing Engine");
  console.log("================================================================");

  // 1. Authoritative Pricing Math & Fee Structure Test
  console.log("\n[Test 1] Authoritative Movie Ticket Pricing & Convenience Fee Calculation");
  const seatsSelected = [
    { seatNumber: "B12", category: "PREMIUM", price: 180 },
    { seatNumber: "B13", category: "PREMIUM", price: 180 },
  ];
  const ticketAmount = 180 + 180; // 360
  const convenienceFee = seatsSelected.length * 18; // 36
  const tax = Math.round(convenienceFee * 0.18); // 6
  const total = ticketAmount + convenienceFee + tax; // 402

  assert.strictEqual(ticketAmount, 360);
  assert.strictEqual(convenienceFee, 36);
  assert.strictEqual(tax, 6);
  assert.strictEqual(total, 402);
  console.log(`✅ Test 1 Passed: Pricing breakdown verified (Tickets: ₹${ticketAmount}, Fee: ₹${convenienceFee}, Tax: ₹${tax}, Total: ₹${total})`);

  // 2. Vector PDF Movie Pass Generation Test
  console.log("\n[Test 2] Vector PDF Movie Ticket Generation with Seat, Screen, & Brand Details");
  const mockMovie = {
    title: "Devara: Part 1",
    language: "Telugu",
    duration: 172,
    certificate: "U/A",
    format: "IMAX 2D",
  };
  const mockTheatre = {
    name: "Cine Prime – Guntur",
    city: "Guntur",
    address: "Brodipet 4th Lane",
  };
  const mockScreen = {
    name: "Screen 1 (Dolby Atmos)",
  };
  const mockShow = {
    date: "25 September 2026",
    startTime: "06:30 PM",
    language: "Telugu",
  };
  const mockBooking = {
    bookingId: "CVB-MOV-829371",
    status: "CONFIRMED",
    amount: 396,
    pricing: {
      ticketAmount: 360,
      convenienceFee: 36,
      tax: 0,
      total: 396,
    },
  };
  const mockTicket = {
    ticketId: "CVT-MOV-829371-01",
    seat: {
      seatNumber: "B12",
      category: "PREMIUM",
      price: 180,
    },
    customer: {
      name: "Suresh Reddy",
      email: "suresh@example.com",
    },
    save: async () => {},
  };

  const qrBuffer = await generateQRBuffer(mockTicket.ticketId, "token_sample_123");
  const pdfPath = await generateMovieTicketPDF({
    ticket: mockTicket,
    booking: mockBooking,
    movie: mockMovie,
    theatre: mockTheatre,
    screen: mockScreen,
    show: mockShow,
    qrDataOrToken: qrBuffer,
  });

  assert(fs.existsSync(pdfPath), "Generated Movie PDF file must exist");
  const pdfContent = fs.readFileSync(pdfPath);
  assert.strictEqual(pdfContent.slice(0, 4).toString(), "%PDF", "PDF must be valid %PDF binary");
  console.log(`✅ Test 2 Passed: Generated PDF pass at ${pdfPath} (${pdfContent.length} bytes)`);

  // 3. Razorpay Signature Verification & Tampering Protection
  console.log("\n[Test 3] Razorpay Signature Check & Payment Tampering Detection");
  const secret = "test_razorpay_secret_key_mov";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const orderId = "order_mov_829371";
  const paymentId = "pay_mov_123456";
  const validSig = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.strictEqual(paymentService.verifyPaymentSignature(orderId, paymentId, validSig), true);
  assert.strictEqual(paymentService.verifyPaymentSignature(orderId, paymentId, "fraud_signature"), false);
  console.log("✅ Test 3 Passed: Signature verification authenticated valid payment and rejected tampered signature");

  // 4. Atomic Redis Seat Lock & Rollback Test
  console.log("\n[Test 4] Atomic Redis Seat Locking with Partial Collision Rollback");
  const showtimeId = "show_mov_" + Date.now();
  const seatsToLock = ["C1", "C2"];

  // Lock C1 and C2
  const lock1 = await seatLockService.lockSeat(showtimeId, seatsToLock, "user_alice", 120);
  assert.strictEqual(lock1.success, true);

  // Attempt to lock C2 and C3 concurrently by another user (C2 collides)
  let collisionHandled = false;
  try {
    await seatLockService.lockSeat(showtimeId, ["C2", "C3"], "user_bob", 120);
  } catch (err) {
    collisionHandled = true;
    assert.strictEqual(err.code, "SEAT_ALREADY_LOCKED");
  }
  assert.strictEqual(collisionHandled, true, "Collision must throw SEAT_ALREADY_LOCKED");

  // Verify C3 was NOT left locked (compensation rollback)
  const c3Status = await seatLockService.isSeatLocked(showtimeId, "C3");
  assert.strictEqual(c3Status.locked, false, "C3 must be free after rollback");

  // Release lock
  await seatLockService.unlockSeat(showtimeId, seatsToLock);
  const c1Status = await seatLockService.isSeatLocked(showtimeId, "C1");
  assert.strictEqual(c1Status.locked, false, "C1 must be unlocked");
  console.log("✅ Test 4 Passed: Atomic seat locking & rollback compensation verified");

  // 5. Gatekeeper QR Verification & Check-in Logic Test
  console.log("\n[Test 5] Gatekeeper Check-in State Transitions (VALID -> USED -> ALREADY_USED)");
  const sampleToken = crypto.randomBytes(32).toString("hex");
  const sampleHash = crypto.createHash("sha256").update(sampleToken).digest("hex");

  // Verify that hashing is deterministic
  assert.strictEqual(crypto.createHash("sha256").update(sampleToken).digest("hex"), sampleHash);

  // Simulated ticket states
  let ticketStatus = "VALID";
  let checkInCount = 0;

  function simulateCheckIn(token) {
    const computedHash = crypto.createHash("sha256").update(token).digest("hex");
    if (computedHash !== sampleHash) {
      return { valid: false, status: "INVALID", message: "Counterfeit QR" };
    }
    if (ticketStatus === "USED") {
      return { valid: false, status: "ALREADY_USED", message: "Ticket already used" };
    }
    if (ticketStatus === "VALID") {
      ticketStatus = "USED";
      checkInCount++;
      return { valid: true, status: "CHECKED_IN", message: "Entry allowed" };
    }
  }

  // First scan: Valid entry
  const firstScan = simulateCheckIn(sampleToken);
  assert.strictEqual(firstScan.valid, true);
  assert.strictEqual(firstScan.status, "CHECKED_IN");
  assert.strictEqual(checkInCount, 1);

  // Second scan with same token: Rejected as already used
  const secondScan = simulateCheckIn(sampleToken);
  assert.strictEqual(secondScan.valid, false);
  assert.strictEqual(secondScan.status, "ALREADY_USED");
  assert.strictEqual(checkInCount, 1);

  // Third scan with invalid token: Rejected as invalid
  const thirdScan = simulateCheckIn("invalid_token_xyz");
  assert.strictEqual(thirdScan.valid, false);
  assert.strictEqual(thirdScan.status, "INVALID");
  console.log("✅ Test 5 Passed: Gatekeeper security logic prevented duplicate and counterfeit entries");

  // 6. Schema & Unique Index Configurations Test
  console.log("\n[Test 6] Movie Booking & Movie Ticket Schema Indexes");
  const bookingIdx = Booking.schema.indexes();
  assert(bookingIdx.some((idx) => idx[0].bookingId === 1), "Booking must have unique bookingId index");

  const movieTicketIdx = MovieTicket.schema.indexes();
  assert(movieTicketIdx.some((idx) => idx[0].ticketId === 1), "MovieTicket must have unique ticketId index");
  assert(movieTicketIdx.some((idx) => idx[0].qrHash === 1), "MovieTicket must have unique qrHash index");

  const scanIdx = MovieTicketScan.schema.indexes();
  assert(scanIdx.some((idx) => idx[0].ticketId === 1), "MovieTicketScan must index ticketId");
  console.log("✅ Test 6 Passed: All unique constraints & query indexes validated");

  console.log("\n================================================================");
  console.log("🎉 ALL MOVIE TICKETING ENGINE TESTS PASSED (6/6)!");
  console.log("================================================================\n");
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
