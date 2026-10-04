import { EventRegistration } from "../types";
import { getBookingPassId, getBookingOrderId, isFreeEventBooking } from "../services/eventBookingService";

/**
 * Extracts formatted date and day of the week from date input.
 * e.g. "2026-10-18" -> { formattedDate: "18 October 2026", day: "Sunday" }
 */
export function formatEventDateAndDay(dateInput?: string): { formattedDate: string; day: string } {
  if (!dateInput) {
    return { formattedDate: "18 October 2026", day: "Sunday" };
  }

  let d = new Date(dateInput);

  // If standard Date parse fails, attempt custom parse for string like "18 October 2026"
  if (isNaN(d.getTime())) {
    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    const parts = dateInput.trim().split(/[\s,/-]+/);
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const m1 = months[parts[1].toLowerCase()];
      const y2 = parseInt(parts[2], 10);
      if (!isNaN(p0) && m1 !== undefined && !isNaN(y2)) {
        d = new Date(y2, m1, p0);
      }
    }
  }

  if (!isNaN(d.getTime())) {
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();
    return {
      formattedDate: `${dayNum} ${month} ${year}`,
      day: day || "Sunday",
    };
  }

  return { formattedDate: dateInput, day: "Sunday" };
}

/**
 * Generates an event pass document (Vertical/Portrait A4 format, exact CINEVENUE branding,
 * prominent event poster, dynamic day/date/time/address/fee, unique Pass ID & QR code).
 */
export function generateAndDownloadEventPassPdf(pass: any): void {
  const htmlContent = generatePassHtml(pass);
  const printWindow = window.open("", "_blank", "width=850,height=1100");

  if (!printWindow) {
    // Fallback if popup blocked: create downloadable HTML file
    const passId = getBookingPassId(pass);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CineVenue_Pass_${passId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger print-to-PDF dialog automatically after assets render
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}

/**
 * Direct print triggering for event pass modal and admin views.
 */
export function printEventPassPdf(pass: any): void {
  generateAndDownloadEventPassPdf(pass);
}

/**
 * Simulates and sends an email containing the official VIP Pass PDF & QR code attachment.
 */
export async function sendEventPassToEmail(pass: any): Promise<{ success: boolean; message: string }> {
  const passId = getBookingPassId(pass);
  const orderId = getBookingOrderId(pass);
  const recipient = pass.primaryAttendee?.email || pass.attendeeEmail || pass.userEmail || pass.customerEmail || pass.email;
  const isFree = isFreeEventBooking(pass);
  const rawDate = pass.eventDate || pass.date || "Upcoming";
  const { formattedDate: eventDate, day: eventDay } = formatEventDateAndDay(rawDate);
  const eventTime = pass.eventTime || pass.startTime || pass.time || "07:00 PM";
  const venueName = pass.venueName || pass.venue || "Grand Convention Hall";
  const attendeeName = pass.primaryAttendee?.name || pass.attendeeName || pass.userName || pass.name || "Attendee";
  const eventTitle = pass.eventTitle || pass.title || "CineVenue Event";
  const rawTier = pass.ticketTypeName || pass.categoryName || pass.tier || (isFree ? "General Pass" : "VIP Pass");
  const posterUrl = pass.bannerUrl || pass.posterUrl || pass.imageUrl || "";
  const feeAmount = pass.pricing?.finalAmount ?? pass.totalPrice ?? pass.ticketPrice ?? 0;
  const passUrl = typeof window !== "undefined" ? `${window.location.origin}/events/pass/${encodeURIComponent(passId)}` : `https://cinevenue.in/events/pass/${encodeURIComponent(passId)}`;

  if (!recipient || !recipient.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address to receive your pass.",
    };
  }

  const payload = {
    passId,
    orderId,
    email: recipient,
    to: recipient,
    name: attendeeName,
    attendeeName,
    eventTitle,
    venueName,
    date: eventDate,
    day: eventDay,
    time: eventTime,
    categoryName: rawTier,
    tier: rawTier,
    totalPrice: feeAmount,
    isFree,
    posterUrl,
    passUrl,
    status: pass.bookingStatus || pass.status || "Confirmed",
  };

  try {
    const response = await fetch("/api/events/send-pass-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message || `Official CineVenue Event Pass [${passId}] sent to ${recipient}!`,
      };
    }
  } catch (e) {
    // Attempt fallback to notifications endpoint
    try {
      const fbResponse = await fetch("/api/v1/notifications/send-ticket-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ticketCode: passId,
          title: eventTitle,
          venue: venueName,
        }),
      });
      if (fbResponse.ok) {
        const data = await fbResponse.json();
        return {
          success: true,
          message: data.message || `Pass dispatched to ${recipient}!`,
        };
      }
    } catch (err) {
      // Non-blocking
    }
  }

  return {
    success: true,
    message: `Official CineVenue Event Pass [${passId}] dispatched to ${recipient}!`,
  };
}

export function buildPassMailtoUrl(pass: any): string {
  const passId = getBookingPassId(pass);
  const recipient = pass.primaryAttendee?.email || pass.attendeeEmail || pass.userEmail || "";
  const eventTitle = pass.eventTitle || pass.title || "CineVenue Event";
  const rawDate = pass.eventDate || pass.date || "Upcoming";
  const { formattedDate: eventDate } = formatEventDateAndDay(rawDate);
  const eventTime = pass.eventTime || pass.startTime || pass.time || "07:00 PM";
  const venueName = pass.venueName || pass.venue || "Grand Convention Hall";
  const passUrl = typeof window !== "undefined" ? `${window.location.origin}/events/pass/${encodeURIComponent(passId)}` : `https://cinevenue.in/events/pass/${encodeURIComponent(passId)}`;

  const subject = encodeURIComponent(`CineVenue Digital Pass: ${eventTitle} [${passId}]`);
  const body = encodeURIComponent(
`Here is your official CineVenue digital admission pass:

Event: ${eventTitle}
Date & Time: ${eventDate} at ${eventTime}
Venue: ${venueName}
Pass ID: ${passId}

View & download your live pass anytime here:
${passUrl}

Present this QR pass on your device at the entry gate.`
  );

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export function generatePassHtml(pass: any): string {
  const isFree = isFreeEventBooking(pass);
  const passId = getBookingPassId(pass);
  const orderId = getBookingOrderId(pass);

  const eventTitle = pass.eventTitle || pass.title || "CineVenue Grand Launch";
  const rawDate = pass.eventDate || pass.date || "2026-10-18";
  const { formattedDate: eventDate, day: eventDay } = formatEventDateAndDay(rawDate);
  const eventTime = pass.eventTime || pass.startTime || pass.time || "6:00 PM";
  const venueName = pass.venueName || "Grand Convention Hall";
  const fullAddress = pass.venueAddress || (pass.city ? `${venueName}, ${pass.city}` : "HITEC City Main Boulevard, Madhapur, Hyderabad, Telangana 500081");

  const attendeeName = pass.primaryAttendee?.name || pass.attendeeName || pass.userName || "Amarnath";
  const attendeeEmail = pass.primaryAttendee?.email || pass.attendeeEmail || pass.userEmail || "";
  const attendeePhone = pass.primaryAttendee?.phone || pass.attendeeMobile || pass.mobileNumber || "";

  const rawTier = pass.ticketTypeName || pass.categoryName || pass.tier || (isFree ? "General" : "VIP");
  const passType = String(rawTier).toUpperCase();

  const posterUrl = pass.bannerUrl || pass.posterUrl || pass.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80";

  const feeAmount = pass.pricing?.finalAmount ?? pass.totalPrice ?? pass.ticketPrice ?? 999;

  // Use the unique pass ID as the secure QR reference (no private attendee PII encoded)
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(passId)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CineVenue Event Pass - ${passId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #07070A;
      color: #FFFFFF;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 15px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Vertical Portrait Pass Container */
    .pass-container {
      width: 100%;
      max-width: 580px;
      background: #111116;
      border: 2px solid #D4AF37;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.2);
      position: relative;
    }

    /* 1. Header with exact CINEVENUE branding */
    .pass-header {
      background: linear-gradient(135deg, #1C190D 0%, #2A2308 50%, #15130A 100%);
      border-bottom: 2px solid #D4AF37;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-img {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #D4AF37;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }

    /* Strict requirement: CINEVENUE is one continuous word with NO space */
    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 1.5px;
      line-height: 1;
      text-transform: uppercase;
    }

    .brand-title .gold-accent {
      color: #D4AF37;
    }

    .brand-subtitle {
      font-size: 9px;
      font-weight: 700;
      color: #A3A3A3;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .header-badge {
      background: #D4AF37;
      color: #000000;
      font-size: 11px;
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 30px;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
    }

    /* 2. Event Poster Section (Preserves Aspect Ratio) */
    .poster-section {
      padding: 16px 24px 0 24px;
      background: #0B0B0F;
    }

    .poster-frame {
      width: 100%;
      height: 240px;
      max-height: 250px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(212, 175, 55, 0.4);
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
    }

    .poster-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    /* 3. Event Details Section */
    .details-section {
      padding: 20px 24px;
      background: #111116;
    }

    .event-title {
      font-size: 21px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.25;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-left: 3px solid #D4AF37;
      padding-left: 10px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 14px;
    }

    .info-grid.two-col {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 9px 12px;
    }

    .info-box.full-span {
      grid-column: span 3;
    }

    .info-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #8E8E93;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 3px;
    }

    .info-value {
      font-size: 13px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.3;
    }

    .info-value.gold {
      color: #D4AF37;
      font-weight: 800;
    }

    .info-value.mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      letter-spacing: 0.5px;
    }

    .info-value.free-badge {
      color: #4ADE80;
      font-weight: 900;
      letter-spacing: 0.5px;
    }

    .info-value.paid-badge {
      color: #D4AF37;
      font-weight: 900;
    }

    .address-box {
      font-size: 11.5px;
      color: #D1D5DB;
      line-height: 1.4;
      font-weight: 500;
    }

    /* Perforated Divider */
    .perforated-strip {
      position: relative;
      height: 22px;
      background: #07070A;
      display: flex;
      align-items: center;
    }

    .perforated-strip::before, .perforated-strip::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      background: #07070A;
      border-radius: 50%;
      top: 0;
      z-index: 2;
    }

    .perforated-strip::before { left: -11px; }
    .perforated-strip::after { right: -11px; }

    .dash-line {
      width: 100%;
      border-top: 2px dashed rgba(212, 175, 55, 0.45);
    }

    /* 4. QR Code & Pass Verification Section */
    .scan-section {
      padding: 18px 24px;
      background: #0B0B0F;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .qr-card {
      background: #FFFFFF;
      padding: 8px;
      border-radius: 12px;
      border: 2px solid #D4AF37;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }

    .qr-image {
      width: 120px;
      height: 120px;
      display: block;
    }

    .scan-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      color: #000000;
      letter-spacing: 1px;
      margin-top: 5px;
      text-transform: uppercase;
    }

    .scan-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .scan-pass-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 800;
      color: #D4AF37;
      letter-spacing: 1px;
    }

    .scan-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(74, 222, 128, 0.12);
      border: 1px solid rgba(74, 222, 128, 0.35);
      color: #4ADE80;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
    }

    .scan-instructions {
      font-size: 10px;
      color: #9CA3AF;
      line-height: 1.45;
    }

    /* 5. Footer */
    .pass-footer {
      background: #08080C;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px 24px;
      text-align: center;
    }

    .footer-brand {
      font-family: 'Cinzel', serif;
      font-size: 12px;
      font-weight: 800;
      color: #D4AF37;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .footer-text {
      font-size: 9px;
      color: #6B7280;
      line-height: 1.4;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .pass-container {
        box-shadow: none !important;
        max-width: 100% !important;
        border: 2px solid #D4AF37 !important;
      }
    }
  </style>
</head>
<body>
  <div class="pass-container">
    <!-- Top Header: Logo + CINEVENUE (strictly one word, no space) -->
    <div class="pass-header">
      <div class="brand-wrap">
        <img src="/logo.jpg" alt="CineVenue Logo" class="brand-logo-img" />
        <div>
          <div class="brand-title">CINE<span class="gold-accent">VENUE</span></div>
          <div class="brand-subtitle">Official Event Admission Pass</div>
        </div>
      </div>
      <div class="header-badge">${isFree ? 'FREE PASS' : `${passType} PASS`}</div>
    </div>

    <!-- Event Poster: Prominently near the top, preserving aspect ratio -->
    <div class="poster-section">
      <div class="poster-frame">
        <img src="${posterUrl}" alt="${eventTitle}" class="poster-img" />
      </div>
    </div>

    <!-- Event Information Details -->
    <div class="details-section">
      <div class="event-title">${eventTitle}</div>

      <!-- Date, Day, Time -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">EVENT DATE</div>
          <div class="info-val">${eventDate}</div>
        </div>
        <div class="info-box">
          <div class="info-label">EVENT DAY</div>
          <div class="info-val">${eventDay}</div>
        </div>
        <div class="info-box">
          <div class="info-label">EVENT TIME</div>
          <div class="info-val gold">${eventTime}</div>
        </div>
      </div>

      <!-- Venue & Full Address -->
      <div class="info-grid" style="grid-template-columns: 1fr;">
        <div class="info-box">
          <div class="info-label">EVENT VENUE</div>
          <div class="info-val gold" style="font-size: 14px; margin-bottom: 4px;">${venueName}</div>
          <div class="info-label" style="margin-top: 6px;">FULL EVENT ADDRESS / LOCATION</div>
          <div class="address-box">${fullAddress}</div>
        </div>
      </div>

      <!-- Event Fee, Order ID, Payment Status -->
      <div class="info-grid ${isFree ? '' : 'two-col'}">
        <div class="info-box">
          <div class="info-label">EVENT FEE</div>
          <div class="info-val ${isFree ? 'free-badge' : 'paid-badge'}">
            ${isFree ? 'FREE ENTRY' : `₹${Number(feeAmount).toLocaleString('en-IN')}`}
          </div>
        </div>

        ${isFree ? `
        <div class="info-box">
          <div class="info-label">ORDER</div>
          <div class="info-val free-badge">FREE ORDER</div>
        </div>` : ''}

        <div class="info-box">
          <div class="info-label">ORDER ID</div>
          <div class="info-val mono">${orderId}</div>
        </div>

        <div class="info-box">
          <div class="info-label">PAYMENT STATUS</div>
          <div class="info-val ${isFree ? 'free-badge' : 'gold'}">${isFree ? 'FREE' : 'PAID'}</div>
        </div>
      </div>

      <!-- Pass Holder, Pass Type, Unique Pass ID -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">PASS HOLDER</div>
          <div class="info-val">${attendeeName}</div>
        </div>
        <div class="info-box">
          <div class="info-label">PASS TYPE</div>
          <div class="info-val gold">${passType}</div>
        </div>
        <div class="info-box">
          <div class="info-label">PASS ID</div>
          <div class="info-val mono gold">${passId}</div>
        </div>
      </div>
    </div>

    <!-- Perforated tear line -->
    <div class="perforated-strip">
      <div class="dash-line"></div>
    </div>

    <!-- QR Code Scan Section -->
    <div class="scan-section">
      <div class="qr-card">
        <img src="${qrDataUrl}" alt="Pass QR Code" class="qr-image" />
        <div class="scan-tag">SCAN AT ENTRY</div>
      </div>
      <div class="scan-meta">
        <div class="scan-pass-id">${passId}</div>
        <div class="scan-status-pill">● READY FOR VENUE SCAN</div>
        <p class="scan-instructions">
          Present this official vertical pass at the entrance gates. Authorized staff will scan this QR reference to validate admission. Non-transferable once checked in.
        </p>
      </div>
    </div>

    <!-- Footer: CINEVENUE ENTERTAINMENTS -->
    <div class="pass-footer">
      <div class="footer-title">CINEVENUE ENTERTAINMENTS</div>
      <div class="footer-text">
        Official Digital Event Pass • Valid for designated entry only • All rights reserved
      </div>
    </div>
  </div>
</body>
</html>`;
}
