-- Migration: 20261018170000_add_theatre_id_to_users.sql
-- Purpose: Support theatre-level tenant isolation for Theatre Admins and Managers
-- Safety: Non-destructive, nullable column addition with index. Existing user records are unaffected.

-- Forward Migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "theatreId" TEXT;

CREATE INDEX IF NOT EXISTS "User_theatreId_idx" ON "User"("theatreId");

COMMENT ON COLUMN "User"."theatreId" IS 'Assigned cinema theatre venue ID for THEATRE_ADMIN and THEATRE_MANAGER roles to enforce multi-tenant isolation';

-- ==========================================
-- ROLLBACK PLAN (Execute only if rolling back):
-- DROP INDEX IF EXISTS "User_theatreId_idx";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "theatreId";
-- ==========================================
