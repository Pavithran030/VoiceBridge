# VoiceBridge: Speech-Enabled Campus Helpdesk
## Complete Mini-Project Specification and Agentic Coding Prompt

**Project level:** Intermediate undergraduate mini project  
**Subject:** Natural Language Processing and Speech Processing  
**Frontend:** React + TypeScript + Vite  
**Backend:** Python + FastAPI  
**Core approach:** Local NLP pipeline, confidence-aware FAQ retrieval, speech recognition, and explainable speech-feature analysis

---

## 1. Project Overview

### 1.1 Project idea

**VoiceBridge** is a speech-enabled campus helpdesk that lets students ask common college-related questions by typing or speaking. It transcribes audio into editable text, predicts the likely query intent, extracts useful entities, estimates text sentiment, and retrieves an answer from a locally stored FAQ knowledge base. It can optionally speak the answer aloud. A separate Speech Lab demonstrates audio-processing concepts through waveform, spectrogram, Mel-frequency cepstral coefficients (MFCCs), short-time energy, and zero-crossing rate (ZCR) visualizations.

The frontend must be a responsive web application built with **React, TypeScript, and Vite**, while the backend exposes REST APIs using **FastAPI**. Keep the frontend and backend separate. **Do not use Streamlit or Gradio, and do not build the frontend in Python.**

### 1.2 Problem statement

Students repeatedly ask routine questions about admissions, fees, exams, timetables, departments, the library, placements, hostel facilities, transport, and scholarships. A static FAQ page requires students to search manually, while a basic chatbot may return a misleading answer when a question is ambiguous or absent from its knowledge base. VoiceBridge provides a unified text-and-speech interface and explicitly checks intent confidence and FAQ relevance before answering. When evidence is weak, it asks for clarification or indicates that the answer is unavailable instead of inventing a response.

### 1.3 Core user workflows

1. A user types a question or uploads/records a short audio query.
2. Audio is transcribed to text using a locally run speech-recognition model when that optional dependency is available.
3. The user reviews and can edit the transcript before submitting it.
4. The NLP pipeline predicts an intent, extracts configured entities, and estimates sentiment.
5. The FAQ retrieval component ranks local answers and computes a similarity score.
6. A confidence/relevance policy decides whether to answer, ask for clarification, or use a safe no-answer response.
7. The response page displays the answer and an explanation of the signals used; optional text-to-speech reads it aloud.
8. The Speech Lab visualizes the audio signal and derived features.
9. Analytics show aggregated usage and genuine model-evaluation results without fabricating metrics.

### 1.4 What makes the project distinctive

The main contribution is the integration of **confidence-aware query processing and explainable speech analysis** in one demonstrable system. Do not claim that the project introduces a new AI algorithm. Its defensible contribution is a carefully implemented and evaluated workflow that combines established techniques:

- **Dual confidence checks:** the classifier score and FAQ similarity are considered separately. A high classifier score cannot compensate for an irrelevant FAQ match, and a high similarity score cannot automatically override an ambiguous intent.
- **Safe fallback:** low-confidence or mismatched results lead to clarification or a no-answer message, rather than an invented answer.
- **Editable speech transcript:** users can correct ASR mistakes before NLP processing.
- **Explainability panel:** users can inspect intent, entities, sentiment, retrieved FAQ, similarity score, and the reason for answering or declining.
- **Speech Lab:** MFCC, short-time energy, ZCR, waveform, and spectrogram are visible as actual computed features—not just mentioned in documentation.
- **Measured evaluation:** held-out classification metrics, a confusion matrix, and a small labeled retrieval test set are generated from the actual dataset.

### 1.5 Scope and assumptions

Build an undergraduate demonstration application, not an official college information service. Start with an editable, synthetic English-language dataset and clearly mark all institutional dates, fees, policies, office names, and contact details as placeholders. The user must replace them with verified information before any real use. Text query handling should work without API keys. Speech recognition may need an initial model download; it must run locally after the model is available. The application must still operate in text-only mode if audio libraries or local audio devices are unavailable.

---

## 2. Mapping to the Subject Syllabus

| Syllabus concept | VoiceBridge implementation |
|---|---|
| Text preprocessing and tokenization | Dedicated query normalization and preprocessing module |
| Morphology, stemming/lemmatization, stop words | Discuss preprocessing trade-offs; avoid removing negation blindly |
| Bag of Words and Vector Space Model | TF-IDF representations for intent classification and FAQ matching |
| Sentiment classification | Positive, neutral, or negative text sentiment estimate |
| Named Entity Recognition (NER) | Configured extraction of course, department, semester, date, and service entities |
| Statistical machine learning for NLP | TF-IDF + Logistic Regression baseline |
| Encoder/decoder and modern speech recognition concepts | ASR module and explanation of model-based transcription; transformer extension optional |
| Speech production and perception | Audio capture/upload, ASR transcript, and optional TTS response |
| Short-time signal analysis | Waveform, short-time energy, ZCR, and spectrogram |
| MFCC and speech feature representation | MFCC extraction with a coefficient/time visualization |
| Automatic Speech Recognition (ASR) | Audio-to-transcript workflow |
| Evaluation metrics | Accuracy, macro precision/recall/F1, classification report, confusion matrix, retrieval accuracy |
| Application development | React UI, FastAPI REST service, dataset/model files, tests, and documentation |

---

## 3. Required Technology Stack

### Frontend

- **React + TypeScript + Vite** for the single-page application.
- React Router for page navigation if needed; a small tab-based navigation is also acceptable.
- Plain CSS, CSS Modules, or a lightweight styling library. Prioritize clear layout and accessibility over decorative effects.
- Recharts for waveform/time-series plots if convenient; use a small Canvas/SVG visualization for the spectrogram and MFCC heatmap if that is simpler and reliable.
- `fetch` or Axios for requests to the FastAPI service. Choose one approach and use it consistently.
- Browser `MediaRecorder` may be used for microphone recording when supported; file upload must remain available as a fallback.

### Backend

- Python 3.10 or 3.11; select and document the version actually tested.
- FastAPI, Uvicorn, and Pydantic for HTTP APIs and request/response validation.
- scikit-learn, NumPy, pandas, and joblib for intent modeling, vectorization, evaluation, and model persistence.
- `librosa` and `soundfile` for audio decoding and feature extraction.
- `faster-whisper` for optional local ASR, initialized lazily and configured for CPU by default.
- `vaderSentiment` for an interpretable English sentiment baseline, with a lightweight fallback if unavailable.
- spaCy plus configured phrase/rule matching for entity extraction. The core application must remain functional if the optional spaCy language model is not installed.
- `pyttsx3` for local TTS where the host operating system supports it. Handle unsupported TTS environments gracefully.
- SQLite for optional local query metadata/analytics. Do not store raw question text by default.
- pytest and FastAPI `TestClient` for testing.

### Runtime and dependencies

- Core typed-query functionality must not require paid APIs, cloud credentials, or a GPU.
- ASR models may be downloaded once on first use. Explain that this is a model download, not a paid API call, and show how to disable or skip ASR when offline.
- Keep heavy model initialization lazy; do not reload a speech model on every request.
- Use separate dependency manifests for the frontend (`package.json`) and backend (`requirements.txt` or `pyproject.toml`).
- Do not add multiple libraries that solve the same problem without a clear reason.

---

# 4. Complete Master Prompt for an Agentic Coding Tool

Copy everything inside the prompt below into a coding agent that can inspect and modify a project directory. The agent should implement the code—not merely explain how to write it.

---

## MASTER PROMPT — BUILD VOICEBRIDGE END TO END

You are a senior full-stack engineer with experience in React, TypeScript, FastAPI, applied NLP, and speech processing. Build a complete, runnable intermediate-level project named **VoiceBridge: Speech-Enabled Campus Helpdesk with Confidence-Aware Answer Retrieval and Speech Feature Analysis**.

Inspect the existing workspace before making changes. If the workspace contains an existing project, preserve useful work and avoid destructive overwrites. Create the actual source files, implement the end-to-end flows, run tests and builds where possible, fix errors, and document every command needed to launch the application. Work in phases, but continue through all phases without waiting for approval unless a destructive change, unavailable credential, or genuinely blocking issue requires clarification.

### Mandatory architecture constraints

1. **Frontend must use React + TypeScript + Vite.**
2. **Backend must use FastAPI and expose JSON/REST endpoints**, except for audio responses, which may be streamed as WAV bytes.
3. Do not use Streamlit, Gradio, Flask templates, or another Python-rendered frontend.
4. Keep frontend display logic separate from NLP/audio business logic.
5. The application must support typed queries even when speech recognition or text-to-speech cannot run.
6. The core text pipeline must not require an API key or remote AI inference service.
7. Do not fabricate metrics, test results, example college policies, or claims that untested features work.
8. Do not leave pseudocode, empty core modules, fake API endpoints, or TODO-only implementations in the final result.

### A. Product requirements

Build a polished but maintainable web application with five main sections:

1. **Ask VoiceBridge:** typed question, audio upload and optional microphone recording, editable transcript, answer, confidence details, sentiment, entities, and optional speech output.
2. **Speech Lab:** waveform, spectrogram, MFCC heatmap, short-time energy, and ZCR.
3. **Analytics:** aggregate query counts, intent frequency, sentiment breakdown, resolution rate, and low-confidence count.
4. **Model Evaluation:** actual held-out intent classification metrics, per-class results, and confusion matrix; display retrieval evaluation if generated.
5. **About & Help:** project workflow, supported audio types, limitations, and directions for replacing sample data.

The UI must be responsive on desktop and mobile, have sensible loading states, display errors in accessible language, and never show raw Python stack traces to the user.

### B. User workflow and behavior

#### B1. Typed question

1. The user types a non-empty question. Limit input length (for example, 1,000 characters) and validate it in both frontend and backend.
2. Send the question to the FastAPI query endpoint.
3. Normalize the text in the backend while preserving the original question for display.
4. Predict intent, extract configured entities, estimate sentiment, and rank FAQ matches.
5. Run the confidence/relevance decision policy before returning a response.
6. Display the status and answer as a structured result, including a short explanation of why the system answered, requested clarification, or declined to answer.
7. Offer optional TTS for an answer that exists and is suitable to read aloud.

#### B2. Spoken question

1. Allow WAV upload as the minimum supported format. Add MP3/M4A only if installed decoders support them reliably; show supported formats in the interface.
2. If practical, support browser microphone recording through `MediaRecorder`. When it is unsupported or microphone permission is refused, retain file upload as a working path.
3. Upload the audio to the transcription endpoint with `multipart/form-data`.
4. Validate file size, extension/content handling, duration, and decodability on the backend. Use a configurable limit (for example, 10 MB) and reject invalid input safely.
5. Transcribe with a lazily loaded `faster-whisper` model configured for CPU and `int8` by default. Use a configurable model name, with a small English model as the initial default. Keep language settings explicit.
6. Return the transcript and transcription status. The frontend must show the transcript in an editable field.
7. The user confirms or edits the transcript, then submits it through the same text-query endpoint used by typed input.
8. If model loading, downloading, decoding, or transcription fails, show a useful message and preserve the ability to type or paste a query.
9. Audio must be processed from a temporary location or memory buffer and removed after processing. Do not retain uploaded recordings by default.

#### B3. Speech Lab

1. Let the user upload audio independently of the question-answer workflow.
2. Decode to mono and a controlled sample rate; preserve the correct duration and sample-rate metadata.
3. Compute waveform samples (downsampled for plotting), a log-scaled magnitude spectrogram, MFCCs, short-time energy, and zero-crossing rate.
4. Return numeric arrays from the backend so the frontend can create interactive charts. Keep response payload sizes bounded by limiting/downsampling frames and bins.
5. Display at least:
   - waveform versus time;
   - spectrogram heatmap with time/frequency axes or clearly labeled relative axes;
   - MFCC coefficient heatmap with coefficient and time axes;
   - short-time energy versus time;
   - ZCR versus time.
6. Briefly explain what each feature represents and identify the sample rate, duration, frame length, hop length, and MFCC count used.
7. Handle silent, corrupted, empty, and very short audio inputs with clear validation messages. Do not crash the API on malformed audio.
8. Label the feature analysis as educational signal visualization; do not claim that MFCC or ZCR alone determines the query intent or guarantees transcription accuracy.

#### B4. TTS response

1. Provide a backend endpoint that accepts bounded response text and returns an audio/WAV response when local TTS is available.
2. Use `pyttsx3` or another fully documented local TTS package. Do not silently call a remote text-to-speech service.
3. Use temporary output files and reliably clean them after the response is served.
4. The frontend should play the returned audio in an accessible audio control. If TTS is unavailable, retain the written answer and explain that speech output could not be generated in this environment.

### C. Confidence-aware NLP workflow

Implement the query pipeline as separate services, orchestrated by a single function such as `process_query(text: str) -> QueryResult`. Text and transcribed audio must call this same function.

#### C1. Supported intent classes

Create a manageable initial taxonomy with at least these intent labels:

- `greeting`
- `admission`
- `fees`
- `exam_schedule`
- `timetable`
- `department_course`
- `library`
- `placement`
- `hostel`
- `transport`
- `scholarship`
- `contact_office`
- `complaint`
- `goodbye`
- `other`

Store intent labels in the dataset/configuration, not as duplicated magic strings across the codebase. Create sufficiently varied synthetic utterances for each label—aim for 15–25 examples per class if practical. Clearly label the dataset as synthetic demo data, not real collected student queries.

#### C2. Text preprocessing

Implement a dedicated preprocessing module that:

- normalizes whitespace and casing consistently for model inputs;
- handles punctuation carefully and preserves dates, numerals, course codes, and useful punctuation where relevant;
- does not remove negation terms such as “not”, “never”, and “no” from sentiment-related input;
- does not alter the original user-visible text;
- avoids overly aggressive stemming or lemmatization that damages query meaning;
- includes tests for empty input, extra spaces, mixed casing, punctuation, numerals, and negation.

Use scikit-learn's `TfidfVectorizer` with a documented tokenization and n-gram configuration. For the first version, keeping negation words by not applying broad stop-word removal is preferable to losing their meaning.

#### C3. Intent classifier

- Implement a baseline `TfidfVectorizer` + `LogisticRegression` pipeline in scikit-learn.
- Use a deterministic random seed and a reproducible train/test split. Use stratification where class counts permit it; handle insufficient class sizes gracefully.
- Avoid data leakage: do not fit vectorizers on the entire dataset before splitting.
- Add a training script and an evaluation script, or one well-documented script with explicit train/evaluate commands.
- Persist the trained pipeline using joblib if appropriate. Missing model artifacts must produce a helpful setup error or a documented first-run training path, not a cryptic traceback.
- Use `predict_proba` where supported, but label the output **classifier confidence score**, not a calibrated probability of correctness.
- Generate accuracy, macro precision, macro recall, macro F1, per-class precision/recall/F1, classification report, and confusion matrix from the actual held-out split.
- Include a configurable minimum intent-confidence threshold, selected through validation experiments where practical. Do not pretend an arbitrary threshold is scientifically calibrated.

#### C4. FAQ knowledge base and retrieval

Store FAQs in an editable CSV or JSON file with fields such as:

`faq_id, intent, question, answer, keywords, office_or_category`

Requirements:

- Create representative FAQs for the supported intents.
- Use visibly generic answers and placeholders for unknown institutional facts, such as `[replace with verified fee details]` and `[replace with verified office contact]`.
- Vectorize FAQ questions plus carefully selected keywords using TF-IDF and rank candidates with cosine similarity.
- Keep retrieval separate from intent classification. Return top candidate metadata and score to the decision policy.
- Configure a minimum FAQ similarity threshold. Treat cosine similarity as a relevance score, **not** as a probability.
- Return no answer when the score is below the acceptable threshold. Never invent dates, fees, contacts, policies, or official instructions.
- Provide a small labeled retrieval test file (for example, `query,expected_faq_id`) and compute top-1 retrieval accuracy where feasible.
- Explain how a student can add a new FAQ and validate the dataset without rewriting application code.

#### C5. Decision policy and explanations

Implement the decision logic in a single tested module, with thresholds defined in configuration. Suggested behavior:

1. If the query is empty or invalid, return a validation error.
2. If the top FAQ similarity is below the retrieval threshold, return `no_answer` and recommend contacting the relevant verified office or consulting official sources.
3. If intent confidence is too low, return `clarification_needed` and show useful candidate categories or request a rephrasing.
4. If the predicted intent and top FAQ intent conflict materially, return a clarification status rather than assuming they refer to the same issue.
5. Otherwise return `answered`, with the matched FAQ, answer, intent, entity list, sentiment result, both scores, and a human-readable explanation.

The exact policy may be refined after testing, but it must be deterministic, configurable, and covered by unit tests. Avoid presenting a low-confidence result as certain. If top-k candidates are exposed, do not leak irrelevant internal data and do not show a list of many confusing alternatives.

Suggested response structure:

```json
{
  "status": "answered | clarification_needed | no_answer",
  "original_text": "How can I find the exam timetable?",
  "normalized_text": "how can i find the exam timetable?",
  "predicted_intent": "timetable",
  "intent_confidence": 0.0,
  "entities": [],
  "sentiment": {"label": "neutral", "score": 0.0, "method": "vader"},
  "faq_match": {"faq_id": "FAQ-001", "intent": "timetable", "similarity": 0.0},
  "answer": "[replace with verified timetable instructions]",
  "explanation": "An FAQ match exceeded the configured relevance threshold.",
  "suggestions": []
}
```

The numeric values in this schema are illustrative only. Never hard-code them as model results. Use typed Pydantic response models, and adapt optional fields to the actual status.

#### C6. Entity extraction

- Use spaCy if the English model is installed, with configured phrase matchers/rules for institution-specific terms.
- Support entities such as department, programme/course, semester, date, service, and office where detectable.
- Standardize entities with `text`, `label`, `start`, `end`, and `source` fields.
- Implement a rules-based fallback so the core project still functions without a spaCy model.
- Document that a generic pretrained NER model may not recognize campus-specific entities without custom rules or training examples.

#### C7. Sentiment estimation

- Implement an English sentiment baseline with `vaderSentiment`, mapping outputs to `positive`, `neutral`, or `negative` using documented boundaries.
- Provide a simple fallback if the dependency is absent.
- Keep this component modular and unit-tested.
- For negative sentiment or `complaint` intent, display a restrained suggestion that the user contact or notify the relevant office; do not automatically email anyone or file a real complaint.
- State in the UI and report that sentiment is a noisy text estimate and cannot establish a person's actual emotional state.

### D. FastAPI backend requirements

Organize API routes separately from NLP/audio services. Use Pydantic schemas for JSON inputs/outputs, consistent HTTP status codes, clear validation errors, CORS restricted to configured local frontend origins, and dependency/configuration management through environment variables or a centralized settings module.

Implement at least these routes (names may be adjusted if documented consistently):

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Report backend availability and basic dependency/model readiness |
| `GET` | `/api/config` | Return non-secret UI capabilities, such as ASR/TTS availability and upload limits |
| `POST` | `/api/query/text` | Process a typed or corrected transcript through the common NLP pipeline |
| `POST` | `/api/speech/transcribe` | Accept audio multipart upload and return transcript/status |
| `POST` | `/api/speech/analyze` | Compute bounded speech-feature arrays and metadata |
| `POST` | `/api/speech/synthesize` | Return local TTS audio for validated text when supported |
| `GET` | `/api/analytics/summary` | Return aggregate local usage data, where enabled |
| `GET` | `/api/evaluation` | Return generated evaluation results, or a clear not-yet-generated status |

Additional requirements:

- Place the API under a consistent prefix, such as `/api`.
- Use explicit request and response schemas. Avoid untyped dictionaries everywhere when a clear model is possible.
- Validate question and TTS text length in the backend, not only the frontend.
- Check uploaded file size before decoding. Avoid trusting the filename or client-provided MIME type alone.
- Use temporary-file cleanup in `try/finally` or a reliable background cleanup mechanism.
- Do not expose internal filesystem paths or raw stack traces in API error responses.
- Use structured logging that avoids printing raw questions, full audio content, or sensitive data.
- If optional components are unavailable, health/config responses should describe the capability as unavailable while allowing text queries to remain functional.
- Use a small, documented CORS allowlist for the Vite development origin (normally `http://localhost:5173`) and any explicitly configured local origin. Do not use a wildcard together with credentials.
- Do not expose model files or arbitrary local filesystem paths through HTTP routes.

### E. Analytics and privacy

- Implement SQLite or a similarly simple local store for aggregate query events.
- Default to storing metadata only: timestamp, input mode, intent label, sentiment label, classifier confidence, FAQ similarity, and outcome status.
- Do **not** persist raw question text or audio by default.
- Make analytics logging configurable and document how to disable it.
- If an optional raw-query history feature is implemented, it must be explicitly opt-in, clearly described in the UI, locally stored, and accompanied by a delete/clear-history action. Do not store student names, registration numbers, phone numbers, or other unnecessary personal data.
- Analytics must distinguish live query counts from held-out model-evaluation metrics. Do not mix them.
- Analytics should work gracefully when there are no records yet.

### F. Frontend requirements (React + TypeScript + Vite)

Build the frontend as a real single-page application that calls FastAPI. A suggested layout is a left/sidebar or top navigation with a compact brand area and five sections: Ask VoiceBridge, Speech Lab, Analytics, Model Evaluation, and About & Help.

#### F1. Ask VoiceBridge page

- Text input and submit button with clear validation.
- Audio file input and optional microphone record/stop controls.
- Transcription progress and editable transcript field.
- Separate action to submit the corrected transcript to `/api/query/text`.
- Results area showing status, answer, predicted intent, confidence score, matched FAQ/relevance score, extracted entities, sentiment label, and explanation.
- Visually distinct but restrained states for answered, clarification-needed, and no-answer outcomes.
- Optional “Speak answer” control that calls TTS and plays a returned WAV blob through an accessible `<audio controls>` element.
- Loading indicators, retry behavior, and useful error messages.
- Disable duplicate submissions while a request is in progress.

#### F2. Speech Lab page

- Upload field and analyze action.
- Metadata display: duration, sample rate, selected frame/hop settings, and feature extraction status.
- Responsive waveform, energy, and ZCR line charts.
- Spectrogram and MFCC heatmap with labels and a color scale/legend where appropriate.
- Render plots from real API data. Do not use decorative hard-coded arrays as though they were computed results.
- Downsample/limit points to keep chart interaction responsive.

#### F3. Analytics page

- Summary cards for processed query count, answered percentage, clarification/no-answer count, and negative-sentiment count where these aggregate values exist.
- Charts for intent distribution and sentiment distribution.
- A simple recent-event table may show only non-sensitive event metadata; do not display raw query text by default.
- Add an informative empty state for a new installation.

#### F4. Model Evaluation page

- Fetch results from `/api/evaluation`.
- Show actual accuracy, macro precision, macro recall, and macro F1, plus a per-class report and confusion matrix.
- Show train/test counts and random seed when the evaluation artifact provides them.
- If evaluation has not been run, show instructions to run the backend evaluation script. Do not display fictional scores or placeholder chart bars.

#### F5. About & Help page

- Explain the application pipeline and the distinction between ASR, audio feature extraction, NLP intent classification, FAQ retrieval, and TTS.
- Document supported formats, privacy defaults, limitations, and how to replace sample FAQs.
- Mark the project as a demo, not an official institutional information service.

#### F6. Frontend engineering quality

- Use TypeScript types/interfaces for API inputs and response data.
- Put all API calls in one shared client module; use the `VITE_API_BASE_URL` environment variable, defaulting to `http://localhost:8000` for local development.
- Provide a `.env.example` for the frontend. Never put private secrets in `VITE_*` variables because they are bundled into browser code.
- Keep components small and reusable, such as `QueryForm`, `AudioUploader`, `TranscriptEditor`, `AnswerPanel`, `ConfidenceDetails`, `AudioChart`, `HeatmapCanvas`, `MetricCard`, and `ErrorMessage`.
- Implement clean loading, empty, and error states for every page.
- Ensure labels are associated with inputs, controls are keyboard accessible, colors have adequate contrast, and charts have text labels or summaries.
- Do not render arbitrary HTML from API responses. Render answer text safely as text.
- Add React error handling appropriate for a mini project; avoid unnecessary state-management libraries.

### G. Suggested folder structure

Use this structure or a similarly clean one. Adjust paths when necessary, but document them consistently and make all run commands work from the repository root.

```text
voicebridge/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   └── global.css
│       ├── api/
│       │   ├── client.ts
│       │   └── types.ts
│       ├── components/
│       │   ├── AppLayout.tsx
│       │   ├── Navigation.tsx
│       │   ├── QueryForm.tsx
│       │   ├── AudioUploader.tsx
│       │   ├── TranscriptEditor.tsx
│       │   ├── AnswerPanel.tsx
│       │   ├── ConfidenceDetails.tsx
│       │   ├── AudioCharts.tsx
│       │   ├── HeatmapCanvas.tsx
│       │   ├── MetricCard.tsx
│       │   └── ErrorMessage.tsx
│       └── pages/
│           ├── HomePage.tsx
│           ├── SpeechLabPage.tsx
│           ├── AnalyticsPage.tsx
│           ├── EvaluationPage.tsx
│           └── AboutPage.tsx
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes_health.py
│   │   │   ├── routes_query.py
│   │   │   ├── routes_speech.py
│   │   │   ├── routes_analytics.py
│   │   │   └── routes_evaluation.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── query.py
│   │   │   ├── speech.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   ├── preprocessing.py
│   │   │   ├── intent_classifier.py
│   │   │   ├── faq_retriever.py
│   │   │   ├── entity_extractor.py
│   │   │   ├── sentiment.py
│   │   │   ├── decision_policy.py
│   │   │   ├── query_service.py
│   │   │   ├── speech_to_text.py
│   │   │   ├── text_to_speech.py
│   │   │   ├── audio_features.py
│   │   │   └── analytics_store.py
│   │   ├── data/
│   │   │   ├── intent_examples.csv
│   │   │   ├── faq.csv
│   │   │   └── retrieval_test_cases.csv
│   │   ├── models/
│   │   │   └── .gitkeep
│   │   └── evaluation/
│   │       └── .gitkeep
│   ├── scripts/
│   │   ├── train_intent_model.py
│   │   ├── evaluate_models.py
│   │   └── validate_data.py
│   ├── tests/
│   │   ├── test_preprocessing.py
│   │   ├── test_intent_classifier.py
│   │   ├── test_faq_retriever.py
│   │   ├── test_entity_extractor.py
│   │   ├── test_sentiment.py
│   │   ├── test_decision_policy.py
│   │   ├── test_query_service.py
│   │   ├── test_audio_features.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
├── .gitignore
├── README.md
└── PROJECT_REPORT.md
```

Do not create empty modules just to match this tree. Each created module must serve a clear purpose. A project-level `package.json` or Python packaging file may be used if it simplifies setup, but avoid duplicating configuration unnecessarily.

### H. Dataset and training requirements

1. Create `intent_examples.csv` with columns `text,intent`. Provide varied synthetic examples for all supported intent classes; aim for 15–25 examples per intent where practical.
2. Avoid duplicates and near-identical templated phrases dominating the dataset. Keep the generated dataset clearly identified as synthetic training data.
3. Use a reproducible hold-out split and print the number of records per class. Handle rare classes gracefully.
4. Fit the full sklearn pipeline only on training examples; compute metrics on held-out examples.
5. Create `faq.csv` with safe placeholder content. Avoid falsely implying that sample timings, fees, dates, or phone numbers are official.
6. Create `retrieval_test_cases.csv` with labeled queries for evaluating whether the intended FAQ is retrieved.
7. Add data validation that checks missing fields, empty values, invalid intent labels, duplicate examples, and FAQs referencing unknown intents.
8. Provide clear steps for adding or modifying intents and FAQs and rerunning training/evaluation.
9. Do not manufacture performance claims. Any score displayed in the UI must come from a generated evaluation artifact or actual request result.

### I. API result and visualization formats

Define stable response contracts in Pydantic and matching TypeScript types. Document the contracts in `docs/API_REFERENCE.md`.

For speech analysis, return bounded JSON containing metadata and arrays such as:

- `duration_seconds`, `sample_rate`, `frame_length`, `hop_length`;
- `waveform: {time_seconds: number[], amplitude: number[]}`;
- `energy: {time_seconds: number[], values: number[]}`;
- `zero_crossing_rate: {time_seconds: number[], values: number[]}`;
- `spectrogram: {times: number[], frequencies: number[], values: number[][]}`;
- `mfcc: {times: number[], coefficients: number[], values: number[][]}`.

The array dimensions, orientation of matrix rows/columns, normalization, and units must be documented. Set upper bounds on frames, frequencies, and returned payload size. Downsample waveform arrays if necessary. Avoid sending large unbounded arrays to the browser.

For charts, make sure that matrix orientation is handled correctly: rows should be interpreted consistently as frequency bins or MFCC coefficients, and columns as time frames. Add labels, axes, a legend or color scale, and a short text explanation for each chart.

### J. Testing and reliability

Create automated tests that do not require downloading a large ASR model. At minimum, test:

1. Text preprocessing on empty input, punctuation, extra whitespace, mixed case, numbers, and negation.
2. Intent training/inference returns a supported label and a usable score.
3. FAQ retrieval returns the expected FAQ for a known test query.
4. Unrelated questions trigger safe no-answer behavior rather than an arbitrary answer.
5. Low intent confidence and mismatched intent/FAQ cases follow the clarification policy.
6. Entity extraction detects at least one configured semester, course/department, or service term.
7. Sentiment output uses only valid labels and handles empty input.
8. Query service returns the documented response structure for answered, clarification, and no-answer statuses.
9. Audio feature extraction handles valid WAV, silent audio, very short audio, invalid bytes, and corrupt audio safely.
10. API tests cover health, invalid query input, normal query processing, unsupported audio, and graceful optional-dependency failures where feasible.
11. Frontend `npm run build` succeeds; add focused frontend tests if test tooling is configured, but do not add a large testing framework solely for a tiny project.

Run `pytest` and the frontend production build after implementation. Fix failures where possible and report anything blocked by an unavailable dependency or environment. Provide manual tests for ASR, microphone capture, and TTS because these features may rely on model downloads, browser permissions, codecs, or host audio settings.

### K. Evaluation and honest reporting

The backend evaluation script must generate real artifacts, for example `backend/app/evaluation/intent_metrics.json` and a confusion-matrix data file. Do not check fake values into those files. If no evaluation has run, the UI should show a clear “Evaluation has not been generated” state and command to run it.

Report:

- dataset size and class counts;
- train/test split and random seed;
- accuracy, macro precision, macro recall, macro F1, and per-class metrics;
- confusion matrix generated from held-out data;
- retrieval top-1 accuracy on labeled retrieval examples where enough test cases exist;
- test outcomes, frontend build outcomes, and which speech features were actually tested;
- Python/Node versions, important package versions, CPU/GPU settings, and ASR model size;
- limitations such as small synthetic training data, unseen wording, accent/noise effects, and uncalibrated model scores.

Do not claim accuracy for real student queries when only synthetic examples have been evaluated. Do not claim the model supports all languages, accents, or noisy conditions unless those conditions were systematically tested.

### L. Privacy and application security

- Do not persist audio uploads by default.
- Default query logging to aggregate metadata only; raw text history must be opt-in if implemented at all.
- Clean temporary audio and TTS files even when requests fail.
- Validate upload size, text length, file decodability, and supported formats on the server.
- Restrict CORS to configured frontend origins.
- Avoid hard-coded secrets and machine-specific absolute file paths.
- Never execute or import uploaded content.
- Use safe response serialization and render text as text on the frontend.
- Do not expose the local filesystem, model directories, full stack traces, or environment variables through the API.
- Document the exact data stored by the application and how to disable/clear it.

### M. Implementation phases

**Phase 1 — Inspect and scaffold**

- Inspect the workspace and preserve useful existing files.
- Create `frontend/` and `backend/` with working manifests and clear configuration.
- Implement `/api/health`, frontend API client, basic page layout, navigation, and an API connectivity status.
- Confirm the React app starts and the FastAPI server starts before implementing ML features.

**Phase 2 — Dataset and text pipeline**

- Build synthetic intent examples, FAQ data, and retrieval test cases.
- Implement data validation, preprocessing, intent training/evaluation, FAQ retrieval, entity extraction, sentiment, decision policy, and query service.
- Add unit tests and run them.

**Phase 3 — Core typed-query application**

- Implement `/api/query/text` and the Ask VoiceBridge page.
- Display the complete response schema and safe fallbacks.
- Verify that typed queries work without ASR/TTS dependencies.

**Phase 4 — Speech workflow**

- Add audio upload, optional microphone recording, local ASR, transcript editing, and TTS.
- Keep ASR model loading lazy and temporary-file handling reliable.
- Verify text fallback when speech dependencies fail or are disabled.

**Phase 5 — Speech Lab**

- Implement audio validation and feature extraction.
- Return bounded arrays and render waveform, energy, ZCR, spectrogram, and MFCCs from real data.
- Test normal, silent, very short, and invalid audio.

**Phase 6 — Analytics and model evaluation**

- Implement privacy-aware metadata logging and aggregate analytics.
- Generate the evaluation artifacts and render real metrics and confusion matrix.
- Show useful empty states if no data or evaluation artifact exists.

**Phase 7 — Documentation and final validation**

- Run backend tests, frontend build, data validation, model evaluation, and API smoke tests.
- Fix import errors, incompatible versions, incorrect endpoints, and CORS issues.
- Write README, API reference, architecture explanation, and project report based on the real implementation.
- Provide exact local run instructions, actual test results, known issues, and the final folder tree.

### N. Required documentation

Create a complete `README.md` containing:

- project title, abstract, problem statement, objectives, and scope;
- key features and syllabus mapping;
- system architecture diagram using Mermaid or a clear text diagram;
- technology stack and folder structure;
- exact setup instructions for Windows and Linux where practical;
- required Python and Node.js versions;
- virtual environment creation and Python dependency installation;
- frontend dependency installation and development commands;
- model training, evaluation, data-validation, test, and production-build commands;
- commands to run FastAPI and Vite in separate terminals;
- `VITE_API_BASE_URL`, CORS, and `.env` configuration details;
- ASR model download and first-use behavior, supported audio formats, and common troubleshooting steps;
- how to edit FAQ and intent datasets safely;
- which data is logged and how to disable or clear it;
- evaluation methodology, limitations, and future improvements.

Create `docs/ARCHITECTURE.md` with a component diagram and request/data flows. Create `docs/API_REFERENCE.md` with endpoints, request types, response types, error cases, and sample requests/responses that clearly mark numeric example values as illustrative.

Create `PROJECT_REPORT.md` as a student-adaptable mini-project report with these sections:

1. Abstract
2. Introduction
3. Problem statement
4. Objectives
5. Existing-system limitations
6. Proposed system
7. Functional and non-functional requirements
8. System architecture and data flow
9. Technology stack
10. Module descriptions
11. Algorithms and feature extraction
12. Dataset generation and preparation
13. Implementation details
14. Testing and evaluation methodology
15. Results, filled only with metrics generated by the real evaluation script
16. Limitations
17. Future enhancements
18. Conclusion
19. References to real official documentation

Include and explain the following formulas using consistent window/index definitions:

- **Cosine similarity:** \(\operatorname{sim}(A,B)=\frac{A\cdot B}{\|A\|\,\|B\|}\), used to rank FAQ candidates.
- **Short-time energy:** \(E_m=\sum_{n=0}^{N-1}x^2[n+mH]w[n]\), where \(x\) is the signal, \(w\) is the selected frame window, \(N\) is frame length, and \(H\) is hop length.
- **Zero-crossing rate:** describe it as the fraction/rate of adjacent samples in a frame that change sign, and state the convention used for zeros.
- **MFCC:** explain the sequence from short-time spectrum to Mel filter-bank energies, logarithm, and DCT coefficients. Do not imply MFCC alone is an ASR model.
- **TF-IDF:** explain term weighting and its role in sparse text representation without claiming it provides complete semantic understanding.

References can include official documentation such as React, Vite, FastAPI, scikit-learn, librosa, and faster-whisper repositories/documentation. Do not invent academic papers or unverifiable references.

### O. Demonstration script

Prepare a 3–5 minute demo that follows these steps:

1. Enter a typed question such as “How can I find my exam timetable?”
2. Show its predicted intent, classifier confidence, entity extraction, matched FAQ, similarity score, and decision explanation.
3. Enter an unrelated question and demonstrate the no-answer fallback.
4. Upload a short WAV question, inspect/correct the transcript, and submit the corrected text.
5. Play the response using TTS if the local engine works.
6. Open Speech Lab and explain waveform, spectrogram, MFCC, energy, and ZCR.
7. Open Model Evaluation and describe the real metrics and confusion matrix generated for the synthetic dataset.
8. Open Analytics and explain the difference between live aggregates and evaluation results.

### P. Definition of done

The project is not complete until all applicable checks pass:

- [ ] React + TypeScript + Vite frontend exists and builds successfully.
- [ ] FastAPI backend starts and exposes documented endpoints.
- [ ] Frontend and backend communicate through the shared API client.
- [ ] Typed query works end to end without ASR/TTS.
- [ ] Intent model is trained from local data and reproducibly evaluated.
- [ ] FAQ retrieval uses similarity ranking and safe fallback logic.
- [ ] Intent and retrieval confidence/relevance are separate and visible.
- [ ] Entity extraction and sentiment estimation are implemented and tested.
- [ ] Speech transcription has an editable transcript and gracefully degrades when unavailable.
- [ ] TTS works where supported and fails gracefully otherwise.
- [ ] Speech Lab visualizes waveform, spectrogram, MFCC, short-time energy, and ZCR using real computed data.
- [ ] Analytics are privacy-aware and separate from held-out metrics.
- [ ] Evaluation uses real computed scores and a confusion matrix, never hard-coded results.
- [ ] Backend tests pass or any blockers are clearly reported; frontend production build succeeds.
- [ ] README, architecture documentation, API reference, and project report exist.
- [ ] Demo institutional details are visibly placeholders until verified.
- [ ] No secrets, student personal data, or machine-specific paths are committed.
- [ ] No core feature is represented only by pseudocode or TODOs.

### Q. Final response expected from the coding agent

When the implementation is finished, report:

1. What has been implemented and the main end-to-end workflow.
2. The final folder tree.
3. Exact commands for backend setup/run, frontend setup/run, training, evaluation, data validation, tests, and frontend build.
4. Real metrics and test/build outcomes, including failed or skipped checks.
5. ASR/TTS and microphone support that was actually verified versus what requires local testing.
6. The files a student should edit to add real FAQs and training examples.
7. Known limitations and recommended next steps.

Do not claim completion of a check unless it was run. Begin with Phase 1 and continue through the phases, correcting errors where feasible.

---

## 5. Suggested Architecture

```text
                          REACT + TYPESCRIPT + VITE
┌────────────────────────────────────────────────────────────────────┐
│ Ask VoiceBridge │ Speech Lab │ Analytics │ Evaluation │ Help        │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTP/JSON + multipart audio
                                ▼
                           FASTAPI BACKEND
┌────────────────────────────────────────────────────────────────────┐
│ API routes + validation + CORS + error handling                    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
              ┌─────────────────┴───────────────────┐
              │                                     │
              ▼                                     ▼
     TEXT / NLP PIPELINE                      AUDIO PIPELINE
┌─────────────────────────┐        ┌────────────────────────────────┐
│ Text validation         │        │ Audio upload validation       │
│ Intent classifier       │        │ ASR -> editable transcript     │
│ Entity extraction       │        │ Waveform / spectrogram         │
│ Sentiment estimate      │        │ MFCC / energy / ZCR            │
│ FAQ TF-IDF retrieval    │        │ Local TTS (optional)           │
│ Confidence policy      │        └────────────────────────────────┘
└────────────┬────────────┘
             ▼
┌────────────────────────────────────────────────────────────────────┐
│ Structured response: answer / clarification / no-answer + scores   │
└───────────────────────────────┬────────────────────────────────────┘
                                ▼
                    Frontend result and explanation
                                │
                                ▼
                  Optional aggregate local analytics
```

The transcription workflow must return a transcript to the frontend for review. Only after confirmation should the frontend submit it through the regular text-query endpoint. This avoids having two different query-processing implementations.

---

## 6. Recommended Local Development Commands

The coding agent must verify and adapt these commands to the actual final structure. Document the commands it tested in `README.md`.

### Backend — Windows PowerShell

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts/validate_data.py
python scripts/train_intent_model.py
python scripts/evaluate_models.py
pytest
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Backend — Linux/macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python scripts/validate_data.py
python scripts/train_intent_model.py
python scripts/evaluate_models.py
pytest
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend — separate terminal

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL printed by the command, normally `http://localhost:5173`. Keep the FastAPI server running separately on `http://127.0.0.1:8000`. Configure `VITE_API_BASE_URL` and backend CORS settings to match. Do not claim these commands are verified until they have actually been run on the generated project.

---

## 7. Suggested Evaluation Plan

Use this plan in the implementation and report; record the actual output instead of assuming the result.

| Evaluation area | What to measure | What to report |
|---|---|---|
| Intent classification | Held-out synthetic examples | Accuracy, macro precision, macro recall, macro F1, per-class results, confusion matrix |
| FAQ retrieval | Labeled retrieval test cases | Top-1 correct FAQ rate and the number of cases tested |
| Confidence-aware policy | Correctly answered vs. clarification/no-answer cases | Threshold settings and examples of correct/incorrect decisions |
| Speech transcription | Manually tested clear, short, and noisy recordings | Qualitative behavior, model name, language, CPU settings, known errors |
| Audio features | Valid, silent, short, and malformed WAV samples | Whether extraction succeeded and how invalid input was handled |
| API and frontend | Automated tests and production build | Actual pass/fail status and any untested paths |

The initial dataset is synthetic, so classification scores only indicate performance on that dataset and split. They are not proof of reliability on real student queries. If the dataset is small, include that limitation prominently.

---

## 8. Limitations to Explain in the Viva

- Synthetic training examples are only a starting point and may not represent how actual students phrase queries.
- TF-IDF and Logistic Regression are interpretable baselines but have limited semantic understanding.
- Cosine similarity is not a calibrated probability that an answer is correct.
- The confidence thresholds require validation and may need adjustment as the dataset changes.
- Generic NER models may miss college-specific names and terms without configured rules or custom training.
- ASR performance can vary with accent, noise, microphone quality, language, and the selected model size.
- MFCC, energy, ZCR, and spectrograms describe signal properties; they do not guarantee correct transcription or intent classification.
- Sentiment is a rough text-level estimate and may misinterpret sarcasm, context, or mixed feelings.
- Official fees, schedules, contacts, and policies must come from verified institutional sources before use beyond a demonstration.
- Browser microphone capture and TTS may behave differently across browsers and operating systems.

---

## 9. Optional Future Enhancements

Only consider these after all required workflows, tests, and documentation are complete:

- Tamil-English code-switching and multilingual ASR;
- sentence embeddings for semantic FAQ retrieval, evaluated against the TF-IDF baseline;
- a transformer-based intent classifier for a controlled comparison;
- institution-approved FAQ content with an approval/versioning workflow;
- user feedback to label whether a result was helpful;
- a protected interface for editing FAQs and retraining models;
- exportable evaluation reports and improved accessibility;
- deployment with reviewed privacy, authentication, and resource limits.

**Recommended submission scope:** a React/FastAPI application with text queries, confidence-aware FAQ retrieval, intent classification, entity extraction, sentiment estimation, editable ASR transcription, optional local TTS, Speech Lab visualizations, privacy-aware analytics, genuine model evaluation, automated tests, and complete documentation. This is substantial enough for an intermediate mini project while remaining explainable during a project review or viva.
