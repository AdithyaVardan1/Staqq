import requests
import json

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
targets = ['RAJGOR', 'GOLKUNDA', 'MAYASHEEL', 'VEER']

print("Downloading Scrip Master...")
scrip_data = requests.get(SCRIP_MASTER_URL).json()

results = []
for t in targets:
    matches = [x for x in scrip_data if (t.upper() in x['symbol'].upper() or t.upper() in (x.get('name') or '').upper()) and x['exch_seg'] in ['NSE', 'BSE']]
    results.extend(matches)

for r in results:
    print(f"Symbol: {r['symbol']} | Name: {r['name']} | Exch: {r['exch_seg']} | Token: {r['token']}")
