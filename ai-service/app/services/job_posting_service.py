from typing import List, Dict
from sqlalchemy.orm import Session
from app.ml.indoBERT.indobert_model import IndoBERTModel
from app.models import JobPosting, JobPostingQuestion, JobPostingEmbedding
import json


class JobPostingService:
    """
    Service for creating JD profiles:
    1. Parse JD into structured competencies
    2. Generate and cache embeddings
    3. Map questions to competencies
    """

    def __init__(self, model: IndoBERTModel, db: Session):
        self.model = model
        self.db = db

    def create_job_posting_profile(
            self,
            job_posting: JobPosting,
            questions: List[JobPostingQuestion],
    )->JobPosting:
        """
        Create complete JD profile with embeddings

        Args:
            job_posting: JobPosting instance with description
            questions: List of HR questions with weights and competency mappings

        Returns:
            Updated JobPosting with embeddings cached
        """
        # Step 1: Normalize question weights
        total_weight = sum(q.weight for q in questions)
        for q in questions:
            q.weight = q.weight / total_weight
            self.db.add(q)

        # Step 2: Generate and cache embeddings for job posting competency:
        #   Requirements
        #   Responsibility
        #   Qualifications
        #   Required Skills
        #   Preferred Skills
        self._generate_embeddings(job_posting)

        self.db.commit()
        self.db.refresh(job_posting)
        return job_posting

    def _generate_embeddings(self, job_posting: JobPosting):
        """Generate embeddings for all competencies"""

        embedding_data = []

        # Responsibilities
        job_posting.responsibilities = self._safe_json_parse(job_posting.responsibilities)
        embedding_data.extend(self._process_embedding_items(
            job_posting.id,
            job_posting.responsibilities,
            'responsibilities',
        ))

        # Requirements
        job_posting.requirements = self._safe_json_parse(job_posting.requirements)
        embedding_data.extend(self._process_embedding_items(
            job_posting.id,
            job_posting.requirements,
            'requirements',
        ))

        # Qualifications
        job_posting.qualifications = self._safe_json_parse(job_posting.qualifications)
        embedding_data.extend(self._process_embedding_items(
            job_posting.id,
            job_posting.qualifications,
            'qualifications',
        ))

        # Preferred skills
        job_posting.preferred_skills = self._safe_json_parse(job_posting.preferred_skills)
        embedding_data.extend(self._process_embedding_items(
            job_posting.id,
            job_posting.preferred_skills,
            'preferred_skills',
        ))

        # Required skills
        job_posting.required_skills = self._safe_json_parse(job_posting.required_skills)
        embedding_data.extend(self._process_embedding_items(
            job_posting.id,
            job_posting.required_skills,
            'required_skills',
        ))

        # Save to database
        for emb_dict in embedding_data:
            jd_emb = JobPostingEmbedding(
                job_posting_id=job_posting.id,
                competency_type=emb_dict["competency_type"],
                competency_id=emb_dict["competency_id"],
                text=emb_dict["text"],
                embedding=emb_dict["embedding"]
            )
            self.db.add(jd_emb)

    def _process_embedding_items(self,job_posting_id, data_list, data_type):
        """
        Generate embeddings for a list of text items.

        :param job_posting_id: Job Posting ID
        :param data_list: list of dicts or strings (e.g. responsibilities, requirements, etc.)
        :param data_type: string to label the type (e.g. 'responsibility', 'requirement')
        :return: list of dicts with id, text, and embedding
        """
        embedding_data = []

        for idx, item in enumerate(data_list or []):
            text_value = item.get("value") if isinstance(item, dict) else str(item)
            if not text_value:
                continue  # skip empty

            existing = self.db.query(JobPostingEmbedding).filter(
                JobPostingEmbedding.text == text_value,
                JobPostingEmbedding.competency_type == data_type,
                JobPostingEmbedding.job_posting_id == job_posting_id
            ).first()

            if existing:
                continue # skip
            embedding = self.model.encode(text_value)[0]

            embedding_data.append({
                "competency_type": data_type,
                "competency_id": item.get("id") if isinstance(item, dict) else f"{data_type}_{idx+1}",
                "text": text_value,
                "embedding": embedding.tolist()
            })

        return embedding_data

    def _safe_json_parse(self, value, default=None):
        """
        Safely parse a JSON string to Python object.
        - If value is already a dict/list, it’s returned as-is.
        - If parsing fails, returns `default`.
        """
        if default is None:
            default = []

        if isinstance(value, (dict, list)):
            return value

        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                print(f"❌ Failed to parse JSON: {value}")
                return default

        return default
