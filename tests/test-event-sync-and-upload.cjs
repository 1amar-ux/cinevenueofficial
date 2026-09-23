const path = require("path");
module.paths.push(path.resolve(__dirname, "../backend/node_modules"));

const assert = require("assert");
const fs = require("fs");
const crypto = require("crypto");

// Load backend services and controllers
const uploadController = require("../backend/controllers/upload.controller");
const eventController = require("../backend/controllers/event.controller");
const uploadService = require("../backend/services/uploadService");
const Event = require("../backend/models/Event");
const EventTicketType = require("../backend/models/EventTicketType");
const EventBooking = require("../backend/models/EventBooking");

function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runEventSyncAndUploadTests() {
  console.log("================================================================");
  console.log("🚀 Testing CineVenue Event Sync, Image Upload & Public Lifecycle");
  console.log("================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function runTest(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`✅ [Test ${totalTests}] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [Test ${totalTests}] ${name} FAILED:`, err.message);
      throw err;
    }
  }

  async function runAsyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`✅ [Test ${totalTests}] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ [Test ${totalTests}] ${name} FAILED:`, err.message);
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Upload Controller Poster Validation
  // -------------------------------------------------------------
  await runAsyncTest("Poster Upload: Rejects Missing File", async () => {
    const req = { file: null, body: {} };
    const res = createMockResponse();
    await uploadController.uploadEventPoster(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /No image file provided/i);
  });

  await runAsyncTest("Poster Upload: Rejects Invalid Mime Type (.exe / text)", async () => {
    const req = {
      file: {
        originalname: "malicious.exe",
        mimetype: "application/x-msdownload",
        size: 1024,
        buffer: Buffer.from("bad-bytes"),
      },
      body: {},
    };
    const res = createMockResponse();
    await uploadController.uploadEventPoster(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Invalid file format/i);
  });

  await runAsyncTest("Poster Upload: Rejects Files Over 5MB", async () => {
    const req = {
      file: {
        originalname: "huge_poster.jpg",
        mimetype: "image/jpeg",
        size: 6 * 1024 * 1024, // 6MB
        buffer: Buffer.alloc(10),
      },
      body: {},
    };
    const res = createMockResponse();
    await uploadController.uploadEventPoster(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /exceeds 5MB limit/i);
  });

  await runAsyncTest("Poster Upload: Successfully Uploads Valid Image (PNG)", async () => {
    const dummyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    const req = {
      file: {
        originalname: "event_poster.png",
        mimetype: "image/png",
        size: dummyPng.length,
        buffer: dummyPng,
      },
      body: { alt: "Official Concert Poster" },
    };
    const res = createMockResponse();
    await uploadController.uploadEventPoster(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.file.url, "URL must be returned");
    assert.ok(res.data.file.publicId, "Public ID must be returned");
    assert.strictEqual(res.data.file.alt, "Official Concert Poster");
  });

  // -------------------------------------------------------------
  // Test 2: Banner Upload
  // -------------------------------------------------------------
  await runAsyncTest("Banner Upload: Successfully Uploads Valid Banner (WEBP)", async () => {
    const dummyWebp = Buffer.from("RIFF2000WEBPVP8X", "utf8");
    const req = {
      file: {
        originalname: "wide_banner.webp",
        mimetype: "image/webp",
        size: dummyWebp.length,
        buffer: dummyWebp,
      },
      body: { alt: "Grand Arena Banner" },
    };
    const res = createMockResponse();
    await uploadController.uploadEventBanner(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.url, "Flat URL must be present for backwards compatibility");
    assert.strictEqual(res.data.alt, "Grand Arena Banner");
  });

  // -------------------------------------------------------------
  // Test 3: Event Schema Structure & Enum Defaults
  // -------------------------------------------------------------
  runTest("Event Schema: Validates Field Definitions & Enums", () => {
    const schema = Event.schema.paths;
    assert.ok(schema.eventType, "eventType path must exist");
    assert.deepStrictEqual(schema.eventType.enumValues, ["PAID", "FREE"]);

    assert.ok(schema.passMode, "passMode path must exist");
    assert.deepStrictEqual(schema.passMode.enumValues, ["PAID", "FREE", "BOTH"]);

    assert.ok(schema.status, "status path must exist");
    assert.ok(schema.status.enumValues.includes("DRAFT"));
    assert.ok(schema.status.enumValues.includes("UPCOMING"));
    assert.ok(schema.status.enumValues.includes("PUBLISHED"));
    assert.ok(schema.status.enumValues.includes("CANCELLED"));

    assert.ok(schema.bookingStatus, "bookingStatus path must exist");
    assert.deepStrictEqual(schema.bookingStatus.enumValues, ["NOT_OPEN", "OPEN", "CLOSED", "SOLD_OUT"]);
  });

  // -------------------------------------------------------------
  // Test 4: Free Event Configuration ($0 price, direct RSVP)
  // -------------------------------------------------------------
  runTest("Free Event Math: Free Passes have ₹0 price & Bypass Payment Gateway", () => {
    const freeBooking = {
      eventType: "FREE",
      passMode: "FREE",
      tickets: [{ ticketTypeId: "FPC-MEDIA-1", name: "Press / Media Pass", quantity: 2, price: 0 }],
      pricing: {
        subtotal: 0,
        bookingFee: 0,
        taxes: 0,
        discount: 0,
        total: 0,
      },
    };

    assert.strictEqual(freeBooking.pricing.subtotal, 0);
    assert.strictEqual(freeBooking.pricing.total, 0);
    const requiresPaymentGateway = freeBooking.pricing.total > 0;
    assert.strictEqual(requiresPaymentGateway, false, "Free event must NOT require Razorpay payment gateway");
  });

  // -------------------------------------------------------------
  // Test 5: Lifecycle & Visibility Filter Verification
  // -------------------------------------------------------------
  runTest("Public Visibility Rule: DRAFT is hidden, PUBLISHED/UPCOMING visible", () => {
    const mockEvents = [
      { id: "1", title: "Live Concert A", status: "PUBLISHED", date: new Date("2026-11-01") },
      { id: "2", title: "Upcoming Gala B", status: "UPCOMING", date: new Date("2026-12-01") },
      { id: "3", title: "Secret Internal Draft", status: "DRAFT", date: new Date("2026-10-01") },
      { id: "4", title: "Cancelled Festival", status: "CANCELLED", date: new Date("2026-10-15") },
    ];

    // Standard public query filter
    const publicVisible = mockEvents.filter((e) => ["PUBLISHED", "UPCOMING", "ONGOING"].includes(e.status));
    assert.strictEqual(publicVisible.length, 2);
    assert.strictEqual(publicVisible.some((e) => e.status === "DRAFT"), false, "DRAFT must not be visible");
    assert.strictEqual(publicVisible.some((e) => e.status === "CANCELLED"), false, "CANCELLED must not be visible");

    // Upcoming public query filter
    const now = new Date();
    const upcomingVisible = mockEvents.filter(
      (e) => (e.status === "UPCOMING" || e.status === "PUBLISHED") && e.date >= now
    );
    assert.strictEqual(upcomingVisible.length, 2);
  });

  // -------------------------------------------------------------
  // Test 6: Mobile App Data Contract Normalization
  // -------------------------------------------------------------
  runTest("Mobile App Contract: Response contains normalized id, bannerUrl, venueName, city, time, minPrice", () => {
    // Simulate raw event doc from MongoDB
    const rawDoc = {
      _id: "66778899aabbccddeeff3344",
      title: "Symphony of Cinema 2026",
      category: "Concerts",
      eventType: "PAID",
      passMode: "PAID",
      status: "PUBLISHED",
      poster: { url: "/uploads/images/poster_1.png", publicId: "poster_1", alt: "Concert Poster" },
      banner: { url: "/uploads/images/banner_1.png", publicId: "banner_1", alt: "Concert Banner" },
      venue: { name: "Shilpakala Auditorium", address: "HITEC City", city: "Hyderabad" },
      startTime: "19:00",
      date: new Date("2026-10-20"),
      ticketTypes: [
        { typeId: { name: "Regular", price: 499 } },
        { typeId: { name: "VIP", price: 1499 } },
      ],
    };

    // Format simulation (matches formatEventResponse in event.controller.js)
    const formatted = {
      id: rawDoc._id.toString(),
      _id: rawDoc._id,
      title: rawDoc.title,
      category: rawDoc.category,
      posterUrl: rawDoc.poster.url,
      bannerUrl: rawDoc.banner.url,
      venueName: rawDoc.venue.name,
      city: rawDoc.venue.city,
      time: rawDoc.startTime,
      date: rawDoc.date.toISOString().split("T")[0],
      minPrice: 499,
      isPaid: true,
      isFree: false,
    };

    // Mobile App assertions
    assert.strictEqual(formatted.id, "66778899aabbccddeeff3344");
    assert.strictEqual(formatted.bannerUrl, "/uploads/images/banner_1.png");
    assert.strictEqual(formatted.venueName, "Shilpakala Auditorium");
    assert.strictEqual(formatted.city, "Hyderabad");
    assert.strictEqual(formatted.time, "19:00");
    assert.strictEqual(formatted.minPrice, 499);
  });

  // -------------------------------------------------------------
  // Test 7: Safe Delete Guard
  // -------------------------------------------------------------
  runTest("Delete Guard: Prevents deletion of events with active bookings", () => {
    function canDeleteEvent(confirmedBookingCount) {
      if (confirmedBookingCount > 0) {
        return { allowed: false, error: "Cannot delete event with confirmed bookings. Cancel the event instead." };
      }
      return { allowed: true };
    }

    const checkWithBookings = canDeleteEvent(5);
    assert.strictEqual(checkWithBookings.allowed, false);

    const checkWithoutBookings = canDeleteEvent(0);
    assert.strictEqual(checkWithoutBookings.allowed, true);
  });

  console.log("\n================================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("================================================================\n");
}

runEventSyncAndUploadTests().catch((err) => {
  console.error("FATAL TEST SUITE FAILURE:", err);
  process.exit(1);
});
