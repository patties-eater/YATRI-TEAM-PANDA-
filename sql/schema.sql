-- ─── YATRI – Supabase Schema ──────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Cuisines master table
CREATE TABLE IF NOT EXISTS cuisines (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  diet        TEXT NOT NULL CHECK (diet IN ('Veg', 'Non Veg')),
  tags        TEXT[] NOT NULL DEFAULT '{}',
  accent      TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  image       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Locations for each cuisine
CREATE TABLE IF NOT EXISTS cuisine_locations (
  id         TEXT PRIMARY KEY,
  cuisine_id TEXT NOT NULL REFERENCES cuisines(id) ON DELETE CASCADE,
  latitude   DOUBLE PRECISION NOT NULL,
  longitude  DOUBLE PRECISION NOT NULL,
  area       TEXT NOT NULL
);

-- 3. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cuisine_locations_cuisine_id
  ON cuisine_locations(cuisine_id);

CREATE INDEX IF NOT EXISTS idx_cuisines_category
  ON cuisines(category);

CREATE INDEX IF NOT EXISTS idx_cuisines_diet
  ON cuisines(diet);

-- 4. Enable Row Level Security (public read, no write from client)
ALTER TABLE cuisines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisine_locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (the anon key is sufficient for the app)
CREATE POLICY "public read cuisines"
  ON cuisines FOR SELECT USING (true);

CREATE POLICY "public read cuisine_locations"
  ON cuisine_locations FOR SELECT USING (true);
