import redis
import json

r = redis.from_url('redis://localhost:6379')
data_raw = r.get('trending_algorithm_result')

if not data_raw:
    print("No trending data found in Redis.")
else:
    data = json.loads(data_raw)
    categories = data.get('categories', {})
    
    for cat_name, stocks in categories.items():
        print(f"\n--- {cat_name.upper()} ({len(stocks)}) ---")
        for s in stocks[:10]:
            print(f"{s['symbol']}: {s['change']:.2f}% | LTP: {s['ltp']} | Spike: {s['spike']:.2f}x")
            
    print("\nCheck for specific high-signal targets:")
    targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']
    for t in targets:
        found_in = []
        for cat_name, stocks in categories.items():
            hit = [s for s in stocks if s['symbol'] == t]
            if hit:
                found_in.append(f"{cat_name} (Chg: {hit[0]['change']:.2f}%, Spike: {hit[0]['spike']:.2f}x)")
        
        if found_in:
            print(f"[{t}] Found in: {', '.join(found_in)}")
        else:
            print(f"[{t}] Not found in any category.")
