from sqlalchemy import UUID, Column, Integer, String, Text, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime
import uuid

class JobPosting(Base):
    __tablename__ = 'job_posting'
    id = Column(UUID, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    # Strutured Job Desc Components
    requirements = Column(JSON, nullable=False)
    responsibilities = Column(JSON, nullable=False) # List of Responsibility sentences
    qualifications = Column(JSON, nullable=False) # List of qualifications
    required_skills = Column(JSON) # List of required skilss
    preferred_skills = Column(JSON) # List of preferred skills

    # Metadata
    status = Column(String(50), default='draft') # draft, published, archived
    created_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationships
    questions = relationship(
        "JobPostingQuestion",
        back_populates="job_posting",
        cascade="all, delete-orphan"
    )

    embeddings = relationship(
        "JobPostingEmbedding",
        back_populates="job_posting",
        cascade="all, delete-orphan"
    )

    applicant = relationship(
        "Applicant",
        back_populates="job_posting",
    )

    screening_results = relationship(
        "ScreeningResult",
        back_populates="job_posting",
    )

class JobPostingQuestion(Base):
    __tablename__ = 'job_posting_question'
    id = Column(UUID, primary_key=True, index=True)
    job_posting_id = Column(UUID, ForeignKey('job_posting.id', ondelete='CASCADE'), nullable=False, index=True)
    question = Column(Text, nullable=False)
    weight = Column(Float, nullable=False)  # Weight of the question in overall screening
    mapped_competencies = Column(JSON)  # List of competency IDs mapped to this question

    weight_version = Column(Integer, default=1) # Incremented when weights are updated

    created_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(tz=datetime.timezone.utc),
        onupdate=datetime.datetime.now(tz=datetime.timezone.utc)
    )

    # Relationship
    job_posting = relationship("JobPosting", back_populates="questions")

    applicant_answers = relationship(
        "ApplicantAnswer",
        back_populates="question",
        cascade="all, delete-orphan"
    )

class JobPostingEmbedding(Base):
    __tablename__ = 'job_posting_embedding'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    job_posting_id = Column(UUID, ForeignKey('job_posting.id', ondelete='CASCADE'), nullable=False, index=True)

    # Compentency Identification
    competency_type = Column(Text) # responsibility, required_skill, preferred_skill, qualification
    competency_id = Column(Text) # Index of the competency in the list
    text = Column(Text) # Original text

    # Embedding Vector (stored as JSON array)
    embedding = Column(JSON) # [0.123, 0.456, ...]
    created_at = Column(DateTime, default=datetime.datetime.now(tz=datetime.timezone.utc))

    # Relationships
    job_posting = relationship("JobPosting", back_populates="embeddings")
