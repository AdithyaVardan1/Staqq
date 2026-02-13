import yfinance as yf
import json
import sys

def test_search():
    # Try just the core name
    query = "West Coast Paper"
    print(f"Searching for: {query}")
    try:
        search = yf.Search(query, max_results=10)
        print(f"Search object: {search}")
        print(f"Quotes: {getattr(search, 'quotes', 'No quotes attr')}")
        
        if hasattr(search, 'quotes') and search.quotes:
            for quote in search.quotes:
                print(f"- {quote.get('symbol')}: {quote.get('shortname') or quote.get('longname')}")
        else:
            print("No quotes found in search results.")
            
    except Exception as e:
        print(f"Search failed: {e}")

if __name__ == "__main__":
    test_search()
