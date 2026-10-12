from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Response
from ..schemas.speech import TranscriptionResponse, SpeechAnalysisResponse, SynthesizeRequest
from ..services.speech_to_text import transcribe_audio_bytes
from ..services.audio_features import extract_audio_features
from ..services.text_to_speech import synthesize_speech_to_wav
from ..config import settings

router = APIRouter(prefix="/api/speech", tags=["Speech"])

def validate_audio_file(file: UploadFile) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.SUPPORTED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{ext}'. Supported formats: {', '.join(settings.SUPPORTED_AUDIO_EXTENSIONS)}"
        )
    return ext

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio_file: UploadFile = File(...)):
    validate_audio_file(audio_file)
    content = await audio_file.read()

    if len(content) > settings.MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_BYTES // (1024*1024)} MB."
        )

    response = transcribe_audio_bytes(content, filename=audio_file.filename or "audio.wav")
    return response

@router.post("/analyze", response_model=SpeechAnalysisResponse)
async def analyze_speech(audio_file: UploadFile = File(...)):
    validate_audio_file(audio_file)
    content = await audio_file.read()

    if len(content) > settings.MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_BYTES // (1024*1024)} MB."
        )

    try:
        response = extract_audio_features(content)
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract audio features from the uploaded file."
        )

@router.post("/synthesize")
def synthesize_speech(payload: SynthesizeRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty.")

    wav_bytes = synthesize_speech_to_wav(text)
    if not wav_bytes:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local text-to-speech synthesis is currently unavailable on the host system."
        )

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={"Content-Disposition": "inline; filename=speech_answer.wav"}
    )
