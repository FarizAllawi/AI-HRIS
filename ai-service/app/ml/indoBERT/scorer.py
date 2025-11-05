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

    def _compute_similarity_scores(self, answer_emb, embeddings, weight, prefix: str):
        """
        Compute similarity scores - now returns both unweighted mean and weighted individual scores

        Returns:
            (unweighted_mean_score, weighted_individual_scores_dict)
        """
        if not embeddings:
            return 0.0, {}

        similarities = []
        weighted_scores = {}

        for i, emb in enumerate(embeddings):
            try:
                sim = cosine_similarity(answer_emb, emb)
                similarities.append(sim)
                weighted_scores[f"{prefix}_{i + 1}_score"] = float(weight * sim)
            except Exception as e:
                logger.warning(f"Similarity computation failed: {e}")
                continue

        if not similarities:
            return 0.0, {}

        unweighted_mean = float(np.mean(similarities))
        return unweighted_mean, weighted_scores

    def score_candidate(
            self,
            answers: List[Dict],
            jd_embeddings: Dict[str, Dict[str, List[np.ndarray]]]
    ) -> Tuple[float, List[Dict]]:
        question_scores = []
        total_scores = []

        for answer_dict in answers:
            qid = f"question_{answer_dict['question_id']}"
            answer_text = answer_dict["answer"]
            weight = answer_dict["weight"]

            # Encode candidate's answer
            answer_emb = self.model.encode(answer_text)[0]

            # Get embeddings for this question
            jd_data = jd_embeddings.get(qid, {})
            q_embs = jd_data.get("question", [])
            comp_embs = jd_data.get("competencies", [])  # Now list of (name, embedding)
            comb_embs = jd_data.get("combined", [])  # Now list of (name, embedding)

            # --- 1️⃣ Question-only score (weighted) ---
            q_similarities = [cosine_similarity(answer_emb, emb) for emb in q_embs] if q_embs else [0.0]
            question_weighted_score = float(weight * np.mean(q_similarities))

            # --- 2️⃣ Competencies scores ---
            comp_similarities = []
            comp_individual_scores = {}

            # Process competencies with their actual names
            for comp_name, emb in comp_embs:
                similarity = cosine_similarity(answer_emb, emb)
                comp_similarities.append(similarity)
                # Use the actual competency name in the score key
                score_key = f"competency_{comp_name}_score"
                comp_individual_scores[score_key] = float(weight * similarity)

            total_competencies_score = float(np.mean(comp_similarities)) if comp_similarities else 0.0

            competencies_block = {
                "total_competencies_scores": total_competencies_score,
                **comp_individual_scores
            }

            # --- 3️⃣ Combined question + competencies scores ---
            comb_similarities = []
            comb_individual_scores = {}

            # Process combined embeddings with their actual competency names
            for comp_name, emb in comb_embs:
                similarity = cosine_similarity(answer_emb, emb)
                comb_similarities.append(similarity)
                # Use the actual competency name in the score key
                score_key = f"combined_question_competencies_{comp_name}_score"
                comb_individual_scores[score_key] = float(weight * similarity)

            total_combined_score = float(np.mean(comb_similarities)) if comb_similarities else 0.0

            combined_block = {
                "total_combined_scores": total_combined_score,
                **comb_individual_scores
            }

            # --- 4️⃣ Calculate total question score ---
            weighted_components = [question_weighted_score]
            weighted_components.extend(comp_individual_scores.values())
            weighted_components.extend(comb_individual_scores.values())

            total_question_score = float(np.mean(weighted_components)) if weighted_components else 0.0
            total_scores.append(total_question_score)

            # --- 5️⃣ Structured per-question result ---
            question_scores.append({
                "question_id": answer_dict['question_id'],
                "question_score": question_weighted_score,
                "competencies_scores": competencies_block,
                "combined_question_competencies_scores": combined_block,
                "total_question_score": total_question_score
            })

        # --- 🔚 Final total score (mean of all question scores) ---
        total_score = float(np.mean(total_scores))

        return total_score, question_scores

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