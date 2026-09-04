-- =====================================================
-- Migration: 20260904130000_add_global_subwebsite_settings.sql
-- CineVenue Centralized Global Sub-Website Control System
-- =====================================================

-- 1. Alter app_settings table to add global_subwebsite_enabled and subwebsite_maintenance_message
ALTER TABLE "app_settings" 
ADD COLUMN IF NOT EXISTS "global_subwebsite_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "subwebsite_maintenance_message" TEXT DEFAULT 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.';

-- Ensure the singleton record has the values
UPDATE "app_settings"
SET "global_subwebsite_enabled" = COALESCE("global_subwebsite_enabled", TRUE),
    "subwebsite_maintenance_message" = COALESCE("subwebsite_maintenance_message", 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.')
WHERE "id" = 'global_default';

-- 2. Create website_settings compatibility table if referenced directly
CREATE TABLE IF NOT EXISTS "website_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'global_default',
    "global_subwebsite_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "subwebsite_maintenance_message" TEXT DEFAULT 'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_by" TEXT NULL
);

INSERT INTO "website_settings" (
    "id",
    "global_subwebsite_enabled",
    "subwebsite_maintenance_message",
    "updated_at",
    "updated_by"
) VALUES (
    'global_default',
    TRUE,
    'CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.',
    NOW(),
    'system_init'
) ON CONFLICT ("id") DO NOTHING;

-- Enable RLS for website_settings
ALTER TABLE "website_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read website_settings" ON "website_settings";
CREATE POLICY "Public read website_settings"
    ON "website_settings"
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Admins manage website_settings" ON "website_settings";
CREATE POLICY "Admins manage website_settings"
    ON "website_settings"
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

-- Add to Realtime replication
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "website_settings";
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
