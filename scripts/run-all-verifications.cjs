const { execSync } = require("child_process");

console.log("==========================================================================");
console.log("CINEVENUE MASTER VERIFICATION & FULL REGRESSION TEST RUNNER");
console.log("==========================================================================\n");

const suites = [
  { name: "Phase 1: Gemini AI VIP Concierge", cmd: "npx tsx tests/unit/concierge.test.ts" },
  { name: "Phase 2: CineCoins Safety & Activation", cmd: "npx tsx tests/unit/cinecoins_safety.test.ts" },
  { name: "Phase 3: Redis Distributed Seat Locking", cmd: "npx tsx tests/unit/redis_distributed_locking.test.ts" },
  { name: "Phase 3B: Concurrency 10-Racer Anti-Collision", cmd: "node tests/test-seat-lock-concurrency.cjs" },
  { name: "Phase 4: Push Notification (FCM/APNs) Dispatch", cmd: "npx tsx tests/unit/push_notification_dispatch.test.ts" },
  { name: "Phase 5: Production Security & Env Audit", cmd: "npx tsx tests/unit/production_security_validation.test.ts" },
  { name: "Phase 6: Universal POS Adapter Architecture", cmd: "npx tsx tests/verify-pos-architecture.ts" },
  { name: "Phase 7: Flutter Mobile Dart & Runner Integrity", cmd: "npx tsx tests/unit/mobile_dart_integrity.test.ts" }
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of suites) {
  process.stdout.write(`Executing ${suite.name}... `);
  try {
    const start = Date.now();
    execSync(suite.cmd, { stdio: "pipe" });
    const elapsed = Date.now() - start;
    console.log(`✅ PASSED (${elapsed}ms)`);
    results.push({ name: suite.name, status: "PASSED", elapsed: `${elapsed}ms` });
    totalPassed++;
  } catch (err) {
    console.log(`❌ FAILED`);
    results.push({ name: suite.name, status: "FAILED", error: err.message });
    totalFailed++;
  }
}

console.log("\n==========================================================================");
console.log("VERIFICATION RESULTS SUMMARY TABLE");
console.log("==========================================================================");
console.table(results);

console.log(`\nTOTAL SUITES PASSED: ${totalPassed} / ${suites.length}`);
if (totalFailed > 0) {
  console.error(`TOTAL SUITES FAILED: ${totalFailed}`);
  process.exit(1);
} else {
  console.log("🎉 ALL PRODUCTION COMPLETION VERIFICATION SUITES PASSED!");
  process.exit(0);
}

