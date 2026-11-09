# CINEVENUE — STAGING ENVIRONMENT CONFIGURATION CHECKLIST

**Document Version:** 1.0.0  
**Target Environment:** Staging / Pre-Production  
**Security Level:** High / Zero-Exposure  
**Last Verified:** November 9, 2026  

---

## 1. EXECUTIVE SUMMARY & SECURITY PRINCIPLES

This checklist defines every environment variable required to operate CineVenue in a fully functional staging environment with **zero mock fallback** and **zero risk of accidental live transactions**.

### Strict Operational Principles:
1. **Never Expose Secrets in Git:** All values below are variable names and template patterns. Real staging secrets must be injected via your hosting provider's secure secret manager (e.g. Vercel Environment Variables, AWS Secrets Manager, Doppler, or Railway Variables).
2. **Never Use Client `VITE_` Prefix for Backend Secrets:** Only variables prefixed with `VITE_` are exposed to the browser. Database URLs, Redis connection strings, and payment private keys must **never** be prefixed with `VITE_`.
3. **Mandatory Sandbox Mode for Financial Gateways:** `RAZORPAY_ENV` must be strictly set to `TEST` and `CASHFREE_ENV` strictly set to `TEST`. The application startup validator rejects live gateway credentials during staging audits.
4. **Fail-Closed Architecture:** If any mandatory production/staging variable is missing or insecure, the backend aborts boot immediately with an explicit error list via `assertProductionReadiness()`.

---

## 2. COMPLETE STAGING ENVIRONMENT VARIABLE REGISTRY

### Group A: Runtime, Networking & Strict CORS
| Variable Name | Type | Staging Required? | Default / Example Value | Security Validation & Startup Behavior |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | String | **YES** | `production` | Triggers production security rules: blocks in-memory Redis, enforces non-wildcard CORS, and requires 32-char JWT secrets. |
| `PORT` | Number | **YES** | `5000` | Port for Express HTTP / WebSocket server. |
| `API_PREFIX` | String | No | `/api/v1` | Canonical API route mount prefix. |
| `CORS_ORIGIN` | String | **YES** | `https://staging.cinevenue.com,https://staging-app.cinevenue.com` | **Strictly enforced**. Wildcard `*` in `NODE_ENV=production` triggers immediate startup fatal error. Must specify comma-separated HTTPS origins. |
| `FRONTEND_URL` | String | **YES** | `https://staging.cinevenue.com` | Base URL used for email links and ticket redirects. |
| `VITE_API_URL` | String | **YES** | `https://staging-api.cinevenue.com` | Client-side API root used by Vite React bundle. |

---

### Group B: High-Entropy JWT Session & Admin Passcodes
> [!IMPORTANT]
> The platform uses distinct access and refresh secrets. It does **NOT** use a generic `JWT_SECRET`. Dev defaults (e.g. strings containing `dev_access` or `dev_refresh`) or secrets under 32 characters **abort application boot**.

| Variable Name | Staging Required? | Generation Command | Entropy Requirement | Purpose |
| :--- | :---: | :--- | :--- | :--- |
| `JWT_ACCESS_SECRET` | **YES** | `openssl rand -hex 32` | $\ge$ 64 hex characters (32 bytes) | Cryptographically signs short-lived (1 hour) customer and admin access tokens. |
| `JWT_REFRESH_SECRET` | **YES** | `openssl rand -hex 32` | $\ge$ 64 hex characters (32 bytes) | Signs long-lived (7 days) refresh tokens stored in secure HTTP-only cookies. |
| `JWT_ACCESS_EXPIRES_IN` | No | Fixed: `1h` | Standard time string | Access token lifespan. |
| `JWT_REFRESH_EXPIRES_IN` | No | Fixed: `7d` | Standard time string | Refresh token lifespan. |
| `ADMIN_PASSCODE` | **YES** | User chosen | Strong string ($\ge 12$ chars) | B2B / Admin console elevation passcode. Default passcodes `8888` and `admin8888` are **strictly blocked** in production/staging. |
| `SUPER_ADMIN_PASSWORD` | **YES** | User chosen | Strong string ($\ge 14$ chars) | Master platform emergency administrative login password. |
| `SUPER_ADMIN_EMAIL` | No | `superadmin@cinevenue.com` | Valid email | Authoritative Super Admin root account email. |

---

### Group C: PostgreSQL Database & Connection Pooling
> [!NOTE]
> Prisma `$transaction` requires a **direct TCP session connection** in production/staging. Proxy mode (HTTP fallback) strictly rejects multi-statement financial transactions to prevent partial writes.

| Variable Name | Format | Purpose | Staging Recommendation |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public&connection_limit=20&pool_timeout=10` | Primary Prisma ORM connection pool string. | Minimum 10-20 connections pooled. For Supabase / Neon, use the TCP session connection on port 5432 or 6543 (transaction mode). |
| `DIRECT_URL` | `postgresql://user:pass@host:5432/db?schema=public` | Direct non-pooled TCP connection string. | Used exclusively by Prisma CLI for running schema migrations (`prisma migrate deploy`). |

---

### Group D: Distributed Cache & Redis Seat Locking
| Variable Name | Format | Purpose | Security Guard |
| :--- | :--- | :--- | :--- |
| `REDIS_URL` | `redis://:password@host:6379` | Shared Redis instance for atomic 10-minute distributed seat locking and real-time pub/sub. | In `NODE_ENV=production`, `localhost` or missing `REDIS_URL` switches client to `FailingClosedProductionRedisClient`, safely rejecting seat locks to avoid duplicate booking conflicts. |

---

### Group E: Payment Gateways (Strict Sandbox Mode)
| Variable Name | Valid Staging Value | Purpose | Accidental Live Protection |
| :--- | :--- | :--- | :--- |
| `DEFAULT_PAYMENT_GATEWAY` | `RAZORPAY` or `CASHFREE` | Default checkout provider. | Both gateways support full sandbox testing. |
| `RAZORPAY_ENV` | **`TEST`** | Controls Razorpay SDK mode. | If set to `LIVE` without real production keys, startup validation throws a fatal error. In `TEST`, all transactions are zero-cost simulated orders. |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | Razorpay Test API Key ID. | Obtain from Razorpay Dashboard -> Settings -> API Keys (Test Mode). |
| `RAZORPAY_KEY_SECRET` | Secret string | Razorpay Test Key Secret. | Must match Key ID. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret string | Verifies HMAC-SHA256 signatures of inbound payment webhooks. | Configured in Razorpay Dashboard -> Webhooks -> Add New Webhook. |
| `CASHFREE_ENV` | **`TEST`** | Controls Cashfree SDK environment. | Uses `https://sandbox.cashfree.com/pg` API endpoint. |
| `CASHFREE_APP_ID` | `TEST_...` | Cashfree Sandbox App ID. | Generated from Cashfree Merchant Dashboard (Sandbox Mode). |
| `CASHFREE_SECRET_KEY` | `cfsk_ma_test_...` | Cashfree Sandbox Secret Key. | Used for API authorization and webhook signature signing. |
| `CASHFREE_WEBHOOK_SECRET` | Secret string | Verifies Cashfree timestamped webhook signatures. | Ensures duplicate webhook deliveries are rejected. |
| `CASHFREE_API_VERSION` | `2023-08-01` | Cashfree PG API version. | Pinned to current stable API contract. |

---

### Group F: Push Notifications & AI Concierge
| Variable Name | Required For | Format | Provider Action in Staging |
| :--- | :--- | :--- | :--- |
| `FCM_SERVER_KEY` | Android & Web Push | Server API Key from Firebase Console | Transmits real test notifications to staging devices. If omitted, backend logs `PUSH_PROVIDER_UNCONFIGURED` and returns HTTP 503 rather than claiming false delivery. |
| `APNS_KEY_ID` | iOS Push | 10-character Key ID | Apple Developer Console -> Keys. |
| `APNS_TEAM_ID` | iOS Push | 10-character Team ID | Apple Developer Membership Team ID. |
| `APNS_BUNDLE_ID` | iOS Push | `com.cinevenue.app.staging` | Staging iOS App Bundle Identifier. |
| `APNS_AUTH_KEY` | iOS Push | Multi-line `.p8` private key | Tokens are generated via JWT ES256 to Apple APNs sandbox gateway. |
| `GEMINI_API_KEY` | VIP Concierge | Google AI Studio Key (`AIza...`) | Powers movie discovery, seat advice, and B2B concierge inquiries. |

---

## 3. PRE-DEPLOYMENT STAGING VERIFICATION CHECKLIST

Before triggering the deployment build, execute and sign off on this verification table:

- [ ] **1. Secret Generation Complete:**
  - `JWT_ACCESS_SECRET` generated via `openssl rand -hex 32` (Length $\ge 64$).
  - `JWT_REFRESH_SECRET` generated via `openssl rand -hex 32` (Distinct from access secret).
  - `ADMIN_PASSCODE` set to a strong custom string (Not `8888`).
- [ ] **2. Networking & CORS Verified:**
  - `CORS_ORIGIN` contains exact staging frontend domain (e.g. `https://staging.cinevenue.com`).
  - No wildcard `*` present in `CORS_ORIGIN`.
- [ ] **3. PostgreSQL Staging Instance Ready:**
  - Database schema initialized with `prisma migrate deploy`.
  - Connection pool limits set to 10-20 connections.
- [ ] **4. Shared Redis Instance Accessible:**
  - External Redis 7.x instance reachable via `REDIS_URL`.
  - `redis-cli -u $REDIS_URL ping` returns `PONG`.
- [ ] **5. Payment Gateways Locked to Sandbox:**
  - `RAZORPAY_ENV` is explicitly set to `TEST`.
  - `CASHFREE_ENV` is explicitly set to `TEST`.
  - `RAZORPAY_KEY_ID` begins with `rzp_test_`.
  - `CASHFREE_APP_ID` begins with `TEST_`.
- [ ] **6. Serverless & Express Compatibility Checked:**
  - `npm run vercel-build` builds with zero errors.
  - `npm test` passes 101/101 canonical tests.
