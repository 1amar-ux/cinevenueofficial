# CINEVENUE — STAGING PAYMENT SANDBOX AUDIT & VERIFICATION REPORT

**Gateways Supported:** Razorpay & Cashfree  
**Operating Environment:** Sandbox / Test Mode Configuration  
**Implementation Modules:** [`server/modules/payments/`](../../server/modules/payments/)  
**Unit Test Suite:** [`tests/unit/payment_gateway_hardening.test.ts`](../../tests/unit/payment_gateway_hardening.test.ts)  
**Status Breakdown:**
* **HMAC Signature Verification & Webhook Logic:** **VERIFIED IN UNIT TESTS (5/5 Passed)**
* **Local Webhook Idempotency & Conflict Queue:** **VERIFIED IN UNIT TESTS**
* **Live Outbound Sandbox API Calls:** **NOT EXECUTED (Requires Sandbox Keys & Network)**
* **Real Inbound Webhook Delivery:** **NOT EXECUTED (Awaiting Staging Preview URL)**

---

## 1. FACTUAL AUDIT FINDINGS: PAYMENT TESTING BOUNDARIES

To ensure strict factual accuracy:
* ✅ **Cryptographic & Logic Verification:** **VERIFIED.** The HMAC-SHA256 signature calculation, timestamp validation, duplicate booking idempotency, seat-conflict refund queueing, and payment ID reuse guards were verified locally using Node.js crypto and in-memory test mocks.
* ❌ **Live Sandbox API Roundtrips:** **NOT EXECUTED.** No outbound HTTP requests were made to `api.razorpay.com` or `sandbox.cashfree.com` during this audit.
* ❌ **Real Inbound Webhooks:** **NOT EXECUTED.** Webhook receipt from an external gateway requires a publicly accessible HTTPS staging URL and has not yet occurred.
* 🔒 **Zero Financial Risk:** No real cards, bank accounts, or UPI handles were debited; zero live financial transactions were initiated.

---

## 2. PAYMENT GATEWAY SANDBOX TOPOLOGY

CineVenue supports dual payment providers with runtime fallback:

```
[ Frontend Checkout Modal ]
         │
         ▼
[ POST /api/v1/payments/create-order ]
         │
         ├──► Razorpay Sandbox API (api.razorpay.com)
         │    Mode: TEST (rzp_test_...)
         │    Order currency: INR (in paise)
         │
         └──► Cashfree Sandbox API (sandbox.cashfree.com)
              Mode: TEST (TEST_... / cfsk_ma_test_...)
              API Version: 2023-08-01
```

---

## 3. SANDBOX CREDENTIAL SPECIFICATIONS

Staging payment variables must be configured with sandbox test credentials:

```env
# Primary Gateway Selection (RAZORPAY or CASHFREE)
DEFAULT_PAYMENT_GATEWAY=RAZORPAY

# Razorpay Test Configuration
RAZORPAY_ENV=TEST
RAZORPAY_KEY_ID=rzp_test_YourStagingKeyIdHere
RAZORPAY_KEY_SECRET=YourStagingRazorpaySecretHere
RAZORPAY_WEBHOOK_SECRET=rzp_whsec_staging_test_secret_2026

# Cashfree Test Configuration (v2023-08-01)
CASHFREE_ENV=TEST
CASHFREE_APP_ID=TEST_YourStagingCashfreeAppId
CASHFREE_SECRET_KEY=cfsk_ma_test_YourStagingCashfreeSecret
CASHFREE_WEBHOOK_SECRET=cf_whsec_staging_test_secret_2026
CASHFREE_API_VERSION=2023-08-01
```

---

## 4. SECURITY & SIGNATURE VERIFICATION CONTROLS

### A. Razorpay HMAC-SHA256 Webhook Verification
Incoming webhooks must supply `x-razorpay-signature` generated across the raw UTF-8 request body:
```typescript
const expectedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");
return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
```

### B. Cashfree Timestamped HMAC-SHA256 Verification
Cashfree webhooks include `x-webhook-timestamp` and `x-webhook-signature`. The backend concatenates `${timestamp}${rawBody}` and compares against the base64-encoded digest using constant-time comparison.

### C. Rate Limiting Webhook Exemption
In `server/middleware/rateLimiter.ts`, incoming payment webhooks (`/payments/webhook`, `/payments/cashfree/webhook`, `/payments/razorpay/webhook`) are strictly exempt from rate limiting to prevent dropping asynchronous payment acknowledgments.

---

## 5. AUTOMATED UNIT TEST RESULTS (LOCAL EXECUTION)

The payment hardening suite ([`tests/unit/payment_gateway_hardening.test.ts`](../../tests/unit/payment_gateway_hardening.test.ts)) verifies five mission-critical financial safeguards:

| Test Identifier | Guard Description | Test Mode | Result |
| :--- | :--- | :---: | :---: |
| **TC-PAY-01** | **Razorpay Signature Validation:** Accepts valid HMAC-SHA256 signature; rejects tampered payloads. | Unit (Crypto) | **PASS** |
| **TC-PAY-02** | **Cashfree Signature Validation:** Verifies timestamped base64 HMAC; rejects spoofed signatures. | Unit (Crypto) | **PASS** |
| **TC-PAY-03** | **Webhook Idempotency:** Duplicate payment webhooks return existing confirmed booking without re-billing. | Unit (Mock Store) | **PASS** |
| **TC-PAY-04** | **Seat-Lock Expiry & Conflict:** When seats are lost during payment, booking transitions to `EXPIRED_REFUND_PENDING` and rejects confirmation. | Unit (Mock Store) | **PASS** |
| **TC-PAY-05** | **Payment Reference Reuse Guard:** Distinct booking attempting to claim an already-used `paymentId` is rejected with `ConflictError`. | Unit (Mock Store) | **PASS** |

---

## 6. PENDING STAGING PREREQUISITES

* **Live Sandbox Keys:** Provisioning test credentials from the Razorpay and Cashfree developer dashboards.
* **Live Sandbox Transaction Verification:** Submitting a real test-card checkout against the staging backend and receiving live webhook confirmation.
