import torch
import torch.nn.functional as F
import pandas as pd
from transformers import AutoTokenizer, AutoModel


class IndoBERTScorer:
    """
    IndoBERTScorer computes similarity scores between applicants' answers
    and a given job description using IndoBERT embeddings.

    The CSV input must have:
    - A column for applicant names ("Nama Lengkap")
    - Columns for each question (text)
    - Columns for weights of each question (numeric)

    Example usage:
        scorer = IndoBERTScorer(csv_path="Form_Responses_1.csv", job_desc=job_desc)
        question_cols = [Q1, Q2, Q3, Q4, Q5]
        weight_cols = ["weight1", "weight2", "weight3", "weight4", "weight5"]
        result_df = scorer.evaluate(question_cols, weight_cols
    """

    def __init__(self, csv_path: str, job_desc: str):
        self.csv_path = csv_path
        self.job_desc = job_desc.strip()

        # Load IndoBERT model
        print("🔹 Loading IndoBERT model...")
        self.tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
        self.model = AutoModel.from_pretrained("indobenchmark/indobert-base-p1")

        # Load CSV
        print(f"🔹 Loading data from {self.csv_path} ...")
        self.df = pd.read_csv(self.csv_path)
        print(f"✅ Loaded {len(self.df)} records")

    # ==========================================================
    # Embedding
    # ==========================================================
    def get_embedding(self, text: str) -> torch.Tensor:
        """Generate mean pooled embedding for given text."""
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
        embeddings = outputs.last_hidden_state
        return embeddings.mean(dim=1)  # mean pooling

    # ==========================================================
    # Scoring
    # ==========================================================
    def compute_score(self, row: pd.Series, question_cols: list, weight_cols: list) -> float:
        """Compute total weighted similarity score for a single applicant."""
        total = 0.0
        job_emb = self.get_embedding(self.job_desc)

        for q_col, w_col in zip(question_cols, weight_cols):
            answer = str(row[q_col])
            weight = float(row[w_col])
            sim = F.cosine_similarity(job_emb, self.get_embedding(answer)).item()
            total += sim * weight

        return total

    # ==========================================================
    # Evaluate All
    # ==========================================================
    def evaluate(self, question_cols: list, weight_cols: list) -> pd.DataFrame:
        """
        Compute scores for all applicants.

        :param question_cols: list of column names containing applicants' answers
        :param weight_cols: list of column names containing corresponding weights
        :return: DataFrame with an additional "skor" column
        """
        print("🔹 Computing applicant scores...")
        self.df["skor"] = self.df.apply(lambda row: self.compute_score(row, question_cols, weight_cols), axis=1)
        print("✅ Scoring complete!")
        return self.df
