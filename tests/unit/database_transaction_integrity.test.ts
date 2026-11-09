import { prisma } from "../../server/config/database";

async function runDatabaseTransactionTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE DATABASE TRANSACTION INTEGRITY & ROLLBACK SUITE");
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

  // 1. Dev-mode Sequential Execution with Interception
  console.log("--- 1. Testing Intermediate Step Failure in Array Transaction ---");
  const origEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  let step1Ran = false;
  let step2Ran = false;

  const step1 = Promise.resolve().then(() => {
    step1Ran = true;
    return { ok: 1 };
  });

  const step2 = Promise.reject(new Error("Simulated intermediate constraint violation in step 2"));

  let caughtError: any = null;
  try {
    await prisma.$transaction([step1, step2]);
  } catch (err: any) {
    caughtError = err;
  }

  assert(caughtError !== null, "Transaction array throws on intermediate operation failure");
  assert(
    caughtError.message.includes("Simulated intermediate constraint violation"),
    "Caught error accurately propagates failure message"
  );

  // 2. Production Fail-Closed Guard
  console.log("\n--- 2. Testing Production Fail-Closed Guard in Proxy Mode ---");
  process.env.NODE_ENV = "production";

  let prodBlocked = false;
  let prodErrorMessage = "";
  try {
    await prisma.$transaction([Promise.resolve({ ok: true })]);
  } catch (err: any) {
    prodBlocked = true;
    prodErrorMessage = err.message;
  } finally {
    process.env.NODE_ENV = origEnv;
  }

  assert(prodBlocked === true, "Production blocks proxy-mode transactions without native PostgreSQL pool");
  assert(
    prodErrorMessage.includes("Transactional atomicity requirement"),
    "Clear infrastructure requirement reported in production error"
  );

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runDatabaseTransactionTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

