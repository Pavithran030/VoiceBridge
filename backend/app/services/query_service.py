from ..schemas.query import QueryResult
from .preprocessing import normalize_text
from .intent_classifier import get_intent_classifier
from .faq_retriever import get_faq_retriever
from .entity_extractor import extract_entities
from .sentiment import analyze_sentiment
from .decision_policy import evaluate_decision_policy
from .analytics_store import get_analytics_store

def process_query(text: str, input_mode: str = "text") -> QueryResult:
    """
    Unified query processing pipeline:
    1. Normalizes text
    2. Runs intent classification
    3. Extracts named entities
    4. Analyzes sentiment
    5. Retrieves candidate FAQ via TF-IDF cosine similarity
    6. Executes dual-confidence decision policy
    7. Logs metadata into local analytics store
    """
    original_text = text or ""
    normalized = normalize_text(original_text)

    # 1. Intent Classification
    classifier = get_intent_classifier()
    predicted_intent, intent_confidence = classifier.predict(normalized)

    # 2. Named Entity Recognition
    entities = extract_entities(original_text)

    # 3. Sentiment Analysis
    sentiment = analyze_sentiment(original_text)

    # 4. FAQ Retrieval
    retriever = get_faq_retriever()
    matched_faq, faq_similarity = retriever.retrieve(normalized)

    # 5. Dual-Confidence Decision Policy
    result = evaluate_decision_policy(
        original_text=original_text,
        normalized_text=normalized,
        predicted_intent=predicted_intent,
        intent_confidence=intent_confidence,
        faq_match_dict=matched_faq,
        faq_similarity=faq_similarity,
        sentiment=sentiment,
        entities=entities
    )

    # 6. Log event metadata (no raw query stored)
    analytics = get_analytics_store()
    analytics.log_event(
        input_mode=input_mode,
        predicted_intent=result.predicted_intent,
        intent_confidence=result.intent_confidence,
        faq_similarity=result.faq_match.similarity if result.faq_match else 0.0,
        status=result.status,
        sentiment_label=result.sentiment.label
    )

    return result
