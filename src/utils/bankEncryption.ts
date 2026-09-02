import crypto from "crypto";

export * from "./bankValidation";

// 256-bit encryption key derivation from secret or fallback salt
const ENCRYPTION_SECRET = process.env.BANK_ENCRYPTION_SECRET || "cinevenue_secure_theatre_payout_secret_key_2026";
const ALGORITHM = "aes-256-cbc";

// Generate a deterministic 32-byte key from the secret lazily or safely
function getKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();
}

/**
 * Encrypt a sensitive bank account number (Server-side)
 */
export function encryptAccountNumber(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plainText.trim(), "utf8", "hex");
  encrypted += cipher.final("hex");
  // Prepend IV for decryption
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted bank account number (Server-side)
 */
export function decryptAccountNumber(cipherText: string): string {
  if (!cipherText || !cipherText.includes(":")) return "";
  try {
    const [ivHex, encryptedHex] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt account number safely");
    return "";
  }
}
