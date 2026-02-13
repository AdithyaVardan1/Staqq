import yfinance as yf
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_rsi(data, period=14):
    """Calculate Relative Strength Index"""
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50

def calculate_macd(data):
    """Calculate MACD (Moving Average Convergence Divergence)"""
    exp1 = data['Close'].ewm(span=12, adjust=False).mean()
    exp2 = data['Close'].ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    
    return {
        'macd': round(macd.iloc[-1], 2) if not pd.isna(macd.iloc[-1]) else 0,
        'signal': round(signal.iloc[-1], 2) if not pd.isna(signal.iloc[-1]) else 0,
        'histogram': round(histogram.iloc[-1], 2) if not pd.isna(histogram.iloc[-1]) else 0
    }

def calculate_moving_averages(data):
    """Calculate 50-day and 200-day Moving Averages"""
    ma50 = data['Close'].rolling(window=50).mean().iloc[-1]
    ma200 = data['Close'].rolling(window=200).mean().iloc[-1]
    current_price = data['Close'].iloc[-1]
    
    return {
        'ma50': round(ma50, 2) if not pd.isna(ma50) else 0,
        'ma200': round(ma200, 2) if not pd.isna(ma200) else 0,
        'current_price': round(current_price, 2),
        'above_ma50': current_price > ma50 if not pd.isna(ma50) else None,
        'above_ma200': current_price > ma200 if not pd.isna(ma200) else None
    }

def get_technical_indicators(ticker_symbol):
    try:
        # Append .NS for NSE if not present
        symbol = ticker_symbol if (ticker_symbol.endswith('.NS') or ticker_symbol.endswith('.BO')) else f"{ticker_symbol}.NS"
        
        # Fetch 200 days of historical data (reduced from 365 for performance)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=200)
        
        ticker = yf.Ticker(symbol)
        hist = ticker.history(start=start_date, end=end_date)
        
        if hist.empty or len(hist) < 14:
            return {"error": "Insufficient historical data"}
        
        # Calculate indicators
        rsi = calculate_rsi(hist)
        macd_data = calculate_macd(hist)
        ma_data = calculate_moving_averages(hist)
        
        # Determine interpretations
        rsi_status = 'Overbought' if rsi > 70 else ('Oversold' if rsi < 30 else 'Neutral')
        rsi_interpretation = f"RSI at {round(rsi, 1)}. " + (
            "Overbought territory, potential reversal." if rsi > 70 else
            "Oversold territory, potential bounce." if rsi < 30 else
            "Market is balanced."
        )
        
        macd_status = 'Bullish' if macd_data['histogram'] > 0 else 'Bearish'
        macd_interpretation = f"MACD {macd_data['macd']:.2f}, Signal {macd_data['signal']:.2f}. " + (
            "Bullish crossover, upward momentum." if macd_data['histogram'] > 0 else
            "Bearish crossover, downward momentum."
        )
        
        ma_status = 'Bullish' if (ma_data['above_ma50'] and ma_data['above_ma200']) else (
            'Neutral' if ma_data['above_ma50'] else 'Bearish'
        )
        ma_interpretation = f"Price ₹{ma_data['current_price']:.2f}. " + (
            f"Above 50-day (₹{ma_data['ma50']:.2f}) and 200-day (₹{ma_data['ma200']:.2f}) MA. Strong uptrend." 
            if (ma_data['above_ma50'] and ma_data['above_ma200']) else
            f"Above 50-day MA (₹{ma_data['ma50']:.2f}) but below 200-day. Mixed signals." 
            if ma_data['above_ma50'] else
            f"Below both 50-day and 200-day MA. Weak trend."
        )
        
        return {
            "ticker": symbol,
            "indicators": [
                {
                    "name": "RSI (14)",
                    "value": round(rsi, 1),
                    "status": rsi_status,
                    "interpretation": rsi_interpretation
                },
                {
                    "name": "MACD",
                    "value": f"{macd_data['macd']:.2f}",
                    "status": macd_status,
                    "interpretation": macd_interpretation
                },
                {
                    "name": "Moving Averages",
                    "value": f"50D: ₹{ma_data['ma50']:.2f}, 200D: ₹{ma_data['ma200']:.2f}",
                    "status": ma_status,
                    "interpretation": ma_interpretation
                }
            ]
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ticker_input = sys.argv[1]
        print(json.dumps(get_technical_indicators(ticker_input)))
    else:
        print(json.dumps({"error": "No ticker provided"}))
