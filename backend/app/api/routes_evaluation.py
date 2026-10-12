import json
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation"])

@router.get("")
def get_evaluation_metrics():
    """
    Returns true held-out evaluation results from intent_metrics.json.
    If evaluation has not yet been executed, returns generated=False with instructions.
    """
    metrics_file = settings.EVALUATION_METRICS_FILE
    if not metrics_file.exists():
        return {
            "generated": False,
            "message": "Model evaluation has not yet been generated. Please run 'python scripts/evaluate_models.py' in the backend terminal."
        }

    try:
        with open(metrics_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {
            "generated": False,
            "message": f"Could not read evaluation file: {str(e)}"
        }
