import io
import math
from typing import Dict, Any, Tuple
import numpy as np
import soundfile as sf
from ..schemas.speech import (
    SpeechAnalysisResponse,
    WaveformData,
    TimeSeriesFeature,
    SpectrogramData,
    MfccData
)

def extract_audio_features(file_bytes: bytes, target_sr: int = 16000) -> SpeechAnalysisResponse:
    """
    Extract educational acoustic speech features:
    - Waveform (downsampled for plotting)
    - Short-Time Energy
    - Zero-Crossing Rate (ZCR)
    - Spectrogram (Log STFT magnitude)
    - MFCCs (Mel-Frequency Cepstral Coefficients)
    Handles corrupt, silent, or extremely short audio gracefully.
    """
    if not file_bytes or len(file_bytes) < 44:
        raise ValueError("Audio file is empty or too small to be a valid audio recording.")

    try:
        # Load audio into numpy array using soundfile or librosa
        import librosa
        audio_io = io.BytesIO(file_bytes)
        y, sr = librosa.load(audio_io, sr=target_sr, mono=True)
    except Exception as e:
        raise ValueError(f"Could not decode audio file: {str(e)}")

    if len(y) == 0:
        raise ValueError("Decoded audio contains no audio samples.")

    duration_seconds = float(len(y) / sr)
    if duration_seconds < 0.05:
        raise ValueError("Audio duration is too short (less than 50 milliseconds) for feature analysis.")

    # Check for complete silence
    is_silent = bool(np.max(np.abs(y)) < 1e-4)

    # Signal analysis frame parameters
    frame_length = 512
    hop_length = 256
    num_mfcc = 13

    # 1. Downsample waveform for responsive visualization (max 800 points)
    max_wave_points = 800
    if len(y) > max_wave_points:
        indices = np.linspace(0, len(y) - 1, max_wave_points, dtype=int)
        wave_y = y[indices]
        wave_times = indices / sr
    else:
        wave_y = y
        wave_times = np.arange(len(y)) / sr

    waveform_data = WaveformData(
        time_seconds=[round(float(t), 4) for t in wave_times],
        amplitude=[round(float(a), 4) for a in wave_y]
    )

    # 2. Short-Time Energy: E_m = sum(x^2[n + mH] * w[n])
    # Compute framing
    num_frames = max(1, 1 + (len(y) - frame_length) // hop_length) if len(y) >= frame_length else 1
    energy_vals = []
    zcr_vals = []
    frame_times = []

    window = np.hanning(min(len(y), frame_length))
    win_len = len(window)

    for i in range(num_frames):
        start = i * hop_length
        end = start + win_len
        if end > len(y):
            break
        frame = y[start:end] * window
        
        # Energy
        e = float(np.sum(frame ** 2))
        energy_vals.append(e)

        # Zero Crossing Rate
        signs = np.sign(frame)
        zcr = float(np.sum(np.abs(signs[1:] - signs[:-1])) / (2 * len(frame)))
        zcr_vals.append(zcr)

        frame_times.append(float((start + win_len // 2) / sr))

    # Downsample time series if too many frames (> 300)
    max_frames = 250
    if len(frame_times) > max_frames:
        step = math.ceil(len(frame_times) / max_frames)
        frame_times = frame_times[::step]
        energy_vals = energy_vals[::step]
        zcr_vals = zcr_vals[::step]

    energy_data = TimeSeriesFeature(
        time_seconds=[round(t, 4) for t in frame_times],
        values=[round(v, 6) for v in energy_vals]
    )
    zcr_data = TimeSeriesFeature(
        time_seconds=[round(t, 4) for t in frame_times],
        values=[round(v, 6) for v in zcr_vals]
    )

    # 3. Spectrogram (STFT Log Magnitude)
    try:
        import librosa
        stft = librosa.stft(y, n_fft=frame_length, hop_length=hop_length)
        magnitude = np.abs(stft)
        log_spec = librosa.amplitude_to_db(magnitude, ref=np.max)
        
        # Limit to 40 frequency bins and 100 time frames for compact bounded JSON
        n_bins, n_times = log_spec.shape
        bin_indices = np.linspace(0, n_bins - 1, min(36, n_bins), dtype=int)
        time_indices = np.linspace(0, n_times - 1, min(80, n_times), dtype=int)

        freqs = librosa.fft_frequencies(sr=sr, n_fft=frame_length)[bin_indices]
        times = librosa.frames_to_time(time_indices, sr=sr, hop_length=hop_length)
        
        sampled_spec = log_spec[bin_indices, :][:, time_indices]

        spectrogram_data = SpectrogramData(
            times=[round(float(t), 4) for t in times],
            frequencies=[round(float(f), 1) for f in freqs],
            values=[[round(float(val), 2) for val in row] for row in sampled_spec]
        )
    except Exception:
        spectrogram_data = SpectrogramData(times=[], frequencies=[], values=[])

    # 4. MFCC (Mel-Frequency Cepstral Coefficients)
    try:
        import librosa
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=num_mfcc, hop_length=hop_length)
        n_coeff, n_t = mfccs.shape
        time_indices = np.linspace(0, n_t - 1, min(80, n_t), dtype=int)
        times = librosa.frames_to_time(time_indices, sr=sr, hop_length=hop_length)
        
        sampled_mfcc = mfccs[:, time_indices]

        mfcc_data = MfccData(
            times=[round(float(t), 4) for t in times],
            coefficients=list(range(1, num_mfcc + 1)),
            values=[[round(float(val), 2) for val in row] for row in sampled_mfcc]
        )
    except Exception:
        mfcc_data = MfccData(times=[], coefficients=[], values=[])

    notes = "Educational acoustic signal extraction completed."
    if is_silent:
        notes += " Warning: Low signal amplitude or near-silent recording detected."

    return SpeechAnalysisResponse(
        duration_seconds=round(duration_seconds, 3),
        sample_rate=sr,
        frame_length=frame_length,
        hop_length=hop_length,
        num_mfcc=num_mfcc,
        waveform=waveform_data,
        energy=energy_data,
        zero_crossing_rate=zcr_data,
        spectrogram=spectrogram_data,
        mfcc=mfcc_data,
        notes=notes
    )
