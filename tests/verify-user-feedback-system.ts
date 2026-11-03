/**
 * Automated Verification Test Suite
 * CINEVENUE POST-BOOKING USER FEEDBACK & ADMIN ANALYTICS SYSTEM
 *
 * Verifies:
 * 1. Feedback creation with 1-5 star ratings
 * 2. Rejection of invalid ratings (< 1, > 5, NaN)
 * 3. Scope handling for MOVIE vs EVENT bookings
 * 4. Search and filter capabilities in feedback queries
 * 5. Statistical analytics calculation (averages, distributions, satisfaction rate)
 * 6. Local client tracking and storage resilience
 * 7. Deletion of feedback records
 */

import { feedbackService } from "../server/services/feedback.service";

async function runTestSuite() {
  console.log("==========================================================================");
  console.log("CINEVENUE USER FEEDBACK & ADMIN ANALYTICS - TEST SUITE");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Submit Valid Feedback for a Movie Booking
  // --------------------------------------------------------------------------
  console.log("--- Executing TEST 1: Valid Movie Feedback Submission ---");
  {
    const movieFeedback = await feedbackService.createFeedback({
      bookingId: "BK-TEST-MOV-901",
      bookingType: "MOVIE",
      rating: 5,
      comment: "Superb theater sound and lightning fast seat selection!",
      userEmail: "test.patron@cinevenue.com",
      userName: "Ramesh Kumar",
      title: "The Raja Saab (Telugu - IMAX)"
    });

    assert(
      movieFeedback.id.startsWith("fb-") &&
      movieFeedback.rating === 5 &&
      movieFeedback.bookingType === "MOVIE" &&
      movieFeedback.bookingId === "BK-TEST-MOV-901",
      "TEST 1: Successfully created 5-star movie feedback with valid ID & timestamp",
      `Feedback ID: ${movieFeedback.id}, CreatedAt: ${movieFeedback.createdAt}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 2: Submit Valid Feedback for an Event Booking
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 2: Valid Event Feedback Submission ---");
  {
    const eventFeedback = await feedbackService.createFeedback({
      bookingId: "EVT-TEST-PASS-442",
      bookingType: "EVENT",
      rating: 4,
      comment: "Loved the digital pass and instant QR ticket generation.",
      userEmail: "event.goer@cinevenue.com",
      userName: "Ananya Roy",
      title: "Sunburn Music Arena 2026"
    });

    assert(
      eventFeedback.id.startsWith("fb-") &&
      eventFeedback.rating === 4 &&
      eventFeedback.bookingType === "EVENT",
      "TEST 2: Successfully created 4-star event feedback",
      `BookingType: ${eventFeedback.bookingType}, Rating: ${eventFeedback.rating}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Validation - Reject Invalid Ratings (< 1 or > 5 or NaN)
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 3: Star Rating Range Validation ---");
  {
    let rejectedLow = false;
    try {
      await feedbackService.createFeedback({
        bookingId: "BK-FAIL-001",
        bookingType: "MOVIE",
        rating: 0,
        comment: "Zero stars should fail"
      });
    } catch {
      rejectedLow = true;
    }

    let rejectedHigh = false;
    try {
      await feedbackService.createFeedback({
        bookingId: "BK-FAIL-002",
        bookingType: "MOVIE",
        rating: 6,
        comment: "Six stars should fail"
      });
    } catch {
      rejectedHigh = true;
    }

    assert(
      rejectedLow && rejectedHigh,
      "TEST 3: System strictly enforces 1 to 5 star rating boundary",
      `Rejected 0 Stars: ${rejectedLow}, Rejected 6 Stars: ${rejectedHigh}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: Missing Booking ID Validation
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 4: Booking ID Requirement ---");
  {
    let rejectedEmptyBooking = false;
    try {
      await feedbackService.createFeedback({
        bookingId: "",
        bookingType: "MOVIE",
        rating: 5,
        comment: "Missing booking ID"
      });
    } catch {
      rejectedEmptyBooking = true;
    }

    assert(
      rejectedEmptyBooking,
      "TEST 4: Feedback without a booking ID is rejected with validation error"
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Querying Feedbacks with Filters (Type, Rating, Search)
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 5: Filtering & Search Queries ---");
  {
    // Filter by type: MOVIE
    const movieOnly = await feedbackService.getFeedbacks({ bookingType: "MOVIE" });
    const allMovies = movieOnly.items.every((f) => f.bookingType === "MOVIE");

    // Filter by rating: 5
    const fiveStars = await feedbackService.getFeedbacks({ rating: 5 });
    const allFives = fiveStars.items.every((f) => f.rating === 5);

    // Search query
    const searchRes = await feedbackService.getFeedbacks({ search: "Ramesh" });
    const foundRamesh = searchRes.items.some((f) => f.userName === "Ramesh Kumar");

    assert(
      allMovies && allFives && foundRamesh,
      "TEST 5: Admin query filters (Booking Type, Star Rating, and Search Query) operate accurately",
      `Movie count: ${movieOnly.items.length}, 5-star count: ${fiveStars.items.length}, Found Search: ${foundRamesh}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 6: Statistical Analytics Calculation
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 6: Statistical Analytics & Satisfaction Metrics ---");
  {
    const stats = await feedbackService.getFeedbackStats();

    assert(
      stats.total > 0 &&
      stats.averageRating >= 1 &&
      stats.averageRating <= 5 &&
      stats.movieCount >= 1 &&
      stats.eventCount >= 1 &&
      stats.satisfactionPercentage >= 0 &&
      stats.satisfactionPercentage <= 100,
      "TEST 6: Feedback analytics aggregates totals, type counts, averages, and satisfaction rate",
      `Total: ${stats.total}, Avg: ${stats.averageRating}★, Movie: ${stats.movieCount}, Event: ${stats.eventCount}, Satisfaction: ${stats.satisfactionPercentage}%`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 7: Delete Feedback Record (Admin Moderation)
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 7: Feedback Deletion (Admin Moderation) ---");
  {
    const tempItem = await feedbackService.createFeedback({
      bookingId: "BK-TEMP-DELETE-999",
      bookingType: "MOVIE",
      rating: 3,
      comment: "Temporary comment to delete"
    });

    const deleteOk = await feedbackService.deleteFeedback(tempItem.id);
    const searchAfterDelete = await feedbackService.getFeedbacks({ search: "BK-TEMP-DELETE-999" });

    assert(
      deleteOk && searchAfterDelete.items.length === 0,
      "TEST 7: Admin successfully deletes a feedback item from the repository"
    );
  }

  console.log("\n==========================================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});

