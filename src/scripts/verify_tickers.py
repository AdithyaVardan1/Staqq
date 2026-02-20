import yfinance as yf

# Potential tickers to check
tickers_to_test = [
    "RAJGOR.NS",
    "PICTUREHS.BO",
    "PICTUREHS.NS",
    "531592.BO",
    "SHANKARA.NS",
    "GOLKUNDA.BO",
    "MAYASHEEL.NS",
    "VEER.NS",
    "VEER-ST.NS",
    "SHANKARA.BO",
    "GOLKUNDA.NS"
]

print("Verifying Tickers via yfinance...")
for t in tickers_to_test:
    try:
        data = yf.download(t, period="5d", progress=False)
        if not data.empty:
            last_vol = data["Volume"].iloc[-1]
            print(f"[OK] {t} - Last Volume: {last_vol}")
        else:
            print(f"[FAIL] {t} - Empty Data")
    except Exception as e:
        print(f"[ERROR] {t} - {str(e)}")

print("Verification Complete.")
