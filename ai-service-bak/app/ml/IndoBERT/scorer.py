import numpy as np
from typing import List, Dict, Tuple
from app.utils.similarity import cosine_similarity


class CandidateScorer:
    """
    Implements the weighted scoring algorithm:

    For candidate c, questions Q, weights w_q, answers a_q, JD embeddings E_q:
    1. Answer embedding: v(a_q) via IndoBERT
    2. Question score (max-pool): s_q = max_{e in E_q} cosine(v(a_q), e)
    3. Weighted aggregate: S(c) = sum(w_q * s_q)
    """

    def __init__(self, model):
        self.model = model

    def score_candidate(
            self,
            answers: List[Dict],  # [{"question_id": 1, "answer": "text", "weight": 0.35}]
            jd_embeddings: Dict[int, List[np.ndarray]]  # {question_id: [emb1, emb2, ...]}
    ) -> Tuple[float, List[Dict]]:
        """
        Score a candidate based on their answers

        Args:
            answers: List of answer dicts with question_id, answer text, and weight
            jd_embeddings: Pre-computed JD embeddings per question

        Returns:
            (total_score, question_scores)
            question_scores: [{"question_id": 1, "score": 0.85, "weight": 0.35}]
        """
        question_scores = []
        total_score = 0.0

        # Normalize weights
        total_weight = sum(a["weight"] for a in answers)
        normalized_weights = {
            a["question_id"]: a["weight"] / total_weight
            for a in answers
        }

        for answer_dict in answers:
            qid = answer_dict["question_id"]
            answer_text = answer_dict["answer"]
            weight = normalized_weights[qid]

            # Get answer embedding
            answer_emb = self.model.encode(answer_text)[0]

            # Get JD embeddings for this question
            jd_embs = jd_embeddings.get(qid, [])

            if len(jd_embs) == 0:
                # No JD embeddings for this question, assign default score
                question_score = 0.5
            else:
                # Max-pool cosine similarity
                similarities = [
                    cosine_similarity(answer_emb, jd_emb)
                    for jd_emb in jd_embs
                ]
                question_score = max(similarities)

            # Weighted contribution
            weighted_score = weight * question_score
            total_score += weighted_score

            question_scores.append({
                "question_id": qid,
                "score": float(question_score),
                "weight": float(weight),
                "weighted_score": float(weighted_score)
            })

        return float(total_score), question_scores

    def batch_score_candidates(
            self,
            candidates: List[Dict],
            jd_embeddings: Dict[int, List[np.ndarray]]
    ) -> List[Tuple[float, List[Dict]]]:
        """
        Score multiple candidates

        Args:
            candidates: List of candidate dicts with answers
            jd_embeddings: JD embeddings for the job

        Returns:
            List of (total_score, question_scores) tuples
        """
        results = []
        for candidate in candidates:
            score, breakdown = self.score_candidate(
                candidate["answers"],
                jd_embeddings
            )
            results.append((score, breakdown))

        return results

    def determine_decision(
            self,
            score: float,
            shortlist_threshold: float,
            flag_threshold: float
    ) -> str:
        """
        Determine screening decision based on score and thresholds

        Args:
            score: Candidate's total score
            shortlist_threshold: P75 threshold
            flag_threshold: P25 threshold

        Returns:
            Decision: "shortlist", "review", "flag", or "reject"
        """
        if score >= shortlist_threshold:
            return "shortlist"
        elif score >= flag_threshold:
            return "review"
        else:
            return "flag"