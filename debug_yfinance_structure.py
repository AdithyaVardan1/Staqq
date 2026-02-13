
import yfinance as yf
import pandas as pd

def debug_holders(ticker_symbol):
    print(f"DEBUG: Fetching info for {ticker_symbol}")
    t = yf.Ticker(ticker_symbol)
    
    try:
        mh = t.major_holders
        print("\n--- MAJOR HOLDERS ---")
        if mh is not None:
             print("Type:", type(mh))
             if isinstance(mh, pd.DataFrame):
                 print("Columns:", mh.columns.tolist())
                 print("Index Name:", mh.index.name)
                 print("Head:\n", mh.head())
                 
                 # Try to see if Breakdown is in index or columns
                 if 'Breakdown' in mh.columns:
                     print("Breakdown is in columns")
                 elif mh.index.name == 'Breakdown':
                     print("Breakdown is the index")
                 else:
                     print("Breakdown not found explicitly")
             else:
                 print("Not a DataFrame")
        else:
             print("major_holders is None")
    except Exception as e:
        print(f"Error accessing major_holders: {e}")

if __name__ == "__main__":
    debug_holders("RELIANCE.NS")
