// ─── IPO Composite Scoring Algorithm ────────────────────────────────
// Calculates a weighted score (1-10) from GMP, subscription, rating,
// and issue size signals.  No external dependencies.
// ────────────────────────────────────────────────────────────────────

import type { IPOData } from './ipo';

// ── Types ───────────────────────────────────────────────────────────

export interface IPOScore {
  overall: number; // 1-10
  components: {
    gmpSignal: number; // 0-10
    subscriptionStrength: number; // 0-10
    companyQuality: number; // 0-10
    issueSizeSignal: number; // 0-10
  };
  label: 'Strong Buy' | 'Buy' | 'Neutral' | 'Weak' | 'Avoid';
  color: string; // hex
  confidence: 'high' | 'medium' | 'low';
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Clamp a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Linear interpolation between two anchors. */
function lerp(
  value: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number,
): number {
  const t = (value - inLow) / (inHigh - inLow);
  return outLow + t * (outHigh - outLow);
}

// ── Component scorers ───────────────────────────────────────────────

/**
 * GMP Signal (weight 35%)
 * -50% -> 0, 0% -> 4, +50% -> 8, +100%+ -> 10
 */
function scoreGmp(gmpPercent: number | null): number | null {
  if (gmpPercent == null) return null;

  let score: number;
  if (gmpPercent <= -50) {
    score = 0;
  } else if (gmpPercent <= 0) {
    score = lerp(gmpPercent, -50, 0, 0, 4);
  } else if (gmpPercent <= 50) {
    score = lerp(gmpPercent, 0, 50, 4, 8);
  } else if (gmpPercent <= 100) {
    score = lerp(gmpPercent, 50, 100, 8, 10);
  } else {
    score = 10;
  }

  return clamp(score, 0, 10);
}

/**
 * Subscription Strength (weight 30%)
 * 0x -> 0, 1x -> 3, 5x -> 6, 20x -> 8, 50x+ -> 10
 */
function scoreSubscription(sub: number | null): number | null {
  if (sub == null) return null;

  let score: number;
  if (sub <= 0) {
    score = 0;
  } else if (sub <= 1) {
    score = lerp(sub, 0, 1, 0, 3);
  } else if (sub <= 5) {
    score = lerp(sub, 1, 5, 3, 6);
  } else if (sub <= 20) {
    score = lerp(sub, 5, 20, 6, 8);
  } else if (sub <= 50) {
    score = lerp(sub, 20, 50, 8, 10);
  } else {
    score = 10;
  }

  return clamp(score, 0, 10);
}

/**
 * Company Quality (weight 20%)
 * Rating 0-5 mapped linearly to 0-10.
 */
function scoreQuality(rating: number): number | null {
  if (rating == null || rating < 0) return null;
  return clamp(rating * 2, 0, 10);
}

/**
 * Issue Size Signal (weight 15%)
 * <50Cr -> 3, 50-200 -> 5, 200-1000 -> 7, 1000+ -> 9
 */
function scoreIssueSize(ipoSizeCr: string | null): number | null {
  if (ipoSizeCr == null) return null;

  const size = parseFloat(ipoSizeCr.replace(/,/g, ''));
  if (isNaN(size)) return null;

  let score: number;
  if (size < 50) {
    score = 3;
  } else if (size < 200) {
    score = lerp(size, 50, 200, 3, 5);
  } else if (size < 1000) {
    score = lerp(size, 200, 1000, 5, 7);
  } else {
    score = lerp(size, 1000, 5000, 7, 9);
  }

  return clamp(score, 0, 10);
}

// ── Label / color mapping ───────────────────────────────────────────

function getLabel(
  score: number,
): { label: IPOScore['label']; color: string } {
  if (score >= 8) return { label: 'Strong Buy', color: '#22C55E' };
  if (score >= 6.5) return { label: 'Buy', color: '#86EFAC' };
  if (score >= 5) return { label: 'Neutral', color: '#F59E0B' };
  if (score >= 3.5) return { label: 'Weak', color: '#FB923C' };
  return { label: 'Avoid', color: '#EF4444' };
}

// ── Main scorer ─────────────────────────────────────────────────────

const WEIGHTS = {
  gmpSignal: 0.35,
  subscriptionStrength: 0.30,
  companyQuality: 0.20,
  issueSizeSignal: 0.15,
} as const;

export function calculateIPOScore(ipo: IPOData): IPOScore {
  const gmpSignal = scoreGmp(ipo.gmpPercent);
  const subscriptionStrength = scoreSubscription(ipo.subscriptionNum);
  const companyQuality = scoreQuality(ipo.rating);
  const issueSizeSignal = scoreIssueSize(ipo.ipoSizeCr);

  const components = { gmpSignal, subscriptionStrength, companyQuality, issueSizeSignal };

  // Count how many data points are available
  const scores: { key: keyof typeof WEIGHTS; value: number }[] = [];
  for (const [key, value] of Object.entries(components)) {
    if (value != null) {
      scores.push({ key: key as keyof typeof WEIGHTS, value });
    }
  }

  const dataPointCount = scores.length;

  // Confidence based on available data points
  let confidence: IPOScore['confidence'];
  if (dataPointCount >= 4) confidence = 'high';
  else if (dataPointCount === 3) confidence = 'medium';
  else confidence = 'low';

  // Weighted average (re-normalise weights for available components)
  let overall: number;
  if (dataPointCount === 0) {
    overall = 5; // neutral fallback
  } else {
    const totalWeight = scores.reduce((sum, s) => sum + WEIGHTS[s.key], 0);
    const weighted = scores.reduce(
      (sum, s) => sum + s.value * WEIGHTS[s.key],
      0,
    );
    overall = weighted / totalWeight;
  }

  // Round to 1 decimal and clamp to 1-10
  overall = clamp(Math.round(overall * 10) / 10, 1, 10);

  const { label, color } = getLabel(overall);

  return {
    overall,
    components: {
      gmpSignal: gmpSignal ?? 0,
      subscriptionStrength: subscriptionStrength ?? 0,
      companyQuality: companyQuality ?? 0,
      issueSizeSignal: issueSizeSignal ?? 0,
    },
    label,
    color,
    confidence,
  };
}

// ── Gradient helper ─────────────────────────────────────────────────

/**
 * Returns a CSS linear-gradient string that transitions from red (low)
 * through yellow to green (high) based on the score (1-10).
 */
export function getScoreGradient(score: number): string {
  const s = clamp(score, 1, 10);
  // Map 1-10 to a hue rotation: 0 (red) -> 60 (yellow) -> 120 (green)
  const hue = ((s - 1) / 9) * 120;
  const hueLeft = Math.max(0, hue - 15);
  const hueRight = Math.min(120, hue + 15);

  return `linear-gradient(135deg, hsl(${hueLeft}, 80%, 50%), hsl(${hueRight}, 80%, 45%))`;
}
