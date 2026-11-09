# CINEVENUE — STAGING DEPLOYMENT RUNBOOK (WINDOWS POWERSHELL & VERCEL PREVIEW)

**Document Version:** 1.2.0  
**Target Environment:** Staging / Pre-Production (Isolated Vercel Preview & Node Staging)  
**Security Standard:** Strict Sandbox, Zero-Mock, Fail-Closed, No-Live-Transactions  
**Last Verified:** November 9, 2026  

---

## 1. ARCHITECTURAL DEPLOYMENT TOPOLOGY & VERCEL PREVIEW ISOLATION

```mermaid
graph TD
    Client["Client Devices (Browser / Android / iOS)"] --> CDN["Cloudflare / Edge Network"]

    subgraph Vercel_Isolated_Environments["Vercel Deployment Architecture"]
        ProductionDomain["Production Domain: cinevenue.com<br/>(Triggered ONLY by 'main' branch)"]
        PreviewDomain["Staging / Preview Domain: staging.cinevenue.com<br/>(Triggered by 'staging' branch / 'npx vercel' CLI)"]
    end

    CDN -->|Production Traffic| ProductionDomain
    CDN -->|Staging Traffic| PreviewDomain

    subgraph Staging_Backend_Resources["Isolated Staging Infrastructure"]
        PreviewDomain -->|Direct TCP (Port 5432)| StagingDB[("PostgreSQL 15+ (cinevenue_staging)")]
        PreviewDomain -->|TLS / TCP (Port 6379)| StagingRedis[("Shared Redis 7.x (Staging Instance)")]
        PreviewDomain -->|Sandbox Mode Only| SandboxGateways["Razorpay TEST & Cashfree TEST"]
    end

    style ProductionDomain fill:#331111,stroke:#ff4444,stroke-width:2px;
    style PreviewDomain fill:#113311,stroke:#44ff44,stroke-width:2px;
```

> [!CAUTION]
> **CRITICAL VERCEL DEPLOYMENT SAFETY RULE:**
> Never execute `vercel --prod` for staging deployments! The `--prod` flag automatically deploys to the production environment and modifies live domain aliases (`cinevenue.com`). Staging MUST be deployed strictly as a **Vercel Preview Deployment** via `npx vercel` (without `--prod`) or via Git branch integration targeting the `staging` branch.

---

## 2. VERCEL PREVIEW CONFIGURATION & DOMAIN ISOLATION

### A. Vercel Project & Branch Linking
1. **Repository Branch:** `staging` (Preserved and isolated from `main`).
2. **Deployment Mode:** **Preview Deployment**.
3. **Environment Scope:** In Vercel Project Settings → Environment Variables, inject variables with environment scope checked **ONLY for "Preview"** (optionally scoped specifically to the `staging` branch). **Do NOT select "Production"**.
4. **Preview Domain Assignment:**
   * In Vercel Dashboard → Settings → Domains, add `staging.cinevenue.com` and set its **Git Branch** to `staging`.
   * Production domains (`cinevenue.com`, `www.cinevenue.com`) remain strictly tied to `main` and are completely isolated.

### B. Vercel Build & Route Verification
* **Build Command:** `npm run vercel-build` (`prisma generate && vite build && esbuild server/serverless.ts ...`)
* **Output Directory:** `dist`
* **Serverless Function:** `api/index.js` (Timeout: 30s)
* **Rewrites:** Verified in [`vercel.json`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/vercel.json):
  * `/api/(.*)` rewrites to `/api/index.js`
  * `/health` rewrites to `/api/index.js`
  * `/(.*)` rewrites to `/index.html`

---

## 3. SQL MIGRATION SAFETY AUDIT & CLASSIFICATION

A thorough line-by-line inspection of all SQL migration files in `supabase/migrations/` and `supabase/master_schema.sql` was conducted.

### Destructive Keyword Scan Results
* **`DROP TABLE`:** **0 active statements** (Only commented references in down-migration notes).
* **`DROP COLUMN`:** **0 active statements** (Only commented references in down-migration notes).
* **`TRUNCATE`:** **0 active statements**.
* **`DELETE FROM`:** **0 active statements**.
* **Active `DROP` Statements Found:** Only safe idempotency helpers: `DROP POLICY IF EXISTS` (RLS policy replacement) and `DROP TRIGGER IF EXISTS` (timestamp trigger replacement).

### Complete Migration Safety Classification

| Migration File | Description & Target Tables | Classification | Data Loss Risk |
| :--- | :--- | :---: | :---: |
| `20260902164505_initial_schema.sql` | Core DDL: Users, Theatres, Screens, Shows, Bookings, Tickets | **SAFE** | None (Initial Table Creation) |
| `20260903090000_add_auth_identity_and_verification.sql` | Adds `profileImageUrl`, `dateOfBirth` nullable columns | **SAFE** | None (Additive Nullable) |
| `20260904120000_create_app_settings.sql` | Adds `app_settings` table with idempotent RLS policies | **SAFE** | None (Additive Table) |
| `20260904130000_add_global_subwebsite_settings.sql` | Adds `website_settings` table with idempotent RLS policies | **SAFE** | None (Additive Table) |
| `20260908090000_create_casting_and_proposals.sql` | Adds `CastingCall` and `Proposal` tables | **SAFE** | None (Additive Tables) |
| `20260930120000_create_pos_integration_and_booking_boundaries.sql` | Adds `PosIntegration` table and nullable `integrationType` | **SAFE** | None (Additive Table & Column) |
| `20261004140000_create_employee_access_management.sql` | Adds `EmployeeAccess` table with RLS | **SAFE** | None (Additive Table) |
| `20261018170000_add_theatre_id_to_users.sql` | Adds nullable `theatreId` to `User` table with index | **SAFE** | None (Additive Nullable) |
| `20261020183000_create_booking_reminders_and_location.sql` | Adds `NotificationDeliveryLog` table and geocoordinates | **SAFE** | None (Additive Table & Columns) |
| `20261023180000_create_movie_production_proposals.sql` | Adds `movie_production_proposals` table and updated_at trigger | **SAFE** | None (Additive Table) |
| `20261029230000_create_audit_entry_logs.sql` | Adds append-only `audit_entry_logs` table | **SAFE** | None (Additive Append-Only) |
| `20261029240000_create_fraud_trust_centre.sql` | Adds `fraud_rules` and `user_trust_scores` tables | **SAFE** | None (Additive Tables) |
| `20261030010000_create_analytics_engagement_events.sql` | Adds `AnalyticsEngagementEvent` table | **SAFE** | None (Additive Table) |
| `20261030020000_create_global_sync_tables.sql` | Adds `global_sync_events` synchronization table | **SAFE** | None (Additive Table) |
| `20261108100000_create_device_tokens.sql` | Adds `device_tokens` table for FCM/APNs push tokens | **SAFE** | None (Additive Table) |

---

## 4. STAGING DATABASE INITIALIZATION, BACKUP & RECOVERY RUNBOOK

### Architecture Note on Schema Synchronization
The CineVenue schema is authoritatively modeled in [`prisma/schema.prisma`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/prisma/schema.prisma) and [`supabase/master_schema.sql`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/supabase/master_schema.sql).
Because SQL migrations are maintained in `supabase/migrations/` rather than `prisma/migrations/`, schema application to staging can be performed via either of two safe methods:
* **Method 1 (Prisma Direct Push — Recommended):** Uses `npx prisma db push`, which synchronizes `prisma/schema.prisma` directly into the staging database without needing migration folders.
* **Method 2 (Native PostgreSQL DDL):** Executes `supabase/master_schema.sql` via `psql`.

### Windows PowerShell Database Backup & Recovery Procedure

#### Step A: Pre-Migration Staging Backup (Run in PowerShell)
Always create a clean staging snapshot before applying schema changes:
```powershell
# Create pre-migration backup using pg_dump:
pg_dump -h [STAGING_HOST] -U postgres -d cinevenue_staging -F c -b -v -f "cinevenue_staging_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```

#### Step B: Schema Synchronization to Staging (Run in PowerShell)
```powershell
# Set temporary DATABASE_URL for current session only:
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"

# Synchronize Prisma schema with staging PostgreSQL:
npx prisma db push

# Clear session variable:
Remove-Item env:DATABASE_URL
```

#### Step C: Staging Database Rollback (In Case of Incident)
```powershell
# Restore staging database from snapshot dump:
pg_restore -h [STAGING_HOST] -U postgres -d cinevenue_staging -v --clean "cinevenue_staging_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 5. SHARED REDIS STAGING SETUP & VERIFICATION

### Redis Requirements
* **Engine:** Redis 7.x (Cloud instance or Docker container).
* **Eviction Policy:** `volatile-ttl` or `noeviction` (Never use `allkeys-lru` for seat-locking).
* **Production / Staging Guard:** The application validator strictly rejects `localhost` or `127.0.0.1` when `NODE_ENV=production`. `REDIS_URL` must point to an external shared Redis instance.

### Windows PowerShell Redis Verification Commands
```powershell
# Set temporary REDIS_URL for current session:
$env:REDIS_URL = "redis://:[PASSWORD]@[STAGING_REDIS_HOST]:6379"

# Send PING via redis-cli:
redis-cli -u $env:REDIS_URL ping
# Output must be: PONG

# Test seat lock write & read (Simulated 10-minute hold):
redis-cli -u $env:REDIS_URL set "seat_lock_test:show_1:seat_1" "usr_staging_test" EX 600 NX
# Output: OK

redis-cli -u $env:REDIS_URL get "seat_lock_test:show_1:seat_1"
# Output: "usr_staging_test"

# Clean up test lock:
redis-cli -u $env:REDIS_URL del "seat_lock_test:show_1:seat_1"

# Clear session variable:
Remove-Item env:REDIS_URL
```

---

## 6. SMOKE-TEST ISOLATION & TEST DATA ACCOUNTABILITY

[`scripts/staging_smoke_test.ts`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/scripts/staging_smoke_test.ts) operates under strict isolation rules:

### A. Production Safety Guard
* Matches target URL against an explicit staging allowlist (`localhost`, `127.0.0.1`, `staging.cinevenue.com`, `staging-api.cinevenue.com`, and `*.vercel.app` preview URLs).
* Rejects `cinevenue.com`, `www.cinevenue.com`, and `api.cinevenue.com` unconditionally.
* Immediately aborts with code 1 before sending any network request if the host is not allowlisted.

### B. Test Record Accountability
* **Created Records:** 
  1. 1 disposable customer account (`staging_smoke_<timestamp>_<random>@cinevenue.test`).
  2. 2 sandbox simulator payment order references in test gateways (Zero financial liability, unpaid).
* **Guaranteed Cleanup:** Seat locks are wrapped in `try ... finally` to guarantee that all seat locks are released even if a collision or network error occurs.
* **Pre-Existing Record Protection:** Zero pre-existing customers, shows, bookings, or payments are modified or deleted.

---

## 7. COMPLETE WINDOWS POWERSHELL DEPLOYMENT RUNBOOK

Follow these commands in exact sequential order in **Windows PowerShell**:

### Step 1: Local Build & Test Validation (Safe Local Execution)
```powershell
# Run in PowerShell from workspace root:
npm run vercel-build
npm test
```
*Expected: 0 compilation errors; 101/101 canonical tests passing.*

---

### Step 2: Staging Database Backup (Pre-Migration Safety Snapshot)
```powershell
# Create pre-migration backup using PostgreSQL tools:
pg_dump -h [STAGING_HOST] -U postgres -d cinevenue_staging -F c -b -v -f "cinevenue_staging_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```

---

### Step 3: Apply Database Schema to Staging
```powershell
# Set temporary connection string and deploy Prisma schema:
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"
npx prisma db push

# Clear session variable:
Remove-Item env:DATABASE_URL
```

---

### Step 4: Verify Shared Redis Connectivity
```powershell
# Set temporary REDIS_URL for current session:
$env:REDIS_URL = "redis://:[PASSWORD]@[STAGING_REDIS_HOST]:6379"

# Send ping to verify cluster is accessible:
redis-cli -u $env:REDIS_URL ping
# Output must be: PONG

# Clear session variable:
Remove-Item env:REDIS_URL
```

---

### Step 5: Deploy to Vercel (Safe Preview Deployment)
> [!IMPORTANT]
> Ensure all environment variables from [`docs/staging/staging.env.example`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/docs/staging/staging.env.example) are added in the Vercel Dashboard under **Project Settings → Environment Variables** with environment checked **ONLY for "Preview"**.

```powershell
# Deploy strictly as a Vercel PREVIEW deployment (DO NOT use --prod!):
npx vercel
```
*Vercel will build and output a Preview URL (e.g. `https://cinevenue-git-staging-yourteam.vercel.app`).*

---

### Step 6: Verify Staging Health & Readiness Endpoints
Replace `https://staging.cinevenue.com` with your actual Vercel preview URL:
```powershell
# 1. Test Liveness Probe (HTTP 200 expected):
Invoke-RestMethod -Uri "https://staging.cinevenue.com/health" -Method Get

# 2. Test Live Database & Redis Readiness Probe (HTTP 200 expected):
Invoke-RestMethod -Uri "https://staging.cinevenue.com/api/v1/ready" -Method Get
```

---

### Step 7: Run Automated Staging Smoke Test
```powershell
# Set target staging URL and run automated smoke tester:
$env:STAGING_URL = "https://staging.cinevenue.com"
npx tsx scripts/staging_smoke_test.ts

# Clear session variable after test:
Remove-Item env:STAGING_URL
```
*Expected: 10/10 smoke checks passing with green status.*
