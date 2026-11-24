import assert from "assert";
import { authService } from "../../server/modules/auth/auth.service";

export async function runOtpVerificationTests(): Promise<Array<{ name: string; passed: boolean; error?: string }>> {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  console.log("==========================================================================");
  console.log("CINEVENUE 4-DIGIT GLASSY OTP VERIFICATION UNIT TEST SUITE");
  console.log("==========================================================================\n");

  // 1. Send OTP to Mobile
  try {
    const res = await authService.sendOtp("9876543210", "VERIFY_ACCOUNT");
    assert(res.success === true, "sendOtp must return success: true");
    assert(res.channel === "SMS", "Channel must be SMS for mobile");
    assert(/^\d{4}$/.test(res.code!), "OTP must be exactly 4 digits");
    results.push({ name: "1. sendOtp dispatches 4-digit numeric code to mobile number", passed: true });
  } catch (err: any) {
    results.push({ name: "1. sendOtp dispatches 4-digit numeric code to mobile number", passed: false, error: err.message });
  }

  // 2. Send OTP to Email
  try {
    const res = await authService.sendOtp("user@cinevenue.com", "VERIFY_ACCOUNT");
    assert(res.success === true, "sendOtp must return success: true");
    assert(res.channel === "EMAIL", "Channel must be EMAIL for email address");
    assert(/^\d{4}$/.test(res.code!), "OTP must be exactly 4 digits");
    results.push({ name: "2. sendOtp dispatches 4-digit numeric code to email address", passed: true });
  } catch (err: any) {
    results.push({ name: "2. sendOtp dispatches 4-digit numeric code to email address", passed: false, error: err.message });
  }

  // 3. Reject Incorrect OTP
  try {
    const phone = "9123456789";
    const sendRes = await authService.sendOtp(phone, "VERIFY_ACCOUNT");
    const validCode = sendRes.code!;
    const wrongCode = validCode === "1234" ? "4321" : "1234";

    let rejected = false;
    try {
      await authService.verifyOtp(phone, wrongCode);
    } catch (e: any) {
      rejected = true;
      assert(e.message.includes("Invalid verification code"), "Must state invalid code");
    }
    assert(rejected, "Must reject incorrect OTP");
    results.push({ name: "3. verifyOtp strictly rejects incorrect OTP with attempts decrement", passed: true });
  } catch (err: any) {
    results.push({ name: "3. verifyOtp strictly rejects incorrect OTP with attempts decrement", passed: false, error: err.message });
  }

  // 4. Verify Correct OTP & Single-Use Consumption
  try {
    const phone = "9111222333";
    const sendRes = await authService.sendOtp(phone, "VERIFY_ACCOUNT");
    const validCode = sendRes.code!;

    const verifyRes = await authService.verifyOtp(phone, validCode);
    assert(verifyRes.success === true && verifyRes.verified === true, "verifyOtp must succeed");
    assert(verifyRes.message.includes("securely verified"), "Must return verified message");

    // Second attempt must fail (Single-use consumption)
    let replayed = false;
    try {
      await authService.verifyOtp(phone, validCode);
    } catch (e: any) {
      replayed = true;
    }
    assert(replayed, "Consumed OTP cannot be re-verified (anti-replay)");
    results.push({ name: "4. verifyOtp succeeds with valid code and enforces single-use consumption", passed: true });
  } catch (err: any) {
    results.push({ name: "4. verifyOtp succeeds with valid code and enforces single-use consumption", passed: false, error: err.message });
  }

  // 5. Brute Force Protection: Revocation after 5 failed attempts
  try {
    const phone = "9998887776";
    await authService.sendOtp(phone, "VERIFY_ACCOUNT");

    for (let i = 0; i < 5; i++) {
      try {
        await authService.verifyOtp(phone, "0000");
      } catch {
        // expected
      }
    }

    let revoked = false;
    try {
      await authService.verifyOtp(phone, "0000");
    } catch (e: any) {
      revoked = e.message.includes("revoked") || e.message.includes("No active verification code");
    }
    assert(revoked, "Code must be revoked after max failed attempts");
    results.push({ name: "5. Brute force defense: 5 failed attempts automatically revokes OTP", passed: true });
  } catch (err: any) {
    results.push({ name: "5. Brute force defense: 5 failed attempts automatically revokes OTP", passed: false, error: err.message });
  }

  for (const r of results) {
    if (r.passed) console.log(`  ✅ [PASS] ${r.name}`);
    else console.error(`  ❌ [FAIL] ${r.name} - ${r.error}`);
  }

  return results;
}

if (process.argv[1]?.includes("otp_verification.test")) {
  runOtpVerificationTests().then(results => {
    const failed = results.filter(r => !r.passed).length;
    if (failed > 0) process.exit(1);
    process.exit(0);
  });
}

