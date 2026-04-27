#!/usr/bin/env python3
"""Quick check: which Groq API keys are still valid."""

import sys
import requests
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_env():
    env_path = PROJECT_ROOT / ".env.local"
    if not env_path.exists():
        return {}
    env = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def check_key(key: str) -> tuple[bool, str]:
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": "hi"}],
                "max_tokens": 1,
            },
            timeout=10,
        )
        if resp.status_code == 200:
            return True, "valid"
        elif resp.status_code == 401:
            return False, "invalid / revoked"
        elif resp.status_code == 429:
            return True, "valid but rate limited right now"
        else:
            return False, f"HTTP {resp.status_code}"
    except Exception as e:
        return False, f"error: {e}"


def main():
    env = load_env()

    # Collect keys from env + command line args
    keys: list[tuple[str, str]] = []

    for i in range(1, 20):
        k = env.get(f"GROQ_KEY_{i}")
        if k:
            keys.append((f"GROQ_KEY_{i}", k))

    if env.get("GROQ_API_KEY"):
        keys.append(("GROQ_API_KEY", env["GROQ_API_KEY"]))

    # Also accept keys passed directly as CLI args
    for i, arg in enumerate(sys.argv[1:], 1):
        keys.append((f"arg_{i}", arg))

    if not keys:
        print("No keys found. Add GROQ_KEY_1 ... to .env.local or pass keys as arguments:")
        print("  python scripts/check_groq_keys.py gsk_abc123 gsk_def456 ...")
        sys.exit(1)

    print(f"Checking {len(keys)} key(s)...\n")
    valid = 0
    for name, key in keys:
        masked = key[:8] + "..." + key[-4:]
        ok, status = check_key(key)
        icon = "✓" if ok else "✗"
        print(f"  {icon}  {name}  ({masked})  —  {status}")
        if ok:
            valid += 1

    print(f"\n{valid}/{len(keys)} keys are usable.")


if __name__ == "__main__":
    main()
