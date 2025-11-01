from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)

    # Candidate info
    name = Column(String(255))
    email = Column(String(255))

    # Answers to HR questions
    answers = Column(JSON)  # [{"question_id": 1, "answer": "..."}]

    # Resume/CV
    resume_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job_posting = relationship("JobPosting", back_populates="candidates")
    screening_result = relationship("ScreeningResult", back_populates="candidate", uselist=False)


class ScreeningResult(Base):
    """Screening results with detailed breakdown"""
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)

    # Overall score
    total_score = Column(Float)  # Weighted aggregate S(c)

    # Per-question scores
    question_scores = Column(JSON)  # [{"question_id": 1, "score": 0.85, "weight": 0.35}]

    # Decision
    decision = Column(String(50))  # "shortlist", "review", "flag", "reject"

    # Metadata
    weight_version = Column(Integer)  # Which weight version was used
    model_version = Column(String(50))  # Which model version
    created_at = Column(DateTime, default=datetime.utcnow)

    # HR feedback (for training)
    hr_rating = Column(Integer, nullable=True)  # 1-5 rating
    hr_decision = Column(String(50), nullable=True)  # "hired", "rejected", "interview"
    hr_notes = Column(Text, nullable=True)

    # Relationships
    job_posting = relationship("JobPosting", back_populates="screening_results")
    candidate = relationship("Candidate", back_populates="screening_result")