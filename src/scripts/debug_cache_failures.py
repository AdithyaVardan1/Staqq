"""Debug daily_vol_cache.py failures."""
import requests
import random
from angel_api import get_candle_data, get_session
import concurrent.futures
from datetime import datetime, timedelta

# 1. Download Master
print("Downloading Scrip Master...")
scrip_data = requests.get('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json').json()

# 2. Replicate Filter Logic
nse_allowed = ['-EQ', '-SM', '-ST', '-BE']
nse_count = 0
bse_stocks = []

for x in scrip_data:
    if x['exch_seg'] == 'NSE' and 'token' in x:
        sym = x['symbol']
        if any(sym.endswith(suffix) for suffix in nse_allowed):
            nse_count += 1
            
    if x['exch_seg'] == 'BSE' and 'token' in x:
        if x.get('instrumenttype') == '' or x.get('instrumenttype') == 'NSE_CASH': 
            bse_stocks.append(x)

print(f"Filter produced: {nse_count} NSE stocks, {len(bse_stocks)} BSE stocks")

# 3. Test Random Sample of BSE Stocks
print("Testing 20 random BSE stocks from the list...")
sample = random.sample(bse_stocks, 20)

get_session() # Auth

today = datetime.now()
from_d = (today - timedelta(days=365)).strftime('%Y-%m-%d 09:15')
to_d = today.strftime('%Y-%m-%d 15:30')

success = 0
failed = 0
no_data = 0

for s in sample:
    token = s['token']
    sym = s['symbol']
    print(f"Checking {sym} ({token}) [{s.get('instrumenttype')}] '{s.get('name')}'...", end='', flush=True)
    try:
        candles = get_candle_data('BSE', token, from_d, to_d)
        if candles:
            print(f" OK ({len(candles)} candles)")
            success += 1
        else:
            print(" NO DATA (None returned)")
            no_data += 1
    except Exception as e:
        print(f" ERROR: {e}")
        failed += 1

print(f"\nStats: Success={success}, No Data={no_data}, Error={failed}")
