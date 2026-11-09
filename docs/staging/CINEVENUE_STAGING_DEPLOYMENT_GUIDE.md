# CINEVENUE — STAGING DEPLOYMENT RUNBOOK (WINDOWS POWERSHELL & VERCEL PREVIEW)

**Document Version:** 1.1.0  
**Target Environment:** Staging / Pre-Production (Isolated Preview Deployment)  
**Security Standard:** Strict Sandbox, Zero-Mock, Fail-Closed, No-Live-Transactions  
**Last Verified:** November 9, 2026  

---

## 1. ARCHITECTURAL DEPLOYMENT TOPOLOGY & SAFETY BOUNDARIES

```mermaid
graph TD
    Client["Client Devices (Browser / Android / iOS)"] --> CDN["Cloudflare / Edge Network"]

    subgraph Vercel_Isolated_Environments["Vercel Deployment Architecture"]
        ProductionDomain["Production Domain: cinevenue.com<br/>(Triggered ONLY by 'main' branch)"]
        PreviewDomain["Staging / Preview Domain: staging.cinevenue.com<br/>(Triggered by 'staging' branch / 'vercel' preview CLI)"]
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
> Never execute `vercel --prod` for staging deployments! The `--prod` flag automatically deploys to the production environment and modifies live domain aliases (`cinevenue.com`). Staging MUST be deployed strictly as a **Vercel Preview Deployment** via `vercel` (without `--prod`) or via Git branch integration targeting the `staging` branch.

---

## 2. VERCEL PREVIEW DEPLOYMENT CONFIGURATION

### A. Vercel Project & Branch Linking
1. **Repository Branch:** `staging` (Branched from commit `22c22a9`).
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

## 3. DATABASE SAFETY, MIGRATION & BACKUP PROCEDURE

### Database Inspection Findings
* **Prisma Seed Script:** There is **NO `prisma/seed.ts` file in the repository**. Running `prisma/seed.ts` will fail.
* **Migration Behavior:** Running `npx prisma migrate deploy` executes existing SQL migrations sequentially against the target database (`DATABASE_URL`). It is **idempotent** and will only apply unapplied migrations.
* **Database Isolation:** All commands below explicitly target `cinevenue_staging`. They will never touch production databases unless the user supplies a production connection string.

### Windows PowerShell Database Backup & Rollback Runbook

#### 1. Pre-Migration Staging Backup (Run in PowerShell)
Before running migrations on staging, create a complete snapshot:
```powershell
# Windows PowerShell:
pg_dump -h [STAGING_HOST] -U postgres -d cinevenue_staging -F c -b -v -f "cinevenue_staging_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
```

#### 2. Execute Prisma Migrations (Run in PowerShell)
```powershell
# Windows PowerShell (Sets DATABASE_URL for current session only):
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"
npx prisma migrate deploy
```

#### 3. Staging Database Rollback (If Migration Fails)
If a newly applied migration needs to be rolled back:
```powershell
# Option A: Revert Prisma migration state record
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public"
npx prisma migrate resolve --rolled-back [MIGRATION_DIRECTORY_NAME]

# Option B: Restore from snapshot dump
pg_restore -h [STAGING_HOST] -U postgres -d cinevenue_staging -v --clean "cinevenue_staging_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 4. SHARED REDIS STAGING SETUP & VERIFICATION

### Redis Requirements
* **Engine:** Redis 7.x (Cloud instance or Docker container).
* **Eviction Policy:** `volatile-ttl` or `noeviction` (Never use `allkeys-lru` for seat-locking).
* **Production / Staging Guard:** The application validator strictly rejects `localhost` or `127.0.0.1` when `NODE_ENV=production`. `REDIS_URL` must point to an external shared Redis instance.

### Windows PowerShell Redis Verification Commands
```powershell
# Test Redis connectivity from Windows:
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
```

---

## 5. COMPLETE WINDOWS POWERSHELL DEPLOYMENT RUNBOOK

Follow this sequential checklist to deploy and verify staging on Windows:

### Step 1: Local Build & Test Validation (Safe Local Execution)
```powershell
# Run in PowerShell from workspace root:
npm run vercel-build
npm test
```
*Expected: 0 build errors, 101/101 canonical tests passing.*

### Step 2: Apply Database Schema to Staging
```powershell
# Set temporary connection string and deploy Prisma schema:
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"
npx prisma migrate deploy

# Clear session variable:
Remove-Item env:DATABASE_URL
```

### Step 3: Trigger Vercel Preview Deployment
```powershell
# Method A: Via Vercel CLI (Generates isolated preview URL without touching production):
npx vercel

# Method B: Via Git (Push staging branch to remote repository):
# git push origin staging
# Vercel Git integration will automatically build and deploy to a preview URL.
```

### Step 4: Verify Health & Readiness Endpoints
Once the preview URL is generated (e.g. `https://staging.cinevenue.com`):
```powershell
# Test Liveness Probe (HTTP 200):
Invoke-RestMethod -Uri "https://staging.cinevenue.com/health" -Method Get

# Test Readiness Probe (HTTP 200, DB & Cache connected):
Invoke-RestMethod -Uri "https://staging.cinevenue.com/api/v1/ready" -Method Get
```

### Step 5: Execute Automated Staging Smoke Test
```powershell
# Run smoke-test runner against staging preview URL:
$env:STAGING_URL = "https://staging.cinevenue.com"
npx tsx scripts/staging_smoke_test.ts

# Clear session variable:
Remove-Item env:STAGING_URL
```
