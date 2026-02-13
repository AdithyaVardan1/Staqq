#!/usr/bin/env python3
"""
Fetch stock market tweets using twikit and save as JSON.
Run periodically (e.g., every 5 minutes via cron or manually).

Usage:
  source .venv/bin/activate
  python scripts/fetch_tweets.py
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Resolve project root (one level up from scripts/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load .env.local manually since we're not in Next.js
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
            env[key.strip()] = val.strip()
    return env

# Search queries for Indian stock market content
SEARCH_QUERIES = [
    "indian stock market",
    "#nifty50 OR #sensex",
    "nifty stocks india",
    "BSE NSE stocks",
]

async def fetch_tweets():
    from twikit import Client

    env = load_env()
    auth_token = env.get("TWITTER_AUTH_TOKEN", "")
    ct0 = env.get("TWITTER_CT0", "")

    if not auth_token or not ct0:
        print("❌ TWITTER_AUTH_TOKEN or TWITTER_CT0 not set in .env.local")
        sys.exit(1)

    print(f"🔄 Initializing twikit client...")
    client = Client("en-US")

    # Set cookies the same way the user does in X_automation_SM
    client.set_cookies({
        "auth_token": auth_token,
        "ct0": ct0,
    })

    all_tweets = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        try:
            print(f"🔍 Searching: \"{query}\"...")
            results = await client.search_tweet(query, product="Top", count=20)

            count = 0
            for tweet in results:
                if tweet.id in seen_ids:
                    continue
                seen_ids.add(tweet.id)

                text = tweet.text or ""
                if len(text) < 20:
                    continue

                likes = getattr(tweet, "favorite_count", 0) or 0
                retweets = getattr(tweet, "retweet_count", 0) or 0
                replies = getattr(tweet, "reply_count", 0) or 0
                views = getattr(tweet, "view_count", 0) or 0
                screen_name = tweet.user.screen_name if tweet.user else ""
                created_at = tweet.created_at if hasattr(tweet, "created_at") else ""

                # Parse created_at to unix timestamp
                ts = 0
                if created_at:
                    try:
                        dt = datetime.strptime(str(created_at), "%a %b %d %H:%M:%S %z %Y")
                        ts = int(dt.timestamp())
                    except Exception:
                        ts = int(datetime.now().timestamp())

                # Extract tickers ($SYMBOL patterns)
                import re
                ticker_matches = re.findall(r'\$([A-Z]{2,10})\b', text)
                # Also find standalone uppercase words that could be tickers
                word_matches = re.findall(r'\b([A-Z]{3,10})\b', text)
                ignore = {
                    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE',
                    'NOT', 'HAVE', 'WAS', 'BUT', 'ALL', 'ONE', 'OUT', 'GET',
                    'NOW', 'NEW', 'BUY', 'SELL', 'GDP', 'RBI', 'INR', 'USD',
                    'IPO', 'ETF', 'SIP', 'NIFTY', 'SENSEX', 'SEBI', 'NSE',
                    'BSE', 'YOLO', 'FOMO', 'ATH', 'HOW', 'WHY', 'WILL',
                    'WHAT', 'FROM', 'THEY', 'THAN', 'JUST', 'ALSO', 'MORE',
                    'ONLY', 'OVER', 'LIKE', 'TIME', 'YEAR', 'KNOW', 'TAKE',
                    'INDIA', 'MARKET', 'STOCK', 'STOCKS', 'TRADE', 'TRADING',
                }
                tickers = list(set(
                    [f"${t}" for t in ticker_matches] +
                    [t for t in word_matches if t not in ignore]
                ))[:5]

                all_tweets.append({
                    "id": f"twitter-{tweet.id}",
                    "title": text[:140] + ("…" if len(text) > 140 else ""),
                    "body": text,
                    "url": f"https://twitter.com/{screen_name}/status/{tweet.id}",
                    "score": likes + retweets,
                    "comments": replies,
                    "views": views,
                    "source": "twitter",
                    "community": "X / Twitter",
                    "author": screen_name,
                    "createdAt": ts,
                    "tickers": tickers,
                    "isHot": (likes + retweets) > 50 or replies > 20,
                })
                count += 1

            print(f"   ✅ Got {count} tweets for \"{query}\"")

        except Exception as e:
            print(f"   ❌ Error searching \"{query}\": {e}")
            import traceback
            traceback.print_exc()

    # Write to data directory
    data_dir = PROJECT_ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    out_path = data_dir / "tweets.json"

    output = {
        "fetchedAt": datetime.now().isoformat(),
        "totalPosts": len(all_tweets),
        "posts": all_tweets,
    }

    out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    print(f"\n🎉 Saved {len(all_tweets)} tweets to {out_path}")

if __name__ == "__main__":
    asyncio.run(fetch_tweets())
