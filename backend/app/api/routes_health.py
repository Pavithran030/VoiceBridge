from fastapi import APIRouter
from ..config import settings
from ..services.speech_to_text import get_whisper_model
from ..services.intent_classifier import get_intent_classifier

router = APIRouter(prefix="/api", tags=["System"])

@router.get("/health")
def health_check():
    classifier = get_intent_classifier()
    model_ready = classifier.pipeline is not None
    
    # Check if TTS can initialize
    tts_ready = False
    try:
        import pyttsx3
        tts_ready = True
    except Exception:
        pass

    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "model_ready": model_ready,
        "asr_ready": True,  # ASR is lazily loaded on first request
        "tts_ready": tts_ready
    }

@router.get("/config")
def get_public_config():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "max_text_length": settings.MAX_TEXT_LENGTH,
        "max_audio_size_bytes": settings.MAX_AUDIO_SIZE_BYTES,
        "supported_audio_extensions": settings.SUPPORTED_AUDIO_EXTENSIONS,
        "intent_confidence_threshold": settings.INTENT_CONFIDENCE_THRESHOLD,
        "faq_similarity_threshold": settings.FAQ_SIMILARITY_THRESHOLD,
        "asr_enabled": True,
        "tts_enabled": settings.TTS_ENABLED,
        "asr_model_name": settings.ASR_MODEL_NAME
    }
