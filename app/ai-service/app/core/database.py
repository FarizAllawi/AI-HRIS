from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with different options depending on DB backend
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite local file for development
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    # Production-grade DB (Postgres etc.)
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    '''
        Dependency for database session
    '''
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
