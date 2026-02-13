import os
import json
import re
import requests
import datetime

# Try to import PRAW, but fallback to requests if not available or not configured
try:
    import praw
    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'data', 'alerts.json')

# Subreddits to monitor (Indian Markets)
SUBREDDITS = ['IndianStreetBets', 'IndiaInvestments', 'DalalStreetTalks', 'nifty', 'StockMarketIndia']

# Stock ticker regex (Indian context - searching for all caps words that might be tickers)
# This is a heuristic. In production, we'd match against a known list of NSE/BSE tickers.
TICKER_PATTERN = r'\b[A-Z]{3,10}\b' 

# Common words to ignore ensuring they aren't mistaken for tickers
IGNORE_WORDS = {
    'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'YOU', 'ARE', 'NOT', 'HAVE', 'WAS', 'BUT',
    'ALL', 'ONE', 'OUT', 'GET', 'CAN', 'HAS', 'WHO', 'SEE', 'NOW', 'NEW', 'BUY', 'SELL',
    'GDP', 'RBI', 'INR', 'USD', 'IPO', 'LTCG', 'STCG', 'ETF', 'MF', 'SIP', 'FD', 'PF', 'PPF',
    'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY', 'MIDCAP', 'SMALLCAP', 'SEBI', 'AMC', 'NAV'
}

def extract_tickers(text):
    # Find all potential tickers
    matches = re.findall(TICKER_PATTERN, text)
    # Filter out common words and keep unique ones
    tickers = list(set([m for m in matches if m not in IGNORE_WORDS]))
    return tickers

def fetch_reddit_data_praw():
    """Fetch data using PRAW (requires credentials)."""
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    user_agent = os.getenv('REDDIT_USER_AGENT', 'python:staqq-alerts:v1.0 (by /u/staqq_dev)')

    if not client_id or not client_secret:
        print("PRAW credentials not found. Falling back to public JSON API.")
        return fetch_reddit_data_json()

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent
    )

    alerts = []
    print("Fetching data using PRAW...")

    for sub in SUBREDDITS:
        try:
            subreddit = reddit.subreddit(sub)
            # Fetch hot posts
            for post in subreddit.hot(limit=25):
                # Skip stickied posts
                if post.stickied:
                    continue
                
                tickers = extract_tickers(post.title + " " + post.selftext)
                
                # Lower threshold for Indian subs compared to WSB
                if post.score > 20 or len(tickers) > 0:
                    alerts.append({
                        'id': post.id,
                        'title': post.title,
                        'url': post.url,
                        'score': post.score,
                        'num_comments': post.num_comments,
                        'subreddit': sub,
                        'created_utc': post.created_utc,
                        'tickers': tickers[:5], # Limit to top 5 potential tickers
                        'body': post.selftext[:300] + "..." if len(post.selftext) > 300 else post.selftext
                    })
        except Exception as e:
            print(f"Error fetching r/{sub}: {e}")

    return alerts

def fetch_reddit_data_json():
    """Fetch data using public JSON endpoints (no credentials required, stricter rate limits)."""
    alerts = []
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    
    print("Fetching data using public JSON API...")
    
    for sub in SUBREDDITS:
        url = f"https://www.reddit.com/r/{sub}/hot.json?limit=25"
        try:
            resp = requests.get(url, headers=headers)
            if resp.status_code != 200:
                print(f"Failed to fetch r/{sub}: {resp.status_code}")
                continue
            
            data = resp.json()
            posts = data.get('data', {}).get('children', [])
            
            for post_data in posts:
                post = post_data['data']
                if post.get('stickied'):
                    continue
                
                title = post.get('title', '')
                body = post.get('selftext', '')
                tickers = extract_tickers(title + " " + body)
                
                # Lower threshold for Indian subs
                if post.get('score', 0) > 10 or len(tickers) > 0:
                    alerts.append({
                        'id': post.get('id'),
                        'title': title,
                        'url': post.get('url'),
                        'score': post.get('score'),
                        'num_comments': post.get('num_comments'),
                        'subreddit': sub,
                        'created_utc': post.get('created_utc'),
                        'tickers': tickers[:5],
                        'body': body[:300] + "..." if len(body) > 300 else body
                    })
                    
        except Exception as e:
            print(f"Error fetching r/{sub}: {e}")
            
    return alerts

def save_alerts(alerts):
    # Sort by score descending
    alerts.sort(key=lambda x: x['score'], reverse=True)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    
    with open(DATA_FILE, 'w') as f:
        json.dump(alerts, f, indent=2)
    print(f"Saved {len(alerts)} alerts to {DATA_FILE}")

if __name__ == "__main__":
    if PRAW_AVAILABLE and os.getenv('REDDIT_CLIENT_ID'):
        data = fetch_reddit_data_praw()
    else:
        data = fetch_reddit_data_json()
    
    save_alerts(data)
