import time
import threading
import os
from typing import Optional

import requests

try:
    import redis
except Exception:
    redis = None

from app.core.config import settings


class TokenCacheError(Exception):
    pass


class OAuthTokenManager:
    """Fetches machine-to-machine access tokens via client_credentials and caches them in Redis or memory.

    Usage:
        tm = OAuthTokenManager()
        token = tm.get_token()
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._in_memory = {}
        self._redis = None
        if redis and settings.REDIS_URL:
            try:
                self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception:
                self._redis = None

        # Keys used in Redis / memory
        self._cache_key = "oauth:ai_service:access_token"
        self._expiry_key = "oauth:ai_service:expires_at"

    def _fetch_token(self) -> dict:
        """Call OAuth token endpoint with client_credentials to retrieve token."""
        if not settings.API_CLIENT_ID or not settings.API_CLIENT_SECRET:
            raise TokenCacheError("AI client credentials not configured (AI_CLIENT_ID / AI_CLIENT_SECRET)")

        data = {
            "grant_type": "client_credentials",
            "client_id": settings.API_CLIENT_ID,
            "client_secret": settings.API_CLIENT_SECRET,
            "scope": settings.API_TOKEN_SCOPE,
        }

        resp = requests.post(settings.OAUTH_TOKEN_URL, data=data, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def _store(self, token: str, expires_at: int):
        if self._redis:
            try:
                pipe = self._redis.pipeline()
                ttl = max(1, expires_at - int(time.time()) - settings.TOKEN_CACHE_BUFFER)
                pipe.set(self._cache_key, token)
                pipe.set(self._expiry_key, str(expires_at))
                pipe.expire(self._cache_key, ttl)
                pipe.expire(self._expiry_key, ttl)
                pipe.execute()
                return
            except Exception:
                # fallback to memory
                pass

        self._in_memory[self._cache_key] = token
        self._in_memory[self._expiry_key] = str(expires_at)

    def _load(self) -> Optional[tuple]:
        now = int(time.time())
        try:
            if self._redis:
                token = self._redis.get(self._cache_key)
                expires_at = self._redis.get(self._expiry_key)
                if token and expires_at and int(expires_at) - settings.TOKEN_CACHE_BUFFER > now:
                    return token, int(expires_at)
                return None
        except Exception:
            pass

        token = self._in_memory.get(self._cache_key)
        expires_at = self._in_memory.get(self._expiry_key)
        if token and expires_at and int(expires_at) - settings.TOKEN_CACHE_BUFFER > now:
            return token, int(expires_at)
        return None

    def get_token(self) -> str:
        """Return a valid access token, fetching and caching as needed."""
        # Fast path: try load without lock
        cached = self._load()
        if cached:
            return cached[0]

        with self._lock:
            # Double-check after acquiring lock
            cached = self._load()
            if cached:
                return cached[0]

            data = self._fetch_token()
            if "access_token" not in data or "expires_in" not in data:
                raise TokenCacheError("Invalid token response from OAuth server")

            token = data["access_token"]
            expires_at = int(time.time()) + int(data["expires_in"])
            self._store(token, expires_at)
            return token


# Singleton instance for module-level use
_token_manager = OAuthTokenManager()

def get_token():
    return _token_manager.get_token()
