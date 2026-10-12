import sys
from pathlib import Path
import pandas as pd

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings

def validate_datasets() -> bool:
    print("=== [VoiceBridge] Dataset Validation ===")
    has_errors = False

    # 1. Validate intent_examples.csv
    intent_file = settings.INTENT_EXAMPLES_FILE
    if not intent_file.exists():
        print(f"❌ Error: {intent_file} not found!")
        return False

    df_intents = pd.read_csv(intent_file)
    print(f"Checking {intent_file.name} ({len(df_intents)} rows)...")

    expected_intent_cols = {"text", "intent"}
    if not expected_intent_cols.issubset(df_intents.columns):
        print(f"❌ Error: Missing columns in intent_examples. Expected {expected_intent_cols}, found {df_intents.columns}")
        has_errors = True

    null_intents = df_intents[df_intents["text"].isna() | df_intents["intent"].isna()]
    if not null_intents.empty:
        print(f"❌ Error: Found {len(null_intents)} null or missing values in intent_examples.")
        has_errors = True

    unique_intents = set(df_intents["intent"].unique())
    print(f"Found {len(unique_intents)} distinct intent labels: {sorted(list(unique_intents))}")

    # Check class sample distribution
    counts = df_intents["intent"].value_counts()
    for intent, count in counts.items():
        if count < 5:
            print(f"⚠️ Warning: Intent '{intent}' has only {count} examples (recommend >= 10).")

    # 2. Validate faq.csv
    faq_file = settings.FAQ_FILE
    if not faq_file.exists():
        print(f"❌ Error: {faq_file} not found!")
        return False

    df_faq = pd.read_csv(faq_file)
    print(f"\nChecking {faq_file.name} ({len(df_faq)} records)...")
    expected_faq_cols = {"faq_id", "intent", "question", "answer", "keywords", "office_or_category"}
    if not expected_faq_cols.issubset(df_faq.columns):
        print(f"❌ Error: Missing columns in faq.csv. Expected {expected_faq_cols}, found {df_faq.columns}")
        has_errors = True

    # Check for duplicate faq_ids
    dups = df_faq[df_faq.duplicated(subset=["faq_id"])]
    if not dups.empty:
        print(f"❌ Error: Duplicate faq_id found: {dups['faq_id'].tolist()}")
        has_errors = True

    # Check unknown intents in FAQ
    faq_intents = set(df_faq["intent"].unique())
    unknown_faq_intents = faq_intents - unique_intents
    if unknown_faq_intents:
        print(f"⚠️ Warning: FAQs reference intents not in training set: {unknown_faq_intents}")

    # 3. Validate retrieval_test_cases.csv
    test_file = settings.RETRIEVAL_TEST_FILE
    if not test_file.exists():
        print(f"❌ Error: {test_file} not found!")
        return False

    df_test = pd.read_csv(test_file)
    print(f"\nChecking {test_file.name} ({len(df_test)} test cases)...")
    if not {"query", "expected_faq_id"}.issubset(df_test.columns):
        print("❌ Error: Missing required columns in retrieval test cases.")
        has_errors = True

    existing_faqs = set(df_faq["faq_id"].unique())
    unknown_tests = df_test[~df_test["expected_faq_id"].isin(existing_faqs)]
    if not unknown_tests.empty:
        print(f"❌ Error: Test cases reference non-existent faq_ids: {unknown_tests['expected_faq_id'].tolist()}")
        has_errors = True

    if not has_errors:
        print("\n[OK] All datasets validated successfully! No schema or reference errors.")
        return True
    else:
        print("\n[FAIL] Dataset validation completed with errors.")
        return False

if __name__ == "__main__":
    success = validate_datasets()
    sys.exit(0 if success else 1)
