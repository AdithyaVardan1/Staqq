"""
Angel One Smart API Python wrapper.
Used by daily_vol_cache.py and trending_engine.py
for fetching historical + live data for ALL stocks including SME micro-caps.
"""

import os
import time
import requests
import pyotp
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path

# Find project root (up from src/scripts/ to project root)
_script_dir = Path(__file__).resolve().parent
_project_root = _script_dir.parent.parent
load_dotenv(_project_root / '.env.local')

API_KEY = os.getenv('ANGEL_ONE_API_KEY')
CLIENT_CODE = os.getenv('ANGEL_ONE_CLIENT_CODE')
PASSWORD = os.getenv('ANGEL_ONE_PASSWORD')
TOTP_SECRET = os.getenv('ANGEL_ONE_TOTP_SECRET')

BASE_URL = 'https://apiconnect.angelbroking.com'

from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

_jwt_token = None
_token_ts = 0  # Unix timestamp of last auth
_session = requests.Session()

# Configure robust retry strategy
retries = Retry(
    total=5,
    backoff_factor=1,  # 1s, then 2s, then 4s, etc.
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["POST", "GET"]
)
_session.mount('https://', HTTPAdapter(max_retries=retries))

HEADERS_TEMPLATE = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '1.1.1.1',
    'X-ClientPublicIP': '1.1.1.1',
    'X-MACAddress': 'test',
    'X-PrivateKey': API_KEY
}


def get_session():
    """Authenticate with Angel One. Returns JWT token. Caches for 1 hour."""
    global _jwt_token, _token_ts
    
    # Reuse token if less than 1 hour old
    if _jwt_token and (time.time() - _token_ts) < 3600:
        return _jwt_token
    
    totp = pyotp.TOTP(TOTP_SECRET)
    token = totp.now()
    
    data = {
        "clientcode": CLIENT_CODE,
        "password": PASSWORD,
        "totp": token
    }
    
    res = _session.post(
        f"{BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword",
        headers=HEADERS_TEMPLATE,
        json=data,
        timeout=10
    )
    
    if res.status_code == 200:
        json_data = res.json()
        if json_data.get('status'):
            _jwt_token = json_data['data']['jwtToken']
            _token_ts = time.time()
            return _jwt_token
    
    raise Exception(f"Angel One Auth Failed: {res.text}")


def _auth_headers():
    """Get headers with valid JWT token."""
    jwt = get_session()
    h = HEADERS_TEMPLATE.copy()
    h['Authorization'] = f'Bearer {jwt}'
    return h


def get_candle_data(exchange, token, from_date, to_date, interval='ONE_DAY'):
    """
    Fetch historical candle data.
    
    Args:
        exchange: 'NSE' or 'BSE'
        token: Symbol token (string)
        from_date: 'YYYY-MM-DD HH:mm' format
        to_date: 'YYYY-MM-DD HH:mm' format
        interval: ONE_MINUTE, FIVE_MINUTE, FIFTEEN_MINUTE, 
                  THIRTY_MINUTE, ONE_HOUR, ONE_DAY
    
    Returns:
        List of candles: [[timestamp, open, high, low, close, volume], ...]
        or None on error
    """
def get_candle_data(exchange, token, from_date, to_date, interval='ONE_DAY'):
    """Fetch historical candle data."""
    params = {
        "exchange": exchange,
        "symboltoken": str(token),
        "interval": interval,
        "fromdate": from_date,
        "todate": to_date
    }
    
    res = _session.post(
        f"{BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData",
        headers=_auth_headers(),
        json=params,
        timeout=15
    )
    
    if res.status_code == 200:
        data = res.json()
        if data.get('status') and data.get('data'):
            return data['data']
    else:
        print(f"  [API ERROR] {res.status_code} {res.text}", flush=True)
    
    return None


def get_market_data(exchange_tokens, mode='FULL'):
    """
    Fetch live market data for multiple stocks.
    
    Args:
        exchange_tokens: Dict like {"NSE": ["1234", "5678"], "BSE": ["9012"]}
        mode: 'LTP', 'OHLC', or 'FULL'
    
    Returns:
        List of stock data dicts or None on error
        
    FULL mode returns for each stock:
        exchange, tradingSymbol, symbolToken, ltp, open, high, low, close,
        lastTradeQty, exchFeedTime, exchTradeTime, netChange, percentChange,
        avgPrice, tradeVolume, opInterest, lowerCircuit, upperCircuit,
        totBuyQuan, totSellQuan, 52WeekHigh, 52WeekLow
    """
    """Fetch live market data."""
    params = {
        "mode": mode,
        "exchangeTokens": exchange_tokens
    }
    
    res = _session.post(
        f"{BASE_URL}/rest/secure/angelbroking/market/v1/quote/",
        headers=_auth_headers(),
        json=params,
        timeout=15
    )
    
    if res.status_code == 200:
        data = res.json()
        if data.get('status') and data.get('data'):
            return data['data'].get('fetched', [])
    
    return None


def get_ltp(exchange_tokens):
    """Lightweight LTP-only fetch. Same API, LTP mode."""
    return get_market_data(exchange_tokens, mode='LTP')
