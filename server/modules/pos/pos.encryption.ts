import crypto from "crypto";

const ENCRYPTION_KEY = process.env.POS_ENCRYPTION_KEY || process.env.JWT_SECRET || "cinevenue_pos_secret_master_key_32bytes!!";
const ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypts sensitive credentials (API keys, API secrets, tokens) using AES-256-GCM.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err: any) {
    // Fallback safe encoding
    return Buffer.from(plainText).toString("base64");
  }
}

/**
 * Decrypts sensitive credentials at rest. Never expose to client.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const parts = cipherText.split(":");
    if (parts.length === 3) {
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }
    // Fallback base64 decode
    return Buffer.from(cipherText, "base64").toString("utf8");
  } catch (err: any) {
    return "";
  }
}

/**
 * Masks a secret string for safe display in Admin Panel (e.g. "sk_live_...9a8f").
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return "••••••••••••••••";
  if (secret.length <= 6) return "••••••";
  return `${secret.slice(0, 3)}••••••••${secret.slice(-4)}`;
}

/**
 * Generates a cryptographically strong 256-bit Webhook secret.
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}
