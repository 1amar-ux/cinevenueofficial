# CINEVENUE — STAGING 18-DOMAIN E2E READINESS & UNIT TEST AUDIT REPORT

**Test Suite Execution Date:** 2026-11-09  
**Automated Unit / Mock / Integration Assertions:** 160 Passed / 0 Failed  
**Staging E2E 18-Domain Plan Status:** **NOT EXECUTED AGAINST LIVE INFRASTRUCTURE (UNIT & MOCK PRE-FLIGHT ONLY)**  
**Overall Infrastructure Status:** External PostgreSQL, Shared Redis, Payment Sandboxes, and Vercel Preview are not yet provisioned; live end-to-end execution across live network endpoints is pending.

---

## 1. CRITICAL TEST CLASSIFICATION DISTINCTION

To maintain strict factual accuracy, CineVenue distinguishes between five distinct levels of verification:

1. **Unit Tests:** Fast, isolated assertions verifying specific functions, algorithmic rules, pricing formulas, and cryptographic signatures (e.g. HMAC-SHA256 calculation, fee slab calculation).
2. **Integration Tests (Local Resilient Stores):** Tests verifying module coordination using local in-memory fallback stores and mock proxies when external databases are offline.
3. **Mock Tests:** Simulated provider responses (e.g. simulated Gemini responses, simulated push notification dispatcher, mock POS adapter).
4. **Sandbox Tests:** Real network transactions executed against external provider staging sandboxes (e.g. outbound HTTP calls to Razorpay/Cashfree sandbox APIs).
5. **Real Staging E2E Tests:** Full end-to-end user journeys executed across real deployed preview infrastructure (PostgreSQL 15+, Shared Redis cluster, Vercel Preview domain, live web/mobile clients).

> [!WARNING]
> The 160 passing assertions recorded below are **Unit, Integration, and Mock tests executed in the local development environment**. They validate application logic and fail-closed security guards, but **DO NOT constitute live 18-domain End-to-End verification against staging cloud infrastructure**.

---

## 2. 18-DOMAIN STAGING E2E STATUS MATRIX

| Domain # | Domain Name | Automated Unit / Mock Coverage | Live Staging E2E Status | Missing External Dependency |
| :---: | :--- | :--- | :---: | :--- |
| **01** | **Registration & Authentication** | Bcrypt hashing, JWT generation/verification, role check (8 unit tests passed). | **NOT EXECUTED** | Staging PostgreSQL database for user persistence. |
| **02** | **User Profile Management** | Local profile retrieval and role-scoping logic verified in unit tests. | **NOT EXECUTED** | Staging PostgreSQL database. |
| **03** | **Theatre & Movie Discovery** | Active/inactive filtering and city query logic verified in unit tests. | **NOT EXECUTED** | Staging PostgreSQL database seeded with theatre/movie catalog. |
| **04** | **Seat Selection & Locking** | Atomic Lua script and in-memory seat lock hold verified (10 unit tests passed). | **NOT EXECUTED** | Live shared Redis cluster (`REDIS_URL`). |
| **05** | **Concurrent Seat Reservations** | Single-instance anti-collision & batch rollback verified in unit tests. | **NOT EXECUTED** | Multi-instance deployment connected to shared Redis cluster. |
| **06** | **Booking Creation** | Price calculation, tax computation, and fee breakdown verified in unit tests. | **NOT EXECUTED** | Staging PostgreSQL database. |
| **07** | **Razorpay Sandbox Payments** | HMAC-SHA256 signature verification & order shape verified (unit tests). | **NOT EXECUTED** | Outbound API exchange with `api.razorpay.com` using sandbox keys. |
| **08** | **Cashfree Sandbox Payments** | Timestamped base64 HMAC verification verified (unit tests). | **NOT EXECUTED** | Outbound API exchange with `sandbox.cashfree.com` using sandbox keys. |
| **09** | **Payment Webhook Handling** | Idempotency guard and duplicate prevention verified in unit tests. | **NOT EXECUTED** | Real webhook delivery from payment gateway to public staging URL. |
| **10** | **QR Ticket Generation** | Unique seat token generation and gate verification logic (4 unit tests passed). | **NOT EXECUTED** | Live booking confirmation cycle on staging database. |
| **11** | **Refunds & Expired Seat Locks** | Status transition to `EXPIRED_REFUND_PENDING` on seat conflict verified (unit test). | **NOT EXECUTED** | Live payment refund queue execution. |
| **12** | **CineCoins Rewards** | Coin ledger arithmetic and wallet balance logic verified in unit tests. | **NOT EXECUTED** | Staging PostgreSQL database. |
| **13** | **Push & Email Notifications** | Token registration & dev simulation verified (7 unit tests passed). | **NOT EXECUTED** | External FCM / APNs credentials and real device token receipt. |
| **14** | **Gemini AI VIP Concierge** | Fallback recommendation service verified in unit tests. | **NOT EXECUTED** | Valid `GEMINI_API_KEY` and outbound network connectivity. |
| **15** | **Admin Dashboard & RBAC** | Multi-console sync versioning & broadcast logic (14 unit tests passed). | **NOT EXECUTED** | Real-time WebSocket / SSE connection over Vercel Preview domain. |
| **16** | **POS Operations** | `PosAdapterFactory` and generic adapter logic verified in unit tests. | **NOT EXECUTED** | External cinema box-office API integration. |
| **17** | **Flutter Mobile Application** | Dart source code and dependency architecture inspected and verified. | **NOT EXECUTED** | Flutter SDK installation, native APK build, and physical device test. |
| **18** | **Concurrency & Stress Testing** | Local single-process batch collision rollback verified in unit tests. | **NOT EXECUTED** | Load testing across distributed serverless instances and shared Redis. |

---

## 3. SUMMARY OF LOCALLY EXECUTED TEST SUITES (160 ASSERTIONS)

All 160 assertions were executed locally and passed cleanly:

| Test Suite File | Test Scope | Assertions | Result | Execution Note |
| :--- | :--- | :---: | :---: | :--- |
| [`tests/runner.ts`](../../tests/runner.ts) | Canonical application modules (Auth, Fees, Logs, Sync, Tickets) | 101 Passed / 0 Failed | **PASS** | Ran with local resilient JSON stores; Supabase fetch errors caught gracefully. |
| [`tests/unit/stagingSmokeTestSafety.test.ts`](../../tests/unit/stagingSmokeTestSafety.test.ts) | Staging smoke test safety guard & hostname allowlist | 24 Passed / 0 Failed | **PASS** | Confirms smoke test aborts on production domains, unapproved subdomains, or SSRF IPs. |
| [`tests/unit/redis_distributed_locking.test.ts`](../../tests/unit/redis_distributed_locking.test.ts) | Atomic Lua locking, owner refresh, fail-closed client | 10 Passed / 0 Failed | **PASS** | Verified in-memory fallback & fail-closed client logic. Real cluster not used. |
| [`tests/unit/payment_gateway_hardening.test.ts`](../../tests/unit/payment_gateway_hardening.test.ts) | Razorpay/Cashfree HMAC signatures, idempotency, refund queue | 5 Passed / 0 Failed | **PASS** | Verified local cryptographic verification and service methods. Live APIs not called. |
| [`tests/unit/production_security_validation.test.ts`](../../tests/unit/production_security_validation.test.ts) | Production environment checks, secret auditor, passcode rules | 9 Passed / 0 Failed | **PASS** | Confirms server startup aborts when insecure defaults are detected in production mode. |
| [`tests/unit/push_notification_provider.test.ts`](../../tests/unit/push_notification_provider.test.ts) | FCM/APNs token lifecycle, dev simulation, dead token pruning | 7 Passed / 0 Failed | **PASS** | Verified token store and simulated dispatch. Outbound push not sent. |
| [`tests/unit/database_transaction_integrity.test.ts`](../../tests/unit/database_transaction_integrity.test.ts) | Transaction array error propagation & proxy fail-closed guard | 4 Passed / 0 Failed | **PASS** | Confirms multi-statement transactions are rejected in production without PostgreSQL. |
| **TOTAL** | Local Automated Test Pre-Flight | **160 / 160** | **PASS** | **100% pass rate in local environment.** |

---

## 4. DOCUMENTATION OF SUPABASE FETCH FAILURES DURING TEST RUN

During execution of `npm test`, the console logged multiple occurrences of:
```text
[SupabaseProxy:...] findMany error: TypeError: fetch failed
  [cause]: Error: getaddrinfo ENOTFOUND mpeedjoyvimegnmymweb.supabase.co
```

### Technical Root Cause & Accounting:
1. **Network Boundary:** The tests were executed inside an isolated sandbox environment with no external network access.
2. **Resilient Fallback Stores:** Because external Supabase was unreachable, the backend automatically engaged its local fallback stores (`server/config/analytics_store.json`, `server/config/entry_logs_store.json`, etc.) to complete the assertions.
3. **Factual Implication:** **Real Supabase/PostgreSQL connectivity was NOT exercised during these tests.** Successful database connectivity and persistence can only be confirmed once a live staging PostgreSQL database is provisioned and reachable over the network.
