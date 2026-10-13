# VoiceBridge — Purpose & Models Explained

---

## 🎯 Main Purpose

**VoiceBridge** is a **Speech-Enabled Campus Helpdesk** — an offline AI assistant that lets students ask campus-related questions either by **typing** or **speaking**, and receives verified answers from a campus FAQ database.

The core problem it solves:

> *"Instead of blindly generating a plausible-sounding answer like ChatGPT, VoiceBridge only gives an answer when it is **confident** — otherwise it safely says 'I don't know' and suggests where to get help."*

This is called **Confidence-Aware Answer Retrieval** — the key academic contribution of the project.

---

## 🧠 Models Trained

There are **2 machine learning models** trained in this project:

---

### Model 1: Intent Classifier

**What it does:** Reads a student's question and predicts *what topic* the student is asking about (fees, hostel, exams, library, etc.)

| Property | Details |
|---|---|
| **Algorithm** | Multinomial Logistic Regression |
| **Features** | TF-IDF vectorizer (unigrams + bigrams, sublinear scaling) |
| **Classes** | 15 campus intent categories |
| **Training data** | 174 synthetic student queries (75% split) |
| **Test data** | 58 held-out queries (25% split, no leakage) |
| **Accuracy** | **53.45%** on 15-class held-out test set |

**Training Pipeline (`train_intent_model.py`):**

```
Raw CSV (intent_examples.csv)
        ↓
Stratified Train/Test Split (75/25, seed=42)
        ↓
TF-IDF Vectorizer → fits on TRAINING data only
        ↓
Logistic Regression (balanced class weights)
        ↓
Pipeline serialized → app/models/intent_model.joblib
```

---

### Model 2: FAQ Retriever

**What it does:** Given a student's question, finds the most *relevant* FAQ entry from the campus knowledge base using cosine similarity.

| Property | Details |
|---|---|
| **Algorithm** | TF-IDF Cosine Similarity (no neural network) |
| **Method** | Vector Space Model — query vs. FAQ question vectors |
| **Knowledge base** | 29 FAQ entries across 15 campus categories |
| **Threshold** | Similarity must be ≥ 30% to return an answer |
| **Top-1 Accuracy** | **79.31%** (23/29 test cases correct) |

**How it works at query time:**

```
Student query text
        ↓
Normalize + Clean (lowercase, expand contractions, preserve negations)
        ↓
TF-IDF vectorize the query
        ↓
Compute cosine similarity against ALL 29 FAQ vectors
        ↓
Pick highest-similarity FAQ
        ↓
If similarity < 0.30 → Reject (no hallucination)
If similarity ≥ 0.30 → Return FAQ answer
```

---

## 🔗 How Both Models Work Together — Dual-Confidence Policy

This is the most important part — both scores are checked **independently**:

```
Student Question
       │
       ├──► Intent Classifier → Confidence Score (e.g. 17.8%)
       │         Must be ≥ 15% threshold
       │
       └──► FAQ Retriever → Similarity Score (e.g. 67.1%)
                 Must be ≥ 30% threshold
                          │
              ┌───────────┴───────────┐
              │                       │
        BOTH pass              Either fails
              │                       │
        ✅ ANSWERED           ⚠️ Clarification Needed
      (return FAQ answer)       or ❌ No Answer
```

> Even if the FAQ similarity is very high, if the intent classifier is uncertain — the system still withholds the answer and asks for clarification. This prevents **confident-wrong answers**.

---

## 🗣️ Other Components (Not "Trained" — Rule-Based / Pre-trained)

| Component | Method |
|---|---|
| **Speech Recognition (ASR)** | Pre-trained `faster-whisper` (`tiny` model, CPU int8) — loaded, not retrained |
| **Text-to-Speech (TTS)** | `pyttsx3` — OS-level speech synthesis, no training |
| **Sentiment Analysis** | VADER — rule-based lexicon, no training needed |
| **Campus Entity Extraction** | Regex pattern rules (department names, semesters, dates) |
| **Signal Processing** (Speech Lab) | `librosa` mathematics — no ML, pure DSP formulas for Waveform / STE / ZCR / STFT / MFCC |

---

## 📂 To Retrain the Models Yourself

```powershell
cd E:\Academics\SLP\Mini_Project\backend

# Step 1: Validate dataset integrity
.\.venv\Scripts\python.exe scripts/validate_data.py

# Step 2: Train Intent Classifier → saves intent_model.joblib
.\.venv\Scripts\python.exe scripts/train_intent_model.py

# Step 3: Evaluate on held-out test set → saves intent_metrics.json
.\.venv\Scripts\python.exe scripts/evaluate_models.py
```

---

## 📊 Quick Summary

| What | How |
|---|---|
| **Purpose** | Offline campus FAQ helpdesk with voice input — answers only when confident |
| **Input modes** | Typed text OR microphone speech OR audio file upload |
| **ML Model 1** | TF-IDF + Logistic Regression → Intent classification (15 classes) |
| **ML Model 2** | TF-IDF Cosine Similarity → FAQ retrieval (threshold-gated) |
| **Safety mechanism** | Dual-confidence policy — BOTH classifier AND retriever must pass threshold |
| **Speech features** | Whisper ASR (input) + pyttsx3 TTS (output) + librosa signal analysis |
| **Privacy** | No raw query text or audio is ever stored — only aggregate metadata in SQLite |
