from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import traceback

from app.core.database import get_db
from app.utils.parser import to_serializable
from app.tasks.job_posting_processing import process_job_posting_profile, regenerate_embeddings
from app.models.job_posting import JobPosting
from app.schemas.job_posting import (
    JobPostingSchema,
    JobPostingResponse
)

router = APIRouter()


@router.post("/", response_model=JobPostingResponse)
def create_job_posting(
        job_data: JobPostingSchema,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
):
    """
    Create a new job posting

    Workflow:
    1. Create job posting record
    2. Async: Parse JD, generate embeddings, calibrate thresholds
    """
    try:
        # Find existing job posting
        job_posting = db.query(JobPosting).filter(JobPosting.id == job_data.id).first()

        if job_posting:
            raise HTTPException(status_code=404, detail="Job posting already exists")

        job_data = to_serializable(job_data)
        job_posting = JobPosting(
            id=str(job_data['id']),
            title=job_data['title'],
            description=job_data['description'],
            requirements=to_serializable(job_data['requirements']),
            responsibilities=to_serializable(job_data['responsibilities']),
            qualifications=to_serializable(job_data['qualifications']),
            required_skills=to_serializable(job_data['required_skills']),
            preferred_skills=to_serializable(job_data['preferred_skills']),
            status=job_data['status'],
        )

        db.add(job_posting)
        db.commit()
        db.refresh(job_posting)

        # Process JD profile asynchronously
        # Questions are already converted to dicts by the validator
        background_tasks.add_task(
            lambda: process_job_posting_profile.delay(
                str(job_posting.id),
                job_data['questions'],
            )
        )

        return job_posting

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating job posting: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create job posting: {str(e)}"
        )

@router.put("/{job_posting_id}", response_model=JobPostingResponse)
def update_job_posting(
        job_posting_id: str,
        job_data: JobPostingSchema,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
):
    """
    Update an existing job posting
    """
    try:
        # Find existing job posting
        job_posting = db.query(JobPosting).filter(JobPosting.id == job_posting_id).first()

        if not job_posting:
            raise HTTPException(status_code=404, detail="Job posting not found")

        # Update fields
        job_data = to_serializable(job_data)
        job_posting.title = job_data['title']
        job_posting.description = job_data['description']
        job_posting.requirements = job_data['requirements']
        job_posting.responsibilities = job_data['responsibilities']
        job_posting.qualifications = job_data['qualifications']
        job_posting.required_skills = job_data['required_skills']
        job_posting.preferred_skills = job_data['preferred_skills']

        db.commit()
        db.refresh(job_posting)

        # Process JD profile asynchronously
        background_tasks.add_task(
            lambda: regenerate_embeddings.delay(
                str(job_posting.id),
            )
        )

        return job_posting

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating job posting: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update job posting: {str(e)}"
        )