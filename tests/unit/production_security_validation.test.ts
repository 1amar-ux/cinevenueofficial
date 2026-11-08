import { checkProductionReadiness } from "../../server/config/env";
import { isValidAdminPasscode } from "../../server/middleware/auth";

async function runProductionSecurityTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE PRODUCTION ENVIRONMENT & SECURITY AUDIT TEST SUITE");
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

  // 1. Development Mode Defaults
  console.log("--- 1. Testing Development Environment Audit ---");
  const origNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const devAudit = checkProductionReadiness();
  assert(devAudit.environment === "development", "Environment recognized as development");
  assert(devAudit.isReady === true, "Development environment reports ready without production blockers");

  // 2. Passcode enforcement across environments
  console.log("\n--- 2. Testing Admin Passcode Security Boundary ---");
  process.env.NODE_ENV = "development";
  assert(isValidAdminPasscode("8888") === true, "Default passcode '8888' allowed in development");

  process.env.NODE_ENV = "production";
  delete process.env.ADMIN_PASSCODE;
  delete process.env.SUPER_ADMIN_PASSWORD;
  assert(isValidAdminPasscode("8888") === false, "Default passcode '8888' strictly rejected in production");
  assert(isValidAdminPasscode("admin8888") === false, "Default passcode 'admin8888' strictly rejected in production");

  // Custom high-entropy passcode in production
  process.env.ADMIN_PASSCODE = "CineVenueProd_2026_Secret_Passcode_!";
  assert(
    isValidAdminPasscode("CineVenueProd_2026_Secret_Passcode_!") === true,
    "Valid explicit non-default secret accepted in production"
  );

  // 3. Production Environment Validation
  console.log("\n--- 3. Testing Production Readiness Validator ---");
  process.env.NODE_ENV = "production";
  const prodAudit = checkProductionReadiness();
  assert(prodAudit.environment === "production", "Auditor recognizes production environment");
  assert(
    prodAudit.errors.some(e => e.includes("JWT_ACCESS_SECRET")),
    "Flags dev default JWT_ACCESS_SECRET as a production security error"
  );

  // Restore env
  if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
  else delete process.env.NODE_ENV;
  delete process.env.ADMIN_PASSCODE;

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runProductionSecurityTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

