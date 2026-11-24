# CINEVENUE — STAGING INFRASTRUCTURE SETUP SPECIFICATION

**Target Environment:** Staging (Pre-Production Sandbox)  
**Target Git Branch:** `staging`  
**Repository:** `https://github.com/1amar-ux/cinevenueofficial.git`  
**Authoritative Environment Template:** [`staging.env.example`](staging.env.example)  

---

## 1. ARCHITECTURE OVERVIEW

The CineVenue platform staging environment replicates production topology with strict operational sandboxing:

```
+-----------------------------------------------------------------------------------+
|                            CINEVENUE STAGING TOPOLOGY                            |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Web / Mobile Clients ]                                                         |
|         │                                                                         |
|         ▼                                                                         |
|  [ Vercel Edge / CDN ] ─── Preview Branch: staging                                 |
|         │                  Custom Domain: staging.cinevenue.com                   |
|         ├─────────────────────────────────────────┐                               |
|         ▼                                         ▼                               |
|  [ Vite Static Assets ]                    [ Serverless API ]                     |
|  Directory: dist/                          Entrypoint: api/index.js               |
|                                                   │                               |
|         ┌─────────────────────────────────────────┴───────────────────────┐       |
|         ▼                                                                 ▼       |
|  [ Managed PostgreSQL ]                                            [ Shared Redis ]
|  Host: [STAGING_POSTGRES_HOST]:5432                                Host: [STAGING_REDIS_HOST]:6379
|  Database: cinevenue_staging                                       Protocol: redis:// (or rediss://)
|  Connection pooling: PgBouncer / Direct                            Atomic Lua 10-Min Seat Locks
|                                                                                   |
|  [ External Sandbox Providers ]                                                   |
|  ├── Razorpay Sandbox (RAZORPAY_ENV=TEST)                                         |
|  ├── Cashfree Sandbox (CASHFREE_ENV=TEST, v2023-08-01)                             |
|  ├── Google Gemini AI Concierge (Sandbox API key)                                 |
|  └── Push Dispatcher (Simulated fallback or isolated dev topic)                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. DEDICATED STAGING INFRASTRUCTURE REQUIREMENTS

| Infrastructure Component | Provider / Solution | Minimum Spec | Network & TLS Requirements | Status |
| :--- | :--- | :--- | :--- | :---: |
| **PostgreSQL Database** | Supabase Pro / AWS RDS / Neon | PostgreSQL 15+ (1 vCPU, 2GB RAM, 10GB storage) | TCP 5432, SSL required (`sslmode=require`), connection limit 20 | **BLOCKED — INFRASTRUCTURE REQUIRED** |
| **Shared Redis** | Upstash / AWS ElastiCache / Redis Cloud | Redis 7.x (Standard standalone or cluster, 256MB+) | Port 6379 (or 6380 for TLS `rediss://`), Auth password required | **BLOCKED — INFRASTRUCTURE REQUIRED** |
| **Hosting Platform** | Vercel Pro | Serverless Node.js 20.x runtime, 30s timeout | HTTPS preview domain, Preview environment variable scope | **LOCAL BUILD VERIFIED / PENDING DASHBOARD CONFIG** |
| **Payment Sandboxes** | Razorpay & Cashfree | Test Mode / Sandbox Accounts | Outbound HTTPS 443 to `api.razorpay.com` and `sandbox.cashfree.com` | **VERIFIED IN UNIT TESTS / AWAITING LIVE CREDENTIALS** |

---

## 3. STRICT ISOLATION INVARIANTS

1. **No Shared Databases:** The staging environment must NEVER connect to the production PostgreSQL database.
2. **No Shared Redis:** Staging seat locks must NEVER be issued against the production Redis instance to avoid cross-environment key collision (`lock:show:*`).
3. **Fail-Closed Redis:** When `NODE_ENV=production`, the application strictly requires an external shared Redis instance. If `REDIS_URL` is omitted or points to `localhost`, the backend activates `FailingClosedProductionRedisClient` and blocks seat locking.
4. **Payment Gateway Sandbox:** `RAZORPAY_ENV` and `CASHFREE_ENV` must remain set to `TEST`. No live credit cards or UPI accounts can be charged.
5. **Domain Scoping:** Production domains (`cinevenue.com`, `www.cinevenue.com`) must remain strictly assigned to branch `main`. Staging is assigned to `staging.cinevenue.com` or Vercel-generated preview URLs.

---

## 4. PROVISIONING SEQUENCE

1. **Step 1 — Provision PostgreSQL:** Provision an isolated PostgreSQL 15+ database instance named `cinevenue_staging`.
2. **Step 2 — Provision Redis:** Provision an isolated Redis 7.x instance.
3. **Step 3 — Configure Vercel Preview Variables:** Input the variables from [`staging.env.example`](staging.env.example) into Vercel Dashboard under **Preview** environment scope only.
4. **Step 4 — Database Preflight & Migration:** Execute the PowerShell schema-diff inspection gate and review generated DDL before applying schema changes.
5. **Step 5 — Preview Deployment:** Trigger a Vercel Preview deployment from branch `staging`.
6. **Step 6 — Staging Smoke Test:** Run `npx tsx scripts/staging_smoke_test.ts` against the preview domain.

