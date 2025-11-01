import torch
from transformers import AutoTokenizer, AutoModel
from typing import List, Union
import numpy as np
from app.core.config import settings


class IndoBERTModel:
    """
    Wrapper for IndoBERT model
    Handles embedding generation and model management
    """

    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.MODEL_NAME
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        print(f"Loading IndoBERT model: {self.model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModel.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval()
        print(f"✅ Model loaded on {self.device}")

    def encode(
            self,
            texts: Union[str, List[str]],
            batch_size: int = 32,
            normalize: bool = True
    ) -> np.ndarray:
        """
        Generate embeddings for text(s)

        Args:
            texts: Single text or list of texts
            batch_size: Batch size for processing
            normalize: Whether to L2-normalize embeddings

        Returns:
            numpy array of shape (n_texts, embedding_dim)
        """
        if isinstance(texts, str):
            texts = [texts]

        embeddings = []

        with torch.no_grad():
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]

                # Tokenize
                encoded = self.tokenizer(
                    batch_texts,
                    padding=True,
                    truncation=True,
                    max_length=settings.MAX_SEQ_LENGTH,
                    return_tensors="pt"
                )

                # Move to device
                input_ids = encoded["input_ids"].to(self.device)
                attention_mask = encoded["attention_mask"].to(self.device)

                # Get embeddings
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )

                # Use [CLS] token embedding (mean pooling alternative)
                batch_embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
                embeddings.append(batch_embeddings)

        embeddings = np.vstack(embeddings)

        if normalize:
            embeddings = embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-9)

        return embeddings

    def save_checkpoint(self, path: str):
        """Save model checkpoint"""
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)
        print(f"✅ Model saved to {path}")

    def load_checkpoint(self, path: str):
        """Load model checkpoint"""
        self.model = AutoModel.from_pretrained(path)
        self.tokenizer = AutoTokenizer.from_pretrained(path)
        self.model.to(self.device)
        self.model.eval()
        print(f"✅ Model loaded from {path}")