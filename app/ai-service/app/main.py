from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from jose import jwt, JWTError, ExpiredSignatureError
from app.api import screening, job_posting
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
from app.core.oauth_key_manager import start_key_refresher
import app.models  # for models creation
import os

setup_logging()

# -------------------------------------------------------------------
# 🔐 Dynamic Laravel Passport public key loader (checks file mtime)
# -------------------------------------------------------------------
def get_public_key():
    """Read the Laravel public key from disk and cache it until the file changes.

    This allows the background refresher to update the file while the app
    continues to verify tokens using the latest key without restarting.
    """
    key_path = settings.OAUTH_PUBLIC_KEY

    if not os.path.exists(key_path):
        raise RuntimeError(f"❌ oauth public key not found at {key_path}")

    try:
        mtime = os.path.getmtime(key_path)
    except Exception as e:
        raise RuntimeError(f"❌ Failed to stat public key file: {e}")

    cache = getattr(get_public_key, "_cache", None)
    if cache and cache.get("path") == key_path and cache.get("mtime") == mtime:
        return cache.get("key")

    with open(key_path, "r") as f:
        key = f.read()

    get_public_key._cache = {"path": key_path, "mtime": mtime, "key": key}
    return key


# -------------------------------------------------------------------
# 🧩 JWT verification function
# -------------------------------------------------------------------
def verify_laravel_token(token: str):
    """
    Verifies a JWT access token signed by Laravel Passport.

    Implementation notes:
    - Decode signature and standard claims but disable automatic `aud` verification
      (some OAuth servers issue different `aud` formats). We then manually verify
      the `aud` claim against configured acceptable audiences (comma-separated).
    - On JWTError or ExpiredSignatureError we retry once after refreshing the
      cached public key to handle key rotation.
    """
    # parse configured acceptable audiences (comma-separated)
    audiences = [a.strip() for a in settings.OAUTH_EXPECTED_AUDIENCES.split(',') if a.strip()]
    if not audiences:
        audiences = None

    # Helper to perform decode with optional audience check
    def _decode_and_check(pub_key):
        # Decode token but skip audience verification so we can handle lists consistently
        payload = jwt.decode(token, pub_key, algorithms=["RS256"], options={"verify_aud": False})

        if audiences:
            aud_claim = payload.get("aud")
            # normalize aud claim to list
            aud_values = aud_claim if isinstance(aud_claim, list) else ([aud_claim] if aud_claim is not None else [])
            if not any(a in audiences for a in aud_values):
                raise JWTError(f"Invalid audience: token aud={aud_values} expected any of={audiences}")
        return payload

    try:
        return _decode_and_check(get_public_key())

    except ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")

    except JWTError as e:
        # Attempt a single refresh of the public key (rotation) then retry
        try:
            if hasattr(get_public_key, "_cache"):
                delattr(get_public_key, "_cache")
        except Exception:
            pass

        try:
            return _decode_and_check(get_public_key())
        except JWTError as e2:
            # Provide clearer message if it's an audience issue
            msg = str(e2)
            if 'Invalid audience' in msg or 'Invalid audience:' in msg:
                raise HTTPException(status_code=401, detail=f"Invalid or expired token: Invalid audience")
            raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e2}")


# -------------------------------------------------------------------
# 🛡️ Dependency for protected routes
# -------------------------------------------------------------------
def get_current_user(request: Request):
    """
    Extracts and verifies the Bearer token from the Authorization header.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = auth_header.split(" ")[1]
    return verify_laravel_token(token)

# -------------------------------------------------------------------
# 🧬 Application lifespan events
# -------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # 🔁 Start key rotation thread
    start_key_refresher()
    print("🔑 Public key refresher started")

    yield

    # Shutdown: Cleanup
    print("🔻 Shutting down...")

# -------------------------------------------------------------------
# 🚀 FastAPI App Initialization
# -------------------------------------------------------------------
app = FastAPI(
    title="AI Screening Service",
    description="IndoBERT-based candidate screening with secure Laravel Passport authentication",
    version="0.1.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# 🔗 Include Routers
# -------------------------------------------------------------------
# Example of protecting routes with Laravel Passport verification
app.include_router(job_posting.router, prefix="/job-posting", dependencies=[Depends(get_current_user)])
app.include_router(screening.router, prefix="/screening", dependencies=[Depends(get_current_user)])

# -------------------------------------------------------------------
# 🌐 Basic Routes
# -------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "AI Screening Service",
        "status": "running",
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": bool(getattr(getattr(app, 'state', None), 'model', None))
    }
