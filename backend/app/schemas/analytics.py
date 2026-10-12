from typing import List, Dict, Optional
from pydantic import BaseModel

class EventMetadata(BaseModel):
    id: int
    timestamp: str
    input_mode: str
    predicted_intent: str
    intent_confidence: float
    faq_similarity: float
    status: str
    sentiment_label: str

class AnalyticsSummaryResponse(BaseModel):
    total_queries: int
    answered_count: int
    clarification_count: int
    no_answer_count: int
    resolution_rate: float
    sentiment_breakdown: Dict[str, int]
    intent_frequency: Dict[str, int]
    recent_events: List[EventMetadata]
