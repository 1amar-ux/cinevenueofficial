-- =====================================================
-- Migration: 20260904120000_create_app_settings.sql
-- CineVenue Centralized Global Application Settings
-- =====================================================

-- 1. Create app_settings singleton table
CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'global_default',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT FALSE,
    "maintenance_title" TEXT DEFAULT 'Movie Booking Temporarily Unavailable',
    "maintenance_message" TEXT DEFAULT 'We are upgrading our ticket booking experience. Movie booking will be available shortly.',
    "maintenance_countdown_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "maintenance_end_time" TIMESTAMPTZ NULL,
    "service_controls" JSONB NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_by" TEXT NULL
);

-- 2. Insert the authoritative singleton row if it does not already exist
INSERT INTO "app_settings" (
    "id",
    "maintenance_mode",
    "maintenance_title",
    "maintenance_message",
    "maintenance_countdown_enabled",
    "maintenance_end_time",
    "service_controls",
    "updated_at",
    "updated_by"
) VALUES (
    'global_default',
    FALSE,
    'Movie Booking Temporarily Unavailable',
    'We are upgrading our ticket booking experience. Movie booking will be available shortly.',
    FALSE,
    NOW() + INTERVAL '2 hours',
    '{"website": {"status": true}, "movieBooking": {"status": true}, "eventBooking": {"status": true}, "filmProduction": {"status": true}, "eventManagement": {"status": true}, "brandPromotion": {"status": true}}'::jsonb,
    NOW(),
    'system_init'
) ON CONFLICT ("id") DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: All users (anonymous and authenticated) have read access
DROP POLICY IF EXISTS "Public read app_settings" ON "app_settings";
CREATE POLICY "Public read app_settings"
    ON "app_settings"
    FOR SELECT
    TO public
    USING (true);

-- 5. RLS Policy: Only authorized Super Admins and Admins can mutate global settings
DROP POLICY IF EXISTS "Admins manage app_settings" ON "app_settings";
CREATE POLICY "Admins manage app_settings"
    ON "app_settings"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User"."id" = auth.uid()
            AND "User"."role" IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- 6. Enable Realtime Replication for app_settings
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "app_settings";
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
