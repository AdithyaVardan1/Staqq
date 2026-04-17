-- ─── Crypto Signals ──────────────────────────────────────────────────
-- Stores detected meme coin / crypto signals with timestamps
-- Free users see signals older than 6 hours (delay wall)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crypto_signals (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token_symbol        text NOT NULL,
    token_name          text,
    chain               text DEFAULT 'eth',
    contract_address    text,
    signal_type         text NOT NULL,
    -- 'social_surge' | 'volume_spike' | 'combined'
    social_score        integer DEFAULT 0,
    mention_count       integer DEFAULT 0,
    mention_velocity    float DEFAULT 0,  -- ratio vs baseline (5x = 5.0)
    price_usd           float,
    volume_24h          float,
    volume_change_pct   float,
    market_cap          float,
    price_change_1h     float,
    price_change_24h    float,
    top_posts           jsonb DEFAULT '[]',
    dex_url             text,
    signal_hour         timestamptz GENERATED ALWAYS AS (date_trunc('hour', first_detected_at)) STORED,
    first_detected_at   timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_signals_unique
    ON crypto_signals(token_symbol, signal_hour);

CREATE INDEX IF NOT EXISTS idx_crypto_signals_detected ON crypto_signals(first_detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_signals_score ON crypto_signals(social_score DESC);

ALTER TABLE crypto_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crypto signals"
    ON crypto_signals FOR SELECT USING (true);

CREATE POLICY "Service role manages crypto signals"
    ON crypto_signals FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role updates crypto signals"
    ON crypto_signals FOR UPDATE USING (true);
