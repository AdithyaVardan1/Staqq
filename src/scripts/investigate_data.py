import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

stocks = [
    ('RAJGOR.NS', 'Rajgor Castor'),
    ('RAJGOR-SM.NS', 'Rajgor Castor SME'),
    ('PICTUREHS.BO', 'Picturehouse Media'),
    ('SHANKARA.NS', 'Shankara Buildpro'),
    ('GOLKUNDA.BO', 'Golkunda Diamonds'),
    ('MAYASHEEL.NS', 'Mayasheel Ventures'),
    ('VEER-ST.NS', 'Veer Global'),
    ('500450.BO', 'MPIL Corp (BSE Code)')
]

print(f"--- DATA INVESTIGATION ({datetime.now().date()}) ---")

for ticker, name in stocks:
    try:
        print(f"\n{name} ({ticker})")
        # Try max to see total history
        df = yf.download(ticker, period="max", progress=False)
        if df.empty:
            print("  FAIL: No data found.")
            continue
            
        # Clean columns if multiindex
        if isinstance(df.columns, pd.MultiIndex):
            df = df.xs(ticker, axis=1, level=1) if ticker in df.columns.get_level_values(1) else df
            
        rows = len(df)
        last_close = float(df['Close'].iloc[-1])
        last_vol = float(df['Volume'].iloc[-1])
        
        # Calculate avg volume with different windows
        avg_5d = df['Volume'].iloc[-6:-1].mean() if rows > 5 else df['Volume'].mean()
        avg_20d = df['Volume'].iloc[-21:-1].mean() if rows > 20 else df['Volume'].mean()
        
        spike_5d = last_vol / avg_5d if avg_5d > 0 else 0
        spike_20d = last_vol / avg_20d if avg_20d > 0 else 0
        
        # 52W metrics
        h_52w = df['High'].iloc[-252:].max() if rows >= 252 else df['High'].max()
        l_52w = df['Low'].iloc[-252:].min() if rows >= 252 else df['Low'].min()
        
        dist_h = (last_close - h_52w) / h_52w * 100
        dist_l = (last_close - l_52w) / l_52w * 100
        
        print(f"  History: {rows} days (First: {df.index[0].date()})")
        print(f"  Close: {last_close:.2f} | Volume: {last_vol:,.0f}")
        print(f"  Avg Vol (5d): {avg_5d:,.0f} -> Spike: {spike_5d:.2f}x")
        print(f"  Avg Vol (20d): {avg_20d:,.0f} -> Spike: {spike_20d:.2f}x")
        print(f"  52W High: {h_52w:.2f} (Dist: {dist_h:.2f}%)")
        print(f"  52W Low:  {l_52w:.2f} (Dist: {dist_l:.2f}%)")
        
    except Exception as e:
        print(f"  ERROR: {str(e)}")
