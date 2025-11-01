from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.job_posting import JobPosting, JDEmbedding
from app.ml.indobert_model import IndoBERTModel
from app.utils.jd_parser import parse_jd_to_competencies
import numpy as np


class JDProfileService:
    """
    Service for creating JD profiles:
    1. Parse JD into structured competencies
    2. Generate and cache embeddings
    3. Map questions to competencies
    """

    def __init__(self, model: IndoBERTModel, db: Session):
        self.model = model
        self.db = db

    def create_jd_profile(
            self,
            job_posting: JobPosting,
            questions: List[Dict]
    ) -> JobPosting:
        """
        Create complete JD profile with embeddings

        Args:
            job_posting: JobPosting instance with description
            questions: List of HR questions with weights and competency mappings

        Returns:
            Updated JobPosting with embeddings cached
        """
        # Step 1: Parse JD into structured competencies
        competencies = parse_jd_to_competencies(job_posting.description)

        job_posting.responsibilities = competencies.get("responsibilities", [])
        job_posting.required_skills = competencies.get("required_skills", [])
        job_posting.preferred_skills = competencies.get("preferred_skills", [])
        job_posting.qualifications = competencies.get("qualifications", [])

        # Step 2: Normalize question weights
        total_weight = sum(q["weight"] for q in questions)
        for q in questions:
            q["weight"] = q["weight"] / total_weight

        job_posting.questions = questions

        # Step 3: Generate and cache embeddings for each competency
        self._generate_embeddings(job_posting)

        self.db.commit()
        self.db.refresh(job_posting)

        return job_posting

    def _generate_embeddings(self, job_posting: JobPosting):
        """Generate embeddings for all competencies"""

        embedding_data = []

        # Responsibilities
        for idx, text in enumerate(job_posting.responsibilities or []):
            emb = self.model.encode(text)[0]
            embedding_data.append({
                "competency_type": "responsibility",
                "competency_id": idx,
                "text": text,
                "embedding": emb.tolist()
            })

        # Required skills
        for idx, text in enumerate(job_posting.required_skills or []):
            emb = self.model.encode(text)[0]
            embedding_data.append({
                "competency_type": "required_skill",
                "competency_id": idx,
                "text": text,
                "embedding": emb.tolist()
            })

        # Preferred skills
        for idx, text in enumerate(job_posting.preferred_skills or []):
            emb = self.model.encode(text)[0]
            embedding_data.append({
                "competency_type": "preferred_skill",
                "competency_id": idx,
                "text": text,
                "embedding": emb.tolist()
            })

        # Qualifications
        for idx, text in enumerate(job_posting.qualifications or []):
            emb = self.model.encode(text)[0]
            embedding_data.append({
                "competency_type": "qualification",
                "competency_id": idx,
                "text": text,
                "embedding": emb.tolist()
            })

        # Save to database
        for emb_dict in embedding_data:
            jd_emb = JDEmbedding(
                job_posting_id=job_posting.id,
                competency_type=emb_dict["competency_type"],
                competency_id=emb_dict["competency_id"],
                text=emb_dict["text"],
                embedding=emb_dict["embedding"]
            )
            self.db.add(jd_emb)

    def get_jd_embeddings_for_questions(
            self,
            job_posting_id: int
    ) -> Dict[int, List[np.ndarray]]:
        """
        Get JD embeddings organized by question ID

        Args:
            job_posting_id: Job posting ID

        Returns:
            Dict mapping question_id to list of relevant JD embeddings
        """
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job_posting:
            return {}

        # Get all embeddings
        jd_embeddings = self.db.query(JDEmbedding).filter(
            JDEmbedding.job_posting_id == job_posting_id
        ).all()

        # Organize by question based on mapped_competencies
        question_embeddings = {}

        for question in job_posting.questions:
            qid = question["id"]
            mapped_comps = question.get("mapped_competencies", [])

            # Get embeddings for mapped competencies
            relevant_embeddings = []
            for emb in jd_embeddings:
                if emb.competency_id in mapped_comps:
                    relevant_embeddings.append(
                        np.array(emb.embedding, dtype=np.float32)
                    )

            question_embeddings[qid] = relevant_embeddings

        return question_embeddings

    def update_question_weights(
            self,
            job_posting_id: int,
            new_weights: Dict[int, float]
    ) -> JobPosting:
        """
        Update question weights (no retraining needed!)

        Args:
            job_posting_id: Job posting ID
            new_weights: Dict mapping question_id to new weight

        Returns:
            Updated JobPosting
        """
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not job_posting:
            raise ValueError("Job posting not found")

        # Update weights
        questions = job_posting.questions
        for q in questions:
            if q["id"] in new_weights:
                q["weight"] = new_weights[q["id"]]

        # Normalize
        total_weight = sum(q["weight"] for q in questions)
        for q in questions:
            q["weight"] = q["weight"] / total_weight

        job_posting.questions = questions
        job_posting.weight_version += 1

        self.db.commit()
        self.db.refresh(job_posting)

        return job_posting
