from pydantic import BaseModel, Field,  ConfigDict
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

    # Pydantic V2 configuration
    model_config = ConfigDict(
        from_attributes=True,  # replaces orm_mode
        json_encoders={
            UUID: str,  # ✅ convert UUIDs to strings automatically
            JsonArrayItemSchema: lambda v: v.model_dump(),  # use model_dump() instead of dict()
            QuestionItem: lambda v: v.model_dump(),  # use model_dump() instead of dict()
        }
    )

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

    # Pydantic V2 configuration
    model_config = ConfigDict(
        from_attributes=True  # replaces orm_mode
    )
