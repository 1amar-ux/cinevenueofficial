# CINEVENUE — VERCEL STAGING PREVIEW DEPLOYMENT AUDIT REPORT

**Target Platform:** Vercel Preview (Branch `staging`)  
**Project Name:** `cinevenue` (or dedicated `cinevenue-staging`)  
**Deployment Entrypoint:** Serverless Function (`api/index.js`) + Static SPA (`dist/`)  
**Status Breakdown:**
* **Local Vercel Build:** **VERIFIED (Exit Code 0)**
* **GitHub Staging Branch:** **VERIFIED (Published to `origin/staging`)**
* **Vercel Preview Dashboard Configuration:** **PENDING OPERATOR INPUT (CLI Unavailable)**
* **Actual Preview Deployment:** **NOT DEPLOYED (Awaiting Dashboard Config)**

---

## 1. FACTUAL AUDIT FINDINGS: VERCEL DEPLOYMENT STATE

To maintain complete transparency:
* ✅ **Local Build Pipeline:** **VERIFIED.** The command `npm run vercel-build` succeeded locally with exit code 0.
* ⚠️ **Vercel CLI Status:** Probing `vercel --version` returned `CommandNotFoundException` (the Vercel CLI is not installed globally).
* ⚠️ **Dashboard Settings:** Web dashboard configuration (Git branch integration, domain mapping, environment variable scope) could not be verified automatically and remains **PENDING MANUAL VERIFICATION**.
* ❌ **Actual Deployment:** **NOT DEPLOYED.** No deployment to Vercel (Preview or Production) was performed during this audit.

---

## 2. VERCEL CONFIGURATION REVIEW (`vercel.json`)

The authoritative [`vercel.json`](../../vercel.json) defines the serverless and static routing rules:

```json
{
  "version": 2,
  "framework": null,
  "buildCommand": "prisma generate && vite build && esbuild server/serverless.ts --bundle --platform=node --format=esm --packages=external --outfile=api/index.js",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/health", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Route Routing Verification:
1. **API Requests (`/api/*`):** Rewritten to `/api/index.js` (Express Serverless application).
2. **Health Probes (`/health`):** Rewritten directly to `/api/index.js` for external uptime monitoring.
3. **Frontend SPA (`/*`):** Fallback rewrite to `/index.html` (Vite React Router).

---

## 3. BUILD COMMAND VERIFICATION (LOCAL EXECUTION)

The build command was tested locally:

```bash
npm run vercel-build
```

### Execution Log Summary:
* **Prisma Generation:** Generated Prisma Client v5.22.0 in 422ms.
* **Vite Production Compilation:** 14,545 modules transformed into production assets in `dist/`.
* **Serverless Bundling:** esbuild bundled `server/serverless.ts` into `api/index.js` (1,022.0 KB ESM bundle) in 69ms.
* **Exit Code:** `0` (Zero compilation errors).
* **Git Tree Cleanliness:** Working tree remained 100% clean following build verification.

---

## 4. PREVIEW VS PRODUCTION SCOPE SEPARATION

To eliminate risk to live production systems, Vercel must be configured with strict environment scoping:

| Setting | Production (`main`) | Staging Preview (`staging`) | Safety Rule |
| :--- | :--- | :--- | :--- |
| **Git Branch** | `main` | `staging` | Staging commits build exclusively as Preview deployments. |
| **Domains** | `cinevenue.com`, `www.cinevenue.com` | `staging.cinevenue.com` | Production domains must NEVER alias staging deployments. |
| **Environment Scope** | "Production" | "Preview" | Checkbox in Vercel Dashboard must be set ONLY to "Preview". |
| **Database** | Live Production PostgreSQL | Dedicated Staging PostgreSQL | Separate databases, separate credentials. |
| **Redis** | Live Production Redis | Dedicated Staging Redis | Separate clusters, separate credentials. |
| **Payments** | Live Razorpay / Cashfree | Sandbox / Test Mode | `RAZORPAY_ENV=TEST`, `CASHFREE_ENV=TEST`. |

---

## 5. DASHBOARD PRE-FLIGHT CHECKLIST (PENDING OPERATOR ACTION)

Because Vercel dashboard settings cannot be inspected locally without CLI authentication, you must verify the following in the Vercel Web Dashboard:

* [ ] **Git Branch Configuration:** In Settings → Git, confirm `main` is the Production Branch and `staging` is enabled for Preview.
* [ ] **Domain Scoping:** In Settings → Domains, ensure `cinevenue.com` is pinned to Production.
* [ ] **Environment Variables:** Verify that all 25 variables from [`staging.env.example`](staging.env.example) have been added with their scope checked **ONLY for Preview**.
* [ ] **No Production Aliases:** Confirm that automated preview deployments do not automatically assign production URLs.

---

## 6. SAFE PREVIEW DEPLOYMENT COMMANDS

Once environment variables are configured in the Vercel Dashboard, deploy using either:

### Method A: Automated Git Push (Recommended)
Pushing to the remote `staging` branch automatically triggers a Preview deployment:
```powershell
git push origin staging:staging
```

### Method B: Vercel CLI Preview Deployment
```powershell
# NEVER USE --prod FOR STAGING!
vercel
```
The standard `vercel` command (without `--prod`) deploys strictly to the Preview environment.
