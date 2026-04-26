#!/usr/bin/env python3
"""
Fetch Indian stock market Reddit posts and upsert to Supabase.
Uses reddit_session cookie for authenticated requests -- bypasses the cloud IP block
that Reddit applies to unauthenticated requests from AWS/GitHub/Vercel IPs.
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
    # Common English words
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE',
    'WAS', 'BUT', 'ALL', 'ONE', 'OUT', 'GET', 'CAN', 'HAS', 'WHO', 'SEE',
    'NOW', 'NEW', 'ANY', 'HOW', 'WHY', 'ITS', 'OUR', 'PAY', 'USE', 'WAY',
    'MAY', 'DAY', 'TRY', 'SAY', 'HIS', 'HER', 'HIM', 'TWO', 'OLD', 'BIG',
    'END', 'OWN', 'SET', 'RUN', 'ADD', 'ASK', 'OFF', 'LET', 'TOP', 'FEW',
    'DOES', 'BEEN', 'MUCH', 'JUST', 'WILL', 'WHAT', 'FROM', 'THEY', 'THAN',
    'SOME', 'YOUR', 'ALSO', 'VERY', 'MORE', 'MOST', 'ONLY', 'OVER', 'SUCH',
    'MAKE', 'LIKE', 'TIME', 'YEAR', 'EACH', 'KNOW', 'TAKE', 'COME', 'WANT',
    'GIVE', 'MANY', 'WELL', 'BACK', 'GOOD', 'BEST', 'LAST', 'HELP', 'NEXT',
    'THEM', 'THEN', 'WHEN', 'WERE', 'SAID', 'EACH', 'WHICH', 'THEIR', 'THERE',
    'BEEN', 'WOULD', 'COULD', 'SHOULD', 'MIGHT', 'EVERY', 'FIRST', 'GREAT',
    'FOUND', 'GOING', 'USING', 'DOING', 'BASED', 'SINCE', 'UNTIL', 'WHILE',
    'ABOUT', 'AFTER', 'AGAIN', 'STILL', 'THINK', 'THOSE', 'WHERE', 'OTHER',
    'BEING', 'THESE', 'BELOW', 'ABOVE', 'UNDER', 'NEVER', 'ALWAYS', 'TODAY',
    'HIGH', 'LOW', 'LOOK', 'NEED', 'KEEP', 'SHOW', 'MOVE', 'WORK', 'DONE',
    'PART', 'FACT', 'HAND', 'MUST', 'REAL', 'SURE', 'FREE', 'EVEN', 'FULL',
    'HALF', 'LATE', 'TRUE', 'OPEN', 'HARD', 'SAME', 'ABLE', 'KNOW', 'ONLY',
    'BOTH', 'EACH', 'MUCH', 'SUCH', 'MANY', 'MOST', 'JUST', 'INTO', 'OVER',
    'ALSO', 'BACK', 'AFTER', 'WELL', 'EVEN', 'WANT', 'FEEL', 'SEEM', 'KEEP',
    'READ', 'WEEK', 'WEEKLY', 'MONTH', 'DAILY', 'ANNUAL', 'YEARS', 'DAYS',
    'PEOPLE', 'ANYONE', 'EVERYONE', 'SOMEONE', 'PLEASE', 'REALLY', 'SIMPLY',
    'THINK', 'THING', 'THINGS', 'RIGHT', 'POINT', 'CASE', 'FACT', 'HAND',
    'BETWEEN', 'THROUGH', 'ACROSS', 'DURING', 'BEFORE', 'ANOTHER', 'SECOND',
    'INSIDE', 'BILLION', 'MILLION', 'THOUSAND', 'HUNDRED', 'NUMBER', 'AMOUNT',
    # Finance generic terms (not tickers)
    'BUY', 'SELL', 'HOLD', 'LONG', 'SHORT', 'CALL', 'PUT', 'LOSS', 'GAIN',
    'RISE', 'FALL', 'PLAN', 'RATE', 'RISK', 'SAFE', 'PICK', 'RULE', 'GOAL',
    'GDP', 'RBI', 'INR', 'USD', 'IPO', 'LTCG', 'STCG', 'ETF', 'SIP', 'PPF',
    'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY', 'MIDCAP', 'SMALLCAP',
    'SEBI', 'NSE', 'BSE', 'FII', 'DII', 'ATH', 'AMC', 'NAV', 'AUM',
    'RSI', 'MACD', 'EMA', 'SMA', 'DMA', 'VWAP', 'EPS', 'CAGR', 'XIRR',
    'YOLO', 'FOMO', 'BTST', 'STBT', 'CNC', 'MIS', 'NRML', 'SLM',
    'EDIT', 'UPDATE', 'TIL', 'PSA', 'IMO', 'TLDR', 'AMA', 'TBH', 'LMAO',
    'NEWS', 'POST', 'PRICE', 'VALUE', 'LEVEL', 'TOTAL', 'WORTH', 'INCOME',
    'STOCK', 'STOCKS', 'SHARE', 'SHARES', 'TRADE', 'TRADES', 'TRADING',
    'MARKET', 'INVEST', 'PROFIT', 'GROWTH', 'RETURN', 'EQUITY', 'SECTOR',
    'INDEX', 'LISTED', 'OPTION', 'OPTIONS', 'FUTURE', 'FUTURES', 'MUTUAL',
    'DIRECT', 'FUND', 'FUNDS', 'MONEY', 'CASH', 'BANK', 'LOAN', 'DEBT',
    'INDIA', 'INDIAN', 'ADVANCE', 'CURRENT', 'AVERAGE', 'ACTUAL', 'RECENT',
    # Company type suffixes that appear in text but aren't tickers
    'LIMITED', 'PRIVATE', 'PUBLIC', 'GROUP', 'CORP', 'COMPANY', 'ENTERPRISE',
    # Words from common Reddit post patterns
    'EMPLOYEE', 'OWNERSHIP', 'INVESTMENT', 'PORTFOLIO', 'DIVIDEND', 'INTEREST',
    'ACCOUNT', 'BALANCE', 'CAPITAL', 'EXPENSE', 'INCOME', 'SALARY', 'BONUS',
    'FRESHER', 'SENIOR', 'JUNIOR', 'MANAGER', 'ANALYST', 'BROKER', 'ADVISOR',
    'QUESTION', 'ANSWER', 'COMMENT', 'ADVICE', 'SUGGEST', 'RECOMMEND',
    'BETTER', 'WORSE', 'HIGHER', 'LOWER', 'BIGGER', 'SMALLER', 'LONGER',
    'SHOULD', 'COULD', 'WOULD', 'MIGHT', 'SHALL', 'GOING', 'DOING', 'BEING',
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

# Mimic a real browser -- Reddit checks User-Agent alongside session cookies
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
}


def fetch_subreddit(sub: str, session_cookie: str) -> list:
    rows = []
    seen_ids: set = set()
    cookies = {'reddit_session': session_cookie} if session_cookie else {}

    for sort in ('hot', 'new'):
        url = f'https://www.reddit.com/r/{sub}/{sort}.json?limit=50'
        try:
            resp = requests.get(url, headers=HEADERS, cookies=cookies, timeout=10)
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

                if score < 10 and not tickers:
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
    reddit_session = env.get('REDDIT_SESSION', '')

    if not supabase_url or not supabase_key:
        print('❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
        sys.exit(1)

    if not reddit_session:
        print('⚠️  REDDIT_SESSION not set — requests will be unauthenticated (may 403)')
    else:
        print('✓ Using reddit_session cookie for authenticated requests')

    from supabase import create_client
    sb = create_client(supabase_url, supabase_key)

    all_rows = []
    for sub in SUBREDDITS:
        print(f'Fetching r/{sub}...')
        rows = fetch_subreddit(sub, reddit_session)
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
