# CINEVENUE — STAGING DEPLOYMENT RUNBOOK & ARCHITECTURE GUIDE

**Document Version:** 1.0.0  
**Target Architecture:** Multi-Tier Web & API Deployment (Vercel Serverless + Node Express / Cloud Run)  
**Security Standard:** Zero-Mock, Fail-Closed, Strict Sandbox  
**Last Verified:** November 9, 2026  

---

## 1. ARCHITECTURAL DEPLOYMENT TOPOLOGY

CineVenue is designed to support two production-ready deployment topologies:

```mermaid
graph TD
    Client["Client Devices (Web Browser / Android / iOS)"] --> Cloudflare["Cloudflare / DNS & Edge CDN"]
    
    subgraph Staging_Deployment_Options["Staging Deployment Targets"]
        Cloudflare -->|Route: /api/* & /health| VercelAPI["Option A: Vercel Serverless (api/index.js)"]
        Cloudflare -->|Route: /* (Static Assets)| VercelSPA["Vercel SPA (dist/)"]
        
        Cloudflare -.->|Alternative Route: /api/*| ExpressNode["Option B: Dedicated Node Express (dist-server/server.cjs)"]
    end
    
    VercelAPI --> PostgreSQL[("PostgreSQL 15+ (Direct TCP Connection)")]
    ExpressNode --> PostgreSQL
    
    VercelAPI --> Redis[("Shared Redis 7.x Cluster (Distributed Seat Locks)")]
    ExpressNode --> Redis
    
    VercelAPI --> SandboxGateways["Sandbox Gateways (Razorpay TEST / Cashfree TEST)"]
    ExpressNode --> SandboxGateways
```

---

## 2. STAGING INFRASTRUCTURE PROVISIONING

### A. PostgreSQL Staging Database
1. **Engine:** PostgreSQL 15.x or 16.x (AWS RDS, Neon, Supabase, or Railway).
2. **Configuration Settings:**
   * `max_connections`: $\ge 50$
   * `statement_timeout`: `30000` (30 seconds)
   * `idle_in_transaction_session_timeout`: `15000` (15 seconds to prevent hung transactions)
3. **Database Migration Deployment:**
   Run Prisma schema migrations directly against staging:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public" npx prisma migrate deploy
   ```
4. **Seed Baseline Entities:**
   Populate initial sample movies, theatres, and pricing tiers:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[STAGING_HOST]:5432/cinevenue_staging?schema=public" npx tsx prisma/seed.ts
   ```

### B. Shared Redis Staging Instance
1. **Engine:** Redis 7.x (Redis Cloud, Upstash, or AWS ElastiCache).
2. **Network Security:** Must be accessible over TLS (`rediss://`) or private VPC peering from both Vercel and Node backends.
3. **Capacity:** 256MB to 1GB RAM is sufficient for staging (handles ~500,000 active 10-minute seat locks).
4. **Eviction Policy:** `volatile-ttl` or `noeviction` (Critical: never use `allkeys-lru` for seat locks, as lock eviction before TTL would create double-booking race conditions).
5. **Connectivity Verification:**
   ```bash
   redis-cli -u "redis://:[PASSWORD]@[STAGING_REDIS_HOST]:6379" ping
   # Output must be: PONG
   ```

---

## 3. VERIFIED HEALTH & READINESS ENDPOINTS

The CineVenue codebase provides three distinct health check endpoints. Use these for load balancer health checks and CI/CD deployment gates:

### 1. Liveness Probe: `GET /health`
* **Source:** Implemented in [`server/app.ts`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/server/app.ts#L71) and [`server/routes.ts`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/server/routes.ts#L57-L64).
* **Vercel Rewrite:** Rewritten via [`vercel.json`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/vercel.json#L18-L20) to `/api/index.js`.
* **Expected Response (HTTP 200):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-09T08:15:00.000Z",
    "service": "CineVenue Canonical API",
    "version": "2.0.0"
  }
  ```

### 2. Readiness Probe: `GET /api/v1/ready`
* **Source:** Implemented in [`server/routes.ts`](file:///c:/Users/amani/OneDrive/Desktop/cinevenuefinal/server/routes.ts#L66-L78).
* **Logic:** Dynamically tests live PostgreSQL database connection via `prisma.$queryRaw` AND Redis ping via `redis.isHealthy()`.
* **Expected Response when Fully Operational (HTTP 200):**
  ```json
  {
    "status": "ready",
    "checks": {
      "database": "connected",
      "cache": "connected"
    }
  }
  ```
* **Degraded Response if Database or Redis is Down (HTTP 503):**
  ```json
  {
    "status": "degraded",
    "checks": {
      "database": "connected",
      "cache": "alert"
    }
  }
  ```

---

## 4. DEPLOYMENT SEQUENCE — STEP-BY-STEP

### Option A: Vercel Full-Stack Deployment (Recommended)
1. **Step 1 — Local Build & Verification:**
   ```bash
   npm run vercel-build
   npm test
   ```
2. **Step 2 — Configure Environment Variables in Vercel:**
   In Vercel Project Dashboard -> Settings -> Environment Variables, add all variables from [`CINEVENUE_STAGING_ENVIRONMENT_CHECKLIST.md`](file:///c:/Users/amani/.gemini/antigravity/brain/25abbfc5-3d3b-4a75-a6f3-71adefdaccd8/CINEVENUE_STAGING_ENVIRONMENT_CHECKLIST.md) targeting the **Preview** and **Production** environments.
3. **Step 3 — Deploy to Staging Alias:**
   ```bash
   vercel --prod --name cinevenue-staging
   ```
4. **Step 4 — Probe Deployment Health:**
   ```bash
   curl -i https://staging.cinevenue.com/health
   curl -i https://staging.cinevenue.com/api/v1/ready
   ```

---

### Option B: Containerized Docker / Node Express Backend
1. **Step 1 — Docker Build:**
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json prisma ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate && npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/dist-server ./dist-server
   COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
   EXPOSE 5000
   CMD ["node", "dist-server/server.cjs"]
   ```
2. **Step 2 — Launch Staging Container:**
   ```bash
   docker build -t cinevenue-staging:latest .
   docker run -d --name cinevenue-staging \
     -p 5000:5000 \
     --env-file .env.staging \
     cinevenue-staging:latest
   ```
3. **Step 3 — Verify Readiness:**
   ```bash
   curl -s http://localhost:5000/api/v1/ready | jq
   ```

---

## 5. INCIDENT RESPONSE & ZERO-DOWNTIME ROLLBACK RUNBOOK

If any staging health probe fails or a critical regression is discovered during testing:

### Scenario 1: Vercel Instant Rollback
1. Open Vercel Project -> Deployments.
2. Locate the previous operational staging deployment.
3. Click **...** -> **Promote to Production** (or use CLI: `vercel rollback [deployment-id]`).
4. Instant DNS switch completes in $< 5$ seconds without re-building.

### Scenario 2: Database Migration Rollback
If a newly applied migration causes query failures:
1. Revert schema changes locally.
2. Mark migration as rolled back in Prisma:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate resolve --rolled-back [migration_directory_name]
   ```

### Scenario 3: Redis Distributed Lock Purge
If a test run leaves abandoned test seat locks:
```bash
# Connect to Redis CLI and flush database (STAGING ONLY)
redis-cli -u $REDIS_URL FLUSHDB
```
