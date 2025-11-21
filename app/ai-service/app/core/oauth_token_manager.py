import time
import threading
from typing import Optional, Callable
from functools import wraps

import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

try:
    import redis
except Exception:
    redis = None

from app.core.config import settings


class TokenCacheError(Exception):
    pass


class TokenFetchError(Exception):
    """Raised when token fetch fails after all retries"""
    pass


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 10.0,
    exponential_base: float = 2.0,
    exceptions: tuple = (RequestException, ConnectionError, Timeout)
):
    """Decorator for retrying a function with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries in seconds
        exponential_base: Base for exponential backoff calculation
        exceptions: Tuple of exceptions to catch and retry on
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_retries:
                        # Final attempt failed
                        break

                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)

                    # Log the retry attempt (you can replace with proper logging)
                    print(f"Attempt {attempt + 1}/{max_retries + 1} failed: {e}. Retrying in {delay:.2f}s...")

                    time.sleep(delay)

            # All retries exhausted
            raise TokenFetchError(
                f"Failed to fetch token after {max_retries + 1} attempts: {last_exception}"
            ) from last_exception

        return wrapper
    return decorator


class OAuthTokenManager:
    """Fetches machine-to-machine access tokens via client_credentials and caches them in Redis or memory.

    Features:
    - Automatic retry with exponential backoff for token fetch
    - Thread-safe token caching
    - Redis + in-memory fallback
    - Configurable retry behavior

    Usage:
        tm = OAuthTokenManager(max_retries=3, base_delay=1.0)
        token = tm.get_token()
    """

    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 10.0,
        timeout: int = 10
    ):
        """Initialize the token manager.

        Args:
            max_retries: Maximum number of retry attempts for token fetch
            base_delay: Initial delay between retries in seconds
            max_delay: Maximum delay between retries in seconds
            timeout: Request timeout in seconds
        """
        self._lock = threading.Lock()
        self._in_memory = {}
        self._redis = None
        self._timeout = timeout
        self._max_retries = max_retries
        self._base_delay = base_delay
        self._max_delay = max_delay

        if redis and settings.REDIS_URL:
            try:
                self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
                # Test connection
                self._redis.ping()
            except Exception as e:
                print(f"Redis connection failed, falling back to in-memory cache: {e}")
                self._redis = None

        # Keys used in Redis / memory
        self._cache_key = "oauth:ai_service:access_token"
        self._expiry_key = "oauth:ai_service:expires_at"

    @retry_with_backoff(
        max_retries=3,
        base_delay=1.0,
        max_delay=10.0,
        exceptions=(RequestException, ConnectionError, Timeout, requests.HTTPError)
    )
    def _fetch_token(self) -> dict:
        """Call OAuth token endpoint with client_credentials to retrieve token.

        This method will automatically retry on network errors with exponential backoff.

        Raises:
            TokenCacheError: If credentials are not configured
            TokenFetchError: If all retry attempts fail
        """
        if not settings.OAUTH_CLIENT_ID or not settings.OAUTH_CLIENT_SECRET:
            raise TokenCacheError("AI client credentials not configured (OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET)")

        data = {
            "grant_type": "client_credentials",
            "client_id": settings.OAUTH_CLIENT_ID,
            "client_secret": settings.OAUTH_CLIENT_SECRET,
            "scope": settings.OAUTH_TOKEN_SCOPE,
        }

        resp = requests.post(
            settings.OAUTH_TOKEN_URL,
            data=data,
            timeout=self._timeout,
        )
        resp.raise_for_status()
        print("🔐 Fetched new OAuth token")
        print("Response:", resp.json())
        return resp.json()

    def _store(self, token: str, expires_at: int):
        """Store token in Redis or memory fallback."""
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
            except Exception as e:
                print(f"Redis store failed, falling back to in-memory: {e}")
                # fallback to memory

        self._in_memory[self._cache_key] = token
        self._in_memory[self._expiry_key] = str(expires_at)

    def _load(self) -> Optional[tuple]:
        """Load token from Redis or memory fallback."""
        now = int(time.time())

        # Try Redis first
        if self._redis:
            try:
                token = self._redis.get(self._cache_key)
                expires_at = self._redis.get(self._expiry_key)
                if token and expires_at and int(expires_at) - settings.TOKEN_CACHE_BUFFER > now:
                    return token, int(expires_at)
            except Exception as e:
                print(f"Redis load failed, trying in-memory: {e}")

        # Fallback to in-memory
        token = self._in_memory.get(self._cache_key)
        expires_at = self._in_memory.get(self._expiry_key)
        if token and expires_at and int(expires_at) - settings.TOKEN_CACHE_BUFFER > now:
            return token, int(expires_at)

        return None

    def get_token(self, force_refresh: bool = False) -> str:
        """Return a valid access token, fetching and caching as needed.

        Args:
            force_refresh: If True, bypass cache and fetch a new token

        Returns:
            Valid access token string

        Raises:
            TokenCacheError: If credentials are not configured
            TokenFetchError: If token fetch fails after all retries
        """
        if not force_refresh:
            # Fast path: try load without lock
            cached = self._load()
            if cached:
                return cached[0]

        with self._lock:
            if not force_refresh:
                # Double-check after acquiring lock
                cached = self._load()
                if cached:
                    return cached[0]

            # Fetch token with retry logic
            data = self._fetch_token()

            if "access_token" not in data or "expires_in" not in data:
                raise TokenCacheError("Invalid token response from OAuth server")

            token = data["access_token"]
            expires_at = int(time.time()) + int(data["expires_in"])
            self._store(token, expires_at)
            return token

    def invalidate_cache(self):
        """Manually invalidate the cached token."""
        with self._lock:
            if self._redis:
                try:
                    self._redis.delete(self._cache_key, self._expiry_key)
                except Exception:
                    pass

            self._in_memory.clear()


# Singleton instance for module-level use
_token_manager = OAuthTokenManager(
    max_retries=getattr(settings, 'OAUTH_TOKEN_MAX_RETRIES', 3),
    base_delay=getattr(settings, 'OAUTH_TOKEN_BACKOFF_BASE', 1.0),
    max_delay=getattr(settings, 'OAUTH_RETRY_MAX_DELAY', 10.0),
    timeout=getattr(settings, 'OAUTH_TOKEN_FETCH_TIMEOUT', 10)
)


def get_token(force_refresh: bool = False) -> str:
    """Get OAuth token (module-level convenience function).

    Args:
        force_refresh: If True, bypass cache and fetch a new token

    Returns:
        Valid access token string
    """
    return _token_manager.get_token(force_refresh=force_refresh)


def invalidate_token_cache():
    """Invalidate the cached token (module-level convenience function)."""
    _token_manager.invalidate_cache()
