
import redis
import json
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
r = redis.from_url(REDIS_URL)

def check():
    data = r.get('trending_algorithm_result')
    if not data:
        print("No trending data found.")
        return
    
    result = json.loads(data)
    cats = result.get('categories', {})
    
    for cat, stocks in cats.items():
        print(f"\n--- {cat} ---")
        for s in stocks[:3]:
            print(f"{s.get('symbol')}: {s.get('name')}")

if __name__ == "__main__":
    check()
