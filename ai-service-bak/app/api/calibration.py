from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.calibration_service import CalibrationService
from app.tasks.calibration import calibrate_thresholds_async

router = APIRouter()


@router.post("/jobs/{job_id}/calibrate")
def calibrate_job_thresholds(
        job_id: int,
        top_k: int = 5,
        db: Session = Depends(get_db)
):
    """
    Calibrate thresholds for a job posting using similar historical JDs

    Args:
        job_id: Job posting ID
        top_k: Number of similar JDs to use for calibration
    """
    calibration_service = CalibrationService(db)

    try:
        shortlist_th, flag_th = calibration_service.calibrate_thresholds(job_id, top_k)

        return {
            "status": "success",
            "job_id": job_id,
            "shortlist_threshold": shortlist_th,
            "flag_threshold": flag_th,
            "message": f"Thresholds calibrated using {top_k} similar historical JDs"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/{job_id}/calibrate-async")
def calibrate_job_thresholds_async(
        job_id: int,
        top_k: int = 5,
        db: Session = Depends(get_db)
):
    """
    Calibrate thresholds asynchronously (for long-running operations)
    """
    task = calibrate_thresholds_async.delay(job_id, top_k)

    return {
        "status": "processing",
        "task_id": task.id,
        "job_id": job_id,
        "message": "Calibration started in background"
    }


@router.post("/jobs/{job_id}/recalibrate")
def recalibrate_with_current_scores(
        job_id: int,
        db: Session = Depends(get_db)
):
    """
    Recalibrate thresholds using current applicant scores
    (Use when you have enough applicants)
    """
    from app.models.candidate import ScreeningResult

    # Get current scores
    results = db.query(ScreeningResult).filter(
        ScreeningResult.job_posting_id == job_id
    ).all()

    if len(results) < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough applicants for recalibration. Have {len(results)}, need at least 10."
        )

    scores = [r.total_score for r in results if r.total_score is not None]

    calibration_service = CalibrationService(db)
    shortlist_th, flag_th = calibration_service.recalibrate_on_demand(job_id, scores)

    return {
        "status": "success",
        "job_id": job_id,
        "shortlist_threshold": shortlist_th,
        "flag_threshold": flag_th,
        "applicants_used": len(scores),
        "message": "Thresholds recalibrated using current applicant scores"
    }


@router.get("/jobs/{job_id}/similar")
def find_similar_jobs(
        job_id: int,
        top_k: int = 5,
        db: Session = Depends(get_db)
):
    """
    Find similar historical job postings
    """
    from app.models.job_posting import JobPosting, JDEmbedding
    import numpy as np

    # Get current job
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    # Get aggregate embedding
    embeddings = db.query(JDEmbedding).filter(
        JDEmbedding.job_posting_id == job_id
    ).all()

    if not embeddings:
        raise HTTPException(
            status_code=400,
            detail="No embeddings found. Process JD profile first."
        )

    calibration_service = CalibrationService(db)

    # Get aggregate embedding
    emb_arrays = [np.array(e.embedding, dtype=np.float32) for e in embeddings]
    aggregate = np.mean(emb_arrays, axis=0)
    aggregate = aggregate / (np.linalg.norm(aggregate) + 1e-9)

    # Find similar
    similar_jobs = calibration_service._find_similar_jds(aggregate, job_id, top_k)

    # Get job details
    result = []
    for similar_job_id, similarity in similar_jobs:
        similar_job = db.query(JobPosting).filter(
            JobPosting.id == similar_job_id
        ).first()

        if similar_job:
            result.append({
                "job_id": similar_job.id,
                "title": similar_job.title,
                "similarity": similarity,
                "status": similar_job.status
            })

    return {
        "job_id": job_id,
        "similar_jobs": result
    }