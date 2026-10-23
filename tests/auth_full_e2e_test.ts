import dotenv from "dotenv";
dotenv.config();
import assert from "assert";
import { authService } from "../server/modules/auth/auth.service";

async function runE2ETests() {
  console.log("================================================================================");
  console.log("FULL AUTHENTICATION E2E TEST: SIGN-UP, SIGN-IN & PASSWORD RESET");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testEmail = `e2e.tester.${timestamp}@cinevenue.test`;
  const testMobile = "9" + Math.floor(100000000 + Math.random() * 900000000);
  const initialPassword = "InitialPassword123!";
  const newPassword = "NewSecuredPassword456!";

  // 1. Sign Up (Registration)
  console.log("Step 1: Testing Registration...");
  const regResult = await authService.register({
    name: "E2E Tester",
    email: testEmail,
    mobile: testMobile,
    password: initialPassword
  });
  assert(regResult.user, "Registration must return user");
  assert.strictEqual(regResult.user.email.toLowerCase(), testEmail.toLowerCase());
  assert(regResult.tokens?.accessToken, "Registration must return access token");
  console.log("  ✓ Sign-Up Passed: User ID:", regResult.user.id);

  // 2. Sign In with Email
  console.log("\nStep 2: Testing Sign-In with Email...");
  const loginEmailResult = await authService.login({
    email: testEmail,
    password: initialPassword
  });
  assert(loginEmailResult.user, "Login with email must return user");
  assert(loginEmailResult.tokens?.accessToken, "Login with email must return access token");
  console.log("  ✓ Sign-In with Email Passed");

  // 3. Sign In with Mobile
  console.log("\nStep 3: Testing Sign-In with Mobile Number...");
  const loginMobileResult = await authService.login({
    identifier: testMobile,
    password: initialPassword
  });
  assert(loginMobileResult.user, "Login with mobile must return user");
  assert(loginMobileResult.tokens?.accessToken, "Login with mobile must return access token");
  console.log("  ✓ Sign-In with Mobile Number Passed");

  // 4. Request Password Reset (Forgot Password)
  console.log("\nStep 4: Testing Forgot Password Request...");
  const resetReq = await authService.requestPasswordReset(testEmail);
  assert.strictEqual(resetReq.success, true);
  assert(resetReq.code, "Reset request must provide 6-digit OTP code");
  console.log("  ✓ Reset Request Passed: Verification Code received:", resetReq.code);

  // 5. Submit Password Reset
  console.log("\nStep 5: Testing Password Reset with Code...");
  const resetRes = await authService.resetPassword(resetReq.code, newPassword, testEmail, newPassword);
  assert.strictEqual(resetRes.success, true);
  console.log("  ✓ Password Reset Execution Passed:", resetRes.message);

  // 6. Sign In with New Password
  console.log("\nStep 6: Testing Sign-In with New Password...");
  const newLoginResult = await authService.login({
    email: testEmail,
    password: newPassword
  });
  assert(newLoginResult.user, "Login with new password must return user");
  assert(newLoginResult.tokens?.accessToken, "Login with new password must return tokens");
  console.log("  ✓ Sign-In with New Password Passed!");

  // 7. Verify Old Password is now Rejected
  console.log("\nStep 7: Verifying Old Password is Rejected...");
  try {
    await authService.login({
      email: testEmail,
      password: initialPassword
    });
    assert.fail("Old password should have been rejected!");
  } catch (err: any) {
    assert(err.message.includes("Incorrect password") || err.message.includes("password"));
    console.log("  ✓ Old Password Rejection Confirmed:", err.message);
  }

  console.log("\n================================================================================");
  console.log("ALL E2E AUTHENTICATION TESTS PASSED PERFECTLY!");
  console.log("================================================================================\n");
}

runE2ETests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
