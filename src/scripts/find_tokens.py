import requests

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
targets = ['RAJGOR', 'PICTUREHS', 'SHANKARA', 'GOLKUNDA', 'MAYASHEEL', 'VEER']

print("Downloading Scrip Master...")
scrip_data = requests.get(SCRIP_MASTER_URL).json()

print("\n--- Search Results ---")
for t in targets:
    print(f"\nTarget: {t}")
    for x in scrip_data:
        if t in x['symbol'] or t in x['name']:
            if x['exch_seg'] in ['NSE', 'BSE']:
                print(f"  {x['symbol']} | {x['name']} | {x['exch_seg']} | {x['token']} | {x.get('instrumenttype', 'N/A')}")
