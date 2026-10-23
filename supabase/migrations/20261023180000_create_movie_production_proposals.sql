-- 20261023180000_create_movie_production_proposals.sql
-- CineVenue Movie Production Proposal Form Schema

CREATE TABLE IF NOT EXISTS movie_production_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    production_type TEXT NOT NULL,
    start_date DATE,
    release_date DATE,
    language TEXT NOT NULL,
    story_concept TEXT NOT NULL,
    current_stage TEXT NOT NULL,
    estimated_budget NUMERIC,
    required_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    full_name TEXT NOT NULL,
    role_designation TEXT NOT NULL,
    production_house TEXT,
    email TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    whatsapp_number TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    website_portfolio TEXT,
    additional_requirements TEXT,
    preferred_contact_method TEXT NOT NULL DEFAULT 'Email',
    attachment_url TEXT,
    attachment_name TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    internal_notes JSONB DEFAULT '[]'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_mpp_reference_id ON movie_production_proposals(reference_id);
CREATE INDEX IF NOT EXISTS idx_mpp_status ON movie_production_proposals(status);
CREATE INDEX IF NOT EXISTS idx_mpp_email ON movie_production_proposals(email);
CREATE INDEX IF NOT EXISTS idx_mpp_created_at ON movie_production_proposals(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE movie_production_proposals ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated submission of proposals
CREATE POLICY "Allow public proposal submissions"
    ON movie_production_proposals
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow users to view their own submitted proposals (by authenticated user_id)
CREATE POLICY "Allow users to view own proposals"
    ON movie_production_proposals
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_movie_production_proposals_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mpp_updated_at ON movie_production_proposals;
CREATE TRIGGER trigger_mpp_updated_at
    BEFORE UPDATE ON movie_production_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_movie_production_proposals_modtime();
