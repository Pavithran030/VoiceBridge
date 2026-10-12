from typing import Optional, List, Literal
from pydantic import BaseModel, Field

class TextQueryRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="User query text")

class EntityItem(BaseModel):
    text: str
    label: str
    start: int
    end: int
    source: Literal["spacy", "rules"]

class SentimentResult(BaseModel):
    label: Literal["positive", "neutral", "negative"]
    score: float
    method: Literal["vader", "lexicon_fallback"]

class FaqMatch(BaseModel):
    faq_id: str
    intent: str
    similarity: float
    question: str
    office_or_category: Optional[str] = None

class QueryResult(BaseModel):
    status: Literal["answered", "clarification_needed", "no_answer"]
    original_text: str
    normalized_text: str
    predicted_intent: str
    intent_confidence: float
    entities: List[EntityItem] = []
    sentiment: SentimentResult
    faq_match: Optional[FaqMatch] = None
    answer: Optional[str] = None
    explanation: str
    suggestions: List[str] = []
