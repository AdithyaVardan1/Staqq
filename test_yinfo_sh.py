
import sys
import json
from scripts.yinfo import get_ticker_info

if __name__ == "__main__":
    ticker = "RELIANCE.NS"
    print(f"Testing yinfo for {ticker}...")
    data = get_ticker_info(ticker)
    
    print("Shareholding Data:")
    print(json.dumps(data.get("shareholding"), indent=2))
    
    if data.get("shareholding") and len(data.get("shareholding")) > 0:
        print("SUCCESS: Shareholding data found.")
    else:
        print("FAILURE: Shareholding data missing.")
