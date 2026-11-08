import http from "http";
import crypto from "crypto";
import { createApp } from "../server/app";
import { prisma } from "../server/config/database";
import { razorpayService } from "../server/modules/payments/razorpay.service";
import { MockPosAdapter } from "../src/modules/integrations/adapters/MockPosAdapter";

interface TestResult {
  scenario: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(scenario: number, name: string, passed: boolean, details?: string) {
  results.push({ scenario, name, passed, details });
  const icon = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${icon} [Scenario ${scenario.toString().padStart(2, "0")}] ${name}`);
  if (details) {
    console.log(`        Details: ${details}`);
  }
}

async function runMasterTestSuite() {
  console.log("===============================================================================");
  console.log("🎬 CINEVENUE MASTER PLATFORM INTEGRATION & LAUNCH VERIFICATION SUITE");
  console.log("===============================================================================\n");

  // Enable loyalty module for testing
  process.env.ENABLE_CINECOINS = "true";

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`Master test server running on: ${baseUrl}\n`);

  const timestamp = Date.now();
  let customerAccessToken = "";
  let customerRefreshToken = "";
  let customerUserId = "";
  const customerEmail = `master_suite_${timestamp}@cinevenue.com`;
  const customerPassword = "MasterSecure123!";
  const customerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let createdTheatre = false;
  let createdMovie = false;
  let testTheatre: any = null;
  let testMovie: any = null;
  let testScreen: any = null;
  let testSeat1: any = null;
  let testSeat2: any = null;
  let testShow: any = null;
  let showSeat1: any = null;
  let showSeat2: any = null;
  let masterBookingId = "";
  let testEvent: any = null;
  let testTicketType: any = null;

  try {
    // -------------------------------------------------------------------------
    // Scenario 01: Customer Registration & JWT Authentication
    // -------------------------------------------------------------------------
    try {
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          password: customerPassword,
          name: "Master Suite Customer",
          mobile: customerPhone
        })
      });
      const regData = await regRes.json();
      customerAccessToken = regData.token || regData.data?.tokens?.accessToken;
      customerRefreshToken = regData.data?.tokens?.refreshToken;
      customerUserId = regData.user?.id || regData.data?.user?.id;

      const passed =
        regRes.status === 201 &&
        Boolean(customerAccessToken) &&
        Boolean(customerRefreshToken) &&
        Boolean(customerUserId);

      recordResult(
        1,
        "Customer Registration & JWT Authentication",
        passed,
        `Status: ${regRes.status}, User ID: ${customerUserId}`
      );
    } catch (e: any) {
      recordResult(1, "Customer Registration & JWT Authentication", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 02: Mobile Refresh Token Rotation & Reuse Prevention
    // -------------------------------------------------------------------------
    try {
      const prevRefreshToken = customerRefreshToken;
      const refRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: prevRefreshToken })
      });
      const refData = await refRes.json();
      const newAccess = refData.data?.tokens?.accessToken || refData.data?.accessToken;
      const newRefresh = refData.data?.tokens?.refreshToken || refData.data?.refreshToken;

      // Attempt reuse of the previous consumed refreshToken
      const reuseRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: prevRefreshToken })
      });

      const passed =
        refRes.status === 200 &&
        Boolean(newAccess) &&
        Boolean(newRefresh) &&
        newRefresh !== prevRefreshToken &&
        reuseRes.status === 401;

      // Update active tokens
      if (newAccess && newRefresh) {
        customerAccessToken = newAccess;
        customerRefreshToken = newRefresh;
      }

      recordResult(
        2,
        "Mobile Refresh Token Rotation & Single-Use Enforcement",
        passed,
        `Rotation: ${refRes.status}, Reuse Rejected: ${reuseRes.status} (401 Unauthorized)`
      );
    } catch (e: any) {
      recordResult(2, "Mobile Refresh Token Rotation & Single-Use Enforcement", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 03: Profile Management & Role Escalation Defense
    // -------------------------------------------------------------------------
    try {
      const uniqueMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      // 1. Valid update
      const updateRes = await fetch(`${baseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        },
        body: JSON.stringify({
          name: "Updated Master Customer",
          mobile: uniqueMobile
        })
      });
      const updateData = await updateRes.json();
      const updatedUser = updateData.data?.user || updateData.data;

      // 2. Malicious role escalation attempt
      const tamperRes = await fetch(`${baseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        },
        body: JSON.stringify({
          name: "Attacker",
          role: "ADMIN"
        })
      });

      const passed =
        updateRes.status === 200 &&
        updatedUser?.name === "Updated Master Customer" &&
        tamperRes.status === 400;

      recordResult(
        3,
        "Profile Management & Role Escalation Defense",
        passed,
        `Update: ${updateRes.status}, Privilege Escalation Blocked: ${tamperRes.status} (400 Bad Request)`
      );
    } catch (e: any) {
      recordResult(3, "Profile Management & Role Escalation Defense", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 04: Push Notification Device Token Lifecycle
    // -------------------------------------------------------------------------
    try {
      const fcmToken = `fcm_token_master_${timestamp}`;
      const regDevRes = await fetch(`${baseUrl}/notifications/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        },
        body: JSON.stringify({
          token: fcmToken,
          platform: "android"
        })
      });
      const regDevData = await regDevRes.json();

      // Deactivate on logout
      const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        },
        body: JSON.stringify({
          deviceToken: fcmToken,
          refreshToken: customerRefreshToken
        })
      });

      // Re-login to get fresh tokens for following scenarios
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          password: customerPassword
        })
      });
      const loginData = await loginRes.json();
      customerAccessToken = loginData.token || loginData.data?.tokens?.accessToken;
      customerRefreshToken = loginData.data?.tokens?.refreshToken;

      const passed =
        regDevRes.status === 200 &&
        regDevData.success === true &&
        logoutRes.status === 200 &&
        loginRes.status === 200;

      recordResult(
        4,
        "Push Notification Device Token Registration & Deactivation",
        passed,
        `Token Registration: ${regDevRes.status}, Logout Deactivation: ${logoutRes.status}`
      );
    } catch (e: any) {
      recordResult(4, "Push Notification Device Token Lifecycle", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 05: Public Movies & Theatres Discovery Pagination
    // -------------------------------------------------------------------------
    try {
      const moviesRes = await fetch(`${baseUrl}/movies?page=1&limit=5`);
      const moviesData = await moviesRes.json();

      const moviesList = moviesData.data?.movies || moviesData.movies || moviesData.data || [];
      const passed =
        moviesRes.status === 200 &&
        Array.isArray(moviesList) &&
        Boolean(moviesData.pagination || moviesData.success);

      recordResult(
        5,
        "Public Movies & Theatres Discovery Pagination",
        passed,
        `Movies Endpoint Status: ${moviesRes.status}, Items Found: ${moviesList.length}`
      );
    } catch (e: any) {
      recordResult(5, "Public Movies & Theatres Discovery Pagination", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Set up Test Theatre, Screen, Movie, Show and Seats for Scenarios 6-12
    // -------------------------------------------------------------------------
    testTheatre = await prisma.theatre.findFirst();
    if (!testTheatre) {
      testTheatre = await prisma.theatre.create({
        data: {
          id: `th_mst_${timestamp}`,
          name: `Master Multiplex ${timestamp}`,
          city: "Hyderabad",
          state: "Telangana",
          location: "Hi-Tech City"
        }
      });
      createdTheatre = true;
    }

    testMovie = await prisma.movie.findFirst();
    if (!testMovie) {
      testMovie = await prisma.movie.create({
        data: {
          id: `mov_mst_${timestamp}`,
          title: `Master Epic ${timestamp}`,
          duration: 150,
          genre: "Action",
          language: "Telugu"
        }
      });
      createdMovie = true;
    }

    testScreen = await prisma.screen.create({
      data: {
        id: `scr_mst_${timestamp}`,
        theatreId: testTheatre.id,
        name: `Screen 1 (Master)`,
        capacity: 100
      }
    });

    testSeat1 = await prisma.seat.create({
      data: {
        id: `seat_m1_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "1",
        price: 150
      }
    });

    testSeat2 = await prisma.seat.create({
      data: {
        id: `seat_m2_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "2",
        price: 150
      }
    });

    testShow = await prisma.show.create({
      data: {
        id: `show_mst_${timestamp}`,
        theatreId: testTheatre.id,
        screenId: testScreen.id,
        movieId: testMovie.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7200000),
        status: "ACTIVE"
      }
    });

    showSeat1 = await prisma.showSeat.create({
      data: {
        id: `ss_m1_${timestamp}`,
        showId: testShow.id,
        seatId: testSeat1.id,
        price: 150,
        status: "AVAILABLE"
      }
    });

    showSeat2 = await prisma.showSeat.create({
      data: {
        id: `ss_m2_${timestamp}`,
        showId: testShow.id,
        seatId: testSeat2.id,
        price: 150,
        status: "AVAILABLE"
      }
    });

    // -------------------------------------------------------------------------
    // Scenario 06: Authoritative Centralized Pricing Breakdown
    // -------------------------------------------------------------------------
    try {
      const priceRes = await fetch(`${baseUrl}/pricing/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "MOVIE",
          ticketPrice: 150,
          quantity: 2
        })
      });
      const priceData = await priceRes.json();
      const pricing = priceData.data || priceData.breakdown;

      // Base: 300, Fee: 32 (16*2), GST: 5.76 (18% of 32), Total: 337.76
      const passed =
        priceRes.status === 200 &&
        priceData.success === true &&
        pricing.ticketSubtotal === 300 &&
        pricing.baseConvenienceFee === 32 &&
        pricing.convenienceFeeGstTotal === 5.76 &&
        pricing.finalPayableAmount === 337.76;

      recordResult(
        6,
        "Authoritative Centralized Pricing Calculation",
        passed,
        `Subtotal: ₹${pricing?.ticketSubtotal}, Fee: ₹${pricing?.baseConvenienceFee}, GST: ₹${pricing?.convenienceFeeGstTotal}, Total: ₹${pricing?.finalPayableAmount}`
      );
    } catch (e: any) {
      recordResult(6, "Authoritative Centralized Pricing Calculation", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 07: High-Concurrency Seat Locking (10-Minute Hold)
    // -------------------------------------------------------------------------
    try {
      const lockRes = await fetch(`${baseUrl}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [showSeat1.id],
          userId: customerUserId
        })
      });
      const lockData = await lockRes.json();

      const passed =
        lockRes.status === 200 &&
        lockData.success === true &&
        lockData.data?.lockedSeats?.length === 1 &&
        Boolean(lockData.data?.lockedUntil);

      recordResult(
        7,
        "High-Concurrency Seat Locking (10-Minute Reservation)",
        passed,
        `Status: ${lockRes.status}, Locked Until: ${lockData.data?.lockedUntil}`
      );
    } catch (e: any) {
      recordResult(7, "High-Concurrency Seat Locking", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 08: Seat Collision Defense (409 Conflict)
    // -------------------------------------------------------------------------
    try {
      const collisionRes = await fetch(`${baseUrl}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [showSeat1.id],
          userId: "competitor_user_456"
        })
      });
      const collisionData = await collisionRes.json();
      const errText = collisionData.message || collisionData.error?.message || (typeof collisionData.error === "string" ? collisionData.error : "") || "";

      const passed =
        collisionRes.status === 409 &&
        errText.toLowerCase().includes("locked");

      recordResult(
        8,
        "Seat Collision Defense (409 Conflict Protection)",
        passed,
        `Status: ${collisionRes.status}, Error Message: ${errText}`
      );
    } catch (e: any) {
      recordResult(8, "Seat Collision Defense", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 09: Seat Release Lifecycle (Unlock Seats)
    // -------------------------------------------------------------------------
    try {
      const unlockRes = await fetch(`${baseUrl}/bookings/release-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [showSeat1.id],
          userId: customerUserId
        })
      });
      const unlockData = await unlockRes.json();

      const reCheck = await prisma.showSeat.findUnique({ where: { id: showSeat1.id } });
      const passed =
        unlockRes.status === 200 &&
        unlockData.success === true &&
        reCheck?.status === "AVAILABLE" &&
        reCheck?.lockedUntil === null;

      recordResult(
        9,
        "Seat Release Lifecycle (Explicit Unlock)",
        passed,
        `Status: ${unlockRes.status}, ShowSeat Status: ${reCheck?.status}`
      );
    } catch (e: any) {
      recordResult(9, "Seat Release Lifecycle", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 10: Backend Pending Booking Creation with Validated Pricing
    // -------------------------------------------------------------------------
    try {
      const bookRes = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [showSeat1.id],
          userId: customerUserId
        })
      });
      const bookData = await bookRes.json();
      masterBookingId = bookData.data?.bookingId;

      // 150 base + 16 fee + 2.88 GST = 168.88
      const passed =
        bookRes.status === 201 &&
        bookData.success === true &&
        Boolean(masterBookingId) &&
        bookData.data?.totalAmount === 168.88;

      recordResult(
        10,
        "Backend Pending Booking with Authoritative Pricing",
        passed,
        `Booking ID: ${masterBookingId}, Total Amount: ₹${bookData.data?.totalAmount}`
      );
    } catch (e: any) {
      recordResult(10, "Backend Pending Booking", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 11: Cryptographic Webhook HMAC & Idempotency Protection
    // -------------------------------------------------------------------------
    try {
      const webhookPayload = {
        entity: "event",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_mst_${timestamp}`,
              order_id: `order_mst_${timestamp}`,
              amount: 16888,
              currency: "INR",
              status: "captured",
              notes: {
                bookingId: masterBookingId
              }
            }
          }
        }
      };

      const rawBody = JSON.stringify(webhookPayload);
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayService.getKeySecret();
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      // 1. First webhook delivery confirms booking
      const whRes1 = await fetch(`${baseUrl}/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature
        },
        body: rawBody
      });

      // 2. Duplicate webhook delivery handled idempotently without duplicate ticket/charge
      const whRes2 = await fetch(`${baseUrl}/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature
        },
        body: rawBody
      });

      const ticketCount = await prisma.ticket.count({ where: { bookingId: masterBookingId } });

      const passed =
        whRes1.status === 200 &&
        whRes2.status === 200 &&
        ticketCount === 1;

      recordResult(
        11,
        "Cryptographic Webhook HMAC & Idempotency Defense",
        passed,
        `Initial Webhook: ${whRes1.status}, Duplicate Re-Delivery: ${whRes2.status}, Tickets Count: ${ticketCount}`
      );
    } catch (e: any) {
      recordResult(11, "Cryptographic Webhook HMAC & Idempotency Defense", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 12: Gate Terminal QR Ticket Verification & Check-In
    // -------------------------------------------------------------------------
    try {
      const confirmedTicket = await prisma.ticket.findFirst({
        where: { bookingId: masterBookingId }
      });

      const qrToken = confirmedTicket?.qrToken || confirmedTicket?.ticketCode || confirmedTicket?.id || `CVQR-${masterBookingId}`;

      // 1. Gate check-in
      const scanRes1 = await fetch(`${baseUrl}/tickets/verify?token=${qrToken}&checkIn=true`);
      const scanData1 = await scanRes1.json();

      // 2. Secondary scan attempt (must show ALREADY_USED)
      const scanRes2 = await fetch(`${baseUrl}/tickets/verify?token=${qrToken}&checkIn=true`);
      const scanData2 = await scanRes2.json();

      const passed =
        scanRes1.status === 200 &&
        scanData1.success === true &&
        scanData1.status === "VALID" &&
        scanData2.status === "ALREADY_USED";

      recordResult(
        12,
        "Gate Terminal QR Ticket Verification & Single Check-In",
        passed,
        `First Admission: ${scanData1.status}, Re-Entry Attempt: ${scanData2.status}`
      );
    } catch (e: any) {
      recordResult(12, "Gate Terminal QR Ticket Verification", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 13: Live Events Creation & Order Placement
    // -------------------------------------------------------------------------
    testEvent = await prisma.event.create({
      data: {
        id: `evt_mst_${timestamp}`,
        title: `Mega CineCon ${timestamp}`,
        description: "Official CineVenue Tech & Film Festival",
        category: "Entertainment",
        venue: "Cyber Convention Hall",
        city: "Hyderabad",
        date: new Date(Date.now() + 86400000 * 5),
        time: "10:00 AM",
        capacity: 2, // strictly limited capacity to 2 for testing
        price: 500,
        organizerId: "org_test"
      }
    });

    testTicketType = await prisma.eventTicketType.create({
      data: {
        id: `ett_mst_${timestamp}`,
        eventId: testEvent.id,
        name: "VIP Pass",
        price: 500,
        capacity: 2,
        available: 2
      }
    });

    try {
      const orderRes = await fetch(`${baseUrl}/events/${testEvent.id}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 1,
          ticketTypeId: testTicketType.id,
          customerName: "VIP Pass Holder"
        })
      });
      const orderData = await orderRes.json();

      const rzpOrderId = `rzp_evt_${timestamp}_1`;
      const rzpPaymentId = `pay_evt_${timestamp}_1`;
      const rzpSig = crypto
        .createHmac("sha256", razorpayService.getKeySecret())
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest("hex");

      const regRes = await fetch(`${baseUrl}/events/${testEvent.id}/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 1,
          ticketTypeId: testTicketType.id,
          attendeeName: "VIP Patron 1",
          attendeeEmail: `vip1_${timestamp}@cinevenue.in`,
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: rzpSig
        })
      });
      const regData = await regRes.json();
      const regId = regData.data?.registration?.id || regData.data?.passCode || regData.data?.registrationId;

      const passed =
        orderRes.status === 200 &&
        regRes.status === 201 &&
        Boolean(regId);

      recordResult(
        13,
        "Live Events Creation & Order Placement",
        passed,
        `Order Creation: ${orderRes.status}, Registration: ${regRes.status}, Pass ID: ${regId}`
      );
    } catch (e: any) {
      recordResult(13, "Live Events Creation & Order Placement", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 14: Event Capacity Overselling Guard (409 Conflict)
    // -------------------------------------------------------------------------
    try {
      // 1. Fill the remaining 1 capacity
      const rzpOrderId2 = `rzp_evt_${timestamp}_2`;
      const rzpPaymentId2 = `pay_evt_${timestamp}_2`;
      const rzpSig2 = crypto
        .createHmac("sha256", razorpayService.getKeySecret())
        .update(`${rzpOrderId2}|${rzpPaymentId2}`)
        .digest("hex");

      await fetch(`${baseUrl}/events/${testEvent.id}/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 1,
          ticketTypeId: testTicketType.id,
          attendeeName: "VIP Patron 2",
          attendeeEmail: `vip2_${timestamp}@cinevenue.in`,
          razorpay_order_id: rzpOrderId2,
          razorpay_payment_id: rzpPaymentId2,
          razorpay_signature: rzpSig2
        })
      });

      // 2. Oversell attempt on now-exhausted capacity
      const oversellRes = await fetch(`${baseUrl}/events/${testEvent.id}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 1,
          ticketTypeId: testTicketType.id,
          customerName: "Overflow Patron"
        })
      });
      const oversellData = await oversellRes.json();
      const errText = oversellData.message || (typeof oversellData.error === "string" ? oversellData.error : oversellData.error?.message) || "";

      const passed =
        oversellRes.status === 409 &&
        errText.toLowerCase().includes("sold out");

      recordResult(
        14,
        "Event Venue Capacity Enforcement (409 Conflict Protection)",
        passed,
        `Oversell Status: ${oversellRes.status}, Error Message: ${errText}`
      );
    } catch (e: any) {
      recordResult(14, "Event Venue Capacity Enforcement", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 15: CineCoins Loyalty Daily Check-in & Spin to Win
    // -------------------------------------------------------------------------
    try {
      // 1. Daily streak claim
      const claimRes = await fetch(`${baseUrl}/cinecoins/claim-daily`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        }
      });
      const claimData = await claimRes.json();

      // 2. Spin to win reward
      const spinRes = await fetch(`${baseUrl}/cinecoins/spin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAccessToken}`
        },
        body: JSON.stringify({ rewardCoins: 25, rewardName: "Silver 25 Coins" })
      });
      const spinData = await spinRes.json();

      const passed =
        claimRes.status === 200 &&
        claimData.success === true &&
        spinRes.status === 200 &&
        spinData.success === true &&
        typeof spinData.data?.newBalance === "number";

      recordResult(
        15,
        "CineCoins Loyalty Daily Check-In & Spin-to-Win Engine",
        passed,
        `Daily Streak Claim: ${claimRes.status} (${claimData.message}), Spin Reward: ${spinRes.status} (New Balance: ${spinData.data?.newBalance})`
      );
    } catch (e: any) {
      recordResult(15, "CineCoins Loyalty Engine", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 16: Universal Theatre POS Integration Adapter
    // -------------------------------------------------------------------------
    try {
      const mockAdapter = new MockPosAdapter();
      const handshake = await mockAdapter.testConnection();
      const screens = await mockAdapter.getScreens();
      const hold = await mockAdapter.holdSeats("show_pos_01", ["A1", "A2"], customerUserId);
      const booking = await mockAdapter.createBooking({
        bookingId: `CV-BK-POS-${timestamp}`,
        theatreId: "mock_theatre_01",
        screenId: screens[0]?.id || "screen_01",
        movieId: "mock_movie_01",
        showId: "show_pos_01",
        userId: customerUserId,
        seatIds: ["A1", "A2"],
        amount: 500,
        holdToken: hold.holdToken
      });

      const passed =
        handshake.success === true &&
        screens.length > 0 &&
        Boolean(hold.holdToken) &&
        Boolean(booking.posBookingId);

      recordResult(
        16,
        "Universal Theatre POS Integration Adapter Simulation",
        passed,
        `Handshake: ${handshake.message}, Hold Token: ${hold.holdToken}, POS Booking ID: ${booking.posBookingId}`
      );
    } catch (e: any) {
      recordResult(16, "Universal Theatre POS Integration Adapter", false, e.message);
    }

    // -------------------------------------------------------------------------
    // Scenario 17: Centralized Admin Protection & Privilege Guard
    // -------------------------------------------------------------------------
    try {
      // Non-admin customer attempting to access admin route
      const adminRes = await fetch(`${baseUrl}/admin/theatres`, {
        headers: {
          Authorization: `Bearer ${customerAccessToken}`
        }
      });

      const passed = adminRes.status === 403 || adminRes.status === 401;

      recordResult(
        17,
        "Centralized Admin Authorization & Privilege Guard",
        passed,
        `Customer Token Rejected on /admin/theatres: ${adminRes.status} (Forbidden/Unauthorized)`
      );
    } catch (e: any) {
      recordResult(17, "Centralized Admin Protection", false, e.message);
    }

    // Clean up test records
    try {
      if (testEvent) {
        await prisma.eventTicketType.deleteMany({ where: { eventId: testEvent.id } });
        await prisma.eventRegistration.deleteMany({ where: { eventId: testEvent.id } });
        await prisma.event.delete({ where: { id: testEvent.id } });
      }

      if (masterBookingId) {
        await prisma.ticket.deleteMany({ where: { bookingId: masterBookingId } });
        await prisma.payment.deleteMany({ where: { bookingId: masterBookingId } });
        await prisma.booking.delete({ where: { id: masterBookingId } });
      }

      if (testShow) {
        await prisma.showSeat.deleteMany({ where: { showId: testShow.id } });
        await prisma.show.delete({ where: { id: testShow.id } });
      }
      if (testScreen) {
        await prisma.seat.deleteMany({ where: { screenId: testScreen.id } });
        await prisma.screen.delete({ where: { id: testScreen.id } });
      }
      if (createdTheatre && testTheatre) {
        await prisma.theatre.delete({ where: { id: testTheatre.id } });
      }
      if (createdMovie && testMovie) {
        await prisma.movie.delete({ where: { id: testMovie.id } });
      }
      if (customerUserId) {
        await prisma.cineCoinTransaction.deleteMany({ where: { walletId: customerUserId } }).catch(() => {});
        await prisma.cineCoinWallet.deleteMany({ where: { userId: customerUserId } }).catch(() => {});
        await prisma.user.delete({ where: { id: customerUserId } }).catch(() => {});
      }
    } catch (cleanupErr) {
      // Non-fatal cleanup
    }

  } finally {
    delete process.env.ENABLE_CINECOINS;
    server.close();
  }

  console.log("\n===============================================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`SUMMARY: ${totalPassed} / ${results.length} SCENARIOS PASSED`);
  console.log("===============================================================================\n");

  if (totalPassed !== results.length) {
    process.exit(1);
  }
  process.exit(0);
}

runMasterTestSuite().catch((err) => {
  console.error("Master Test Suite Execution Failed:", err);
  process.exit(1);
});
