import pytest
from app.services.query_service import process_query

def test_process_query_admission():
    result = process_query("How can I apply for undergraduate admissions?", input_mode="text")
    assert result.status in ("answered", "clarification_needed")
    assert result.predicted_intent in ("admission", "other")
    assert result.sentiment is not None

def test_process_query_empty():
    result = process_query("", input_mode="text")
    assert result.status == "no_answer"
    assert result.answer is None

def test_process_query_irrelevant():
    result = process_query("Can you solve a calculus differential equation for spaceship?", input_mode="text")
    assert result.status in ("no_answer", "clarification_needed")
