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
- [x] Establish canonical `server/` directory structure
- [x] Create `server/app.ts` (Express app, middleware, routes, error handling)
- [x] Create `server/server.ts` (HTTP server startup, graceful shutdown, health/readiness)
- [x] Separate Vite dev/SSR integration cleanly from the core API engine
- [x] Create centralized environment configuration (`server/config/env.ts`)
- [x] Create structured logging and request ID middleware (`server/shared/logger/`, `server/middleware/requestId.ts`)
- [x] Create centralized error handling classes and middleware (`server/shared/errors/`, `server/middleware/errorHandler.ts`)
- [x] Create schema validation middleware with Zod (`server/middleware/validate.ts`)

## 3. Database Architecture (PostgreSQL + Prisma)
- [x] Expand and normalize `prisma/schema.prisma` with all domain models
- [x] Add proper PostgreSQL Decimal types for all monetary fields
- [x] Add compound & single indexes, foreign keys, and unique constraints
- [x] Establish true Prisma singleton with connection pooling (`server/config/database.ts`)
- [x] Bridge `src/lib/prisma.ts` to use real Prisma client with development resilience

## 4. Authentication & RBAC Foundation
- [x] Remove all hardcoded credentials from frontend and backend (`superadmin@cinevenue.com`, `Amarnath123`)
- [x] Implement password hashing with `bcrypt` (12 rounds)
- [x] Implement JWT access (short-lived) and refresh token generation/verification
- [x] Implement authentication middleware (`server/middleware/auth.ts`)
- [x] Implement role-based authorization middleware (`server/middleware/authorize.ts`) with roles: `SUPER_ADMIN`, `ADMIN`, `THEATRE_ADMIN`, `EVENT_ORGANIZER`, `CUSTOMER`
- [x] Implement Auth module (`server/modules/auth/`) with endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET  /api/v1/auth/me`
  - `POST /api/v1/auth/forgot-password` (ownership verification flow)
  - `POST /api/v1/auth/reset-password`

## 5. Domain Modules & API Versioning (`/api/v1`)
- [x] Create `server/routes.ts` mounted under `/api/v1`
- [x] **Users Module** (`server/modules/users/`)
- [x] **Movies Module** (`server/modules/movies/`)
- [x] **Theatres Module** (`server/modules/theatres/`)
- [x] **Screens & Seats Module** (`server/modules/screens/`, `server/modules/seats/`)
- [x] **Shows Module** (`server/modules/shows/`)
- [x] **Bookings Module** (`server/modules/bookings/`) - with server-side pricing integrity
- [x] **Payments Module** (`server/modules/payments/`) - Dual Gateways:
  - Razorpay order creation & signature verification
  - **Cashfree Payments PG (v2023-08-01)**: order generation, authoritative verification, timing-safe HMAC-SHA256 webhooks, and sandbox fallback
- [x] **Settlements Module** (`server/modules/settlements/`)
- [x] **CineCoins Module** (`server/modules/cinecoins/`)
- [x] **Events Module** (`server/modules/events/`)
- [x] **Film Marketplace Module** (`server/modules/marketplace/`)
- [x] **24-Hour Live Advertising Module** (`server/modules/advertising/`)
- [x] **Admin Module** (`server/modules/admin/`) - protected by RBAC
- [x] **Health & Readiness Endpoints** (`/health`, `/ready`)

## 6. Redis & Distributed Infrastructure Abstraction
- [x] Create Redis configuration with safe fallback/fail-safe interface (`server/config/redis.ts`)
- [x] Establish seat lock service interface for distributed locking

## 7. Frontend API Client & State Migration
- [x] Establish centralized frontend API client (`src/services/apiClient.ts`) with JWT interceptors & token refresh
- [x] Update frontend Auth modal & login/register to use real `/api/v1/auth` endpoints
- [x] Integrate dual checkout (Cashfree + Razorpay) in BookingModal, EventBookingModal, and LiveBannerBookingWizard
- [x] Keep UI preferences in `localStorage` while removing authoritative business data

## 8. Legacy Code Classification & Cleanup
- [x] Deprecate legacy monolithic `backend/server.js` and redundant scrap scripts
- [x] Remove duplicate `src/App2.tsx`
- [x] Update build scripts in `package.json` to target canonical `server/server.ts`

## 9. Testing & Quality Verification
- [x] Establish test infrastructure (`tests/unit/`, `tests/runner.ts`)
- [x] Unit tests for Auth, RBAC, Sub-website Gatekeeper, Centralized Maintenance, and Cashfree Gateway
- [x] Run `npm run build` (14,483 modules + server bundle) and automated tests (22/22 passed)
- [x] Document Cashfree integration & architectural verification
