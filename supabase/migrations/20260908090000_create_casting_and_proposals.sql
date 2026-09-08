-- 20260908_create_casting_and_proposals.sql
-- Migration to add tables for Indian Casting Calls and Proposal Management

-- Professional profiles (talent)
create table professional_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  photo_url text,
  roles text[],
  languages text[],
  skills text[],
  experience_years integer,
  biography text,
  training text,
  filmography jsonb,
  portfolio_url text,
  showreel_url text,
  audition_material_url text,
  availability_status text default 'available',
  location text,
  privacy_settings jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Casting calls
create table casting_calls (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  created_by uuid references auth.users(id) on delete cascade,
  title text not null,
  role text not null,
  character_name text,
  description text,
  required_experience text,
  age_range text,
  language text,
  skills text[],
  location text,
  shooting_location text,
  shooting_dates jsonb,
  project_type text,
  audition_requirements text,
  audition_instructions text,
  compensation text,
  deadline date,
  openings integer,
  additional_requirements text,
  status text default 'draft', -- draft, published, paused, closed, archived
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Casting applications
create table casting_applications (
  id uuid primary key default uuid_generate_v4(),
  casting_call_id uuid references casting_calls(id) on delete cascade,
  applicant_profile_id uuid references professional_profiles(id) on delete cascade,
  applicant_user_id uuid references auth.users(id) on delete cascade,
  portfolio_url text,
  audition_material_url text,
  status text default 'applied', -- applied, under_review, shortlisted, audition, callback, selected, not_selected, withdrawn
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Auditions
create table auditions (
  id uuid primary key default uuid_generate_v4(),
  casting_application_id uuid references casting_applications(id) on delete cascade,
  type text, -- online/offline
  date timestamp with time zone,
  location text,
  instructions text,
  notes text,
  status text default 'scheduled',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Proposals
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  introduction text,
  project_description text,
  details jsonb,
  scope_of_work text,
  deliverables text,
  timeline text,
  budget numeric,
  payment_terms text,
  attachments jsonb,
  additional_notes text,
  expiry_date date,
  status text default 'draft', -- draft, sent, received, accepted, rejected, changes_requested, withdrawn, expired
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Proposal revisions (history)
create table proposal_revisions (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references proposals(id) on delete cascade,
  reviser_id uuid references auth/users(id) on delete cascade,
  changes jsonb,
  created_at timestamp with time zone default now()
);

-- Languages (admin configurable)
create table languages (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Casting categories (admin configurable)
create table casting_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Proposal types (admin configurable)
create table proposal_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default now()
);
