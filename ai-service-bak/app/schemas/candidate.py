"""
Pydantic Schemas: Candidate

Schemas for candidate data validation and serialization
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Dict, Optional
from datetime import datetime


class AnswerSchema(BaseModel):
    """Schema for a single answer"""
    question_id: int = Field(..., description="Question ID")
    answer: str = Field(..., min_length=1, max_length=5000, description="Answer text")

    @validator('answer')
    def validate_answer(cls, v):
        """Ensure answer is not just whitespace"""
        if not v.strip():
            raise ValueError("Answer cannot be empty or whitespace only")
        return v.strip()


class CandidateCreate(BaseModel):
    """Schema for creating a new candidate"""
    job_posting_id: int = Field(..., description="Job posting ID to apply for")
    name: str = Field(..., min_length=1, max_length=255, description="Candidate name")
    email: EmailStr = Field(..., description="Candidate email")
    answers: List[AnswerSchema] = Field(..., min_items=1, description="Answers to HR questions")
    resume_text: Optional[str] = Field(None, max_length=50000, description="Resume/CV text (optional)")

    @validator('name')
    def validate_name(cls, v):
        """Clean name"""
        return v.strip()

    @validator('answers')
    def validate_answers(cls, v):
        """Ensure no duplicate question IDs"""
        question_ids = [a.question_id for a in v]
        if len(question_ids) != len(set(question_ids)):
            raise ValueError("Duplicate question IDs found in answers")
        return v

    class Config:
        schema_extra = {
            "example": {
                "job_posting_id": 1,
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "answers": [
                    {
                        "question_id": 1,
                        "answer": "I have 7 years of Python experience, focusing on backend development..."
                    },
                    {
                        "question_id": 2,
                        "answer": "One challenging problem I solved was optimizing a slow database query..."
                    }
                ],
                "resume_text": "Full resume text here..."
            }
        }


class CandidateUpdate(BaseModel):
    """Schema for updating candidate information"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    answers: Optional[List[AnswerSchema]] = None
    resume_text: Optional[str] = Field(None, max_length=50000)


class CandidateResponse(BaseModel):
    """Schema for candidate response"""
    id: int
    job_posting_id: int
    name: str
    email: str
    answers: List[Dict]
    resume_text: Optional[str] = None
    created_at: datetime

    # Include screening result if available
    screening_status: Optional[str] = Field(None, description="Screening status: pending, completed, failed")

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "job_posting_id": 1,
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "answers": [
                    {"question_id": 1, "answer": "..."}
                ],
                "created_at": "2025-01-24T10:30:00",
                "screening_status": "completed"
            }
        }


class CandidateBatchCreate(BaseModel):
    """Schema for batch candidate creation"""
    candidates: List[CandidateCreate] = Field(..., min_items=1, max_items=100, description="List of candidates")

    class Config:
        schema_extra = {
            "example": {
                "candidates": [
                    {
                        "job_posting_id": 1,
                        "name": "Candidate 1",
                        "email": "candidate1@example.com",
                        "answers": [{"question_id": 1, "answer": "..."}]
                    },
                    {
                        "job_posting_id": 1,
                        "name": "Candidate 2",
                        "email": "candidate2@example.com",
                        "answers": [{"question_id": 1, "answer": "..."}]
                    }
                ]
            }
        }


class CandidateListResponse(BaseModel):
    """Schema for paginated candidate list"""
    total: int
    page: int
    page_size: int
    candidates: List[CandidateResponse]


class CandidateDetailResponse(CandidateResponse):
    """Schema for detailed candidate view with screening result"""
    screening_result: Optional[Dict] = Field(None, description="Screening result details")

    class Config:
        from_attributes = True