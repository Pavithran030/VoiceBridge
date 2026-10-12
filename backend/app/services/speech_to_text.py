import os
import tempfile
from pathlib import Path
from typing import Optional
from ..config import settings
from ..schemas.speech import TranscriptionResponse

_whisper_model = None
_model_failed = False

def get_whisper_model():
    """Lazily load faster-whisper model on CPU to conserve memory."""
    global _whisper_model, _model_failed
    if _model_failed:
        return None
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            print(f"[SpeechToText] Initializing faster-whisper ({settings.ASR_MODEL_NAME}) on {settings.ASR_DEVICE}...")
            _whisper_model = WhisperModel(
                settings.ASR_MODEL_NAME,
                device=settings.ASR_DEVICE,
                compute_type=settings.ASR_COMPUTE_TYPE
            )
            print("[SpeechToText] Whisper model loaded successfully.")
        except Exception as e:
            print(f"[SpeechToText] Failed to load Whisper model: {e}")
            _model_failed = True
            return None
    return _whisper_model

def transcribe_audio_bytes(audio_bytes: bytes, filename: str = "audio.wav") -> TranscriptionResponse:
    """
    Transcribe audio bytes using local faster-whisper model.
    Saves bytes to temporary file, transcribes, and ensures file is cleaned up.
    """
    if not audio_bytes or len(audio_bytes) < 44:
        return TranscriptionResponse(
            transcript="",
            status="empty",
            duration_seconds=0.0,
            message="Uploaded audio file was empty or too small."
        )

    model = get_whisper_model()
    if model is None:
        return TranscriptionResponse(
            transcript="",
            status="error",
            duration_seconds=0.0,
            message="ASR model is not initialized or unavailable in this environment. You can still type or edit your question directly."
        )

    suffix = Path(filename).suffix if Path(filename).suffix else ".wav"
    temp_file = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(audio_bytes)
            temp_file = Path(f.name)

        segments, info = model.transcribe(
            str(temp_file),
            language="en",
            beam_size=5,
            vad_filter=True
        )

        transcript_parts = [segment.text.strip() for segment in segments]
        full_transcript = " ".join(transcript_parts).strip()

        if not full_transcript:
            return TranscriptionResponse(
                transcript="",
                status="empty",
                language=info.language or "en",
                duration_seconds=round(float(info.duration), 2) if info.duration else 0.0,
                message="No clear speech was recognized in the audio file."
            )

        return TranscriptionResponse(
            transcript=full_transcript,
            status="success",
            language=info.language or "en",
            duration_seconds=round(float(info.duration), 2) if info.duration else 0.0,
            message="Transcription successful."
        )
    except Exception as e:
        return TranscriptionResponse(
            transcript="",
            status="error",
            duration_seconds=0.0,
            message=f"Transcription failed: {str(e)}"
        )
    finally:
        if temp_file and temp_file.exists():
            try:
                temp_file.unlink()
            except Exception:
                pass
