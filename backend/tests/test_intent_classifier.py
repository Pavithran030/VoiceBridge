import pytest
from app.services.intent_classifier import get_intent_classifier

def test_intent_prediction():
    classifier = get_intent_classifier()
    intent, confidence = classifier.predict("how to pay semester tuition fees online")
    
    assert intent in classifier.classes
    assert 0.0 <= confidence <= 1.0
    assert intent == "fees"

def test_greeting_intent():
    classifier = get_intent_classifier()
    intent, confidence = classifier.predict("hello good morning voicebridge")
    
    assert intent == "greeting"
    assert confidence > 0.3

def test_empty_query_fallback():
    classifier = get_intent_classifier()
    intent, confidence = classifier.predict("")
    assert intent == "other"
    assert confidence == 0.0
