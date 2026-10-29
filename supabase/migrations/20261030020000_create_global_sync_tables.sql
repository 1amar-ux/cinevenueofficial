-- ====================================================================
-- CINEVENUE GLOBAL SYNCHRONIZATION SYSTEM
-- Migration: 20261030020000_create_global_sync_tables.sql
-- Purpose: Persistent real-time sync across web, admin panel, and mobile apps
-- ====================================================================

-- 1. CMS Banners Table
CREATE TABLE IF NOT EXISTS public.cms_banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    clicks INTEGER DEFAULT 0,
    type VARCHAR(64) DEFAULT 'Wide Slider',
    image_url TEXT,
    link_url TEXT,
    target_audience VARCHAR(128) DEFAULT 'All Users',
    version INTEGER DEFAULT 1,
    updated_by VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_banners_active ON public.cms_banners (active, updated_at DESC);

-- 2. CMS Platform Coupons Table
CREATE TABLE IF NOT EXISTS public.cms_coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    discount NUMERIC(10, 2) NOT NULL,
    min_amount NUMERIC(10, 2) DEFAULT 0,
    expires VARCHAR(64),
    active BOOLEAN DEFAULT true,
    claims INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_coupons_code ON public.cms_coupons (code);

-- 3. CMS User Reviews Moderation Table
CREATE TABLE IF NOT EXISTS public.cms_reviews (
    id VARCHAR(64) PRIMARY KEY,
    user_email VARCHAR(128) NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    rating INTEGER DEFAULT 5,
    comment TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Approved',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_reviews_status ON public.cms_reviews (status, created_at DESC);

-- 4. Global Sync Changelog (Audit & Delta Propagation)
CREATE TABLE IF NOT EXISTS public.global_sync_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL,
    sync_version BIGINT NOT NULL,
    actor_email VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_changelog_version ON public.global_sync_changelog (sync_version DESC);
CREATE INDEX IF NOT EXISTS idx_sync_changelog_created ON public.global_sync_changelog (created_at DESC);

COMMENT ON TABLE public.cms_banners IS 'Authoritative promotional banners synchronized across web, Android, and admin sessions';
COMMENT ON TABLE public.global_sync_changelog IS 'Incremental real-time change events for cross-device state reconciliation';
