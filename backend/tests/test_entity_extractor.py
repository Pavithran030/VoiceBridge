import pytest
from app.services.entity_extractor import extract_entities

def test_extract_department_and_semester():
    text = "Can 3rd semester CSE students change their branch?"
    entities = extract_entities(text)
    labels = [e.label for e in entities]
    texts = [e.text.lower() for e in entities]
    
    assert "semester" in labels
    assert "department_course" in labels
    assert "3rd semester" in texts
    assert "cse" in texts

def test_extract_services_and_offices():
    text = "Where is the library and how do I contact the warden?"
    entities = extract_entities(text)
    labels = [e.label for e in entities]
    
    assert "service" in labels
    assert "office" in labels

def test_empty_entities():
    assert extract_entities("") == []
