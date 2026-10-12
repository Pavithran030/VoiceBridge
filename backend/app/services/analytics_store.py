import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from ..config import settings
from ..schemas.analytics import AnalyticsSummaryResponse, EventMetadata

class AnalyticsStore:
    """
    Local privacy-respecting SQLite event metadata store.
    Stores aggregate evaluation/usage metrics ONLY without raw query text or audio.
    """
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or settings.DATABASE_PATH
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS query_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    input_mode TEXT NOT NULL,
                    predicted_intent TEXT NOT NULL,
                    intent_confidence REAL NOT NULL,
                    faq_similarity REAL NOT NULL,
                    status TEXT NOT NULL,
                    sentiment_label TEXT NOT NULL
                )
            """)
            conn.commit()

    def log_event(
        self,
        input_mode: str,
        predicted_intent: str,
        intent_confidence: float,
        faq_similarity: float,
        status: str,
        sentiment_label: str
    ) -> None:
        if not settings.ENABLE_ANALYTICS:
            return

        now_iso = datetime.utcnow().isoformat() + "Z"
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO query_events (
                        timestamp, input_mode, predicted_intent,
                        intent_confidence, faq_similarity, status, sentiment_label
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    now_iso, input_mode, predicted_intent,
                    intent_confidence, faq_similarity, status, sentiment_label
                ))
                conn.commit()
        except Exception as e:
            print(f"[AnalyticsStore] Logging error: {e}")

    def get_summary(self) -> AnalyticsSummaryResponse:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Total count
            cursor.execute("SELECT COUNT(*) FROM query_events")
            total = cursor.fetchone()[0] or 0

            if total == 0:
                return AnalyticsSummaryResponse(
                    total_queries=0,
                    answered_count=0,
                    clarification_count=0,
                    no_answer_count=0,
                    resolution_rate=0.0,
                    sentiment_breakdown={"positive": 0, "neutral": 0, "negative": 0},
                    intent_frequency={},
                    recent_events=[]
                )

            # Status breakdown
            cursor.execute("SELECT status, COUNT(*) FROM query_events GROUP BY status")
            status_counts = dict(cursor.fetchall())
            answered = status_counts.get("answered", 0)
            clarification = status_counts.get("clarification_needed", 0)
            no_answer = status_counts.get("no_answer", 0)
            resolution_rate = round((answered / total) * 100, 2) if total > 0 else 0.0

            # Sentiment breakdown
            cursor.execute("SELECT sentiment_label, COUNT(*) FROM query_events GROUP BY sentiment_label")
            sentiment_counts = dict(cursor.fetchall())
            sentiment_breakdown = {
                "positive": sentiment_counts.get("positive", 0),
                "neutral": sentiment_counts.get("neutral", 0),
                "negative": sentiment_counts.get("negative", 0),
            }

            # Intent breakdown
            cursor.execute("SELECT predicted_intent, COUNT(*) FROM query_events GROUP BY predicted_intent ORDER BY COUNT(*) DESC")
            intent_frequency = dict(cursor.fetchall())

            # Recent 10 events (metadata only)
            cursor.execute("""
                SELECT id, timestamp, input_mode, predicted_intent,
                       intent_confidence, faq_similarity, status, sentiment_label
                FROM query_events
                ORDER BY id DESC
                LIMIT 15
            """)
            recent_rows = cursor.fetchall()
            recent_events = [
                EventMetadata(
                    id=row[0],
                    timestamp=row[1],
                    input_mode=row[2],
                    predicted_intent=row[3],
                    intent_confidence=round(row[4], 4),
                    faq_similarity=round(row[5], 4),
                    status=row[6],
                    sentiment_label=row[7]
                ) for row in recent_rows
            ]

            return AnalyticsSummaryResponse(
                total_queries=total,
                answered_count=answered,
                clarification_count=clarification,
                no_answer_count=no_answer,
                resolution_rate=resolution_rate,
                sentiment_breakdown=sentiment_breakdown,
                intent_frequency=intent_frequency,
                recent_events=recent_events
            )

    def clear_events(self) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM query_events")
            conn.commit()

_analytics_store: Optional[AnalyticsStore] = None

def get_analytics_store() -> AnalyticsStore:
    global _analytics_store
    if _analytics_store is None:
        _analytics_store = AnalyticsStore()
    return _analytics_store
