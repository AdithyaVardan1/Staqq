import yfinance as yf

search_queries = [
    "Rajgor Castor",
    "Golkunda Diamonds",
    "Mayasheel Ventures",
    "Veer Global",
    "Rajgor",
    "Golkunda",
    "Mayasheel",
    "Veer Global Infraconstruction"
]

print("Hunting for yfinance tickers...")

for query in search_queries:
    print(f"\nSearching for: {query}")
    try:
        # yfinance search is not always reliable via code, but we can try to find by variations
        # or use the tickers we think might work
        pass
    except Exception as e:
        print(f"Error searching {query}: {e}")

# Manual list of potential variations to check
variations = [
    "RAJGOR.NS", "RAJGOR.BO", "RAJGOR-SM.NS", "RAJGOR-ST.NS",
    "GOLKUNDA.NS", "GOLKUNDA.BO", "523074.BO",
    "MAYASHEEL.NS", "MAYASHEEL.BO", "MAYASHEEL-SM.NS",
    "VEER.NS", "VEER.BO", "VEER-ST.NS", "543224.BO"
]

print("\nVerifying variations...")
for v in variations:
    try:
        d = yf.download(v, period="1d", progress=False)
        if not d.empty:
            print(f"[OK] {v} is valid. Vol: {d['Volume'].iloc[-1] if 'Volume' in d.columns else 'N/A'}")
        else:
            print(f"[FAIL] {v} empty.")
    except Exception as e:
        print(f"[FAIL] {v} error: {e}")
