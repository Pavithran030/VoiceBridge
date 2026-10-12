import pytest
from app.services.faq_retriever import get_faq_retriever

def test_faq_retrieval_admission():
    retriever = get_faq_retriever()
    faq, score = retriever.retrieve("when is the last date to apply for admission?")
    
    assert faq is not None
    assert faq["faq_id"] == "FAQ-ADM-02"
    assert 0.0 <= score <= 1.0
    assert score > 0.4

def test_faq_retrieval_empty():
    retriever = get_faq_retriever()
    faq, score = retriever.retrieve("")
    assert faq is None
    assert score == 0.0

def test_unrelated_query_has_low_score():
    retriever = get_faq_retriever()
    faq, score = retriever.retrieve("how do I make a chocolate cake with strawberries?")
    # Similarity should be low or zero
    assert score < 0.35
