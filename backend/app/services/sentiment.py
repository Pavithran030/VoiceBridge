from typing import Tuple
from ..schemas.query import SentimentResult

_vader_analyzer = None

def _get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None:
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            _vader_analyzer = SentimentIntensityAnalyzer()
        except Exception:
            _vader_analyzer = False
    return _vader_analyzer

# Fallback lexicon for basic sentiment detection if VADER is unavailable
POSITIVE_WORDS = {"good", "great", "excellent", "happy", "thanks", "thank", "helpful", "awesome", "nice", "wonderful", "love", "best", "satisfied"}
NEGATIVE_WORDS = {"bad", "poor", "terrible", "horrible", "broken", "worst", "hate", "issue", "problem", "complaint", "fail", "failed", "unhappy", "angry", "disappointed", "harassment", "ragging"}

def fallback_sentiment(text: str) -> Tuple[str, float]:
    """Simple lexicon-based sentiment analysis fallback."""
    words = text.lower().split()
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    
    total = pos + neg
    if total == 0:
        return "neutral", 0.0
    score = (pos - neg) / total
    if score >= 0.1:
        return "positive", round(score, 4)
    elif score <= -0.1:
        return "negative", round(score, 4)
    else:
        return "neutral", 0.0

def analyze_sentiment(text: str) -> SentimentResult:
    """
    Estimate sentiment of input query.
    Returns SentimentResult with label ('positive', 'neutral', 'negative'),
    score (-1.0 to 1.0), and method ('vader' or 'lexicon_fallback').
    """
    if not text or not text.strip():
        return SentimentResult(label="neutral", score=0.0, method="vader")

    analyzer = _get_vader_analyzer()
    if analyzer:
        scores = analyzer.polarity_scores(text)
        compound = float(scores["compound"])
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"
        return SentimentResult(label=label, score=round(compound, 4), method="vader")
    
    # Fallback method
    label, score = fallback_sentiment(text)
    return SentimentResult(label=label, score=score, method="lexicon_fallback")
