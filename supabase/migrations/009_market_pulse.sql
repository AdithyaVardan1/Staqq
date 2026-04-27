CREATE TABLE IF NOT EXISTS market_pulse (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    ticker TEXT,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('bullish', 'bearish', 'neutral', 'mixed')),
    sentiment_score INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS market_pulse_date_idx ON market_pulse(date DESC);
CREATE INDEX IF NOT EXISTS market_pulse_ticker_idx ON market_pulse(ticker);
