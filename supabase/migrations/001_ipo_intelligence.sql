-- ─── IPO Intelligence Tables ─────────────────────────────────────────
-- Phase 1: GMP history tracking and listing performance data
-- Phase 2: FII/DII flows, insider trades, bulk deals
-- ─────────────────────────────────────────────────────────────────────

-- IPO GMP History (snapshots for accuracy tracking over time)
CREATE TABLE IF NOT EXISTS ipo_gmp_history (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ipo_slug    text NOT NULL,
  ipo_name    text NOT NULL,
  gmp_amount  numeric(10,2),
  gmp_percent numeric(6,2),
  issue_price numeric(10,2),
  recorded_at timestamptz DEFAULT now(),
  source      text DEFAULT 'investorgain'
);

CREATE INDEX IF NOT EXISTS idx_gmp_history_slug ON ipo_gmp_history(ipo_slug, recorded_at DESC);

-- IPO Listing Performance Data (for accuracy scoring)
CREATE TABLE IF NOT EXISTS ipo_listing_data (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ipo_slug        text NOT NULL UNIQUE,
  ipo_name        text NOT NULL,
  category        text NOT NULL,              -- 'IPO' or 'SME'
  issue_price     numeric(10,2) NOT NULL,
  listing_price   numeric(10,2),
  listing_date    date,
  current_price   numeric(10,2),
  final_gmp       numeric(10,2),
  final_gmp_pct   numeric(6,2),
  subscription_x  numeric(8,2),
  gmp_accuracy    numeric(6,2),               -- how close GMP was to actual listing gain
  listing_return  numeric(6,2),               -- (listing_price - issue_price) / issue_price * 100
  year            integer,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_data_year ON ipo_listing_data(year, category);
CREATE INDEX IF NOT EXISTS idx_listing_data_category ON ipo_listing_data(category);

-- Extend alert_subscriptions for IPO alerts
ALTER TABLE alert_subscriptions
  ADD COLUMN IF NOT EXISTS alert_type text DEFAULT 'social_spike';
-- alert_type values: 'social_spike', 'ipo_new', 'ipo_gmp_change', 'ipo_listing'

-- RLS for new tables
ALTER TABLE ipo_gmp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_listing_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GMP history is publicly readable"
  ON ipo_gmp_history FOR SELECT USING (true);

CREATE POLICY "Service role inserts GMP history"
  ON ipo_gmp_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Listing data is publicly readable"
  ON ipo_listing_data FOR SELECT USING (true);

CREATE POLICY "Service role inserts listing data"
  ON ipo_listing_data FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role updates listing data"
  ON ipo_listing_data FOR UPDATE USING (true);

-- ─── Phase 2: Alternative Data Tables ────────────────────────────────

-- FII/DII Daily Flow
CREATE TABLE IF NOT EXISTS fii_dii_daily (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date          date NOT NULL UNIQUE,
  fii_buy       numeric(14,2),
  fii_sell      numeric(14,2),
  fii_net       numeric(14,2),
  dii_buy       numeric(14,2),
  dii_sell      numeric(14,2),
  dii_net       numeric(14,2),
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fii_dii_date ON fii_dii_daily(date DESC);

ALTER TABLE fii_dii_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FII/DII data is publicly readable"
  ON fii_dii_daily FOR SELECT USING (true);

CREATE POLICY "Service role inserts FII/DII data"
  ON fii_dii_daily FOR INSERT WITH CHECK (true);

-- Insider Trades
CREATE TABLE IF NOT EXISTS insider_trades (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name    text NOT NULL,
  ticker          text,
  person_name     text NOT NULL,
  person_category text,                       -- 'Promoter', 'Director', 'KMP', etc.
  transaction_type text,                      -- 'Buy', 'Sell', 'Pledge', 'Revoke'
  shares          bigint,
  value_cr        numeric(12,2),
  trade_date      date,
  disclosure_date date,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insider_ticker ON insider_trades(ticker, trade_date DESC);

ALTER TABLE insider_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insider trades are publicly readable"
  ON insider_trades FOR SELECT USING (true);

CREATE POLICY "Service role inserts insider trades"
  ON insider_trades FOR INSERT WITH CHECK (true);

-- Bulk/Block Deals
CREATE TABLE IF NOT EXISTS bulk_block_deals (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_type     text NOT NULL,                -- 'BULK' or 'BLOCK'
  exchange      text NOT NULL,                -- 'NSE' or 'BSE'
  ticker        text NOT NULL,
  company_name  text,
  client_name   text,
  buy_sell      text,                         -- 'BUY' or 'SELL'
  quantity      bigint,
  price         numeric(10,2),
  deal_date     date,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bulk_deals_date ON bulk_block_deals(deal_date DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_deals_ticker ON bulk_block_deals(ticker, deal_date DESC);

ALTER TABLE bulk_block_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bulk deals are publicly readable"
  ON bulk_block_deals FOR SELECT USING (true);

CREATE POLICY "Service role inserts bulk deals"
  ON bulk_block_deals FOR INSERT WITH CHECK (true);
