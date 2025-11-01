from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime, Boolean
from datetime import datetime
from app.core.database import Base


class TrainingExample(Base):
    """Training data for continual learning"""
    __tablename__ = "training_examples"

    id = Column(Integer, primary_key=True, index=True)

    # Training tuple
    answer_text = Column(Text, nullable=False)
    jd_text = Column(Text, nullable=False)

    # Label
    relevance_score = Column(Float)  # 0.0-1.0 relevance
    hr_rating = Column(Integer, nullable=True)  # 1-5 from HR

    # Context
    job_posting_id = Column(Integer)
    question_id = Column(Integer)
    competency_type = Column(String(50))

    # Replay buffer management
    diversity_score = Column(Float, default=0.0)  # For diverse sampling
    usage_count = Column(Integer, default=0)  # How many times used in training

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    # Source tracking
    source = Column(String(50))  # "hr_feedback", "auto_label", "pairwise"


class PairwisePreference(Base):
    """Pairwise preferences: Candidate A > B for job X"""
    __tablename__ = "pairwise_preferences"

    id = Column(Integer, primary_key=True, index=True)

    job_posting_id = Column(Integer, nullable=False)

    # Winner and loser candidates
    winner_answer = Column(Text)
    loser_answer = Column(Text)

    # JD context
    jd_competency = Column(Text)

    # Confidence
    confidence = Column(Float, default=1.0)  # 0.0-1.0

    # HR feedback
    hr_user_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class ModelCheckpoint(Base):
    """Track model versions and checkpoints"""
    __tablename__ = "model_checkpoints"

    id = Column(Integer, primary_key=True, index=True)

    version = Column(String(50), unique=True, nullable=False)
    path = Column(String(500))

    # Training metadata
    training_samples = Column(Integer)
    val_loss = Column(Float)
    val_accuracy = Column(Float)

    # Hyperparameters
    config = Column(JSON)

    # Status
    is_active = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)