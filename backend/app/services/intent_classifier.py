import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from ..config import settings
from .preprocessing import clean_for_vectorizer

class IntentClassifier:
    """
    TF-IDF + LogisticRegression Intent Classifier.
    Predicts intent category and returns classifier confidence score.
    """
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or settings.INTENT_MODEL_FILE
        self.pipeline: Optional[Pipeline] = None
        self.classes: list[str] = []
        self._load_or_train()

    def _load_or_train(self) -> None:
        """Load trained pipeline from disk or perform fallback training on start."""
        if self.model_path.exists():
            try:
                data = joblib.load(self.model_path)
                self.pipeline = data["pipeline"]
                self.classes = data["classes"]
                return
            except Exception as e:
                print(f"[IntentClassifier] Warning: Could not load saved model ({e}). Re-training...")

        # Fallback train if file is missing
        if settings.INTENT_EXAMPLES_FILE.exists():
            self.train_and_save(settings.INTENT_EXAMPLES_FILE, self.model_path)
        else:
            print("[IntentClassifier] Error: Training data file missing!")

    def train_and_save(self, data_path: Path, output_path: Path) -> Dict[str, Any]:
        """Train pipeline on dataset and save artifact."""
        df = pd.read_csv(data_path)
        df = df.dropna(subset=["text", "intent"])
        
        texts = [clean_for_vectorizer(t) for t in df["text"].tolist()]
        labels = df["intent"].tolist()

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True
            )),
            ("clf", LogisticRegression(
                C=1.0,
                max_iter=1000,
                random_state=42,
                class_weight="balanced"
            ))
        ])

        pipeline.fit(texts, labels)
        classes = list(pipeline.classes_)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"pipeline": pipeline, "classes": classes}, output_path)

        self.pipeline = pipeline
        self.classes = classes
        return {"status": "trained", "classes_count": len(classes), "samples_count": len(texts)}

    def predict(self, text: str) -> Tuple[str, float]:
        """
        Predict intent and return (predicted_intent, confidence_score).
        Confidence score is the maximum predicted probability across classes.
        """
        if not self.pipeline:
            return "other", 0.0

        cleaned = clean_for_vectorizer(text)
        if not cleaned:
            return "other", 0.0

        probs = self.pipeline.predict_proba([cleaned])[0]
        max_idx = probs.argmax()
        predicted_class = self.classes[max_idx]
        confidence = float(probs[max_idx])

        return predicted_class, round(confidence, 4)

_classifier_instance: Optional[IntentClassifier] = None

def get_intent_classifier() -> IntentClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = IntentClassifier()
    return _classifier_instance
