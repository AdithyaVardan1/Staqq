import requests
import json
import redis
import yfinance as yf
import pandas as pd
import os
import sys
import re
import traceback
from datetime import datetime, timedelta
import concurrent.futures

# Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
BATCH_SIZE = 50  # Number of tickers to fetch from yfinance at once
MAX_WORKERS = 5  # Parallel threads

def get_redis_client():
    return redis.from_url(REDIS_URL)

def download_scrip_master():
    print("Downloading Scrip Master...")
    response = requests.get(SCRIP_MASTER_URL)
    data = response.json()
    return data

def filter_stocks(scrip_data):
    print("Filtering for NSE and BSE Equity (including SMEs)...")
    
    # 1. Filter NSE Stocks
    # We include EQ (Main), SM (SME), ST (SME/Other), BE (Trade to Trade)
    nse_allowed = ['-EQ', '-SM', '-ST', '-BE']
    nse_stocks = []
    for x in scrip_data:
        if x['exch_seg'] == 'NSE' and 'token' in x:
            sym = x['symbol']
            if any(sym.endswith(suffix) for suffix in nse_allowed):
                clean_sym = sym
                current_suffix = '.NS'
                
                # For EQ, we strip the suffix for a cleaner display symbol if needed,
                # but for SMEs, yfinance often needs the -SM or -ST suffix in the ticker.
                if sym.endswith('-EQ'):
                    clean_sym = sym[:-3]
                    current_suffix = '.NS'
                elif any(sym.endswith(sfx) for sfx in ['-SM', '-ST', '-BE']):
                    # Keep the -SM/-ST part as it's part of the official ticker often
                    clean_sym = sym
                    current_suffix = '.NS'
                
                nse_stocks.append({
                    'symbol': clean_sym,
                    'orig_symbol': sym,
                    'token': x['token'],
                    'name': x['name'],
                    'suffix': current_suffix
                })

    # 2. Filter BSE Stocks
    # BSE symbols in Angel Scrip Master are often numeric or plain strings.
    # We look for exch_seg == 'BSE' and check if they are likely equity.
    bse_stocks = []
    for x in scrip_data:
        if x['exch_seg'] == 'BSE' and 'token' in x:
            sym = x['symbol']
            name = (x.get('name') or '').upper()
            
            # Exclusion Logic:
            # 1. More than 2 digits in symbol usually means Bond/Debenture/G-Sec (e.g., 804AFL35, GS19MAR2026)
            #    Most valid equities have 0 digits (RELIANCE) or 1-2 (63MOONS, 20MICRONS)
            if len(re.findall(r'\d', sym)) > 2:
                continue
            
            # 2. Explicit keywords in Name indicating non-equity
            if any(k in name for k in [' GOVT ', ' BOND ', ' DEB ', ' SGB ', ' GS ', ' TBILL ']):
                continue
                
            if x.get('instrumenttype') == '' or x.get('instrumenttype') == 'NSE_CASH': 
                bse_stocks.append({
                    'symbol': x['symbol'],
                    'orig_symbol': x['symbol'],
                    'token': x['token'],
                    'name': x['name'],
                    'suffix': '.BO'
                })

    # Combine and de-duplicate by yfinance ticker
    combined = {}
    for s in nse_stocks:
        ticker = f"{s['symbol']}{s['suffix']}"
        combined[ticker] = s
    
    for s in bse_stocks:
        ticker = f"{s['symbol']}{s['suffix']}"
        # If it's on NSE, we usually prefer NSE, but if it has a unique ticker, add it.
        if ticker not in combined:
            combined[ticker] = s

    final_list = list(combined.values())
    print(f"Total Unique Tickers Found: {len(final_list)} (NSE: {len(nse_stocks)}, BSE approx: {len(bse_stocks)})")
    return final_list

def fetch_and_cache_stats(stocks, r):
    """Fetch historical stats using Angel One candle data API."""
    from angel_api import get_candle_data, get_session
    import time
    
    print(f"Fetching historical stats for {len(stocks)} stocks via Angel One API...")
    total_stocks = len(stocks)
    
    # Authenticate first
    try:
        get_session()
        print("Angel One auth successful.")
    except Exception as e:
        print(f"Angel One auth failed: {e}")
        return
    
    # Date range: 1 year back to today
    today = datetime.now()
    from_date = (today - timedelta(days=365)).strftime("%Y-%m-%d 09:15")
    to_date = today.strftime("%Y-%m-%d 15:30")
    
    # 1. Cache Nifty 50 benchmark (token: 99926004, exchange: NSE)
    try:
        nifty_candles = get_candle_data('NSE', '99926004', from_date, to_date)
        if nifty_candles and len(nifty_candles) >= 55:
            # Candle format: [timestamp, open, high, low, close, volume]
            n_close_55 = float(nifty_candles[-55][4])
            r.set("stock:stats:^NSEI:price_55d", n_close_55)
            print(f"Cached Nifty 50 55d price: {n_close_55:.2f}")
        time.sleep(0.35)
    except Exception as e:
        print(f"Failed to cache Nifty 50 stats: {e}")

    # 2. Process all stocks
    cached = 0
    failed = 0
    no_data_count = 0
    
    # Limit to 100 stocks for testing as requested - REVERTED
    # stocks = stocks[:100] 
    # print(f"TEST MODE: Processing first {len(stocks)} stocks with 3s delay.")
    
    for i, stock in enumerate(stocks):
        sym = stock['symbol']
        token = stock['token']
        orig_sym = stock['orig_symbol']
        fullname = stock.get('name', sym)
        # print(f"DEBUG: Processing {i+1} {sym}", flush=True) 
        
        # Determine exchange from suffix
        exchange = 'BSE' if stock.get('suffix') == '.BO' else 'NSE'
        
        try:
            candles = get_candle_data(exchange, token, from_date, to_date)
            
            if not candles or len(candles) < 2:
                # print(f"  [INFO] Data missing for {sym}", flush=True) 
                no_data_count += 1
                continue
            
            # Extract arrays from candle data
            # Format: [timestamp, open, high, low, close, volume]
            
            # Filter out today's incomplete candle if present
            today_str = datetime.now().strftime("%Y-%m-%d")
            valid_candles = []
            for c in candles:
                # Angel timestamp format is usually "2025-02-19T09:15:00+05:30" or similar
                # We check if the date part matches today
                if c[0].startswith(today_str):
                    continue
                valid_candles.append(c)
            
            if not valid_candles or len(valid_candles) < 2:
                no_data_count += 1
                # Only log first few no-data instances to avoid spam
                if no_data_count <= 5:
                    print(f"  Info: No valid data for {sym} ({exchange})")
                continue

            volumes = [c[5] for c in valid_candles]
            highs = [c[2] for c in valid_candles]
            lows = [c[3] for c in valid_candles]
            closes = [c[4] for c in valid_candles]
            
            # 1. 5-Day Average Volume
            avg_vol_5d = int(sum(volumes[-5:]) / min(5, len(volumes))) if volumes else 0
            
            # 2. 52-Week High / Low (use all available data up to 252 days)
            last_252_h = highs[-252:] if len(highs) >= 252 else highs
            last_252_l = lows[-252:] if len(lows) >= 252 else lows
            high_52w = max(last_252_h)
            low_52w = min(last_252_l)
            
            # 3. 55-Day Historical Close Price
            price_55d = closes[-55] if len(closes) >= 55 else closes[0]
            
            # Store in Redis
            base_key = f"stock:stats:{sym}"
            p = r.pipeline()
            p.setex(f"{base_key}:avg_vol_5d", 86400, int(avg_vol_5d))
            p.setex(f"{base_key}:high_52w", 86400, float(high_52w))
            p.setex(f"{base_key}:low_52w", 86400, float(low_52w))
            p.setex(f"{base_key}:price_55d", 86400, float(price_55d))
            p.setex(f"stock:avg_vol:{sym}", 86400, int(avg_vol_5d))
            p.set(f"stock:stats:{sym}:name", fullname)
            
            # Store token + exchange for trending engine
            p.set(f"trending:token:{sym}", token)
            p.set(f"stock:exchange:{sym}", exchange)
            p.execute()
            
            cached += 1
            
            if (i + 1) % 100 == 0:
                print(f"  Progress: {cached} cached, {no_data_count} empty, {failed} errors, {i + 1}/{total_stocks} processed", flush=True)
            
        except Exception as e:
            failed += 1
            print(f"  [ERROR] {sym}: {type(e).__name__} - {str(e)}", flush=True)
            
        finally:
            # Rate limiting: 1.2s delay to be safe (RUNS ALWAYS)
            time.sleep(1.2)

    print(f"Historical stats caching complete. Cached: {cached}, Failed: {failed}")

def main():
    try:
        r = get_redis_client()
        scrip_data = download_scrip_master()
        stocks = filter_stocks(scrip_data)
        fetch_and_cache_stats(stocks, r)
        print("Angel One Historical Cache Job Finished Successfully.")
    except Exception as e:
        print(f"Job Failed: {e}")

if __name__ == "__main__":
    main()

