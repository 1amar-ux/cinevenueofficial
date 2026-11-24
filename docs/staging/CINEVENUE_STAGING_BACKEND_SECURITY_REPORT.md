# CINEVENUE — STAGING BACKEND HEALTH & SECURITY AUDIT REPORT

**API Version:** 2.0.0  
**Security Framework:** Express 4 / TypeScript / Helmet / CORS / Rate-Limit  
**Unit Test Suites:** [`tests/unit/production_security_validation.test.ts`](../../tests/unit/production_security_validation.test.ts), [`tests/unit/subwebsiteGate.test.ts`](../../tests/unit/subwebsiteGate.test.ts)  
**Operational Status:** **VERIFIED IN UNIT & INTEGRATION ROUTE TESTS (Live Public Probing Pending Vercel Preview Deployment)**  

---

## 1. HEALTH & READINESS PROBE SPECIFICATION

CineVenue implements tiered health and readiness endpoints for cloud orchestrators:

| Endpoint | HTTP Method | Response Code | Logic / Purpose |
| :--- | :---: | :---: | :--- |
| `/health` | `GET` | `200 OK` | **Liveness Probe:** Returns `{ status: "ok", service: "CineVenue Full Stack Unified Server" }`. Verifies Node.js process is responsive. |
| `/api/v1/health` | `GET` | `200 OK` | **API Liveness Probe:** Returns `{ status: "ok", service: "CineVenue Canonical API", version: "2.0.0" }`. |
| `/api/v1/ready` | `GET` | `200 OK` / `503 Service Unavailable` | **Readiness Probe:** Executes `checkDatabaseConnection()` and `redis.isHealthy()`. Returns `200` only if BOTH database and Redis are operational. Returns `503 degraded` if either component fails. |

---

## 2. PRODUCTION STARTUP VALIDATION & INSECURE DEFAULTS GUARD

On application bootstrap, `assertProductionReadiness()` (`server/config/env.ts`) scans runtime configuration:

```typescript
export function assertProductionReadiness(): void {
  const audit = checkProductionReadiness();
  if (!audit.isReady && process.env.NODE_ENV === "production") {
    console.error("\n[FATAL: Production Readiness Audit Failed]");
    audit.errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Production readiness check failed with ${audit.errors.length} fatal error(s). Server startup aborted.`);
  }
}
```

### Invariants Enforced:
1. **JWT Secret Strength:** Rejects default dev keys (`cinevenue_dev_access_jwt_secret_key_...`). Mandates high-entropy strings (minimum 32 characters).
2. **CORS Wildcard Block:** Rejects `CORS_ORIGIN=*` in production mode.
3. **Passcode Hardening:** Rejects fallback passcodes (`8888`, `admin8888`). Requires high-entropy `ADMIN_PASSCODE`.
4. **Redis Fail-Closed:** Rejects `localhost` / `127.0.0.1` Redis URLs in production mode.

---

## 3. TRAFFIC DEFENSE & RATE LIMITING CONTROLS

In [`server/middleware/rateLimiter.ts`](../../server/middleware/rateLimiter.ts):

* **Authentication Endpoints (`/api/v1/auth/*`):**
  * Window: 15 Minutes
  * Limit: 25 attempts per IP in production (1,000 in test mode)
  * Protection: Brute-force, credential-stuffing, and token abuse prevention.
* **Payment Initialization (`/api/v1/payments/create-order`):**
  * Window: 1 Minute
  * Limit: 30 order creations per IP in production
  * Protection: Checkout spam and seat-hold denial-of-service prevention.
* **Webhook Exemption:**
  * Incoming payment provider webhooks are strictly exempt from rate limiting to prevent dropping confirmation events.

---

## 4. INDEPENDENT SUB-WEBSITE ACCESS GATE

In [`server/middleware/subwebsiteGate.ts`](../../server/middleware/subwebsiteGate.ts):

* **Master & Subsite Switches:** Sub-websites (`/production`, `/marketplace`, `/events`) can be independently deactivated by the Global Admin.
* **Direct Browser Protection:** Direct visits to disabled sub-websites receive HTTP 503 with a styled maintenance HTML page.
* **API Protection:** Direct API calls to disabled sub-websites return HTTP 503 JSON `{ success: false, subWebsiteEnabled: false }`.
* **Zero Collision on Core Ticketing:** Main movie booking, theatre discovery, customer authentication, and admin consoles are strictly immune to sub-website state changes.

---

## 5. AUTOMATED TEST SUITE SUMMARY

| Test Suite | Total Assertions | Passed | Failed | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Production Security Audit** | 9 | 9 | 0 | **PASS** |
| **Authentication & Tokens** | 8 | 8 | 0 | **PASS** |
| **Subwebsite Gatekeeper** | 7 | 7 | 0 | **PASS** |
| **Maintenance Mode Gate** | 4 | 4 | 0 | **PASS** |
| **Fraud & Trust Anomaly Detection** | 10 | 10 | 0 | **PASS** |
| **Audit Trails & Entry Logs** | 10 | 10 | 0 | **PASS** |

