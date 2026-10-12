import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    has_pydantic_settings = True
except ImportError:
    try:
        from pydantic import BaseSettings
        SettingsConfigDict = None
        has_pydantic_settings = False
    except ImportError:
        from pydantic import BaseModel as BaseSettings
        SettingsConfigDict = None
        has_pydantic_settings = False

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    if has_pydantic_settings and SettingsConfigDict is not None:
        model_config = SettingsConfigDict(env_file=".env", extra="allow")
    else:
        class Config:
            env_file = ".env"
            extra = "allow"

    APP_NAME: str = "VoiceBridge"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Directories
    DATA_DIR: Path = BASE_DIR / "app" / "data"
    MODELS_DIR: Path = BASE_DIR / "app" / "models"
    EVALUATION_DIR: Path = BASE_DIR / "app" / "evaluation"
    TEMP_DIR: Path = BASE_DIR / "app" / "temp"
    
    # Files
    INTENT_EXAMPLES_FILE: Path = DATA_DIR / "intent_examples.csv"
    FAQ_FILE: Path = DATA_DIR / "faq.csv"
    RETRIEVAL_TEST_FILE: Path = DATA_DIR / "retrieval_test_cases.csv"
    INTENT_MODEL_FILE: Path = MODELS_DIR / "intent_model.joblib"
    EVALUATION_METRICS_FILE: Path = EVALUATION_DIR / "intent_metrics.json"
    
    # Limits & Thresholds
    MAX_TEXT_LENGTH: int = 1000
    MAX_AUDIO_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    SUPPORTED_AUDIO_EXTENSIONS: list[str] = [".wav", ".mp3", ".m4a", ".ogg", ".flac"]
    
    # NLP Policy Thresholds (calibrated for 15-class distribution where random chance is 0.067)
    INTENT_CONFIDENCE_THRESHOLD: float = 0.15
    FAQ_SIMILARITY_THRESHOLD: float = 0.30
    
    # Analytics
    ENABLE_ANALYTICS: bool = True
    DATABASE_PATH: Path = BASE_DIR / "app" / "analytics.db"
    
    # ASR Settings (Whisper)
    ASR_MODEL_NAME: str = "tiny.en"
    ASR_DEVICE: str = "cpu"
    ASR_COMPUTE_TYPE: str = "int8"
    
    # TTS Settings
    TTS_ENABLED: bool = True

settings = Settings()

# Ensure runtime directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
