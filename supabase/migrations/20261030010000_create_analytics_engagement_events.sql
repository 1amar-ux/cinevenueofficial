-- Migration: 20261030010000_create_analytics_engagement_events.sql
-- Description: Creates the AnalyticsEngagementEvent table for tracking privacy-conscious audience engagement and funnel conversions.

CREATE TABLE IF NOT EXISTS public."AnalyticsEngagementEvent" (
    "id" TEXT PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityTitle" TEXT,
    "category" TEXT,
    "city" TEXT,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "device" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_analytics_event_type" ON public."AnalyticsEngagementEvent" ("eventType");
CREATE INDEX IF NOT EXISTS "idx_analytics_entity_type" ON public."AnalyticsEngagementEvent" ("entityType");
CREATE INDEX IF NOT EXISTS "idx_analytics_entity_id" ON public."AnalyticsEngagementEvent" ("entityId");
CREATE INDEX IF NOT EXISTS "idx_analytics_session_id" ON public."AnalyticsEngagementEvent" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_analytics_created_at" ON public."AnalyticsEngagementEvent" ("createdAt");

COMMENT ON TABLE public."AnalyticsEngagementEvent" IS 'Stores real audience engagement, funnel steps, page views, and booking interactions.';
