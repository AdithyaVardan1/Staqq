
import yfinance as yf
import json

def test_holders():
    ticker = yf.Ticker("RELIANCE.NS")
    print("--- Major Holders ---")
    try:
        holders = ticker.major_holders
        print(holders)
    except Exception as e:
        print(f"Error getting major holders: {e}")

    print("\n--- Institutional Holders ---")
    try:
        inst = ticker.institutional_holders
        print(inst)
    except Exception as e:
        print(f"Error getting institutional holders: {e}")

if __name__ == "__main__":
    test_holders()
