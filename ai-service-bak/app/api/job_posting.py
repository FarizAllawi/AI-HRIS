from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.job_posting import JobPosting
from app.schemas.job_posting import (
    JobPostingCreate,
    JobPostingResponse,
    JobPostingUpdate,
    QuestionWeightUpdate
)
from app.tasks.jd_processing import process_jd_profile, regenerate_embeddings
from app.tasks.screening import rescore_with_new_weights_async

router = APIRouter()


@router.post("/", response_model=JobPostingResponse)
def create_job_posting(
        job_data: JobPostingCreate,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """
    Create a new job posting

    Workflow:
    1. Create job posting record
    2. Async: Parse JD, generate embeddings, calibrate thresholds
    """
    # Create job posting
    job_posting = JobPosting(
        title=job_data.title,
        description=job_data.description,
        status="processing"
    )

    db.add(job_posting)
    db.commit()
    db.refresh(job_posting)

    # Process JD profile asynchronously
    process_jd_profile.delay(
        job_posting.id,
        [q.dict() for q in job_data.questions]
    )

    return job_posting


@router.get("/{job_id}", response_model=JobPostingResponse)
def get_job_posting(job_id: int, db: Session = Depends(get_db)):
    """Get job posting by ID"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job


@router.get("/", response_model=List[JobPostingResponse])
def list_job_postings(
        status: str = None,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """List all job postings with optional filtering"""
    query = db.query(JobPosting)

    if status:
        query = query.filter(JobPosting.status == status)

    jobs = query.offset(skip).limit(limit).all()
    return jobs


@router.put("/{job_id}", response_model=JobPostingResponse)
def update_job_posting(
        job_id: int,
        job_data: JobPostingUpdate,
        db: Session = Depends(get_db)
):
    """Update job posting details"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    # If description changed, regenerate embeddings
    if "description" in update_data:
        regenerate_embeddings.delay(job_id)

    return job


@router.put("/{job_id}/weights", response_model=JobPostingResponse)
def update_question_weights(
        job_id: int,
        weights_data: QuestionWeightUpdate,
        db: Session = Depends(get_db)
):
    """
    Update question weights

    This will automatically trigger re-scoring of all candidates
    No model retraining needed!
    """
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    # Update weights
    questions = job.questions
    total_weight = sum(weights_data.weights.values())

    for q in questions:
        if q["id"] in weights_data.weights:
            q["weight"] = weights_data.weights[q["id"]] / total_weight

    job.questions = questions
    job.weight_version += 1

    db.commit()
    db.refresh(job)

    # Re-score all candidates asynchronously
    rescore_with_new_weights_async.delay(job_id)

    return job


@router.post("/{job_id}/publish")
def publish_job_posting(job_id: int, db: Session = Depends(get_db)):
    """Publish job posting (make it active)"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    if not job.embeddings:
        raise HTTPException(
            status_code=400,
            detail="Cannot publish: JD profile not yet processed"
        )

    job.status = "active"
    db.commit()

    return {"message": "Job posting published", "job_id": job_id}


@router.post("/{job_id}/close")
def close_job_posting(job_id: int, db: Session = Depends(get_db)):
    """Close job posting"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    job.status = "closed"
    db.commit()

    return {"message": "Job posting closed", "job_id": job_id}


@router.delete("/{job_id}")
def delete_job_posting(job_id: int, db: Session = Depends(get_db)):
    """Delete job posting (soft delete by archiving)"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    job.status = "archived"
    db.commit()

    return {"message": "Job posting archived", "job_id": job_id}