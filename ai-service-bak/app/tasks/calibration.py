"""
Celery Tasks: Threshold Calibration

Tasks for calibrating decision thresholds:
- Zero-shot calibration using similar JDs
- On-demand recalibration with current scores
- Batch calibration for multiple jobs
"""
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.services.calibration_service import CalibrationService
from app.models.job_posting import JobPosting
from typing import Dict, List
import traceback


@celery_app.task(
    name="app.tasks.calibration.calibrate_thresholds",
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def calibrate_thresholds_async(self, job_posting_id: int, top_k: int = 5) -> Dict:
    """
    Calibrate thresholds for a job posting asynchronously

    Uses zero-shot calibration:
    1. Find similar historical JDs using embedding similarity
    2. Import their score distributions
    3. Set P75 (shortlist) and P25 (flag) thresholds

    Args:
        job_posting_id: Job posting ID
        top_k: Number of similar JDs to use

    Returns:
        Calibration results
    """
    db = SessionLocal()

    try:
        print(f"🎯 Calibrating thresholds for job {job_posting_id}...")

        calibration_service = CalibrationService(db)

        shortlist_th, flag_th = calibration_service.calibrate_thresholds(
            job_posting_id,
            top_k
        )

        print(f"✅ Thresholds calibrated for job {job_posting_id}: "
              f"shortlist={shortlist_th:.3f}, flag={flag_th:.3f}")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "shortlist_threshold": float(shortlist_th),
            "flag_threshold": float(flag_th),
            "similar_jds_used": top_k
        }

    except Exception as e:
        print(f"❌ Error calibrating thresholds: {e}")
        print(traceback.format_exc())
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(name="app.tasks.calibration.recalibrate_with_current_scores")
def recalibrate_with_current_scores(job_posting_id: int) -> Dict:
    """
    Recalibrate thresholds using current applicant scores

    Use when you have enough applicants (10+) and want to update thresholds
    based on actual distribution

    Args:
        job_posting_id: Job posting ID

    Returns:
        Recalibration results
    """
    db = SessionLocal()

    try:
        from app.models.candidate import ScreeningResult

        print(f"🎯 Recalibrating thresholds for job {job_posting_id} using current scores...")

        # Get current scores
        results = db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).all()

        if len(results) < 10:
            print(f"  ⚠️  Not enough applicants: {len(results)}/10")
            return {
                "status": "skipped",
                "job_posting_id": job_posting_id,
                "reason": f"Need at least 10 applicants, have {len(results)}"
            }

        scores = [r.total_score for r in results if r.total_score is not None]

        # Recalibrate
        calibration_service = CalibrationService(db)
        shortlist_th, flag_th = calibration_service.recalibrate_on_demand(
            job_posting_id,
            scores
        )

        print(f"✅ Thresholds recalibrated using {len(scores)} applicants: "
              f"shortlist={shortlist_th:.3f}, flag={flag_th:.3f}")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "shortlist_threshold": float(shortlist_th),
            "flag_threshold": float(flag_th),
            "applicants_used": len(scores)
        }

    except Exception as e:
        print(f"❌ Error recalibrating: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.calibration.batch_calibrate_jobs")
def batch_calibrate_jobs(job_posting_ids: List[int] = None) -> Dict:
    """
    Calibrate thresholds for multiple jobs in batch

    Args:
        job_posting_ids: List of job IDs. If None, calibrates all active jobs.

    Returns:
        Batch calibration summary
    """
    db = SessionLocal()

    try:
        print("🎯 Batch calibration starting...")

        # Get jobs to calibrate
        query = db.query(JobPosting)

        if job_posting_ids:
            query = query.filter(JobPosting.id.in_(job_posting_ids))
        else:
            # Calibrate all active jobs without thresholds
            query = query.filter(
                JobPosting.status == "active",
                JobPosting.shortlist_threshold.is_(None)
            )

        jobs = query.all()

        if not jobs:
            print("  ℹ️  No jobs to calibrate")
            return {
                "status": "success",
                "jobs_processed": 0,
                "message": "No jobs need calibration"
            }

        results = {
            "success": [],
            "failed": [],
            "skipped": []
        }

        for job in jobs:
            try:
                # Queue calibration task
                result = calibrate_thresholds_async.delay(job.id, top_k=5)
                results["success"].append({
                    "job_id": job.id,
                    "title": job.title,
                    "task_id": result.id
                })

            except Exception as e:
                results["failed"].append({
                    "job_id": job.id,
                    "title": job.title,
                    "error": str(e)
                })

        print(f"✅ Batch calibration queued: {len(results['success'])} jobs")

        return {
            "status": "success",
            "total_jobs": len(jobs),
            "success": len(results["success"]),
            "failed": len(results["failed"]),
            "results": results
        }

    except Exception as e:
        print(f"❌ Error in batch calibration: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.calibration.find_similar_jobs_for_calibration")
def find_similar_jobs_for_calibration(job_posting_id: int, top_k: int = 10) -> Dict:
    """
    Find and analyze similar jobs for calibration

    Returns detailed information about similar jobs

    Args:
        job_posting_id: Job posting ID
        top_k: Number of similar jobs to find

    Returns:
        Similar jobs analysis
    """
    db = SessionLocal()

    try:
        from app.models.job_posting import JDEmbedding
        from app.models.candidate import ScreeningResult
        import numpy as np

        print(f"🔍 Finding similar jobs for {job_posting_id}...")

        # Get job and its embeddings
        job = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job:
            return {"status": "error", "error": "Job not found"}

        embeddings = db.query(JDEmbedding).filter(
            JDEmbedding.job_posting_id == job_posting_id
        ).all()

        if not embeddings:
            return {
                "status": "error",
                "error": "No embeddings found. Process JD profile first."
            }

        # Get aggregate embedding
        emb_arrays = [np.array(e.embedding, dtype=np.float32) for e in embeddings]
        aggregate = np.mean(emb_arrays, axis=0)
        aggregate = aggregate / (np.linalg.norm(aggregate) + 1e-9)

        # Find similar jobs
        calibration_service = CalibrationService(db)
        similar_jobs = calibration_service._find_similar_jds(
            aggregate,
            job_posting_id,
            top_k
        )

        # Get detailed info for each similar job
        similar_jobs_info = []

        for similar_job_id, similarity in similar_jobs:
            similar_job = db.query(JobPosting).filter(
                JobPosting.id == similar_job_id
            ).first()

            if similar_job:
                # Get screening stats
                results = db.query(ScreeningResult).filter(
                    ScreeningResult.job_posting_id == similar_job_id
                ).all()

                scores = [r.total_score for r in results if r.total_score]

                similar_jobs_info.append({
                    "job_id": similar_job.id,
                    "title": similar_job.title,
                    "similarity": float(similarity),
                    "status": similar_job.status,
                    "candidates_count": len(results),
                    "score_stats": {
                        "mean": float(np.mean(scores)) if scores else None,
                        "p25": float(np.percentile(scores, 25)) if scores else None,
                        "p75": float(np.percentile(scores, 75)) if scores else None
                    } if scores else None,
                    "thresholds": {
                        "shortlist": float(
                            similar_job.shortlist_threshold) if similar_job.shortlist_threshold else None,
                        "flag": float(similar_job.flag_threshold) if similar_job.flag_threshold else None
                    }
                })

        print(f"✅ Found {len(similar_jobs_info)} similar jobs")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "similar_jobs": similar_jobs_info
        }

    except Exception as e:
        print(f"❌ Error finding similar jobs: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.calibration.auto_recalibrate_jobs")
def auto_recalibrate_jobs() -> Dict:
    """
    Periodic task: Auto-recalibrate jobs that have enough applicants

    Runs periodically to update thresholds based on actual distributions

    Returns:
        Summary of auto-recalibration
    """
    db = SessionLocal()

    try:
        from app.models.candidate import ScreeningResult
        from sqlalchemy import func

        print("🎯 Auto-recalibration check starting...")

        # Find active jobs with 10+ screening results
        jobs_with_counts = db.query(
            JobPosting.id,
            func.count(ScreeningResult.id).label('count')
        ).join(
            ScreeningResult,
            JobPosting.id == ScreeningResult.job_posting_id
        ).filter(
            JobPosting.status == "active"
        ).group_by(
            JobPosting.id
        ).having(
            func.count(ScreeningResult.id) >= 10
        ).all()

        if not jobs_with_counts:
            print("  ℹ️  No jobs ready for auto-recalibration")
            return {
                "status": "success",
                "jobs_recalibrated": 0,
                "message": "No jobs with 10+ applicants"
            }

        print(f"  Found {len(jobs_with_counts)} jobs for recalibration")

        results = []

        for job_id, count in jobs_with_counts:
            try:
                result = recalibrate_with_current_scores(job_id)
                results.append({
                    "job_id": job_id,
                    "result": result
                })
            except Exception as e:
                results.append({
                    "job_id": job_id,
                    "error": str(e)
                })

        success_count = sum(1 for r in results if r.get("result", {}).get("status") == "success")

        print(f"✅ Auto-recalibration complete: {success_count}/{len(results)} successful")

        return {
            "status": "success",
            "jobs_checked": len(jobs_with_counts),
            "jobs_recalibrated": success_count,
            "results": results
        }

    except Exception as e:
        print(f"❌ Error in auto-recalibration: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.calibration.validate_thresholds")
def validate_thresholds(job_posting_id: int) -> Dict:
    """
    Validate threshold effectiveness for a job

    Checks:
    - Are thresholds producing reasonable distributions?
    - Too many/few shortlisted candidates?
    - Suggest adjustments if needed

    Args:
        job_posting_id: Job posting ID

    Returns:
        Validation report with suggestions
    """
    db = SessionLocal()

    try:
        from app.models.candidate import ScreeningResult
        import numpy as np

        print(f"✅ Validating thresholds for job {job_posting_id}...")

        job = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job:
            return {"status": "error", "error": "Job not found"}

        results = db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).all()

        if len(results) < 5:
            return {
                "status": "insufficient_data",
                "message": f"Need at least 5 applicants, have {len(results)}"
            }

        # Calculate distributions
        total = len(results)
        shortlisted = sum(1 for r in results if r.decision == "shortlist")
        flagged = sum(1 for r in results if r.decision == "flag")
        review = sum(1 for r in results if r.decision == "review")

        shortlist_pct = (shortlisted / total) * 100
        flag_pct = (flagged / total) * 100
        review_pct = (review / total) * 100

        # Validation logic
        issues = []
        suggestions = []

        # Check shortlist percentage (target: 15-30%)
        if shortlist_pct < 10:
            issues.append("Very few candidates shortlisted")
            suggestions.append("Consider lowering shortlist threshold")
        elif shortlist_pct > 40:
            issues.append("Too many candidates shortlisted")
            suggestions.append("Consider raising shortlist threshold")

        # Check flag percentage (target: 20-40%)
        if flag_pct < 15:
            issues.append("Very few candidates flagged")
            suggestions.append("Consider raising flag threshold")
        elif flag_pct > 50:
            issues.append("Too many candidates flagged")
            suggestions.append("Consider lowering flag threshold")

        # Check threshold gap
        if job.shortlist_threshold and job.flag_threshold:
            gap = job.shortlist_threshold - job.flag_threshold
            if gap < 0.2:
                issues.append("Thresholds too close together")
                suggestions.append("Increase gap between thresholds")

        status = "valid" if not issues else "needs_adjustment"

        report = {
            "status": status,
            "job_posting_id": job_posting_id,
            "total_candidates": total,
            "distribution": {
                "shortlist": shortlisted,
                "review": review,
                "flag": flagged
            },
            "percentages": {
                "shortlist": round(shortlist_pct, 2),
                "review": round(review_pct, 2),
                "flag": round(flag_pct, 2)
            },
            "current_thresholds": {
                "shortlist": float(job.shortlist_threshold) if job.shortlist_threshold else None,
                "flag": float(job.flag_threshold) if job.flag_threshold else None
            },
            "issues": issues,
            "suggestions": suggestions
        }

        print(f"✅ Validation complete: {status}")

        return report

    except Exception as e:
        print(f"❌ Error validating thresholds: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()