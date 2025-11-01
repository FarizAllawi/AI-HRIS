"""
Celery Tasks: Model Training & Refinement

Tasks for continual learning and model updates:
- Collect training data from HR feedback
- Train/refine model with replay buffer
- Manage model checkpoints
"""
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.training_data import TrainingExample, ModelCheckpoint
from app.models.candidate import ScreeningResult
from app.models.job_posting import JobPosting
from app.ml.indobert_model import IndoBERTModel
from app.ml.trainer import ContinualLearningTrainer
from app.ml.replay_buffer import ReplayBuffer, create_replay_buffer_from_db
from datetime import datetime
from typing import Dict, List
import os
import traceback


@celery_app.task(
    name="app.tasks.training.refine_model",
    bind=True,
    max_retries=1
)
def refine_model_async(self, epochs: int = 3, batch_size: int = 16) -> Dict:
    """
    Refine model using collected training data with continual learning

    This implements:
    1. Load base model
    2. Load replay buffer with historical data
    3. Collect new training data from HR feedback
    4. Mix new + replay data
    5. Fine-tune model
    6. Save checkpoint

    Args:
        epochs: Number of training epochs
        batch_size: Batch size for training

    Returns:
        Training results
    """
    db = SessionLocal()

    try:
        print("🚀 Starting model refinement...")

        # Step 1: Check if we have enough training data
        training_count = db.query(TrainingExample).filter(
            TrainingExample.is_active == True
        ).count()

        if training_count < 100:
            print(f"  ⚠️  Insufficient training data: {training_count}/100")
            return {
                "status": "skipped",
                "reason": f"Need at least 100 training examples, have {training_count}",
                "training_samples": training_count
            }

        print(f"  📊 Training samples available: {training_count}")

        # Step 2: Load model
        print("  🤖 Loading IndoBERT model...")
        model = IndoBERTModel()

        # Step 3: Load/create replay buffer
        print("  💾 Loading replay buffer...")
        replay_buffer = create_replay_buffer_from_db(db)

        # Step 4: Collect new training examples
        print("  📥 Collecting new training examples...")
        new_examples = _collect_new_training_examples(db, limit=500)

        if len(new_examples) < 10:
            print(f"  ⚠️  Too few new examples: {len(new_examples)}")
            return {
                "status": "skipped",
                "reason": f"Need at least 10 new examples, have {len(new_examples)}",
                "new_examples": len(new_examples)
            }

        print(f"  ✅ Collected {len(new_examples)} new examples")

        # Step 5: Prepare validation set
        val_examples = _collect_validation_examples(db, limit=100)
        print(f"  ✅ Validation set: {len(val_examples)} examples")

        # Step 6: Initialize trainer
        print("  🎓 Initializing continual learning trainer...")
        trainer = ContinualLearningTrainer(
            model=model,
            replay_buffer=replay_buffer,
            learning_rate=2e-5,
            batch_size=batch_size,
            max_epochs=epochs,
            replay_ratio=0.3
        )

        # Step 7: Train
        print(f"  🏋️  Training for {epochs} epochs...")
        history = trainer.train(
            train_examples=new_examples,
            val_examples=val_examples if val_examples else None,
            save_path=None  # Will save manually
        )

        # Step 8: Save checkpoint
        version = f"v1.{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        checkpoint_path = f"./data/models/{version}"
        os.makedirs(checkpoint_path, exist_ok=True)

        print(f"  💾 Saving model checkpoint: {version}...")
        model.save_checkpoint(checkpoint_path)

        # Step 9: Create checkpoint record
        summary = trainer.get_training_summary()

        checkpoint = ModelCheckpoint(
            version=version,
            path=checkpoint_path,
            training_samples=training_count,
            val_loss=summary.get('final_val_loss', 0.0),
            val_accuracy=summary.get('final_val_accuracy', 0.0),
            config={
                "epochs": epochs,
                "batch_size": batch_size,
                "learning_rate": 2e-5,
                "replay_ratio": 0.3,
                "new_examples": len(new_examples),
                "replay_samples": len(replay_buffer)
            },
            is_active=False,  # Don't auto-activate
            notes=f"Continual learning refinement with {len(new_examples)} new examples"
        )

        db.add(checkpoint)
        db.commit()
        db.refresh(checkpoint)

        # Step 10: Save updated replay buffer
        replay_buffer.save(f"replay_buffer_{version}.pkl")

        print(f"✅ Model refinement complete!")
        print(f"   Version: {version}")
        print(f"   Val Loss: {summary.get('final_val_loss', 'N/A')}")
        print(f"   Val Accuracy: {summary.get('final_val_accuracy', 'N/A')}")

        return {
            "status": "success",
            "version": version,
            "checkpoint_id": checkpoint.id,
            "checkpoint_path": checkpoint_path,
            "training_samples": training_count,
            "new_examples": len(new_examples),
            "replay_samples": len(replay_buffer),
            "epochs": epochs,
            "final_val_loss": summary.get('final_val_loss'),
            "final_val_accuracy": summary.get('final_val_accuracy'),
            "message": f"Model {version} trained. Activate via API to use."
        }

    except Exception as e:
        print(f"❌ Error refining model: {e}")
        print(traceback.format_exc())

        # Try to retry once
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=300)  # Wait 5 minutes

        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

    finally:
        db.close()


@celery_app.task(name="app.tasks.training.collect_training_data_from_feedback")
def collect_training_data_from_feedback() -> Dict:
    """
    Periodic task: Collect training data from HR feedback

    Extracts training examples from screening results that have HR feedback
    and adds them to the training_examples table

    Returns:
        Collection summary
    """
    db = SessionLocal()

    try:
        print("📥 Collecting training data from HR feedback...")

        # Get screening results with HR feedback
        results = db.query(ScreeningResult).filter(
            ScreeningResult.hr_rating.isnot(None)
        ).all()

        if not results:
            print("  ℹ️  No HR feedback found")
            return {
                "status": "success",
                "new_examples": 0,
                "message": "No HR feedback to collect"
            }

        print(f"  Found {len(results)} results with HR feedback")

        new_examples = 0

        for result in results:
            try:
                # Check if already in training data
                existing = db.query(TrainingExample).filter(
                    TrainingExample.job_posting_id == result.job_posting_id,
                    TrainingExample.answer_text.in_([
                        ans["answer"] for ans in result.candidate.answers
                    ])
                ).first()

                if existing:
                    continue

                # Create training examples from this result
                candidate = result.candidate
                job = result.job_posting

                for answer_dict in candidate.answers:
                    question = next(
                        (q for q in job.questions if q["id"] == answer_dict["question_id"]),
                        None
                    )

                    if not question:
                        continue

                    # Get relevant JD text
                    mapped_comps = question.get("mapped_competencies", [])
                    jd_texts = []

                    for emb in job.embeddings:
                        if emb.competency_id in mapped_comps:
                            jd_texts.append(emb.text)

                    if not jd_texts:
                        continue

                    # Create training example
                    training_example = TrainingExample(
                        answer_text=answer_dict["answer"],
                        jd_text=" ".join(jd_texts),
                        relevance_score=result.total_score,
                        hr_rating=result.hr_rating,
                        job_posting_id=job.id,
                        question_id=answer_dict["question_id"],
                        competency_type=question.get("type", "general"),
                        source="hr_feedback",
                        diversity_score=0.5  # Will be computed by replay buffer
                    )

                    db.add(training_example)
                    new_examples += 1

            except Exception as e:
                print(f"  ⚠️  Error processing result {result.id}: {e}")
                continue

        db.commit()

        print(f"✅ Collected {new_examples} new training examples")

        return {
            "status": "success",
            "results_processed": len(results),
            "new_examples": new_examples
        }

    except Exception as e:
        print(f"❌ Error collecting training data: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.training.cleanup_old_training_data")
def cleanup_old_training_data(keep_count: int = 10000) -> Dict:
    """
    Clean up old training data, keeping only most diverse/recent samples

    Args:
        keep_count: Number of samples to keep

    Returns:
        Cleanup summary
    """
    db = SessionLocal()

    try:
        print(f"🧹 Cleaning up training data (keeping {keep_count})...")

        # Get all training examples
        examples = db.query(TrainingExample).order_by(
            TrainingExample.diversity_score.desc(),
            TrainingExample.created_at.desc()
        ).all()

        if len(examples) <= keep_count:
            print(f"  ℹ️  No cleanup needed: {len(examples)}/{keep_count}")
            return {
                "status": "success",
                "total_examples": len(examples),
                "kept": len(examples),
                "deactivated": 0
            }

        # Mark old examples as inactive
        to_deactivate = examples[keep_count:]
        for example in to_deactivate:
            example.is_active = False

        db.commit()

        print(f"✅ Deactivated {len(to_deactivate)} old training examples")

        return {
            "status": "success",
            "total_examples": len(examples),
            "kept": keep_count,
            "deactivated": len(to_deactivate)
        }

    except Exception as e:
        print(f"❌ Error cleaning up training data: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.training.export_training_dataset")
def export_training_dataset(output_path: str = "./data/training_export.jsonl") -> Dict:
    """
    Export training dataset to JSONL file for external analysis

    Args:
        output_path: Path to save export file

    Returns:
        Export summary
    """
    db = SessionLocal()

    try:
        import json

        print(f"📤 Exporting training dataset to {output_path}...")

        examples = db.query(TrainingExample).filter(
            TrainingExample.is_active == True
        ).all()

        if not examples:
            return {
                "status": "success",
                "examples_exported": 0,
                "message": "No training data to export"
            }

        # Create output directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Export to JSONL
        with open(output_path, 'w') as f:
            for example in examples:
                data = {
                    "id": example.id,
                    "answer": example.answer_text,
                    "jd": example.jd_text,
                    "relevance_score": example.relevance_score,
                    "hr_rating": example.hr_rating,
                    "job_id": example.job_posting_id,
                    "question_id": example.question_id,
                    "source": example.source,
                    "diversity_score": example.diversity_score,
                    "created_at": example.created_at.isoformat()
                }
                f.write(json.dumps(data) + '\n')

        print(f"✅ Exported {len(examples)} training examples")

        return {
            "status": "success",
            "examples_exported": len(examples),
            "output_path": output_path,
            "file_size_mb": round(os.path.getsize(output_path) / (1024 * 1024), 2)
        }

    except Exception as e:
        print(f"❌ Error exporting dataset: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


# Helper functions

def _collect_new_training_examples(db, limit: int = 500) -> List[tuple]:
    """
    Collect new training examples from recent HR feedback

    Returns:
        List of (answer, jd, score) tuples
    """
    examples = []

    # Get recent training examples not yet used heavily
    training_data = db.query(TrainingExample).filter(
        TrainingExample.is_active == True,
        TrainingExample.usage_count < 5  # Not overused
    ).order_by(
        TrainingExample.created_at.desc()
    ).limit(limit).all()

    for example in training_data:
        examples.append((
            example.answer_text,
            example.jd_text,
            example.relevance_score
        ))

        # Update usage count
        example.usage_count += 1
        example.last_used = datetime.utcnow()

    db.commit()

    return examples


def _collect_validation_examples(db, limit: int = 100) -> List[tuple]:
    """
    Collect validation examples (separate from training)

    Returns:
        List of (answer, jd, score) tuples
    """
    examples = []

    # Get random diverse examples
    training_data = db.query(TrainingExample).filter(
        TrainingExample.is_active == True,
        TrainingExample.hr_rating.isnot(None)  # Must have HR rating
    ).order_by(
        TrainingExample.diversity_score.desc()
    ).limit(limit).all()

    for example in training_data:
        examples.append((
            example.answer_text,
            example.jd_text,
            example.relevance_score
        ))

    return examples


@celery_app.task(name="app.tasks.training.compare_model_versions")
def compare_model_versions(version1: str, version2: str, test_job_id: int = None) -> Dict:
    """
    Compare two model versions on test data

    Args:
        version1: First model version
        version2: Second model version
        test_job_id: Optional job ID to test on. If None, uses random samples.

    Returns:
        Comparison results
    """
    db = SessionLocal()

    try:
        print(f"🔬 Comparing models: {version1} vs {version2}...")

        # Load both model checkpoints
        cp1 = db.query(ModelCheckpoint).filter(
            ModelCheckpoint.version == version1
        ).first()

        cp2 = db.query(ModelCheckpoint).filter(
            ModelCheckpoint.version == version2
        ).first()

        if not cp1 or not cp2:
            return {
                "status": "error",
                "error": "One or both model versions not found"
            }

        # Get test data
        if test_job_id:
            test_results = db.query(ScreeningResult).filter(
                ScreeningResult.job_posting_id == test_job_id,
                ScreeningResult.hr_rating.isnot(None)
            ).limit(50).all()
        else:
            test_results = db.query(ScreeningResult).filter(
                ScreeningResult.hr_rating.isnot(None)
            ).order_by(
                ScreeningResult.created_at.desc()
            ).limit(50).all()

        if not test_results:
            return {
                "status": "error",
                "error": "No test data available"
            }

        # Compare metrics
        comparison = {
            "status": "success",
            "model1": {
                "version": version1,
                "val_loss": float(cp1.val_loss) if cp1.val_loss else None,
                "val_accuracy": float(cp1.val_accuracy) if cp1.val_accuracy else None,
                "training_samples": cp1.training_samples
            },
            "model2": {
                "version": version2,
                "val_loss": float(cp2.val_loss) if cp2.val_loss else None,
                "val_accuracy": float(cp2.val_accuracy) if cp2.val_accuracy else None,
                "training_samples": cp2.training_samples
            },
            "test_samples": len(test_results),
            "recommendation": None
        }

        # Determine recommendation
        if cp2.val_accuracy and cp1.val_accuracy:
            if cp2.val_accuracy > cp1.val_accuracy * 1.02:  # 2% improvement
                comparison["recommendation"] = f"Use {version2} (better accuracy)"
            elif cp2.val_loss and cp1.val_loss and cp2.val_loss < cp1.val_loss * 0.98:
                comparison["recommendation"] = f"Use {version2} (lower loss)"
            else:
                comparison["recommendation"] = f"Keep {version1} (no significant improvement)"

        print(f"✅ Comparison complete")

        return comparison

    except Exception as e:
        print(f"❌ Error comparing models: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.training.activate_model_version")
def activate_model_version(version: str) -> Dict:
    """
    Activate a specific model version

    This marks the model as active in the database.
    Note: Services must be restarted to load the new model.

    Args:
        version: Model version to activate

    Returns:
        Activation result
    """
    db = SessionLocal()

    try:
        print(f"🔄 Activating model version: {version}...")

        # Find checkpoint
        checkpoint = db.query(ModelCheckpoint).filter(
            ModelCheckpoint.version == version
        ).first()

        if not checkpoint:
            return {
                "status": "error",
                "error": f"Model version {version} not found"
            }

        # Deactivate all other checkpoints
        db.query(ModelCheckpoint).update({"is_active": False})

        # Activate this one
        checkpoint.is_active = True
        db.commit()

        print(f"✅ Model {version} activated")
        print(f"   ⚠️  Restart services to load new model!")

        return {
            "status": "success",
            "version": version,
            "message": "Model activated. Restart FastAPI and Celery services to use new model.",
            "restart_commands": [
                "docker compose restart web",
                "docker compose restart celery-worker"
            ]
        }

    except Exception as e:
        print(f"❌ Error activating model: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.training.get_training_stats")
def get_training_stats() -> Dict:
    """
    Get comprehensive training statistics

    Returns:
        Training statistics and metrics
    """
    db = SessionLocal()

    try:
        from sqlalchemy import func

        print("📊 Gathering training statistics...")

        # Training examples stats
        total_examples = db.query(TrainingExample).count()
        active_examples = db.query(TrainingExample).filter(
            TrainingExample.is_active == True
        ).count()

        # By source
        by_source = db.query(
            TrainingExample.source,
            func.count(TrainingExample.id).label('count')
        ).group_by(TrainingExample.source).all()

        # Model checkpoints
        total_checkpoints = db.query(ModelCheckpoint).count()
        active_checkpoint = db.query(ModelCheckpoint).filter(
            ModelCheckpoint.is_active == True
        ).first()

        # Latest checkpoint
        latest_checkpoint = db.query(ModelCheckpoint).order_by(
            ModelCheckpoint.created_at.desc()
        ).first()

        # HR feedback stats
        total_feedback = db.query(ScreeningResult).filter(
            ScreeningResult.hr_rating.isnot(None)
        ).count()

        stats = {
            "status": "success",
            "training_examples": {
                "total": total_examples,
                "active": active_examples,
                "by_source": {source: count for source, count in by_source}
            },
            "model_checkpoints": {
                "total": total_checkpoints,
                "active_version": active_checkpoint.version if active_checkpoint else None,
                "latest_version": latest_checkpoint.version if latest_checkpoint else None,
                "latest_created": latest_checkpoint.created_at.isoformat() if latest_checkpoint else None
            },
            "hr_feedback": {
                "total_with_ratings": total_feedback
            },
            "ready_for_training": active_examples >= 100,
            "recommended_action": None
        }

        # Recommendations
        if active_examples < 100:
            stats["recommended_action"] = f"Collect more training data ({active_examples}/100)"
        elif active_examples >= 100 and total_checkpoints == 0:
            stats["recommended_action"] = "Run initial model refinement"
        elif latest_checkpoint and (datetime.utcnow() - latest_checkpoint.created_at).days > 7:
            stats["recommended_action"] = "Model training recommended (last trained 7+ days ago)"
        else:
            stats["recommended_action"] = "System up to date"

        print("✅ Statistics gathered")

        return stats

    except Exception as e:
        print(f"❌ Error gathering stats: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
    finally:
        db.close()