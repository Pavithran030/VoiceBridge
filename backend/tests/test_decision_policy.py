import pytest
from app.services.decision_policy import evaluate_decision_policy
from app.schemas.query import SentimentResult, EntityItem

def test_answered_policy():
    faq = {
        "faq_id": "FAQ-ADM-01",
        "intent": "admission",
        "question": "What is the admission procedure?",
        "answer": "Apply online at portal.",
        "office_or_category": "Admissions Office"
    }
    res = evaluate_decision_policy(
        original_text="How to apply for admission?",
        normalized_text="how to apply for admission?",
        predicted_intent="admission",
        intent_confidence=0.85,
        faq_match_dict=faq,
        faq_similarity=0.78,
        sentiment=SentimentResult(label="neutral", score=0.0, method="vader"),
        entities=[]
    )
    assert res.status == "answered"
    assert res.answer == "Apply online at portal."
    assert res.faq_match is not None

def test_no_answer_policy_low_similarity():
    faq = {
        "faq_id": "FAQ-FEE-01",
        "intent": "fees",
        "question": "How to pay fees?",
        "answer": "Pay at counter",
        "office_or_category": "Finance"
    }
    res = evaluate_decision_policy(
        original_text="What is the distance to the moon?",
        normalized_text="what is the distance to the moon?",
        predicted_intent="other",
        intent_confidence=0.9,
        faq_match_dict=faq,
        faq_similarity=0.12,  # Way below threshold 0.30
        sentiment=SentimentResult(label="neutral", score=0.0, method="vader"),
        entities=[]
    )
    assert res.status == "no_answer"
    assert res.answer is None

def test_clarification_policy_low_confidence():
    faq = {
        "faq_id": "FAQ-TIME-01",
        "intent": "timetable",
        "question": "Where is the timetable?",
        "answer": "On portal",
        "office_or_category": "Academics"
    }
    res = evaluate_decision_policy(
        original_text="Tell me about hours",
        normalized_text="tell me about hours",
        predicted_intent="timetable",
        intent_confidence=0.08,  # Below calibrated threshold 0.15
        faq_match_dict=faq,
        faq_similarity=0.60,
        sentiment=SentimentResult(label="neutral", score=0.0, method="vader"),
        entities=[]
    )
    assert res.status == "clarification_needed"
    assert res.answer is None
