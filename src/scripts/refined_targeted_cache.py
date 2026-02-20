import yfinance as yf
import redis
import os
import sys

# Ensure output is visible
sys.stdout.reconfigure(encoding='utf-8')

r = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))

# Targeted tickers from user's request
targets_to_test = [
    ('RAJGOR-SM', ['RAJGOR-SM.NS']),
    ('PICTUREHS', ['PICTUREHS.BO']),
    ('SHANKARA', ['SHANKARA.NS']),
    ('GOLKUNDA', ['GOLKUNDA.BO']),
    ('MAYASHEEL-SM', ['MAYASHEEL-SM.NS']),
    ('VEER-ST', ['VEER-ST.NS']),
    ('MPILCORP', ['500450.BO']),
    ('BEFOUND', ['543254.BO']),
    ('LICMF', ['543594.BO']),
]

tokens = {
    'RAJGOR-SM': '19472',
    'PICTUREHS': '531592',
    'SHANKARA': '12401',
    'GOLKUNDA': '523074',
    'MAYASHEEL-SM': '21626',
    'VEER-ST': '19379',
    'MPILCORP': '500450',
    'BEFOUND': '543254',
    'LICMF': '543594'
}

print("--- REFINED TARGETED CACHE ---")

for sym, tickers in targets_to_test:
    success = False
    for ticker in tickers:
        try:
            print(f"Checking {ticker} for {sym}...")
            data = yf.download(ticker, period="1y", progress=False)
            if data.empty or len(data) < 2:
                print(f"  Empty or too small data for {ticker}")
                continue
            
            s_data = data.dropna()
            if s_data.empty: continue
            
            # Extract values accurately
            def get_val(series):
                return float(series.iloc[-1].iloc[0]) if hasattr(series.iloc[-1], 'iloc') else float(series.iloc[-1])

            avg_vol_5d = int(s_data['Volume'].iloc[-5:].mean()) if len(s_data) >= 5 else int(s_data['Volume'].mean())
            last_252 = s_data.iloc[-252:] if len(s_data) >= 252 else s_data
            high_52w = float(last_252['High'].max())
            low_52w = float(last_252['Low'].min())
            price_55d = float(s_data['Close'].iloc[-55]) if len(s_data) >= 55 else float(s_data['Close'].iloc[0])
            
            base_key = f"stock:stats:{sym}"
            p = r.pipeline()
            p.setex(f"{base_key}:avg_vol_5d", 86400, avg_vol_5d)
            p.setex(f"{base_key}:high_52w", 86400, high_52w)
            p.setex(f"{base_key}:low_52w", 86400, low_52w)
            p.setex(f"{base_key}:price_55d", 86400, price_55d)
            p.setex(f"stock:avg_vol:{sym}", 86400, avg_vol_5d)
            p.set(f"trending:token:{sym}", tokens.get(sym, ''))
            p.set(f"stock:suffix:{sym}", ticker[-3:])
            p.execute()
            
            print(f"  SUCCESS cached {sym} using {ticker}")
            success = True
            break # Found a working ticker
        except Exception as e:
            print(f"  ERROR for {ticker}: {e}")
    
    if not success:
        print(f"!!! FAILED ALL TICKERS for {sym}")

print("\nRefined Targeted Cache Complete.")
