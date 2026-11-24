# CINEVENUE — STAGING DATABASE SPECIFICATION & AUDIT REPORT

**Database Engine:** PostgreSQL 15+  
**ORM Layer:** Prisma ORM 5.22.0 (`prisma/schema.prisma`)  
**Target Staging Database:** `cinevenue_staging`  
**Operational Status:** **BLOCKED — INFRASTRUCTURE REQUIRED (Awaiting Staging Instance & Credentials)**  

---

## 1. FACTUAL AUDIT FINDINGS: DATABASE CONNECTIVITY & PERSISTENCE

During local test execution, the backend logged numerous DNS resolution failures when attempting to reach the configured Supabase URL:

```text
[SupabaseProxy:MovieConvenienceFee] findMany error: TypeError: fetch failed
  [cause]: Error: getaddrinfo ENOTFOUND mpeedjoyvimegnmymweb.supabase.co
Database user create exception: [SupabaseProxy:User] create error: TypeError: fetch failed. Activating resilient user session.
```

### Accurate Accounting of Database State:
* ❌ **Real PostgreSQL Connectivity:** **NOT EXERCISED / BLOCKED.** No external database connection was established.
* ❌ **Real Database Persistence:** **NOT TESTED.** Local tests succeeded exclusively via in-memory resilient fallback stores (`server/config/*.json`).
* ❌ **Staging Database Migrations:** **NOT EXECUTED.** No DDL or migration commands were executed against any database.
* ❌ **External Database Rollback:** **NOT TESTED.** The database transaction integrity tests verified local JavaScript array error propagation and production fail-closed blocks, not real TCP socket rollback against PostgreSQL.
* 🔒 **Safety Preserved:** No connections were attempted or made to any production database.

---

## 2. DATABASE ARCHITECTURE & PROVIDER COMPATIBILITY

The CineVenue application uses Prisma Client with PostgreSQL:

* **Prisma Datasource Configuration:**
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```
* **Supported Cloud Providers:**
  1. **Supabase Pro / Dedicated:** Supported natively. `DIRECT_URL` connects to port 5432 for migrations; `DATABASE_URL` connects via transaction pooler (port 6543) or direct connection.
  2. **AWS RDS PostgreSQL (15.x):** Supported with multi-AZ or single-AZ for staging.
  3. **Neon PostgreSQL:** Supported using direct connection strings.

---

## 3. CONNECTION VARIABLE SPECIFICATIONS

The staging environment requires two distinct connection strings:

```env
# 1. Primary Runtime Connection String (Transaction-capable TCP connection)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[STAGING_POSTGRES_HOST]:5432/cinevenue_staging?schema=public&connection_limit=20&pool_timeout=10

# 2. Direct Connection String (Used for Schema Diffs & DDL operations)
DIRECT_URL=postgresql://postgres:[PASSWORD]@[STAGING_POSTGRES_HOST]:5432/cinevenue_staging?schema=public
```

### Connection Requirements:
* **Port:** 5432 (or provider-specified TCP port)
* **SSL Requirement:** `sslmode=require` (mandated for all cloud-hosted staging databases)
* **Connection Pooling:** Pool size limited to `connection_limit=20` to prevent exhausting connection limits during concurrent serverless scaling.
* **ACID Atomicity Invariant:** In production/staging mode (`NODE_ENV=production`), multi-statement `$transaction` requires a native PostgreSQL connection. In-memory proxy rollback is blocked to prevent partial ledger mutations.

---

## 4. PRISMA SCHEMA SUMMARY & ENTITY MAP

The Prisma schema defines 35 models and 14 enums covering all core domain systems:

* **Enums (14):** `UserRole`, `TheatreStatus`, `ScreenStatus`, `SeatType`, `SeatStatus`, `MovieStatus`, `ShowStatus`, `BookingStatus`, `PaymentStatus`, `PaymentMethod`, `NotificationType`, `RefundStatus`, `PricingTier`, `PlatformSettingKey`.
* **Core Models (35):**
  * **Identity & RBAC:** `User`, `Account`, `Session`, `VerificationToken`, `DeviceToken`.
  * **Theatres & Inventory:** `Theatre`, `Screen`, `Seat`, `Show`, `ShowSeat`, `PricingTierConfig`.
  * **Movies & Content:** `Movie`, `MovieFeeConfig`, `CastMember`, `Production`.
  * **Bookings & Payments:** `Booking`, `BookingItem`, `Payment`, `PaymentRefund`, `ConvenienceFee`.
  * **Entertainment Events:** `Event`, `EventCategory`, `EventShow`, `EventTicket`, `EventBooking`.
  * **Security & Audit:** `AuditLog`, `FraudRuleConfig`, `FraudAlert`, `UserReport`, `TrustScore`.
  * **Platform & Loyalty:** `PlatformSetting`, `Banner`, `Coupon`, `Review`, `SupportTicket`, `CineCoinWallet`, `CineCoinTransaction`.

---

## 5. FAIL-CLOSED PRE-MIGRATION SAFETY PROTOCOL

Before applying any schema modifications to staging:

1. **Verify Hostname Allowlist:** Confirm database hostname contains `staging` and never matches production hostnames.
2. **Mandatory Binary Backup:** Execute `pg_dump` and verify:
   * `$LASTEXITCODE -eq 0`
   * Disk path exists
   * File size > 0 bytes
3. **Dry-Run Schema Diff Generation:**
   ```powershell
   npx prisma migrate diff `
     --from-url "$env:DATABASE_URL" `
     --to-schema-datamodel prisma/schema.prisma `
     --script > staging_schema_diff.sql
   ```
4. **Destructive Statement Detection:** The script halts immediately if any of the following statements are detected:
   * `DROP TABLE`
   * `DROP COLUMN`
   * `TRUNCATE`
   * `ALTER TABLE ... DROP`
5. **No Automatic `db push`:** Schema changes require manual inspection of `staging_schema_diff.sql` and explicit operator approval.
6. **Credential Cleanup:** `DATABASE_URL` is removed from session environment via native `try ... finally` scrubber.

---

## 6. MIGRATION STATUS & MISSING PREREQUISITES

* **Current Migration Directory:** The repository does not maintain historical SQL files under `prisma/migrations/`. Schema synchronization has been managed declaratively via Prisma datamodel diffs.
* **Pending Authorization:** A live staging PostgreSQL database instance has not yet been provisioned. Once connection credentials are provided, the dry-run diff can be executed.
