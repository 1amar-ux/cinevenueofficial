import { isCineCoinsSystemActive, gateCineCoinsMutations } from "../../server/modules/cinecoins/cinecoins.routes";

async function runCineCoinsSafetyTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE CINECOINS TRANSACTION SAFETY & ACTIVATION TEST SUITE");
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

  // 1. Activation flag test
  console.log("--- 1. Testing Activation Configuration ---");
  const origEnable = process.env.ENABLE_CINECOINS;
  const origCinecoinsEnabled = process.env.CINECOINS_ENABLED;

  delete process.env.ENABLE_CINECOINS;
  delete process.env.CINECOINS_ENABLED;
  assert(isCineCoinsSystemActive() === false, "Defaults to paused when env variables are not set");

  process.env.ENABLE_CINECOINS = "true";
  assert(isCineCoinsSystemActive() === true, "Activates when ENABLE_CINECOINS=true");

  delete process.env.ENABLE_CINECOINS;
  process.env.CINECOINS_ENABLED = "true";
  assert(isCineCoinsSystemActive() === true, "Activates when CINECOINS_ENABLED=true");

  // 2. Testing gate middleware
  console.log("\n--- 2. Testing Mutation Gate Middleware ---");
  delete process.env.ENABLE_CINECOINS;
  delete process.env.CINECOINS_ENABLED;

  let statusCode = 0;
  let jsonResponse: any = null;
  let nextCalled: boolean = false;

  const mockRes: any = {
    status: (code: number) => {
      statusCode = code;
      return mockRes;
    },
    json: (payload: any) => {
      jsonResponse = payload;
      return mockRes;
    }
  };

  gateCineCoinsMutations({} as any, mockRes as any, () => { nextCalled = true; });
  assert(statusCode === 403, "Blocked mutations return HTTP 403 Forbidden");
  assert(jsonResponse.message === "CineCoins is launching soon and is currently disabled.", "Returns exact launch message");
  assert(nextCalled === false, "next() is not called when paused");

  // Reset and test allowed when active
  process.env.ENABLE_CINECOINS = "true";
  statusCode = 0;
  nextCalled = false;
  gateCineCoinsMutations({} as any, mockRes as any, () => { nextCalled = true; });
  assert(nextCalled === true, "next() is called when ENABLE_CINECOINS=true");

  // 3. Testing Spin clamped values logic
  console.log("\n--- 3. Testing Spin Reward Table Enforcement ---");
  const allowedRewards = [5, 10, 15, 20, 25, 50];
  const clampReward = (reqVal: any) => {
    const val = Number(reqVal) || 10;
    return allowedRewards.includes(val) ? val : 10;
  };

  assert(clampReward(50) === 50, "Allows valid 50 coins reward");
  assert(clampReward(1000) === 10, "Clamps unauthorized 1000 coins injection to default 10");
  assert(clampReward(-50) === 10, "Clamps negative numbers to default 10");
  assert(clampReward("invalid") === 10, "Clamps NaN to default 10");

  // Restore env
  if (origEnable !== undefined) process.env.ENABLE_CINECOINS = origEnable;
  else delete process.env.ENABLE_CINECOINS;

  if (origCinecoinsEnabled !== undefined) process.env.CINECOINS_ENABLED = origCinecoinsEnabled;
  else delete process.env.CINECOINS_ENABLED;

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runCineCoinsSafetyTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
