#!/usr/bin/env python3
"""
Fetch stock market tweets using twikit and upsert to Supabase.
Run periodically (e.g., every 15 minutes via cron or manually).

Usage:
  source .venv/bin/activate
  python scripts/fetch_tweets.py
"""

import asyncio
import re
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _patch_twikit():
    try:
        from twikit.x_client_transaction.transaction import ClientTransaction
        _orig = ClientTransaction.get_indices

        async def safe_get_indices(self, *args, **kwargs):
            try:
                return await _orig(self, *args, **kwargs)
            except Exception:
                return (0, [0, 1, 2])

        ClientTransaction.get_indices = safe_get_indices
    except Exception:
        pass

_patch_twikit()


def load_env():
    env_path = PROJECT_ROOT / ".env.local"
    if not env_path.exists():
        print("❌ .env.local not found")
        sys.exit(1)
    env = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


IGNORE_WORDS = {
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE',
    'BUY', 'SELL', 'GDP', 'RBI', 'INR', 'USD', 'IPO', 'ETF', 'SIP', 'NIFTY',
    'SENSEX', 'SEBI', 'NSE', 'BSE', 'YOLO', 'FOMO', 'ATH', 'WILL', 'WHAT',
    'FROM', 'THEY', 'JUST', 'ALSO', 'MORE', 'ONLY', 'LIKE', 'TIME', 'YEAR',
    'INDIA', 'MARKET', 'STOCK', 'STOCKS', 'TRADE', 'TRADING', 'BANKNIFTY',
}


def extract_tickers(text: str) -> list:
    dollar = re.findall(r'\$([A-Z]{2,10})\b', text)
    words = re.findall(r'\b([A-Z]{3,10})\b', text)
    all_tickers = list(set(dollar + [w for w in words if w not in IGNORE_WORDS]))
    return all_tickers[:5]


async def fetch_tweets():
    from twikit import Client

    env = load_env()
    auth_token = env.get("TWITTER_AUTH_TOKEN", "")
    ct0 = env.get("TWITTER_CT0", "")
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not auth_token or not ct0:
        print("❌ TWITTER_AUTH_TOKEN or TWITTER_CT0 not set in .env.local")
        sys.exit(1)
    if not supabase_url or not supabase_key:
        print("❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.local")
        sys.exit(1)

    from supabase import create_client
    sb = create_client(supabase_url, supabase_key)

    print("Initializing twikit client...")
    client = Client("en-US")
    client.set_cookies({"auth_token": auth_token, "ct0": ct0})

    yesterday_str = datetime.fromtimestamp(
        datetime.now().timestamp() - 86400
    ).strftime("%Y-%m-%d")

    QUERIES = [
        f"(#stockmarketindia OR #nifty50 OR #banknifty) min_faves:10 since:{yesterday_str}",
        f"(\"indian stock market\" OR \"sensex\") min_faves:5 since:{yesterday_str}",
        f"from:ETMarkets OR from:Moneycontrol OR from:CNBCTV18News since:{yesterday_str}",
    ]

    rows = []
    seen_ids: set = set()

    for query in QUERIES:
        try:
            print(f"Searching: {query!r}...")
            results = await client.search_tweet(query, product="Latest", count=20)
            count = 0
            for tweet in results:
                if tweet.id in seen_ids:
                    continue
                seen_ids.add(tweet.id)

                text = tweet.text or ""
                if len(text) < 20:
                    continue

                likes     = getattr(tweet, "favorite_count", 0) or 0
                retweets  = getattr(tweet, "retweet_count", 0) or 0
                replies   = getattr(tweet, "reply_count", 0) or 0
                screen_name = tweet.user.screen_name if tweet.user else ""

                ts = 0
                created_at = getattr(tweet, "created_at", "")
                if created_at:
                    try:
                        dt = datetime.strptime(str(created_at), "%a %b %d %H:%M:%S %z %Y")
                        ts = int(dt.timestamp())
                    except Exception:
                        ts = int(datetime.now().timestamp())

                image_url = None
                if hasattr(tweet, "media") and tweet.media:
                    first = tweet.media[0]
                    image_url = getattr(first, "media_url_https", None)

                rows.append({
                    "post_id":       f"twitter-{tweet.id}",
                    "title":         text[:140] + ("..." if len(text) > 140 else ""),
                    "body":          text,
                    "url":           f"https://twitter.com/{screen_name}/status/{tweet.id}",
                    "score":         likes + retweets,
                    "comments":      replies,
                    "source":        "twitter",
                    "community":     "X / Twitter",
                    "author":        screen_name,
                    "created_at_ts": ts,
                    "tickers":       extract_tickers(text.upper()),
                    "is_hot":        (likes + retweets) > 50 or replies > 20,
                    "image":         image_url,
                })
                count += 1

            print(f"  Got {count} tweets")
        except Exception as e:
            import traceback
            print(f"  Error on query: {e}")
            traceback.print_exc()

    if not rows:
        print("No tweets fetched.")
        return

    # Upsert to Supabase (conflict on post_id)
    resp = sb.table("tweets").upsert(rows, on_conflict="post_id").execute()
    print(f"Upserted {len(rows)} tweets to Supabase")

    # Clean up tweets older than 48 hours
    cutoff_ts = int(datetime.now().timestamp()) - 48 * 3600
    sb.table("tweets").delete().lt("created_at_ts", cutoff_ts).execute()
    print("Cleaned up old tweets")


if __name__ == "__main__":
    asyncio.run(fetch_tweets())
