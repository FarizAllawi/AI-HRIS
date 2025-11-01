from sqlalchemy import UUID, JSON, Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime
import uuid

class Applicant(Base):
    __tablename__ = 'applicants'
    id = Column(UUID, primary_key=True, index=True)
    job_posting_id = Column(UUID, ForeignKey('job_posting.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID, nullable=False, index=True)

    # Metadata
    created_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationships
    job_posting = relationship(
        "JobPosting",
        back_populates="applicant",
    )
    applicant_answers = relationship(
        "ApplicantAnswer",
        back_populates="applicant",
        cascade="all, delete-orphan"
    )
    screening_results = relationship(
        "ScreeningResult",
        back_populates="applicant",
        cascade="all, delete-orphan"
    )

class ApplicantAnswer(Base):
    '''
    Stores answers provided by applicants to screening questions.
    '''
    __tablename__ = 'applicant_answers'

    id = Column(UUID, primary_key=True, index=True)
    applicant_id = Column(UUID, ForeignKey('applicants.id'), nullable=False, index=True)
    question_id = Column(UUID, ForeignKey('job_posting_question.id'), nullable=False, index=True)
    answer = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationships
    applicant = relationship("Applicant", back_populates="applicant_answers")
    question = relationship("JobPostingQuestion", back_populates="applicant_answers")


class ScreeningResult(Base):
  '''
    Screening results for an applicant against a job posting Question.
  '''
  __tablename__ = 'screening_results'
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  applicant_id = Column(UUID, ForeignKey('applicants.id', ondelete='CASCADE'), nullable=False)
  job_posting_id = Column(UUID, ForeignKey('job_posting.id', ondelete='CASCADE'), nullable=False, index=True)

  # Overall Score
  total_score = Column(Float) # Weighted aggreate S(c)

  # Per-question scores
  question_scores = Column(JSON)  # [{"question_id": 1, "score": 0.85, "weight": 0.35}]

  # Decision
  decision = Column(String(50))  # "shortlist", "review", "flag", "reject"

  # Metadata
  weight_version = Column(Integer) # Which weight version was used
  model_version = Column(String(50)) # Which model version
  created_at = Column(
      DateTime,
      default=datetime.datetime.now(tz=datetime.timezone.utc)
  )

  # HR Feedback (for training)
  hr_rating = Column(Integer, nullable=True) # 1-5 rating by HR
  hr_decision = Column(String(50), nullable=True) # "hired", "rejected", "interviewed"
  hr_notes = Column(Text, nullable=True) # Free text notes from HR

  # Relationships
  applicant = relationship("Applicant", back_populates="screening_results")
  job_posting = relationship("JobPosting", back_populates="screening_results")

