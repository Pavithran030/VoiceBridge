from .routes_health import router as health_router
from .routes_query import router as query_router
from .routes_speech import router as speech_router
from .routes_analytics import router as analytics_router
from .routes_evaluation import router as evaluation_router

__all__ = [
    "health_router",
    "query_router",
    "speech_router",
    "analytics_router",
    "evaluation_router",
]
