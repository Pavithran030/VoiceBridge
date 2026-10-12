import os
import tempfile
from pathlib import Path
from typing import Optional
from ..config import settings

def synthesize_speech_to_wav(text: str) -> Optional[bytes]:
    """
    Synthesize text to WAV audio using local pyttsx3 engine.
    Ensures temporary files are safely created and cleaned up.
    Returns audio bytes or None if local TTS is unsupported.
    """
    if not settings.TTS_ENABLED or not text or not text.strip():
        return None

    # Sanitize text length
    bounded_text = text[:800].strip()
    temp_wav = None

    try:
        import pyttsx3
        engine = pyttsx3.init()
        # Set speaking rate and volume
        engine.setProperty("rate", 160)
        engine.setProperty("volume", 0.95)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            temp_wav = Path(f.name)

        engine.save_to_file(bounded_text, str(temp_wav))
        engine.runAndWait()
        engine.stop()

        if temp_wav.exists() and temp_wav.stat().st_size > 0:
            with open(temp_wav, "rb") as f:
                data = f.read()
            return data
        return None
    except Exception as e:
        print(f"[TextToSpeech] Synthesis warning: {e}")
        return None
    finally:
        if temp_wav and temp_wav.exists():
            try:
                temp_wav.unlink()
            except Exception:
                pass
