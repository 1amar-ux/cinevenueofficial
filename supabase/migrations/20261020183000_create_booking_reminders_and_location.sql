-- Migration: 20261020183000_create_booking_reminders_and_location.sql
-- Purpose: Add verified venue geographic coordinates, complete address, and smart booking reminder delivery logs
-- Safety: Non-destructive, idempotent column and table additions. Existing records are unaffected.

-- 1. Add coordinates and verified addresses to Theatre table if not already present
ALTER TABLE "Theatre" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Theatre" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 2. Add coordinates and verified addresses to Event table if not already present
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "venue_address" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 3. Add theatre venue address snapshot to Booking table for offline ticket verification
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "theatre_address" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "theatre_latitude" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "theatre_longitude" DOUBLE PRECISION;

-- 4. Notification Delivery Logs Table
CREATE TABLE IF NOT EXISTS "NotificationDeliveryLog" (
  "id" TEXT PRIMARY KEY,
  "booking_id" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'MOVIE', -- MOVIE or EVENT
  "title" TEXT NOT NULL,
  "venue_name" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "interval" TEXT NOT NULL, -- 24h, 3h, 1h, 15m
  "channel" TEXT NOT NULL DEFAULT 'PUSH_AND_INAPP',
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, DELIVERED, CANCELLED, SKIPPED
  "scheduled_for" TIMESTAMPTZ NOT NULL,
  "dispatched_at" TIMESTAMPTZ,
  "details" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "NotificationDeliveryLog_booking_id_idx" ON "NotificationDeliveryLog"("booking_id");
CREATE INDEX IF NOT EXISTS "NotificationDeliveryLog_status_idx" ON "NotificationDeliveryLog"("status");
CREATE INDEX IF NOT EXISTS "NotificationDeliveryLog_scheduled_for_idx" ON "NotificationDeliveryLog"("scheduled_for");

COMMENT ON TABLE "NotificationDeliveryLog" IS 'Stores automated 24h, 3h, 1h, 15m booking reminder logs with venue navigation details';

-- ==========================================
-- ROLLBACK PLAN (Execute only if rolling back):
-- DROP TABLE IF EXISTS "NotificationDeliveryLog";
-- ALTER TABLE "Booking" DROP COLUMN IF EXISTS "theatre_address", DROP COLUMN IF EXISTS "theatre_latitude", DROP COLUMN IF EXISTS "theatre_longitude";
-- ALTER TABLE "Event" DROP COLUMN IF EXISTS "venue_address", DROP COLUMN IF EXISTS "latitude", DROP COLUMN IF EXISTS "longitude";
-- ALTER TABLE "Theatre" DROP COLUMN IF EXISTS "latitude", DROP COLUMN IF EXISTS "longitude";
-- ==========================================
