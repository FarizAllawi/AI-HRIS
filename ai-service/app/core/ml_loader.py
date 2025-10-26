# app/core/embedding_loader.py
from threading import Lock
from app.ml.indoBERT.indobert_model import IndoBERTModel

_model_instance = None
_model_lock = Lock()

def get_model() -> IndoBERTModel:
    """
    Lazily load IndoBERT model once per Celery worker process.
    """
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    with _model_lock:
        if _model_instance is None:
            print("🚀 Loading IndoBERT model...")
            _model_instance = IndoBERTModel()
            print("✅ IndoBERT model ready.")
    return _model_instance
