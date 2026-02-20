import yfinance as yf
import sys
import json
import math
import time
import random

def clean_value(val, default=0):
    if val is None:
        return default
    try:
        fval = float(val)
        if math.isnan(fval) or math.isinf(fval):
            return default
        return fval
    except (ValueError, TypeError):
        return default

def get_ticker_info_with_retry(ticker_symbol, retries=3):
    for attempt in range(retries):
        try:
            # Append .NS for NSE if not present
            symbol = ticker_symbol if (ticker_symbol.endswith('.NS') or ticker_symbol.endswith('.BO')) else f"{ticker_symbol}.NS"
            ticker = yf.Ticker(symbol)
            
            # Fast info fetch
            info = ticker.fast_info
            
            # If fast_info lacks data, try full info but be careful
            if not info or not hasattr(info, 'last_price'):
                 info = ticker.info

            # fallback to .BO if .NS fails
            if not info:
                if not ticker_symbol.endswith('.NS') and not ticker_symbol.endswith('.BO'):
                    symbol = f"{ticker_symbol}.BO"
                    ticker = yf.Ticker(symbol)
                    info = ticker.fast_info

            # Map fast_info/info to our structure
            # Note: fast_info attributes are different from info dict keys
            current_price = getattr(info, 'last_price', 0) or info.get('currentPrice') or info.get('regularMarketPrice')
            previous_close = getattr(info, 'previous_close', 0) or info.get('previousClose') or info.get('regularMarketPreviousClose')
            
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            # Some fields still need full info dict if fast_info doesn't have them
            # attempting to access .info prop can trigger the network request
            details = ticker.info if hasattr(ticker, 'info') else {}

            data = {
                "ticker": symbol,
                "name": details.get("longName") or details.get("shortName") or symbol,
                "sector": details.get("sector", "Unknown"),
                "currentPrice": clean_value(current_price),
                "regularMarketChange": clean_value(change),
                "regularMarketChangePercent": clean_value(change_percent),
                "marketCap": clean_value(getattr(info, 'market_cap', 0) or details.get("marketCap")),
                "peRatio": clean_value(details.get("trailingPE") or details.get("forwardPE")),
                "return1Y": clean_value(details.get("52WeekChange"), 0) * 100,
            }
            return data

        except Exception as e:
            error_msg = str(e)
            if "Too Many Requests" in error_msg or "429" in error_msg:
                if attempt < retries - 1:
                    time.sleep(random.uniform(1, 3) * (attempt + 1))
                    continue
            return {"ticker": ticker_symbol, "error": error_msg}
    return {"ticker": ticker_symbol, "error": "Max retries allowed"}

import concurrent.futures

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            arg = sys.argv[1]
            if arg.startswith('['):
                tickers = json.loads(arg)
            else:
                tickers = arg.split(',')
            
            results = {}
            # Reduced concurrency to be gentler on API
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                future_to_ticker = {executor.submit(get_ticker_info_with_retry, t): t for t in tickers}
                for future in concurrent.futures.as_completed(future_to_ticker):
                    ticker_name = future_to_ticker[future]
                    try:
                        results[ticker_name] = future.result()
                    except Exception as e:
                        results[ticker_name] = {"ticker": ticker_name, "error": str(e)}
            
            print(json.dumps(results))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No tickers provided"}))
