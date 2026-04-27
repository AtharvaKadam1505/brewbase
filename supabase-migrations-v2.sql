-- ============================================
-- BrewBase — Feature Migrations v2
-- Run in Supabase SQL Editor AFTER previous migrations
-- ============================================

-- ─────────────────────────────────────────────
-- FEATURE 1: MONTHLY GOAL
-- Add goal columns to users table
-- ─────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS goal_amount    INTEGER DEFAULT NULL,  -- monthly goal in paise
  ADD COLUMN IF NOT EXISTS goal_label     TEXT    DEFAULT NULL,  -- e.g. "Help me buy a new mic"
  ADD COLUMN IF NOT EXISTS thank_you_msg  TEXT    DEFAULT NULL;  -- shown after payment

-- ─────────────────────────────────────────────
-- FEATURE 3: POSTS TABLE (already in schema but ensure it exists)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT true,
  cover_url   TEXT DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_creator_id   ON posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at   ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_public    ON posts(is_public);

-- RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read public posts
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (is_public = true);

-- Service role can do everything
CREATE POLICY "posts_service_all"
  ON posts FOR ALL
  USING (true)
  WITH CHECK (true);
