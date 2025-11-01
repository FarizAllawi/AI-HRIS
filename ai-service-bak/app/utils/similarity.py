import numpy as np
from typing import List


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Cosine similarity score (0-1)
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return float(dot_product / (norm1 * norm2))


def batch_cosine_similarity(vec: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """
    Calculate cosine similarity between a vector and multiple vectors

    Args:
        vec: Single vector of shape (d,)
        matrix: Matrix of vectors of shape (n, d)

    Returns:
        Array of similarities of shape (n,)
    """
    # Normalize vectors
    vec_norm = vec / (np.linalg.norm(vec) + 1e-9)
    matrix_norm = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-9)

    # Compute dot products
    similarities = np.dot(matrix_norm, vec_norm)

    return similarities


def pairwise_cosine_similarity(matrix1: np.ndarray, matrix2: np.ndarray) -> np.ndarray:
    """
    Calculate pairwise cosine similarity between two matrices

    Args:
        matrix1: Matrix of shape (n, d)
        matrix2: Matrix of shape (m, d)

    Returns:
        Similarity matrix of shape (n, m)
    """
    # Normalize rows
    matrix1_norm = matrix1 / (np.linalg.norm(matrix1, axis=1, keepdims=True) + 1e-9)
    matrix2_norm = matrix2 / (np.linalg.norm(matrix2, axis=1, keepdims=True) + 1e-9)

    # Compute similarity matrix
    similarity_matrix = np.dot(matrix1_norm, matrix2_norm.T)

    return similarity_matrix


def euclidean_distance(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate Euclidean distance between two vectors"""
    return float(np.linalg.norm(vec1 - vec2))


def normalize_scores(scores: List[float], min_val: float = 0.0, max_val: float = 1.0) -> List[float]:
    """
    Normalize scores to a specific range

    Args:
        scores: List of scores
        min_val: Minimum value of output range
        max_val: Maximum value of output range

    Returns:
        Normalized scores
    """
    if not scores:
        return []

    min_score = min(scores)
    max_score = max(scores)

    if min_score == max_score:
        return [0.5 for _ in scores]

    normalized = [
        min_val + (score - min_score) / (max_score - min_score) * (max_val - min_val)
        for score in scores
    ]

    return normalized