import yfinance as yf
import sys
import json
import math

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

def get_ticker_info(ticker_symbol):
    try:
        # Append .NS for NSE if not present
        symbol = ticker_symbol if (ticker_symbol.endswith('.NS') or ticker_symbol.endswith('.BO')) else f"{ticker_symbol}.NS"
        ticker = yf.Ticker(symbol)
        
        info = ticker.info
        
        # fallback to .BO if .NS fails
        if not info or 'longBusinessSummary' not in info:
            if not ticker_symbol.endswith('.NS') and not ticker_symbol.endswith('.BO'):
                symbol = f"{ticker_symbol}.BO"
                ticker = yf.Ticker(symbol)
                info = ticker.info

        data = {
            "ticker": symbol,
            "name": info.get("longName") or info.get("shortName") or symbol,
            "sector": info.get("sector", "Unknown"),
            "currentPrice": clean_value(info.get("currentPrice") or info.get("regularMarketPrice")),
            "regularMarketChange": clean_value(info.get("regularMarketChange")),
            "regularMarketChangePercent": clean_value(info.get("regularMarketChangePercent")),
            "marketCap": clean_value(info.get("marketCap")),
            "peRatio": clean_value(info.get("trailingPE") or info.get("forwardPE")),
            "return1Y": clean_value(info.get("52WeekChange"), 0) * 100,
        }
        return data
    except Exception as e:
        return {"ticker": ticker_symbol, "error": str(e)}

import concurrent.futures

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            # Tickers can be passed as a comma-separated string or a JSON list
            arg = sys.argv[1]
            if arg.startswith('['):
                tickers = json.loads(arg)
            else:
                tickers = arg.split(',')
            
            results = {}
            # Use ThreadPoolExecutor for parallel fetching
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(tickers), 10)) as executor:
                future_to_ticker = {executor.submit(get_ticker_info, t): t for t in tickers}
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
