
import requests
import json
import redis
import os
import yfinance as yf
from dotenv import load_dotenv
import concurrent.futures
import time

# Load env vars
load_dotenv('.env.local')

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
CACHE_FILE = 'data/stock_cache.json'

def fetch_yf_name(sym):
    try:
        # Try .NS then .BO
        ticker_ns = f"{sym}.NS"
        t = yf.Ticker(ticker_ns)
        info = t.info
        name = info.get('longName') or info.get('shortName')
        
        if not name:
            ticker_bo = f"{sym}.BO"
            t = yf.Ticker(ticker_bo)
            info = t.info
            name = info.get('longName') or info.get('shortName')
            
        return sym, name
    except Exception:
        return sym, None

def sync_names():
    r = redis.from_url(REDIS_URL)
    
    # 1. Load from file cache (stock_cache.json)
    file_name_map = {}
    if os.path.exists(CACHE_FILE):
        print(f"Loading names from {CACHE_FILE}...")
        try:
            with open(CACHE_FILE, 'r') as f:
                cache_data = json.load(f)
                for key, val in cache_data.items():
                    if key.startswith('full_'):
                        sym = key.replace('full_', '').split('.')[0]
                        name = val.get('data', {}).get('name')
                        if name:
                            file_name_map[sym] = name
        except Exception as e:
            print(f"Warning: Failed to load file cache: {e}")

    # 2. Download Scrip Master
    print("Downloading Scrip Master...")
    scrip_name_map = {}
    try:
        response = requests.get(SCRIP_MASTER_URL)
        scrip_data = response.json()
        for x in scrip_data:
            token = x.get('token')
            name = x.get('name')
            if token and name:
                scrip_name_map[token] = name
    except Exception as e:
        print(f"Warning: Failed to download scrip master: {e}")

    # 3. Get all tracked symbols from Redis
    keys = []
    cursor = '0'
    while True:
        cursor, partial_keys = r.scan(cursor=cursor, match='trending:token:*', count=1000)
        if partial_keys:
            keys.extend(partial_keys)
        if cursor == 0 or cursor == b'0':
            break
            
    print(f"Analyzing {len(keys)} stocks...")
    
    to_enrich = []
    final_names = {}
    
    for k in keys:
        try:
            sym = k.decode('utf-8').split(':')[-1]
            token = r.get(k).decode('utf-8')
            
            # Priority 1: File Cache (Detailed Names)
            name = file_name_map.get(sym)
            
            # Priority 2: Scrip Master (if name != sym)
            if not name or name == sym:
                alt_name = scrip_name_map.get(token)
                if alt_name and alt_name != sym:
                    name = alt_name
                    
            if not name or name == sym:
                to_enrich.append(sym)
            else:
                final_names[sym] = name
        except Exception:
            continue

    print(f"Found {len(final_names)} names in local caches.")
    print(f"Need to enrich {len(to_enrich)} symbols via yfinance...")

    # Limit enrichment to avoid long delays, prioritize top stocks if needed
    # For now, let's just do it in batches for the first 100 to see quality
    enrich_limit = 500 
    to_fetch = to_enrich[:enrich_limit]
    
    if to_fetch:
        print(f"Fetching {len(to_fetch)} names via yfinance (Limit: {enrich_limit})...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_sym = {executor.submit(fetch_yf_name, s): s for s in to_fetch}
            for future in concurrent.futures.as_completed(future_to_sym):
                sym, name = future.result()
                if name:
                    final_names[sym] = name
                else:
                    # Fallback to symbol if everything fails
                    final_names[sym] = sym

    # 4. Save to Redis
    print(f"Updating Redis with {len(final_names)} names...")
    p = r.pipeline()
    updated = 0
    for sym, name in final_names.items():
        p.set(f"stock:stats:{sym}:name", name)
        updated += 1
        if updated % 100 == 0:
            p.execute()
            p = r.pipeline()
    p.execute()

    print(f"SUCCESS: Synced {updated} stock names.")

if __name__ == "__main__":
    sync_names()
