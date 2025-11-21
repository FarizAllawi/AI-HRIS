import os
import logging
from transformers import AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_models():
    models_dir = os.getenv('MODEL_CACHE_DIR', 'data/models')
    os.makedirs(models_dir, exist_ok=True)

    # IndoBERT model
    logger.info("Downloading IndoBERT model...")
    indobert_model_name = "indobenchmark/indobert-base-p1"
    try:
        tokenizer = AutoTokenizer.from_pretrained(indobert_model_name, cache_dir=os.path.join(models_dir, "indobert"))
        model = AutoModel.from_pretrained(indobert_model_name, cache_dir=os.path.join(models_dir, "indobert"))
        logger.info("✓ IndoBERT model downloaded successfully")
    except Exception as e:
        logger.error(f"Failed to download IndoBERT model: {e}")

    # Sentence Transformer model
    logger.info("Downloading sentence transformer model...")
    embedding_model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    try:
        model = SentenceTransformer(embedding_model_name, cache_folder=os.path.join(models_dir, "embeddings"))
        logger.info("✓ Sentence transformer model downloaded successfully")
    except Exception as e:
        logger.error(f"Failed to download sentence transformer model: {e}")

if __name__ == "__main__":
    download_models()
