from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class QuestionSchema(BaseModel):
    id: int
    text: str
    weight: float = Field(gt=0, description="Weight must be positive")
    mapped_competencies: List[int] = Field(
        default_factory=list,
        description="List of competency IDs this question maps to"
    )


class JobPostingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    questions: List[QuestionSchema]


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class QuestionWeightUpdate(BaseModel):
    weights: Dict[int, float] = Field(
        ...,
        description="Mapping of question_id to new weight"
    )


class JobPostingResponse(BaseModel):
    id: int
    title: str
    description: str
    responsibilities: Optional[List[str]]
    required_skills: Optional[List[str]]
    preferred_skills: Optional[List[str]]
    qualifications: Optional[List[str]]
    questions: Optional[List[Dict]]
    shortlist_threshold: Optional[float]
    flag_threshold: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime
    weight_version: int

    class Config:
        from_attributes = True