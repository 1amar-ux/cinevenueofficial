import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function runAuthTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results = [];

  // Test 1: Password hashing with bcrypt
  try {
    const rawPassword = "SecurePassword@2026";
    const hash = await bcrypt.hash(rawPassword, 10);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    const isWrongMatch = await bcrypt.compare("WrongPassword", hash);

    if (isMatch && !isWrongMatch) {
      results.push({ name: "Bcrypt: Correct password hashing and verification", passed: true });
    } else {
      results.push({ name: "Bcrypt: Password matching mismatch", passed: false, error: "Match comparison failed" });
    }
  } catch (err: any) {
    results.push({ name: "Bcrypt: Password hashing execution", passed: false, error: err.message });
  }

  // Test 2: JWT Access Token signature and expiration validation
  try {
    const secret = "test_jwt_secret_key_12345";
    const payload = { userId: "usr_test_001", email: "user@cinevenue.com", role: "CUSTOMER" };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    const decoded = jwt.verify(token, secret) as any;

    if (decoded.userId === payload.userId && decoded.role === payload.role) {
      results.push({ name: "JWT: Token generation, signing, and payload decoding", passed: true });
    } else {
      results.push({ name: "JWT: Payload mismatch", passed: false, error: "Decoded payload does not match" });
    }
  } catch (err: any) {
    results.push({ name: "JWT: Verification execution", passed: false, error: err.message });
  }

  // Test 3: JWT rejection with invalid secret
  try {
    const secret = "test_jwt_secret_key_12345";
    const token = jwt.sign({ test: true }, secret);

    try {
      jwt.verify(token, "wrong_secret_key");
      results.push({ name: "JWT: Reject token with invalid signature", passed: false, error: "Did not reject invalid secret" });
    } catch {
      results.push({ name: "JWT: Reject token with invalid signature", passed: true });
    }
  } catch (err: any) {
    results.push({ name: "JWT: Rejection test", passed: false, error: err.message });
  }

  return results;
}
