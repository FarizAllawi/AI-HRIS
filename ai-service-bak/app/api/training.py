from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.training_data import TrainingExample, ModelCheckpoint
from app.tasks.training import refine_model_async
from typing import Optional

router = APIRouter()


@router.post("/refine")
def trigger_model_refinement(
        epochs: int = 3,
        batch_size: int = 16,
        db: Session = Depends(get_db)
):
    """
    Trigger model refinement using collected HR feedback
    """
    # Check if we have enough training data
    training_count = db.query(TrainingExample).filter(
        TrainingExample.is_active == True
    ).count()

    if training_count < 100:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough training data. Have {training_count}, need at least 100."
        )

    # Trigger async refinement
    task = refine_model_async.delay(epochs, batch_size)

    return {
        "status": "processing",
        "task_id": task.id,
        "training_samples": training_count,
        "message": "Model refinement started in background"
    }


@router.get("/training-data/stats")
def get_training_data_stats(db: Session = Depends(get_db)):
    """Get statistics about collected training data"""

    total = db.query(TrainingExample).count()
    active = db.query(TrainingExample).filter(
        TrainingExample.is_active == True
    ).count()

    by_source = db.query(
        TrainingExample.source,
        db.func.count(TrainingExample.id)
    ).group_by(TrainingExample.source).all()

    return {
        "total_examples": total,
        "active_examples": active,
        "by_source": {source: count for source, count in by_source},
        "ready_for_training": active >= 100
    }


@router.get("/models")
def list_model_checkpoints(
        limit: int = 10,
        db: Session = Depends(get_db)
):
    """List all model checkpoints"""

    checkpoints = db.query(ModelCheckpoint).order_by(
        ModelCheckpoint.created_at.desc()
    ).limit(limit).all()

    return {
        "checkpoints": [
            {
                "id": c.id,
                "version": c.version,
                "training_samples": c.training_samples,
                "val_loss": c.val_loss,
                "val_accuracy": c.val_accuracy,
                "is_active": c.is_active,
                "created_at": c.created_at,
                "notes": c.notes
            }
            for c in checkpoints
        ]
    }


@router.get("/models/{version}")
def get_model_checkpoint(
        version: str,
        db: Session = Depends(get_db)
):
    """Get specific model checkpoint details"""

    checkpoint = db.query(ModelCheckpoint).filter(
        ModelCheckpoint.version == version
    ).first()

    if not checkpoint:
        raise HTTPException(status_code=404, detail="Model checkpoint not found")

    return {
        "id": checkpoint.id,
        "version": checkpoint.version,
        "path": checkpoint.path,
        "training_samples": checkpoint.training_samples,
        "val_loss": checkpoint.val_loss,
        "val_accuracy": checkpoint.val_accuracy,
        "config": checkpoint.config,
        "is_active": checkpoint.is_active,
        "created_at": checkpoint.created_at,
        "notes": checkpoint.notes
    }


@router.post("/models/{version}/activate")
def activate_model_checkpoint(
        version: str,
        db: Session = Depends(get_db)
):
    """Activate a specific model checkpoint"""

    checkpoint = db.query(ModelCheckpoint).filter(
        ModelCheckpoint.version == version
    ).first()

    if not checkpoint:
        raise HTTPException(status_code=404, detail="Model checkpoint not found")

    # Deactivate all other checkpoints
    db.query(ModelCheckpoint).update({"is_active": False})

    # Activate this one
    checkpoint.is_active = True
    db.commit()

    return {
        "status": "success",
        "version": version,
        "message": f"Model {version} activated. Restart services to use new model."
    }


@router.delete("/training-data/old")
def cleanup_old_training_data(
        keep_count: int = 10000,
        db: Session = Depends(get_db)
):
    """
    Clean up old training data, keeping only the most recent/diverse samples
    """
    # Get all training examples ordered by diversity and recency
    examples = db.query(TrainingExample).order_by(
        TrainingExample.diversity_score.desc(),
        TrainingExample.created_at.desc()
    ).all()

    if len(examples) <= keep_count:
        return {
            "status": "success",
            "message": f"No cleanup needed. Have {len(examples)} examples, keeping {keep_count}."
        }

    # Mark old examples as inactive
    to_deactivate = examples[keep_count:]
    for example in to_deactivate:
        example.is_active = False

    db.commit()

    return {
        "status": "success",
        "total_examples": len(examples),
        "kept": keep_count,
        "deactivated": len(to_deactivate),
        "message": f"Cleaned up {len(to_deactivate)} old training examples"
    }