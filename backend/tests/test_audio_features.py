import io
import numpy as np
import soundfile as sf
import pytest
from app.services.audio_features import extract_audio_features

def create_synthetic_wav(duration: float = 1.0, sr: int = 16000, freq: float = 440.0) -> bytes:
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Sine wave with gentle envelope
    y = 0.5 * np.sin(2 * np.pi * freq * t)
    buf = io.BytesIO()
    sf.write(buf, y, sr, format="WAV")
    return buf.getvalue()

def test_extract_valid_wav():
    wav_bytes = create_synthetic_wav(duration=1.0)
    res = extract_audio_features(wav_bytes)

    assert res.duration_seconds > 0.9
    assert res.sample_rate == 16000
    assert len(res.waveform.time_seconds) > 0
    assert len(res.energy.values) > 0
    assert len(res.zero_crossing_rate.values) > 0
    assert len(res.spectrogram.frequencies) > 0
    assert len(res.mfcc.coefficients) == 13

def test_extract_silent_wav():
    sr = 16000
    y = np.zeros(int(sr * 0.5))
    buf = io.BytesIO()
    sf.write(buf, y, sr, format="WAV")
    wav_bytes = buf.getvalue()

    res = extract_audio_features(wav_bytes)
    assert "Warning" in res.notes or "silent" in res.notes.lower()

def test_corrupt_audio_raises_error():
    corrupt_bytes = b"RIFF\x00\x00\x00\x00WAVEfmt corrupt payload bytes"
    with pytest.raises(ValueError):
        extract_audio_features(corrupt_bytes)

def test_empty_audio_raises_error():
    with pytest.raises(ValueError):
        extract_audio_features(b"")
