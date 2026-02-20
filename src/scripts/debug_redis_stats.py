import redis
import json

r = redis.from_url('redis://localhost:6379')

targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']

print("--- TARGETED SIGNAL VERIFICATION ---")
data_raw = r.get('trending_algorithm_result')
if data_raw:
    data = json.loads(data_raw)
    cats = data.get('categories', {})
    
    for t in targets:
        print(f"\nChecking [{t}]:")
        found = False
        for cat_name, stocks in cats.items():
            hit = [s for s in stocks if s['symbol'] == t]
            if hit:
                s = hit[0]
                print(f"  FOUND in {cat_name.upper()}")
                print(f"  LTP: {s['ltp']}, Change: {s['change']:.2f}%, Spike: {s['spike']:.2f}x")
                print(f"  52W High: {s['high_52w']}, 52W Low: {s['low_52w']}")
                if cat_name == 'breakouts_52w':
                    print(f"  Dist High: {(s['ltp']-s['high_52w'])/s['high_52w']*100:.2f}%")
                if cat_name == 'breakdowns_52w':
                    print(f"  Dist Low: {(s['ltp']-s['low_52w'])/s['low_52w']*100:.2f}%")
                found = True
        if not found:
            print("  NOT FOUND in any category.")
            # Check if stats exist at least
            suffix = r.get(f"stock:suffix:{t}")
            if suffix:
                print(f"  Stats exist in Redis (Suffix: {suffix.decode()})")
            else:
                print("  Stats MISSING in Redis.")
else:
    print("No trending data found.")
