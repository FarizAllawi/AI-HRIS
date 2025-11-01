"""
Pydantic Schemas: Screening

Schemas for candidate screening results and operations
"""
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime


class QuestionScoreDetail(BaseModel):
    """Detailed score breakdown for a single question"""
    question_id: int
    question_text: Optional[str] = None
    score: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Question weight")
    weighted_score: float = Field(..., ge=0.0, le=1.0, description="Score × Weight")

    class Config:
        schema_extra = {
            "example": {
                "question_id": 1,
                "question_text": "Describe your Python experience",
                "score": 0.85,
                "weight": 0.4,
                "weighted_score": 0.34
            }
        }


class ScreeningResultResponse(BaseModel):
    """Basic screening result response"""
    id: int
    job_posting_id: int
    candidate_id: int
    total_score: float = Field(..., ge=0.0, le=1.0)
    decision: str = Field(..., pattern="^(shortlist|review|flag)$")
    weight_version: int
    model_version: str
    created_at: datetime

    # Optional HR feedback
    hr_rating: Optional[int] = Field(None, ge=1, le=5)
    hr_decision: Optional[str] = Field(None, pattern="^(hired|rejected|interview)$")
    hr_notes: Optional[str] = None

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "job_posting_id": 1,
                "candidate_id": 1,
                "total_score": 0.82,
                "decision": "shortlist",
                "weight_version": 1,
                "model_version": "v1.0",
                "created_at": "2025-01-24T10:35:00",
                "hr_rating": None,
                "hr_decision": None
            }
        }


class ScreeningResultDetail(ScreeningResultResponse):
    """Detailed screening result with question breakdown"""
    question_scores: List[QuestionScoreDetail]
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "total_score": 0.82,
                "decision": "shortlist",
                "question_scores": [
                    {
                        "question_id": 1,
                        "score": 0.85,
                        "weight": 0.4,
                        "weighted_score": 0.34
                    }
                ],
                "candidate_name": "Jane Smith",
                "job_title": "Senior Python Developer"
            }
        }


class ScreeningSummaryResponse(BaseModel):
    """Summary statistics for job screening"""
    job_posting_id: int
    total_candidates: int

    # Decision breakdown
    shortlisted: int
    review: int
    flagged: int

    # Score statistics
    avg_score: float
    min_score: Optional[float] = None
    max_score: Optional[float] = None

    # Score distribution (percentiles)
    score_distribution: Dict[str, float] = Field(
        ...,
        description="Percentile distribution: p25, p50, p75, p90"
    )

    # Thresholds
    shortlist_threshold: Optional[float] = None
    flag_threshold: Optional[float] = None

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "total_candidates": 50,
                "shortlisted": 12,
                "review": 28,
                "flagged": 10,
                "avg_score": 0.65,
                "min_score": 0.32,
                "max_score": 0.91,
                "score_distribution": {
                    "p25": 0.52,
                    "p50": 0.65,
                    "p75": 0.78,
                    "p90": 0.85
                },
                "shortlist_threshold": 0.75,
                "flag_threshold": 0.25
            }
        }


class ScreeningReportResponse(BaseModel):
    """Comprehensive screening report"""
    job_posting_id: int
    job_title: str
    total_candidates: int

    # Decision breakdown
    decisions: Dict[str, int] = Field(
        ...,
        description="Count by decision: shortlist, review, flag"
    )

    # Score statistics
    scores: Dict[str, float] = Field(
        ...,
        description="Mean, median, std, min, max, percentiles"
    )

    # Thresholds
    thresholds: Dict[str, float]

    # Question performance analysis
    question_performance: Dict[str, Dict[str, float]] = Field(
        ...,
        description="Performance stats per question"
    )

    # Top candidates
    top_candidates: List[Dict] = Field(
        ...,
        description="Top N candidates by score"
    )

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "job_title": "Senior Python Developer",
                "total_candidates": 50,
                "decisions": {
                    "shortlist": 12,
                    "review": 28,
                    "flag": 10
                },
                "scores": {
                    "mean": 0.65,
                    "median": 0.64,
                    "std": 0.15,
                    "p75": 0.78
                },
                "question_performance": {
                    "question_1": {"mean": 0.72, "std": 0.12}
                },
                "top_candidates": [
                    {"name": "Jane Smith", "score": 0.91, "decision": "shortlist"}
                ]
            }
        }


class FeedbackUpdate(BaseModel):
    """Schema for HR feedback on screening result"""
    hr_rating: Optional[int] = Field(None, ge=1, le=5, description="HR rating (1-5)")
    hr_decision: Optional[str] = Field(
        None,
        pattern="^(hired|rejected|interview)$",
        description="HR decision"
    )
    hr_notes: Optional[str] = Field(None, max_length=2000, description="HR notes")

    @validator('hr_notes')
    def validate_notes(cls, v):
        """Clean notes"""
        if v:
            return v.strip()
        return v

    class Config:
        schema_extra = {
            "example": {
                "hr_rating": 4,
                "hr_decision": "interview",
                "hr_notes": "Strong technical skills, good cultural fit. Schedule interview."
            }
        }


class RescoreRequest(BaseModel):
    """Request to re-score candidates"""
    job_posting_id: int
    candidate_ids: Optional[List[int]] = Field(
        None,
        description="Specific candidates to re-score. If None, re-scores all."
    )
    reason: Optional[str] = Field(None, max_length=500, description="Reason for re-scoring")

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "candidate_ids": [1, 2, 3],
                "reason": "Model updated to v2.0"
            }
        }


class BulkScreeningRequest(BaseModel):
    """Request for bulk screening operation"""
    job_posting_id: int
    candidate_ids: Optional[List[int]] = Field(
        None,
        max_items=1000,
        description="Candidate IDs to screen. If None, screens all unscreened."
    )
    priority: Optional[int] = Field(
        5,
        ge=1,
        le=10,
        description="Task priority (1=low, 10=high)"
    )

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "candidate_ids": None,
                "priority": 8
            }
        }


class ScreeningFilterParams(BaseModel):
    """Query parameters for filtering screening results"""
    job_posting_id: int
    decision: Optional[str] = Field(None, pattern="^(shortlist|review|flag)$")
    min_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    has_hr_feedback: Optional[bool] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)
    sort_by: Optional[str] = Field("total_score", pattern="^(total_score|created_at)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")

    @validator('max_score')
    def validate_score_range(cls, v, values):
        """Ensure max_score >= min_score"""
        if v is not None and 'min_score' in values and values['min_score'] is not None:
            if v < values['min_score']:
                raise ValueError("max_score must be >= min_score")
        return v

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "decision": "shortlist",
                "min_score": 0.7,
                "skip": 0,
                "limit": 50,
                "sort_by": "total_score",
                "sort_order": "desc"
            }
        }


class ScreeningStatusResponse(BaseModel):
    """Response for screening status check"""
    status: str = Field(..., pattern="^(pending|processing|completed|failed)$")
    candidate_id: int
    job_posting_id: int
    task_id: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    message: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "status": "processing",
                "candidate_id": 1,
                "job_posting_id": 1,
                "task_id": "abc123",
                "progress": 75,
                "message": "Generating embeddings..."
            }
        }


class ScreeningComparisonRequest(BaseModel):
    """Request to compare screening results"""
    candidate_id_1: int
    candidate_id_2: int
    job_posting_id: int

    class Config:
        schema_extra = {
            "example": {
                "candidate_id_1": 1,
                "candidate_id_2": 2,
                "job_posting_id": 1
            }
        }


class ScreeningComparisonResponse(BaseModel):
    """Response comparing two candidates"""
    job_posting_id: int
    candidate_1: Dict
    candidate_2: Dict
    score_difference: float
    better_candidate: int = Field(..., description="ID of better-scoring candidate")
    comparison_details: Dict = Field(..., description="Per-question comparison")

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "candidate_1": {
                    "id": 1,
                    "name": "Jane Smith",
                    "total_score": 0.85,
                    "decision": "shortlist"
                },
                "candidate_2": {
                    "id": 2,
                    "name": "John Doe",
                    "total_score": 0.72,
                    "decision": "review"
                },
                "score_difference": 0.13,
                "better_candidate": 1,
                "comparison_details": {
                    "question_1": {"candidate_1": 0.9, "candidate_2": 0.75}
                }
            }
        }