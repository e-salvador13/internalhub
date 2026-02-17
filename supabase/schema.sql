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

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ===================
-- USERS (Simplified - no workspace required)
-- ===================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ===================
-- APPS (Core - with access control)
-- ===================

CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  storage_path TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Access Control (the core differentiator!)
  access_type TEXT DEFAULT 'private' CHECK (access_type IN ('private', 'public', 'password', 'email_list', 'domain')),
  access_password TEXT,              -- For password-protected apps
  access_emails TEXT[],              -- For email_list access
  access_domain TEXT,                -- For domain-based access (e.g., @company.com)
  
  UNIQUE(owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_apps_owner ON apps(owner_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_access_type ON apps(access_type);

-- ===================
-- MAGIC LINK TOKENS
-- ===================

CREATE TABLE IF NOT EXISTS magic_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  app_id UUID REFERENCES apps(id),  -- Optional: which app they're trying to access
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON magic_tokens(token);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_email ON magic_tokens(email);

-- ===================
-- APP ACCESS LOG (Analytics)
-- ===================

CREATE TABLE IF NOT EXISTS app_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id),
  accessor_email TEXT,
  access_method TEXT,  -- 'public', 'password', 'magic_link', 'owner'
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_access_app ON app_access_log(app_id);
CREATE INDEX IF NOT EXISTS idx_app_access_date ON app_access_log(accessed_at);

-- ===================
-- STARS (Keep for favorites)
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
-- HELPER FUNCTIONS
-- ===================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===================
-- MIGRATION: If workspaces table exists, migrate data
-- ===================
-- Run these manually if migrating:
-- 
-- 1. Add owner_id to apps: ALTER TABLE apps ADD COLUMN owner_id UUID;
-- 2. Copy creator_id to owner_id: UPDATE apps SET owner_id = creator_id;
-- 3. Add access columns: ALTER TABLE apps ADD COLUMN access_type TEXT DEFAULT 'private';
-- 4. etc.
