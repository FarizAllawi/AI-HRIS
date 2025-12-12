"""
Embedder: High-level interface for generating embeddings
"""
import numpy as np
from typing import List, Union, Dict, Optional
from app.ml.indoBERT.indobert_model import IndoBERTModel
from app.core.config import settings


class Embedder:
    """
    High-level embedder that handles caching and batch processing
    """

    def __init__(self, model: IndoBERTModel = None):
        """
        Initialize embedder

        Args:
            model: IndoBERTModel instance. If None, creates new one.
        """
        self.model = model or IndoBERTModel()
        self._cache: Dict[str, np.ndarray] = {}

    def embed_text(
            self,
            text: str,
            use_cache: bool = True
    ) -> np.ndarray:
        """
        Generate embedding for a single text

        Args:
            text: Input text
            use_cache: Whether to use cache

        Returns:
            Embedding vector
        """
        if use_cache and text in self._cache:
            return self._cache[text]

        embedding = self.model.encode(text)[0]

        if use_cache:
            self._cache[text] = embedding

        return embedding

    def embed_texts(
            self,
            texts: List[str],
            batch_size: int = 32,
            show_progress: bool = False
    ) -> np.ndarray:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of input texts
            batch_size: Batch size for processing
            show_progress: Whether to show progress bar

        Returns:
            Array of embeddings (n_texts, embedding_dim)
        """
        if show_progress:
            try:
                from tqdm import tqdm
                texts = tqdm(texts, desc="Generating embeddings")
            except ImportError:
                pass

        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            normalize=True
        )

        return embeddings

    def embed_jd_competencies(
            self,
            competencies: Dict[str, List[str]]
    ) -> Dict[str, List[np.ndarray]]:
        """
        Embed all competencies from a JD

        Args:
            competencies: Dict with keys like 'responsibilities', 'required_skills'
                         Each value is a list of text strings

        Returns:
            Dict mapping competency type to list of embeddings
        """
        result = {}

        for comp_type, texts in competencies.items():
            if texts:
                embeddings = self.embed_texts(texts)
                result[comp_type] = [emb for emb in embeddings]

        return result

    def embed_answers(
            self,
            answers: List[Dict]
    ) -> Dict[int, np.ndarray]:
        """
        Embed candidate answers

        Args:
            answers: List of answer dicts with 'question_id' and 'answer' keys

        Returns:
            Dict mapping question_id to embedding
        """
        result = {}

        for answer_dict in answers:
            qid = answer_dict["question_id"]
            text = answer_dict["answer"]

            embedding = self.embed_text(text)
            result[qid] = embedding

        return result

    def clear_cache(self):
        """Clear embedding cache"""
        self._cache.clear()

    def get_cache_size(self) -> int:
        """Get number of cached embeddings"""
        return len(self._cache)

    def preload_cache(self, texts: List[str]):
        """
        Preload cache with embeddings for given texts

        Args:
            texts: List of texts to preload
        """
        embeddings = self.embed_texts(texts)

        for text, emb in zip(texts, embeddings):
            self._cache[text] = emb

    @staticmethod
    def compute_similarity_matrix(
            embeddings1: np.ndarray,
            embeddings2: np.ndarray
    ) -> np.ndarray:
        """
        Compute pairwise cosine similarity matrix

        Args:
            embeddings1: Array of shape (n, d)
            embeddings2: Array of shape (m, d)

        Returns:
            Similarity matrix of shape (n, m)
        """
        # Normalize
        emb1_norm = embeddings1 / (np.linalg.norm(embeddings1, axis=1, keepdims=True) + 1e-9)
        emb2_norm = embeddings2 / (np.linalg.norm(embeddings2, axis=1, keepdims=True) + 1e-9)

        # Compute similarity
        similarity = np.dot(emb1_norm, emb2_norm.T)

        return similarity

    def find_most_similar(
            self,
            query_text: str,
            candidate_texts: List[str],
            top_k: int = 5
    ) -> List[tuple]:
        """
        Find most similar texts to a query

        Args:
            query_text: Query text
            candidate_texts: List of candidate texts
            top_k: Number of top results to return

        Returns:
            List of (index, text, similarity_score) tuples
        """
        # Generate embeddings
        query_emb = self.embed_text(query_text)
        candidate_embs = self.embed_texts(candidate_texts)

        # Compute similarities
        from app.utils.similarity import cosine_similarity
        similarities = [
            cosine_similarity(query_emb, cand_emb)
            for cand_emb in candidate_embs
        ]

        # Get top-k
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = [
            (idx, candidate_texts[idx], similarities[idx])
            for idx in top_indices
        ]

        return results

    def get_embedding_stats(self) -> Dict:
        """Get statistics about embeddings"""
        return {
            "embedding_dim": settings.EMBEDDING_DIM,
            "model_name": self.model.model_name,
            "cache_size": self.get_cache_size(),
            "device": str(self.model.device)
        }