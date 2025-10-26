from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import screening, job_posting
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
import app.models #for models creation

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # Load base IndoBERT model
    # from app.ml.IndoBERT.indobert_model import IndoBERTModel
    # app.state.model = IndoBERTModel()
    print("✅ IndoBERT model loaded")

    yield

    # Shutdown: Cleanup
    print("🔻 Shutting down...")

app = FastAPI(
    title="AI Screening Service",
    description="IndoBERT-based candidate screening with continual learning",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(job_posting.router, prefix='/job-posting')
app.include_router(screening.router, prefix="/screening")

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
        "model_loaded": hasattr(app.state, "model")
    }
