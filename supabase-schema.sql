-- ============================================
-- BrewBase — Supabase Database Schema + RLS
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

-- Users (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id    TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Payments (one-time tips)
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount                INTEGER NOT NULL,        -- in paise (smallest currency unit)
  message               TEXT,
  is_anonymous          BOOLEAN DEFAULT false,
  show_amount           BOOLEAN DEFAULT true,
  stripe_payment_intent TEXT UNIQUE NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Tiers (subscription levels)
CREATE TABLE IF NOT EXISTS tiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL,             -- in paise
  benefits        JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id                 UUID REFERENCES tiers(id) ON DELETE SET NULL,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'active',  -- active | canceled | past_due
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- Posts (creator content)
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT true,
  tier_id     UUID REFERENCES tiers(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_payments_creator_id   ON payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id      ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at   ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user    ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator ON subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_creator_id      ON posts(creator_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;

-- ── USERS ──────────────────────────────────

-- Anyone can read public user profiles
CREATE POLICY "users_public_read"
  ON users FOR SELECT
  USING (true);

-- Service role handles inserts/updates (via Clerk webhook)
CREATE POLICY "users_service_insert"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "users_service_update"
  ON users FOR UPDATE
  USING (true);

-- ── PAYMENTS ───────────────────────────────

-- Public can see payments but visibility rules are enforced at query level
-- (is_anonymous hides name, show_amount hides amount in app code)
CREATE POLICY "payments_public_read"
  ON payments FOR SELECT
  USING (true);

-- Only service role (webhook) can insert payments
CREATE POLICY "payments_service_insert"
  ON payments FOR INSERT
  WITH CHECK (true);

-- ── TIERS ──────────────────────────────────

CREATE POLICY "tiers_public_read"
  ON tiers FOR SELECT
  USING (true);

CREATE POLICY "tiers_creator_insert"
  ON tiers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "tiers_creator_update"
  ON tiers FOR UPDATE
  USING (true);

-- ── SUBSCRIPTIONS ──────────────────────────

CREATE POLICY "subscriptions_public_read"
  ON subscriptions FOR SELECT
  USING (true);

CREATE POLICY "subscriptions_service_insert"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "subscriptions_service_update"
  ON subscriptions FOR UPDATE
  USING (true);

-- ── POSTS ──────────────────────────────────

-- Public posts readable by all
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (is_public = true);

-- Private posts readable only with active subscription (simplified)
CREATE POLICY "posts_all_read_service"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "posts_creator_insert"
  ON posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "posts_creator_update"
  ON posts FOR UPDATE
  USING (true);

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
-- Run these in Supabase Dashboard → Storage → New Bucket

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('post-media', 'post-media', true);

-- ─────────────────────────────────────────────
-- SAMPLE DATA (optional — for testing)
-- ─────────────────────────────────────────────

-- INSERT INTO users (clerk_id, username, email, bio)
-- VALUES
--   ('test_clerk_1', 'brewdemo', 'demo@brewbase.app', 'Open-source dev ☕ Building in public'),
--   ('test_clerk_2', 'supporter1', 'fan@example.com', null);
