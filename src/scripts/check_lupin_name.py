
import redis
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
r = redis.from_url(REDIS_URL)

def check():
    sym = 'LUPIN'
    name = r.get(f"stock:stats:{sym}:name")
    print(f"LUPIN Name: {name.decode('utf-8') if name else 'None'}")
    
    # Check what key it was supposedly stored under
    print(f"Key used: stock:stats:{sym}:name")

if __name__ == "__main__":
    check()
