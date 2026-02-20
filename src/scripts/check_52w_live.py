import yfinance as yf
import pandas as pd

stocks = {
    'SHANKARA.NS': 'Shankara Buildpro',
    'GOLKUNDA.BO': 'Golkunda Diamonds',
    'MAYASHEEL.NS': 'Mayasheel Ventures',
    'VEER-ST.NS': 'Veer Global'
}

print("Checking 52W High/Low metrics...")
for ticker, name in stocks.items():
    try:
        print(f"\n{name} ({ticker})")
        df = yf.download(ticker, period="1y", progress=False)
        if df.empty:
            print("  FAIL: No data")
            continue
        
        # Handle MultiIndex if necessary
        if isinstance(df.columns, pd.MultiIndex):
            df = df.xs(ticker, axis=1, level=1) if ticker in df.columns.get_level_values(1) else df
            
        h = float(df['High'].max())
        l = float(df['Low'].min())
        c = float(df['Close'].iloc[-1])
        
        dist_h = (c - h) / h * 100
        dist_l = (c - l) / l * 100
        
        print(f"  52W High: {h:.2f}")
        print(f"  52W Low:  {l:.2f}")
        print(f"  Current:  {c:.2f}")
        print(f"  Dist High: {dist_h:.2f}%")
        print(f"  Dist Low:  {dist_l:.2f}%")
        
    except Exception as e:
        print(f"  ERROR: {str(e)}")
