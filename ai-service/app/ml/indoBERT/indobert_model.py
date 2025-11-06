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

    '''
        [CLS] TOKEN Pooling method (OLD VERSION)
    '''
    # def encode(
    #         self,
    #         texts: Union[str, List[str]],
    #         batch_size: int = 32,
    #         normalize: bool = True
    # ) -> np.ndarray:
    #     if isinstance(texts, str):
    #         texts = [texts]
    #     embeddings = []
    #     with torch.no_grad():
    #         for i in range(0, len(texts), batch_size):
    #             batch_texts = texts[i:i + batch_size]
    #             encoded = self.tokenizer(
    #                 batch_texts,
    #                 padding=True,
    #                 truncation=True,
    #                 max_length=settings.MAX_SEQ_LENGTH,
    #                 return_tensors="pt"
    #             )
    #             input_ids = encoded["input_ids"].to(self.device)
    #             attention_mask = encoded["attention_mask"].to(self.device)
    #             outputs = self.model(
    #                 input_ids=input_ids,
    #                 attention_mask=attention_mask
    #             )
    #             batch_embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
    #             embeddings.append(batch_embeddings)
    #     embeddings = np.vstack(embeddings)
    #     if normalize:
    #         embeddings = embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-9)
    #     return embeddings

    '''
        MEAN POOLING version (NEW)
    '''
    def encode(self, texts, normalize=True):
        self.model.eval()
        embeddings = []

        with torch.no_grad():
            for batch_texts in self._batchify(texts):
                encoded = self.tokenizer(
                    batch_texts,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                    max_length=512
                ).to(self.device)

                outputs = self.model(**encoded)

                # === Mean pooling ===
                attention_mask = encoded["attention_mask"].unsqueeze(-1)
                embeddings_tensor = outputs.last_hidden_state
                masked_embeddings = embeddings_tensor * attention_mask
                mean_pooled = masked_embeddings.sum(dim=1) / attention_mask.sum(dim=1)
                batch_embeddings = mean_pooled.cpu().numpy()

                embeddings.append(batch_embeddings)

        embeddings = np.vstack(embeddings)

        if normalize:
            embeddings = embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-9)

        return embeddings

    def _batchify(self, texts, batch_size=8):
        """Yield successive batches of texts."""
        if isinstance(texts, str):
            texts = [texts]
        for i in range(0, len(texts), batch_size):
            yield texts[i:i + batch_size]

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
