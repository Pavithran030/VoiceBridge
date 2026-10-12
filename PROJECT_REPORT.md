# VoiceBridge: Speech-Enabled Campus Helpdesk with Confidence-Aware Answer Retrieval and Explainable Speech Feature Analysis

**Academic Project Report**  
*Course:* Natural Language Processing & Speech Processing  
*Level:* Intermediate Undergraduate Mini-Project  

---

## 1. Abstract

Routine student inquiries regarding admissions, examinations, fee deadlines, timetables, and campus facilities frequently overwhelm college administrative offices. Existing conversational solutions often suffer from "hallucination" and uncalibrated overconfidence, providing misleading or fabricated responses when queries are ambiguous or outside their knowledge base. 

This project presents **VoiceBridge**, an explainable, speech-enabled campus helpdesk that combines dual-input query processing (typed text and speech audio) with confidence-aware answer retrieval. Incoming spoken questions are transcribed into text via a local Whisper automatic speech recognition (ASR) model and presented in an interactive editor allowing users to review and correct transcription errors. An applied NLP pipeline normalizes queries, predicts intent categories using a TF-IDF and Logistic Regression classifier, extracts campus entities, estimates sentiment polarity, and retrieves matching FAQs using cosine similarity over TF-IDF vector spaces. 

Crucially, VoiceBridge enforces a **dual-confidence decision policy**: responses are answered only when both intent confidence and FAQ relevance satisfy verified thresholds. In addition, an educational **Speech Lab** module extracts and visualizes acoustic features (waveform, short-time energy, zero-crossing rate, STFT spectrogram, and MFCCs). The system is fully implemented using a React + TypeScript frontend and a FastAPI backend with local SQLite metadata logging.

---

## 2. Introduction

Universities handle large volumes of repetitive student questions each semester. Traditional static FAQ pages force students to search manually through dense documentation, while generic chatbots often misinterpret institution-specific queries. 

Natural Language Processing (NLP) and Speech Processing offer powerful techniques to automate repetitive information retrieval. However, deploying AI systems in educational environments requires transparency, error recovery, and defensible boundaries. VoiceBridge bridges this gap by demonstrating practical speech recognition, statistical text classification, vector space retrieval, and acoustic signal visualization within a single, modular web architecture.

---

## 3. Problem Statement

College students face friction finding accurate, verified institutional policies regarding fees, exam dates, syllabus requirements, and office locations. Existing campus helpdesks suffer from key shortcomings:
1. **Manual Navigation Overhead:** Static web pages require manual keyword searching.
2. **False Confidence in AI Chatbots:** Unconstrained language models often generate invented dates, fees, or policy instructions when an answer is not in their training data.
3. **Speech Recognition Errors:** Accents, ambient noise, and technical jargon cause ASR errors that cascade into incorrect answers when users cannot verify transcripts.
4. **Opaque Decision Making:** Users are rarely informed why a system selected an answer or how certain it is.

---

## 4. Objectives

The primary objectives of VoiceBridge are:
1. To provide a speech-enabled query interface that converts spoken questions into editable text.
2. To build an interpretable statistical NLP pipeline for intent classification, entity extraction, and sentiment estimation.
3. To design a dual-confidence decision policy that withholds low-confidence answers and prompts for clarification instead of guessing.
4. To establish a local FAQ retrieval engine using TF-IDF and cosine similarity with verified placeholders for institutional data.
5. To develop an educational Speech Lab demonstrating Short-Time Energy, Zero-Crossing Rate, STFT spectrograms, and MFCCs from real audio recordings.
6. To conduct empirical evaluation on held-out test splits without fabricated metrics.

---

## 5. Existing-System Limitations

| Feature | Static College Portal | Generic AI Chatbot | VoiceBridge (Proposed) |
|---|---|---|---|
| Input Mode | Keyword search only | Typed text only | Speech & typed text |
| Error Correction | None | Re-prompt required | Editable transcript before NLP |
| Fallback Mechanism | Empty search results | Hallucinated answers | Safe `clarification` or `no_answer` |
| Signal Analysis | None | None | Waveform, STE, ZCR, STFT, MFCC |
| Privacy | Standard web logs | Cloud LLM telemetry | Local SQLite metadata-only log |

---

## 6. Proposed System

VoiceBridge proposes a multi-stage, decoupled architecture:
1. **Audio Capture & ASR:** Browser-based audio capture (`MediaRecorder`) or file upload, transcribed locally via `faster-whisper`.
2. **Transcript Verification:** The user can review, edit, or accept the transcript.
3. **NLP Processing Pipeline:** Unified normalization, TF-IDF vectorization, Logistic Regression intent modeling, entity regex matching, and VADER sentiment analysis.
4. **Knowledge Retrieval:** Cosine similarity scoring over verified college FAQ vectors.
5. **Decision Policy:** Dual threshold checks with safe fallback responses.
6. **Acoustic Analysis:** Dedicated endpoint computing signal properties for visual education.

---

## 7. Functional and Non-Functional Requirements

### Functional Requirements
- **FR-1:** Users must be able to submit text queries up to 1,000 characters.
- **FR-2:** Users must be able to upload or record audio (WAV, MP3, M4A) up to 10 MB.
- **FR-3:** Audio must be transcribed locally and displayed in an editable interface.
- **FR-4:** Intent classifier must predict one of 15 configured campus categories.
- **FR-5:** Decision policy must return `answered`, `clarification_needed`, or `no_answer`.
- **FR-6:** Speech Lab must render interactive charts for Waveform, STE, ZCR, Spectrogram, and MFCC.
- **FR-7:** Analytics must aggregate query counts, resolution rates, and sentiment without persisting raw question text.

### Non-Functional Requirements
- **NFR-1 (Portability):** Completely local execution without external paid APIs or cloud dependencies.
- **NFR-2 (Privacy):** No permanent storage of student voice recordings or raw query strings.
- **NFR-3 (Responsiveness):** Bounded feature arrays to ensure fluid browser chart rendering.
- **NFR-4 (Explainability):** All predictions must include visible confidence scores and explanations.

---

## 8. System Architecture and Data Flow

The system follows a clean client-server architecture:
- **Client Tier:** React 19 + TypeScript + Vite single-page application.
- **API Tier:** FastAPI exposing asynchronous REST endpoints with Pydantic schema validation.
- **ML / Signal Tier:** scikit-learn statistical pipelines, VADER sentiment, faster-whisper ASR, and librosa audio feature extraction.
- **Data Tier:** Local CSV files for datasets and SQLite for aggregate metadata logging.

---

## 9. Technology Stack

- **Frontend:** React 19, TypeScript 5.8, Vite 8.3, HTML5 Canvas, Lucide-React icons.
- **Backend:** Python 3.11, FastAPI 0.143, Uvicorn 0.54, Pydantic 2.14.
- **Machine Learning & NLP:** scikit-learn 1.9, pandas 3.0, numpy 1.26, scipy 1.17, joblib 1.6, vaderSentiment 3.3.
- **Speech & Audio:** librosa 0.11, soundfile 0.14, faster-whisper 1.2, pyttsx3 2.99.
- **Testing & Tooling:** pytest 9.1, httpx 0.28.

---

## 10. Module Descriptions

### 10.1 Text Preprocessing Module (`preprocessing.py`)
Expands English contractions (e.g., *can't* $\to$ *cannot*), normalizes irregular whitespace, lowercases text, and strictly preserves negation terms (*not*, *no*, *never*).

### 10.2 Intent Classifier (`intent_classifier.py`)
Fits a `TfidfVectorizer` (unigrams + bigrams, sublinear TF) coupled with a multinomial `LogisticRegression` model with balanced class weights. Outputs the predicted intent and max softmax confidence score.

### 10.3 FAQ Retriever (`faq_retriever.py`)
Maintains a vector index of campus FAQs (`question` + `keywords` + `office_or_category`). Computes cosine similarity to score candidate relevance in $[0, 1]$.

### 10.4 Decision Policy (`decision_policy.py`)
Implements independent confidence checks:
- $S_{\text{faq}} < 0.30 \implies \text{no\_answer}$
- $p_{\text{intent}} < 0.15 \implies \text{clarification\_needed}$
- Material intent mismatch $\implies \text{clarification\_needed}$
- Meets both thresholds $\implies \text{answered}$

### 10.5 Speech-to-Text & Text-to-Speech (`speech_to_text.py`, `text_to_speech.py`)
Loads `faster-whisper` lazily on CPU using 8-bit quantization (`int8`). Generates speech audio via local `pyttsx3`.

### 10.6 Audio Feature Analysis (`audio_features.py`)
Decodes audio to mono 16 kHz and computes downsampled waveform, Short-Time Energy, Zero-Crossing Rate, STFT Spectrogram, and MFCC arrays.

---

## 11. Mathematical Formulations & Feature Extraction

### 11.1 Cosine Similarity for FAQ Retrieval
Given a query vector $\mathbf{q} \in \mathbb{R}^V$ and an FAQ candidate vector $\mathbf{d} \in \mathbb{R}^V$ in the TF-IDF vector space:
$$\operatorname{sim}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\|_2 \|\mathbf{d}\|_2} = \frac{\sum_{i=1}^V q_i d_i}{\sqrt{\sum_{i=1}^V q_i^2} \sqrt{\sum_{i=1}^V d_i^2}}$$
Cosine similarity evaluates angular orientation rather than vector magnitude, providing length-invariant relevance scoring.

### 11.2 Short-Time Energy (STE)
Speech signals are non-stationary over long durations but quasi-stationary over short time windows (20–30 ms). The short-time energy of frame $m$ with hop length $H$, window function $w[n]$, and frame length $N$ is defined as:
$$E_m = \sum_{n=0}^{N-1} \big(x[n + mH] \cdot w[n]\big)^2$$
High short-time energy typically indicates voiced speech (vowels), while low energy indicates unvoiced speech or silence.

### 11.3 Zero-Crossing Rate (ZCR)
The zero-crossing rate measures the rate at which signal samples alternate sign across a frame:
$$\text{ZCR}_m = \frac{1}{2(N-1)} \sum_{n=1}^{N-1} \big|\operatorname{sgn}(x[n + mH]) - \operatorname{sgn}(x[n - 1 + mH])\big|$$
where $\operatorname{sgn}(x) = 1$ if $x \ge 0$, and $-1$ if $x < 0$. High ZCR correlates with high-frequency unvoiced consonants (such as fricatives /s/, /sh/) and background noise.

### 11.4 Mel-Frequency Cepstral Coefficients (MFCCs)
The extraction of MFCCs proceeds in five distinct stages:
1. **Framing & Windowing:** The signal is partitioned into overlapping frames multiplied by a Hann window $w[n] = 0.5 - 0.5 \cos(2\pi n / (N-1))$.
2. **Short-Time Fourier Transform:** Discrete Fourier Transform computes the complex spectrum:
   $$X_m[k] = \sum_{n=0}^{N-1} x[n + mH] w[n] e^{-j 2\pi k n / N}$$
3. **Power Spectrum:** $P_m[k] = \frac{1}{N} |X_m[k]|^2$.
4. **Mel Filterbank Integration:** Energy is passed through $M$ triangular bandpass filters spaced linearly below 1 kHz and logarithmically above 1 kHz according to the Mel scale:
   $$f_{\text{mel}} = 2595 \log_{10}\left(1 + \frac{f}{700}\right)$$
5. **Logarithm & Discrete Cosine Transform (DCT):** Taking the logarithm models human loudness perception. Applying the DCT decorrelates the filterbank energies into cepstral coefficients:
   $$c_m[n] = \sum_{m=1}^M \log(S_m) \cos\left[\frac{\pi n}{M}\left(m - \frac{1}{2}\right)\right]$$
In VoiceBridge, the first 13 coefficients are retained as static acoustic descriptors.

### 11.5 TF-IDF Term Weighting
Term Frequency-Inverse Document Frequency represents words by balancing local term occurrence with corpus-wide specificity:
$$\operatorname{TF-IDF}(t, d, D) = \operatorname{TF}(t, d) \times \operatorname{IDF}(t, D)$$
where sublinear term frequency is $\operatorname{TF}(t, d) = 1 + \log(\operatorname{count}(t, d))$ for $\operatorname{count} > 0$, and:
$$\operatorname{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

---

## 12. Dataset Generation and Preparation

The project constructs three dedicated dataset files:
1. **`intent_examples.csv`:** 232 synthetic labeled training examples evenly distributed across 15 campus intent classes (15–18 samples per class): `greeting`, `admission`, `fees`, `exam_schedule`, `timetable`, `department_course`, `library`, `placement`, `hostel`, `transport`, `scholarship`, `contact_office`, `complaint`, `goodbye`, and `other`.
2. **`faq.csv`:** 30 comprehensive FAQ records with verified administrative placeholders (e.g., `[replace with verified fee details]`).
3. **`retrieval_test_cases.csv`:** 29 ground-truth query-FAQ pairs for top-1 retrieval evaluation.

Data integrity is verified before training using `validate_data.py`, ensuring absence of null values, orphaned references, or invalid intent labels.

---

## 13. Implementation Details

- **Backend Scaffolding:** Implemented in `backend/app/` using FastAPI routers, dependency injection, and Pydantic schemas.
- **Frontend Scaffolding:** Built with React 19, TypeScript, and Vite in `frontend/`, using native Canvas elements for rendering spectrogram and MFCC heatmaps.
- **Model Training:** Stratified train/test split (75% train / 25% test, `random_state=42`) executed in `train_intent_model.py`. Model pipeline persisted to `intent_model.joblib`.
- **Speech Processing:** `faster-whisper` lazily loaded with CPU int8 quantization to prevent unnecessary memory footprint during text-only requests.

---

## 14. Testing and Evaluation Methodology

The project underwent automated testing across 34 unit and integration test cases covering:
1. Text normalization and negation preservation;
2. Intent classifier inference and score bounds;
3. FAQ cosine similarity retrieval;
4. Rule-based campus entity detection;
5. VADER sentiment classification;
6. Dual-confidence decision policy branches;
7. Signal analysis on normal, silent, very short, and corrupted WAV files;
8. API endpoints via FastAPI `TestClient`.

---

## 15. Empirical Results

All results reported below were generated directly from the held-out test split (58 samples) by `evaluate_models.py` without data leakage:

### Intent Classification Metrics (15 Classes, Held-out Test Split)
- **Total Dataset:** 232 synthetic samples
- **Training Split:** 174 samples (75%)
- **Held-out Test Split:** 58 samples (25%)
- **Random Seed:** 42
- **Overall Accuracy:** **53.45%** ($0.5345$)
- **Macro Precision:** **59.78%** ($0.5978$)
- **Macro Recall:** **53.33%** ($0.5333$)
- **Macro F1-Score:** **52.84%** ($0.5284$)

### FAQ Retrieval Performance
- **Labeled Retrieval Test Cases:** 29 queries
- **Correct Top-1 FAQ Retrievals:** 23 queries
- **Top-1 Retrieval Accuracy:** **79.31%** ($0.7931$)

### Automated Test Suite
- **Pytest Suite:** 34 tests collected, **34 passed (100%)** in 22.73s.
- **Frontend Production Build:** `npm run build` completed with zero TypeScript errors.

---

## 16. Limitations

1. **Synthetic Data Scope:** The initial dataset consists of synthetic student queries. Performance on actual campus student queries may vary due to informal phrasing, typos, and multi-sentence inquiries.
2. **Bag-of-Words Representation:** TF-IDF captures lexical overlap but does not understand deep contextual polysemy or syntactic nuances.
3. **Score Calibration:** Classifier softmax scores and cosine similarities represent relative ranking signals rather than true probabilities of factual correctness.
4. **ASR Noise Sensitivity:** Offline CPU Whisper performance depends on microphone clarity, background acoustic noise, and speaker accent.

---

## 17. Future Enhancements

1. Multilingual speech recognition supporting regional language mixing (e.g., Tamil-English code-switching).
2. Dense semantic embeddings (such as Sentence-BERT) for hybrid dense-sparse FAQ retrieval.
3. Administrative web dashboard for non-technical staff to update FAQs and trigger automated retraining.
4. Active learning workflow collecting anonymized user feedback to expand training data.

---

## 18. Conclusion

VoiceBridge demonstrates that speech-enabled educational helpdesks can achieve high reliability not through unconstrained generation, but through **disciplined confidence verification and transparent error recovery**. By enabling users to correct ASR transcripts, applying dual-confidence checks, and offering an explainable Speech Lab, VoiceBridge bridges classroom theory and full-stack software engineering for intermediate undergraduate NLP and speech processing coursework.

---

## 19. Official References

1. **FastAPI Documentation:** Tiangolo, S. *FastAPI Framework*, https://fastapi.tiangolo.com/
2. **React Documentation:** Meta Open Source, *React: The library for web and native user interfaces*, https://react.dev/
3. **Vite Documentation:** Evan You et al., *Vite Next Generation Frontend Tooling*, https://vite.dev/
4. **scikit-learn:** Pedregosa et al., *Scikit-learn: Machine Learning in Python*, JMLR 12, pp. 2825-2830, 2011. https://scikit-learn.org/
5. **librosa:** McFee et al., *librosa: Audio and Music Signal Analysis in Python*, https://librosa.org/
6. **Faster-Whisper:** SYSTRAN, *Faster Whisper transcription with CTranslate2*, https://github.com/SYSTRAN/faster-whisper
7. **VADER Sentiment:** Hutto, C.J. & Gilbert, E.E., *VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text*, ICWSM 2014.
