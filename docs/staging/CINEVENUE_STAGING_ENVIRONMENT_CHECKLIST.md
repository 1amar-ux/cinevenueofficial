# CINEVENUE — STAGING ENVIRONMENT CONFIGURATION CHECKLIST

**Document Version:** 1.1.0  
**Target Environment:** Staging / Pre-Production (Vercel Preview & Node Staging)  
**Security Level:** High / Zero-Exposure  
**Last Verified:** November 9, 2026  

---

## 1. EXECUTIVE SUMMARY & SECURITY PRINCIPLES

This checklist defines every environment variable required to operate CineVenue in a fully functional staging environment with **zero mock fallback** and **zero risk of accidental live transactions**.

### Strict Operational Principles:
1. **Never Expose Secrets in Git:** All values below are variable names and template patterns. Real staging secrets must be injected via your hosting provider's secure secret manager (e.g., Vercel Environment Variables targeting **Preview**, AWS Secrets Manager, or Railway Variables).
2. **Never Use Client `VITE_` Prefix for Backend Secrets:** Only variables prefixed with `VITE_` are exposed to the browser. Database URLs, Redis connection strings, and payment private keys must **never** be prefixed with `VITE_`.
3. **Mandatory Sandbox Mode for Financial Gateways:** `RAZORPAY_ENV` must be strictly set to `TEST` and `CASHFREE_ENV` strictly set to `TEST`. The application startup validator rejects live gateway credentials during staging audits.
4. **Fail-Closed Architecture:** If any mandatory production/staging variable is missing or insecure, the backend aborts boot immediately with an explicit error list via `assertProductionReadiness()`.

---

## 2. COMPLETE STAGING ENVIRONMENT VARIABLE REGISTRY

### Category 1: Build-Time Frontend Variables (Exposed via Vite to Browser)
| Variable Name | Staging Required? | Staging Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **YES** | `https://staging-api.cinevenue.com` (or preview URL) | Root API endpoint used by client-side browser fetches. |
| `VITE_CASHFREE_ENV` | **YES** | `TEST` | Directs Cashfree JS SDK to use sandbox payment modal. |

---

### Category 2: Required Backend Runtime Variables
| Variable Name | Type | Staging Required? | Staging Value / Format | Security Validation & Startup Behavior |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | String | **YES** | `production` | Triggers production security rules: blocks in-memory Redis, enforces non-wildcard CORS, and requires 32-char JWT secrets. |
| `PORT` | Number | **YES** | `5000` | Port for Express HTTP / WebSocket server (used in Node runtime). |
| `API_PREFIX` | String | No | `/api/v1` | Canonical API route mount prefix. |
| `CORS_ORIGIN` | String | **YES** | `https://staging.cinevenue.com,https://staging-app.cinevenue.com` | **Strictly enforced**. Wildcard `*` in `NODE_ENV=production` triggers immediate startup fatal error. Must specify comma-separated HTTPS origins. |
| `FRONTEND_URL` | String | **YES** | `https://staging.cinevenue.com` | Base URL used for email links and ticket redirects. |
| `JWT_ACCESS_SECRET` | String | **YES** | 64-char hex string (`openssl rand -hex 32`) | Signs short-lived (1 hour) customer and admin access tokens. Strings under 32 chars or containing `dev_access` **abort startup**. |
| `JWT_REFRESH_SECRET` | String | **YES** | 64-char hex string (`openssl rand -hex 32`) | Signs persistent (7 days) refresh tokens. Must be distinct from access secret. |
| `ADMIN_PASSCODE` | String | **YES** | Custom string ($\ge 12$ chars) | B2B admin elevation passcode. Passcodes `8888` and `admin8888` are **strictly blocked** in production/staging. |
| `SUPER_ADMIN_PASSWORD` | String | **YES** | Custom string ($\ge 14$ chars) | Master root administrative login password. |
| `SUPER_ADMIN_EMAIL` | String | No | `superadmin@cinevenue.com` | Authoritative Super Admin root account email. |
| `DATABASE_URL` | String | **YES** | `postgresql://user:pass@host:5432/cinevenue_staging?schema=public&connection_limit=20&pool_timeout=10` | Direct TCP connection string to PostgreSQL. Required for genuine Prisma `$transaction` ACID rollback. |
| `REDIS_URL` | String | **YES** | `redis://:password@host:6379` | Shared Redis 7.x instance for atomic 10-minute seat locks. `localhost` is blocked in production. |

---

### Category 3: Sandbox-Only Payment Variables (Strictly Test Mode)
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

### Category 4: Push Notification Provider Variables (FCM & APNs - Optional in Staging)
| Variable Name | Required For | Format | Provider Action in Staging |
| :--- | :--- | :--- | :--- |
| `FCM_SERVER_KEY` | Android & Web Push | Server API Key from Firebase Console | Transmits real test notifications to staging devices. If omitted, backend logs `PUSH_PROVIDER_UNCONFIGURED` and returns HTTP 503 rather than claiming false delivery. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Android & Web Push (v1) | Base64-encoded Service Account JSON | Optional for Firebase HTTP v1 API. |
| `APNS_KEY_ID` | iOS Push | 10-character Key ID | Apple Developer Console -> Keys (Uppercase required). |
| `APNS_TEAM_ID` | iOS Push | 10-character Team ID | Apple Developer Membership Team ID. |
| `APNS_BUNDLE_ID` | iOS Push | `com.cinevenue.app.staging` | Staging iOS App Bundle Identifier. |
| `APNS_AUTH_KEY` | iOS Push | Multi-line `.p8` private key | Raw contents of `AuthKey_XXXXXXXXXX.p8`. |

---

### Category 5: AI Concierge & Optional Integrations
| Variable Name | Required For | Example Staging Value | Purpose |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | VIP Concierge | `AIzaSy...` | Powers AI movie recommendations and VIP concierge inquiries. |
| `DIRECT_URL` | Prisma Migrations | `postgresql://...:5432/...` | Optional direct connection for running migrations if using a PgBouncer pooler. |
| `GOOGLE_CLIENT_ID` | Google OAuth | Optional | Client ID for Google Social Sign-In. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Optional | Client Secret for Google OAuth. |
| `GOOGLE_CALLBACK_URL` | Google OAuth | `https://staging.cinevenue.com/api/v1/auth/google/callback` | OAuth redirect URI. |
| `SMTP_HOST` / `RESEND_API_KEY` | Email Delivery | `smtp.mailtrap.io` | Test email inbox for receiving staging ticket passes. |

---

## 3. PRE-DEPLOYMENT STAGING VERIFICATION CHECKLIST

Before deploying, sign off on this verification table:

- [ ] **1. Secret Generation Complete:**
  - `JWT_ACCESS_SECRET` generated via `openssl rand -hex 32` (Length $\ge 64$ hex chars).
  - `JWT_REFRESH_SECRET` generated via `openssl rand -hex 32` (Distinct from access secret).
  - `ADMIN_PASSCODE` set to a strong custom string (Not `8888`).
- [ ] **2. Networking & CORS Verified:**
  - `CORS_ORIGIN` contains exact staging frontend domain (e.g. `https://staging.cinevenue.com`).
  - No wildcard `*` present in `CORS_ORIGIN`.
- [ ] **3. PostgreSQL Staging Instance Ready:**
  - Database schema initialized with `npx prisma migrate deploy`.
  - Connection pool limits set to 10-20 connections.
- [ ] **4. Shared Redis Instance Accessible:**
  - External Redis 7.x instance reachable via `REDIS_URL`.
  - `redis-cli -u $env:REDIS_URL ping` returns `PONG`.
- [ ] **5. Payment Gateways Locked to Sandbox:**
  - `RAZORPAY_ENV` is explicitly set to `TEST`.
  - `CASHFREE_ENV` is explicitly set to `TEST`.
  - `RAZORPAY_KEY_ID` begins with `rzp_test_`.
  - `CASHFREE_APP_ID` begins with `TEST_`.
- [ ] **6. Vercel Environment Scope Verified:**
  - Variables configured for **Preview** environment (scoped to branch `staging`).
  - Production environment variables untouched.
