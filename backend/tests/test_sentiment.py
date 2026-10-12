import pytest
from app.services.sentiment import analyze_sentiment

def test_positive_sentiment():
    res = analyze_sentiment("Thank you so much, this is great and helpful!")
    assert res.label == "positive"
    assert res.score > 0.0

def test_negative_sentiment():
    res = analyze_sentiment("The hostel food is terrible and broken equipment everywhere.")
    assert res.label == "negative"
    assert res.score < 0.0

def test_neutral_sentiment():
    res = analyze_sentiment("What time does the lecture start?")
    assert res.label == "neutral"

def test_empty_sentiment():
    res = analyze_sentiment("")
    assert res.label == "neutral"
    assert res.score == 0.0
