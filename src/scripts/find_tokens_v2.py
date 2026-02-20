import requests

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']

print("Downloading Scrip Master...")
scrip_data = requests.get(SCRIP_MASTER_URL).json()

print("\n--- Search Results ---")
for t in targets:
    print(f"\nTarget: {t}")
    matches = [x for x in scrip_data if (t in x['symbol'] or t in x['name']) and x['exch_seg'] in ['NSE', 'BSE']]
    for m in matches:
        print(f"  {m['symbol']} | {m['name']} | {m['exch_seg']} | {m['token']} | {m.get('instrumenttype', 'N/A')}")
