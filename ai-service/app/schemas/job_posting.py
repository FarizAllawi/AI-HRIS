from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any
from datetime import datetime
from uuid import UUID

class JsonArrayItemSchema(BaseModel):
    id: str
    value: str

class JsonArrayQuestionSchema(BaseModel):
    id: str
    job_posting_id: str
    question: str
    description: Optional[str] = ""
    weight: float
    mapped_competencies: List[str]
    weight_version: int

class QuestionItem(BaseModel):
    id: UUID
    job_posting_id: UUID
    question: str
    description: Optional[str] = None
    weight: float
    mapped_competencies: List[str]
    weight_version: int


class JobPostingSchema(BaseModel):
    id: Optional[UUID] = None
    title: str
    description: Optional[str] = None

    requirements: List[JsonArrayItemSchema]
    responsibilities: List[JsonArrayItemSchema]
    qualifications: List[JsonArrayItemSchema]
    required_skills: Optional[List[JsonArrayItemSchema]] = None
    preferred_skills: Optional[List[JsonArrayItemSchema]] = None
    questions: List[QuestionItem]
    status: Optional[str] = Field(default="draft")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        json_encoders = {
            UUID: str,  # ✅ convert UUIDs to strings automatically
            JsonArrayItemSchema: lambda v: v.dict(),
            QuestionItem: lambda v: v.dict(),
        }

class JobPostingQuestionCreate(BaseModel):
    id: UUID
    job_posting_id: UUID
    question: str
    weight: float = Field(gt=0, description="Weight must be positive")
    mapped_competencies: List[str]

class JobPostingResponse(BaseModel):
    id: UUID
    title: str
    description: str
    requirements: List[Dict] = []
    responsibilities: List[Dict] = []
    qualifications: List[Dict] = []
    required_skills: Optional[List[Dict]] = []
    preferred_skills: Optional[List[Dict]] = []
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For Pydantic v2 (replaces orm_mode)
        # orm_mode = True  # Uncomment this if using Pydantic v1