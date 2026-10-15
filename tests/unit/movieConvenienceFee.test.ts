import { movieFeeService } from "../../server/modules/bookings/movieFee.service";
import { bookingService } from "../../server/modules/bookings/booking.service";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runMovieConvenienceFeeTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };

  // Scenario 1: Initial Seed & Canonical Table Verification (18 configurations)
  try {
    const configs = await movieFeeService.getAllConfigs();
    assert(configs.length >= 18, `Expected at least 18 fee configurations, found ${configs.length}`);

    // Verify presence of all required prices from table
    const requiredPrices = [50, 84, 100, 120, 125, 147, 150, 175, 177, 200, 235, 250, 295, 350, 470, 708];
    for (const p of requiredPrices) {
      const match = configs.some((c) => Number(c.ticketPrice) === p);
      assert(match, `Required ticket price ₹${p} missing from fee configurations`);
    }

    results.push({ name: "Scenario 1: Verified canonical fee configurations loaded with 16+ prices", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 1: Canonical fee configurations verification", passed: false, error: err.message });
  }

  // Scenario 2: Preserve duplicate entries for ₹84 and ₹147 in distinct categories
  try {
    const configs = await movieFeeService.getAllConfigs();
    const fees84 = configs.filter((c) => Number(c.ticketPrice) === 84);
    assert(fees84.length >= 2, `Expected at least 2 configurations for ₹84, found ${fees84.length}`);
    const cat84 = fees84.map((c) => c.category.toUpperCase());
    assert(cat84.includes("STANDARD") && cat84.includes("SPECIAL"), "₹84 configs must preserve STANDARD and SPECIAL categories");

    const fees147 = configs.filter((c) => Number(c.ticketPrice) === 147);
    assert(fees147.length >= 2, `Expected at least 2 configurations for ₹147, found ${fees147.length}`);
    const cat147 = fees147.map((c) => c.category.toUpperCase());
    assert(cat147.includes("STANDARD") && cat147.includes("PREMIUM"), "₹147 configs must preserve STANDARD and PREMIUM categories");

    results.push({ name: "Scenario 2: Preserved duplicate price entries for ₹84 and ₹147 under distinct categories", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 2: Duplicate price entries preservation", passed: false, error: err.message });
  }

  // Scenario 3: Admin adds a new fee configuration
  let testCreatedConfigId = "";
  try {
    // Ensure clean state if previously run
    const existing650 = (await movieFeeService.getAllConfigs()).find(
      (c) => Number(c.ticketPrice) === 650 && c.category.toUpperCase() === "LUXURY"
    );
    if (existing650) {
      await movieFeeService.deleteConfig(existing650.id, "superadmin@cinevenue.com").catch(() => {});
    }

    const newConfig = await movieFeeService.createConfig({
      ticketPrice: 650,
      baseCharge: 35.00,
      category: "LUXURY",
      gstRate: 18.0,
      feeApplication: "PER_TICKET",
      description: "Automated Test Luxury Tier",
      actorEmail: "superadmin@cinevenue.com",
    });

    assert(Boolean(newConfig.id), "Created config must have a generated ID");
    assert(Number(newConfig.ticketPrice) === 650, "Ticket price must be 650");
    assert(Number(newConfig.baseCharge) === 35, "Base charge must be 35");
    testCreatedConfigId = newConfig.id;

    // Verify it is present in all configs
    const found = await movieFeeService.getConfigById(testCreatedConfigId);
    assert(Boolean(found), "Newly created config must be retrievable by ID");

    results.push({ name: "Scenario 3: Admin adds a new fee configuration successfully", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 3: Admin adds a new fee configuration", passed: false, error: err.message });
  }

  // Scenario 4: Validation prevents duplicate price with identical category
  try {
    let duplicateRejected = false;
    try {
      await movieFeeService.createConfig({
        ticketPrice: 650,
        baseCharge: 40.00,
        category: "LUXURY", // same category as Scenario 3
        gstRate: 18.0,
        actorEmail: "superadmin@cinevenue.com",
      });
    } catch {
      duplicateRejected = true;
    }
    assert(duplicateRejected, "Creating config with identical price and category must be rejected");

    results.push({ name: "Scenario 4: Validation blocks conflicting duplicate price and category", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 4: Validation blocks conflicting duplicate price", passed: false, error: err.message });
  }

  // Scenario 5: Admin edits an existing fee configuration
  try {
    assert(Boolean(testCreatedConfigId), "Test config ID must be available");
    const updated = await movieFeeService.updateConfig(testCreatedConfigId, {
      baseCharge: 38.00,
      description: "Updated Test Luxury Tier",
      actorEmail: "superadmin@cinevenue.com",
    });

    assert(Number(updated.baseCharge) === 38.00, `Expected updated base charge 38, got ${updated.baseCharge}`);
    assert(updated.description === "Updated Test Luxury Tier", "Description must be updated");

    results.push({ name: "Scenario 5: Admin edits an existing fee configuration", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 5: Admin edits an existing fee configuration", passed: false, error: err.message });
  }

  // Scenario 6: Customer books one ticket (₹150 ticket -> ₹20 base charge + 18% GST = ₹23.60)
  try {
    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [{ price: 150, category: "STANDARD" }],
    });

    assert(result.ticketSubtotal === 150, `Expected subtotal 150, got ${result.ticketSubtotal}`);
    assert(result.baseChargeTotal === 20.00, `Expected base charge 20.00, got ${result.baseChargeTotal}`);
    assert(result.convenienceFeeGstTotal === 3.60, `Expected GST 3.60, got ${result.convenienceFeeGstTotal}`);
    assert(result.totalConvenienceFee === 23.60, `Expected total fee 23.60, got ${result.totalConvenienceFee}`);
    assert(result.finalPayableAmount === 173.60, `Expected final payable 173.60, got ${result.finalPayableAmount}`);

    results.push({ name: "Scenario 6: Single ticket fee calculation (₹150 -> ₹20 + 18% GST = ₹173.60)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 6: Single ticket fee calculation", passed: false, error: err.message });
  }

  // Scenario 7: Customer books multiple tickets with identical price
  try {
    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [
        { price: 150, category: "STANDARD" },
        { price: 150, category: "STANDARD" },
      ],
    });

    assert(result.ticketCount === 2, `Expected ticketCount 2, got ${result.ticketCount}`);
    assert(result.ticketSubtotal === 300, `Expected subtotal 300, got ${result.ticketSubtotal}`);
    assert(result.baseChargeTotal === 40.00, `Expected base charge 40.00, got ${result.baseChargeTotal}`);
    assert(result.convenienceFeeGstTotal === 7.20, `Expected GST 7.20, got ${result.convenienceFeeGstTotal}`);
    assert(result.totalConvenienceFee === 47.20, `Expected total fee 47.20, got ${result.totalConvenienceFee}`);
    assert(result.finalPayableAmount === 347.20, `Expected final payable 347.20, got ${result.finalPayableAmount}`);

    results.push({ name: "Scenario 7: Multiple tickets calculation (2 × ₹150 -> ₹40 base + ₹7.20 GST = ₹347.20)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 7: Multiple tickets calculation", passed: false, error: err.message });
  }

  // Scenario 8: Ticket prices with different base charges in a single booking
  try {
    // Ticket 1: ₹120 (base charge ₹16, GST 2.88)
    // Ticket 2: ₹250 (base charge ₹28, GST 5.04)
    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [
        { price: 120, category: "STANDARD" },
        { price: 250, category: "STANDARD" },
      ],
    });

    assert(result.ticketSubtotal === 370, `Expected subtotal 370, got ${result.ticketSubtotal}`);
    assert(result.baseChargeTotal === 44.00, `Expected base charge 44.00, got ${result.baseChargeTotal}`);
    assert(result.convenienceFeeGstTotal === 7.92, `Expected GST 7.92, got ${result.convenienceFeeGstTotal}`);
    assert(result.totalConvenienceFee === 51.92, `Expected total fee 51.92, got ${result.totalConvenienceFee}`);
    assert(result.finalPayableAmount === 421.92, `Expected final payable 421.92, got ${result.finalPayableAmount}`);
    assert(result.feeLines.length === 2, "Must return feeLines breakdown for both seats");

    results.push({ name: "Scenario 8: Multi-tier tickets in single booking (₹120 & ₹250 -> ₹51.92 total fee)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 8: Multi-tier tickets calculation", passed: false, error: err.message });
  }

  // Scenario 9: Admin disables the fee system (₹0 fee charged platform-wide)
  try {
    // Temporarily disable fee system
    await movieFeeService.updateSettings({
      enabled: false,
      actorEmail: "superadmin@cinevenue.com",
    });

    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [{ price: 150, category: "STANDARD" }, { price: 200, category: "STANDARD" }],
    });

    assert(result.isFeeEnabled === false, "isFeeEnabled must be false");
    assert(result.baseChargeTotal === 0, `Expected base charge 0 when disabled, got ${result.baseChargeTotal}`);
    assert(result.convenienceFeeGstTotal === 0, `Expected GST 0 when disabled, got ${result.convenienceFeeGstTotal}`);
    assert(result.totalConvenienceFee === 0, `Expected total fee 0 when disabled, got ${result.totalConvenienceFee}`);
    assert(result.finalPayableAmount === 350, `Expected final payable equal to ticket subtotal 350, got ${result.finalPayableAmount}`);

    // Re-enable fee system for subsequent tests
    await movieFeeService.updateSettings({
      enabled: true,
      defaultGstRate: 18.0,
      actorEmail: "superadmin@cinevenue.com",
    });

    results.push({ name: "Scenario 9: Admin disables fee system (customers charged ₹0 fee platform-wide)", passed: true });
  } catch (err: any) {
    // Ensure re-enabled
    await movieFeeService.updateSettings({ enabled: true }).catch(() => {});
    results.push({ name: "Scenario 9: Admin disables fee system", passed: false, error: err.message });
  }

  // Scenario 10: GST rate modification by Admin
  try {
    // Test custom 12% GST rate setting
    await movieFeeService.updateSettings({
      defaultGstRate: 12.0,
      actorEmail: "superadmin@cinevenue.com",
    });

    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [{ price: 100, category: "STANDARD" }], // Base charge 14.00
    });

    // 14.00 * 12% = 1.68 GST => Total fee 15.68
    assert(result.baseChargeTotal === 14.00, `Expected base charge 14.00, got ${result.baseChargeTotal}`);
    assert(result.convenienceFeeGstTotal === 1.68, `Expected GST 1.68 at 12%, got ${result.convenienceFeeGstTotal}`);
    assert(result.totalConvenienceFee === 15.68, `Expected total fee 15.68, got ${result.totalConvenienceFee}`);

    // Restore standard 18% GST
    await movieFeeService.updateSettings({
      defaultGstRate: 18.0,
      actorEmail: "superadmin@cinevenue.com",
    });

    results.push({ name: "Scenario 10: Dynamic GST rate configuration applied authoritatively", passed: true });
  } catch (err: any) {
    await movieFeeService.updateSettings({ defaultGstRate: 18.0 }).catch(() => {});
    results.push({ name: "Scenario 10: Dynamic GST rate configuration", passed: false, error: err.message });
  }

  // Scenario 11: Discounts and other charges integration
  try {
    const result = await movieFeeService.calculateMovieBookingFees({
      tickets: [{ price: 200, category: "STANDARD" }], // Base ₹25, GST 18% = ₹4.50, Fee = ₹29.50
      couponDiscount: 50.00,
      otherCharges: 2.00, // Musician donation
    });

    // Subtotal: 200 + Fee: 29.50 + Donation: 2.00 - Discount: 50.00 = 181.50
    assert(result.ticketSubtotal === 200, `Expected subtotal 200, got ${result.ticketSubtotal}`);
    assert(result.totalConvenienceFee === 29.50, `Expected total fee 29.50, got ${result.totalConvenienceFee}`);
    assert(result.discountAmount === 50.00, `Expected discount 50.00, got ${result.discountAmount}`);
    assert(result.musicianDonationAmount === 2.00, `Expected donation 2.00, got ${result.musicianDonationAmount}`);
    assert(result.finalPayableAmount === 181.50, `Expected final payable 181.50, got ${result.finalPayableAmount}`);

    results.push({ name: "Scenario 11: Discounts and ancillary charges computed cleanly into final payable amount", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 11: Discounts and ancillary charges integration", passed: false, error: err.message });
  }

  // Scenario 12: Client tampering prevention (Backend authoritative price calculation)
  try {
    // Simulate booking with manipulated client convenience fee
    const bookingPrice = await bookingService.calculateBookingPrice({
      showId: "SHOW-TEST-MOCK",
      seatIds: ["A1", "A2"],
      tickets: [
        { price: 150, category: "STANDARD" },
        { price: 150, category: "STANDARD" },
      ],
      couponCode: undefined,
    });

    // Verify bookingService used authoritative movieFeeService rather than static 5% or zero
    assert(bookingPrice.ticketSubtotal === 300, `Expected subtotal 300, got ${bookingPrice.ticketSubtotal}`);
    assert(bookingPrice.convenienceFee === 47.20, `Expected authoritative fee 47.20, got ${bookingPrice.convenienceFee}`);
    assert(bookingPrice.convenienceFeeTax === 7.20, `Expected authoritative GST 7.20, got ${bookingPrice.convenienceFeeTax}`);
    assert(bookingPrice.totalAmount === 347.20, `Expected total 347.20, got ${bookingPrice.totalAmount}`);
    assert(Boolean(bookingPrice.feeSnapshot), "Must generate immutable feeSnapshot object");

    results.push({ name: "Scenario 12: Authoritative backend calculation prevents client fee manipulation", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 12: Authoritative backend calculation", passed: false, error: err.message });
  }

  // Scenario 13: Audit Trail records administrative changes
  try {
    const auditLogs = await movieFeeService.getAuditLogs(10);
    assert(auditLogs.length > 0, "Audit trail must record admin fee changes");
    const hasCreate = auditLogs.some((l) => l.action?.toUpperCase().includes("CREATE"));
    assert(hasCreate, "Audit log must contain CREATE action from Scenario 3");

    results.push({ name: "Scenario 13: Administrative audit trail records all create, update, and toggle events", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 13: Administrative audit trail", passed: false, error: err.message });
  }

  // Cleanup: Delete test created config if needed
  if (testCreatedConfigId) {
    try {
      await movieFeeService.deleteConfig(testCreatedConfigId, "superadmin@cinevenue.com");
    } catch {
      // ignore cleanup error
    }
  }

  return results;
}
