-- Add source column so we can separate Reddit vs news AI summaries
ALTER TABLE market_pulse ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'reddit';

CREATE INDEX IF NOT EXISTS market_pulse_source_idx ON market_pulse(source);

-- Backfill existing rows (all were from Reddit)
UPDATE market_pulse SET source = 'reddit' WHERE source = 'reddit';
