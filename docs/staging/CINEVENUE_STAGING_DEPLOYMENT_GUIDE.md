# CINEVENUE — STAGING DEPLOYMENT RUNBOOK (WINDOWS POWERSHELL & VERCEL PREVIEW)

**Document Version:** 1.5.0  
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

## 2. VERCEL CONFIGURATION VERIFICATION & DASHBOARD PRE-FLIGHT GATE

### A. Items Verified Locally in Repository
The following configuration properties have been verified from the local codebase:
1. **Build Command:** Verified in [`vercel.json`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/vercel.json):
   ```json
   "buildCommand": "prisma generate && vite build && esbuild server/serverless.ts --bundle --platform=node --format=esm --packages=external --outfile=api/index.js"
   ```
2. **Output Directory:** Configured as `dist`.
3. **Serverless Function:** Entrypoint `api/index.js` with `maxDuration: 30`.
4. **Route Rewrites:**
   * `/api/(.*)` rewrites to `/api/index.js`
   * `/health` rewrites to `/api/index.js`
   * `/(.*)` rewrites to `/index.html` (SPA fallback)
5. **CORS Headers:** Configured for `/api/(.*)` with credentials and required headers.
6. **Absence of Production Aliases:** `vercel.json` contains no production domains or aliases.
7. **Local Project Linkage Status:** The `.vercel` directory is **NOT present** in the repository. Project linkage must be performed via `npx vercel link` or Vercel Git integration.

### B. Mandatory Dashboard Verification Checklist (Pending External Verification)
> [!IMPORTANT]
> Because dashboard settings cannot be verified from local files, you MUST verify the following directly in the Vercel Web Dashboard before initiating any staging deployment:
* [ ] **Project Name:** Confirm the deployment targets the intended Vercel project (`cinevenue` or `cinevenue-staging`).
* [ ] **Production Branch:** Confirm that Vercel Settings → Git specifies `main` as the sole Production Branch.
* [ ] **Preview Branch:** Confirm that branch `staging` is treated as a Preview branch.
* [ ] **Domain Scoping:** In Settings → Domains:
  - `cinevenue.com` and `www.cinevenue.com` MUST be assigned ONLY to `main` (Production).
  - `staging.cinevenue.com` MUST be assigned explicitly to branch `staging`.
  - Preview deployments must NEVER touch or alias `cinevenue.com`.
* [ ] **Environment Variable Scope:** In Settings → Environment Variables:
  - All staging variables (from [`docs/staging/staging.env.example`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/docs/staging/staging.env.example)) must have their environment checkbox set **ONLY to "Preview"**.
  - Ensure "Production" is UNCHECKED for all staging variables.

---

## 3. PRISMA SCHEMA DEPLOYMENT RISKS & SAFETY PROTOCOL

### A. Real Risks of `prisma db push` on Existing Databases
`prisma db push` is not a non-destructive command:
1. **Potential Data Loss:** If models, fields, or enums in `prisma/schema.prisma` differ from existing database columns, Prisma detects data loss and prompts for `--accept-data-loss`. If accepted, columns and tables are **permanently dropped**.
2. **Accidental Database Wipe:** Commands like `prisma db push --force-reset` completely drop the schema and recreate it, deleting all data.
3. **No Migration Ledger:** `db push` does not record applied migrations in `_prisma_migrations`, making rollbacks manual and complex.
4. **Table Locks:** Uncontrolled DDL changes during active sessions can lock tables and cause API timeouts.

### B. Non-Negotiable Safety Invariants
* ❌ **NEVER execute `npx prisma db push --accept-data-loss`** under any circumstance.
* ❌ **NEVER execute `npx prisma db push --force-reset`** on staging or production.
* ❌ **NEVER execute database reset or truncate commands.**
* ❌ **DO NOT assume `prisma db push` is non-destructive.**
* ❌ **DO NOT automatically chain schema diff inspection into schema application.** Schema application requires separate, explicit manual review and approval.
* 🔒 **DATABASE_URL MUST be cleaned up via `try ... finally` blocks** on every execution path.
* ⚠️ **A reliable schema diff cannot be generated without an active connection to the staging database.** This is documented as a **Pending External Verification**.

---

## 4. FAIL-CLOSED DATABASE BACKUP & SCHEMA-DIFF INSPECTION RUNBOOK

Follow these commands in **Windows PowerShell**:

### Step A: Pre-Change Staging Database Binary Backup (MANDATORY GATE)
```powershell
$backupFile = "cinevenue_staging_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
Write-Host "Creating pre-migration database snapshot: $backupFile..." -ForegroundColor Cyan

# Create full PostgreSQL binary snapshot dump before touching the database:
pg_dump -h [STAGING_HOST] -U postgres -d cinevenue_staging -F c -b -v -f $backupFile

# 1. Exit code validation:
if ($LASTEXITCODE -ne 0) {
    throw "🛑 FATAL: pg_dump backup failed with exit code $LASTEXITCODE. Database modification cannot proceed."
}

# 2. File existence validation:
if (-not (Test-Path $backupFile)) {
    throw "🛑 FATAL: pg_dump exited with code 0 but backup file '$backupFile' does not exist on disk."
}

# 3. Non-empty file validation:
$backupItem = Get-Item $backupFile
if ($backupItem.Length -eq 0) {
    Remove-Item $backupFile -Force -ErrorAction SilentlyContinue
    throw "🛑 FATAL: pg_dump created a 0-byte (empty) backup file. Backup snapshot is invalid. Database modification cannot proceed."
}

Write-Host "✅ Database snapshot verified: $backupFile ($($backupItem.Length) bytes)" -ForegroundColor Green
```

### Step B: Dry-Run Schema Diff Generation with `try ... finally` Credential Scrubber
```powershell
$diffFile = "staging_schema_diff.sql"
if (Test-Path $diffFile) { Remove-Item $diffFile -Force }

$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"

try {
    Write-Host "Generating dry-run schema diff..." -ForegroundColor Cyan
    npx prisma migrate diff `
      --from-url "$env:DATABASE_URL" `
      --to-schema-datamodel prisma/schema.prisma `
      --script > $diffFile

    # 1. Immediate exit code check:
    if ($LASTEXITCODE -ne 0) {
        throw "🛑 FATAL: 'prisma migrate diff' failed with exit code $LASTEXITCODE. Could not generate reliable schema diff. Aborting."
    }

    # 2. File existence validation:
    if (-not (Test-Path $diffFile)) {
        throw "🛑 FATAL: Schema diff file '$diffFile' was not created. Comparison could not be verified."
    }

    # 3. Non-empty inspection:
    $fileItem = Get-Item $diffFile
    if ($fileItem.Length -eq 0) {
        Write-Host "ℹ️ Schema diff file is 0 bytes. Target database schema has zero pending changes and matches prisma/schema.prisma." -ForegroundColor Green
        Write-Host "No schema modification needed." -ForegroundColor Green
        return
    }

    # 4. Automated Hazardous Statement Detection (Strict Failure Trap):
    $destructivePatterns = @(
        "DROP TABLE",
        "DROP COLUMN",
        "TRUNCATE",
        "ALTER COLUMN.*TYPE",
        "DROP SEQUENCE",
        "DROP INDEX",
        "DROP TYPE",
        "DROP SCHEMA",
        "CASCADE"
    )

    $detectedHazardousLines = @()
    foreach ($pattern in $destructivePatterns) {
        $matches = Select-String -Path $diffFile -Pattern $pattern
        if ($matches) {
            $detectedHazardousLines += $matches
        }
    }

    if ($detectedHazardousLines.Count -gt 0) {
        Write-Host "🛑 TERMINATING ERROR: Destructive or potentially hazardous SQL detected in '$diffFile'!" -ForegroundColor Red
        $detectedHazardousLines | ForEach-Object {
            Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
        throw "🛑 SAFETY GATE ABORT: Automated schema application is strictly forbidden when destructive SQL is detected. Never pass --accept-data-loss or --force-reset."
    }

    Write-Host "✅ Automated scan found 0 known destructive keywords." -ForegroundColor Green
    Write-Host "⚠️ MANDATORY GATE: Keyword matching alone is NOT sufficient." -ForegroundColor Yellow
    Write-Host "Open '$diffFile' and inspect every SQL statement manually before approving." -ForegroundColor Yellow

    # Display first 50 lines for inspection:
    Get-Content $diffFile | Select-Object -First 50

    # SCRIPT TERMINATES HERE. IT DOES NOT AUTOMATICALLY EXECUTE 'prisma db push'.
    Write-Host "`n==========================================================================" -ForegroundColor Cyan
    Write-Host "MANUAL REVIEW REQUIRED: Inspect '$diffFile' completely." -ForegroundColor Cyan
    Write-Host "If and ONLY if manual review confirms all statements are safe:" -ForegroundColor Cyan
    Write-Host "Execute Step C separately in a new terminal session." -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Cyan
} finally {
    # GUARANTEED CLEANUP on every execution path (throw, return, or exit)
    Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
    Write-Host "🔒 Session cleanup: DATABASE_URL successfully removed from environment." -ForegroundColor Gray
}
```

### Step C: Apply Schema to Staging (SEPARATE MANUAL STEP — ONLY After Diff Approval)
> [!IMPORTANT]
> This step MUST be executed separately and manually. It is never automatically called by the diff script.

```powershell
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"

try {
    # Apply verified additive schema:
    npx prisma db push

    if ($LASTEXITCODE -ne 0) {
        throw "🛑 FATAL: 'prisma db push' failed with exit code $LASTEXITCODE."
    }

    Write-Host "✅ Staging database schema updated successfully." -ForegroundColor Green
} finally {
    Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
    Write-Host "🔒 Session cleanup: DATABASE_URL successfully removed from environment." -ForegroundColor Gray
}
```

### Step D: Staging Database Rollback Procedure (Emergency Recovery)
```powershell
# In case of schema conflict, failure, or accidental table alteration:
pg_restore -h [STAGING_HOST] -U postgres -d cinevenue_staging -v --clean "cinevenue_staging_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 5. SHARED REDIS STAGING SETUP & VERIFICATION

### Redis Requirements
* **Engine:** Redis 7.x (External managed instance or container).
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

## 6. SMOKE-TEST HOSTNAME SAFETY & DATA LIFECYCLE

### A. Strict Staging Hostname Protection (`scripts/staging_url_validator.ts`)
The smoke test enforces strict, fail-closed target URL validation before transmitting any network packet:
* **Allowed Hosts by Default:**
  - `localhost`
  - `127.0.0.1`
  - `staging.cinevenue.com`
  - `staging-api.cinevenue.com`
* **Additional Staging Hosts:** Can only be allowed by explicit configuration via `STAGING_ALLOWED_HOSTS="your-preview-url.vercel.app"`.
* **Prohibited Hosts (Unconditional Rejection):**
  - Production domains: `cinevenue.com`, `www.cinevenue.com`, `api.cinevenue.com`, `app.cinevenue.com`, `admin.cinevenue.com`, `prod.cinevenue.com`.
  - Arbitrary subdomains of `cinevenue.com`.
  - Generic cloud wildcard domains: `*.vercel.app`, `*.railway.app`, `*.onrender.com` (rejected unless explicitly named in `STAGING_ALLOWED_HOSTS`).
  - Reserved/metadata IPs: `0.0.0.0`, `169.254.169.254`, `::`, `::1`.
  - Malformed URLs, unexpected protocols (`ftp:`, `file:`, `ws:`), and userinfo injections (`user:pass@host`).
  - External endpoints over plain `http:` (HTTPS is strictly required for non-localhost).

### B. Complete Smoke-Test Data Lifecycle & Accounting

| Operation | Entity Created | Persistence Mode | Retention Status | Cleanup Mechanism | Impact on Pre-Existing Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Liveness Probe** | None | Ephemeral in-memory | N/A | None | Zero mutation |
| **2. Readiness Probe** | None | Read-only check | N/A | None | Zero mutation |
| **3. Customer Registration** | User (`staging_smoke_<ts>_<hex>@cinevenue.test`) | Persisted in PostgreSQL `User` table | **RETAINED** | Retained (No public user delete API exists in CineVenue) | Zero (Unique test email, customer role only, zero bookings) |
| **4. Customer Login** | JWT Access & Refresh Tokens | Ephemeral client memory | Discarded on process exit | In-memory token discarded | Zero mutation |
| **5. Movie Catalog** | None | Read-only query | N/A | None | Zero mutation |
| **6. Theatre Discovery** | None | Read-only query | N/A | None | Zero mutation |
| **7. Distributed Seat Lock** | Redis lock key (`seat_smoke_<ts>_<hex>`) | Shared Redis instance | **RELEASED** | Explicit `POST /api/v1/bookings/release-seats` in `try...finally` (Fallback 600s TTL) | Zero (Targets only generated test seat ID) |
| **8. Razorpay Order** | Razorpay Sandbox Order (`order_<id>`) | Persisted in Razorpay test dashboard | **RETAINED** | Retained in gateway sandbox (Unpaid, no API delete endpoint) | Zero financial charge; expires automatically in gateway |
| **9. Cashfree Order** | Cashfree Sandbox Order (`order_<id>`) | Persisted in Cashfree test dashboard | **RETAINED** | Retained in gateway sandbox (Unpaid, no API delete endpoint) | Zero financial charge; expires automatically in gateway |
| **10. Webhook Signature Check** | Dummy unassociated payload | Rejected at HMAC layer | **ZERO RECORDS** | Cryptographic failure returns HTTP 400 before DB touch | Zero mutation |

---

## 7. COMPLETE WINDOWS POWERSHELL DEPLOYMENT RUNBOOK

Follow these commands in exact sequential order in **Windows PowerShell**:

### Step 1: Pre-Deployment Build & Test Validation (Safe Local Execution)
```powershell
# Run in PowerShell from workspace root:
npm run vercel-build
npm test
npx tsx --test tests/unit/stagingSmokeTestSafety.test.ts
```
*Expected: 0 build errors; 101/101 canonical tests passing; 24/24 smoke-safety tests passing.*

---

### Step 2: Confirm Git Remote & Branch Invariants
```powershell
# Verify remote URL is the official repository:
git remote get-url origin
# Expected: https://github.com/1amar-ux/cinevenueofficial.git

# Confirm current branch is 'staging':
git branch --show-current
# Expected: staging

# Confirm working tree is clean:
git status --short
# Expected: (Empty / nothing to commit)

# Confirm 'main' remains preserved at 22c22a9:
git rev-parse --short main
# Expected: 22c22a9
```

---

### Step 3: Push ONLY Staging Branch to Remote
```powershell
# Push staging branch to remote origin (Never touches main):
git push origin staging:staging
```

---

### Step 4: Staging Database Backup (Pre-Migration Safety Snapshot)
```powershell
# Create snapshot of staging database:
$backupFile = "cinevenue_staging_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
pg_dump -h [STAGING_HOST] -U postgres -d cinevenue_staging -F c -b -v -f $backupFile

if ($LASTEXITCODE -ne 0 -or -not (Test-Path $backupFile) -or (Get-Item $backupFile).Length -eq 0) {
    throw "🛑 FATAL: Backup validation failed. Halting."
}
```

---

### Step 5: Dry-Run Schema Diff Inspection & Manual Approval Gate
```powershell
# Execute Step B from Section 4 to generate and inspect staging_schema_diff.sql.
# Verify that 0 hazardous statements exist.
# SCRIPT HALTS FOR HUMAN APPROVAL.
```

---

### Step 6: Apply Verified Schema to Staging (Separate Manual Execution)
```powershell
# ONLY after completing manual review and sign-off in Step 5:
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20"
try {
    npx prisma db push
    if ($LASTEXITCODE -ne 0) { throw "🛑 FATAL: 'prisma db push' failed." }
} finally {
    Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
}
```

---

### Step 7: Verify Shared Staging Redis Connectivity
```powershell
$env:REDIS_URL = "redis://:[PASSWORD]@[STAGING_REDIS_HOST]:6379"

# Send ping:
redis-cli -u $env:REDIS_URL ping
# Output must be: PONG

Remove-Item env:REDIS_URL
```

---

### Step 8: Deploy Vercel Preview (Strictly Isolated)
> [!IMPORTANT]
> Confirm in Vercel Dashboard that staging variables are scoped ONLY to "Preview".
> If project is not yet linked locally, run `npx vercel link` to confirm target project.

```powershell
# Deploy as a Vercel Preview Deployment (DO NOT use --prod!):
npx vercel
```
*Vercel will output your unique preview deployment URL (e.g. `https://cinevenue-git-staging-yourteam.vercel.app`).*

---

### Step 9: Verify Health & Readiness Probes
```powershell
$PREVIEW_URL = "https://cinevenue-git-staging-yourteam.vercel.app"

# 1. Liveness check (HTTP 200 expected):
Invoke-RestMethod -Uri "$PREVIEW_URL/health" -Method Get

# 2. Database & Redis readiness check (HTTP 200 expected):
Invoke-RestMethod -Uri "$PREVIEW_URL/api/v1/ready" -Method Get
```

---

### Step 10: Run Automated Staging Smoke Test
```powershell
$env:STAGING_ALLOWED_HOSTS = "cinevenue-git-staging-yourteam.vercel.app"
$env:STAGING_URL = "https://cinevenue-git-staging-yourteam.vercel.app"

npx tsx scripts/staging_smoke_test.ts

# Clean up session variables:
Remove-Item env:STAGING_ALLOWED_HOSTS -ErrorAction SilentlyContinue
Remove-Item env:STAGING_URL -ErrorAction SilentlyContinue
```
*Expected: 10/10 checks passing or safely skipped on fresh unseeded DB, with full record accounting report.*
