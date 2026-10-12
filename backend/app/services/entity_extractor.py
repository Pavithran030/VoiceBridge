import re
from typing import List, Dict, Any
from ..schemas.query import EntityItem

# Campus entity keyword dictionary with patterns and labels
CAMPUS_PATTERNS = [
    # Department / Program
    (r"\b(computer science|cse|ai & data science|aids|artificial intelligence|data science|information technology|it|electronics and communication|ece|mechanical|mech|civil|mca|b\.tech|m\.tech|btech|mtech)\b", "department_course"),
    # Semester / Academic Year
    (r"\b((?:1st|2nd|3rd|4th|5th|6th|7th|8th)\s+(?:semester|sem)|sem\s+[1-8]|first\s+year|second\s+year|third\s+year|final\s+year)\b", "semester"),
    # Campus Services
    (r"\b(library|hostel|mess|bus|transport|placement|canteen|gym|parking|wifi|wi-fi|health centre|clinic)\b", "service"),
    # Campus Offices & Authorities
    (r"\b(registrar|dean|controller of examinations|coe|warden|hod|head of department|librarian|placement officer|principal)\b", "office"),
    # Examination & Assessment
    (r"\b(mid\s+semester|end\s+semester|practical\s+exam|arrears?|hall\s+ticket|revaluation|retotaling)\b", "exam_type"),
    # Temporal & Dates
    (r"\b(tomorrow|today|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)\b", "date"),
]

# Optional spaCy loader
_spacy_nlp = None
_spacy_checked = False

def _get_spacy_model():
    global _spacy_nlp, _spacy_checked
    if not _spacy_checked:
        _spacy_checked = True
        try:
            import spacy
            _spacy_nlp = spacy.load("en_core_web_sm")
        except Exception:
            _spacy_nlp = None
    return _spacy_nlp

def extract_entities(text: str) -> List[EntityItem]:
    """
    Extract campus-specific named entities using regex rule matchers
    with fallback or augmentation from spaCy when installed.
    """
    if not text:
        return []

    entities: List[EntityItem] = []
    seen_spans = set()

    # 1. Campus Regex Matchers (High precision for college terms)
    for pattern, label in CAMPUS_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            start, end = match.span()
            # Prevent overlap
            span = (start, end)
            if not any(start < s_end and end > s_start for s_start, s_end in seen_spans):
                seen_spans.add(span)
                entities.append(
                    EntityItem(
                        text=match.group(0),
                        label=label,
                        start=start,
                        end=end,
                        source="rules"
                    )
                )

    # 2. spaCy NER (Optional augmentation if installed)
    nlp = _get_spacy_model()
    if nlp is not None:
        try:
            doc = nlp(text)
            for ent in doc.ents:
                start, end = ent.start_char, ent.end_char
                if not any(start < s_end and end > s_start for s_start, s_end in seen_spans):
                    seen_spans.add((start, end))
                    entities.append(
                        EntityItem(
                            text=ent.text,
                            label=ent.label_.lower(),
                            start=start,
                            end=end,
                            source="spacy"
                        )
                    )
        except Exception:
            pass

    # Sort entities by start index
    entities.sort(key=lambda e: e.start)
    return entities
