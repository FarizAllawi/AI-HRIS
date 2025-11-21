import os
from typing import List, Optional
import numpy as np

from app.core.config import settings

try:
    import hnswlib
except Exception as e:
    hnswlib = None


class VectorIndex:
    """Simple wrapper around hnswlib for local vector search during development.

    - Stores index file under settings.VECTOR_INDEX_PATH
    - If hnswlib not installed, raises informative error
    """

    def __init__(self, dim: int = None, path: str = None):
        if hnswlib is None:
            raise RuntimeError(
                "hnswlib is not installed. Please install with 'pip install hnswlib' or add it to pyproject.toml"
            )
        self.dim = dim or settings.EMBEDDING_DIM
        self.path = path or settings.VECTOR_INDEX_PATH
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        self.p = hnswlib.Index(space='cosine', dim=self.dim)
        self._loaded = False

        if os.path.exists(self.path):
            try:
                self.p.load_index(self.path)
                self._loaded = True
            except Exception:
                # If loading fails, reinitialize a fresh index
                self.p.init_index(max_elements=10000, ef_construction=200, M=16)

    def init(self, max_elements: int = 10000):
        if not self._loaded:
            self.p.init_index(max_elements=max_elements, ef_construction=200, M=16)

    def save(self):
        self.p.save_index(self.path)

    def add_items(self, vectors: List[List[float]], ids: Optional[List[int]] = None):
        arr = np.asarray(vectors, dtype=np.float32)
        if ids is None:
            ids = list(range(arr.shape[0]))
        self.p.add_items(arr, ids)

    def knn_query(self, vector: List[float], k: int = 10):
        v = np.asarray([vector], dtype=np.float32)
        labels, distances = self.p.knn_query(v, k=k)
        return labels[0].tolist(), distances[0].tolist()


# Singleton pattern for app-wide index
_index: Optional[VectorIndex] = None


def get_vector_index():
    global _index
    if _index is None:
        _index = VectorIndex()
        _index.init()
    return _index
