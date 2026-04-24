-- ============================================
-- BrewBase — New Feature Migrations
-- Run this AFTER the main supabase-schema.sql
-- ============================================

-- ─────────────────────────────────────────────
-- EMOJI REACTIONS TABLE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id  UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,           -- e.g. '☕', '❤️', '🔥', '🎉', '👏', '💛'
  user_ip     TEXT,                    -- anonymous rate-limit by IP
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(payment_id, user_ip, emoji)   -- prevent duplicate reactions per user/IP
);

CREATE INDEX IF NOT EXISTS idx_reactions_payment_id ON reactions(payment_id);

-- RLS for reactions
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_public_read"
  ON reactions FOR SELECT USING (true);

CREATE POLICY "reactions_public_insert"
  ON reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "reactions_public_delete"
  ON reactions FOR DELETE USING (true);

-- ─────────────────────────────────────────────
-- LEADERBOARD VIEW
-- Aggregates total donations per supporter per creator
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.creator_id,
  p.user_id,
  p.is_anonymous,
  u.username                              AS supporter_name,
  SUM(p.amount)                           AS total_amount,
  COUNT(*)                                AS support_count,
  MAX(p.created_at)                       AS latest_at,
  RANK() OVER (
    PARTITION BY p.creator_id
    ORDER BY SUM(p.amount) DESC
  )                                       AS rank
FROM payments p
LEFT JOIN users u ON u.id = p.user_id
GROUP BY p.creator_id, p.user_id, p.is_anonymous, u.username;

-- ─────────────────────────────────────────────
-- ANALYTICS HELPER VIEW
-- Daily revenue per creator for the last 90 days
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  creator_id,
  DATE(created_at)     AS date,
  SUM(amount)          AS amount,
  COUNT(*)             AS count
FROM payments
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY creator_id, DATE(created_at)
ORDER BY date ASC;

-- RLS for views (views inherit base table RLS)
-- No additional policies needed — leaderboard and daily_revenue
-- read from payments which already has public read policy.
