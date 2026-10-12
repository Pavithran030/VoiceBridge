from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class TranscriptionResponse(BaseModel):
    transcript: str
    status: Literal["success", "empty", "error"]
    language: str = "en"
    duration_seconds: float = 0.0
    message: str = ""

class WaveformData(BaseModel):
    time_seconds: List[float]
    amplitude: List[float]

class TimeSeriesFeature(BaseModel):
    time_seconds: List[float]
    values: List[float]

class SpectrogramData(BaseModel):
    times: List[float]
    frequencies: List[float]
    values: List[List[float]]

class MfccData(BaseModel):
    times: List[float]
    coefficients: List[int]
    values: List[List[float]]

class SpeechAnalysisResponse(BaseModel):
    duration_seconds: float
    sample_rate: int
    frame_length: int
    hop_length: int
    num_mfcc: int
    waveform: WaveformData
    energy: TimeSeriesFeature
    zero_crossing_rate: TimeSeriesFeature
    spectrogram: SpectrogramData
    mfcc: MfccData
    notes: str = ""

class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
