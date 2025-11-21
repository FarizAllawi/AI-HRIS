from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, cast
from collections import defaultdict
from uuid import UUID

from app.core.database import get_db
from app.models import Applicant, ApplicantAnswer
from app.schemas.screening import BatchScreening
from app.tasks.screening import screen_applicant_batch_async
import os

# Type hint for Celery task
from celery import Task
from typing import Any

# Cast the function to proper type
screen_applicant_task = cast(Task, screen_applicant_batch_async)

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

@router.post("/applicant/batch")
def screening_batch(
        data: BatchScreening,
        db: Session = Depends(get_db)
):
    ''' Screening multiple applicants at once'''
    # Group newly created applicants by job_posting_id
    applicants_by_job: Dict[UUID, List[Applicant]] = defaultdict(list)

    for applicant_data in data.applicants:
        # Check if applicant already exists in the database
        exists = db.query(Applicant).filter(
            Applicant.id == applicant_data.id
        ).first()

        # Only create a new applicant if they do not exist
        if not exists:
            # Create applicant record
            applicant = Applicant(
                id=applicant_data.id,
                job_posting_id=applicant_data.job_posting_id,
                user_id=applicant_data.user_id,
            )
            db.add(applicant)

            # Group by job_posting_id
            applicants_by_job[applicant_data.job_posting_id].append(applicant)

            # Process and add applicant answers
            for answer_data in applicant_data.answers:
                # Check if answer already exists
                answer_exists = db.query(ApplicantAnswer).filter(
                    ApplicantAnswer.id == answer_data.id,
                    ApplicantAnswer.applicant_id == applicant.id
                ).first()

                if not answer_exists:
                    answer = ApplicantAnswer(
                        id=answer_data.id,
                        applicant_id=answer_data.applicant_id,
                        question_id=answer_data.question_id,
                        answer=answer_data.answer,
                    )
                    db.add(answer)

    db.commit()

    # Trigger batch screening grouped by job_posting_id
    # Send separate Celery tasks for each job posting
    task_ids = []
    for job_posting_id, applicants in applicants_by_job.items():
        if applicants:
            applicant_ids = [a.id for a in applicants]
            task = screen_applicant_task.delay(job_posting_id, applicant_ids)
            task_ids.append({
                "job_posting_id": str(job_posting_id),
                "task_id": task.id,
                "applicant_count": len(applicant_ids)
            })

    # Return summary of created applicants and tasks
    return {
        "total_applicants_created": sum(len(apps) for apps in applicants_by_job.values()),
        "jobs_processed": len(applicants_by_job),
        "tasks": task_ids
    }
