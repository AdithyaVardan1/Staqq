import requests

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']

print("Downloading Scrip Master...")
scrip_data = requests.get(SCRIP_MASTER_URL).json()

print("\nSearching for targets...")
for t in targets:
    print(f"\n--- {t} ---")
    matches = [x for x in scrip_data if t in x['symbol'] or t in x['name']]
    for m in matches:
        print(f"Symbol: {m['symbol']} | Name: {m['name']} | Exch: {m['exch_seg']} | Token: {m['token']}")
