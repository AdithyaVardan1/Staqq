import redis
import json
import os
import requests
import math
import traceback
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load env vars
load_dotenv('.env.local')

# Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
ANGEL_API_KEY = os.getenv('ANGEL_ONE_API_KEY')
CLIENT_CODE = os.getenv('ANGEL_ONE_CLIENT_CODE')
PASSWORD = os.getenv('ANGEL_ONE_PASSWORD')
TOTP_SECRET = os.getenv('ANGEL_ONE_TOTP_SECRET')

# Redis
r = redis.from_url(REDIS_URL)

def get_angel_session():
    try:
        import pyotp
        totp = pyotp.TOTP(TOTP_SECRET)
        token = totp.now()
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-ClientLocalIP': '1.1.1.1',
            'X-ClientPublicIP': '1.1.1.1',
            'X-MACAddress': 'test',
            'X-PrivateKey': ANGEL_API_KEY
        }
        
        data = {
            "clientcode": CLIENT_CODE,
            "password": PASSWORD,
            "totp": token
        }
        
        res = requests.post("https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword", 
                            headers=headers, json=data)
        
        if res.status_code == 200:
            json_data = res.json()
            if json_data.get('status'):
                return json_data['data']['jwtToken']
        
        print("Auth Failed:", res.text)
        return None
    except Exception:
        traceback.print_exc()
        return None

def main():
    try:
        print(f"[{datetime.now()}] Starting Trending Engine (Angel One API)...", flush=True)
        
        # Import angel_api
        from angel_api import get_session, get_market_data
        
        # 1. Authenticate
        try:
            get_session()
            print("Angel One auth successful.", flush=True)
        except Exception as e:
            print(f"Angel One auth failed: {e}", flush=True)
            return
        
        # 2. Get List of Tracked Stocks (from Redis keys)
        keys = []
        cursor = '0'
        while True:
            cursor, partial_keys = r.scan(cursor=cursor, match='stock:avg_vol:*', count=1000)
            if partial_keys:
                keys.extend(partial_keys)
            if cursor == 0 or cursor == b'0':
                break
                
        if not keys:
            print("No average volume data found. Run daily_vol_cache.py first.", flush=True)
            return
    
        # Extract symbols
        symbols = []
        for k in keys:
            try:
                decoded_key = k.decode('utf-8')
                parts = decoded_key.split(':')
                if len(parts) > 0:
                    symbols.append(parts[-1])
            except:
                pass

        print(f"Found {len(symbols)} tracked stocks.", flush=True)
        
        # 3. Get Tokens and Exchanges from Redis
        symbol_data = {}
        for sym in symbols:
            token = r.get(f"trending:token:{sym}")
            exchange = r.get(f"stock:exchange:{sym}")
            if token:
                symbol_data[sym] = {
                    'token': token.decode('utf-8'),
                    'exchange': exchange.decode('utf-8') if exchange else 'NSE'
                }
        
        if not symbol_data:
            print("No tokens found for symbols. Cache incomplete.", flush=True)
            return

        symbol_list = list(symbol_data.keys())
        print(f"Processing {len(symbol_list)} stocks with tokens...", flush=True)
        
        # CONTINUOUS LOOP FOR LIVE UPDATES
        while True:
            cycle_start = datetime.now()
            print(f"\n[{cycle_start.strftime('%H:%M:%S')}] Starting Update Cycle...", flush=True)

            # 4. Fetch Nifty 50 benchmark
            nifty50_live_change = 0.0
            nifty_change_55d = 0.0
            try:
                nifty_data = get_market_data({"NSE": ["99926004"]})
                if nifty_data and len(nifty_data) > 0:
                    n = nifty_data[0]
                    n_ltp = float(n.get('ltp', 0))
                    n_close = float(n.get('close', 0))
                    if n_close > 0:
                        nifty50_live_change = ((n_ltp - n_close) / n_close) * 100
                    
                    n_prev_55_str = r.get("stock:stats:^NSEI:price_55d")
                    if n_prev_55_str:
                        n_prev_55 = float(n_prev_55_str)
                        nifty_change_55d = ((n_ltp - n_prev_55) / n_prev_55) * 100 if n_prev_55 != 0 else 0
                    
                    print(f"Nifty 50: Live={nifty50_live_change:.2f}%, 55d={nifty_change_55d:.2f}%", flush=True)
            except Exception as e:
                print(f"Nifty 50 benchmark error: {e}", flush=True)
            
            # Load Cache for metadata enrichment
            cache_data = {}
            CACHE_FILE = 'data/stock_cache.json'
            if os.path.exists(CACHE_FILE):
                try:
                    with open(CACHE_FILE, 'r') as f:
                        cache_data = json.load(f)
                    print(f"Loaded {len(cache_data)} items from cache for enrichment.", flush=True)
                except Exception as e:
                    print(f"Failed to load cache: {e}", flush=True)

            # 5. Fetch live data for all stocks via Angel One marketData API
            cats = {
                "top_gainers": [],
                "top_losers": [],
                "volume_shockers": [],
                "breakouts_52w": [],
                "breakdowns_52w": [],
                "outperformers": []
            }
            
            import time
            
            # Build exchange-grouped token batches (max 50 per API call)
            nse_tokens = [(sym, symbol_data[sym]['token']) for sym in symbol_list if symbol_data[sym]['exchange'] == 'NSE']
            bse_tokens = [(sym, symbol_data[sym]['token']) for sym in symbol_list if symbol_data[sym]['exchange'] == 'BSE']
            
            # Process in batches of 50
            batch_size = 50
            all_batches = []
            
            # Create NSE batches
            for i in range(0, len(nse_tokens), batch_size):
                batch = nse_tokens[i:i+batch_size]
                exchange_tokens = {"NSE": [t[1] for t in batch]}
                sym_map = {t[1]: t[0] for t in batch}
                all_batches.append(('NSE', exchange_tokens, sym_map))
            
            # Create BSE batches
            for i in range(0, len(bse_tokens), batch_size):
                batch = bse_tokens[i:i+batch_size]
                exchange_tokens = {"BSE": [t[1] for t in batch]}
                sym_map = {t[1]: t[0] for t in batch}
                all_batches.append(('BSE', exchange_tokens, sym_map))
            
            print(f"Fetching live data in {len(all_batches)} batches...", flush=True)
            
            for batch_idx, (exch, exchange_tokens, sym_map) in enumerate(all_batches):
                try:
                    fetched = get_market_data(exchange_tokens)
                    if not fetched:
                        continue
                    
                    for stock_data in fetched:
                        try:
                            token_str = str(stock_data.get('symbolToken', ''))
                            sym = sym_map.get(token_str)
                            if not sym:
                                continue
                            
                            ltp = float(stock_data.get('ltp', 0))
                            prev_close = float(stock_data.get('close', 0))
                            volume = float(stock_data.get('tradeVolume', 0))
                            
                            if ltp < 1.0 or prev_close == 0:
                                continue
                            
                            # Load Cached Stats
                            base_key = f"stock:stats:{sym}"
                            avg_vol_5d = r.get(f"{base_key}:avg_vol_5d")
                            high_52w = r.get(f"{base_key}:high_52w")
                            low_52w = r.get(f"{base_key}:low_52w")
                            price_55d = r.get(f"{base_key}:price_55d")
                            fullname = r.get(f"{base_key}:name")
                            
                            if not all([avg_vol_5d, high_52w, low_52w, price_55d]):
                                continue
                            
                            avg_vol_5d = float(avg_vol_5d)
                            high_52w = float(high_52w)
                            low_52w = float(low_52w)
                            price_55d = float(price_55d)
                            
                            pc = ((ltp - prev_close) / prev_close) * 100
                            vol_spike = volume / avg_vol_5d if avg_vol_5d > 0 else 0
                            stock_rs_55d = ((ltp - price_55d) / price_55d) * 100
                            rs_ratio = stock_rs_55d - nifty_change_55d
                            
                            # Metadata Enrichment
                            sector = "Unknown"
                            market_cap = 0
                            pe_ratio = 0
                            c_entry = cache_data.get(sym)
                            if not c_entry:
                                c_entry = cache_data.get(f"full_{sym}")
                            
                            if c_entry and 'data' in c_entry:
                                sector = c_entry['data'].get('sector', 'Unknown')
                                market_cap = c_entry['data'].get('marketCap', 0)
                                pe_ratio = c_entry['data'].get('peRatio', 0)

                            stock_obj = {
                                "symbol": sym,
                                "name": fullname.decode('utf-8') if fullname else sym,
                                "ltp": ltp,
                                "change": pc,
                                "volume": volume,
                                "spike": vol_spike,
                                "rs": rs_ratio,
                                "high_52w": high_52w,
                                "low_52w": low_52w,
                                "sector": sector,
                                "market_cap": market_cap,
                                "pe_ratio": pe_ratio
                            }

                            # 1 & 2. Gainers / Losers
                            if pc >= 2.0:
                                cats["top_gainers"].append(stock_obj)
                            elif pc <= -2.0:
                                cats["top_losers"].append(stock_obj)
                                
                            # 3. Volume Shockers (Spike >= 1.5x)
                            if vol_spike >= 1.5:
                                cats["volume_shockers"].append(stock_obj)
                                
                            # 4. 52W High Breakouts (0.5% proximity)
                            if ltp >= high_52w * 0.995:
                                cats["breakouts_52w"].append(stock_obj)

                            # 5. 52W Low Breakdowns (0.5% proximity)
                            if ltp <= low_52w * 1.005:
                                cats["breakdowns_52w"].append(stock_obj)
                                
                            # 6. Outperformers
                            if rs_ratio > 0 and pc > 0:
                                cats["outperformers"].append(stock_obj)

                        except Exception:
                            continue
                    
                    time.sleep(0.35)
                except Exception as e:
                    print(f"Error in Angel API batch {batch_idx}: {e}", flush=True)

            # Sorting and Truncating
            cats["top_gainers"].sort(key=lambda x: x['change'], reverse=True)
            cats["top_losers"].sort(key=lambda x: x['change'])
            cats["volume_shockers"].sort(key=lambda x: x['spike'], reverse=True)
            cats["breakouts_52w"].sort(key=lambda x: x['ltp']/x['high_52w'], reverse=True)
            cats["breakdowns_52w"].sort(key=lambda x: x['ltp']/x['low_52w']) 
            cats["outperformers"].sort(key=lambda x: x['rs'], reverse=True)
            
            for k in cats:
                cats[k] = cats[k][:20]

            # Print summary
            for k, v in cats.items():
                print(f"  {k}: {len(v)} stocks", flush=True)

            # Final Cache
            result = {
                "categories": cats,
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            r.set("trending_algorithm_result", json.dumps(result))
            
            elapsed = (datetime.now() - cycle_start).total_seconds()
            print(f"[{datetime.now()}] SUCCESS: Updated Trending Categories Cache (Took {elapsed:.1f}s). Sleeping 60s...", flush=True)
            time.sleep(60)

    except Exception:
        print("CRITICAL CRASH IN MAIN:", flush=True)
        traceback.print_exc()

if __name__ == "__main__":
    main()
