from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.candidate import Candidate, ScreeningResult
from app.models.job_posting import JobPosting
from app.ml.indobert_model import IndoBERTModel
from app.ml.scorer import CandidateScorer
from app.services.jd_profile_service import JDProfileService


class ScreeningService:
    """
    Service for candidate screening
    """

    def __init__(self, model: IndoBERTModel, db: Session):
        self.model = model
        self.db = db
        self.scorer = CandidateScorer(model)
        self.jd_service = JDProfileService(model, db)

    def screen_candidate(
            self,
            candidate_id: int,
            job_posting_id: int
    ) -> ScreeningResult:
        """
        Screen a single candidate

        Args:
            candidate_id: Candidate ID
            job_posting_id: Job posting ID

        Returns:
            ScreeningResult instance
        """
        # Get candidate and job posting
        candidate = self.db.query(Candidate).filter(
            Candidate.id == candidate_id
        ).first()

        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()

        if not candidate or not job_posting:
            raise ValueError("Candidate or job posting not found")

        # Get JD embeddings organized by question
        jd_embeddings = self.jd_service.get_jd_embeddings_for_questions(job_posting_id)

        # Prepare answers with weights
        answers = []
        for answer_dict in candidate.answers:
            # Find question weight
            question = next(
                (q for q in job_posting.questions if q["id"] == answer_dict["question_id"]),
                None
            )
            if question:
                answers.append({
                    "question_id": answer_dict["question_id"],
                    "answer": answer_dict["answer"],
                    "weight": question["weight"]
                })

        # Score candidate
        total_score, question_scores = self.scorer.score_candidate(
            answers,
            jd_embeddings
        )

        # Determine decision
        decision = self.scorer.determine_decision(
            total_score,
            job_posting.shortlist_threshold or 0.75,
            job_posting.flag_threshold or 0.25
        )

        # Create or update screening result
        existing = self.db.query(ScreeningResult).filter(
            ScreeningResult.candidate_id == candidate_id,
            ScreeningResult.job_posting_id == job_posting_id
        ).first()

        if existing:
            # Update existing
            existing.total_score = total_score
            existing.question_scores = question_scores
            existing.decision = decision
            existing.weight_version = job_posting.weight_version
            result = existing
        else:
            # Create new
            result = ScreeningResult(
                job_posting_id=job_posting_id,
                candidate_id=candidate_id,
                total_score=total_score,
                question_scores=question_scores,
                decision=decision,
                weight_version=job_posting.weight_version,
                model_version="v1.0"
            )
            self.db.add(result)

        self.db.commit()
        self.db.refresh(result)

        return result

    def screen_candidates_batch(
            self,
            job_posting_id: int,
            candidate_ids: List[int] = None
    ) -> List[ScreeningResult]:
        """
        Screen multiple candidates for a job posting

        Args:
            job_posting_id: Job posting ID
            candidate_ids: Optional list of candidate IDs. If None, screen all candidates

        Returns:
            List of ScreeningResult instances
        """
        # Get candidates
        query = self.db.query(Candidate).filter(
            Candidate.job_posting_id == job_posting_id
        )

        if candidate_ids:
            query = query.filter(Candidate.id.in_(candidate_ids))

        candidates = query.all()

        results = []
        for candidate in candidates:
            try:
                result = self.screen_candidate(candidate.id, job_posting_id)
                results.append(result)
            except Exception as e:
                print(f"Error screening candidate {candidate.id}: {e}")
                continue

        return results

    def rescore_with_new_weights(
            self,
            job_posting_id: int
    ) -> List[ScreeningResult]:
        """
        Re-score all candidates when weights change
        No model retraining needed!

        Args:
            job_posting_id: Job posting ID

        Returns:
            List of updated ScreeningResult instances
        """
        # Get all candidates for this job
        candidates = self.db.query(Candidate).filter(
            Candidate.job_posting_id == job_posting_id
        ).all()

        # Re-screen all
        results = []
        for candidate in candidates:
            result = self.screen_candidate(candidate.id, job_posting_id)
            results.append(result)

        return results

    def get_screening_summary(
            self,
            job_posting_id: int
    ) -> Dict:
        """
        Get screening summary statistics for a job posting

        Args:
            job_posting_id: Job posting ID

        Returns:
            Summary dict with statistics
        """
        results = self.db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id
        ).all()

        if not results:
            return {
                "total_candidates": 0,
                "shortlisted": 0,
                "review": 0,
                "flagged": 0,
                "avg_score": 0.0,
                "score_distribution": {}
            }

        scores = [r.total_score for r in results]

        return {
            "total_candidates": len(results),
            "shortlisted": sum(1 for r in results if r.decision == "shortlist"),
            "review": sum(1 for r in results if r.decision == "review"),
            "flagged": sum(1 for r in results if r.decision == "flag"),
            "avg_score": sum(scores) / len(scores),
            "min_score": min(scores),
            "max_score": max(scores),
            "score_distribution": {
                "p25": float(sorted(scores)[len(scores) // 4]),
                "p50": float(sorted(scores)[len(scores) // 2]),
                "p75": float(sorted(scores)[3 * len(scores) // 4]),
            }
        }