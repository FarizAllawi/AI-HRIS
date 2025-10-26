from app.celery_app import celery_app

@celery_app.task(
    name='app.tasks.screening.screen_bulk_applicants',
    bind=True,
    max_retries=10,
    default_retry_delay=30
)
def screen_bulk_applicants(self, applicant_data):
    # Validate required data
    required_columns = [
     'user_id',
     'applicant_id',
     'job_posting_id',
     'question_id',
     'answer_id',
     'answer'
    ]

    missing_columns = [col for col in required_columns if col not in applicant_data.columns]
    if missing_columns:
        print(f"Missing required columns: {', '.join(missing_columns)}")
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    print(applicant_data)

