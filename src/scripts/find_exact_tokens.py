"""Find correct tokens for Rajgor and Golkunda from scrip master."""
import requests

SCRIP_MASTER_URL = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'

print("Downloading Scrip Master...")
scrip_data = requests.get(SCRIP_MASTER_URL).json()

# Search for Rajgor
print("\n--- RAJGOR ---")
for x in scrip_data:
    name = (x.get('name') or '').upper()
    sym = (x.get('symbol') or '').upper()
    if 'RAJGOR' in sym or 'RAJGOR' in name:
        print(f"  {x['symbol']} | {x['name']} | {x['exch_seg']} | Token: {x['token']} | Type: {x.get('instrumenttype', 'N/A')}")

# Search for Golkunda
print("\n--- GOLKUNDA ---")
for x in scrip_data:
    name = (x.get('name') or '').upper()
    sym = (x.get('symbol') or '').upper()
    if 'GOLKUNDA' in sym or 'GOLKUNDA' in name:
        print(f"  {x['symbol']} | {x['name']} | {x['exch_seg']} | Token: {x['token']} | Type: {x.get('instrumenttype', 'N/A')}")
