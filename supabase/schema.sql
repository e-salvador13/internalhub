-- InternalHub Database Schema
-- Run this in Supabase SQL Editor

-- ===================
-- WAITLIST (Phase 1)
-- ===================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable RLS (but allow service key to bypass)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ===================
-- WORKSPACES (Phase 2)
-- ===================

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,  -- e.g., "acme.com"
  google_workspace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_domain ON workspaces(domain);

-- ===================
-- USERS (Phase 2)
-- ===================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);

-- ===================
-- APPS (Phase 3)
-- ===================

CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,  -- URL slug
  name TEXT NOT NULL,
  description TEXT,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  creator_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  storage_path TEXT,  -- Path in Supabase Storage
  github_repo TEXT,   -- Optional GitHub connection
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  UNIQUE(workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_apps_workspace ON apps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_apps_creator ON apps(creator_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);

-- ===================
-- STARS (Phase 4)
-- ===================

CREATE TABLE IF NOT EXISTS stars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  app_id UUID NOT NULL REFERENCES apps(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_stars_user ON stars(user_id);
CREATE INDEX IF NOT EXISTS idx_stars_app ON stars(app_id);

-- ===================
-- APP VIEWS (Phase 6 - Analytics)
-- ===================

CREATE TABLE IF NOT EXISTS app_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id),
  user_id UUID REFERENCES users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_views_app ON app_views(app_id);
CREATE INDEX IF NOT EXISTS idx_app_views_date ON app_views(viewed_at);

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workspaces
CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for apps
CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
