from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid


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


class JobPostingCreate(BaseModel):
    id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    responsibilities: List[Any]  # Changed to Any to accept both Pydantic models and dicts
    requirements: List[Any]
    qualifications: List[Any]
    required_skills: List[Any]
    preferred_skills: List[Any]
    questions: List[Any]

    @field_validator(
        'requirements',
        'responsibilities',
        'qualifications',
        'required_skills',
        'preferred_skills',
        mode='before'
    )
    @classmethod
    def convert_array_items_to_dict(cls, v):
        """
        Convert JsonArrayItemSchema instances to plain dicts.
        This ensures SQLAlchemy can serialize them as JSON.
        """
        if v is None:
            return []

        if not isinstance(v, list):
            return []

        result = []
        for item in v:
            if hasattr(item, 'model_dump'):
                # Pydantic v2
                result.append(item.model_dump())
            elif hasattr(item, 'dict'):
                # Pydantic v1
                result.append(item.dict())
            elif isinstance(item, dict):
                # Already a dict
                result.append(item)
            else:
                # Try to convert to dict if possible
                try:
                    result.append(dict(item))
                except (TypeError, ValueError):
                    result.append(item)

        return result

    @field_validator('questions', mode='before')
    @classmethod
    def convert_questions_to_dict(cls, v):
        """
        Convert JsonArrayQuestionSchema instances to plain dicts.
        """
        if v is None:
            return []

        if not isinstance(v, list):
            return []

        result = []
        for item in v:
            if hasattr(item, 'model_dump'):
                result.append(item.model_dump())
            elif hasattr(item, 'dict'):
                result.append(item.dict())
            elif isinstance(item, dict):
                result.append(item)
            else:
                try:
                    result.append(dict(item))
                except (TypeError, ValueError):
                    result.append(item)

        return result


class JobPostingQuestionCreate(BaseModel):
    id: uuid.UUID
    job_posting_id: uuid.UUID
    question: str
    weight: float = Field(gt=0, description="Weight must be positive")
    mapped_competencies: List[str]


class JobPostingResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    requirements: Optional[List[Dict]] = []
    responsibilities: Optional[List[Dict]] = []
    required_skills: Optional[List[Dict]] = []
    preferred_skills: Optional[List[Dict]] = []
    qualifications: Optional[List[Dict]] = []
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For Pydantic v2 (replaces orm_mode)
        # orm_mode = True  # Uncomment this if using Pydantic v1