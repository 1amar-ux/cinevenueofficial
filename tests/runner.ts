import { runAuthTests } from "./unit/auth.test";
import { runMaintenanceTests } from "./unit/maintenance.test";
import { runSubwebsiteGateTests } from "./unit/subwebsiteGate.test";
import { runCashfreeTests } from "./unit/cashfree.test";

import { runEventConvenienceFeeTests } from "./unit/eventConvenienceFee.test";
import { runMovieConvenienceFeeTests } from "./unit/movieConvenienceFee.test";

async function main() {
  console.log("==========================================");
  console.log("🎬 CineVenue Automated Test Runner");
  console.log("==========================================\n");

  let totalPassed = 0;
  let totalFailed = 0;

  console.log("--- 1. Authentication & Security Tests ---");
  const authResults = await runAuthTests();
  for (const r of authResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n--- 2. Centralized Maintenance Mode & API Gate Tests ---");
  const maintenanceResults = await runMaintenanceTests();
  for (const r of maintenanceResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n--- 3. Centralized Global Sub-Website Control System Tests ---");
  const subwebsiteResults = await runSubwebsiteGateTests();
  for (const r of subwebsiteResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n--- 4. Cashfree Payment Gateway & Security Tests ---");
  const cashfreeResults = await runCashfreeTests();
  for (const r of cashfreeResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n--- 5. Event Booking Convenience Fee Management Tests ---");
  const feeResults = await runEventConvenienceFeeTests();
  for (const r of feeResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n--- 6. Movie Booking Convenience Fee Management & Final Payment Tests ---");
  const movieFeeResults = await runMovieConvenienceFeeTests();
  for (const r of movieFeeResults) {
    if (r.passed) {
      console.log(`  ✅ PASS: ${r.name}`);
      totalPassed++;
    } else {
      console.error(`  ❌ FAIL: ${r.name} - ${r.error}`);
      totalFailed++;
    }
  }

  console.log("\n==========================================");
  console.log(`Test Summary: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("==========================================");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test runner crash:", err);
  process.exit(1);
});
