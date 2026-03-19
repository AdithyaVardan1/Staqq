-- ─── Subscription & Billing System ────────────────────────────────────
-- Plans, subscriptions, payment events, and usage tracking
-- ─────────────────────────────────────────────────────────────────────

-- Subscription plans reference table
CREATE TABLE IF NOT EXISTS plans (
  id              text PRIMARY KEY,           -- 'free', 'pro_monthly', 'pro_yearly'
  name            text NOT NULL,
  price_paise     integer NOT NULL DEFAULT 0, -- price in paise (49900 = ₹499)
  interval        text NOT NULL DEFAULT 'month', -- 'month' | 'year' | 'forever'
  razorpay_plan_id text,                      -- Razorpay plan ID (null for free)
  features        jsonb DEFAULT '{}',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON plans FOR SELECT USING (true);

-- Seed plans
INSERT INTO plans (id, name, price_paise, interval, features) VALUES
  ('free', 'Free', 0, 'forever', '{
    "stock_lookups_per_day": 5,
    "max_alert_subs": 3,
    "signal_delay_min": 30,
    "screener_export": false,
    "custom_rules": false,
    "morning_brief": false,
    "ipo_score": false
  }'),
  ('pro_monthly', 'Pro Monthly', 49900, 'month', '{
    "stock_lookups_per_day": -1,
    "max_alert_subs": -1,
    "signal_delay_min": 0,
    "screener_export": true,
    "custom_rules": true,
    "morning_brief": true,
    "ipo_score": true
  }'),
  ('pro_yearly', 'Pro Yearly', 499900, 'year', '{
    "stock_lookups_per_day": -1,
    "max_alert_subs": -1,
    "signal_delay_min": 0,
    "screener_export": true,
    "custom_rules": true,
    "morning_brief": true,
    "ipo_score": true
  }')
ON CONFLICT (id) DO NOTHING;

-- User subscriptions (one active subscription per user)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                   text NOT NULL REFERENCES plans(id) DEFAULT 'free',
  status                    text NOT NULL DEFAULT 'active',
    -- 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing'
  razorpay_subscription_id  text UNIQUE,
  razorpay_customer_id      text,
  razorpay_payment_method   text,   -- 'upi' | 'card' | 'netbanking'
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean DEFAULT false,
  cancelled_at              timestamptz,
  trial_end                 timestamptz,
  metadata                  jsonb DEFAULT '{}',
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay ON subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role updates subscriptions"
  ON subscriptions FOR UPDATE
  USING (true);

-- Razorpay webhook event log (idempotency + audit trail)
CREATE TABLE IF NOT EXISTS razorpay_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    text UNIQUE NOT NULL,   -- Razorpay event ID for dedup
  event_type  text NOT NULL,
  payload     jsonb NOT NULL,
  processed   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_razorpay_events_type ON razorpay_events(event_type);

ALTER TABLE razorpay_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to events"
  ON razorpay_events FOR SELECT USING (false);

-- Daily usage tracking (free-tier stock lookups)
CREATE TABLE IF NOT EXISTS daily_usage (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      date NOT NULL DEFAULT current_date,
  lookups   integer DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage"
  ON daily_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage"
  ON daily_usage FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role updates usage"
  ON daily_usage FOR UPDATE USING (true);

-- Update handle_new_user() to also create a free subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (new.id, 'free', 'active');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: give existing users a free subscription if they don't have one
INSERT INTO subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT DO NOTHING;
