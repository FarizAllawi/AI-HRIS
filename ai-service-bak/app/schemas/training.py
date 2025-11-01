"""
Pydantic Schemas: Training & Model Management

Schemas for model training, refinement, and checkpoint management
"""
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime


class TrainingExampleCreate(BaseModel):
    """Schema for creating a training example"""
    answer_text: str = Field(..., min_length=10, max_length=5000)
    jd_text: str = Field(..., min_length=10, max_length=5000)
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score (0-1)")
    hr_rating: Optional[int] = Field(None, ge=1, le=5, description="HR rating if available")
    job_posting_id: Optional[int] = None
    question_id: Optional[int] = None
    competency_type: Optional[str] = None
    source: str = Field("manual", pattern="^(manual|hr_feedback|auto_label|pairwise)$")

    class Config:
        schema_extra = {
            "example": {
                "answer_text": "I have 7 years of Python experience...",
                "jd_text": "5+ years Python experience required",
                "relevance_score": 0.9,
                "hr_rating": 5,
                "source": "hr_feedback"
            }
        }


class TrainingExampleResponse(BaseModel):
    """Schema for training example response"""
    id: int
    answer_text: str
    jd_text: str
    relevance_score: float
    hr_rating: Optional[int]
    job_posting_id: Optional[int]
    question_id: Optional[int]
    source: str
    diversity_score: float
    usage_count: int
    is_active: bool
    created_at: datetime
    last_used: Optional[datetime]

    class Config:
        from_attributes = True


class TrainingStatsResponse(BaseModel):
    """Schema for training statistics"""
    training_examples: Dict[str, int] = Field(
        ...,
        description="Total, active, by_source counts"
    )
    model_checkpoints: Dict[str, Optional[str]] = Field(
        ...,
        description="Total, active_version, latest_version"
    )
    hr_feedback: Dict[str, int] = Field(
        ...,
        description="HR feedback statistics"
    )
    ready_for_training: bool = Field(
        ...,
        description="Whether system has enough data for training"
    )
    recommended_action: Optional[str] = Field(
        None,
        description="Recommended next action"
    )

    class Config:
        schema_extra = {
            "example": {
                "training_examples": {
                    "total": 523,
                    "active": 500,
                    "by_source": {
                        "hr_feedback": 450,
                        "manual": 50
                    }
                },
                "model_checkpoints": {
                    "total": 3,
                    "active_version": "v1.20250120_120000",
                    "latest_version": "v1.20250124_103045"
                },
                "hr_feedback": {
                    "total_with_ratings": 450
                },
                "ready_for_training": True,
                "recommended_action": "System up to date"
            }
        }


class ModelCheckpointResponse(BaseModel):
    """Schema for model checkpoint response"""
    id: int
    version: str
    training_samples: int
    val_loss: Optional[float]
    val_accuracy: Optional[float]
    is_active: bool
    created_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "version": "v1.20250124_103045",
                "training_samples": 523,
                "val_loss": 0.15,
                "val_accuracy": 0.87,
                "is_active": False,
                "created_at": "2025-01-24T10:30:45",
                "notes": "Continual learning refinement"
            }
        }


class ModelCheckpointDetail(ModelCheckpointResponse):
    """Detailed model checkpoint with config"""
    path: str
    config: Dict = Field(..., description="Training configuration")

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "version": "v1.20250124_103045",
                "path": "./data/models/v1.20250124_103045",
                "training_samples": 523,
                "val_loss": 0.15,
                "val_accuracy": 0.87,
                "config": {
                    "epochs": 3,
                    "batch_size": 16,
                    "learning_rate": 2e-5,
                    "replay_ratio": 0.3
                },
                "is_active": False,
                "created_at": "2025-01-24T10:30:45"
            }
        }


class TrainingTriggerRequest(BaseModel):
    """Request to trigger model training"""
    epochs: int = Field(3, ge=1, le=10, description="Number of training epochs")
    batch_size: int = Field(16, ge=4, le=64, description="Batch size")
    force: bool = Field(
        False,
        description="Force training even if not enough data"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Training notes")

    class Config:
        schema_extra = {
            "example": {
                "epochs": 3,
                "batch_size": 16,
                "force": False,
                "notes": "Weekly scheduled refinement"
            }
        }


class TrainingProgressResponse(BaseModel):
    """Response for training progress"""
    status: str = Field(..., pattern="^(pending|training|validating|saving|completed|failed)$")
    task_id: str
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    current_epoch: Optional[int] = None
    total_epochs: Optional[int] = None
    current_loss: Optional[float] = None
    message: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "status": "training",
                "task_id": "abc123",
                "progress": 45,
                "current_epoch": 2,
                "total_epochs": 3,
                "current_loss": 0.18,
                "message": "Training epoch 2/3..."
            }
        }


class TrainingResultResponse(BaseModel):
    """Response after training completion"""
    status: str = Field(..., pattern="^(success|error|skipped)$")
    version: Optional[str] = None
    checkpoint_id: Optional[int] = None
    checkpoint_path: Optional[str] = None
    training_samples: Optional[int] = None
    new_examples: Optional[int] = None
    replay_samples: Optional[int] = None
    final_val_loss: Optional[float] = None
    final_val_accuracy: Optional[float] = None
    message: str

    class Config:
        schema_extra = {
            "example": {
                "status": "success",
                "version": "v1.20250124_103045",
                "checkpoint_id": 5,
                "checkpoint_path": "./data/models/v1.20250124_103045",
                "training_samples": 523,
                "new_examples": 150,
                "replay_samples": 200,
                "final_val_loss": 0.15,
                "final_val_accuracy": 0.87,
                "message": "Model v1.20250124_103045 trained. Activate via API to use."
            }
        }


class ModelComparisonRequest(BaseModel):
    """Request to compare two model versions"""
    version1: str = Field(..., description="First model version")
    version2: str = Field(..., description="Second model version")
    test_job_id: Optional[int] = Field(
        None,
        description="Job ID for testing. If None, uses random samples."
    )

    class Config:
        schema_extra = {
            "example": {
                "version1": "v1.20250120_000000",
                "version2": "v1.20250124_103045",
                "test_job_id": 1
            }
        }


class ModelComparisonResponse(BaseModel):
    """Response comparing two models"""
    status: str
    model1: Dict = Field(..., description="First model metrics")
    model2: Dict = Field(..., description="Second model metrics")
    test_samples: int
    recommendation: Optional[str] = Field(
        None,
        description="Which model to use"
    )

    class Config:
        schema_extra = {
            "example": {
                "status": "success",
                "model1": {
                    "version": "v1.20250120_000000",
                    "val_accuracy": 0.82,
                    "val_loss": 0.20,
                    "training_samples": 400
                },
                "model2": {
                    "version": "v1.20250124_103045",
                    "val_accuracy": 0.87,
                    "val_loss": 0.15,
                    "training_samples": 523
                },
                "test_samples": 50,
                "recommendation": "Use v1.20250124_103045 (better accuracy)"
            }
        }


class ModelActivationRequest(BaseModel):
    """Request to activate a model version"""
    version: str = Field(..., description="Model version to activate")
    force: bool = Field(
        False,
        description="Force activation without validation"
    )
    restart_services: bool = Field(
        False,
        description="Whether to restart services automatically (if supported)"
    )

    class Config:
        schema_extra = {
            "example": {
                "version": "v1.20250124_103045",
                "force": False,
                "restart_services": False
            }
        }


class ModelActivationResponse(BaseModel):
    """Response after model activation"""
    status: str = Field(..., pattern="^(success|error)$")
    version: str
    message: str
    restart_required: bool = Field(
        ...,
        description="Whether services need restart