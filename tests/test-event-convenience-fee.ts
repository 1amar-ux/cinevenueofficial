import { runEventConvenienceFeeTests } from "./unit/eventConvenienceFee.test";

async function run() {
  console.log("==================================================================");
  console.log("🎟️ CINEVENUE: EVENT BOOKING CONVENIENCE FEE MANAGEMENT TEST SUITE");
  console.log("==================================================================\n");

  const results = await runEventConvenienceFeeTests();
  let passed = 0;
  let failed = 0;

  results.forEach((r, idx) => {
    if (r.passed) {
      console.log(`[PASS] (${idx + 1}/12) ${r.name}`);
      passed++;
    } else {
      console.error(`[FAIL] (${idx + 1}/12) ${r.name} -> Error: ${r.error}`);
      failed++;
    }
  });

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} Passed, ${failed} Failed out of ${results.length} Scenarios`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
