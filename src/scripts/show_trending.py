"""Print trending results from Redis."""
import redis, json

r = redis.from_url('redis://localhost:6379')
data = json.loads(r.get('trending_algorithm_result'))
cats = data['categories']

print(f"Last Updated: {data['last_updated']}")

print('\n=== VOLUME SHOCKERS (Top 10) ===')
for s in cats['volume_shockers'][:10]:
    print(f"  {s['symbol']:20s} spike={s['spike']:>7.1f}x  vol={s['volume']:>12,.0f}  chg={s['change']:>+6.1f}%")

print('\n=== 52W BREAKOUTS ===')
for s in cats['breakouts_52w']:
    print(f"  {s['symbol']:20s} ltp={s['ltp']:<10}  52wHigh={s['high_52w']:<10}  chg={s['change']:>+6.1f}%")

print('\n=== 52W BREAKDOWNS (Top 10) ===')
for s in cats['breakdowns_52w'][:10]:
    print(f"  {s['symbol']:20s} ltp={s['ltp']:<10}  52wLow={s['low_52w']:<10}  chg={s['change']:>+6.1f}%")

print('\n=== TOP GAINERS (Top 5) ===')
for s in cats['top_gainers'][:5]:
    print(f"  {s['symbol']:20s} ltp={s['ltp']:<10}  chg={s['change']:>+6.1f}%")

print('\n=== TOP LOSERS (Top 5) ===')
for s in cats['top_losers'][:5]:
    print(f"  {s['symbol']:20s} ltp={s['ltp']:<10}  chg={s['change']:>+6.1f}%")
