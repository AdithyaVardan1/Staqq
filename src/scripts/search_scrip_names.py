
import requests
import json

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'

def search():
    print("Downloading Scrip Master...")
    res = requests.get(SCRIP_MASTER_URL)
    data = res.json()
    
    found = []
    for x in data:
        if x['instrumenttype'] == '' and x['exch_seg'] in ['NSE', 'BSE']:
            if x['name'] != x['symbol']:
                found.append(x)
                if len(found) > 10: break
                
    if not found:
        print("No descriptive names found in Scrip Master for NSE/BSE Equities.")
    else:
        print(json.dumps(found, indent=2))

if __name__ == "__main__":
    search()
