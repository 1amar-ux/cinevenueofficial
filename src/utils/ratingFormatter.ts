/**
 * Rating Formatter Utility for CineVenue
 * Ensures consistent "X.X/10" rating format across Admin Panel, User App, and Website.
 * e.g., "9.0/10", "9.3/10"
 */

/**
 * Formats any rating representation to standard "X.X/10" format.
 * Examples:
 *  - "9" -> "9.0/10"
 *  - "9.3" -> "9.3/10"
 *  - "9.3/10" -> "9.3/10"
 *  - 9.4 -> "9.4/10"
 */
export function formatRating(val?: string | number | null, fallback = "9.0/10"): string {
  if (val === undefined || val === null || val === "") {
    return fallback;
  }
  const str = String(val).trim();
  // Strip out any trailing "/10" suffix
  const cleanStr = str.replace(/\/10$/, "").trim();
  const num = parseFloat(cleanStr);
  if (isNaN(num)) {
    return str.includes("/10") ? str : `${str}/10`;
  }
  return `${num.toFixed(1)}/10`;
}

/**
 * Extracts raw numeric rating value for mathematical operations (e.g. weighted averages).
 * Examples:
 *  - "9.3/10" -> 9.3
 *  - "9.0" -> 9.0
 *  - 9.4 -> 9.4
 */
export function parseRatingNumber(val?: string | number | null, fallback = 9.0): number {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const str = String(val).trim().replace(/\/10$/, "").trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}
