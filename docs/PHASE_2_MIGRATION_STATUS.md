# CineVenue Phase 2 Migration Status Tracker

This document tracks every Phase 2 task for Backend Architecture & System Unification.

Legend:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[-]` Intentionally deferred

---

## 1. Repository Discovery & Planning
- [x] Full codebase audit and inventory
- [x] Initial Phase 2 architecture design document (`docs/PHASE_2_ARCHITECTURE.md`)
- [x] Dependency & package audit

## 2. Canonical Server & Backend Architecture
- [~] Establish canonical `server/` directory structure
- [ ] Create `server/app.ts` (Express app, middleware, routes, error handling)
- [ ] Create `server/server.ts` (HTTP server startup, graceful shutdown, health/readiness)
- [ ] Separate Vite dev/SSR integration cleanly from the core API engine
- [ ] Create centralized environment configuration (`server/config/env.ts`)
- [ ] Create structured logging and request ID middleware (`server/shared/logger/`, `server/middleware/requestId.ts`)
- [ ] Create centralized error handling classes and middleware (`server/shared/errors/`, `server/middleware/errorHandler.ts`)
- [ ] Create schema validation middleware with Zod (`server/middleware/validate.ts`)

## 3. Database Architecture (PostgreSQL + Prisma)
- [ ] Expand and normalize `prisma/schema.prisma` with all domain models
- [ ] Add proper PostgreSQL Decimal types for all monetary fields
- [ ] Add compound & single indexes, foreign keys, and unique constraints
- [ ] Establish true Prisma singleton with connection pooling (`server/config/database.ts`)
- [ ] Bridge `src/lib/prisma.ts` to use real Prisma client with development resilience

## 4. Authentication & RBAC Foundation
- [ ] Remove all hardcoded credentials from frontend and backend (`superadmin@cinevenue.com`, `Amarnath123`)
- [ ] Implement password hashing with `bcrypt` (12 rounds)
- [ ] Implement JWT access (short-lived) and refresh token generation/verification
- [ ] Implement authentication middleware (`server/middleware/auth.ts`)
- [ ] Implement role-based authorization middleware (`server/middleware/authorize.ts`) with roles: `SUPER_ADMIN`, `ADMIN`, `THEATRE_ADMIN`, `EVENT_ORGANIZER`, `CUSTOMER`
- [ ] Implement Auth module (`server/modules/auth/`) with endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET  /api/v1/auth/me`
  - `POST /api/v1/auth/forgot-password` (ownership verification flow)
  - `POST /api/v1/auth/reset-password`

## 5. Domain Modules & API Versioning (`/api/v1`)
- [ ] Create `server/routes.ts` mounted under `/api/v1`
- [ ] **Users Module** (`server/modules/users/`)
- [ ] **Movies Module** (`server/modules/movies/`)
- [ ] **Theatres Module** (`server/modules/theatres/`)
- [ ] **Screens & Seats Module** (`server/modules/screens/`, `server/modules/seats/`)
- [ ] **Shows Module** (`server/modules/shows/`)
- [ ] **Bookings Module** (`server/modules/bookings/`) - with server-side pricing integrity
- [ ] **Payments Module** (`server/modules/payments/`) - architectural boundaries (Razorpay provider)
- [ ] **Settlements Module** (`server/modules/settlements/`)
- [ ] **CineCoins Module** (`server/modules/cinecoins/`)
- [ ] **Events Module** (`server/modules/events/`)
- [ ] **Film Marketplace Module** (`server/modules/marketplace/`)
- [ ] **Admin Module** (`server/modules/admin/`) - protected by RBAC
- [ ] **Health & Readiness Endpoints** (`/health`, `/ready`)

## 6. Redis & Distributed Infrastructure Abstraction
- [ ] Create Redis configuration with safe fallback/fail-safe interface (`server/config/redis.ts`)
- [ ] Establish seat lock service interface for distributed locking

## 7. Frontend API Client & State Migration
- [ ] Establish centralized frontend API client (`src/services/apiClient.ts`) with JWT interceptors & token refresh
- [ ] Update frontend Auth modal & login/register to use real `/api/v1/auth` endpoints
- [ ] Migrate core movie, theatre, show, and booking data fetching from `localStorage` to API client
- [ ] Keep UI preferences in `localStorage` while removing authoritative business data

## 8. Legacy Code Classification & Cleanup
- [ ] Classify and deprecate legacy `backend/server.js` and redundant scripts
- [ ] Remove duplicate `src/App2.tsx`
- [ ] Update build scripts in `package.json` to target canonical `server/server.ts`

## 9. Testing & Quality Verification
- [ ] Establish test infrastructure (`tests/unit/`, `tests/integration/`)
- [ ] Add unit tests for Auth, RBAC, Validation, Error handling, and Health checks
- [ ] Run `npm run build`, `tsc --noEmit`, and verification test suite
- [ ] Generate comprehensive final documentation (`docs/PHASE_2_FINAL_REPORT.md`)
