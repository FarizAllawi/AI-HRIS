from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    # Structured JD components
    responsibilities = Column(JSON)  # List of responsibility sentences
    required_skills = Column(JSON)  # List of required skills
    preferred_skills = Column(JSON)  # List of preferred skills
    qualifications = Column(JSON)  # List of qualifications

    # HR Questions and Weights
    questions = Column(JSON)  # [{"id": 1, "text": "...", "weight": 0.35, "mapped_competencies": [0,1,2]}]

    # Calibration thresholds
    shortlist_threshold = Column(Float)  # P75 from similar JDs
    flag_threshold = Column(Float)  # P25 from similar JDs

    # Metadata
    status = Column(String(50), default="active")  # active, closed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    weight_version = Column(Integer, default=1)  # Increment on weight changes

    # Relationships
    embeddings = relationship("JDEmbedding", back_populates="job_posting", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="job_posting")
    screening_results = relationship("ScreeningResult", back_populates="job_posting")


class JDEmbedding(Base):
    """Cached JD embeddings per competency"""
    __tablename__ = "jd_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, nullable=False, index=True)

    # Competency identification
    competency_type = Column(String(50))  # "responsibility", "skill", "qualification"
    competency_id = Column(Integer)  # Index in the JSON array
    text = Column(Text)  # Original text

    # Embedding vector (stored as JSON array)
    embedding = Column(JSON)  # [0.123, -0.456, ...]

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    job_posting = relationship("JobPosting", back_populates="embeddings")