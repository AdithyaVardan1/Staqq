CREATE TABLE IF NOT EXISTS custom_alert_rules (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  is_active       boolean DEFAULT true,
  conditions      jsonb NOT NULL,
  actions         jsonb NOT NULL DEFAULT '["email", "in_app"]',
  logic           text DEFAULT 'AND',
  last_triggered_at  timestamptz,
  trigger_count      integer DEFAULT 0,
  cooldown_hours     integer DEFAULT 4,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Conditions schema examples:
-- [{"type": "fii_net_sell", "operator": ">", "value": 5000}]
-- [{"type": "ticker_spike", "ticker": "RELIANCE"}]
-- [{"type": "insider_buy", "ticker": "ANY", "min_value_cr": 10}]

CREATE INDEX IF NOT EXISTS idx_custom_rules_user ON custom_alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_active ON custom_alert_rules(is_active) WHERE is_active = true;

ALTER TABLE custom_alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rules"
  ON custom_alert_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
