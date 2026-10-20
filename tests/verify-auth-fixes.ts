import dotenv from "dotenv";
dotenv.config();
import assert from "assert";
import { authService } from "../server/modules/auth/auth.service";
import { sendPasswordResetOtpEmail } from "../server/services/emailService";
import { env } from "../server/config/env";

async function runTests() {
  console.log("================================================================================");
  console.log("CINEVENUE AUTHENTICATION BUGFIX TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function test(desc: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res && typeof (res as any).then === "function") {
        return (res as Promise<void>).then(() => {
          passed++;
          console.log(`  ✓ PASS: ${desc}`);
        }).catch((err) => {
          console.error(`  ✗ FAIL: ${desc} -> ${err.message}`);
        });
      } else {
        passed++;
        console.log(`  ✓ PASS: ${desc}`);
      }
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${desc} -> ${err.message}`);
    }
  }

  console.log("--- 1. Password Reset Flow ('Forgot Password') ---");

  await test("Request password reset generates code and neutral confirmation", async () => {
    const res = await authService.requestPasswordReset("test.auth.user@cinevenue.com");
    assert.strictEqual(res.success, true);
    assert(res.message.includes("6-digit verification code"));
  });

  await test("sendPasswordResetOtpEmail handles invalid email gracefully", async () => {
    const res = await sendPasswordResetOtpEmail({ to: "not-an-email", otpCode: "123456" });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.liveSent, false);
  });

  await test("sendPasswordResetOtpEmail handles valid email format with fallback logging", async () => {
    const res = await sendPasswordResetOtpEmail({
      to: "customer.verify@cinevenue.com",
      otpCode: "987654",
      userName: "Verified Customer"
    });
    assert.strictEqual(res.success, true);
    assert(typeof res.message === "string");
  });

  console.log("\n--- 2. Google OAuth Sign-In & Manual User Linking ---");

  await test("Google login links smoothly when user already registered manually", async () => {
    const testEmail = `manual.registrant.${Date.now()}@cinevenue.com`;
    
    // Simulate initial manual registration / login call
    const result1 = await authService.googleLogin({
      accessToken: "test_token_123",
      supabaseUserId: `sb_test_usr_${Date.now()}`,
      email: testEmail,
      name: "Manual User",
      profileImageUrl: "https://example.com/avatar.jpg"
    });

    assert(result1.user);
    assert.strictEqual(result1.user.email.toLowerCase(), testEmail.toLowerCase());
    assert(result1.tokens.accessToken);
    assert(result1.tokens.refreshToken);

    // Simulate subsequent Google OAuth sign-in with same email (race condition / duplicate link)
    const result2 = await authService.googleLogin({
      accessToken: "test_token_456",
      email: testEmail,
      name: "Manual User Linked",
      supabaseUserId: `sb_usr_${Date.now()}`
    });

    assert(result2.user);
    assert.strictEqual(result2.user.email.toLowerCase(), testEmail.toLowerCase());
    assert(result2.tokens.accessToken);
  });

  await test("Google login rejects unverified payload without token, code, or email", async () => {
    try {
      await authService.googleLogin({});
      assert.fail("Should have thrown ValidationError or UnauthorizedError");
    } catch (err: any) {
      assert(err.message.includes("cryptographic") || err.message.includes("required"));
    }
  });

  console.log("\n--- 3. Google OAuth Redirect Configuration ---");

  await test("Redirect URI matches standard /auth/callback format", async () => {
    const redirectUrl = await authService.getGoogleAuthRedirectUrl();
    assert(redirectUrl.includes("auth/callback") || redirectUrl.includes("accounts.google.com") || redirectUrl.includes("supabase.co"));
  });

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} / ${total} PASSED`);
  console.log("================================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
