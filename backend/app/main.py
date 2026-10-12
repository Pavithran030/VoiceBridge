from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import (
    health_router,
    query_router,
    speech_router,
    analytics_router,
    evaluation_router
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Speech-Enabled Campus Helpdesk with Confidence-Aware Answer Retrieval and Speech Feature Analysis"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health_router)
app.include_router(query_router)
app.include_router(speech_router)
app.include_router(analytics_router)
app.include_router(evaluation_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API v{settings.VERSION}",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
