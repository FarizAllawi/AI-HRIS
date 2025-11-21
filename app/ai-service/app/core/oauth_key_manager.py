import os, requests, time, threading
from app.core.config import settings
from app.core.oauth_token_manager import get_token

PUBLIC_KEY_CACHE_PATH = "keys/oauth-public.key"
GATEWAY_KEY_URL = f"{settings.GATEWAY_BASE_URL}/api/passport/public-key"
FETCH_INTERVAL = 3600  # every 1 hour

def fetch_and_cache_public_key():
    try:
        token = get_token()
        headers = {"Authorization": "Bearer " + token}
        response = requests.get(GATEWAY_KEY_URL, headers=headers, timeout=10)
        response.raise_for_status()
        new_key = response.text.strip()

        if not os.path.exists("keys"):
            os.makedirs("keys")

        # Save new key only if it differs from existing one
        old_key = ""
        if os.path.exists(PUBLIC_KEY_CACHE_PATH):
            with open(PUBLIC_KEY_CACHE_PATH, "r") as f:
                old_key = f.read().strip()

        if new_key != old_key:
            with open(PUBLIC_KEY_CACHE_PATH, "w") as f:
                f.write(new_key)
            print("🔑 oauth public key updated")

    except Exception as e:
        print(f"⚠️ Failed to refresh oauth public key: {e}")

def start_key_refresher():
    """Background thread to refresh the Laravel public key."""
    def refresher():
        while True:
            fetch_and_cache_public_key()
            time.sleep(FETCH_INTERVAL)
    threading.Thread(target=refresher, daemon=True).start()
