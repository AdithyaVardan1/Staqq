
import requests
import json

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'

def inspect():
    print("Downloading Scrip Master...")
    res = requests.get(SCRIP_MASTER_URL)
    data = res.json()
    
    targets = ['GLITTEKG', 'LUPIN', 'RELIANCE']
    
    found = []
    for x in data:
        if x['symbol'] in targets or any(x['symbol'].startswith(t) for t in targets):
            if x['exch_seg'] in ['NSE', 'BSE']:
                found.append(x)
                if len(found) > 10: break
                
    print(json.dumps(found, indent=2))

if __name__ == "__main__":
    inspect()
