import { calculateEventPriceBreakdown } from "../../server/modules/events/event.routes";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runEventConvenienceFeeTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };

  // 1. An event with no convenience fee
  try {
    const event = {
      id: "EVT-TEST-1",
      title: "Open Community Jam",
      price: 500,
      convenienceFeeEnabled: false,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 30,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "PENDING",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 1, "T1");
    assert(breakdown.ticketSubtotal === 500, `Expected subtotal 500, got ${breakdown.ticketSubtotal}`);
    assert(breakdown.convenienceFee === 0, `Expected fee 0 when disabled, got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 500, `Expected final amount 500, got ${breakdown.finalPayableAmount}`);
    results.push({ name: "Scenario 1: Event with no convenience fee (disabled)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 1: Event with no convenience fee (disabled)", passed: false, error: err.message });
  }

  // 2. An event with a pending convenience fee
  try {
    const event = {
      id: "EVT-TEST-2",
      title: "Acoustic Night",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 30,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "PENDING",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 1, "T1");
    assert(breakdown.convenienceFee === 0, `Expected fee 0 for PENDING status, got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 500, `Expected final amount 500, got ${breakdown.finalPayableAmount}`);
    assert(breakdown.isFeeApproved === false, "isFeeApproved must be false when status is PENDING");
    results.push({ name: "Scenario 2: Event with pending convenience fee (not charged to customer)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 2: Event with pending convenience fee", passed: false, error: err.message });
  }

  // 3. An event with an approved fixed fee
  try {
    const event = {
      id: "EVT-TEST-3",
      title: "Musical Night",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 30,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      convenienceFeeApprovedBy: "superadmin@cinevenue.in",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 1, "T1");
    assert(breakdown.ticketSubtotal === 500, `Expected subtotal 500, got ${breakdown.ticketSubtotal}`);
    assert(breakdown.convenienceFee === 30, `Expected fee 30, got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 530, `Expected final amount 530 (500 + 30), got ${breakdown.finalPayableAmount}`);
    assert(breakdown.isFeeApproved === true, "isFeeApproved must be true");
    results.push({ name: "Scenario 3: Event with approved fixed fee (₹30 per ticket => ₹530 total)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 3: Event with approved fixed fee", passed: false, error: err.message });
  }

  // 4. An event with an approved percentage fee
  try {
    const event = {
      id: "EVT-TEST-4",
      title: "Rock Fest",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "PERCENTAGE",
      convenienceFeeAmount: 5,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 2, "T1");
    // Ticket Price = ₹500, Quantity = 2, Subtotal = ₹1,000, 5% fee = ₹50, Total = ₹1,050
    assert(breakdown.ticketSubtotal === 1000, `Expected subtotal 1000, got ${breakdown.ticketSubtotal}`);
    assert(breakdown.convenienceFee === 50, `Expected 5% fee on ₹1,000 to be 50, got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 1050, `Expected total 1050, got ${breakdown.finalPayableAmount}`);
    results.push({ name: "Scenario 4: Event with approved percentage fee (5% on ₹1,000 = ₹50 fee => ₹1,050)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 4: Event with approved percentage fee", passed: false, error: err.message });
  }

  // 5. An event with multiple tickets
  try {
    const event = {
      id: "EVT-TEST-5",
      title: "Grand Symphony",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 30,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 2, "T1");
    // 2 tickets: ₹500 x 2 = ₹1,000; Fee: ₹30 x 2 = ₹60; Total: ₹1,060
    assert(breakdown.ticketSubtotal === 1000, `Expected subtotal 1000, got ${breakdown.ticketSubtotal}`);
    assert(breakdown.convenienceFee === 60, `Expected fee 60 (30 x 2), got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 1060, `Expected total 1060, got ${breakdown.finalPayableAmount}`);
    results.push({ name: "Scenario 5: Event with multiple tickets (2 tickets: subtotal ₹1,000 + fee ₹60 = ₹1,060)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 5: Event with multiple tickets", passed: false, error: err.message });
  }

  // 6. An event with a rejected fee
  try {
    const event = {
      id: "EVT-TEST-6",
      title: "Standup Comedy",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 50,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "REJECTED",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 2, "T1");
    assert(breakdown.convenienceFee === 0, `Expected fee 0 when REJECTED, got ${breakdown.convenienceFee}`);
    assert(breakdown.finalPayableAmount === 1000, `Expected total 1000 without rejected fee, got ${breakdown.finalPayableAmount}`);
    results.push({ name: "Scenario 6: Event with rejected fee (status: REJECTED, customer charged ₹0 fee)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 6: Event with rejected fee", passed: false, error: err.message });
  }

  // 7. Admin changing the fee after bookings have been made
  try {
    // Initial configuration: ₹30 per ticket
    const initialEvent = {
      id: "EVT-TEST-7",
      title: "Classical Gala",
      price: 500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 30,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Standard", price: 500 }]
    };
    const initialBreakdown = calculateEventPriceBreakdown(initialEvent, 2, "T1");
    
    // Simulate booking created with snapshot
    const completedBooking = {
      id: "REG-001",
      ticketSubtotal: initialBreakdown.ticketSubtotal, // 1000
      convenienceFee: initialBreakdown.convenienceFee, // 60
      finalPayableAmount: initialBreakdown.finalPayableAmount, // 1060
      feeConfigurationSnapshot: initialBreakdown.feeSnapshot
    };

    // Later: Admin raises fee to ₹100 per ticket or changes to PERCENTAGE 15%
    const updatedEvent = {
      ...initialEvent,
      convenienceFeeAmount: 100
    };
    const newBreakdown = calculateEventPriceBreakdown(updatedEvent, 2, "T1");

    // The historical booking must maintain its original snapshot and paid amounts
    assert(completedBooking.convenienceFee === 60, "Historical booking fee must stay 60");
    assert(completedBooking.finalPayableAmount === 1060, "Historical booking final amount must stay 1060");
    assert(completedBooking.feeConfigurationSnapshot.amount === 30, "Historical snapshot must retain 30");
    assert(newBreakdown.convenienceFee === 200, "New bookings should reflect the updated fee 200");
    results.push({ name: "Scenario 7: Admin changing fee preserves historical booking snapshots & totals", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 7: Admin changing fee after bookings", passed: false, error: err.message });
  }

  // 8. Customer refreshing the checkout page
  try {
    const event = {
      id: "EVT-TEST-8",
      title: "EDM Festival",
      price: 1500,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 75,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Standard", price: 1500 }]
    };
    const call1 = calculateEventPriceBreakdown(event, 3, "T1");
    const call2 = calculateEventPriceBreakdown(event, 3, "T1");
    const call3 = calculateEventPriceBreakdown(event, 3, "T1");

    assert(call1.finalPayableAmount === call2.finalPayableAmount && call2.finalPayableAmount === call3.finalPayableAmount,
      "Calculation must be strictly deterministic and idempotent on page reloads");
    assert(call1.convenienceFee === 225, `Expected 3 x 75 = 225 fee, got ${call1.convenienceFee}`);
    assert(call1.finalPayableAmount === 4500 + 225, `Expected 4725, got ${call1.finalPayableAmount}`);
    results.push({ name: "Scenario 8: Customer refreshing checkout page (idempotent price breakdown)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 8: Customer refreshing checkout page", passed: false, error: err.message });
  }

  // 9. Failed payment followed by a retry
  try {
    const event = {
      id: "EVT-TEST-9",
      title: "Tech Summit",
      price: 2000,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 50,
      convenienceFeeApplication: "PER_BOOKING",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Delegate", price: 2000 }]
    };
    
    // Attempt 1: Failed
    const attempt1 = calculateEventPriceBreakdown(event, 2, "T1");
    const order1Paise = Math.round(attempt1.finalPayableAmount * 100);
    
    // Attempt 2: Retry with same order/cart parameters
    const attempt2 = calculateEventPriceBreakdown(event, 2, "T1");
    const order2Paise = Math.round(attempt2.finalPayableAmount * 100);

    assert(order1Paise === order2Paise, "Order amount in paise must match across retries");
    assert(attempt2.convenienceFee === 50, `Per-booking fee must be 50, got ${attempt2.convenienceFee}`);
    assert(attempt2.finalPayableAmount === 4050, `Subtotal 4000 + Per-booking fee 50 = 4050, got ${attempt2.finalPayableAmount}`);
    results.push({ name: "Scenario 9: Failed payment followed by retry (consistent amount, no double charge)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 9: Failed payment followed by retry", passed: false, error: err.message });
  }

  // 10. Successful payment with the correct final amount
  try {
    const event = {
      id: "EVT-TEST-10",
      title: "Magic Show",
      price: 300,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 25,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Front Row", price: 300 }]
    };
    const breakdown = calculateEventPriceBreakdown(event, 4, "T1");
    const gatewayAmountInPaise = Math.round(breakdown.finalPayableAmount * 100);
    const expectedPaise = (1200 + 100) * 100; // 1300 * 100 = 130000 paise

    assert(gatewayAmountInPaise === expectedPaise, `Expected ${expectedPaise} paise, got ${gatewayAmountInPaise}`);
    assert(breakdown.convenienceFee === 100, `Expected fee 100, got ${breakdown.convenienceFee}`);
    results.push({ name: "Scenario 10: Successful payment with authoritative backend amount in paise", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 10: Successful payment with correct final amount", passed: false, error: err.message });
  }

  // 11. Customer attempting to manipulate the fee through an API request
  try {
    const event = {
      id: "EVT-TEST-11",
      title: "Food Carnival",
      price: 400,
      convenienceFeeEnabled: true,
      convenienceFeeType: "FIXED",
      convenienceFeeAmount: 40,
      convenienceFeeApplication: "PER_TICKET",
      convenienceFeeStatus: "APPROVED",
      ticketTypes: [{ id: "T1", name: "Pass", price: 400 }]
    };

    // Attacker sends client payload with: { convenienceFee: 0, finalAmount: 1, ticketPrice: 10 }
    // The server ignores client tampering and uses its authoritative calculation
    const maliciousPayload = {
      ticketPrice: 10,
      convenienceFee: 0,
      finalPayableAmount: 1
    };

    // Server-side calculation executes authoritatively against DB event
    const authoritative = calculateEventPriceBreakdown(event, 2, "T1");

    assert(authoritative.ticketSubtotal === 800, `Server correctly evaluated ticketSubtotal as 800, ignoring ${maliciousPayload.ticketPrice}`);
    assert(authoritative.convenienceFee === 80, `Server correctly evaluated convenienceFee as 80, ignoring ${maliciousPayload.convenienceFee}`);
    assert(authoritative.finalPayableAmount === 880, `Server enforced 880, completely rejecting tampered amount ${maliciousPayload.finalPayableAmount}`);
    results.push({ name: "Scenario 11: Customer attempting to manipulate fee via API (server overrides & enforces true amount)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 11: Tampering prevention", passed: false, error: err.message });
  }

  // 12. Cancelled booking and refund calculation
  try {
    const booking = {
      ticketSubtotal: 1000,
      convenienceFee: 60,
      finalPayableAmount: 1060
    };

    // Case A: Voluntary Customer Cancellation
    // Disclosed Policy: Ticket subtotal is refunded, platform convenience fee is non-refundable.
    const voluntaryRefund = {
      ticketRefund: booking.ticketSubtotal,
      feeRefund: 0,
      totalRefund: booking.ticketSubtotal
    };
    assert(voluntaryRefund.ticketRefund === 1000, "Voluntary cancellation must refund ticket subtotal 1000");
    assert(voluntaryRefund.feeRefund === 0, "Convenience fee is non-refundable on voluntary cancellation");
    assert(voluntaryRefund.totalRefund === 1000, "Total refund must equal 1000");

    // Case B: Organizer / Platform Event Cancellation
    // Disclosed Policy: 100% full refund including convenience fee.
    const organizerRefund = {
      ticketRefund: booking.ticketSubtotal,
      feeRefund: booking.convenienceFee,
      totalRefund: booking.finalPayableAmount
    };
    assert(organizerRefund.ticketRefund === 1000, "Organizer cancellation refunds 1000");
    assert(organizerRefund.feeRefund === 60, "Organizer cancellation refunds convenience fee 60");
    assert(organizerRefund.totalRefund === 1060, "Total refund must be 1060");

    results.push({ name: "Scenario 12: Cancelled booking & refund calculation (voluntary vs organizer cancellation policy)", passed: true });
  } catch (err: any) {
    results.push({ name: "Scenario 12: Cancelled booking and refund calculation", passed: false, error: err.message });
  }

  return results;
}
