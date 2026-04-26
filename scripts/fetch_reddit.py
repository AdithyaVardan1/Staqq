#!/usr/bin/env python3
"""
Fetch Indian stock market Reddit posts and upsert to Supabase.
Runs via GitHub Actions cron -- Reddit blocks Vercel/AWS IPs, but not GitHub's.
"""

import sys
import time
import re
from pathlib import Path
from datetime import datetime
import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent


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
    'BEEN', 'MUCH', 'SOME', 'YOUR', 'VERY', 'MOST', 'OVER', 'SUCH', 'MAKE',
    'WELL', 'BACK', 'GOOD', 'BEST', 'LAST', 'HELP', 'NEXT', 'DOWN', 'HIGH',
    'NEWS', 'POST', 'PRICE', 'VALUE', 'LEVEL', 'TOTAL', 'MONTH', 'DAILY',
    'SHARE', 'SHARES', 'PROFIT', 'GROWTH', 'RETURN', 'INVEST', 'EQUITY',
}


def extract_tickers(text: str) -> list:
    dollar = re.findall(r'\$([A-Z]{2,10})\b', text)
    words = re.findall(r'\b([A-Z]{3,10})\b', text)
    all_tickers = list(set(dollar + [w for w in words if w not in IGNORE_WORDS]))
    return all_tickers[:5]


SUBREDDITS = [
    'IndianStockMarket',
    'IndianStreetBets',
    'IndiaInvestments',
    'DalalStreetTalks',
]

HEADERS = {
    'User-Agent': 'Staqq/1.0 (Indian stock market app; contact@staqq.com)',
}


def fetch_subreddit(sub: str) -> list:
    rows = []
    seen_ids: set = set()

    for sort in ('hot', 'new'):
        url = f'https://www.reddit.com/r/{sub}/{sort}.json?limit=50'
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                print(f'  r/{sub}/{sort}: HTTP {resp.status_code} — skipping')
                time.sleep(1)
                continue

            children = resp.json().get('data', {}).get('children', [])
            count = 0

            for child in children:
                post = child.get('data', {})
                if post.get('stickied'):
                    continue

                post_id = post.get('id', '')
                if not post_id or post_id in seen_ids:
                    continue
                seen_ids.add(post_id)

                score = post.get('score', 0) or 0
                num_comments = post.get('num_comments', 0) or 0
                title = (post.get('title') or '').strip()
                body = (post.get('selftext') or '').strip()
                if len(body) > 300:
                    body = body[:300] + '...'

                tickers = extract_tickers((title + ' ' + body).upper())

                if score < 5 and not tickers:
                    continue

                image = None
                if post.get('post_hint') == 'image' and post.get('url'):
                    image = post['url']
                elif post.get('preview', {}).get('images'):
                    src = post['preview']['images'][0].get('source', {}).get('url', '')
                    if src:
                        image = src.replace('&amp;', '&')

                permalink = post.get('permalink', '')
                post_url = (
                    f"https://reddit.com{permalink}"
                    if permalink
                    else f"https://reddit.com/r/{sub}/comments/{post_id}"
                )

                rows.append({
                    'post_id':       f'reddit-{post_id}',
                    'title':         title[:200],
                    'body':          body,
                    'url':           post_url,
                    'score':         score,
                    'comments':      num_comments,
                    'source':        'reddit',
                    'community':     sub,
                    'author':        post.get('author') or None,
                    'created_at_ts': int(post.get('created_utc', 0)),
                    'tickers':       tickers,
                    'is_hot':        score > 100 or num_comments > 50,
                    'image':         image,
                })
                count += 1

            print(f'  r/{sub}/{sort}: {count} posts')
            time.sleep(1)

        except Exception as e:
            print(f'  r/{sub}/{sort}: Error — {e}')
            time.sleep(2)

    return rows


def main():
    env = load_env()
    supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

    if not supabase_url or not supabase_key:
        print('❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
        sys.exit(1)

    from supabase import create_client
    sb = create_client(supabase_url, supabase_key)

    all_rows = []
    for sub in SUBREDDITS:
        print(f'Fetching r/{sub}...')
        rows = fetch_subreddit(sub)
        all_rows.extend(rows)

    if not all_rows:
        print('No Reddit posts fetched.')
        return

    for i in range(0, len(all_rows), 100):
        batch = all_rows[i:i + 100]
        sb.table('tweets').upsert(batch, on_conflict='post_id').execute()

    print(f'Upserted {len(all_rows)} Reddit posts to Supabase.')

    cutoff_ts = int(datetime.now().timestamp()) - 48 * 3600
    sb.table('tweets').delete().lt('created_at_ts', cutoff_ts).eq('source', 'reddit').execute()
    print('Cleaned up Reddit posts older than 48 hours.')


if __name__ == '__main__':
    main()
