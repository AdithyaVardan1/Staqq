#!/usr/bin/env python3
"""
twikit_bridge.py — Twikit sidecar for Staqq crypto signals
Called by Node.js via child_process.spawn.

stdin:  JSON { action: "fetch_crypto", count, cookies }
stdout: JSON { success, tweets?, count?, error? }

Since search_tweet requires a privileged account, we pull tweets
from known high-signal crypto accounts instead.
"""

import sys
import json
import asyncio
from twikit import Client


# Known high-signal crypto accounts to scrape
CRYPTO_ACCOUNTS = [
    'WatcherGuru',
    'CoinDesk',
    'CoinTelegraph',
    'Decrypt_Media',
    'whale_alert',
    'lookonchain',
    'DefiIgnas',
    'MustStopMurad',   # meme coin alpha
    'CryptoKaleo',
    'AltcoinGordon',
]

CRYPTO_KEYWORDS = {
    'moon', 'pump', 'rug', 'gem', 'launch', 'presale', 'listed', 'bullish',
    'bearish', 'breakout', 'ath', 'dip', 'buy', 'sell', 'airdrop', 'mint',
    'trending', 'signal', 'alpha', 'whale', 'moved', 'buying', 'selling'
}


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


def build_client(cookies_data):
    client = Client("en-US")
    if isinstance(cookies_data, list):
        cookie_dict = {c["name"]: c["value"] for c in cookies_data if "name" in c and "value" in c}
    elif isinstance(cookies_data, dict):
        cookie_dict = cookies_data
    else:
        return None, "Unknown cookies format"
    client.set_cookies(cookie_dict)
    return client, None


def is_relevant(text: str) -> bool:
    text_lower = text.lower()
    has_ticker = '$' in text
    has_keyword = any(kw in text_lower for kw in CRYPTO_KEYWORDS)
    return has_ticker or has_keyword


async def run(payload: dict) -> dict:
    action = payload.get("action")
    count = int(payload.get("count", 10))
    cookies_data = payload.get("cookies")

    if not cookies_data:
        return {"success": False, "error": "No cookies provided"}

    client, err = build_client(cookies_data)
    if err:
        return {"success": False, "error": err}

    try:
        if action == "fetch_crypto":
            all_tweets = []

            # Resolve user IDs first (needed for get_user_tweets)
            user_ids = []
            for handle in CRYPTO_ACCOUNTS:
                try:
                    user = await client.get_user_by_screen_name(handle)
                    if user:
                        user_ids.append((handle, str(user.id)))
                    await asyncio.sleep(0.3)
                except Exception:
                    continue

            # Fetch recent tweets from each account
            for handle, uid in user_ids:
                try:
                    tweets = await client.get_user_tweets(uid, 'Tweets', count=count)
                    for t in tweets:
                        if not is_relevant(t.text):
                            continue
                        all_tweets.append({
                            "id": str(t.id),
                            "text": t.text,
                            "author": t.user.name if hasattr(t, "user") and t.user else handle,
                            "authorHandle": handle,
                            "createdAt": str(t.created_at),
                            "likeCount": getattr(t, "favorite_count", getattr(t, "like_count", 0)),
                            "retweetCount": getattr(t, "retweet_count", 0),
                            "url": f"https://x.com/{handle}/status/{t.id}",
                        })
                    await asyncio.sleep(0.5)
                except Exception:
                    continue

            # Sort by like count desc
            all_tweets.sort(key=lambda t: t["likeCount"], reverse=True)

            return {"success": True, "tweets": all_tweets, "count": len(all_tweets)}

        else:
            return {"success": False, "error": f"Unknown action: {action}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        print(json.dumps({"success": False, "error": "No input"}))
        sys.exit(1)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    result = asyncio.run(run(payload))
    print(json.dumps(result))
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
