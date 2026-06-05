-- Add match poster URL and MVP fields to fixtures table
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS match_poster_url TEXT,
  ADD COLUMN IF NOT EXISTS mvp_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mvp_note TEXT;
