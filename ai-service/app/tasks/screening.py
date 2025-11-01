from app.celery_app import celery_app
from typing import List, Dict
import traceback
import requests
import logging

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.ml_loader import get_model

from app.services.screening_service import ScreeningService
from app.utils.parser import to_serializable

logger = logging.getLogger(__name__)

@celery_app.task(
    name='app.tasks.screening.screen_applicant_batch_async',
    bind=True,
    max_retries=10,
    default_retry_delay=30
)
def screen_applicant_batch_async(
    self,
    job_posting_id: str,
    applicant_ids: List[str] = None
) -> Dict:
    '''
    Screen multiple applicants in batch

    Args:
        job_posting_id: Job Posting ID
        applicant_ids: List of Applicant IDs

    Returns:
        Batch screening results
    '''
    db = SessionLocal()

    try:
        print(f"🔍 Batch screening for job {job_posting_id}...")

        model = get_model()
        screening_service = ScreeningService(model, db)

        # Screen all applicants
        results = screening_service.screen_applicant_batch(
            job_posting_id,
            applicant_ids
        )

        print(f"✅ Batch screening complete: {len(results)} candidates processed")

        # Send result to hrms
        send_screening_batch_result_to_hrms.delay(to_serializable(results))

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
    name='app.tasks.screening.send_screening_batch_result_to_hrms',
    bind=True,
    max_retries=10,
)
def send_screening_batch_result_to_hrms(self, screening_results: List[Dict]):
    hrms_url = f"{settings.HRMS_BASE_URL}/HRMS/screening/callback"
    try:
        response = requests.post(
            url=hrms_url,
            json={"screening_results": screening_results},
            timeout=10
        )
        response.raise_for_status()
        logger.info(f"✅ Sent {len(screening_results)} screening results to HRMS.")
    except requests.RequestException as e:
        logger.error(f"HTTP error sending results to HRMS: {str(e)}")
        raise self.retry(exc=e)
    except Exception as e:
        logger.error(f"Unexpected error while sending results to HRMS: {str(e)}")
        raise self.retry(exc=e)

