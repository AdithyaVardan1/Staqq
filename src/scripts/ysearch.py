import yfinance as yf
import sys
import json

def search_stocks(query):
    try:
        # Perform search using yfinance
        search = yf.Search(query, max_results=10)
        
        results = []
        if hasattr(search, 'quotes') and search.quotes:
            for quote in search.quotes:
                # Filter for Indian NSE/BSE stocks if possible, 
                # or just return everything and let the API filter
                results.append({
                    "symbol": quote.get('symbol'),
                    "name": quote.get('shortname') or quote.get('longname') or quote.get('symbol'),
                    "exchange": quote.get('exchange'),
                    "type": quote.get('quoteType'),
                    "score": quote.get('score', 0)
                })
        
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_query = " ".join(sys.argv[1:])
        print(json.dumps(search_stocks(search_query)))
    else:
        print(json.dumps([]))
