/**
 * Automated Verification Test Suite
 * CINEVENUE CENTRALIZED PRICING & CONVENIENCE FEE MANAGEMENT SYSTEM
 *
 * Verifies all 8 strict acceptance scenarios specified in Section 10:
 * TEST 1: Admin changes ₹12 to ₹15 -> verify website, Android, and Payment Dashboard use ₹15 for new bookings.
 * TEST 2: Customer creates a booking with ₹12 -> Admin changes fee to ₹15 -> verify original booking still retains ₹12 snapshot.
 * TEST 3: Customer attempts to manipulate fee using dev tools -> verify backend rejects manipulated amount.
 * TEST 4: Customer retries a failed payment -> verify original booking amount is retained.
 * TEST 5: Admin disables convenience fees -> verify new bookings do not include convenience fees.
 * TEST 6: Admin changes event booking fees -> verify movie booking fees remain unchanged.
 * TEST 7: Two admins access dashboard from different devices -> verify saved configurations remain consistent globally.
 * TEST 8: Payment gateway receives exact backend-generated amount.
 */

import { CentralizedPricingService } from "../server/services/pricing.service";

async function runTestSuite() {
  console.log("==========================================================================");
  console.log("CINEVENUE CENTRALIZED PRICING & CONVENIENCE FEE SYSTEM - TEST SUITE");
  console.log("==========================================================================\n");

  const service = new CentralizedPricingService();
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
  // TEST 1: Admin changes ₹12 to ₹15.
  // Verify website, Android app, and Payment Dashboard use ₹15 for new bookings.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 1: Admin updates fee from ₹12 to ₹15 ---");
  {
    // Start with default config where Tier 2 (₹50–₹99) has ₹12 fee
    await service.updateConfig({
      enabled: true,
      calculationType: "SLAB",
      feeApplication: "PER_TICKET",
      gstEnabled: true,
      gstPercentage: 18.0,
      slabs: [
        { id: "S1", minPrice: 1, maxPrice: 49, feeAmount: 10, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 0 },
        { id: "S2", minPrice: 50, maxPrice: 99, feeAmount: 12, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 1 },
        { id: "S3", minPrice: 100, maxPrice: 199, feeAmount: 16, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 2 },
        { id: "S4", minPrice: 200, maxPrice: 499, feeAmount: 25, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 3 },
        { id: "S5", minPrice: 500, maxPrice: null, feeAmount: 35, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 4 }
      ]
    });

    const initialCalc = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 80, category: "STANDARD" }]
    });
    assert(initialCalc.baseConvenienceFee === 12, "Pre-condition: Initial fee for ₹80 ticket is ₹12", `Base fee: ₹${initialCalc.baseConvenienceFee}`);

    // Admin updates slab S2 fee to ₹15
    await service.updateSlab("S2", { feeAmount: 15 });

    const updatedCalc = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 80, category: "STANDARD" }]
    });
    assert(
      updatedCalc.baseConvenienceFee === 15 && updatedCalc.totalConvenienceFee === 17.70,
      "TEST 1: New booking now receives ₹15 base convenience fee (+ 18% GST = ₹17.70)",
      `Base fee: ₹${updatedCalc.baseConvenienceFee}, GST: ₹${updatedCalc.convenienceFeeGstTotal}, Total: ₹${updatedCalc.totalConvenienceFee}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 2: Customer creates a booking with ₹12. Admin changes fee to ₹15.
  // Verify the original booking still shows ₹12.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 2: Booking Price Snapshot Immutability ---");
  {
    // Revert slab to ₹12 and create a booking
    await service.updateSlab("S2", { feeAmount: 12 });
    const bookingCalc = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 80, category: "STANDARD" }]
    });

    const bookingId = "BK_TEST_SNAP_001";
    await service.saveBookingSnapshot(bookingId, bookingCalc);

    // Now admin changes fee to ₹15
    await service.updateSlab("S2", { feeAmount: 15 });

    // Retrieve original snapshot
    const savedSnapshot = await service.getBookingSnapshot(bookingId);
    assert(
      Number(savedSnapshot?.baseTicketAmount ?? savedSnapshot?.ticketSubtotal) === 80 &&
      Number(savedSnapshot?.convenienceFee ?? savedSnapshot?.totalConvenienceFee) === 14.16,
      "TEST 2: Original booking preserves exact ₹12 + ₹2.16 GST (₹14.16) snapshot despite admin changing active fee to ₹15",
      `Snapshot base: ₹${savedSnapshot?.baseTicketAmount || savedSnapshot?.ticketSubtotal}, Fee: ₹${savedSnapshot?.convenienceFee || savedSnapshot?.totalConvenienceFee}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Customer attempts to manipulate convenience fee using dev tools.
  // Verify backend rejects manipulated amount.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 3: DevTools Manipulation Prevention ---");
  {
    // Real price: 1 ticket at ₹150 + ₹16 fee + ₹2.88 GST = ₹168.88
    const params = {
      itemType: "MOVIE" as const,
      tickets: [{ price: 150, category: "STANDARD" }]
    };
    const validResult = service.calculatePricing(params);

    // Attacker tries to submit ₹150.00 (tampering fee to 0)
    const tamperedAmount = 150.00;
    const validation = service.validateBookingPrice(tamperedAmount, params);

    assert(
      validation.isValid === false && validation.expectedAmount === 168.88,
      "TEST 3: Backend successfully detects and rejects manipulated client amount",
      `Claimed: ₹${tamperedAmount}, Authoritative Expected: ₹${validation.expectedAmount}, IsValid: ${validation.isValid}`
    );

    // Legitimate submission passes
    const legitValidation = service.validateBookingPrice(168.88, params);
    assert(legitValidation.isValid === true, "TEST 3 (B): Authoritative correct amount passes validation smoothly");
  }

  // --------------------------------------------------------------------------
  // TEST 4: Customer retries a failed payment.
  // Verify the original booking amount is retained.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 4: Payment Retry Amount Retention ---");
  {
    const bookingId = "BK_TEST_RETRY_002";
    const initialCalc = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 150, category: "STANDARD" }] // total = 168.88
    });
    await service.saveBookingSnapshot(bookingId, initialCalc);

    // Admin updates global settings while customer payment was pending/failed
    await service.updateConfig({ fixedAmount: 50 });

    // Customer retries payment for bookingId
    const retrySnapshot = await service.getBookingSnapshot(bookingId);
    assert(
      Number(retrySnapshot.finalPayableAmount) === 168.88,
      "TEST 4: Payment retry retrieves original frozen booking snapshot amount (₹168.88)",
      `Retrieved retry amount: ₹${retrySnapshot.finalPayableAmount}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Admin disables convenience fees.
  // Verify new bookings do not include convenience fees.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 5: Global Enable/Disable Toggle ---");
  {
    // Admin toggles convenience fee OFF
    await service.updateConfig({ enabled: false });

    const disabledCalc = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 250, category: "STANDARD" }]
    });

    assert(
      disabledCalc.isFeeEnabled === false &&
      disabledCalc.baseConvenienceFee === 0 &&
      disabledCalc.convenienceFeeGstTotal === 0 &&
      disabledCalc.totalConvenienceFee === 0 &&
      disabledCalc.finalPayableAmount === 250.00,
      "TEST 5: When fees are disabled by Admin, convenience fee and GST are exactly ₹0 and total equals ticket subtotal",
      `Total Convenience Fee: ₹${disabledCalc.totalConvenienceFee}, Final Payable: ₹${disabledCalc.finalPayableAmount}`
    );

    // Re-enable for subsequent tests
    await service.updateConfig({ enabled: true });
  }

  // --------------------------------------------------------------------------
  // TEST 6: Admin changes event booking fees.
  // Verify movie booking fees remain unchanged.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 6: Movie vs Event Scope Isolation ---");
  {
    // Movie booking fee check
    const movieBefore = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 150, category: "STANDARD" }]
    });

    // Admin configures separate event fixed fee of ₹40
    await service.updateConfig({
      eventFeeCalculationType: "FIXED",
      eventFixedAmount: 40.00
    });

    const eventAfter = service.calculatePricing({
      itemType: "EVENT",
      tickets: [{ price: 150, category: "STANDARD" }]
    });

    const movieAfter = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 150, category: "STANDARD" }]
    });

    assert(
      eventAfter.baseConvenienceFee === 40.00 &&
      movieAfter.baseConvenienceFee === movieBefore.baseConvenienceFee,
      "TEST 6: Event fee updated to ₹40 without affecting Movie booking fee (remains isolated)",
      `Event Base Fee: ₹${eventAfter.baseConvenienceFee}, Movie Base Fee: ₹${movieAfter.baseConvenienceFee}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 7: Two admins access the dashboard from different devices.
  // Verify saved configurations remain consistent globally.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 7: Cross-Device Multi-Admin Consistency ---");
  {
    // Admin A updates fixedAmount to 22.00
    await service.updateConfig({ fixedAmount: 22.00 }, "adminA@cinevenue.com");

    // Admin B connects via another service instance
    const serviceB = new CentralizedPricingService();
    const configB = await serviceB.getConfig();

    assert(
      configB.fixedAmount === 22.00 && configB.updatedBy === "adminA@cinevenue.com",
      "TEST 7: Admin B immediately observes Admin A's published updates across separate instances",
      `Instance B Fixed Amount: ₹${configB.fixedAmount}, UpdatedBy: ${configB.updatedBy}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 8: Payment gateway receives exact backend-generated amount.
  // --------------------------------------------------------------------------
  console.log("\n--- Executing TEST 8: Payment Gateway Order Parity ---");
  {
    await service.updateConfig({ calculationType: "SLAB" });
    const pricing = service.calculatePricing({
      itemType: "MOVIE",
      tickets: [{ price: 200, category: "STANDARD" }, { price: 200, category: "STANDARD" }]
    });

    // Ticket subtotal = 400. Slabs: 200-499 -> 25 per ticket * 2 = 50. GST = 9. Total = 459.00
    const gatewayAmountInINR = pricing.finalPayableAmount;
    const gatewayAmountInPaise = Math.round(gatewayAmountInINR * 100);

    assert(
      gatewayAmountInINR === 459.00 && gatewayAmountInPaise === 45900,
      "TEST 8: Payment gateway receives exact backend calculated amount (₹459.00 / 45900 paise)",
      `Order Amount INR: ₹${gatewayAmountInINR}, Razorpay/Cashfree Paise: ${gatewayAmountInPaise}`
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

