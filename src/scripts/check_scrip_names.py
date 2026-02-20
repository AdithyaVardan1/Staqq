
import json
import requests
from pathlib import Path

def check_names():
    url = "https://margincalculator.angelbroking.com/OpenAPI_File/files/msidV2.json"
    print("Downloading scrip master...")
    res = requests.get(url)
    data = res.json()
    
    samples = []
    targets = ['RELIANCE-EQ', 'GLITTEKG-EQ', 'TCS-EQ']
    
    for x in data:
        if x['symbol'] in targets:
            samples.append({
                'symbol': x['symbol'],
                'name': x['name'],
                'exch_seg': x['exch_seg']
            })
            
    print(json.dumps(samples, indent=2))

if __name__ == "__main__":
    check_names()
