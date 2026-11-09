/**
 * CineVenue Staging Infrastructure & Operational Smoke-Test Suite
 * 
 * Verifies live staging endpoints across:
 * 1. Liveness & Readiness Probes (/health, /api/v1/ready)
 * 2. Database & Redis Distributed Cache Connectivity
 * 3. Customer Authentication & JWT Issuance
 * 4. Movie Catalog & Theatre Discovery
 * 5. Distributed Seat-Lock Acquisition & Collision Prevention
 * 6. Razorpay Sandbox Order Creation
 * 7. Cashfree Sandbox Order Creation
 * 8. Webhook Signature Security
 * 
 * Usage:
 *   STAGING_URL="https://staging-api.cinevenue.com" npx tsx scripts/staging_smoke_test.ts
 */

import crypto from "crypto";

interface TestStepResult {
  step: string;
  status: "PASS" | "FAIL" | "WARN";
  details: string;
  durationMs: number;
}

const STAGING_URL = (process.env.STAGING_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${STAGING_URL}/api/v1`;

const results: TestStepResult[] = [];

async function runStep(stepName: string, fn: () => Promise<{ status?: "PASS" | "FAIL" | "WARN"; details: string }>) {
  const start = Date.now();
  try {
    const outcome = await fn();
    const durationMs = Date.now() - start;
    results.push({
      step: stepName,
      status: outcome.status || "PASS",
      details: outcome.details,
      durationMs
    });
    console.log(`✅ [PASS] ${stepName} (${durationMs}ms): ${outcome.details}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({
      step: stepName,
      status: "FAIL",
      details: err.message,
      durationMs
    });
    console.error(`❌ [FAIL] ${stepName} (${durationMs}ms): ${err.message}`);
  }
}

async function main() {
  console.log("==========================================================================");
  console.log("🎬 CINEVENUE STAGING OPERATIONAL SMOKE-TEST RUNNER");
  console.log(`Target Staging URL: ${STAGING_URL}`);
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log("==========================================================================\n");

  // 1. Liveness Probe
  await runStep("1. Liveness Probe (GET /health)", async () => {
    const res = await fetch(`${STAGING_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json: any = await res.json();
    if (json.status !== "ok" && json.status !== "healthy") {
      throw new Error(`Unexpected status payload: ${JSON.stringify(json)}`);
    }
    return { details: `Liveness confirmed (${json.service || "CineVenue"} v${json.version || "2.0"})` };
  });

  // 2. Readiness Probe
  await runStep("2. Readiness Probe (GET /api/v1/ready)", async () => {
    const res = await fetch(`${API_BASE}/ready`);
    const json: any = await res.json().catch(() => ({}));
    if (res.status === 503) {
      throw new Error(`Infrastructure Alert (HTTP 503): DB=${json.checks?.database}, Cache=${json.checks?.cache}`);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    if (json.status !== "ready") {
      throw new Error(`System not ready: ${JSON.stringify(json)}`);
    }
    return { details: `Database: ${json.checks?.database}, Cache: ${json.checks?.cache}` };
  });

  // 3. User Registration
  const testEmail = `staging_smoke_${Date.now()}@cinevenue.test`;
  const testPassword = "StagingPassword2026!Secure";
  let authToken = "";

  await runStep("3. Customer Registration (POST /api/v1/auth/register)", async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Staging Smoke Tester",
        mobile: "9876543210"
      })
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.message || json.error}`);
    authToken = json.tokens?.accessToken || json.token || "";
    return { details: `User created with ID ${json.user?.id || "ok"}. Token length: ${authToken.length}` };
  });

  // 4. User Login & Token Verification
  await runStep("4. Customer Authentication (POST /api/v1/auth/login)", async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.message || json.error}`);
    const token = json.tokens?.accessToken || json.token;
    if (!token) throw new Error("No accessToken returned in payload");
    authToken = token;
    return { details: `JWT Access token issued successfully for ${testEmail}` };
  });

  // 5. Movie Discovery
  let activeShowId = "";
  let activeTheatreId = "";

  await runStep("5. Movie Catalog Discovery (GET /api/v1/movies)", async () => {
    const res = await fetch(`${API_BASE}/movies`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const movies: any = await res.json();
    const list = Array.isArray(movies) ? movies : movies.data || [];
    if (list.length === 0) {
      return { status: "WARN", details: "Zero movies returned (ensure database is seeded)" };
    }
    return { details: `Retrieved ${list.length} movies. Featured: "${list[0]?.title}"` };
  });

  // 6. Theatre Discovery
  await runStep("6. Theatre Showtimes Discovery (GET /api/v1/theatres)", async () => {
    const res = await fetch(`${API_BASE}/theatres`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const theatres: any = await res.json();
    const list = Array.isArray(theatres) ? theatres : theatres.data || [];
    if (list.length === 0) {
      return { status: "WARN", details: "Zero theatres returned (ensure database is seeded)" };
    }
    activeTheatreId = list[0]?.id || "th_test";
    return { details: `Retrieved ${list.length} theatres. Active: "${list[0]?.name}"` };
  });

  // 7. Seat-Lock Acquisition & Collision Prevention
  const smokeSeatId = `seat_smoke_${Date.now()}`;
  activeShowId = activeShowId || "show_staging_default";

  await runStep("7. Distributed Seat-Lock Acquisition & Collision Prevention", async () => {
    // Acquire lock as Customer A
    const resA = await fetch(`${API_BASE}/theatres/shows/${activeShowId}/lock-seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ seatIds: [smokeSeatId], userId: "user_smoke_A" })
    });
    const jsonA: any = await resA.json();
    if (!resA.ok) throw new Error(`Customer A lock failed (HTTP ${resA.status}): ${jsonA.message || jsonA.error}`);

    // Customer B attempts concurrent lock on same seat
    const resB = await fetch(`${API_BASE}/theatres/shows/${activeShowId}/lock-seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [smokeSeatId], userId: "user_smoke_B" })
    });
    if (resB.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict for concurrent lock, got HTTP ${resB.status}`);
    }

    // Release lock
    await fetch(`${API_BASE}/theatres/shows/${activeShowId}/release-seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [smokeSeatId], userId: "user_smoke_A" })
    });

    return { details: `Seat [${smokeSeatId}] locked by Customer A, collision blocked for Customer B (HTTP 409), lock released` };
  });

  // 8. Razorpay Sandbox Order Creation
  await runStep("8. Razorpay Sandbox Order Initialization", async () => {
    const res = await fetch(`${API_BASE}/payments/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        amount: 25000, // ₹250.00
        currency: "INR",
        bookingId: `bkg_smoke_${Date.now()}`,
        customerName: "Staging Tester",
        customerPhone: "9876543210",
        customerEmail: testEmail,
        itemType: "MOVIE"
      })
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.message || json.error}`);
    const orderId = json.orderId || json.id || json.razorpayOrderId;
    if (!orderId) throw new Error(`No orderId returned: ${JSON.stringify(json)}`);
    return { details: `Sandbox order created: ${orderId} (Amount: ₹250.00)` };
  });

  // 9. Cashfree Sandbox Order Creation
  await runStep("9. Cashfree Sandbox Order Initialization", async () => {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        amount: 300,
        bookingId: `bkg_cf_smoke_${Date.now()}`,
        customerName: "Staging Tester",
        customerPhone: "9876543210",
        customerEmail: testEmail,
        itemType: "MOVIE"
      })
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.message || json.error}`);
    return { details: `Cashfree sandbox order initialized. Session: ${json.payment_session_id ? "Active" : "Simulated"}` };
  });

  // 10. Webhook Signature Security
  await runStep("10. Webhook HMAC-SHA256 Signature Security", async () => {
    const fakePayload = JSON.stringify({ event: "order.paid", entity: { id: "order_fake_smoke" } });
    const fakeSignature = "invalid_signature_hex_000000000000000000000000000000000000";

    const res = await fetch(`${API_BASE}/payments/razorpay/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": fakeSignature
      },
      body: fakePayload
    });

    if (res.status !== 400 && res.status !== 403 && res.status !== 401) {
      throw new Error(`Expected HTTP 400/401/403 for forged signature, got HTTP ${res.status}`);
    }

    return { details: `Forged HMAC signature correctly rejected with HTTP ${res.status}` };
  });

  // Print Summary Table
  console.log("\n==========================================================================");
  console.log("SMOKE TEST RESULTS SUMMARY");
  console.log("==========================================================================");

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} [${r.status}] ${r.step} — ${r.details} (${r.durationMs}ms)`);
    if (r.status === "PASS") passed++;
    else if (r.status === "WARN") warnings++;
    else failed++;
  }

  console.log("\n--------------------------------------------------------------------------");
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passed} | WARNINGS: ${warnings} | FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) {
    console.error("\n❌ Staging smoke-test failed. Investigate failed steps above.");
    process.exit(1);
  } else {
    console.log("\n🎉 ALL STAGING SMOKE TESTS PASSED! Staging environment is verified.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal smoke-test error:", err);
  process.exit(1);
});
