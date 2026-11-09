/**
 * CineVenue Staging URL & Hostname Safety Validator
 * 
 * Strict fail-closed validator that permits only explicitly configured staging hosts
 * and localhost development endpoints.
 * 
 * Security Enforcement:
 * - Reject production domains (*.cinevenue.com except approved staging subdomains)
 * - Reject arbitrary subdomains
 * - Reject generic cloud wildcard domains (unconfigured *.vercel.app, *.railway.app, *.onrender.com)
 * - Reject malformed URLs, unexpected protocols, userinfo injection, and metadata IPs
 * - Enforce HTTPS for all non-localhost endpoints
 * - Fail closed if URL is missing or invalid
 */

export interface StagingUrlValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  error?: string;
}

// Built-in immutable production blocklist (reject unconditionally)
export const FORBIDDEN_PRODUCTION_PATTERNS = [
  /^cinevenue\.com$/,
  /^www\.cinevenue\.com$/,
  /^api\.cinevenue\.com$/,
  /^app\.cinevenue\.com$/,
  /^admin\.cinevenue\.com$/,
  /^prod\.cinevenue\.com$/,
  /^production\.cinevenue\.com$/
];

// Default hardcoded explicit allowlist (no wildcards)
export const DEFAULT_EXPLICIT_STAGING_HOSTS = new Set<string>([
  "localhost",
  "127.0.0.1",
  "staging.cinevenue.com",
  "staging-api.cinevenue.com"
]);

// Generic cloud domains that must NEVER be allowed broadly without explicit host configuration
export const FORBIDDEN_GENERIC_CLOUD_DOMAINS = [
  "vercel.app",
  "railway.app",
  "onrender.com",
  "render.com",
  "herokuapp.com",
  "netlify.app"
];

// Dangerous / internal metadata IPs
const FORBIDDEN_RESERVED_IPS = [
  "0.0.0.0",
  "169.254.169.254",
  "::",
  "::1",
  "[::]"
];

export function validateStagingTargetUrl(
  rawUrl: string | undefined | null,
  explicitAllowedHosts?: string[]
): StagingUrlValidationResult {
  // 1. Fail closed on missing/empty input
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return {
      valid: false,
      error: "Target staging URL is missing or empty. A valid URL must be provided."
    };
  }

  const trimmed = rawUrl.trim();

  // 2. Parse URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (err: any) {
    return {
      valid: false,
      error: `Malformed staging URL: "${trimmed}". URL parsing failed: ${err.message}`
    };
  }

  // 3. Protocol validation: Only HTTP (localhost) and HTTPS permitted
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Disallowed protocol "${parsed.protocol}". Only HTTP (localhost only) and HTTPS are permitted.`
    };
  }

  // 4. Reject userinfo (e.g. https://user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: "URLs containing authentication userinfo (username/password) are strictly prohibited."
    };
  }

  // 5. Normalize hostname
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "").trim();
  if (!hostname) {
    return {
      valid: false,
      error: "URL does not contain a valid hostname."
    };
  }

  // 6. Reject Cloud Metadata / SSRF / Reserved IPs
  if (FORBIDDEN_RESERVED_IPS.includes(hostname)) {
    return {
      valid: false,
      error: `Target address "${hostname}" is forbidden (reserved/metadata IP).`
    };
  }

  // 7. Non-localhost endpoints MUST use HTTPS
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isLocal && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `External staging host "${hostname}" must use HTTPS. HTTP is only permitted for localhost development.`
    };
  }

  // 8. Strict Production Blocklist Check
  if (FORBIDDEN_PRODUCTION_PATTERNS.some((p) => p.test(hostname))) {
    return {
      valid: false,
      error: `Target host "${hostname}" is an authoritative PRODUCTION domain. Execution strictly blocked.`
    };
  }

  // Reject any other arbitrary *.cinevenue.com subdomains that are not explicit staging
  if (
    hostname.endsWith(".cinevenue.com") &&
    hostname !== "staging.cinevenue.com" &&
    hostname !== "staging-api.cinevenue.com"
  ) {
    return {
      valid: false,
      error: `Arbitrary subdomain "${hostname}" of cinevenue.com is not an approved staging host.`
    };
  }

  // 9. Build active allowlist
  const activeAllowlist = new Set<string>(DEFAULT_EXPLICIT_STAGING_HOSTS);

  // Add any explicitly configured hosts passed via arguments or STAGING_ALLOWED_HOSTS env var
  const envConfiguredHosts = process.env.STAGING_ALLOWED_HOSTS
    ? process.env.STAGING_ALLOWED_HOSTS.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean)
    : [];

  const additionalHosts = [
    ...(explicitAllowedHosts || []),
    ...envConfiguredHosts
  ];

  for (const h of additionalHosts) {
    const cleanH = h.toLowerCase().trim();
    // Safety check: Never allow adding production domains or root cloud domains
    if (FORBIDDEN_PRODUCTION_PATTERNS.some((p) => p.test(cleanH))) {
      continue;
    }
    if (FORBIDDEN_GENERIC_CLOUD_DOMAINS.includes(cleanH)) {
      continue;
    }
    activeAllowlist.add(cleanH);
  }

  // 10. Check if hostname is in the explicit allowlist
  if (!activeAllowlist.has(hostname)) {
    const isGenericCloud = FORBIDDEN_GENERIC_CLOUD_DOMAINS.some((d) => hostname.endsWith("." + d));
    const cloudNote = isGenericCloud
      ? ` Generic cloud host "${hostname}" is blocked. To test a specific preview deployment, explicitly configure it via STAGING_ALLOWED_HOSTS.`
      : "";

    return {
      valid: false,
      error: `Host "${hostname}" is NOT in the explicit staging allowlist.${cloudNote}`
    };
  }

  // Clean trailing slash for base URL
  const normalizedUrl = `${parsed.protocol}//${parsed.host}`;

  return {
    valid: true,
    normalizedUrl,
    hostname
  };
}
