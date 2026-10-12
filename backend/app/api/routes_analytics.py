from fastapi import APIRouter
from ..schemas.analytics import AnalyticsSummaryResponse
from ..services.analytics_store import get_analytics_store

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary():
    store = get_analytics_store()
    return store.get_summary()

@router.post("/clear")
def clear_analytics():
    store = get_analytics_store()
    store.clear_events()
    return {"status": "cleared", "message": "All aggregate event metadata has been reset."}
