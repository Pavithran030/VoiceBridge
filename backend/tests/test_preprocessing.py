import pytest
from app.services.preprocessing import normalize_text, expand_contractions, clean_for_vectorizer

def test_empty_and_whitespace():
    assert normalize_text("") == ""
    assert normalize_text("   ") == ""
    assert clean_for_vectorizer("") == ""

def test_contraction_expansion():
    expanded = expand_contractions("I don't know and can't find it")
    assert "do not" in expanded
    assert "cannot" in expanded

def test_preserves_negation():
    norm = normalize_text("The bus is not coming and there is no service")
    assert "not" in norm
    assert "no" in norm

def test_mixed_case_and_spacing():
    norm = normalize_text("  WHERE  can I   Pay FEes?  ")
    assert norm == "where can i pay fees?"

def test_numbers_and_punctuation():
    norm = normalize_text("Semester 4 exam on 12-10-2026 for B.Tech CSE")
    assert "4" in norm
    assert "12-10-2026" in norm
    assert "b.tech" in norm
