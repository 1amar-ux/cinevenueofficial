import { Request, Response, NextFunction } from "express";
import { getGlobalAppSettings } from "./maintenance";
import { logger } from "../shared/logger";

/**
 * Direct browser route prefixes associated with CineVenue sub-websites.
 * Any request to these paths (or sub-paths) when sub-websites are disabled globally
 * will be intercepted immediately at the server level and returned as an HTTP 503 page.
 */
export const SUBWEBSITE_DIRECT_ROUTES = [
  "/productions",
  "/production",
  "/events",
  "/event-management",
  "/create-event",
  "/promotions",
  "/media-promotions",
  "/media-promotion",
  "/brand-promotion",
  "/film-production",
  "/filmproduction",
  "/24crafts",
  "/crafts",
  "/proposals",
  "/submit-proposal",
  "/services/film-production",
  "/services/event-management",
  "/services/media-promotion",
  "/services/brand-promotion"
];

/**
 * Sub-website API prefixes that must be completely blocked with HTTP 503 JSON
 * when sub-websites are disabled.
 */
export const SUBWEBSITE_API_PREFIXES = [
  "/api/v1/events",
  "/api/v1/marketplace",
  "/api/production",
  "/api/events",
  "/api/promotions"
];

/**
 * Exempt paths that MUST NEVER be blocked by the sub-website gate:
 * - Admin Panel & Admin APIs
 * - Main Website Settings & Health checks
 * - Auth & Security tokens
 * - Main Movie Booking Engine (Movies, Theatres, Bookings, CineCoins, Payments)
 */
export const EXEMPT_ROUTE_PREFIXES = [
  "/adminpanel",
  "/admin",
  "/api/v1/admin",
  "/api/v1/settings",
  "/api/v1/auth",
  "/auth",
  "/api/v1/payments/webhook",
  "/api/v1/health",
  "/health",
  "/api/v1/movies",
  "/api/v1/theatres",
  "/api/v1/bookings",
  "/api/v1/cinecoins",
  "/api/v1/users"
];

const STATIC_ASSET_REGEX = /\.(js|mjs|cjs|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|map|webp|avif)$/i;

/**
 * Determines whether a URL path targets a CineVenue sub-website direct page.
 */
export function isSubwebsitePath(pathname: string): boolean {
  if (!pathname) return false;
  const normalized = pathname.toLowerCase().split("?")[0].replace(/\/+$/, "") || "/";

  // Check against direct subwebsite routes
  for (const route of SUBWEBSITE_DIRECT_ROUTES) {
    if (normalized === route || normalized.startsWith(route + "/")) {
      return true;
    }
  }

  // Also check if `/services` itself is directly accessed for sub-websites
  if (normalized === "/services") {
    return true;
  }

  return false;
}

/**
 * Determines whether an API request targets sub-website backend services.
 */
export function isSubwebsiteApiPath(pathname: string): boolean {
  if (!pathname) return false;
  const normalized = pathname.toLowerCase().split("?")[0];

  for (const prefix of SUBWEBSITE_API_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(prefix + "/")) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a route is strictly exempt from sub-website gate interception.
 */
export function isExemptRoute(pathname: string): boolean {
  if (!pathname) return false;
  // Remove query string and trailing slash for robust matching
  let normalized = pathname.toLowerCase().split("?")[0];
  if (normalized.endsWith('/') && normalized !== '/') {
    normalized = normalized.slice(0, -1);
  }

  // Static assets and Vite internal scripts
  if (
    STATIC_ASSET_REGEX.test(normalized) ||
    normalized.startsWith("/@") ||
    normalized.startsWith("/node_modules") ||
    normalized.startsWith("/src") ||
    normalized === "/favicon.ico"
  ) {
    return true;
  }

  // Explicit exemptions (Admin, Auth, Movie Booking APIs)
  for (const prefix of EXEMPT_ROUTE_PREFIXES) {
    // Normalise prefix once (no trailing slash)
    const cleanPrefix = prefix.endsWith('/') && prefix !== '/' ? prefix.slice(0, -1) : prefix;
    if (
      normalized === cleanPrefix ||
      normalized.startsWith(cleanPrefix + "/") ||
      normalized.startsWith(cleanPrefix + "?")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Generates the premium HTML 503 response page for sub-website maintenance.
 */
export function renderSubwebsiteUnavailableHtml(customMessage?: string): string {
  const message = customMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.";
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sub-Website Temporarily Unavailable | CineVenue</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(18, 24, 38, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --primary: #e11d48;
      --primary-glow: rgba(225, 29, 72, 0.35);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 50% 20%, rgba(225, 29, 72, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.06) 0%, transparent 40%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
    }
    .container {
      max-width: 580px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px var(--primary-glow);
      position: relative;
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(225, 29, 72, 0.12);
      border: 1px solid rgba(225, 29, 72, 0.25);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fda4af;
      margin-bottom: 24px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: #e11d48;
      border-radius: 50%;
      box-shadow: 0 0 10px #e11d48;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .icon-wrapper {
      width: 76px;
      height: 76px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, rgba(225, 29, 72, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%);
      border: 1px solid rgba(225, 29, 72, 0.3);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f43f5e;
    }
    .icon-wrapper svg {
      width: 38px;
      height: 38px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      color: #ffffff;
      line-height: 1.25;
    }
    p.description {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .info-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 32px;
      text-align: left;
      font-size: 13px;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .info-card svg {
      width: 20px;
      height: 20px;
      color: #38bdf8;
      flex-shrink: 0;
    }
    .btn-home {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px 28px;
      background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.4);
      transition: all 0.2s ease;
    }
    .btn-home:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(225, 29, 72, 0.55);
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-badge">
      <span class="status-dot"></span>
      CineVenue Portal Status
    </div>
    
    <div class="icon-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>

    <h1>SUB-WEBSITE TEMPORARILY UNAVAILABLE</h1>
    <p class="description">${message}</p>

    <div class="info-card">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Main Website Unaffected:</strong> Movie tickets, showtimes, and theatre reservations are running normally on CineVenue.
      </div>
    </div>

    <a href="/" class="btn-home" id="btn-back-home">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to CineVenue Home
    </a>

    <div class="footer">
      Error 503 • CineVenue Global Service Orchestrator
    </div>
  </div>
</body>
</html>`;
}

/**
 * Express Middleware: Enforces centralized global access control for all CineVenue sub-websites.
 * Evaluates both direct browser URLs and internal API calls.
 */
export async function checkGlobalSubwebsiteMiddleware(req: Request, res: Response, next: NextFunction) {
  let urlPath = req.originalUrl || req.url || req.path;
  if (urlPath.length > 1 && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  // Explicitly allow the admin panel UI route (and any sub‑paths under it)
  if (urlPath === '/adminpanel' || urlPath.startsWith('/adminpanel/')) {
    return next();
  }

  // 1. Unconditionally allow admin and other exempt routes, regardless of global flag
  if (isExemptRoute(urlPath)) {
    return next();
  }


  const isSubDirect = isSubwebsitePath(urlPath);
  const isSubApi = isSubwebsiteApiPath(urlPath);

  try {
    const settings = await getGlobalAppSettings();

    // Global switch ON → allow everything (already passed exempt check)
    if (settings.globalSubwebsiteEnabled === true) {
      return next();
    }

    // If the request isn’t for a sub‑website, let it through
    if (!isSubDirect && !isSubApi) {
      return next();
    }

    // ----- Global sub‑website DISABLED -----
    logger.warn(`[SUBWEBSITE GATE] Intercepted disabled subwebsite request: ${req.method} ${urlPath}`);

    // Case A: API requests or explicit JSON accept headers
    const isJsonRequest = 
      isSubApi || 
      urlPath.startsWith("/api/") || 
      req.xhr || 
      req.headers.accept?.includes("application/json");

    if (isJsonRequest) {
      res.setHeader("Retry-After", "30");
      res.setHeader("X-Subwebsite-Disabled", "true");
      return res.status(503).json({
        success: false,
        subWebsiteEnabled: false,
        code: "SUB_WEBSITE_DISABLED",
        message: settings.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable."
      });
    }

    // Case B: Direct browser URLs (Android, iOS, Desktop browsers, direct bookmark navigation)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Retry-After", "30");
    res.setHeader("X-Subwebsite-Disabled", "true");
    return res.status(503).send(renderSubwebsiteUnavailableHtml(settings.subwebsiteMaintenanceMessage));

  } catch (error: any) {
    logger.error(`[SUBWEBSITE GATE ERROR] Failed evaluating subwebsite status: ${error.message}`);
    // If an unexpected error occurs during check, fail safely by allowing next or handling gracefully
    return next();
  }
}
