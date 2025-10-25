-- Simple Key-Value Tables for PredictX
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_updated ON predictions(updated_at DESC);
CREATE INDEX idx_user_stats_updated ON user_stats(updated_at DESC);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Public read predictions" ON predictions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public write predictions" ON predictions FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Public read user_stats" ON user_stats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public write user_stats" ON user_stats FOR ALL TO anon, authenticated USING (true);
