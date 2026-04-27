#!/usr/bin/env python3
"""
Summarize Reddit market discussions using Groq LLM.
Reads raw posts from Supabase `tweets` table (source='reddit'),
groups by ticker and general market, generates AI summaries,
upserts to `market_pulse` table.

Model strategy:
  Primary:  llama-3.3-70b-versatile  (best quality, production)
  Fallback: llama-3.1-8b-instant     (560 T/s, handles rate limit overflow)

Key rotation: GROQ_KEY_1 ... GROQ_KEY_N from .env.local or env.
"""

import sys
import json
import time
from pathlib import Path
from datetime import date, datetime, timedelta, timezone

import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Model fallback chain — try in order on failure/rate-limit
MODEL_CHAIN = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]


def load_env():
    env_path = PROJECT_ROOT / ".env.local"
    if not env_path.exists():
        print("❌ .env.local not found")
        sys.exit(1)
    env = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def load_groq_keys(env: dict) -> list:
    keys = []
    for i in range(1, 20):
        k = env.get(f"GROQ_KEY_{i}")
        if k:
            keys.append(k)
    if not keys and env.get("GROQ_API_KEY"):
        keys.append(env["GROQ_API_KEY"])
    return keys


BANNED_PHRASES = [
    "investors are discussing",
    "people are talking about",
    "some investors are",
    "some traders",
    "a notable contrarian view",
    "sparking concerns about",
    "market stability",
    "in the coming",
    "it's worth noting",
    "it is worth noting",
    "it's important to",
]

SUB_WEIGHT = {
    "indiainvestments":   1.4,   # most analytical
    "indianstockmarket":  1.0,
    "dalalstreettalks":   1.0,
    "indianstreetbets":   0.4,   # meme-heavy
}


ANALYTICAL_TERMS = {
    'ANALYSIS', 'DD', 'RESEARCH', 'RESULTS', 'EARNINGS', 'QUARTER',
    'REVENUE', 'MARGIN', 'VALUATION', 'REPORT', 'FORECAST', 'GUIDANCE',
    'BUYBACK', 'DIVIDEND', 'SEBI', 'SCREENER', 'FUNDAMENTAL', 'TECHNICAL',
}

# News/event terms that signal a real market-moving story, not just a question
NEWS_TERMS = {
    'CRASH', 'RALLY', 'SURGE', 'PLUNGE', 'HALTED', 'CIRCUIT', 'CEASEFIRE',
    'SANCTIONS', 'TARIFF', 'RATE CUT', 'RATE HIKE', 'INFLATION', 'CPI', 'PMI',
    'HORMUZ', 'WAR', 'GEOPOLIT', 'ELECTION', 'BUDGET', 'POLICY', 'FED ',
    'RBI ', 'SEBI ', 'MERGER', 'ACQUISITION', 'TAKEOVER', 'BANKRUPTCY',
    'LAYOFFS', 'SHUTDOWN', 'SUSPENSION', 'DELISTED', 'FRAUD', 'SCAM',
}


def is_analytical(p: dict) -> bool:
    body = (p.get("body") or "").strip()
    tickers = p.get("tickers") or []
    text = ((p.get("title") or "") + " " + body).upper()
    return len(body) > 150 and (bool(tickers) or any(t in text for t in ANALYTICAL_TERMS))


def rank_posts(posts: list) -> list:
    """Multi-factor ranking: weights analytical content heavily, penalises memes."""
    def quality_score(p) -> float:
        reddit_score = p.get("score") or 0
        comments     = p.get("comments") or 0
        is_hot       = p.get("is_hot") or False
        body         = (p.get("body") or "").strip()
        tickers      = p.get("tickers") or []
        community    = (p.get("community") or "").lower()

        base = reddit_score + comments * 4 + (60 if is_hot else 0)
        analytical = is_analytical(p)
        text_upper = ((p.get("title") or "") + " " + body).upper()
        is_news = any(t in text_upper for t in NEWS_TERMS)

        # Content quality multiplier
        if analytical and tickers:
            base *= 2.5      # DD with specific stocks — gold
        elif analytical:
            base *= 1.8      # long analytical post
        elif is_news and len(body) > 50:
            base *= 2.0      # news/event post — surface geopolitical/macro stories
        elif len(body) > 80:
            base *= 1.3      # some substance
        elif not body:
            base *= 0.1      # title-only (meme/image) — near-zero

        # Subreddit quality weight
        base *= SUB_WEIGHT.get(community, 1.0)

        return base

    # Hard filter: meaningful title + minimum engagement + substantive content
    # Title-only posts are excluded regardless of score (2000-upvote memes can't sneak in).
    # Body must be >= 40 chars to count — single-sentence "what do you think?" bodies don't qualify.
    quality = [
        p for p in posts
        if len((p.get("title") or "").strip()) >= 20
        and ((p.get("score") or 0) >= 10 or (p.get("comments") or 0) >= 8)
        and (len((p.get("body") or "").strip()) >= 40 or (p.get("tickers") or []))
    ]
    return sorted(quality, key=quality_score, reverse=True)


def is_valid_output(result: dict) -> tuple[bool, str]:
    """Check LLM output for quality. Returns (ok, reason)."""
    headline = (result.get("headline") or "").lower()
    summary  = (result.get("summary") or "").lower()
    combined = headline + " " + summary

    for phrase in BANNED_PHRASES:
        if phrase in combined:
            return False, f"banned phrase: '{phrase}'"

    if len(result.get("summary", "")) < 80:
        return False, "summary too short"
    if len(result.get("headline", "")) < 15:
        return False, "headline too short"
    if result.get("sentiment") not in {"bullish", "bearish", "neutral", "mixed"}:
        return False, f"invalid sentiment: {result.get('sentiment')}"

    return True, "ok"


GOOD_EXAMPLE_GENERAL = """{
  "headline": "Zomato up 8% post-results but valuation debate is far from settled",
  "summary": "Q3 PAT beat has bulls calling a re-rating to 90x forward — the argument being that Blinkit's unit economics just turned positive for the first time. Bears aren't buying it: at 0.18x EV/GMV the stock already prices in perfection, and any slowdown in dark-store expansion kills the thesis. The smarter trade here might be Swiggy, which is pricing in failure while facing the same tailwinds.",
  "sentiment": "bullish",
  "sentiment_score": 35,
  "topics": ["zomato-q3", "blinkit-unit-economics", "quick-commerce", "valuation"]
}"""

GOOD_EXAMPLE_TICKER = """{
  "headline": "HDFC Bank deposit growth lags loans for 3rd straight quarter",
  "summary": "CD ratio at 111% is the number everyone's focused on — it means the bank is lending more than it's taking in deposits, which constrains future loan growth unless rates rise. Bulls say the merger integration is temporary noise and the franchise value is intact; bears point out that Kotak and Axis are both eating HDFC's lunch on deposit mobilisation right now. Q4 numbers matter less than whether management has a credible deposit strategy to share on the call.",
  "sentiment": "bearish",
  "sentiment_score": -30,
  "topics": ["hdfc-bank", "cd-ratio", "deposit-growth", "banking-q4"]
}"""

BAD_EXAMPLE = """NEVER write like this:
  "headline": "Market Uncertainty",
  "summary": "The dominant mood in the market is one of caution. The most-discussed stock is not a specific one. A notable contrarian view is emerging with some investors considering a shift.",
Banned phrases: "investors are discussing", "people are talking about", "some investors are", "a notable contrarian view", "however,", "sparking concerns about", "market stability", vague mood words in headlines.
The examples above are STYLE GUIDES ONLY — do not copy their content. Analyse only the posts provided."""


def build_prompt(posts: list, ticker: str | None) -> str:
    context = f"for the stock ${ticker}" if ticker else "across Indian stock market communities (general market)"
    top = posts[:20]

    post_lines = "\n\n".join(
        f"[{i+1}] score:{p.get('score',0)} comments:{p.get('comments',0)} "
        f"{'🔥' if p.get('is_hot') else ''}\n{p['title']}"
        + (f"\n{(p.get('body') or '').strip()[:250]}" if (p.get('body') or '').strip() else "")
        for i, p in enumerate(top)
    )

    good_example = GOOD_EXAMPLE_TICKER if ticker else GOOD_EXAMPLE_GENERAL

    return f"""You are a sharp financial journalist writing a pre-market brief for Indian retail investors. Think Bloomberg Terminal meets financial Twitter — specific, direct, and opinionated.

Analyze these {len(top)} highest-engagement discussion posts {context}:

{post_lines}

Priority order for your analysis:
1. FIRST: concrete news events, geopolitical developments, earnings reports, policy changes, company-specific events
2. SECOND: analytical posts with specific numbers, DD, or sector thesis
3. LAST RESORT only if nothing above exists: community sentiment polls or "what should I do" questions

If there is even one post about a real event or named company/stock, lead with that. Do NOT lead with a community poll or sentiment question.

Output a market pulse in this exact JSON format. Study the good/bad examples carefully.

GOOD (write like this):
{good_example}

{BAD_EXAMPLE}

Rules:
- headline: max 80 chars, lead with a specific data point, stock name, or event — never a vague mood word
- summary: 2-3 SHORT sentences. Every sentence must contain either a specific number, a named company, or a concrete trade idea. State the bull case AND the bear case in tension — not as separate observations but as a real disagreement. End with a non-obvious angle or the specific thing to watch. No filler, no hedging, no passive voice.
- sentiment: bullish / bearish / neutral / mixed
- sentiment_score: -100 to +100
- topics: 3-5 specific lowercase tags (e.g. "icicibank-q4", "fii-selling" not "valuation", "trading")

Return ONLY valid JSON:
{{
  "headline": "...",
  "summary": "...",
  "sentiment": "...",
  "sentiment_score": 0,
  "topics": []
}}"""


def call_groq(api_key: str, model: str, prompt: str) -> dict | None:
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.6,
                "max_tokens": 500,
            },
            timeout=30,
        )
        if resp.status_code == 429:
            return "RATE_LIMITED"
        if not resp.ok:
            print(f"    Groq {model} error {resp.status_code}: {resp.text[:150]}")
            return None
        content = resp.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"    JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"    Request error: {e}")
        return None


def summarize(keys: list, posts: list, ticker: str | None, max_attempts: int = 3) -> dict | None:
    """
    Try every key x model combination until we get a valid result.
    Validates output and retries with feedback if banned phrases detected.
    """
    base_prompt = build_prompt(posts, ticker)
    retry_note = ""

    for attempt in range(max_attempts):
        prompt = base_prompt + retry_note

        for model in MODEL_CHAIN:
            for key in keys:
                print(f"    [{attempt+1}/{max_attempts}] {model[:35]}...")
                result = call_groq(key, model, prompt)

                if result == "RATE_LIMITED":
                    continue
                if result is None:
                    time.sleep(1)
                    continue

                ok, reason = is_valid_output(result)
                if ok:
                    return result

                print(f"    Output rejected ({reason}) — retrying")
                retry_note = f"\n\nIMPORTANT: Your previous attempt was rejected because: {reason}. Fix this in your next response."
                time.sleep(1)
                break  # retry with same model chain but new prompt

            else:
                # All keys rate-limited on this model
                print(f"    All keys rate-limited on {model}, trying fallback...")
                time.sleep(3)
                continue
            break  # got a response (even if invalid) — go to next attempt

    print("    Failed after all attempts — skipping")
    return None


def validate(result: dict) -> dict:
    """Clamp and sanitise LLM output."""
    valid_sentiments = {"bullish", "bearish", "neutral", "mixed"}
    sentiment = result.get("sentiment", "neutral").lower()
    if sentiment not in valid_sentiments:
        sentiment = "neutral"

    score = result.get("sentiment_score", 0)
    try:
        score = max(-100, min(100, int(score)))
    except (TypeError, ValueError):
        score = 0

    topics = result.get("topics", [])
    if not isinstance(topics, list):
        topics = []

    return {
        "headline": (result.get("headline") or "")[:200].strip(),
        "summary": (result.get("summary") or "").strip(),
        "sentiment": sentiment,
        "sentiment_score": score,
        "topics": [str(t).lower()[:40] for t in topics[:5]],
    }


def main():
    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    groq_keys = load_groq_keys(env)

    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials missing")
        sys.exit(1)
    if not groq_keys:
        print("❌ No Groq keys — set GROQ_KEY_1 or GROQ_API_KEY in .env.local")
        sys.exit(1)

    print(f"✓ {len(groq_keys)} Groq key(s) · models: {' → '.join(MODEL_CHAIN)}")

    from supabase import create_client
    sb = create_client(supabase_url, supabase_key)

    # Load last 48h Reddit posts — matches fetch_reddit.py retention window.
    # Hot posts can be 2-3 days old; 24h cutoff silently drops them.
    cutoff_ts = int(datetime.now(timezone.utc).timestamp()) - 172800
    raw = (
        sb.table("tweets")
        .select("post_id, title, body, score, comments, tickers, is_hot, community")
        .eq("source", "reddit")
        .gte("created_at_ts", cutoff_ts)
        .execute()
    )
    all_posts = raw.data or []

    if not all_posts:
        print("No Reddit posts in last 24h — skipping")
        return

    print(f"Loaded {len(all_posts)} Reddit posts")

    # Rank all posts by engagement quality before grouping
    ranked_all = rank_posts(all_posts)
    analytical_count = sum(1 for p in ranked_all if is_analytical(p))
    print(f"  Ranked {len(ranked_all)} posts ({analytical_count} analytical, {len(ranked_all) - analytical_count} general)")
    print(f"  Top post: \"{ranked_all[0]['title'][:80]}\" (score:{ranked_all[0].get('score',0)})")

    top20 = ranked_all[:20]
    print(f"  Top {len(top20)} going into LLM:")
    for i, p in enumerate(top20):
        flag = "📊" if is_analytical(p) else "💬"
        news_flag = "📰" if any(t in ((p.get("title","")+" "+(p.get("body") or "")).upper()) for t in NEWS_TERMS) else ""
        print(f"    {i+1}. {flag}{news_flag} [{p.get('community','?')}] {p['title'][:60]} (score:{p.get('score',0)})")

    # Group by ticker using ranked posts
    ticker_posts: dict[str, list] = {}
    for p in ranked_all:
        for t in (p.get("tickers") or [])[:2]:
            ticker_posts.setdefault(t, []).append(p)

    today = date.today().isoformat()
    rows = []

    # Quality gate: need at least 5 posts with real substance
    substantial = [p for p in ranked_all if len((p.get("body") or "").strip()) > 50 or is_analytical(p)]
    if len(substantial) < 5:
        print(f"\nQuality gate: only {len(substantial)} substantial posts — skipping general summary")
    else:
        print(f"\nSummarizing general market (top {min(20, len(ranked_all))} posts, {analytical_count} analytical)...")
        result = summarize(groq_keys, ranked_all, None)
        if result:
            v = validate(result)
            rows.append({
                "id": f"pulse-{today}-general",
                "date": today,
                "ticker": None,
                "source": "reddit",
                **v,
                "post_count": len(all_posts),
            })
            print(f"  ✓ General: {v['sentiment']} ({v['sentiment_score']:+d}) — {v['headline']}")
        time.sleep(2)

    # Ticker-specific summaries (3+ posts)
    for ticker, tposts in sorted(ticker_posts.items(), key=lambda x: -len(x[1])):
        if len(tposts) < 3:
            continue
        ranked_t = rank_posts(tposts)
        print(f"\nSummarizing ${ticker} ({len(ranked_t)} posts)...")
        result = summarize(groq_keys, ranked_t, ticker)
        if result:
            v = validate(result)
            rows.append({
                "id": f"pulse-{today}-{ticker}",
                "date": today,
                "ticker": ticker,
                "source": "reddit",
                **v,
                "post_count": len(tposts),
            })
            print(f"  ✓ ${ticker}: {v['sentiment']} ({v['sentiment_score']:+d}) — {v['headline']}")
        time.sleep(2)

    if not rows:
        print("\nNo summaries generated")
        return

    sb.table("market_pulse").upsert(rows, on_conflict="id").execute()
    print(f"\n✓ Upserted {len(rows)} pulse summaries")

    old_date = (date.today() - timedelta(days=7)).isoformat()
    sb.table("market_pulse").delete().eq("source", "reddit").lt("date", old_date).execute()
    print("Pruned Reddit entries older than 7 days")


if __name__ == "__main__":
    main()
