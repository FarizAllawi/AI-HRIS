"""
Celery Tasks: Candidate Screening

Tasks for screening candidates:
- Single candidate screening
- Batch screening
- Re-scoring with new weights
"""
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.ml.indobert_model import IndoBERTModel
from app.services.screening_service import ScreeningService
from typing import List, Dict, Optional
import traceback


@celery_app.task(
    name="app.tasks.screening.screen_candidate",
    bind=True,
    max_retries=3,
    default_retry_delay=30
)
def screen_candidate_async(self, candidate_id: int, job_posting_id: int) -> Dict:
    """
    Screen a single candidate asynchronously

    Args:
        candidate_id: Candidate ID
        job_posting_id: Job posting ID

    Returns:
        Screening result dict
    """
    db = SessionLocal()

    try:
        print(f"🔍 Screening candidate {candidate_id} for job {job_posting_id}...")

        # Load model
        model = IndoBERTModel()
        screening_service = ScreeningService(model, db)

        # Screen candidate
        result = screening_service.screen_candidate(candidate_id, job_posting_id)

        print(f"✅ Candidate {candidate_id} screened: "
              f"score={result.total_score:.3f}, decision={result.decision}")

        return {
            "status": "success",
            "candidate_id": candidate_id,
            "job_posting_id": job_posting_id,
            "total_score": float(result.total_score),
            "decision": result.decision,
            "question_scores": result.question_scores
        }

    except Exception as e:
        print(f"❌ Error screening candidate {candidate_id}: {e}")
        print(traceback.format_exc())
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(
    name="app.tasks.screening.screen_candidates_batch",
    bind=True,
    max_retries=2
)
def screen_candidates_batch_async(
        self,
        job_posting_id: int,
        candidate_ids: Optional[List[int]] = None
) -> Dict:
    """
    Screen multiple candidates in batch

    Args:
        job_posting_id: Job posting ID
        candidate_ids: Optional list of candidate IDs. If None, screens all.

    Returns:
        Batch screening results
    """
    db = SessionLocal()

    try:
        print(f"🔍 Batch screening for job {job_posting_id}...")

        model = IndoBERTModel()
        screening_service = ScreeningService(model, db)

        # Screen all candidates
        results = screening_service.screen_candidates_batch(
            job_posting_id,
            candidate_ids
        )

        print(f"✅ Batch screening complete: {len(results)} candidates processed")

        # Get summary
        summary = screening_service.get_screening_summary(job_posting_id)

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "candidates_processed": len(results),
            "summary": summary
        }

    except Exception as e:
        print(f"❌ Error in batch screening: {e}")
        print(traceback.format_exc())
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(
    name="app.tasks.screening.rescore_with_new_weights",
    bind=True,
    max_retries=2
)
def rescore_with_new_weights_async(self, job_posting_id: int) -> Dict:
    """
    Re-score all candidates when question weights change

    This is FAST because embeddings are already cached!
    Only recalculates weighted aggregation.

    Args:
        job_posting_id: Job posting ID

    Returns:
        Re-scoring results
    """
    db = SessionLocal()

    try:
        print(f"🔄 Re-scoring candidates for job {job_posting_id} with new weights...")

        model = IndoBERTModel()
        screening_service = ScreeningService(model, db)

        # Re-score all candidates
        results = screening_service.rescore_with_new_weights(job_posting_id)

        print(f"✅ Re-scoring complete: {len(results)} candidates updated")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "candidates_rescored": len(results),
            "message": "All candidates re-scored with new weights"
        }

    except Exception as e:
        print(f"❌ Error in re-scoring: {e}")
        print(traceback.format_exc())
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(name="app.tasks.screening.bulk_screen_new_candidates")
def bulk_screen_new_candidates() -> Dict:
    """
    Periodic task: Screen all unscreened candidates

    Runs periodically to catch any candidates that weren't screened

    Returns:
        Summary of bulk screening
    """
    db = SessionLocal()

    try:
        from app.models.candidate import Candidate, ScreeningResult

        print("🔍 Bulk screening new candidates...")

        # Find candidates without screening results
        unscreened = db.query(Candidate).outerjoin(
            ScreeningResult,
            Candidate.id == ScreeningResult.candidate_id
        ).filter(
            ScreeningResult.id.is_(None)
        ).all()

        if not unscreened:
            print("  ℹ️  No unscreened candidates found")
            return {
                "status": "success",
                "candidates_found": 0,
                "candidates_screened": 0
            }

        print(f"  Found {len(unscreened)} unscreened candidates")

        # Screen each candidate
        screened_count = 0
        for candidate in unscreened:
            try:
                screen_candidate_async.delay(
                    candidate.id,
                    candidate.job_posting_id
                )
                screened_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to queue candidate {candidate.id}: {e}")

        print(f"✅ Bulk screening queued: {screened_count} candidates")

        return {
            "status": "success",
            "candidates_found": len(unscreened),
            "candidates_screened": screened_count
        }

    except Exception as e:
        print(f"❌ Error in bulk screening: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.screening.rescreen_all_for_job")
def rescreen_all_for_job(job_posting_id: int, reason: str = "manual") -> Dict:
    """
    Re-screen all candidates for a job posting

    Use cases:
    - Model updated
    - Embeddings regenerated
    - Manual re-evaluation needed

    Args:
        job_posting_id: Job posting ID
        reason: Reason for re-screening

    Returns:
        Re-screening results
    """
    db = SessionLocal()

    try:
        from app.models.candidate import Candidate, ScreeningResult

        print(f"🔄 Re-screening all candidates for job {job_posting_id}...")
        print(f"  Reason: {reason}")

        # Get all candidates
        candidates = db.query(Candidate).filter(
            Candidate.job_posting_id == job_posting_id
        ).all()

        if not candidates:
            return {
                "status": "success",
                "message": "No candidates to re-screen",
                "candidates_count": 0
            }

        # Delete old screening results
        deleted = db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).delete()

        db.commit()

        print(f"  🗑️  Deleted {deleted} old screening results")

        # Queue re-screening
        for candidate in candidates:
            screen_candidate_async.delay(candidate.id, job_posting_id)

        print(f"✅ Re-screening queued for {len(candidates)} candidates")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "candidates_count": len(candidates),
            "old_results_deleted": deleted,
            "reason": reason
        }

    except Exception as e:
        print(f"❌ Error in re-screening: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.screening.generate_screening_report")
def generate_screening_report(job_posting_id: int) -> Dict:
    """
    Generate detailed screening report for a job

    Args:
        job_posting_id: Job posting ID

    Returns:
        Comprehensive screening report
    """
    db = SessionLocal()

    try:
        from app.models.candidate import ScreeningResult, Candidate
        from app.models.job_posting import JobPosting
        import numpy as np

        print(f"📊 Generating screening report for job {job_posting_id}...")

        job = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job:
            return {"status": "error", "error": "Job not found"}

        results = db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).all()

        if not results:
            return {
                "status": "success",
                "job_posting_id": job_posting_id,
                "message": "No screening results yet"
            }

        # Calculate statistics
        scores = [r.total_score for r in results]

        report = {
            "status": "success",
            "job_posting_id": job_posting_id,
            "job_title": job.title,
            "total_candidates": len(results),

            # Decision breakdown
            "decisions": {
                "shortlist": sum(1 for r in results if r.decision == "shortlist"),
                "review": sum(1 for r in results if r.decision == "review"),
                "flag": sum(1 for r in results if r.decision == "flag")
            },

            # Score statistics
            "scores": {
                "mean": float(np.mean(scores)),
                "median": float(np.median(scores)),
                "std": float(np.std(scores)),
                "min": float(np.min(scores)),
                "max": float(np.max(scores)),
                "p25": float(np.percentile(scores, 25)),
                "p50": float(np.percentile(scores, 50)),
                "p75": float(np.percentile(scores, 75)),
                "p90": float(np.percentile(scores, 90))
            },

            # Thresholds
            "thresholds": {
                "shortlist": float(job.shortlist_threshold or 0.75),
                "flag": float(job.flag_threshold or 0.25)
            },

            # Question performance
            "question_performance": _analyze_question_performance(results),

            # Top candidates
            "top_candidates": _get_top_candidates(db, results, top_n=10)
        }

        print(f"✅ Report generated for job {job_posting_id}")

        return report

    except Exception as e:
        print(f"❌ Error generating report: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()


def _analyze_question_performance(results: List) -> Dict:
    """Analyze performance per question"""
    import numpy as np
    from collections import defaultdict

    question_scores = defaultdict(list)

    for result in results:
        for q_score in result.question_scores:
            qid = q_score["question_id"]
            score = q_score["score"]
            question_scores[qid].append(score)

    performance = {}
    for qid, scores in question_scores.items():
        performance[f"question_{qid}"] = {
            "mean": float(np.mean(scores)),
            "std": float(np.std(scores)),
            "min": float(np.min(scores)),
            "max": float(np.max(scores))
        }

    return performance


def _get_top_candidates(db, results: List, top_n: int = 10) -> List[Dict]:
    """Get top N candidates"""
    from app.models.candidate import Candidate

    # Sort by score
    sorted_results = sorted(results, key=lambda x: x.total_score, reverse=True)[:top_n]

    top_candidates = []
    for result in sorted_results:
        candidate = db.query(Candidate).filter(
            Candidate.id == result.candidate_id
        ).first()

        if candidate:
            top_candidates.append({
                "candidate_id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "score": float(result.total_score),
                "decision": result.decision
            })

    return top_candidates
