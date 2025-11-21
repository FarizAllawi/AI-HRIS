from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from uuid import UUID

class AnswerSchema(BaseModel):
    id: UUID
    applicant_id: UUID
    question_id: UUID
    answer: str

class ApplicantSchema(BaseModel):
    id: UUID
    job_posting_id: UUID
    user_id: UUID
    answers:  List[AnswerSchema]

class BatchScreening(BaseModel):
    applicants: List[ApplicantSchema]

class ScreeningResultSchema(BaseModel):
    id: UUID
    job_posting_id: UUID
    candidate_id: UUID
    score: float
    decision: str = Field(..., pattern="^(shortlist|review|flag)$")
    weight_version: float
    model_version: str

class ScreeningReportResponse(BaseModel):
    ''' Comprehensive screening report '''
    job_posting_id: UUID
    job_title: str
    total_applicants: int

    # decisions breakdown
    decisions: Dict[str, int] = Field(
        ...,
        description="Count by decision: shortlist, review, flag"
    )

    # score statistics
    scores: Dict[str, int] = Field(
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
