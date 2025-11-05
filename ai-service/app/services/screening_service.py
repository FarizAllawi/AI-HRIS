from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict, Optional

from app.ml.indoBERT.indobert_model import IndoBERTModel
from app.ml.indoBERT.scorer import CandidateScorer
from app.models import Applicant, JobPosting, ApplicantAnswer, JobPostingQuestion, ScreeningResult
from app.services.job_posting_service import JobPostingService
import logging

from app.utils.parser import to_serializable

logger = logging.getLogger(__name__)


class ScreeningService:
    '''
    Service for applicant screening
    '''

    def __init__(self, model:IndoBERTModel, db: Session):
        self.model = model
        self.db = db
        self.scorer = CandidateScorer(model)
        self.job_service = JobPostingService(model, db)

    def screen_applicant(self, applicant_id: str) -> Optional[ScreeningResult]:
        """
        Screen an applicant and calculate their score.

        Args:
            applicant_id: UUID of the applicant to screen

        Returns:
            ScreeningResult object if successful, None if failed

        Raises:
            ValueError: If applicant not found or invalid data
            Exception: For other unexpected errors
        """
        try:
            # Fetch applicant
            applicant = self.db.query(Applicant).filter(
                Applicant.id == applicant_id
            ).first()

            if not applicant:
                logger.error(f"Applicant not found: {applicant_id}")
                raise ValueError(f"Applicant not found: {applicant_id}")

            # Find job posting
            job_posting = self.db.query(JobPosting).filter(
                JobPosting.id == applicant.job_posting_id
            ).first()

            if not job_posting:
                logger.error(f"Job posting not found: {applicant.job_posting_id}")
                raise ValueError(f"Job posting not found for applicant {applicant_id}")

            # Find questions for this job posting
            questions = self.db.query(JobPostingQuestion).filter(
                JobPostingQuestion.job_posting_id == applicant.job_posting_id
            ).all()  # Changed to .all() to get all questions

            if not questions:
                logger.warning(f"No questions found for job posting: {applicant.job_posting_id}")
                raise ValueError(f"No screening questions found for job posting {applicant.job_posting_id}")

            # Find applicant answers
            applicant_answers = self.db.query(ApplicantAnswer).filter(
                ApplicantAnswer.applicant_id == applicant_id
            ).all()

            if not applicant_answers:
                logger.warning(f"No answers found for applicant: {applicant_id}")
                raise ValueError(f"No answers found for applicant {applicant_id}")

            # 🚨 FIX: Remove duplicate answers
            applicant_answers = self._deduplicate_answers(applicant_answers)

            # Debug: Check for duplicates
            question_ids = [ans.question_id for ans in applicant_answers]
            if len(question_ids) != len(set(question_ids)):
                logger.error(f"Duplicate questions still exist after deduplication for applicant {applicant_id}")

            # Get Job Posting Embeddings organized by question
            try:
                jp_embeddings = self.job_service.get_job_posting_embeddings_for_questions(
                    applicant.job_posting_id,
                )
            except Exception as e:
                logger.error(f"Failed to get embeddings for job {applicant.job_posting_id}: {str(e)}")
                raise ValueError(f"Failed to retrieve job embeddings: {str(e)}")

            # Prepare answers with weights
            answers = []
            question_map = {q.id: q for q in questions}

            for answer in applicant_answers:
                question = question_map.get(answer.question_id)
                if question:
                    answers.append({
                        'question_id': answer.question_id,
                        'answer': answer.answer,
                        'weight': question.weight,
                        'mapped_competencies': question.mapped_competencies,
                    })
                else:
                    logger.warning(f"Question {answer.question_id} not found for answer {answer.id}")

            if not answers:
                logger.error(f"No valid answers to score for applicant {applicant_id}")
                raise ValueError(f"No valid answers matched with questions for applicant {applicant_id}")

            # Score candidate
            try:
                print("jp_embeddings:", jp_embeddings)
                total_score, question_scores = self.scorer.score_candidate(
                    answers,
                    jp_embeddings,
                )
            except Exception as e:
                logger.error(f"Scoring failed for applicant {applicant_id}: {str(e)}")
                raise ValueError(f"Failed to score candidate: {str(e)}")

            # Determine decision
            try:
                decision = self.scorer.determine_decision(
                    total_score,
                    job_posting.shortlist_threshold or 0.75,
                    job_posting.flag_threshold or 0.25
                )
            except Exception as e:
                logger.error(f"Decision determination failed for applicant {applicant_id}: {str(e)}")
                raise ValueError(f"Failed to determine decision: {str(e)}")

            # Create or update screening result
            existing = self.db.query(ScreeningResult).filter(
                ScreeningResult.applicant_id == applicant_id,
                ScreeningResult.job_posting_id == job_posting.id
            ).first()

            if existing:
                # Update existing
                existing.total_score = total_score
                existing.question_scores = to_serializable(question_scores)
                existing.decision = decision
                existing.weight_version = question.weight_version
                result = existing
                logger.info(f"Updated screening result for applicant {applicant_id}")
            else:
                # Create new
                result = ScreeningResult(
                    job_posting_id=job_posting.id,
                    applicant_id=applicant_id,
                    total_score=total_score,
                    question_scores=to_serializable(question_scores),
                    decision=decision,
                    weight_version=question.weight_version,
                    model_version='v1.0'
                )
                self.db.add(result)
                logger.info(f"Created new screening result for applicant {applicant_id}")

            # Commit changes
            self.db.commit()
            self.db.refresh(result)

            logger.info(f"Successfully screened applicant {applicant_id} with score {total_score}")
            return result

        except ValueError as e:
            # Known validation errors - rollback and re-raise
            self.db.rollback()
            logger.error(f"Validation error screening applicant {applicant_id}: {str(e)}")
            raise

        except SQLAlchemyError as e:
            # Database errors
            self.db.rollback()
            logger.error(f"Database error screening applicant {applicant_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error during screening: {str(e)}")

        except Exception as e:
            # Unexpected errors
            self.db.rollback()
            logger.error(f"Unexpected error screening applicant {applicant_id}: {str(e)}", exc_info=True)
            raise Exception(f"Unexpected error during screening: {str(e)}")

        finally:
            # Ensure database session is cleaned up if needed
            # Note: Only close if you're managing the session lifecycle here
            # If using dependency injection, the session will be closed elsewhere
            pass

    def screen_applicant_batch(self, job_posting_id: str,  applicant_ids: List[str]) :
        '''
        Screen Multiple Applicant for a job posting

        Args:
            job_posting_id: Job Posting ID
            applicant_ids: List of Applicant IDs

        Returns:
            List of ScreeningResult objects
        '''
        # Get Applicants
        query = self.db.query(Applicant).filter(
            Applicant.job_posting_id == job_posting_id,
        )

        if applicant_ids:
            query = query.filter(Applicant.id.in_(applicant_ids))

        applicants = query.all()

        results = []
        for applicant in applicants:
            try:
                result = self.screen_applicant(applicant.id)
                results.append(result)
            except Exception as e:
                print(f"Error screening applicant {applicant.id}: {e}")
                continue
        return results

    def get_screening_summary(self, job_posting_id: str) -> Dict:
        '''
        Get screening summary for a job posting

        Args:
            job_posting_id: Job Posting ID

        Returns:
            Summary dict with statistics
        '''
        results = self.db.query(ScreeningResult).filter(
            ScreeningResult.job_posting_id == job_posting_id,
        ).all()

        if not results:
            return {
                "total_applicants": 0,
                "shortlisted": 0,
                "review": 0,
                "flagged": 0,
                "avg_score": 0.0,
                "score_distribution": {},
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

    def _deduplicate_answers(self, applicant_answers: List[ApplicantAnswer]) -> List[ApplicantAnswer]:
        """
        Remove duplicate answers for the same question, keeping only the first one
        """
        seen_questions = set()
        unique_answers = []

        for answer in applicant_answers:
            if answer.question_id not in seen_questions:
                seen_questions.add(answer.question_id)
                unique_answers.append(answer)
            else:
                logger.warning(f"Duplicate answer found for question {answer.question_id}, keeping first one")

        return unique_answers

