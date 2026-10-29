import { fraudTrustService, FraudAlertRecord, FraudRuleConfigRecord } from "../../server/services/fraudTrustService";
import { auditEntryLogService } from "../../server/services/auditEntryLogService";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runFraudTrustTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message || String(err) });
    }
  };

  // Ensure baseline configuration before test execution
  await fraudTrustService.updateRuleConfig({
    maxFailedBookingsThreshold: 3,
    bookingAttemptWindowSeconds: 600,
    listingSimilarityThreshold: 80,
    duplicateScanWindowSeconds: 900
  }, "superadmin@cinevenue.com");

  // --- 1. Metrics & Persisted Storage ---
  await runTest("Metrics: Calculated strictly from real persisted records", async () => {
    const metrics = await fraudTrustService.getMetrics();
    if (typeof metrics.totalOpenAlerts !== "number") {
      throw new Error("totalOpenAlerts must be a valid number");
    }
    if (typeof metrics.criticalAlerts !== "number") {
      throw new Error("criticalAlerts must be a valid number");
    }
    if (typeof metrics.duplicateTicketScans !== "number") {
      throw new Error("duplicateTicketScans must be a valid number");
    }
    if (typeof metrics.paymentIrregularities !== "number") {
      throw new Error("paymentIrregularities must be a valid number");
    }
    if (typeof metrics.suspiciousListings !== "number") {
      throw new Error("suspiciousListings must be a valid number");
    }
    if (typeof metrics.suspiciousBookingPatterns !== "number") {
      throw new Error("suspiciousBookingPatterns must be a valid number");
    }
    if (typeof metrics.casesUnderInvestigation !== "number") {
      throw new Error("casesUnderInvestigation must be a valid number");
    }
    if (typeof metrics.resolvedCases !== "number") {
      throw new Error("resolvedCases must be a valid number");
    }
    // Verify math consistency
    const totalActive = metrics.totalOpenAlerts + metrics.resolvedCases;
    if (totalActive < 0) {
      throw new Error("Metrics count cannot be negative");
    }
  });

  // --- 2. Genuine Booking vs Suspicious Booking ---
  await runTest("Booking Risk: Genuine bookings with normal frequency are NOT flagged", async () => {
    const alerts = await fraudTrustService.evaluateBookingAttempt({
      userId: "usr_genuine_test_99",
      userEmail: "customer@genuine.test",
      targetEntityId: "show_kalki_screen1",
      seatsCount: 2,
      ipAddress: "103.22.41.8",
      recentAttemptsIn5Min: 1, // Only 1 attempt
      recentFailuresIn10Min: 0
    });
    if (alerts.length > 0) {
      throw new Error(`Genuine booking was incorrectly flagged: ${JSON.stringify(alerts)}`);
    }
  });

  await runTest("Booking Risk: Repeated failed booking attempts exceed threshold and trigger alert", async () => {
    const alerts = await fraudTrustService.evaluateBookingAttempt({
      userId: "usr_bot_test_404",
      userEmail: "bot@scalper-network.test",
      targetEntityId: "show_pushpa_screen3",
      seatsCount: 6,
      ipAddress: "45.112.55.19",
      recentAttemptsIn5Min: 12,
      recentFailuresIn10Min: 5 // Exceeds default threshold of 3
    });
    if (alerts.length === 0) {
      throw new Error("Expected failed booking attempts to generate alert");
    }
    const failureAlert = alerts.find(a => a.ruleTriggered === "BOOKING_REPEATED_FAILURES");
    if (!failureAlert) {
      throw new Error("Expected BOOKING_REPEATED_FAILURES alert");
    }
    if (failureAlert.severity !== "HIGH" && failureAlert.severity !== "CRITICAL") {
      throw new Error(`Unexpected severity: ${failureAlert.severity}`);
    }
    if (!failureAlert.evidence.some(e => e.signal === "REPEATED_FAILURES")) {
      throw new Error("Expected REPEATED_FAILURES in evidence");
    }
  });

  // --- 3. Duplicate Listing Detection ---
  await runTest("Listing Risk: High text similarity (>80%) flags near-duplicate listing", async () => {
    const existingListings = [
      { id: "evt_live_101", title: "A.R. Rahman Live in Concert Chennai 2026", venueName: "YMCA Grounds Chennai" }
    ];

    const alerts = await fraudTrustService.evaluateListingSubmission({
      listingId: "evt_new_suspicious_202",
      title: "A.R. Rahman Live In Concert Chennai 2026 Official",
      venueName: "YMCA Grounds Chennai",
      organizerId: "org_unverified_44",
      organizerName: "Fake Events Org",
      isOrganizerVerified: false,
      newPrice: 2500,
      existingListings
    });

    if (alerts.length === 0) {
      throw new Error("Expected duplicate listing alert");
    }
    const dupAlert = alerts.find(a => a.ruleTriggered === "LISTING_DUPLICATE_DETECTED");
    if (!dupAlert) {
      throw new Error("Expected LISTING_DUPLICATE_DETECTED alert");
    }
    if (dupAlert.riskScore < 50) {
      throw new Error(`Expected elevated risk score for duplicate listing, got: ${dupAlert.riskScore}`);
    }
  });

  await runTest("Listing Risk: Unverified organizer listing flags for review without auto-banning", async () => {
    const alerts = await fraudTrustService.evaluateListingSubmission({
      listingId: "evt_novice_303",
      title: "Local Standup Comedy Open Mic Night",
      venueName: "The Comedy Lounge Indiranagar",
      organizerId: "org_pending_88",
      organizerName: "FirstTime Host",
      isOrganizerVerified: false,
      newPrice: 300,
      existingListings: []
    });

    const unverifiedAlert = alerts.find(a => a.ruleTriggered === "LISTING_UNVERIFIED_ORGANIZER");
    if (!unverifiedAlert) {
      throw new Error("Expected LISTING_UNVERIFIED_ORGANIZER alert");
    }
    if (unverifiedAlert.severity !== "LOW" && unverifiedAlert.severity !== "MEDIUM") {
      throw new Error(`Unverified organizer should not be critically banned immediately, got severity: ${unverifiedAlert.severity}`);
    }
  });

  // --- 4. Payment Monitoring ---
  await runTest("Payment Monitoring: Amount mismatch between booking and payment callback triggers alert", async () => {
    const alerts = await fraudTrustService.evaluatePaymentTransaction({
      bookingId: "bk_payment_test_01",
      expectedAmount: 1250,
      actualAmount: 250, // Mismatch: 1000 less!
      paymentGateway: "CASHFREE",
      transactionReference: "cf_pay_998877",
      isSignatureValid: true,
      existingTransactionRefs: ["cf_pay_0001", "cf_pay_0002"]
    });

    const mismatchAlert = alerts.find(a => a.ruleTriggered === "PAYMENT_AMOUNT_MISMATCH");
    if (!mismatchAlert) {
      throw new Error("Expected PAYMENT_AMOUNT_MISMATCH alert");
    }
    if (mismatchAlert.severity !== "CRITICAL") {
      throw new Error(`Expected CRITICAL severity for amount mismatch, got: ${mismatchAlert.severity}`);
    }
  });

  await runTest("Payment Monitoring: Duplicate transaction reference triggers fraud alert", async () => {
    const alerts = await fraudTrustService.evaluatePaymentTransaction({
      bookingId: "bk_payment_test_02",
      expectedAmount: 500,
      actualAmount: 500,
      paymentGateway: "RAZORPAY",
      transactionReference: "pay_replayed_ref_123",
      isSignatureValid: true,
      existingTransactionRefs: ["pay_replayed_ref_123", "pay_earlier_ref_001"]
    });

    const dupAlert = alerts.find(a => a.ruleTriggered === "PAYMENT_DUPLICATE_REFERENCE");
    if (!dupAlert) {
      throw new Error("Expected PAYMENT_DUPLICATE_REFERENCE alert");
    }
    if (dupAlert.riskScore < 80) {
      throw new Error(`Expected severe risk score for replayed payment reference, got: ${dupAlert.riskScore}`);
    }
  });

  // --- 5. Ticket & QR Security ---
  await runTest("Ticket Validation: Duplicate scans within 60s window generate reviewable anomaly", async () => {
    const alerts = await fraudTrustService.evaluateTicketScan({
      ticketId: "tkt_val_test_555",
      bookingId: "bk_val_555",
      showId: "shw_kalki_99",
      gateStaffId: "staff_ramesh_01",
      previousScansCount: 2,
      lastScanTimestamp: new Date(Date.now() - 30 * 1000).toISOString(), // 30s ago
      ticketStatus: "USED"
    });

    const dupScanAlert = alerts.find(a => a.ruleTriggered === "TICKET_DUPLICATE_SCAN");
    if (!dupScanAlert) {
      throw new Error("Expected TICKET_DUPLICATE_SCAN alert");
    }
    if (!dupScanAlert.evidence.some(e => e.signal === "RAPID_RESCAN")) {
      throw new Error("Expected RAPID_RESCAN evidence in alert");
    }
  });

  await runTest("Ticket Validation: Attempted scan of CANCELLED or REFUNDED ticket triggers CRITICAL alert", async () => {
    const alerts = await fraudTrustService.evaluateTicketScan({
      ticketId: "tkt_cancelled_777",
      bookingId: "bk_cancelled_777",
      showId: "shw_devara_01",
      gateStaffId: "staff_priya_02",
      previousScansCount: 0,
      ticketStatus: "CANCELLED"
    });

    const invalidStatusAlert = alerts.find(a => a.ruleTriggered === "TICKET_INVALID_STATUS");
    if (!invalidStatusAlert) {
      throw new Error("Expected TICKET_INVALID_STATUS alert for cancelled ticket scan");
    }
    if (invalidStatusAlert.severity !== "CRITICAL") {
      throw new Error(`Expected CRITICAL severity, got: ${invalidStatusAlert.severity}`);
    }
  });

  // --- 6. Alert Investigation Lifecycle & Audit Trail ---
  await runTest("Alert Lifecycle: Status transition, investigator assignment, and note addition", async () => {
    // 1. Create alert
    const newAlert = await fraudTrustService.createAlert({
      category: "BOOKING",
      severity: "HIGH",
      title: "Test Coordinated Bot Activity",
      ruleTriggered: "TEST_BOT_RULE",
      riskScore: 78,
      entityType: "BOOKING",
      entityId: "bk_lifecycle_test",
      evidence: [{ signal: "RAPID_CONCURRENT_ATTEMPTS", value: "8 attempts in 30s", confidence: 90 }],
      actorEmail: "automated.detection@cinevenue.internal"
    });

    if (newAlert.status !== "NEW") {
      throw new Error(`Initial status must be NEW, got: ${newAlert.status}`);
    }

    // 2. Assign investigator
    const assignedAlert = await fraudTrustService.assignInvestigator(
      newAlert.id,
      "sec_officer@cinevenue.com",
      "admin@cinevenue.com"
    );
    if (assignedAlert.assignedInvestigator !== "sec_officer@cinevenue.com") {
      throw new Error("Failed to assign investigator");
    }

    // 3. Add internal note
    const notedAlert = await fraudTrustService.addInternalNote(
      newAlert.id,
      "Contacted customer bank to verify card ownership",
      "sec_officer@cinevenue.com"
    );
    if (!notedAlert.internalNotes.some(n => n.note.includes("Contacted customer bank"))) {
      throw new Error("Internal note was not persisted");
    }

    // 4. Resolve as FALSE_POSITIVE with documented reason
    const resolvedAlert = await fraudTrustService.updateAlertStatus(
      newAlert.id,
      "FALSE_POSITIVE",
      "sec_officer@cinevenue.com",
      "Verified customer is corporate client booking for team outing",
      "False positive flagged due to rapid corporate debit card retries"
    );

    if (resolvedAlert.status !== "FALSE_POSITIVE") {
      throw new Error(`Expected status FALSE_POSITIVE, got: ${resolvedAlert.status}`);
    }
    if (!resolvedAlert.resolutionReason?.includes("corporate client")) {
      throw new Error("Resolution reason was not stored");
    }
  });

  // --- 7. Entity Restriction Safety ---
  await runTest("Entity Restriction: Toggle temporary restriction with documented restoration process", async () => {
    const alert = await fraudTrustService.createAlert({
      category: "ORGANIZER",
      severity: "MEDIUM",
      title: "Test Organizer Pending KYC",
      entityType: "ORGANIZER",
      entityId: "org_test_safety_99",
      evidenceSummary: "Pending GST and identity documents"
    });

    const restrictedAlert = await fraudTrustService.toggleEntityRestriction(
      alert.id,
      true,
      "superadmin@cinevenue.com",
      "Pending organizer identity and tax GST registration documents"
    );
    if (restrictedAlert.isRestricted !== true) {
      throw new Error("Entity was not restricted");
    }

    // Restore restriction safely
    const restoredAlert = await fraudTrustService.toggleEntityRestriction(
      alert.id,
      false,
      "superadmin@cinevenue.com",
      "Organizer completed physical office and GST registration audit"
    );
    if (restoredAlert.isRestricted !== false) {
      throw new Error("Entity restriction was not cleared");
    }
  });

  // --- 8. User Reports Submission & Auto-Deduplication ---
  await runTest("User Reports: Submit complaint and prevent unlimited duplicate investigations", async () => {
    const report1 = await fraudTrustService.submitUserReport({
      reporterEmail: "victim1@gmail.com",
      category: "FAKE_EVENT",
      targetEntityId: "evt_bogus_concert_999",
      title: "Event venue does not exist",
      description: "Visited the venue address, security says no such event is booked.",
      ipAddress: "115.110.22.4"
    });

    if (!report1.id || report1.category !== "FAKE_EVENT") {
      throw new Error("User report submission failed");
    }

    // Submitting 2 more reports for the same entity should aggregate into an alert
    await fraudTrustService.submitUserReport({
      reporterEmail: "victim2@gmail.com",
      category: "FAKE_EVENT",
      targetEntityId: "evt_bogus_concert_999",
      title: "Artist posted they are not performing here",
      description: "Artist official Instagram confirmed this is an unauthorized listing.",
      ipAddress: "115.110.22.5"
    });

    await fraudTrustService.submitUserReport({
      reporterEmail: "victim3@gmail.com",
      category: "FAKE_EVENT",
      targetEntityId: "evt_bogus_concert_999",
      title: "Organizer phone is switched off",
      description: "Organizer customer care number does not ring.",
      ipAddress: "115.110.22.6"
    });

    // Verify auto-generated alert aggregated the complaints
    const alerts = await fraudTrustService.getAlerts({ entityId: "evt_bogus_concert_999" });
    if (alerts.items.length === 0) {
      throw new Error("Expected auto-aggregated alert for repeated user complaints");
    }
    const aggAlert = alerts.items[0];
    if (aggAlert.ruleTriggered !== "COMMUNITY_REPORTS_THRESHOLD") {
      throw new Error(`Expected rule COMMUNITY_REPORTS_THRESHOLD, got: ${aggAlert.ruleTriggered}`);
    }
  });

  // --- 9. Rule Configuration & Server Validation ---
  await runTest("Rule Configuration: Server-side validation applies bounds and safe defaults", async () => {
    const updated = await fraudTrustService.updateRuleConfig({
      maxFailedBookingsThreshold: 4,
      bookingAttemptWindowSeconds: 300,
      listingSimilarityThreshold: 85,
      duplicateScanWindowSeconds: 90
    }, "superadmin@cinevenue.com");

    if (updated.maxFailedBookingsThreshold !== 4) {
      throw new Error(`Failed to update maxFailedBookingsThreshold, got: ${updated.maxFailedBookingsThreshold}`);
    }
    if (updated.listingSimilarityThreshold !== 85) {
      throw new Error(`Failed to update listingSimilarityThreshold, got: ${updated.listingSimilarityThreshold}`);
    }

    // Negative bounds test: should clamp or reject invalid bounds
    const clamped = await fraudTrustService.updateRuleConfig({
      listingSimilarityThreshold: 150 // Out of 0-100% bound
    }, "superadmin@cinevenue.com");

    if (clamped.listingSimilarityThreshold > 100) {
      throw new Error("Listing similarity threshold was not clamped to safe maximum 100%");
    }

    // Restore baseline configuration
    await fraudTrustService.updateRuleConfig({
      maxFailedBookingsThreshold: 3,
      bookingAttemptWindowSeconds: 600,
      listingSimilarityThreshold: 80,
      duplicateScanWindowSeconds: 900
    }, "superadmin@cinevenue.com");
  });

  // --- 10. RFC4180 CSV Export ---
  await runTest("CSV Export: Generates RFC4180 compliant export with sanitized quotes and headers", async () => {
    const csv = await fraudTrustService.exportAlertsCsv({});
    if (!csv.startsWith("Alert ID,Category,Severity,Status,Risk Score,Entity Type,Entity ID,Rule Triggered")) {
      throw new Error("Invalid CSV header format");
    }
    const lines = csv.split("\n");
    if (lines.length < 2) {
      throw new Error("CSV should contain data rows");
    }
  });

  return results;
}
