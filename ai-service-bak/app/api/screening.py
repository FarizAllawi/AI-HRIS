from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.candidate import Candidate, ScreeningResult
from app.models.job_posting import JobPosting
from app.schemas.screening import (
    CandidateCreate,
    CandidateResponse,
    ScreeningResultResponse,
    ScreeningSummaryResponse,
    FeedbackUpdate
)
from app.tasks.screening import screen_candidate_async, screen_candidates_batch_async
from app.ml.indobert_model import IndoBERTModel
from app.services.screening_service import ScreeningService

router = APIRouter()


@router.post("/candidates", response_model=CandidateResponse)
def submit_candidate(
        candidate_data: CandidateCreate,
        db: Session = Depends(get_db)
):
    """
    Submit a candidate application

    This will automatically trigger screening
    """
    # Verify job posting exists
    job = db.query(JobPosting).filter(
        JobPosting.id == candidate_data.job_posting_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    if job.status != "active":
        raise HTTPException(status_code=400, detail="Job posting is not active")

    # Create candidate
    candidate = Candidate(
        job_posting_id=candidate_data.job_posting_id,
        name=candidate_data.name,
        email=candidate_data.email,
        answers=[a.dict() for a in candidate_data.answers],
        resume_text=candidate_data.resume_text
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Trigger async screening
    screen_candidate_async.delay(candidate.id, candidate_data.job_posting_id)

    return candidate


@router.post("/candidates/batch", response_model=List[CandidateResponse])
def submit_candidates_batch(
        candidates_data: List[CandidateCreate],
        db: Session = Depends(get_db)
):
    """Submit multiple candidates at once"""
    candidates = []

    for candidate_data in candidates_data:
        candidate = Candidate(
            job_posting_id=candidate_data.job_posting_id,
            name=candidate_data.name,
            email=candidate_data.email,
            answers=[a.dict() for a in candidate_data.answers],
            resume_text=candidate_data.resume_text
        )
        db.add(candidate)
        candidates.append(candidate)

    db.commit()

    # Trigger batch screening
    if candidates:
        job_id = candidates[0].job_posting_id
        candidate_ids = [c.id for c in candidates]
        screen_candidates_batch_async.delay(job_id, candidate_ids)

    return candidates


@router.get("/results/{candidate_id}", response_model=ScreeningResultResponse)
def get_screening_result(candidate_id: int, db: Session = Depends(get_db)):
    """Get screening result for a candidate"""
    result = db.query(ScreeningResult).filter(
        ScreeningResult.candidate_id == candidate_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Screening result not found. Screening may still be in progress."
        )

    return result


@router.get("/results/job/{job_id}", response_model=List[ScreeningResultResponse])
def get_job_screening_results(
        job_id: int,
        decision: Optional[str] = None,
        min_score: Optional[float] = None,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Get all screening results for a job posting with optional filtering

    Filters:
    - decision: shortlist, review, flag
    - min_score: minimum score threshold
    """
    query = db.query(ScreeningResult).filter(
        ScreeningResult.job_posting_id == job_id
    )

    if decision:
        query = query.filter(ScreeningResult.decision == decision)

    if min_score is not None:
        query = query.filter(ScreeningResult.total_score >= min_score)

    # Order by score descending
    query = query.order_by(ScreeningResult.total_score.desc())

    results = query.offset(skip).limit(limit).all()
    return results


@router.get("/summary/{job_id}", response_model=ScreeningSummaryResponse)
def get_screening_summary(job_id: int, db: Session = Depends(get_db)):
    """Get screening summary statistics for a job posting"""
    from app.main import app

    model = app.state.model
    screening_service = ScreeningService(model, db)

    summary = screening_service.get_screening_summary(job_id)

    return summary


@router.post("/screen-now/{candidate_id}")
def screen_candidate_now(
        candidate_id: int,
        db: Session = Depends(get_db)
):
    """
    Screen a candidate immediately (synchronous)
    Use for real-time screening when needed
    """
    from app.main import app

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    model = app.state.model
    screening_service = ScreeningService(model, db)

    try:
        result = screening_service.screen_candidate(
            candidate_id,
            candidate.job_posting_id
        )

        return {
            "status": "success",
            "candidate_id": candidate_id,
            "total_score": result.total_score,
            "decision": result.decision,
            "question_scores": result.question_scores
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/feedback/{result_id}")
def update_hr_feedback(
        result_id: int,
        feedback: FeedbackUpdate,
        db: Session = Depends(get_db)
):
    """
    Update HR feedback on screening result
    This data will be used for model refinement
    """
    result = db.query(ScreeningResult).filter(
        ScreeningResult.id == result_id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Screening result not found")

    # Update feedback
    if feedback.hr_rating is not None:
        result.hr_rating = feedback.hr_rating

    if feedback.hr_decision is not None:
        result.hr_decision = feedback.hr_decision

    if feedback.hr_notes is not None:
        result.hr_notes = feedback.hr_notes

    db.commit()
    db.refresh(result)

    # Optionally: Add to training data
    if feedback.hr_rating is not None:
        from app.models.training_data import TrainingExample

        candidate = result.candidate
        job = result.job_posting

        # Create training examples from answers
        for answer_dict in candidate.answers:
            question = next(
                (q for q in job.questions if q["id"] == answer_dict["question_id"]),
                None
            )

            if question:
                # Find relevant JD text
                mapped_comps = question.get("mapped_competencies", [])
                jd_texts = []

                for emb in job.embeddings:
                    if emb.competency_id in mapped_comps:
                        jd_texts.append(emb.text)

                if jd_texts:
                    training_example = TrainingExample(
                        answer_text=answer_dict["answer"],
                        jd_text=" ".join(jd_texts),
                        relevance_score=result.total_score,
                        hr_rating=feedback.hr_rating,
                        job_posting_id=job.id,
                        question_id=answer_dict["question_id"],
                        source="hr_feedback"
                    )
                    db.add(training_example)

        db.commit()

    return {"message": "Feedback updated", "result_id": result_id}