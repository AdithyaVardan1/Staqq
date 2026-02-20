import yfinance as yf
import redis
import os

r = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

# Targeted tickers from user's request
targets = [
    ('RAJGOR', 'RAJGOR.NS', '19472'), 
    ('PICTUREHS', 'PICTUREHS.BO', '531592'), 
    ('SHANKARA', 'SHANKARA.NS', '12401'), 
    ('GOLKUNDA', 'GOLKUNDA.BO', '523074'), 
    ('MAYASHEEL', 'MAYASHEEL.NS', '21626'), 
    ('VEER', 'VEER-ST.NS', '19379'), 
    ('MPILCORP', 'MPILCORP.BO', '500450'),
    ('BEFOUND', 'BEFOUND.BO', '543254'),
    ('LICMF', '543594.BO', '543594'), # LIC MF
]

print("Targeted Cache for High Signal Stocks...")

for sym, ticker, token in targets:
    try:
        print(f"Fetching {ticker}...")
        data = yf.download(ticker, period="1y", progress=False)
        if data.empty:
            print(f"Failed to fetch {ticker}")
            continue
            
        s_data = data.dropna()
        if len(s_data) < 2: continue
        
        avg_vol_5d = int(s_data['Volume'].iloc[-5:].mean()) if len(s_data) >= 5 else int(s_data['Volume'].mean())
        last_252 = s_data.iloc[-252:] if len(s_data) >= 252 else s_data
        high_52w = float(last_252['High'].max())
        low_52w = float(last_252['Low'].min())
        price_55d = float(s_data['Close'].iloc[-55]) if len(s_data) >= 55 else float(s_data['Close'].iloc[0])
        
        base_key = f"stock:stats:{sym}"
        p = r.pipeline()
        p.setex(f"{base_key}:avg_vol_5d", 100000, avg_vol_5d)
        p.setex(f"{base_key}:high_52w", 100000, high_52w)
        p.setex(f"{base_key}:low_52w", 100000, low_52w)
        p.setex(f"{base_key}:price_55d", 100000, price_55d)
        p.setex(f"stock:avg_vol:{sym}", 100000, avg_vol_5d)
        p.set(f"trending:token:{sym}", token)
        p.set(f"stock:suffix:{sym}", ticker[-3:])
        p.execute()
        print(f"Successfully cached {sym} ({ticker})")
    except Exception as e:
        print(f"Error caching {sym}: {e}")

print("Targeted Cache Complete.")
