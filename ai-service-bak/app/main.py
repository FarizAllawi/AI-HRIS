from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import job_posting, screening, training, training


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # Load base IndoBERT model
    from app.ml.IndoBERT.indobert_model import IndoBERTModel
    app.state.model = IndoBERTModel()
    print("✅ IndoBERT model loaded")

    yield

    # Shutdown: Cleanup
    print("🔻 Shutting down...")


app = FastAPI(
    title="AI Screening Service",
    description="IndoBERT-based candidate screening with continual learning",
    version="1.0.0",
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

# Include routers
app.include_router(job_posting.router, prefix="/api/v1/jobs", tags=["Job Postings"])
app.include_router(screening.router, prefix="/api/v1/screening", tags=["Screening"])
app.include_router(calibration.router, prefix="/api/v1/calibration", tags=["Calibration"])
app.include_router(training.router, prefix="/api/v1/training", tags=["Training"])


@app.get("/")
async def root():
    return {
        "service": "AI Screening Service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": hasattr(app.state, "model")
    }