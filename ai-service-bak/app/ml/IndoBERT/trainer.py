"""
Continual Learning Trainer for IndoBERT

Implements training with replay buffer to prevent catastrophic forgetting
"""
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import AdamW, get_linear_schedule_with_warmup
from typing import List, Tuple, Dict, Optional
import numpy as np
from datetime import datetime
import os

from app.ml.IndoBERT.indobert_model import IndoBERTModel
from app.ml.IndoBERT.replay_buffer import ReplayBuffer
from app.core.config import settings


class ContrastiveDataset(Dataset):
    """
    Dataset for contrastive learning
    Each sample: (answer_text, jd_text, relevance_score)
    """

    def __init__(
            self,
            examples: List[Tuple[str, str, float]],
            tokenizer,
            max_length: int = 512
    ):
        self.examples = examples
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        answer_text, jd_text, score = self.examples[idx]

        # Tokenize
        answer_encoded = self.tokenizer(
            answer_text,
            padding='max_length',
            truncation=True,
            max_length=self.max_length,
            return_tensors='pt'
        )

        jd_encoded = self.tokenizer(
            jd_text,
            padding='max_length',
            truncation=True,
            max_length=self.max_length,
            return_tensors='pt'
        )

        return {
            'answer_input_ids': answer_encoded['input_ids'].squeeze(),
            'answer_attention_mask': answer_encoded['attention_mask'].squeeze(),
            'jd_input_ids': jd_encoded['input_ids'].squeeze(),
            'jd_attention_mask': jd_encoded['attention_mask'].squeeze(),
            'score': torch.tensor(score, dtype=torch.float)
        }


class ContinualLearningTrainer:
    """
    Trainer for continual learning with replay buffer

    Prevents catastrophic forgetting by mixing new data with historical samples
    """

    def __init__(
            self,
            model: IndoBERTModel,
            replay_buffer: ReplayBuffer,
            learning_rate: float = 2e-5,
            batch_size: int = 16,
            max_epochs: int = 3,
            replay_ratio: float = 0.3,
            warmup_steps: int = 100
    ):
        """
        Initialize trainer

        Args:
            model: IndoBERTModel instance
            replay_buffer: ReplayBuffer for historical data
            learning_rate: Learning rate
            batch_size: Batch size
            max_epochs: Maximum training epochs
            replay_ratio: Ratio of replay samples (0.0-1.0)
            warmup_steps: Warmup steps for learning rate scheduler
        """
        self.model = model
        self.replay_buffer = replay_buffer
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.max_epochs = max_epochs
        self.replay_ratio = replay_ratio
        self.warmup_steps = warmup_steps

        self.device = model.device
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'val_accuracy': []
        }

    def prepare_training_data(
            self,
            new_examples: List[Tuple[str, str, float]]
    ) -> List[Tuple[str, str, float]]:
        """
        Mix new examples with replay buffer samples

        Args:
            new_examples: List of (answer, jd, score) tuples

        Returns:
            Combined training examples
        """
        # Calculate sizes
        n_new = len(new_examples)
        n_replay = int(n_new * self.replay_ratio / (1 - self.replay_ratio))

        # Sample from replay buffer
        replay_samples = self.replay_buffer.sample(n_replay)

        # Combine
        all_examples = new_examples + replay_samples

        print(f"Training data: {n_new} new + {len(replay_samples)} replay = {len(all_examples)} total")

        return all_examples

    def create_dataloader(
            self,
            examples: List[Tuple[str, str, float]],
            shuffle: bool = True
    ) -> DataLoader:
        """Create PyTorch DataLoader"""
        dataset = ContrastiveDataset(
            examples,
            self.model.tokenizer,
            max_length=settings.MAX_SEQ_LENGTH
        )

        dataloader = DataLoader(
            dataset,
            batch_size=self.batch_size,
            shuffle=shuffle,
            num_workers=0  # Set to 0 for compatibility
        )

        return dataloader

    def contrastive_loss(
            self,
            answer_emb: torch.Tensor,
            jd_emb: torch.Tensor,
            target_scores: torch.Tensor,
            temperature: float = 0.07
    ) -> torch.Tensor:
        """
        Compute contrastive loss

        Args:
            answer_emb: Answer embeddings (batch_size, embedding_dim)
            jd_emb: JD embeddings (batch_size, embedding_dim)
            target_scores: Target relevance scores (batch_size,)
            temperature: Temperature for contrastive learning

        Returns:
            Loss value
        """
        # Normalize embeddings
        answer_emb = nn.functional.normalize(answer_emb, p=2, dim=1)
        jd_emb = nn.functional.normalize(jd_emb, p=2, dim=1)

        # Compute similarity matrix
        similarity = torch.matmul(answer_emb, jd_emb.T) / temperature

        # Create target matrix (diagonal should match target_scores)
        batch_size = answer_emb.size(0)
        target_matrix = torch.zeros_like(similarity)
        target_matrix[range(batch_size), range(batch_size)] = target_scores

        # Cross-entropy loss
        loss = nn.functional.cross_entropy(
            similarity.view(-1, batch_size),
            torch.arange(batch_size).to(self.device)
        )

        # Add MSE loss for score alignment
        diagonal_sim = torch.diagonal(similarity)
        score_loss = nn.functional.mse_loss(diagonal_sim, target_scores)

        # Combined loss
        total_loss = loss + 0.5 * score_loss

        return total_loss

    def train_epoch(
            self,
            train_loader: DataLoader,
            optimizer,
            scheduler
    ) -> float:
        """
        Train for one epoch

        Returns:
            Average loss for the epoch
        """
        self.model.model.train()
        total_loss = 0
        num_batches = 0

        for batch in train_loader:
            # Move to device
            answer_ids = batch['answer_input_ids'].to(self.device)
            answer_mask = batch['answer_attention_mask'].to(self.device)
            jd_ids = batch['jd_input_ids'].to(self.device)
            jd_mask = batch['jd_attention_mask'].to(self.device)
            scores = batch['score'].to(self.device)

            # Forward pass
            answer_outputs = self.model.model(
                input_ids=answer_ids,
                attention_mask=answer_mask
            )
            jd_outputs = self.model.model(
                input_ids=jd_ids,
                attention_mask=jd_mask
            )

            # Get [CLS] embeddings
            answer_emb = answer_outputs.last_hidden_state[:, 0, :]
            jd_emb = jd_outputs.last_hidden_state[:, 0, :]

            # Compute loss
            loss = self.contrastive_loss(answer_emb, jd_emb, scores)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()
            num_batches += 1

        avg_loss = total_loss / num_batches
        return avg_loss

    def validate(
            self,
            val_loader: DataLoader
    ) -> Tuple[float, float]:
        """
        Validate model

        Returns:
            (avg_loss, accuracy)
        """
        self.model.model.eval()
        total_loss = 0
        correct = 0
        total = 0

        with torch.no_grad():
            for batch in val_loader:
                answer_ids = batch['answer_input_ids'].to(self.device)
                answer_mask = batch['answer_attention_mask'].to(self.device)
                jd_ids = batch['jd_input_ids'].to(self.device)
                jd_mask = batch['jd_attention_mask'].to(self.device)
                scores = batch['score'].to(self.device)

                # Forward pass
                answer_outputs = self.model.model(
                    input_ids=answer_ids,
                    attention_mask=answer_mask
                )
                jd_outputs = self.model.model(
                    input_ids=jd_ids,
                    attention_mask=jd_mask
                )

                answer_emb = answer_outputs.last_hidden_state[:, 0, :]
                jd_emb = jd_outputs.last_hidden_state[:, 0, :]

                # Compute loss
                loss = self.contrastive_loss(answer_emb, jd_emb, scores)
                total_loss += loss.item()

                # Compute accuracy (cosine similarity)
                answer_emb_norm = nn.functional.normalize(answer_emb, p=2, dim=1)
                jd_emb_norm = nn.functional.normalize(jd_emb, p=2, dim=1)
                similarities = torch.sum(answer_emb_norm * jd_emb_norm, dim=1)

                # Check if similarity matches score (within threshold)
                correct += torch.sum(torch.abs(similarities - scores) < 0.2).item()
                total += scores.size(0)

        avg_loss = total_loss / len(val_loader)
        accuracy = correct / total if total > 0 else 0.0

        return avg_loss, accuracy

    def train(
            self,
            train_examples: List[Tuple[str, str, float]],
            val_examples: Optional[List[Tuple[str, str, float]]] = None,
            save_path: Optional[str] = None
    ) -> Dict:
        """
        Train the model

        Args:
            train_examples: Training examples (new data)
            val_examples: Validation examples
            save_path: Path to save best model

        Returns:
            Training history dict
        """
        print("🚀 Starting continual learning training...")

        # Prepare training data with replay buffer
        all_train_examples = self.prepare_training_data(train_examples)

        # Create dataloaders
        train_loader = self.create_dataloader(all_train_examples, shuffle=True)
        val_loader = self.create_dataloader(val_examples, shuffle=False) if val_examples else None

        # Setup optimizer
        optimizer = AdamW(
            self.model.model.parameters(),
            lr=self.learning_rate
        )

        # Setup scheduler
        total_steps = len(train_loader) * self.max_epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=self.warmup_steps,
            num_training_steps=total_steps
        )

        # Training loop
        best_val_loss = float('inf')

        for epoch in range(self.max_epochs):
            print(f"\nEpoch {epoch + 1}/{self.max_epochs}")

            # Train
            train_loss = self.train_epoch(train_loader, optimizer, scheduler)
            self.history['train_loss'].append(train_loss)
            print(f"  Train Loss: {train_loss:.4f}")

            # Validate
            if val_loader:
                val_loss, val_acc = self.validate(val_loader)
                self.history['val_loss'].append(val_loss)
                self.history['val_accuracy'].append(val_acc)
                print(f"  Val Loss: {val_loss:.4f}, Val Accuracy: {val_acc:.4f}")

                # Save best model
                if save_path and val_loss < best_val_loss:
                    best_val_loss = val_loss
                    self.model.save_checkpoint(save_path)
                    print(f"  ✅ Best model saved to {save_path}")

        # Update replay buffer with new examples
        self.replay_buffer.add_batch(train_examples)

        print("\n✅ Training complete!")

        return self.history

    def get_training_summary(self) -> Dict:
        """Get summary of training"""
        return {
            'epochs': self.max_epochs,
            'final_train_loss': self.history['train_loss'][-1] if self.history['train_loss'] else None,
            'final_val_loss': self.history['val_loss'][-1] if self.history['val_loss'] else None,
            'final_val_accuracy': self.history['val_accuracy'][-1] if self.history['val_accuracy'] else None,
            'best_val_loss': min(self.history['val_loss']) if self.history['val_loss'] else None,
            'history': self.history
        }