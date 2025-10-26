from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.ml_loader import get_model
from app.models import JobPosting, JobPostingQuestion
from app.services.job_posting_service import JobPostingService
from app.tasks.screening import screen_bulk_applicants
import pandas as pd

@celery_app.task(
    name="app.tasks.process_csv.process_csv_file",
    bind=True,
    max_retries=5,
    default_retry_delay=30,
)
def process_csv_file(self, file_path: str):
    '''
    Read CSV and creates per-user Celery tasks.
    '''
    required_columns = [
        'user_id',
        'applicant_id',
        'question_id',
        'answer_id',
        'job_posting_id',
        'job_posting_title',
        'job_posting_description',
        'job_posting_responsibilities',
        'job_posting_requirements',
        'job_posting_qualifications',
        'job_posting_required_skills',
        'job_posting_preferred_skills',
        'question',
        'answer',
        'weight',
        'mapped_competencies'
    ]

    print(f"🔹 Processing CSV file: {file_path}")
    df = pd.read_csv(file_path)

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        # Log error and raise exception
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")

    print(f"✅ CSV file read successfully with {len(df)} rows.")
    # Group Job Posting data
    job_posting_columns = [
        'job_posting_id',
        'job_posting_title',
        'job_posting_description',
        'job_posting_responsibilities',
        'job_posting_requirements',
        'job_posting_qualifications',
        'job_posting_required_skills',
        'job_posting_preferred_skills',
    ]
    job_postings_list = (
        df[job_posting_columns]
        .drop_duplicates(subset=['job_posting_id'])
        .to_dict(orient='records')
    )

    db = SessionLocal()
    model = get_model()

    for job_posting in job_postings_list:
        job_posting_data = JobPosting(
            id=job_posting['job_posting_id'],
            title=job_posting['job_posting_title'],
            description=job_posting['job_posting_description'],
            requirements=job_posting['job_posting_requirements'],
            responsibilities=job_posting['job_posting_responsibilities'],
            qualifications=job_posting['job_posting_qualifications'],
            required_skills=job_posting['job_posting_required_skills'],
            preferred_skills=job_posting['job_posting_preferred_skills'],
        )

        job_posting_question_columns = [
            'question_id',
            'job_posting_id',
            'question',
            'weight',
            'mapped_competencies',
            'weight_version',
        ]

        # ✅ Filter questions belonging to the current job posting
        job_posting_question_list = (
            df.loc[df['job_posting_id'] == job_posting['job_posting_id'], job_posting_question_columns]
            .drop_duplicates(subset=['question_id', 'job_posting_id', 'question'])
            .to_dict(orient='records')
        )

        questionData = get_mapped_question(job_posting_question_list)

        jd_service = JobPostingService(model, db)
        job_posting = jd_service.save_job_posting_profile(job_posting_data, questionData)

    applicant_list = (
        df[
            'user_id',
            'applicant_id',
            'job_posting_id',
            'question_id',
            'answer_id',
            'answer'        ]
        .to_dict(orient='records')
    )

    screening_task = screen_bulk_applicants.delay(applicant_list)

    return {
        "message": "Job posting processed.",
        "screening_task": screening_task.id,
    }

def get_mapped_question(questionData):
    list_questions = []
    for question in questionData:
        list_questions.append(
            JobPostingQuestion(
                id=question['question_id'],
                job_posting_id=question['job_posting_id'],
                question=question['question'],
                weight=question['weight'],
                mapped_competencies=question['mapped_competencies'],
                weight_version=question['weight_version'],
            )
        )
    return list_questions
