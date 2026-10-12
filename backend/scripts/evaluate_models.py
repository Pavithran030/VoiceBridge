import json
import sys
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.services.preprocessing import clean_for_vectorizer
from app.services.faq_retriever import FaqRetriever

def evaluate():
    print("=== [VoiceBridge] Evaluating Models on Held-out Test Data ===")

    test_split_path = settings.EVALUATION_DIR / "test_split.csv"
    if not test_split_path.exists() or not settings.INTENT_MODEL_FILE.exists():
        print("[FAIL] Error: Missing test split or trained model file. Run train_intent_model.py first.")
        sys.exit(1)

    # 1. Evaluate Intent Classifier
    test_df = pd.read_csv(test_split_path)
    model_data = joblib.load(settings.INTENT_MODEL_FILE)
    pipeline = model_data["pipeline"]
    classes = model_data["classes"]

    y_true = test_df["intent"].tolist()
    X_test = [clean_for_vectorizer(t) for t in test_df["text"].tolist()]
    y_pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)

    clf_report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=classes)

    print(f"Accuracy:        {acc:.4f} ({acc*100:.2f}%)")
    print(f"Macro Precision: {p_macro:.4f}")
    print(f"Macro Recall:    {r_macro:.4f}")
    print(f"Macro F1-Score:  {f1_macro:.4f}\n")

    # 2. Evaluate FAQ Retrieval Top-1 Accuracy
    retrieval_acc = 0.0
    retrieval_total = 0
    retrieval_correct = 0

    if settings.RETRIEVAL_TEST_FILE.exists():
        retrieval_df = pd.read_csv(settings.RETRIEVAL_TEST_FILE)
        retriever = FaqRetriever()
        retrieval_total = len(retrieval_df)
        
        for _, row in retrieval_df.iterrows():
            q = str(row["query"])
            expected = str(row["expected_faq_id"])
            top_faq, score = retriever.retrieve(q)
            if top_faq and top_faq.get("faq_id") == expected:
                retrieval_correct += 1

        retrieval_acc = float(retrieval_correct / retrieval_total) if retrieval_total > 0 else 0.0
        print(f"FAQ Retrieval Top-1 Accuracy: {retrieval_correct}/{retrieval_total} ({retrieval_acc*100:.2f}%)")

    # Class sample counts in overall dataset
    df_all = pd.read_csv(settings.INTENT_EXAMPLES_FILE)
    class_counts = df_all["intent"].value_counts().to_dict()

    evaluation_payload = {
        "generated": True,
        "dataset_info": {
            "total_samples": len(df_all),
            "train_samples": model_data.get("train_samples", len(df_all) - len(test_df)),
            "test_samples": len(test_df),
            "random_seed": model_data.get("random_seed", 42),
            "class_counts": class_counts
        },
        "overall_metrics": {
            "accuracy": round(acc, 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "macro_f1": round(float(f1_macro), 4)
        },
        "classification_report": clf_report,
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm.tolist()
        },
        "retrieval_metrics": {
            "total_test_cases": retrieval_total,
            "correct_count": retrieval_correct,
            "top1_accuracy": round(retrieval_acc, 4)
        }
    }

    settings.EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    with open(settings.EVALUATION_METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(evaluation_payload, f, indent=2)

    print(f"\n[OK] True evaluation metrics written to: {settings.EVALUATION_METRICS_FILE}")

if __name__ == "__main__":
    evaluate()
