from typing import Optional, Dict, Any, List, Tuple
from ..config import settings
from ..schemas.query import QueryResult, FaqMatch, SentimentResult, EntityItem

def evaluate_decision_policy(
    original_text: str,
    normalized_text: str,
    predicted_intent: str,
    intent_confidence: float,
    faq_match_dict: Optional[Dict[str, Any]],
    faq_similarity: float,
    sentiment: SentimentResult,
    entities: List[EntityItem],
) -> QueryResult:
    """
    Dual confidence-aware decision policy:
    1. Classifier confidence and FAQ relevance are evaluated independently.
    2. High classifier confidence cannot override an irrelevant FAQ match.
    3. Low similarity leads to safe no-answer fallback.
    4. Ambiguity / conflict triggers clarification rather than a guess.
    """
    suggestions: List[str] = []

    # Case 1: Empty or whitespace query
    if not normalized_text:
        return QueryResult(
            status="no_answer",
            original_text=original_text,
            normalized_text=normalized_text,
            predicted_intent="other",
            intent_confidence=0.0,
            entities=[],
            sentiment=sentiment,
            faq_match=None,
            answer=None,
            explanation="The provided question was empty or contained no readable text.",
            suggestions=["Ask about admissions", "Check exam schedule", "Ask about hostel facilities"]
        )

    # Prepare FaqMatch object if match exists
    faq_match_obj: Optional[FaqMatch] = None
    if faq_match_dict:
        faq_match_obj = FaqMatch(
            faq_id=faq_match_dict.get("faq_id", "UNKNOWN"),
            intent=faq_match_dict.get("intent", "other"),
            similarity=round(faq_similarity, 4),
            question=faq_match_dict.get("question", ""),
            office_or_category=faq_match_dict.get("office_or_category", "")
        )

    # Case 2: Out of scope or completely irrelevant FAQ match (Similarity below threshold)
    if faq_similarity < settings.FAQ_SIMILARITY_THRESHOLD or not faq_match_dict:
        suggestions = [
            "How do I apply for B.Tech admission?",
            "When will semester exams begin?",
            "How can I contact the administration office?"
        ]
        return QueryResult(
            status="no_answer",
            original_text=original_text,
            normalized_text=normalized_text,
            predicted_intent=predicted_intent,
            intent_confidence=intent_confidence,
            entities=entities,
            sentiment=sentiment,
            faq_match=faq_match_obj,
            answer=None,
            explanation=f"Relevance score ({round(faq_similarity*100, 1)}%) is below the configured threshold ({round(settings.FAQ_SIMILARITY_THRESHOLD*100, 1)}%). To prevent inaccurate answers, please consult the respective college office or rephrase.",
            suggestions=suggestions
        )

    faq_intent = faq_match_dict.get("intent", "")

    # Case 3: Low Intent Confidence (Ambiguous query)
    if intent_confidence < settings.INTENT_CONFIDENCE_THRESHOLD:
        suggestions = [
            f"Are you asking about {predicted_intent.replace('_', ' ')}?",
            f"Or did you mean {faq_intent.replace('_', ' ')}?",
            "Please rephrase with more specific campus keywords."
        ]
        return QueryResult(
            status="clarification_needed",
            original_text=original_text,
            normalized_text=normalized_text,
            predicted_intent=predicted_intent,
            intent_confidence=intent_confidence,
            entities=entities,
            sentiment=sentiment,
            faq_match=faq_match_obj,
            answer=None,
            explanation=f"Query intent confidence ({round(intent_confidence*100, 1)}%) is below the confidence threshold ({round(settings.INTENT_CONFIDENCE_THRESHOLD*100, 1)}%). The system detected multiple possible topics.",
            suggestions=suggestions
        )

    # Case 4: Material conflict between predicted intent and top FAQ category
    # (Except when intent is greeting or goodbye which are general intents)
    conflict_intents = {"greeting", "goodbye", "other"}
    if (predicted_intent not in conflict_intents and 
        faq_intent not in conflict_intents and 
        predicted_intent != faq_intent and 
        faq_similarity < 0.55):
        suggestions = [
            f"Clarify: Help regarding {predicted_intent.replace('_', ' ')}",
            f"Clarify: Help regarding {faq_intent.replace('_', ' ')}"
        ]
        return QueryResult(
            status="clarification_needed",
            original_text=original_text,
            normalized_text=normalized_text,
            predicted_intent=predicted_intent,
            intent_confidence=intent_confidence,
            entities=entities,
            sentiment=sentiment,
            faq_match=faq_match_obj,
            answer=None,
            explanation=f"Potential topic conflict: The question looks like '{predicted_intent.replace('_', ' ')}', but the closest FAQ match belongs to '{faq_intent.replace('_', ' ')}'. Please select or rephrase.",
            suggestions=suggestions
        )

    # Case 5: Satisfied both thresholds - Answered
    answer_text = faq_match_dict.get("answer", "")
    
    # If negative sentiment or complaint intent, append advice
    if sentiment.label == "negative" or predicted_intent == "complaint":
        explanation = f"Matched campus FAQ ({faq_match_dict.get('faq_id')}) with {round(faq_similarity*100, 1)}% relevance and {round(intent_confidence*100, 1)}% intent confidence. Notice: Grievances can be submitted through the official Grievance Redressal desk."
    else:
        explanation = f"Matched campus FAQ ({faq_match_dict.get('faq_id')}) with {round(faq_similarity*100, 1)}% relevance and {round(intent_confidence*100, 1)}% intent confidence."

    # Contextual follow-up suggestions
    office = faq_match_dict.get("office_or_category", "")
    suggestions = [
        f"Contact {office} for verified updates" if office else "Contact Administration",
        f"More details on {faq_intent.replace('_', ' ')}"
    ]

    return QueryResult(
        status="answered",
        original_text=original_text,
        normalized_text=normalized_text,
        predicted_intent=predicted_intent,
        intent_confidence=intent_confidence,
        entities=entities,
        sentiment=sentiment,
        faq_match=faq_match_obj,
        answer=answer_text,
        explanation=explanation,
        suggestions=suggestions
    )
