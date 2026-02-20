
import requests
import json

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'

def check():
    print("Downloading Scrip Master...")
    res = requests.get(SCRIP_MASTER_URL)
    data = res.json()
    
    target_sym = 'GLITTEKG'
    
    found = []
    for x in data:
        if target_sym in x['symbol']:
            found.append(x)
                
    print(json.dumps(found, indent=2))

if __name__ == "__main__":
    check()
