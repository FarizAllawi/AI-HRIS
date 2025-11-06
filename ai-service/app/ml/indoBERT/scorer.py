import numpy as np
import torch
from typing import Dict, List, Tuple


class CandidateScorer:
    """
    CandidateScorer
    ----------------
    Compute similarity between candidate answers and job posting embeddings.

    Each candidate's answer is compared against:
        1. Question-only embedding
        2. Competency embeddings (mapped from job posting)
        3. Combined question+competency embeddings
    """

    def __init__(self, model, similarity_metric: str = "cosine"):
        self.model = model
        self.similarity_metric = similarity_metric

    # =====================================================
    # COSINE SIMILARITY FUNCTION
    # =====================================================
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        if a is None or b is None:
            return 0.0
        a = a / (np.linalg.norm(a) + 1e-9)
        b = b / (np.linalg.norm(b) + 1e-9)
        return float(np.dot(a, b))

    # =====================================================
    # MAIN SCORING METHOD
    # =====================================================
    def score_candidate(
            self,
            candidate_answers: Dict[str, str],
            job_posting_embeddings: Dict[str, Dict[str, List]],
            questions_metadata: Dict[str, Dict] = None
    ) -> Tuple[float, List[Dict]]:
        """
        Compute similarity scores for each question and overall score.

        Args:
            candidate_answers: dict mapping question_id -> candidate answer text
            job_posting_embeddings: dict from JobPostingService.get_job_posting_embeddings_for_questions()
            questions_metadata: dict mapping question_id -> metadata (e.g., weight, mapped competencies)

        Returns:
            Tuple of (total_score, question_scores)
        """
        total_scores = []
        question_scores = []

        for q_key, q_emb_data in job_posting_embeddings.items():
            question_id = q_key.replace("question_", "")

            # Get answer text
            answer = candidate_answers.get(question_id)
            if not answer:
                continue

            meta = questions_metadata.get(question_id, {}) if questions_metadata else {}
            weight = meta.get("weight", 1.0)

            # --- Encode candidate answer ---
            cand_embedding = self.model.encode(answer)[0]

            # --- Question-only embeddings ---
            q_embeddings = q_emb_data.get("question", [])
            if not q_embeddings:
                continue
            q_similarities = [
                self._cosine_similarity(cand_embedding, q_emb) for q_emb in q_embeddings
            ]

            # 🧮 Step 1: Compute mean similarity (no redundant weighting)
            question_weighted_score = np.mean(q_similarities)

            # --- Competency embeddings ---
            comp_scores = {}
            for comp_id, comp_emb in q_emb_data.get("competencies", []):
                comp_scores[comp_id] = self._cosine_similarity(cand_embedding, comp_emb)

            # --- Combined question+competency embeddings ---
            comb_scores = {}
            for comb_id, comb_emb in q_emb_data.get("combined", []):
                comb_scores[comb_id] = self._cosine_similarity(cand_embedding, comb_emb)

            # --- Compute total question score ---
            comp_vals = list(comp_scores.values())
            comb_vals = list(comb_scores.values())

            all_parts = [question_weighted_score, *comp_vals, *comb_vals]
            total_question_score = float(np.mean(all_parts)) if all_parts else 0.0

            question_scores.append({
                "question_id": question_id,
                "question_score": question_weighted_score,
                "competencies_scores": {
                    "total_competencies_scores": np.mean(comp_vals) if comp_vals else 0.0,
                    **{f"competency_{i + 1}_score": v for i, v in enumerate(comp_vals)}
                },
                "combined_question_competencies_scores": {
                    "total_combined_scores": np.mean(comb_vals) if comb_vals else 0.0,
                    **{f"combined_question_competencies_{i + 1}_score": v for i, v in enumerate(comb_vals)}
                },
                "total_question_score": total_question_score
            })

            total_scores.append(total_question_score)

        # =====================================================
        # FINAL TOTAL SCORE
        # =====================================================
        if not total_scores:
            total_score = 0.0
        else:
            total_score = float(np.mean(total_scores))

        return total_score, question_scores

    # =====================================================
    # DECISION DETERMINATION METHOD
    # =====================================================
    def determine_decision(
            self,
            total_score: float,
            shortlist_threshold: float,
            flag_threshold: float
    ) -> str:
        """
        Determine hiring decision based on score and thresholds

        Args:
            total_score: Candidate's total score (0.0 - 1.0)
            shortlist_threshold: Minimum score for shortlisting (e.g., 0.75)
            flag_threshold: Minimum score to avoid flagging (e.g., 0.25)

        Returns:
            Decision string: "shortlist", "review", or "flag"
        """
        if total_score >= shortlist_threshold:
            return "shortlist"
        elif total_score >= flag_threshold:
            return "review"
        else:
            return "flag"