from fastapi import APIRouter, HTTPException, status
from ..schemas.query import TextQueryRequest, QueryResult
from ..services.query_service import process_query
from ..config import settings

router = APIRouter(prefix="/api/query", tags=["Query"])

@router.post("/text", response_model=QueryResult)
def query_by_text(payload: TextQueryRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query text cannot be empty."
        )

    if len(text) > settings.MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query text exceeds maximum allowed length of {settings.MAX_TEXT_LENGTH} characters."
        )

    try:
        result = process_query(text=text, input_mode="text")
        return result
    except Exception as e:
        # Avoid leaking internal traceback to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the question."
        )
