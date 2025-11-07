import torch
import torch.nn.functional as F
import numpy as np
from typing import List

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Stable cosine similarity using PyTorch.
    Output is scaled to 0–1 range for HR readability.
    """
    t1 = torch.tensor(vec1, dtype=torch.float32)
    t2 = torch.tensor(vec2, dtype=torch.float32)

    # Normalize
    t1 = F.normalize(t1, p=2, dim=0)
    t2 = F.normalize(t2, p=2, dim=0)

    cos = F.cosine_similarity(t1, t2, dim=0).item()

    # Convert [-1, 1] → [0, 1] for intuitive scoring
    # return (cos + 1.0) / 2.0
    return cos


def batch_cosine_similarity(vec: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """
    Compute cosine similarity between 1 vector and N vectors using GPU.
    Returns similarities scaled to 0–1.
    """
    t_vec = torch.tensor(vec, dtype=torch.float32)
    t_mat = torch.tensor(matrix, dtype=torch.float32)

    t_vec = F.normalize(t_vec, p=2, dim=0)
    t_mat = F.normalize(t_mat, p=2, dim=1)

    cos = torch.matmul(t_mat, t_vec)

    cos = cos.clamp(-1.0, 1.0)
    cos = (cos + 1.0) / 2.0

    return cos.cpu().numpy()


def pairwise_cosine_similarity(matrix1: np.ndarray, matrix2: np.ndarray) -> np.ndarray:
    """
    Compute full pairwise similarity using GPU-accelerated torch matmul.
    Output range: [0, 1]
    """
    t1 = torch.tensor(matrix1, dtype=torch.float32)
    t2 = torch.tensor(matrix2, dtype=torch.float32)

    t1 = F.normalize(t1, p=2, dim=1)
    t2 = F.normalize(t2, p=2, dim=1)

    sim = torch.matmul(t1, t2.T)
    sim = sim.clamp(-1.0, 1.0)
    sim = (sim + 1.0) / 2.0

    return sim.cpu().numpy()


def euclidean_distance(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Euclidean distance using PyTorch"""
    t1 = torch.tensor(vec1, dtype=torch.float32)
    t2 = torch.tensor(vec2, dtype=torch.float32)
    return torch.norm(t1 - t2).item()


def normalize_scores(scores: List[float], min_val: float = 0.0, max_val: float = 1.0) -> List[float]:
    """
    Normalizes scores to desired range (still using NumPy).
    """
    if not scores:
        return []

    min_score = min(scores)
    max_score = max(scores)

    if min_score == max_score:
        return [0.5 for _ in scores]

    normalized = [
        min_val + (s - min_score) / (max_score - min_score) * (max_val - min_val)
        for s in scores
    ]

    return normalized
