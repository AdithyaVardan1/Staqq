import yfinance as yf
import sys
import json
import math
from datetime import datetime

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
        
        # Determine if we should try .BO if .NS fails
        if not info or 'longBusinessSummary' not in info:
            if not ticker_symbol.endswith('.NS') and not ticker_symbol.endswith('.BO'):
                symbol = f"{ticker_symbol}.BO"
                ticker = yf.Ticker(symbol)
                info = ticker.info

        data = {
            "ticker": symbol,
            "name": info.get("longName") or info.get("shortName") or symbol,
            "description": info.get("longBusinessSummary", ""),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "website": info.get("website", ""),
            
            # Valuation
            "marketCap": clean_value(info.get("marketCap")),
            "peRatio": clean_value(info.get("trailingPE") or info.get("forwardPE")),
            "pegRatio": clean_value(info.get("pegRatio")),
            "pbRatio": clean_value(info.get("priceToBook")),
            "beta": clean_value(info.get("beta")),
            "divYield": clean_value(info.get("dividendYield")) / 100.0,
            "high52": clean_value(info.get("fiftyTwoWeekHigh")),
            "low52": clean_value(info.get("fiftyTwoWeekLow")),
            
            # Profitability
            "netMargin": clean_value(info.get("profitMargins")),
            "roe": clean_value(info.get("returnOnEquity")),
            "roa": clean_value(info.get("returnOnAssets")),
            "eps": clean_value(info.get("trailingEps")),
            "debtToEquity": clean_value(info.get("debtToEquity")),
            
            # Current Price and Change
            "price": clean_value(info.get("currentPrice") or info.get("regularMarketPrice")),
            "percentChange": clean_value(info.get("regularMarketChangePercent")),
            
            "financials": {
                "quarterly": [],
                "annual": []
            },
            "shareholding": [],
            "news": [],
            "events": []
        }
        
        # Get Shareholding Pattern
        try:
            major_holders = ticker.major_holders
            if major_holders is not None and not major_holders.empty:
                # The dataframe index contains keys like 'insidersPercentHeld'
                # The 'Value' column contains the values.
                
                # Check if 'Breakdown' is a column or index
                if 'Breakdown' in major_holders.columns:
                    holders_dict = major_holders.set_index('Breakdown')['Value'].to_dict()
                else:
                    # Assume index is already the breakdown
                    holders_dict = major_holders['Value'].to_dict()
                
                promoters = clean_value(holders_dict.get('insidersPercentHeld')) * 100
                institutions = clean_value(holders_dict.get('institutionsPercentHeld')) * 100
                public = max(0, 100 - promoters - institutions)
                
                # Mock a split for FII/DII if not available directly
                # Usually institutions are split ~60/40 or similar, but for simplicity:
                fii = institutions * 0.6
                dii = institutions * 0.4
                
                data["shareholding"] = [
                    { "name": "Promoters", "value": round(promoters, 2), "color": "#22C55E" },
                    { "name": "FII", "value": round(fii, 2), "color": "#3B82F6" },
                    { "name": "DII", "value": round(dii, 2), "color": "#8B5CF6" },
                    { "name": "Public", "value": round(public, 2), "color": "#F59E0B" }
                ]
        except Exception:
            pass
        
        # Get News
        try:
            news_items = ticker.news
            if news_items:
                for item in news_items[:10]:  # Get up to 10 news items
                    content = item.get("content", {})
                    if not content:
                        continue
                        
                    # Extract date
                    pub_date = content.get("pubDate")
                    date_str = "Recent"
                    if pub_date:
                        try:
                            # pubDate is usually ISO format like '2024-03-25T12:00:00Z'
                            date_str = pub_date[:10]
                        except:
                            date_str = "Recent"
                    
                    data["news"].append({
                        "id": item.get("id") or content.get("id") or "",
                        "title": content.get("title") or "",
                        "source": content.get("provider", {}).get("displayName") or "Market News",
                        "link": content.get("clickThroughUrl", {}).get("url") or "",
                        "date": date_str
                    })
        except Exception as e:
            print(f"Warning: Could not fetch news: {e}", file=sys.stderr)
            pass
            
        # Get Calendar Events
        try:
            calendar = ticker.calendar
            if calendar and isinstance(calendar, dict):
                events = []
                # Check for Dividend Date
                if 'Ex-Dividend Date' in calendar:
                    events.append({
                        "id": "div-event",
                        "name": "Ex-Dividend Date",
                        "date": str(calendar['Ex-Dividend Date'])
                    })
                # Check for Earnings Date
                if 'Earnings Date' in calendar:
                    e_date = calendar['Earnings Date']
                    if isinstance(e_date, list) and len(e_date) > 0:
                        events.append({
                            "id": "earn-event",
                            "name": "Earnings Date",
                            "date": str(e_date[0])
                        })
                    elif e_date and not isinstance(e_date, list):
                        # Simple non-empty scalar value
                        events.append({
                            "id": "earn-event",
                            "name": "Earnings Date",
                            "date": str(e_date)
                        })
                data["events"] = events
        except Exception as e:
            print(f"Warning: Could not fetch calendar: {e}", file=sys.stderr)
            pass

        # Get Income Statement for Revenue/Profit
        try:
            income_stmt = ticker.income_stmt
            if not income_stmt.empty:
                limit = 4
                count = 0
                for date, row in income_stmt.T.iterrows():
                    data["financials"]["annual"].append({
                        "year": f"FY {date.year}",
                        "revenue": clean_value(row.get('Total Revenue')) / 10000000,
                        "profit": clean_value(row.get('Net Income')) / 10000000,
                        "eps": clean_value(row.get('Diluted EPS'))
                    })
                    count += 1
                    if count >= limit: break
            
            q_income_stmt = ticker.quarterly_income_stmt
            if not q_income_stmt.empty:
                limit = 4
                count = 0
                for date, row in q_income_stmt.T.iterrows():
                    data["financials"]["quarterly"].append({
                        "period": date.strftime('%b %y'),
                        "revenue": clean_value(row.get('Total Revenue')) / 10000000,
                        "profit": clean_value(row.get('Net Income')) / 10000000,
                        "eps": clean_value(row.get('Diluted EPS'))
                    })
                    count += 1
                    if count >= limit: break
        except Exception:
            pass

        return data
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ticker_input = sys.argv[1]
        print(json.dumps(get_ticker_info(ticker_input)))
    else:
        print(json.dumps({"error": "No ticker provided"}))
