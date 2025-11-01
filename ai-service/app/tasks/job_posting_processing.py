"""
Celery Tasks: JD Processing

Tasks for processing job descriptions:
- Parse JD into competencies
- Generate and cache embeddings
- Calibrate thresholds
"""
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.ml_loader import get_model
from app.services.job_posting_service import JobPostingService
from app.services.calibration_service import CalibrationService
from app.models import JobPosting, JobPostingEmbedding, JobPostingQuestion
from typing import Dict, List
import traceback

@celery_app.task(
    name="app.tasks.job_posting_processing.process_job_posting_profile",
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def process_job_posting_profile(self, job_posting_id: str, questions: list) -> Dict:
    """
    Process JD profile creation (full workflow)

    Steps:
    1. Parse JD into structured competencies
    2. Generate embeddings for each competency
    3. Attach question weights
    4. Calibrate thresholds using similar historical JDs

    Args:
        job_posting_id: Job posting ID
        questions: List of question dicts with weights and mappings

    Returns:
        Status dict with results
    """
    db = SessionLocal()

    try:
        print(f"🚀 Processing JD profile for job {job_posting_id}...")
        # Get job posting
        job_posting = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job_posting:
            raise ValueError(f"Job posting {job_posting_id} not found")

        # Load model
        model = get_model()

        # Step 1: Create Job Posting profile (parse + embed)
        print(f"  📝 Parsing JD and generating embeddings...")
        jpp_service = JobPostingService(model, db)
        question_list: List[JobPostingQuestion] = []
        for q in questions:
            print(q)
            question_list.append(JobPostingQuestion(
                id=q['id'],
                job_posting_id=q['job_posting_id'],
                question=q['question'],
                weight=q['weight'],
                mapped_competencies=q['mapped_competencies'],
                weight_version=q['weight_version'],
            ))
        print(question_list)
        job_posting = jpp_service.create_job_posting_profile(job_posting, question_list)

        embeddings_count = db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting_id
        ).count()

        print(f"  ✅ Generated {embeddings_count} embeddings")

        # Step 2: Calibrate thresholds
        print(f"  🎯 Calibrating thresholds...")
        calibration_service = CalibrationService(db)

        try:
            shortlist_th, flag_th = calibration_service.calibrate_thresholds(
                job_posting_id,
                top_k=5
            )
            print(f"  ✅ Thresholds: shortlist={shortlist_th:.3f}, flag={flag_th:.3f}")
        except Exception as calib_error:
            print(f"  ⚠️  Calibration warning: {calib_error}")
            # Use defaults
            shortlist_th = 0.75
            flag_th = 0.25
            job_posting.shortlist_threshold = shortlist_th
            job_posting.flag_threshold = flag_th
            db.commit()
            print(f"  ℹ️  Using default thresholds")

        # Step 3: Mark as active
        job_posting.status = "active"
        db.commit()
        db.refresh(job_posting)

        print(f"✅ JD profile processing complete for job {job_posting_id}")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "embeddings_count": embeddings_count,
            "shortlist_threshold": float(shortlist_th),
            "flag_threshold": float(flag_th),
            "competencies": {
                "responsibilities": len(job_posting.responsibilities or []),
                "required_skills": len(job_posting.required_skills or []),
                "preferred_skills": len(job_posting.preferred_skills or []),
                "qualifications": len(job_posting.qualifications or [])
            }
        }

    except Exception as e:
        print(f"❌ Error processing JD profile: {e}")
        print(traceback.format_exc())

        # Mark job as failed
        try:
            job_posting = db.query(JobPosting).filter(
                JobPosting.id == job_posting_id
            ).first()
            if job_posting:
                job_posting.status = "failed"
                db.commit()
        except:
            pass

        # Retry with exponential backoff
        raise self.retry(exc=e)

    finally:
        db.close()

@celery_app.task(
    name="app.tasks.job_posting_processing.regenerate_embeddings",
    bind=True,
    max_retries=2
)
def regenerate_embeddings(self, job_posting_id: str) -> Dict:
    """
    Regenerate embeddings for a job posting

    Use cases:
    - JD description updated
    - Model updated
    - Embeddings corrupted

    Args:
        job_posting_id: Job posting ID

    Returns:
        Status dict
    """
    db = SessionLocal()

    try:
        print(f"🔄 Regenerating embeddings for job {job_posting_id}...")

        model = get_model()

        job_posting = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job_posting:
            raise ValueError(f"Job posting {job_posting_id} not found")

        # Delete old embeddings
        deleted_count = db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting_id
        ).delete()

        print(f"  🗑️  Deleted {deleted_count} old embeddings")

        # Generate new embeddings
        jd_service = JobPostingService(model, db)
        jd_service._generate_embeddings(job_posting)

        db.commit()

        new_count = db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting_id
        ).count()

        print(f"✅ Regenerated {new_count} embeddings for job {job_posting_id}")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "old_embeddings": deleted_count,
            "new_embeddings": new_count
        }

    except Exception as e:
        print(f"❌ Error regenerating embeddings: {e}")
        print(traceback.format_exc())
        raise self.retry(exc=e)

    finally:
        db.close()














@celery_app.task(name="app.tasks.jd_processing.batch_process_jd_profiles")
def batch_process_jd_profiles(job_posting_ids: List[int]) -> Dict:
    """
    Process multiple JD profiles in batch

    Args:
        job_posting_ids: List of job posting IDs

    Returns:
        Summary of batch processing
    """
    results = {
        "success": [],
        "failed": [],
        "total": len(job_posting_ids)
    }

    for job_id in job_posting_ids:
        try:
            # Get questions from database
            db = SessionLocal()
            job = db.query(JobPosting).filter(JobPosting.id == job_id).first()

            if job and job.questions:
                # Process
                result = process_job_posting_profile(job_id, job.questions)
                results["success"].append({
                    "job_id": job_id,
                    "result": result
                })
            else:
                results["failed"].append({
                    "job_id": job_id,
                    "error": "Job not found or no questions"
                })

            db.close()

        except Exception as e:
            results["failed"].append({
                "job_id": job_id,
                "error": str(e)
            })

    print(f"✅ Batch processing complete: {len(results['success'])} success, {len(results['failed'])} failed")

    return results

@celery_app.task(name="app.tasks.jd_processing.update_jd_competencies")
def update_jd_competencies(job_posting_id: int, new_description: str) -> Dict:
    """
    Update JD competencies when description changes

    Args:
        job_posting_id: Job posting ID
        new_description: New JD description

    Returns:
        Status dict
    """
    db = SessionLocal()

    try:
        from app.utils.parser import parse_jd_to_competencies

        print(f"📝 Updating competencies for job {job_posting_id}...")

        job = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job:
            raise ValueError(f"Job posting {job_posting_id} not found")

        # Parse new description
        competencies = parse_jd_to_competencies(new_description)

        # Update
        job.description = new_description
        job.responsibilities = competencies.get("responsibilities", [])
        job.required_skills = competencies.get("required_skills", [])
        job.preferred_skills = competencies.get("preferred_skills", [])
        job.qualifications = competencies.get("qualifications", [])

        db.commit()

        # Regenerate embeddings
        regenerate_embeddings(job_posting_id)

        print(f"✅ Competencies updated for job {job_posting_id}")

        return {
            "status": "success",
            "job_posting_id": job_posting_id,
            "competencies": competencies
        }

    except Exception as e:
        print(f"❌ Error updating competencies: {e}")
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.jd_processing.validate_embeddings")
def validate_embeddings(job_posting_id: int) -> Dict:
    """
    Validate embeddings for a job posting

    Checks:
    - All competencies have embeddings
    - Embeddings have correct dimensions
    - No corrupted data

    Args:
        job_posting_id: Job posting ID

    Returns:
        Validation report
    """
    db = SessionLocal()

    try:
        from app.core.config import settings
        import numpy as np

        job = db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job:
            return {"status": "error", "error": "Job not found"}

        embeddings = db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting_id
        ).all()

        issues = []

        # Check embedding count
        total_competencies = sum([
            len(job.responsibilities or []),
            len(job.required_skills or []),
            len(job.preferred_skills or []),
            len(job.qualifications or [])
        ])

        if len(embeddings) != total_competencies:
            issues.append(f"Mismatch: {len(embeddings)} embeddings, {total_competencies} competencies")

        # Check dimensions
        for emb in embeddings:
            if len(emb.embedding) != settings.EMBEDDING_DIM:
                issues.append(f"Wrong dimension for embedding {emb.id}: {len(emb.embedding)}")

        # Check for NaN/Inf
        for emb in embeddings:
            arr = np.array(emb.embedding)
            if np.any(np.isnan(arr)) or np.any(np.isinf(arr)):
                issues.append(f"Corrupted embedding {emb.id}")

        status = "valid" if not issues else "invalid"

        return {
            "status": status,
            "job_posting_id": job_posting_id,
            "embeddings_count": len(embeddings),
            "expected_count": total_competencies,
            "issues": issues
        }

    except Exception as e:
        return {
            "status": "error",
            "job_posting_id": job_posting_id,
            "error": str(e)
        }
    finally:
        db.close()