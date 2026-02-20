
import redis
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
r = redis.from_url(REDIS_URL)

def check():
    sym = 'GLITTEKG'
    name = r.get(f"stock:stats:{sym}:name")
    print(f"GLITTEKG Name: {name.decode('utf-8') if name else 'None'}")

if __name__ == "__main__":
    check()
