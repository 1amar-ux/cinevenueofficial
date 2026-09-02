# CineVenue Phase 2 Architecture & System Unification Design Document

## 1. Executive Summary & Purpose
This document outlines the architectural transformation of **CineVenue** from a prototype with split backends and client-side `localStorage` persistence into a unified, production-grade enterprise backend.

### Core Goals:
1. **One Primary Backend**: Establish a single canonical Express application under `server/` with clear layers (Routing -> Validation -> Authentication/RBAC -> Controller -> Service -> Persistence).
2. **One Authoritative Database**: Migrate persistence from ephemeral in-memory arrays and client-side storage to PostgreSQL accessed via Prisma ORM with strict Decimal precision for all monetary fields.
3. **Enterprise Security & Authentication**: Eliminate hardcoded passwords, enforce bcrypt password hashing (12 salt rounds), sign cryptographic JWT access/refresh tokens, and guard routes with backend RBAC.
4. **Resilient Domain Modularity**: Organize the backend into decoupled domain modules (`auth`, `users`, `movies`, `theatres`, `shows`, `bookings`, `payments`, `settlements`, `cinecoins`, `events`, `marketplace`, `admin`).
5. **Preserved Frontend UX**: Retain the complete luxury dark-mode visual interface, routing, and user experience while systematically redirecting data operations to the unified `/api/v1` API.

---

## 2. Target System Architecture

```text
                    ┌───────────────────────────────────┐
                    │     CineVenue React Frontend      │
                    │        (Vite + TypeScript)        │
                    └─────────────────┬─────────────────┘
                                      │
                                 HTTPS / REST
                                 (/api/v1/*)
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │      Canonical Express Server     │
                    │         (server/app.ts)           │
                    │                                   │
                    │  ├── Middleware Pipeline          │
                    │  │   ├── CORS, Helmet, RequestID  │
                    │  │   ├── Structured Logging       │
                    │  │   ├── Rate Limiting            │
                    │  │   ├── Zod Validation           │
                    │  │   ├── JWT Auth & RBAC Guard    │
                    │  │   └── Central Error Handler    │
                    │  │                                │
                    │  └── Modular Routes (/api/v1)     │
                    │      ├── /auth                    │
                    │      ├── /users                   │
                    │      ├── /movies                  │
                    │      ├── /theatres                │
                    │      ├── /shows                   │
                    │      ├── /bookings                │
                    │      ├── /payments                │
                    │      ├── /settlements             │
                    │      ├── /cinecoins               │
                    │      ├── /events                  │
                    │      ├── /marketplace             │
                    │      └── /admin                   │
                    └─────────────────┬─────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                      ▼                               ▼
            ┌───────────────────┐           ┌───────────────────┐
            │   Domain Services │           │  Redis Provider   │
            │  (Business Logic) │           │ (Distributed Lock │
            └─────────┬─────────┘           │  Cache / Sessions)│
                      │                     └───────────────────┘
                      ▼
            ┌───────────────────┐
            │    Prisma ORM     │
            │ (Connection Pool) │
            └─────────┬─────────┘
                      │
                      ▼
            ┌───────────────────┐
            │ PostgreSQL Server │
            │ (ACID Multi-Table)│
            └───────────────────┘
```

---

## 3. Directory Structure & Organization

```text
server/
├── app.ts                 # Express app initialization, middleware, routes mounting
├── server.ts              # Server lifecycle, HTTP listener, DB connection check, graceful shutdown
│
├── config/
│   ├── env.ts             # Strongly-typed environment configuration & validation
│   ├── database.ts        # Prisma client singleton with connection pooling & logging
│   └── redis.ts           # Redis client abstraction with fail-safe memory fallback
│
├── middleware/
│   ├── auth.ts            # JWT verification & token extraction middleware
│   ├── authorize.ts       # Role-based access control (RBAC) guard
│   ├── errorHandler.ts    # Centralized error mapping and formatting
│   ├── requestId.ts       # Correlation ID injection for distributed tracing
│   ├── rateLimit.ts       # Route rate limiters for auth and sensitive APIs
│   └── validate.ts        # Zod schema validation middleware (body, query, params)
│
├── modules/
│   ├── auth/              # Registration, Login, Token Refresh, Password Recovery
│   ├── users/             # Profile management, customer settings
│   ├── movies/            # Movie catalog, details, categories, spotlights
│   ├── theatres/          # Theatres, screens, seating layouts, bank accounts
│   ├── shows/             # Showtimes, screen assignments, seat availability
│   ├── bookings/          # Atomic booking creation, seat reservations, cancellation
│   ├── payments/          # Razorpay order generation, signature verification, refunds
│   ├── settlements/       # Theatre payout calculations, financial reconciliations
│   ├── cinecoins/         # Loyalty wallet, reward rules, earn/redeem transactions
│   ├── events/            # Event creation, ticketing, registrations, attendee rosters
│   ├── marketplace/       # Film production crafts, casting calls, project bids
│   ├── notifications/     # Notification dispatchers (Email/SMS/WhatsApp abstractions)
│   └── admin/             # Global platform switches, fee configurations, audit logs
│
├── shared/
│   ├── errors/            # AppError, UnauthorizedError, ValidationError, NotFoundError
│   ├── types/             # Common TypeScript interfaces & enums
│   ├── constants/         # System constants & error codes
│   ├── utils/             # Helper utilities (crypto, math, formatting)
│   └── logger/            # Structured logging utility with correlation tracking
│
└── routes.ts              # Aggregated v1 router mounting all domain modules
```

---

## 4. Database Architecture (PostgreSQL + Prisma)

### Key Model Entities:
1. **User & Identity**: `User`, `RefreshToken`, `PasswordResetToken`, `Profile`
2. **Cinema & Facilities**: `Theatre`, `TheatreBankAccount`, `Screen`, `Seat`
3. **Showtimes & Real-time Inventory**: `Show`, `ShowSeat`
4. **Transactional Records**: `Booking`, `BookingItem`, `Payment`, `Refund`, `Ticket`
5. **Financial Operations**: `Settlement`, `SettlementItem`, `FeeRule`, `TaxRule`, `DiscountRule`, `FinancialAuditLog`
6. **Loyalty System**: `CineCoinWallet`, `CineCoinTransaction`, `CineCoinRewardRule`
7. **Events Portal**: `Event`, `EventTicketType`, `EventRegistration`, `EventPass`, `EventMessage`
8. **Film Production**: `FilmProject`, `CastingCall`, `JobApplication`, `ProductionRequirement`, `TalentProfile`
9. **System Controls**: `PlatformSetting`, `MaintenanceSetting`

### Financial Integrity Standards:
- All monetary values (`ticketAmount`, `platformFee`, `convenienceFee`, `taxAmount`, `discountAmount`, `gatewayFee`, `totalAmount`, `grossSales`, `commission`, `netAmount`) use PostgreSQL `Decimal(12, 2)` or `Decimal(10, 2)`. Floating-point numbers are strictly forbidden for pricing logic.
- Atomic transactions use Prisma's `$transaction` pipeline to guarantee ACID consistency across bookings, payments, and seat updates.

---

## 5. Authentication & RBAC Strategy

### User Roles:
- `SUPER_ADMIN`: Full system access, platform settings, financial fee configs, admin management.
- `ADMIN`: Platform operations, content curation, movie/event management.
- `THEATRE_ADMIN`: Scoped to manage assigned theatres, screens, schedules, and view payouts.
- `EVENT_ORGANIZER`: Scoped to manage hosted events, ticket tiers, and view attendee lists.
- `CUSTOMER`: Standard end-user booking movie and event tickets.

### Token Lifecycle:
- **Access Token**: Short-lived JWT (15-60 minutes) containing `userId`, `email`, and `role`. Signed with `JWT_ACCESS_SECRET`.
- **Refresh Token**: Long-lived token (7 days) stored securely in the database with rotation on use.
- **Passwords**: Hashed with `bcrypt` (12 salt rounds). Plaintext passwords in frontend state and hardcoded strings are completely eradicated.

---

## 6. Legacy Systems Migration Plan

| Legacy Component | Target Unified Replacement | Migration Status |
|---|---|---|
| Monolithic [server.ts](file:///d:/cinevenuefinal/server.ts) (~4,900 lines) | Modular `server/` app + domain modules under `server/modules/*` | Migrating in Phase 2 |
| Legacy [backend/server.js](file:///d:/cinevenuefinal/backend/server.js) + Mongoose | Unified Express + Prisma PostgreSQL backend | Deprecated; replacing |
| In-memory [src/lib/prisma.ts](file:///d:/cinevenuefinal/src/lib/prisma.ts) stub | Real `@prisma/client` singleton (`server/config/database.ts`) | Upgrading to real Prisma |
| Frontend `localStorage` authoritative data | Centralized `apiClient.ts` querying `/api/v1/*` | Transitioning core models |
| Mock Auth (`mock-jwt-token-xyz-12345`) | Real bcrypt + JWT Auth (`server/modules/auth/`) | Replacing with real Auth |
| Duplicate [src/App2.tsx](file:///d:/cinevenuefinal/src/App2.tsx) | Single canonical [src/App.tsx](file:///d:/cinevenuefinal/src/App.tsx) | Removed duplicate |
| 48 Scrap scripts in root (`fix_*.py`, etc.) | Clean npm scripts and modular architecture | Deprecating |

---

## 7. Rollback & Safety Strategy
- The existing frontend UI components remain untouched in structure and styling.
- The dev server configuration preserves full HMR and client compatibility during the migration.
