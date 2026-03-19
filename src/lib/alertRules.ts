import { createAdminClient } from '@/utils/supabase/admin';
import { redis } from '@/lib/redis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConditionType =
  | 'ticker_spike'
  | 'fii_net_sell'
  | 'fii_net_buy'
  | 'dii_net_sell'
  | 'dii_net_buy'
  | 'insider_buy'
  | 'insider_sell'
  | 'ipo_gmp_change';

export interface RuleCondition {
  type: ConditionType;
  operator?: '>' | '<' | '>=' | '<=' | '==';
  value?: number;
  ticker?: string;
  min_value_cr?: number;
}

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  conditions: RuleCondition[];
  actions: string[];
  logic: 'AND' | 'OR';
  last_triggered_at: string | null;
  cooldown_hours: number;
}

export interface InsiderTrade {
  ticker: string;
  type: string;       // 'buy' | 'sell'
  value_cr: number;
}

export interface EvaluationContext {
  spikedTickers: string[];
  fiiData: { net: number };
  diiData: { net: number };
  insiderTrades: InsiderTrade[];
}

// ---------------------------------------------------------------------------
// Condition evaluator
// ---------------------------------------------------------------------------

export function evaluateCondition(
  condition: RuleCondition,
  context: EvaluationContext,
): boolean {
  switch (condition.type) {
    // --- Ticker spike -------------------------------------------------------
    case 'ticker_spike': {
      if (!condition.ticker) return false;
      if (condition.ticker === 'ANY') return context.spikedTickers.length > 0;
      return context.spikedTickers.includes(condition.ticker.toUpperCase());
    }

    // --- FII net sell / buy -------------------------------------------------
    case 'fii_net_sell': {
      const threshold = condition.value ?? 0;
      const net = context.fiiData.net;
      // FII net sell means net is negative; compare absolute value against threshold
      if (net >= 0) return false;
      return compare(Math.abs(net), condition.operator ?? '>', threshold);
    }

    case 'fii_net_buy': {
      const threshold = condition.value ?? 0;
      const net = context.fiiData.net;
      if (net <= 0) return false;
      return compare(net, condition.operator ?? '>', threshold);
    }

    // --- DII net sell / buy -------------------------------------------------
    case 'dii_net_sell': {
      const threshold = condition.value ?? 0;
      const net = context.diiData.net;
      if (net >= 0) return false;
      return compare(Math.abs(net), condition.operator ?? '>', threshold);
    }

    case 'dii_net_buy': {
      const threshold = condition.value ?? 0;
      const net = context.diiData.net;
      if (net <= 0) return false;
      return compare(net, condition.operator ?? '>', threshold);
    }

    // --- Insider trades -----------------------------------------------------
    case 'insider_buy': {
      return context.insiderTrades.some((t) => {
        if (t.type !== 'buy') return false;
        const tickerMatch =
          !condition.ticker || condition.ticker === 'ANY' || t.ticker === condition.ticker.toUpperCase();
        const valueMatch =
          condition.min_value_cr === undefined || t.value_cr >= condition.min_value_cr;
        return tickerMatch && valueMatch;
      });
    }

    case 'insider_sell': {
      return context.insiderTrades.some((t) => {
        if (t.type !== 'sell') return false;
        const tickerMatch =
          !condition.ticker || condition.ticker === 'ANY' || t.ticker === condition.ticker.toUpperCase();
        const valueMatch =
          condition.min_value_cr === undefined || t.value_cr >= condition.min_value_cr;
        return tickerMatch && valueMatch;
      });
    }

    // --- IPO GMP change (placeholder – evaluated as truthy when present) ----
    case 'ipo_gmp_change': {
      // Future: context can carry ipoGmpChanges; for now treat as no-op
      return false;
    }

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Comparison helper
// ---------------------------------------------------------------------------

function compare(actual: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>':  return actual > threshold;
    case '<':  return actual < threshold;
    case '>=': return actual >= threshold;
    case '<=': return actual <= threshold;
    case '==': return actual === threshold;
    default:   return false;
  }
}

// ---------------------------------------------------------------------------
// Cooldown check
// ---------------------------------------------------------------------------

function isCooldownElapsed(rule: AlertRule): boolean {
  if (!rule.last_triggered_at) return true;
  const lastTriggered = new Date(rule.last_triggered_at).getTime();
  const cooldownMs = rule.cooldown_hours * 60 * 60 * 1000;
  return Date.now() - lastTriggered >= cooldownMs;
}

// ---------------------------------------------------------------------------
// Main evaluation loop
// ---------------------------------------------------------------------------

export async function evaluateCustomRules(
  context: EvaluationContext,
): Promise<AlertRule[]> {
  const supabase = createAdminClient();

  // Fetch all active custom rules for Pro users only
  const { data: rules, error } = await supabase
    .from('custom_alert_rules')
    .select(`
      id,
      user_id,
      name,
      conditions,
      actions,
      logic,
      last_triggered_at,
      cooldown_hours,
      subscriptions!inner ( plan_id, status )
    `)
    .eq('is_active', true)
    .in('subscriptions.plan_id', ['pro_monthly', 'pro_yearly'])
    .eq('subscriptions.status', 'active');

  if (error) {
    console.error('[AlertRules] Failed to fetch rules:', error.message);
    return [];
  }

  if (!rules || rules.length === 0) return [];

  const triggeredRules: AlertRule[] = [];

  for (const row of rules) {
    const rule: AlertRule = {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      conditions: row.conditions as RuleCondition[],
      actions: row.actions as string[],
      logic: (row.logic as 'AND' | 'OR') ?? 'AND',
      last_triggered_at: row.last_triggered_at,
      cooldown_hours: row.cooldown_hours,
    };

    // Skip rules still in cooldown
    if (!isCooldownElapsed(rule)) continue;

    // Evaluate conditions with AND/OR logic
    const results = rule.conditions.map((c) => evaluateCondition(c, context));
    const triggered =
      rule.logic === 'AND' ? results.every(Boolean) : results.some(Boolean);

    if (!triggered) continue;

    const now = new Date().toISOString();

    // Update rule: bump trigger_count and last_triggered_at
    await supabase
      .from('custom_alert_rules')
      .update({
        last_triggered_at: now,
        trigger_count: (row as any).trigger_count ? (row as any).trigger_count + 1 : 1,
        updated_at: now,
      })
      .eq('id', rule.id);

    // Create an alert record
    const { data: alert } = await supabase
      .from('alerts')
      .insert({
        ticker: summariseTickers(rule, context),
        mention_count: 0,
        baseline_avg: 0,
        spike_mult: 0,
        message: `Custom rule "${rule.name}" triggered`,
      })
      .select('id')
      .single();

    // Fan-out notification to user_notifications
    if (alert) {
      await supabase.from('user_notifications').insert({
        user_id: rule.user_id,
        alert_id: alert.id,
        delivered_via: rule.actions,
      });
    }

    // Cache trigger event in Redis for quick dashboard lookups (TTL 24h)
    await redis.set(
      `rule_triggered:${rule.id}`,
      JSON.stringify({ triggered_at: now, rule_name: rule.name }),
      86400,
    );

    triggeredRules.push(rule);
  }

  return triggeredRules;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a short ticker summary string for the alert record. */
function summariseTickers(rule: AlertRule, context: EvaluationContext): string {
  const tickers = new Set<string>();

  for (const cond of rule.conditions) {
    if (cond.ticker && cond.ticker !== 'ANY') {
      tickers.add(cond.ticker.toUpperCase());
    }
  }

  // If any spike condition matched, include the spiked tickers
  if (rule.conditions.some((c) => c.type === 'ticker_spike')) {
    context.spikedTickers.forEach((t) => tickers.add(t));
  }

  return tickers.size > 0 ? Array.from(tickers).join(',') : 'CUSTOM_RULE';
}
