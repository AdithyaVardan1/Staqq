#!/usr/bin/env python3
"""
Summarize latest market news using Groq LLM.
Fetches LiveMint + BusinessLine RSS, generates an AI market brief,
stores in market_pulse table with source='news'.

Runs every 30 min during market hours via GitHub Actions.
Skips if a news pulse was generated in the last 20 minutes.
"""

import sys
import re
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree as ET

import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

MODEL_CHAIN = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

RSS_FEEDS = [
    ("https://www.livemint.com/rss/markets",                            "LiveMint"),
    ("https://www.thehindubusinessline.com/markets/feeder/default.rss", "BusinessLine"),
    ("https://economictimes.indiatimes.com/markets/rss.cms",            "EconomicTimes"),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RSS reader)",
    "Accept": "application/rss+xml, application/xml, text/xml",
}

BANNED_PHRASES = [
    "it's worth noting", "it is worth noting", "it's important to",
    "investors are discussing", "people are talking about",
    "some investors", "some traders", "market participants",
    "according to reports", "sources indicate",
    "sparking concerns", "market stability", "in the coming",
    "it has been reported", "the market is expected",
]


def load_env() -> dict:
    env_path = PROJECT_ROOT / ".env.local"
    if not env_path.exists():
        print("❌ .env.local not found")
        sys.exit(1)
    env: dict = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
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


# ── RSS parsing ──────────────────────────────────────────────────────

def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").replace("&nbsp;", " ").replace("&amp;", "&").strip()


def fetch_feed(url: str, label: str) -> list[dict]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if not resp.ok:
            print(f"  ⚠️  {label}: HTTP {resp.status_code}")
            return []

        root = ET.fromstring(resp.content)
        ns = {"media": "http://search.yahoo.com/mrss/"}
        items = root.findall(".//item")
        articles = []

        for item in items[:20]:
            title = strip_html((item.findtext("title") or "").strip())
            desc  = strip_html((item.findtext("description") or "").strip())
            link  = (item.findtext("link") or "").strip()
            pub   = (item.findtext("pubDate") or "").strip()

            if not title or len(title) < 20:
                continue

            # Parse publish time
            ts = 0
            if pub:
                try:
                    from email.utils import parsedate_to_datetime
                    ts = int(parsedate_to_datetime(pub).timestamp())
                except Exception:
                    pass

            articles.append({
                "source": label,
                "title":  title,
                "body":   desc[:300] if desc else "",
                "url":    link,
                "ts":     ts,
            })

        print(f"  {label}: {len(articles)} articles")
        return articles

    except ET.ParseError as e:
        print(f"  {label}: XML parse error — {e}")
        return []
    except Exception as e:
        print(f"  {label}: {e}")
        return []


def fetch_all_articles() -> list[dict]:
    all_articles = []
    for url, label in RSS_FEEDS:
        articles = fetch_feed(url, label)
        all_articles.extend(articles)
        time.sleep(0.5)

    # Sort by publish time (newest first), dedupe by title similarity
    all_articles.sort(key=lambda a: a["ts"], reverse=True)
    seen: set[str] = set()
    unique = []
    for a in all_articles:
        key = a["title"][:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(a)

    return unique[:25]


# ── Groq LLM ────────────────────────────────────────────────────────

GOOD_EXAMPLE = """{
  "headline": "Sun Pharma +5% on $11.75bn Organon deal; Nifty opens 140 pts higher",
  "summary": "Sun Pharma's all-cash Organon acquisition is the day's clearest catalyst — bulls argue it diversifies into branded specialty at scale; bears flag the 18x EBITDA price tag and integration risk. Hormuz ceasefire signals are separately pushing Nifty above 24,200 technical resistance, potentially reversing Friday's FII sell of ₹8,800 Cr.",
  "sentiment": "bullish",
  "sentiment_score": 52,
  "topics": ["sun-pharma-organon", "nifty-open", "hormuz-ceasefire", "pharma-m&a"]
}"""

BAD_EXAMPLE = """NEVER write like this:
  "headline": "Market Shows Mixed Signals",
  "summary": "According to reports, the market is experiencing uncertainty. Some investors are cautious while market participants remain watchful. It is worth noting that volatility continues."
Banned phrases: "according to reports", "sources indicate", "it is worth noting", "market participants", "some investors", passive voice, vague mood words.
These examples are STYLE GUIDES ONLY — do not copy their content."""


def build_news_prompt(articles: list[dict]) -> str:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=3)

    lines = []
    for i, a in enumerate(articles[:20]):
        fresh = "🔴" if a["ts"] > cutoff.timestamp() else ""
        lines.append(
            f"[{i+1}] {fresh} [{a['source']}] {a['title']}"
            + (f"\n{a['body'][:200]}" if a["body"] else "")
        )

    article_block = "\n\n".join(lines)

    return f"""You are a sharp financial journalist writing a real-time market brief for Indian investors. Think Bloomberg TV opening summary — specific, punchy, and with a clear market take.

Here are the {len(lines)} most recent market news articles (🔴 = last 3 hours):

{article_block}

Priority:
1. LEAD with the biggest price-moving story (deal, earnings, macro event, policy)
2. Add the second most important angle if it changes the overall market direction
3. End with the single most actionable thing to watch

GOOD (write like this):
{GOOD_EXAMPLE}

{BAD_EXAMPLE}

Rules:
- headline: max 85 chars, must contain either a % move, a company name, or an event — never "market uncertainty"
- summary: 2-3 SHORT sentences. Every sentence must contain a named company, specific number, or concrete trade angle. Bull case vs bear case in real tension. End with a specific watchpoint.
- sentiment: bullish / bearish / neutral / mixed
- sentiment_score: -100 to +100
- topics: 3-5 specific lowercase tags ("sun-pharma-organon", "nifty-open", not "markets", "stocks")

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
                "temperature": 0.55,
                "max_tokens": 500,
            },
            timeout=30,
        )
        if resp.status_code == 429:
            return "RATE_LIMITED"
        if not resp.ok:
            print(f"    Groq {model} {resp.status_code}: {resp.text[:100]}")
            return None
        return json.loads(resp.json()["choices"][0]["message"]["content"])
    except json.JSONDecodeError as e:
        print(f"    JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"    Request error: {e}")
        return None


def is_valid(result: dict) -> tuple[bool, str]:
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


def summarize(keys: list, articles: list[dict]) -> dict | None:
    base_prompt = build_news_prompt(articles)
    retry_note  = ""

    for attempt in range(3):
        prompt = base_prompt + retry_note
        for model in MODEL_CHAIN:
            for key in keys:
                print(f"    [{attempt+1}/3] {model[:35]}...")
                result = call_groq(key, model, prompt)

                if result == "RATE_LIMITED":
                    continue
                if result is None:
                    time.sleep(1)
                    continue

                ok, reason = is_valid(result)
                if ok:
                    return result

                print(f"    Rejected ({reason}) — retrying")
                retry_note = f"\n\nFix: previous attempt was rejected — {reason}."
                time.sleep(1)
                break
            else:
                print(f"    All keys rate-limited on {model}")
                time.sleep(3)
                continue
            break

    return None


def validate(r: dict) -> dict:
    score = r.get("sentiment_score", 0)
    try:
        score = max(-100, min(100, int(score)))
    except (TypeError, ValueError):
        score = 0
    topics = r.get("topics", [])
    if not isinstance(topics, list):
        topics = []
    return {
        "headline":        (r.get("headline") or "")[:200].strip(),
        "summary":         (r.get("summary") or "").strip(),
        "sentiment":       r.get("sentiment", "neutral"),
        "sentiment_score": score,
        "topics":          [str(t).lower()[:40] for t in topics[:5]],
    }


def main() -> None:
    env        = load_env()
    sb_url     = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    sb_key     = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    groq_keys  = load_groq_keys(env)

    if not sb_url or not sb_key:
        print("❌ Supabase credentials missing")
        sys.exit(1)
    if not groq_keys:
        print("❌ No Groq keys found")
        sys.exit(1)

    print(f"✓ {len(groq_keys)} Groq key(s) · models: {' → '.join(MODEL_CHAIN)}")

    from supabase import create_client
    sb = create_client(sb_url, sb_key)

    # Skip if a news pulse was generated in the last 20 minutes
    try:
        recent = (
            sb.table("market_pulse")
            .select("created_at")
            .eq("source", "news")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if recent.data:
            last_ts = datetime.fromisoformat(recent.data[0]["created_at"].replace("Z", "+00:00"))
            age_min = (datetime.now(timezone.utc) - last_ts).total_seconds() / 60
            if age_min < 20:
                print(f"⏭  Last news pulse {age_min:.0f} min ago — skipping")
                return
    except Exception:
        # source column may not exist yet — migration 010 needs to be applied
        print("  ⚠️  source column missing — run migration 010_market_pulse_source.sql")

    # Fetch articles
    print("Fetching RSS feeds...")
    articles = fetch_all_articles()
    if len(articles) < 5:
        print(f"❌ Only {len(articles)} articles — not enough to summarize")
        return
    print(f"  {len(articles)} unique articles ready")
    print(f"  Top story: {articles[0]['title'][:80]}")

    # Summarize
    print("\nSummarizing news...")
    result = summarize(groq_keys, articles)
    if not result:
        print("❌ Summarization failed")
        return

    v = validate(result)

    # Build a time-based ID so multiple entries can coexist per day
    now = datetime.now(timezone.utc)
    slot = now.strftime("%Y-%m-%d-%H%M")
    row = {
        "id":              f"pulse-news-{slot}",
        "date":            now.strftime("%Y-%m-%d"),
        "ticker":          None,
        "source":          "news",
        "post_count":      len(articles),
        **v,
    }

    try:
        sb.table("market_pulse").upsert([row], on_conflict="id").execute()
    except Exception as e:
        if "source" in str(e):
            # Migration not yet applied — upsert without source column
            row_no_source = {k: v for k, v in row.items() if k != "source"}
            sb.table("market_pulse").upsert([row_no_source], on_conflict="id").execute()
            print("  ⚠️  Upserted without source (run migration 010 to enable filtering)")
        else:
            raise

    print(f"\n✓ News pulse: {v['sentiment']} ({v['sentiment_score']:+d}) — {v['headline']}")

    # Keep only last 6 hours of news pulses
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
        sb.table("market_pulse").delete().eq("source", "news").lt("created_at", cutoff).execute()
        print("Pruned news pulses older than 6 hours")
    except Exception:
        pass


if __name__ == "__main__":
    main()
