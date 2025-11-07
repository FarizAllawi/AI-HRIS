import numpy as np
import torch
from typing import Dict, List, Tuple
from app.utils.similarity import cosine_similarity


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

        # print("========== Candidate Answer ==========")
        # print(candidate_answers)
        #
        # print("========== Questions Metadata ==========")
        # print(questions_metadata)

        for q_key, q_emb_data in job_posting_embeddings.items():
            question_id = q_key.replace("question_", "")

            print("========== Job Posting Embeddings ITEMS ==========")
            print("question_id:", question_id)


            # Get answer text
            answer = candidate_answers.get(question_id)
            if not answer:
                continue
            print("answer:", answer)

            meta = questions_metadata.get(question_id, {}) if questions_metadata else {}
            weight = meta.get("weight", 0.2)
            print("meta:", meta)
            print("weight:", weight)


            # --- Encode candidate answer ---
            cand_embedding = self.model.encode(answer)[0]

            # --- Question-only embeddings ---
            q_embeddings = q_emb_data.get("question", [])
            if not q_embeddings:
                continue
            q_similarities = [
                cosine_similarity(cand_embedding,q_emb)
                for q_emb in q_embeddings
            ]

            question_score = self.softmax_aggregate(q_similarities)
            # question_score = question_score * weight

            # ============================
            # ✅ Competency embeddings
            # ============================
            comp_scores = {}
            for comp_id, comp_emb in q_emb_data.get("competencies", []):
                comp_scores[comp_id] = cosine_similarity(cand_embedding,comp_emb)
                # comp_scores[comp_id] = comp_scores[comp_id] * weight
            print("comp_scores:", comp_scores)

            comp_vals = list(comp_scores.values())
            comp_total = self.softmax_aggregate(comp_vals) if comp_vals else 0.0
            print("comp_vals:", comp_vals)
            print("comp_total:", comp_total)

            # ============================
            # ✅ Combined question + competency embeddings
            # ============================
            comb_scores = {}
            for comb_id, comb_emb in q_emb_data.get("combined", []):
                comb_scores[comb_id] = cosine_similarity(cand_embedding,comb_emb)
                # comb_scores[comb_id] = comb_scores[comb_id] * weight
            print("comb_scores:", comb_scores)

            comb_vals = list(comb_scores.values())
            comb_total = self.softmax_aggregate(comb_vals) if comb_vals else 0.0

            print("comb_vals:", comb_vals)
            print("comb_total:", comb_total)

            # ============================
            # ✅ Final per-question score
            # (Weighted + Softmax blended)
            # ============================
            all_parts = [question_score, comp_total, comb_total]
            total_question_score = self.softmax_aggregate(all_parts)
            print("all_parts:", all_parts)
            print("total_question_score:", total_question_score)

            question_scores.append({
                "question_id": question_id,
                "question_score": question_score,
                "competencies_scores": {
                    "total_competencies_scores": comp_total,
                    **{f"competency_{i + 1}_score": v for i, v in enumerate(comp_vals)}
                },
                "combined_question_competencies_scores": {
                    "total_combined_scores": comb_total,
                    **{f"combined_question_competencies_{i + 1}_score": v for i, v in enumerate(comb_vals)}
                },
                "total_question_score": total_question_score
            })

            total_scores.append(total_question_score)

            print("question_scores:", question_scores)
            print("total_scores:", total_scores)
        # =====================================================
        # FINAL TOTAL SCORE
        # =====================================================
        if not total_scores:
            total_score = 0.0
        else:
            # Softmax Aggregate
            # total_score = self.softmax_aggregate(total_scores)

            # NORMALIZE SUM
            # raw_total = sum(total_scores)
            # total_score = raw_total / len(total_scores)

            # ONLY SUM
            total_score = sum(total_scores)

        return total_score, question_scores

    # =====================================================
    # ✅ Softmax-weighted Aggregation (Core Improvement)
    # =====================================================
    def softmax_aggregate(self, values: List[float], temperature: float = 10.0) -> float:
        """
        Softmax-weighted aggregation.
        Stronger scores contribute more than weaker scores.
        Prevents strong scores from being diluted by weaker ones.
        """
        arr = np.array(values, dtype=np.float32)
        if arr.size == 0:
            return 0.0

        weights = np.exp(arr * temperature)
        weights = weights / (weights.sum() + 1e-9)

        return float(np.sum(arr * weights))


    # =====================================================
    # DECISION DETERMINATION METHOD
    # =====================================================
    def determine_decision(
            self,
            total_score: float,
            num_questions: int,
            shortlist_ratio: float = 0.70,
            flag_ratio: float = 0.30
    ) -> str:
        """
        Determine hiring decision using SUM-based scoring.
        Ratios scale thresholds based on number of questions.
        """

        # Expected score range per question
        MIN_PER_Q = 0.2
        MAX_PER_Q = 0.9

        min_possible = MIN_PER_Q * num_questions
        max_possible = MAX_PER_Q * num_questions
        score_range = max_possible - min_possible

        shortlist_threshold = min_possible + shortlist_ratio * score_range
        flag_threshold = min_possible + flag_ratio * score_range

        if total_score >= shortlist_threshold:
            return "shortlist"
        elif total_score >= flag_threshold:
            return "review"
        else:
            return "flag"
