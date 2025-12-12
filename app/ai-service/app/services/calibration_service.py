import numpy as np
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models import ScreeningResult, JobPosting, JobPostingEmbedding
from app.utils.similarity import cosine_similarity
from app.core.config import settings


class CalibrationService:
    """
    Zero-shot calibration: Find similar historical JDs and import their thresholds
    No applicants needed!
    """

    def __init__(self, db: Session):
        self.db = db

    def calibrate_thresholds(
            self,
            job_posting_id: str,
            top_k: int = 5
    ) -> Tuple[float, float]:
        """
        Calibrate thresholds for a new job posting using similar historical JDs

        Args:
            job_posting_id: New job posting ID
            top_k: Number of similar JDs to use

        Returns:
            (shortlist_threshold, flag_threshold)
        """
        # Get current job posting
        current_job = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not current_job:
            raise ValueError("Job posting not found")

        # Get embedding representation of current JD
        current_emb = self._get_jd_aggregate_embedding(current_job)

        # Find similar historical JDs
        similar_jobs = self._find_similar_jds(current_emb, exclude_id=job_posting_id, top_k=top_k)

        if len(similar_jobs) == 0:
            # No historical data, use defaults
            return (
                settings.DEFAULT_SHORTLIST_PERCENTILE / 100.0,
                settings.DEFAULT_FLAG_PERCENTILE / 100.0
            )

        # Collect historical scores from similar JDs
        historical_scores = []
        for job_id, similarity in similar_jobs:
            scores = self._get_historical_scores(job_id)
            historical_scores.extend(scores)

        if len(historical_scores) < 10:
            # Not enough data, use defaults
            return (
                settings.DEFAULT_SHORTLIST_PERCENTILE / 100.0,
                settings.DEFAULT_FLAG_PERCENTILE / 100.0
            )

        # Calculate percentile thresholds
        shortlist_threshold = np.percentile(
            historical_scores,
            settings.DEFAULT_SHORTLIST_PERCENTILE
        )
        flag_threshold = np.percentile(
            historical_scores,
            settings.DEFAULT_FLAG_PERCENTILE
        )

        # Update job posting
        current_job.shortlist_threshold = float(shortlist_threshold)
        current_job.flag_threshold = float(flag_threshold)
        self.db.commit()

        return float(shortlist_threshold), float(flag_threshold)

    def _get_jd_aggregate_embedding(self, job_posting: JobPosting) -> np.ndarray:
        """Get aggregate embedding for a JD (mean of all competency embeddings)"""
        embeddings = self.db.query(JobPostingEmbedding).filter(
            JobPostingEmbedding.job_posting_id == job_posting.id
        ).all()

        if not embeddings:
            raise ValueError("No embeddings found for this job posting")

        # Mean pooling
        emb_arrays = [np.array(e.embedding, dtype=np.float32) for e in embeddings]
        aggregate = np.mean(emb_arrays, axis=0)

        # Normalize
        aggregate = aggregate / (np.linalg.norm(aggregate) + 1e-9)

        return aggregate

    def _find_similar_jds(
            self,
            target_embedding: np.ndarray,
            exclude_id: int,
            top_k: int = 5
    ) -> List[Tuple[int, float]]:
        """
        Find top-k most similar historical JDs

        Returns:
            List of (job_id, similarity_score) tuples
        """
        # Get all historical job postings with screening results
        historical_jobs = self.db.query(JobPosting).filter(
            JobPosting.id != exclude_id,
            JobPosting.status.in_(["closed", "archived"])
        ).all()

        similarities = []

        for job in historical_jobs:
            # Check if it has screening results
            result_count = self.db.query(ScreeningResult).filter(
                ScreeningResult.job_posting_id == job.id
            ).count()

            if result_count < 5:  # Need at least 5 candidates
                continue

            try:
                job_emb = self._get_jd_aggregate_embedding(job)
                similarity = cosine_similarity(target_embedding, job_emb)
                similarities.append((job.id, float(similarity)))
            except:
                continue

        # Sort by similarity and return top-k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def _get_historical_scores(self, job_posting_id: int) -> List[float]:
        """Get all screening scores for a historical job posting"""
        results = self.db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).all()

        return [r.total_score for r in results if r.total_score is not None]

    def recalibrate_on_demand(
            self,
            job_posting_id: int,
            current_scores: List[float]
    ) -> Tuple[float, float]:
        """
        Recalibrate using current applicant scores (optional, if needed)

        Args:
            job_posting_id: Job posting ID
            current_scores: List of scores from current applicants

        Returns:
            (shortlist_threshold, flag_threshold)
        """
        if len(current_scores) < 10:
            # Not enough data, keep existing thresholds
            job = self.db.query(JobPosting).filter(
                JobPosting.id == job_posting_id
            ).first()
            return job.shortlist_threshold, job.flag_threshold

        # Calculate new thresholds from current distribution
        shortlist_threshold = np.percentile(
            current_scores,
            settings.DEFAULT_SHORTLIST_PERCENTILE
        )
        flag_threshold = np.percentile(
            current_scores,
            settings.DEFAULT_FLAG_PERCENTILE
        )

        # Update job posting
        job = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()
        job.shortlist_threshold = float(shortlist_threshold)
        job.flag_threshold = float(flag_threshold)
        self.db.commit()

        return float(shortlist_threshold), float(flag_threshold)