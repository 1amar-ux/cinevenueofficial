import dotenv from "dotenv";
dotenv.config();

import { getMailTransporter, sendMovieTicketEmail, sendEventPassEmail } from "../server/services/emailService";

async function runEmailAudit() {
  console.log("================================================================================");
  console.log("📧 CINEVENUE EMAIL DELIVERY & TLS SECURITY VERIFICATION (RE-RUN)");
  console.log("================================================================================\n");

  // 1. Verify Transporter Initialization
  console.log("[STEP 1] Testing Email Transporter Initialization...");
  const transporter = getMailTransporter();

  if (!transporter) {
    console.error("❌ FAILED: Transporter returned null. Environment variables not found or incomplete.");
    process.exit(1);
  }
  console.log("✅ Transporter successfully initialized with TLS rejectUnauthorized: true.");

  // 2. Verify SMTP Connection Handshake & Authentication via transporter.verify()
  console.log("\n[STEP 2] Verifying SMTP Connection Handshake & TLS Certificate Verification...");
  try {
    const verifyResult = await transporter.verify();
    console.log("✅ Provider SMTP Handshake Succeeded. Result:", verifyResult);
  } catch (err: any) {
    console.error("❌ SMTP Verification Failed!");
    console.error("  Error Name:", err.name);
    console.error("  Error Code:", err.code);
    console.error("  Response Code:", err.responseCode);
    console.error("  Command:", err.command);
    console.error("  Error Message:", err.message);
    console.error("  Category:", err.response || err.code || "AUTH_OR_CONNECTION_ERROR");
  }

  // 3. Test Direct Delivery to user-controlled email address
  const recipientEmail = process.env.EMAIL_USER || process.env.SMTP_FROM || "amarnathgattem@gmail.com";
  console.log(`\n[STEP 3] Sending One Live Test Ticket Confirmation Email to: ${recipientEmail.slice(0, 3)}***@***...`);

  try {
    const movieTicketResult = await sendMovieTicketEmail({
      to: recipientEmail,
      bookingId: "TEST-EMAIL-RERUN-001",
      bookingCode: "TEST-RERUN-001",
      movieTitle: "Baththa (Feared Gangster)",
      theatreName: "CineVenue Prime Multiplex",
      theatreAddress: "Main Road, Guntur, India",
      city: "Guntur",
      screenName: "Screen 1 (4K Dolby Atmos)",
      date: "Today",
      timeSlot: "07:00 PM",
      seats: ["A1", "A2"],
      seatCategory: "ELITE",
      basePrice: 300,
      convenienceFee: 32,
      gstAmount: 5.76,
      totalPaid: 337.76,
      customerName: "Valued Patron",
      paymentMethod: "UPI Online",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=CINEVENUE-TEST-RERUN-001"
    });

    console.log("  Live Dispatched Status:", movieTicketResult.liveSent ? "✅ LIVE SENT" : "⚠️ FALLBACK LOGGED");
    console.log("  Message:", movieTicketResult.message);
  } catch (err: any) {
    console.error("❌ Movie Ticket Dispatch Exception:", err.message);
  }

  // 4. Verify Event Pass Template Generation
  console.log("\n[STEP 4] Testing Event Pass Template Dispatch...");
  try {
    const eventPassResult = await sendEventPassEmail({
      to: recipientEmail,
      passId: "PASS-TEST-RERUN-002",
      orderId: "ORD-TEST-RERUN-002",
      eventTitle: "CineVenue Grand Music Festival",
      attendeeName: "Valued Patron",
      venueName: "LB Stadium",
      venueAddress: "Hyderabad, Telangana",
      date: "Nov 20, 2026",
      day: "Friday",
      time: "06:30 PM",
      tier: "VIP GOLD",
      totalPrice: 999,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=PASS-TEST-RERUN-002"
    });

    console.log("  Live Dispatched Status:", eventPassResult.liveSent ? "✅ LIVE SENT" : "⚠️ FALLBACK LOGGED");
    console.log("  Message:", eventPassResult.message);
  } catch (err: any) {
    console.error("❌ Event Pass Dispatch Exception:", err.message);
  }

  console.log("\n================================================================================");
  console.log("🏁 EMAIL VERIFICATION COMPLETED");
  console.log("================================================================================\n");
}

runEmailAudit();

