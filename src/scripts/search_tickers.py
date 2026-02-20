import yfinance as yf
import pandas as pd

targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']
suffixes = ['.NS', '.BO', '-SM.NS', '-ST.NS', '.BO']

print("Searching for working yfinance tickers...")

results = []

for t in targets:
    print(f"\nChecking {t}:")
    for s in suffixes:
        ticker = f"{t}{s}"
        try:
            df = yf.download(ticker, period="5d", progress=False)
            if not df.empty:
                rows = len(df)
                last_vol = df['Volume'].iloc[-1]
                print(f"  [FOUND] {ticker} | Rows: {rows} | Last Vol: {last_vol}")
                results.append((t, ticker))
                break
        except:
            pass
    else:
        # Check if it's a numeric code for BSE
        print(f"  Trying numeric codes for {t}...")
        # (Need scrip master for this, but I'll try common ones if I know them)

print("\nFinal Working Tickers:")
for sym, ticker in results:
    print(f"{sym}: {ticker}")
