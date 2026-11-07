import http from "http";
import crypto from "crypto";
import { createApp } from "../server/app";
import { prisma } from "../server/config/database";
import { razorpayService } from "../server/modules/payments/razorpay.service";
import { cashfreeService } from "../server/modules/payments/cashfree.service";
import { bookingService } from "../server/modules/bookings/booking.service";
import { env } from "../server/config/env";

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
  console.log(`${icon} [Scenario ${scenario}] ${name}`);
  if (details) {
    console.log(`       Details: ${details}`);
  }
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 CINEVENUE PHASE 3 STAGE B — SECURITY REMEDIATION TEST SUITE");
  console.log("=================================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`Test server running at: ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------------
    // Fixture Setup
    // -------------------------------------------------------------------
    const timestamp = Date.now();

    // 1. Setup Movie Theatre & Show
    let testTheatre = await prisma.theatre.findFirst();
    if (!testTheatre) {
      testTheatre = await prisma.theatre.create({
        data: {
          id: `th_test_${timestamp}`,
          name: "CineVenue Luxe Grand",
          city: "Hyderabad",
          location: "Banjara Hills"
        }
      });
    }

    let testMovie = await prisma.movie.findFirst();
    if (!testMovie) {
      testMovie = await prisma.movie.create({
        data: {
          id: `mv_test_${timestamp}`,
          title: "Baththa",
          language: "Tamil",
          duration: 150,
          genre: "Action"
        }
      });
    }

    const testScreen = await prisma.screen.create({
      data: {
        id: `scr_${timestamp}`,
        theatreId: testTheatre.id,
        name: `Screen ${timestamp}`,
        capacity: 100
      }
    });

    const dbSeat1 = await prisma.seat.create({
      data: {
        id: `seat_a1_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "1",
        price: 150
      }
    });

    const dbSeat2 = await prisma.seat.create({
      data: {
        id: `seat_a2_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "2",
        price: 150
      }
    });

    const dbSeat3 = await prisma.seat.create({
      data: {
        id: `seat_a3_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "3",
        price: 150
      }
    });

    const dbSeat4 = await prisma.seat.create({
      data: {
        id: `seat_a4_${timestamp}`,
        screenId: testScreen.id,
        row: "A",
        number: "4",
        price: 150
      }
    });

    const testShow = await prisma.show.create({
      data: {
        id: `show_test_${timestamp}`,
        theatreId: testTheatre.id,
        screenId: testScreen.id,
        movieId: testMovie.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7200000),
        status: "ACTIVE"
      }
    });

    // Create 4 test show seats
    const seatA1 = await prisma.showSeat.create({
      data: {
        id: `ss_a1_${timestamp}`,
        showId: testShow.id,
        seatId: dbSeat1.id,
        status: "AVAILABLE",
        price: 150
      }
    });

    const seatA2 = await prisma.showSeat.create({
      data: {
        id: `ss_a2_${timestamp}`,
        showId: testShow.id,
        seatId: dbSeat2.id,
        status: "AVAILABLE",
        price: 150
      }
    });

    const seatA3 = await prisma.showSeat.create({
      data: {
        id: `ss_a3_${timestamp}`,
        showId: testShow.id,
        seatId: dbSeat3.id,
        status: "AVAILABLE",
        price: 150
      }
    });

    const seatA4 = await prisma.showSeat.create({
      data: {
        id: `ss_a4_${timestamp}`,
        showId: testShow.id,
        seatId: dbSeat4.id,
        status: "AVAILABLE",
        price: 150
      }
    });

    // Setup Test Event with Capacity
    const testEvent = await prisma.event.create({
      data: {
        id: `evt_test_${timestamp}`,
        title: "Rockstar Anirudh Live Hyderabad",
        description: "Mega live concert",
        category: "Concerts",
        city: "Hyderabad",
        venue: "Gachibowli Stadium",
        date: new Date(Date.now() + 86400000 * 7),
        time: "19:00",
        price: 500,
        capacity: 5, // Strict low capacity for testing overselling
        organizerId: "org_test"
      }
    });

    const testTicketType = await prisma.eventTicketType.create({
      data: {
        id: `tt_test_${timestamp}`,
        eventId: testEvent.id,
        name: "Gold Circle",
        price: 500,
        capacity: 5,
        available: 5
      }
    });

    // -------------------------------------------------------------------
    // Scenario 1: Direct unauthenticated confirmed booking creation is rejected (401/403)
    // -------------------------------------------------------------------
    try {
      const res = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          bookingNumber: `CV-FAKE-${timestamp}`,
          totalAmount: 300,
          movieTitle: "Baththa",
          theatreName: "CineVenue Luxe Grand",
          seats: ["A1"]
        })
      });
      const data = await res.json();
      const passed = res.status === 403;
      recordResult(
        1,
        "Direct unauthenticated confirmed booking creation is rejected (403)",
        passed,
        `Status: ${res.status}, Error: ${data.message || data.error}`
      );
    } catch (e: any) {
      recordResult(1, "Direct unauthenticated confirmed booking rejected", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 2: Direct booking with arbitrary SUCCESS payment status is rejected
    // -------------------------------------------------------------------
    try {
      const res = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: `BK-INJECT-${timestamp}`,
          paymentMethod: "CASHFREE",
          paymentStatus: "SUCCESS",
          totalAmount: 168.88,
          seats: ["A1"]
        })
      });
      const data = await res.json();
      const passed = res.status === 403;
      recordResult(
        2,
        "Direct booking with arbitrary SUCCESS payment status is rejected",
        passed,
        `Status: ${res.status}, Error: ${data.message || data.error}`
      );
    } catch (e: any) {
      recordResult(2, "Direct booking arbitrary payment rejected", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 3: Valid pending booking creation succeeds with authoritative backend pricing
    // -------------------------------------------------------------------
    let pendingBookingId = "";
    try {
      const res = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA1.id],
          userId: `cust_test_${timestamp}`
        })
      });
      const data = await res.json();
      pendingBookingId = data.data?.bookingId;
      const passed =
        res.status === 201 &&
        data.success === true &&
        Boolean(pendingBookingId) &&
        data.data?.totalAmount === 168.88; // 150 base + 16 fee + 2.88 GST
      recordResult(
        3,
        "Valid pending booking creation succeeds with authoritative backend pricing",
        passed,
        `Status: ${res.status}, Total: ₹${data.data?.totalAmount}, BookingId: ${pendingBookingId}`
      );
    } catch (e: any) {
      recordResult(3, "Pending booking creation", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 4: Razorpay webhook with valid HMAC signature confirms pending booking
    // -------------------------------------------------------------------
    try {
      const webhookPayload = {
        entity: "event",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_rzp_mock_${timestamp}`,
              order_id: `order_rzp_mock_${timestamp}`,
              amount: 16888,
              currency: "INR",
              status: "captured",
              notes: {
                bookingId: pendingBookingId
              }
            }
          }
        }
      };

      const rawBody = JSON.stringify(webhookPayload);
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayService.getKeySecret();
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      const res = await fetch(`${baseUrl}/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature
        },
        body: rawBody
      });
      const data = await res.json();

      // Check DB confirmation
      const confirmedBooking = await prisma.booking.findUnique({
        where: { id: pendingBookingId }
      });
      const ticket = await prisma.ticket.findFirst({
        where: { bookingId: pendingBookingId }
      });
      const payment = await prisma.payment.findFirst({
        where: { bookingId: pendingBookingId }
      });

      const passed =
        res.status === 200 &&
        data.processed === true &&
        confirmedBooking?.status === "CONFIRMED" &&
        Boolean(ticket) &&
        payment?.status === "SUCCESS";

      recordResult(
        4,
        "Razorpay webhook with valid HMAC signature confirms pending booking",
        passed,
        `HTTP: ${res.status}, BookingStatus: ${confirmedBooking?.status}, TicketCode: ${ticket?.ticketCode}`
      );
    } catch (e: any) {
      recordResult(4, "Razorpay webhook verification", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 5: Razorpay webhook with invalid HMAC signature is rejected (400)
    // -------------------------------------------------------------------
    try {
      const webhookPayload = { event: "payment.captured", payload: {} };
      const rawBody = JSON.stringify(webhookPayload);
      const invalidSignature = "invalid_tampered_signature_1234567890abcdef";

      const res = await fetch(`${baseUrl}/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": invalidSignature
        },
        body: rawBody
      });
      const data = await res.json();
      const passed = res.status === 400 && data.error === "Invalid webhook signature";
      recordResult(
        5,
        "Razorpay webhook with invalid HMAC signature is rejected (400)",
        passed,
        `Status: ${res.status}, Error: ${data.error}`
      );
    } catch (e: any) {
      recordResult(5, "Razorpay invalid signature rejection", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 6: Cashfree webhook with valid signature confirms pending booking
    // -------------------------------------------------------------------
    let cfPendingBookingId = "";
    try {
      // Create second pending booking for Cashfree
      const pendingRes = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA2.id],
          userId: `cust_cf_${timestamp}`
        })
      });
      const pendingData = await pendingRes.json();
      cfPendingBookingId = pendingData.data?.bookingId;

      const webhookPayload = {
        type: "PAYMENT_SUCCESS_WEBHOOK",
        data: {
          order: {
            order_id: `cf_ord_${timestamp}`,
            order_status: "PAID",
            order_tags: {
              bookingId: cfPendingBookingId
            }
          },
          payment: {
            cf_payment_id: `cf_pay_${timestamp}`
          }
        }
      };

      const rawBody = JSON.stringify(webhookPayload);
      const cfSecret = env.CASHFREE_SECRET_KEY || "cf_test_secret";
      const cfTimestamp = Math.floor(Date.now() / 1000).toString();
      const payloadToSign = `${cfTimestamp}${rawBody}`;
      const validCfSig = crypto.createHmac("sha256", cfSecret).update(payloadToSign).digest("base64");

      const res = await fetch(`${baseUrl}/payments/cashfree/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": validCfSig,
          "x-webhook-timestamp": cfTimestamp
        },
        body: rawBody
      });
      const data = await res.json();

      const confirmedBooking = await prisma.booking.findUnique({
        where: { id: cfPendingBookingId }
      });
      const cfTicket = await prisma.ticket.findFirst({
        where: { bookingId: cfPendingBookingId }
      });

      const passed =
        res.status === 200 &&
        data.received === true &&
        confirmedBooking?.status === "CONFIRMED" &&
        Boolean(cfTicket);

      recordResult(
        6,
        "Cashfree webhook with valid signature confirms pending booking",
        passed,
        `HTTP: ${res.status}, BookingStatus: ${confirmedBooking?.status}`
      );
    } catch (e: any) {
      recordResult(6, "Cashfree webhook confirmation", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 7: Duplicate webhook events are handled idempotently
    // -------------------------------------------------------------------
    try {
      const webhookPayload = {
        entity: "event",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_rzp_mock_${timestamp}`,
              order_id: `order_rzp_mock_${timestamp}`,
              amount: 16888,
              currency: "INR",
              status: "captured",
              notes: {
                bookingId: pendingBookingId
              }
            }
          }
        }
      };

      const rawBody = JSON.stringify(webhookPayload);
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayService.getKeySecret();
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      const res = await fetch(`${baseUrl}/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature
        },
        body: rawBody
      });

      // Verify tickets count for this booking is still exactly 1
      const ticketCount = await prisma.ticket.count({
        where: { bookingId: pendingBookingId }
      });

      const passed = res.status === 200 && ticketCount === 1;
      recordResult(
        7,
        "Duplicate webhook events are handled idempotently without duplicate records",
        passed,
        `HTTP: ${res.status}, Total Tickets Created: ${ticketCount}`
      );
    } catch (e: any) {
      recordResult(7, "Idempotent duplicate webhook", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 8: UPI payment verification requires valid gateway payment reference
    // -------------------------------------------------------------------
    try {
      // 8A. Unverified arbitrary verification fails
      const fakeVerifyRes = await fetch(`${baseUrl}/payments/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "fake_order",
          razorpay_payment_id: "fake_pay",
          razorpay_signature: "fake_sig"
        })
      });
      const fakeData = await fakeVerifyRes.json();
      const rejectionPassed = fakeVerifyRes.status >= 400 || fakeData.verified === false;

      // 8B. Sandbox test confirmation succeeds authoritatively
      const testConfirmRes = await fetch(`${baseUrl}/payments/test-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA3.id]
        })
      });
      const testConfirmData = await testConfirmRes.json();
      const confirmPassed = testConfirmRes.status === 200 && testConfirmData.data?.booking?.status === "CONFIRMED";

      const passed = rejectionPassed && confirmPassed;
      recordResult(
        8,
        "UPI payment verification requires valid gateway payment reference",
        passed,
        `Tampered Sig Rejected: ${rejectionPassed}, Test Confirmation Allowed: ${confirmPassed}`
      );
    } catch (e: any) {
      recordResult(8, "UPI payment verification gateway validation", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 9: Movie seat locking prevents another user from locking same seats
    // -------------------------------------------------------------------
    try {
      // User 1 locks seatA4
      const lockRes1 = await fetch(`${baseUrl}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA4.id],
          userId: "user_alpha"
        })
      });
      const lockData1 = await lockRes1.json();

      // User 2 attempts to lock seatA4
      const lockRes2 = await fetch(`${baseUrl}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA4.id],
          userId: "user_beta"
        })
      });
      const lockData2 = await lockRes2.json();

      const passed = lockRes1.status === 200 && lockRes2.status === 409;
      recordResult(
        9,
        "Movie seat locking prevents another user from locking same seats (409 Conflict)",
        passed,
        `User 1: ${lockRes1.status}, User 2: ${lockRes2.status} (${lockData2.message || lockData2.error})`
      );
    } catch (e: any) {
      recordResult(9, "Concurrent seat locking conflict", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 10: Expired seat locks are released
    // -------------------------------------------------------------------
    try {
      // Release the lock for seatA4
      const releaseRes = await fetch(`${baseUrl}/bookings/release-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA4.id],
          userId: "user_alpha"
        })
      });

      // Now user_beta should successfully lock seatA4
      const reLockRes = await fetch(`${baseUrl}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: testShow.id,
          seatIds: [seatA4.id],
          userId: "user_beta"
        })
      });

      const passed = releaseRes.status === 200 && reLockRes.status === 200;
      recordResult(
        10,
        "Seat lock release allows subsequent customer reservation",
        passed,
        `Release Status: ${releaseRes.status}, Re-lock Status: ${reLockRes.status}`
      );
    } catch (e: any) {
      recordResult(10, "Seat lock release test", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 11: Atomic seat confirmation prevents double-booking
    // -------------------------------------------------------------------
    try {
      // seatA1 is already BOOKED in Scenario 4. Attempt to confirm another booking on seatA1.
      const doubleBooking = await prisma.booking.create({
        data: {
          bookingNumber: `CV-DBL-${timestamp}`,
          theatreId: testTheatre.id,
          showId: testShow.id,
          userId: null,
          ticketAmount: 150,
          ticketSubtotal: 150,
          platformFee: 16,
          convenienceFee: 16,
          convenienceFeeTax: 2.88,
          taxAmount: 2.88,
          discountAmount: 0,
          gatewayFee: 0,
          totalAmount: 168.88,
          status: "PENDING"
        }
      });

      await prisma.bookingItem.create({
        data: {
          bookingId: doubleBooking.id,
          showSeatId: seatA1.id,
          price: 150
        }
      });

      let doubleBookError = "";
      try {
        await bookingService.confirmBooking(doubleBooking.id, {
          orderId: `ord_dbl_${timestamp}`,
          paymentId: `pay_dbl_${timestamp}`,
          provider: "CASHFREE"
        });
      } catch (err: any) {
        doubleBookError = err.message;
      }

      const passed = doubleBookError.includes("already been booked");
      recordResult(
        11,
        "Atomic seat confirmation prevents double-booking of previously booked seat",
        passed,
        `Conflict Caught: "${doubleBookError}"`
      );
    } catch (e: any) {
      recordResult(11, "Double booking prevention", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 12: Event capacity is enforced and prevents overselling
    // -------------------------------------------------------------------
    try {
      // Event capacity is 5. Fill up the 5 tickets.
      const fillOrderRes = await fetch(`${baseUrl}/events/${testEvent.id}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 5,
          ticketTypeId: testTicketType.id,
          customerName: "VIP Group"
        })
      });

      // Confirm 5 tickets registration
      const rzpOrderId = `rzp_evt_test_${timestamp}`;
      const rzpPaymentId = `pay_evt_test_${timestamp}`;
      const rzpSig = crypto
        .createHmac("sha256", razorpayService.getKeySecret())
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest("hex");

      const regRes = await fetch(`${baseUrl}/events/${testEvent.id}/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 5,
          ticketTypeId: testTicketType.id,
          attendeeName: "VIP Patron",
          attendeeEmail: `vip_${timestamp}@cinevenue.in`,
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: rzpSig
        })
      });
      const regData = await regRes.json();

      // Attempt to book 1 MORE ticket on this sold out event
      const oversellRes = await fetch(`${baseUrl}/events/${testEvent.id}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCount: 1,
          ticketTypeId: testTicketType.id,
          customerName: "Overflow Customer"
        })
      });
      const oversellData = await oversellRes.json();
      const errText = oversellData.message || (typeof oversellData.error === "string" ? oversellData.error : oversellData.error?.message) || "";

      const passed =
        regRes.status === 201 &&
        oversellRes.status === 409 &&
        errText.toLowerCase().includes("sold out");

      recordResult(
        12,
        "Event capacity is strictly enforced and prevents overselling (409 Conflict)",
        passed,
        `Registration: ${regRes.status}, Oversell Attempt: ${oversellRes.status} (${oversellData.message})`
      );
    } catch (e: any) {
      recordResult(12, "Event capacity overselling prevention", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 13: Event available count decrements atomically and restores on cancel
    // -------------------------------------------------------------------
    try {
      // Check available count on ticket type after Scenario 12
      const updatedTicketType = await prisma.eventTicketType.findUnique({
        where: { id: testTicketType.id }
      });
      const initialAvailable = updatedTicketType?.available; // should be 0

      // Cancel the event registration
      const registration = await prisma.eventRegistration.findFirst({
        where: { eventId: testEvent.id, status: "CONFIRMED" }
      });

      const cancelRes = await fetch(`${baseUrl}/events/registrations/${registration?.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Test Capacity Rollback",
          isOrganizerCancellation: true
        })
      });

      // Check available count after cancellation
      const restoredTicketType = await prisma.eventTicketType.findUnique({
        where: { id: testTicketType.id }
      });

      const passed =
        initialAvailable === 0 &&
        cancelRes.status === 200 &&
        restoredTicketType?.available === 5;

      recordResult(
        13,
        "Event available count decrements atomically and restores on cancellation",
        passed,
        `Decremented to: ${initialAvailable}, Restored to: ${restoredTicketType?.available}`
      );
    } catch (e: any) {
      recordResult(13, "Atomic capacity decrement & rollback", false, e.message);
    }

  } finally {
    server.close();
  }

  // -------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------
  console.log("\n=================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL SCENARIOS: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("=================================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});

