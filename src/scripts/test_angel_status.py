"""Check Angel One Status"""
from angel_api import get_session, get_market_data, get_candle_data, get_ltp
import time
from datetime import datetime, timedelta

def test():
    try:
        print("1. Authenticating...")
        token = get_session()
        print(f"   Success. Token length: {len(token)}")
    except Exception as e:
        print(f"   Auth Failed: {e}")
        return

    print("\n2. Testing Market Data (LTP)...")
    try:
        # SBI Card (NSE: 17903)
        res = get_ltp({"NSE": ["17903"]}) 
        if res:
            print(f"   Success! LTP Quote: {res}")
        else:
            print("   Failed (Result None)")
    except Exception as e:
        print(f"   Error: {e}")

    print("\n3. Testing Historical Data (Candles)...")
    try:
        today = datetime.now()
        from_d = (today - timedelta(days=5)).strftime('%Y-%m-%d 09:15')
        to_d = today.strftime('%Y-%m-%d 15:30')
        res = get_candle_data('NSE', '17903', from_d, to_d)
        if res:
            print(f"   Success! Candles: {len(res)}")
        else:
            print("   Failed (Result None)")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test()
