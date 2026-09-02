/**
 * Bank validation & masking utility functions safe for browser & Node.js client bundles
 */

/**
 * Mask bank account number according to CineVenue standard:
 * "XXXX XXXX 1234"
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return "XXXX XXXX ----";
  const sanitized = accountNumber.replace(/\s+/g, "").trim();
  if (sanitized.length < 4) {
    return `XXXX XXXX ${sanitized}`;
  }
  const lastFour = sanitized.slice(-4);
  return `XXXX XXXX ${lastFour}`;
}

/**
 * Validate Indian IFSC Code format:
 * Exactly 11 characters: 4 letters, 0, 6 letters/digits
 */
export function isValidIFSC(ifsc: string): boolean {
  if (!ifsc) return false;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.trim().toUpperCase());
}

/**
 * Validate Indian PAN format (Optional):
 * 5 letters, 4 digits, 1 letter
 */
export function isValidPAN(pan?: string): boolean {
  if (!pan || !pan.trim()) return true;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
}

/**
 * Validate GSTIN format (Optional):
 * 2 digits + 10-char PAN + 1 digit/letter + Z + 1 digit/letter
 */
export function isValidGSTIN(gstin?: string): boolean {
  if (!gstin || !gstin.trim()) return true;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.trim().toUpperCase());
}

/**
 * Sanitize plain strings to prevent XSS / script injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "")
    .trim();
}
