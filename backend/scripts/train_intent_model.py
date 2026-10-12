import sys
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.services.preprocessing import clean_for_vectorizer

def train_model() -> None:
    print("=== [VoiceBridge] Training Intent Classifier ===")
    
    if not settings.INTENT_EXAMPLES_FILE.exists():
        print(f"[FAIL] Error: {settings.INTENT_EXAMPLES_FILE} does not exist.")
        sys.exit(1)

    df = pd.read_csv(settings.INTENT_EXAMPLES_FILE).dropna(subset=["text", "intent"])
    print(f"Total labeled examples: {len(df)}")
    print(f"Class distribution:\n{df['intent'].value_counts()}\n")

    # Clean text for vectorizer
    df["cleaned_text"] = df["text"].apply(clean_for_vectorizer)

    # Stratified train/test split (75% train, 25% test) with reproducible seed
    random_seed = 42
    train_df, test_df = train_test_split(
        df,
        test_size=0.25,
        random_state=random_seed,
        stratify=df["intent"]
    )

    print(f"Training split: {len(train_df)} samples")
    print(f"Held-out test split: {len(test_df)} samples")

    # Fit scikit-learn pipeline ONLY on training examples (Strictly avoid data leakage)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True
        )),
        ("clf", LogisticRegression(
            C=1.0,
            max_iter=1000,
            random_state=random_seed,
            class_weight="balanced"
        ))
    ])

    pipeline.fit(train_df["cleaned_text"], train_df["intent"])
    classes = list(pipeline.classes_)

    # Save model artifact
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_payload = {
        "pipeline": pipeline,
        "classes": classes,
        "random_seed": random_seed,
        "train_samples": len(train_df),
        "test_samples": len(test_df)
    }
    joblib.dump(model_payload, settings.INTENT_MODEL_FILE)
    print(f"[OK] Trained model saved to: {settings.INTENT_MODEL_FILE}")

    # Save held-out test split for strict evaluation
    settings.EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    test_split_path = settings.EVALUATION_DIR / "test_split.csv"
    test_df.to_csv(test_split_path, index=False)
    print(f"[OK] Held-out test split saved to: {test_split_path}")

if __name__ == "__main__":
    train_model()
