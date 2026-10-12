# VoiceBridge API Reference

**Base URL:** `http://127.0.0.1:8000` (or configured via environment)  
**Content-Type:** `application/json` (unless specified as `multipart/form-data` or `audio/wav`)

> **Notice on Numeric Values:** All floating-point scores and numeric values in the examples below are illustrative representations of schema structure. Actual responses reflect computed model predictions and empirical similarity scores.

---

## 1. System Endpoints

### `GET /api/health`
Checks backend readiness, active models, and speech hardware availability.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "app_name": "VoiceBridge",
  "version": "1.0.0",
  "environment": "development",
  "model_ready": true,
  "asr_ready": true,
  "tts_ready": true
}
```

---

### `GET /api/config`
Retrieves public, non-secret UI configurations and threshold limits.

**Response `200 OK`:**
```json
{
  "app_name": "VoiceBridge",
  "version": "1.0.0",
  "max_text_length": 1000,
  "max_audio_size_bytes": 10485760,
  "supported_audio_extensions": [".wav", ".mp3", ".m4a", ".ogg", ".flac"],
  "intent_confidence_threshold": 0.15,
  "faq_similarity_threshold": 0.30,
  "asr_enabled": true,
  "tts_enabled": true,
  "asr_model_name": "tiny.en"
}
```

---

## 2. NLP & Query Endpoints

### `POST /api/query/text`
Processes a typed or edited speech transcript through the unified confidence-aware NLP pipeline.

**Request Body:**
```json
{
  "text": "How do I pay my semester tuition fees online?"
}
```

**Response `200 OK` (`status: "answered"`):**
```json
{
  "status": "answered",
  "original_text": "How do I pay my semester tuition fees online?",
  "normalized_text": "how do i pay my semester tuition fees online?",
  "predicted_intent": "fees",
  "intent_confidence": 0.1771,
  "entities": [
    {
      "text": "semester",
      "label": "semester",
      "start": 17,
      "end": 25,
      "source": "rules"
    }
  ],
  "sentiment": {
    "label": "neutral",
    "score": 0.0,
    "method": "vader"
  },
  "faq_match": {
    "faq_id": "FAQ-FEE-01",
    "intent": "fees",
    "similarity": 0.6508,
    "question": "How do I pay my semester tuition fees online?",
    "office_or_category": "Finance and Accounts"
  },
  "answer": "Semester tuition fees can be paid through the official student portal using net banking credit debit cards or UPI. [replace with verified payment portal URL bank account details and receipt download instructions]",
  "explanation": "Matched campus FAQ (FAQ-FEE-01) with 65.1% relevance and 17.7% intent confidence.",
  "suggestions": [
    "Contact Finance and Accounts for verified updates",
    "More details on fees"
  ]
}
```

**Response `200 OK` (`status: "no_answer"`):**
```json
{
  "status": "no_answer",
  "original_text": "What is the capital of France?",
  "normalized_text": "what is the capital of france?",
  "predicted_intent": "other",
  "intent_confidence": 0.1804,
  "entities": [],
  "sentiment": {
    "label": "neutral",
    "score": 0.0,
    "method": "vader"
  },
  "faq_match": null,
  "answer": null,
  "explanation": "Relevance score (29.8%) is below the configured threshold (30.0%). To prevent inaccurate answers, please consult the respective college office or rephrase.",
  "suggestions": [
    "How do I apply for B.Tech admission?",
    "When will semester exams begin?",
    "How can I contact the administration office?"
  ]
}
```

---

## 3. Speech Endpoints

### `POST /api/speech/transcribe`
Transcribes audio using local `faster-whisper`.

**Request:** `multipart/form-data` with field `audio_file` (Binary audio bytes $\le 10$ MB).

**Response `200 OK`:**
```json
{
  "transcript": "when will semester exams begin",
  "status": "success",
  "language": "en",
  "duration_seconds": 2.45,
  "message": "Transcription successful."
}
```

---

### `POST /api/speech/analyze`
Extracts acoustic features for signal analysis and educational visualization.

**Request:** `multipart/form-data` with field `audio_file`.

**Response `200 OK`:**
```json
{
  "duration_seconds": 1.25,
  "sample_rate": 16000,
  "frame_length": 512,
  "hop_length": 256,
  "num_mfcc": 13,
  "waveform": {
    "time_seconds": [0.0, 0.0016, 0.0032],
    "amplitude": [0.0012, 0.0435, 0.1082]
  },
  "energy": {
    "time_seconds": [0.016, 0.032, 0.048],
    "values": [0.00124, 0.00843, 0.01521]
  },
  "zero_crossing_rate": {
    "time_seconds": [0.016, 0.032, 0.048],
    "values": [0.042, 0.038, 0.045]
  },
  "spectrogram": {
    "times": [0.016, 0.032],
    "frequencies": [0.0, 250.0, 500.0, 1000.0],
    "values": [
      [-45.2, -40.1],
      [-52.1, -48.3]
    ]
  },
  "mfcc": {
    "times": [0.016, 0.032],
    "coefficients": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    "values": [
      [-210.4, -205.1],
      [45.3, 48.2]
    ]
  },
  "notes": "Educational acoustic signal extraction completed."
}
```

---

### `POST /api/speech/synthesize`
Synthesizes bounded text to speech using local `pyttsx3`.

**Request Body:**
```json
{
  "text": "Semester tuition fees can be paid through the official student portal."
}
```

**Response `200 OK`:**
- `Content-Type: audio/wav`
- Raw WAV audio binary stream.

---

## 4. Analytics & Evaluation Endpoints

### `GET /api/analytics/summary`
Retrieves aggregated query event counts and resolution metrics.

**Response `200 OK`:**
```json
{
  "total_queries": 9,
  "answered_count": 1,
  "clarification_count": 4,
  "no_answer_count": 4,
  "resolution_rate": 11.11,
  "sentiment_breakdown": {
    "positive": 1,
    "neutral": 6,
    "negative": 2
  },
  "intent_frequency": {
    "fees": 2,
    "exam_schedule": 3,
    "other": 3,
    "admission": 1
  },
  "recent_events": [
    {
      "id": 9,
      "timestamp": "2026-10-12T15:39:46.890060Z",
      "input_mode": "text",
      "predicted_intent": "exam_schedule",
      "intent_confidence": 0.0938,
      "faq_similarity": 0.2944,
      "status": "no_answer",
      "sentiment_label": "neutral"
    }
  ]
}
```

---

### `POST /api/analytics/clear`
Clears local SQLite event metadata records.

**Response `200 OK`:**
```json
{
  "status": "cleared",
  "message": "All aggregate event metadata has been reset."
}
```

---

### `GET /api/evaluation`
Retrieves true held-out model classification and retrieval evaluation artifacts.

**Response `200 OK`:**
```json
{
  "generated": true,
  "dataset_info": {
    "total_samples": 232,
    "train_samples": 174,
    "test_samples": 58,
    "random_seed": 42,
    "class_counts": {
      "greeting": 18,
      "admission": 18,
      "fees": 16,
      "exam_schedule": 15
    }
  },
  "overall_metrics": {
    "accuracy": 0.5345,
    "macro_precision": 0.5978,
    "macro_recall": 0.5333,
    "macro_f1": 0.5284
  },
  "classification_report": { ... },
  "confusion_matrix": {
    "labels": ["admission", "complaint", "fees", ...],
    "matrix": [ ... ]
  },
  "retrieval_metrics": {
    "total_test_cases": 29,
    "correct_count": 23,
    "top1_accuracy": 0.7931
  }
}
```
