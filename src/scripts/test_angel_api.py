"""Quick targeted cache + verification for key SME stocks."""
from angel_api import get_candle_data, get_market_data, get_session
import redis
import time
from datetime import datetime, timedelta

r = redis.from_url('redis://localhost:6379')
get_session()
print("Auth OK")

today = datetime.now()
from_d = (today - timedelta(days=365)).strftime('%Y-%m-%d 09:15')
to_d = today.strftime('%Y-%m-%d 15:30')

targets = [
    ('MAYASHEEL-SM', 'NSE', '21626'),
    ('VEER-ST', 'NSE', '19379'),
    ('SHANKARA', 'NSE', '12401'),
    ('PICTUREHS', 'BSE', '531592'),
]

print("\n=== CACHING HISTORICAL STATS ===")
for sym, exch, token in targets:
    candles = get_candle_data(exch, token, from_d, to_d)
    if not candles or len(candles) < 2:
        print(f"{sym}: NO DATA")
        continue

    # Filter out today's candle
    today_str = datetime.now().strftime("%Y-%m-%d")
    valid_candles = [c for c in candles if not c[0].startswith(today_str)]
    
    if not valid_candles:
        print(f"{sym}: NO VALID HISTORICAL DATA (only today's found)")
        continue

    volumes = [c[5] for c in valid_candles]
    highs = [c[2] for c in valid_candles]
    lows = [c[3] for c in valid_candles]
    closes = [c[4] for c in valid_candles]
    
    avg_vol_5d = int(sum(volumes[-5:]) / min(5, len(volumes)))
    high_52w = max(highs)
    low_52w = min(lows)
    price_55d = closes[-55] if len(closes) >= 55 else closes[0]
    last_vol = volumes[-1]
    spike = last_vol / avg_vol_5d if avg_vol_5d > 0 else 0
    
    # Store in Redis
    base_key = f"stock:stats:{sym}"
    p = r.pipeline()
    p.setex(f"{base_key}:avg_vol_5d", 86400, int(avg_vol_5d))
    p.setex(f"{base_key}:high_52w", 86400, float(high_52w))
    p.setex(f"{base_key}:low_52w", 86400, float(low_52w))
    p.setex(f"{base_key}:price_55d", 86400, float(price_55d))
    p.setex(f"stock:avg_vol:{sym}", 86400, int(avg_vol_5d))
    p.set(f"trending:token:{sym}", token)
    p.set(f"stock:exchange:{sym}", exch)
    p.execute()
    
    print(f"{sym}: {len(candles)} candles | avg5d={avg_vol_5d:,} | last_vol={last_vol:,} | spike={spike:.1f}x | 52WH={high_52w} | 52WL={low_52w}")
    time.sleep(0.35)

print("\n=== LIVE MARKET DATA ===")
nse_tokens = [t[2] for t in targets if t[1] == 'NSE']
bse_tokens = [t[2] for t in targets if t[1] == 'BSE']
etokens = {}
if nse_tokens: etokens['NSE'] = nse_tokens
if bse_tokens: etokens['BSE'] = bse_tokens

mdata = get_market_data(etokens)
if mdata:
    for s in mdata:
        sym = s.get('tradingSymbol', '?')
        ltp = s.get('ltp')
        close = s.get('close')
        vol = s.get('tradeVolume')
        h52 = s.get('52WeekHigh')
        l52 = s.get('52WeekLow')
        pc = ((ltp - close) / close * 100) if close else 0
        print(f"  {sym} | LTP={ltp} | Close={close} | Change={pc:.2f}% | Vol={vol:,} | 52WH={h52} | 52WL={l52}")
else:
    print("NO MARKET DATA")

print("\n=== REDIS VERIFICATION ===")
for sym, _, _ in targets:
    avg = r.get(f"stock:stats:{sym}:avg_vol_5d")
    h52 = r.get(f"stock:stats:{sym}:high_52w")
    l52 = r.get(f"stock:stats:{sym}:low_52w")
    tok = r.get(f"trending:token:{sym}")
    exch = r.get(f"stock:exchange:{sym}")
    print(f"  {sym}: avg_vol={avg}, 52WH={h52}, 52WL={l52}, token={tok}, exchange={exch}")
