import { getMailTransporter, sendEventPassEmail } from "../server/services/emailService";

async function run() {
  console.log("Checking mail transporter...");
  const transporter = getMailTransporter();
  if (!transporter) {
    console.error("Transporter is null!");
    process.exit(1);
  }
  console.log("Transporter initialized. Verifying SMTP connection to Gmail...");
  try {
    const verifyRes = await transporter.verify();
    console.log("✅ Transporter verification succeeded:", verifyRes);

    console.log("Dispatching test ticket pass to amarnathgattem@gmail.com...");
    const sendRes = await sendEventPassEmail({
      to: "amarnathgattem@gmail.com",
      passId: "CV-PASS-TEST-9988",
      eventTitle: "CineVenue Official Launch Celebration",
      attendeeName: "Amarnath",
      venueName: "CineVenue Grand IMAX & Conventions",
      date: "18 October 2026",
      day: "Sunday",
      time: "06:30 PM",
      tier: "VIP ADMISSION",
      totalPrice: 0,
      isFree: true
    });
    console.log("Send result:", sendRes);
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

run();
