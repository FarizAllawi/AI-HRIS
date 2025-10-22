from pydantic import BaseModel

class JobPostingCreate(BaseModel):
    title: str
    description: str
    responsibilities: str[]
    requirements: str[]
    benefits: str[]
    questions: str[]