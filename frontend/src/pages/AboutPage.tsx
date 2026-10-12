import React from 'react';
import { BookOpen, Layers, Code2, AlertTriangle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          About VoiceBridge
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Architectural documentation, syllabus concept mapping, and student guide for academic reviews.
        </p>
      </div>

      {/* Project Overview */}
      <div className="card">
        <div className="card-title">
          <BookOpen size={20} color="#38bdf8" />
          Project Concept & Objectives
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          <strong>VoiceBridge</strong> is a dual-input (text and speech) campus helpdesk designed for intermediate-level undergraduate coursework in Natural Language Processing and Speech Processing. Unlike basic chatbots that blindly generate plausible answers, VoiceBridge employs <strong>confidence-aware query evaluation</strong>. It separately evaluates classifier intent confidence and FAQ cosine similarity, withholding answers or requesting clarification whenever evidence is weak.
        </p>
      </div>

      {/* Syllabus Concept Mapping Table */}
      <div className="card">
        <div className="card-title">
          <Layers size={20} color="#818cf8" />
          Mapping to Subject Syllabus
        </div>
        <div className="card-subtitle">
          Demonstrated implementation of foundational NLP and speech processing principles.
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Syllabus Concept</th>
                <th>VoiceBridge Implementation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Text Preprocessing</strong></td>
                <td>Regex normalization, whitespace cleaning, contraction expansion, and negation preservation.</td>
              </tr>
              <tr>
                <td><strong>Vector Space Model & TF-IDF</strong></td>
                <td>Sublinear TF-IDF vectorization with unigrams and bigrams for intent modeling and FAQ cosine similarity ranking.</td>
              </tr>
              <tr>
                <td><strong>Statistical Machine Learning</strong></td>
                <td>Multinomial Logistic Regression with balanced class weights trained strictly on stratified training splits.</td>
              </tr>
              <tr>
                <td><strong>Named Entity Recognition (NER)</strong></td>
                <td>Regex pattern matchers for campus entities (departments, semesters, services, offices, dates) with spaCy fallback.</td>
              </tr>
              <tr>
                <td><strong>Sentiment Classification</strong></td>
                <td>VADER sentiment polarity scoring with compound thresholding into Positive, Neutral, and Negative.</td>
              </tr>
              <tr>
                <td><strong>Short-Time Signal Analysis</strong></td>
                <td>Frame-based Short-Time Energy (STE) and Zero-Crossing Rate (ZCR) computation using Hann windows.</td>
              </tr>
              <tr>
                <td><strong>Time-Frequency Representation</strong></td>
                <td>Short-Time Fourier Transform (STFT) magnitude spectrogram converted to logarithmic decibel scale.</td>
              </tr>
              <tr>
                <td><strong>Cepstral Speech Features</strong></td>
                <td>Mel-Frequency Cepstral Coefficients (MFCCs) computed via triangular Mel filterbanks and discrete cosine transform.</td>
              </tr>
              <tr>
                <td><strong>Automatic Speech Recognition</strong></td>
                <td>Local, offline speech-to-text inference powered by faster-whisper CPU int8 quantization.</td>
              </tr>
              <tr>
                <td><strong>Evaluation & Verification</strong></td>
                <td>Empirical accuracy, macro precision/recall/F1, confusion matrix, and top-1 FAQ retrieval verification.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Add or Modify FAQs Guide */}
      <div className="card">
        <div className="card-title">
          <Code2 size={20} color="#34d399" />
          How to Customize Campus FAQs & Retrain Models
        </div>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            VoiceBridge separates data from code so students can adapt it to any real university without modifying Python or React source files:
          </p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>
              Edit <code>backend/app/data/faq.csv</code> to add or update campus questions, answers, and department tags. Replace placeholders like <code>[replace with verified fee details]</code> with real institutional information.
            </li>
            <li>
              Add representative student question variations to <code>backend/app/data/intent_examples.csv</code>.
            </li>
            <li>
              Validate the data integrity by running:
              <br />
              <code style={{ color: '#38bdf8' }}>python scripts/validate_data.py</code>
            </li>
            <li>
              Retrain the intent classification pipeline:
              <br />
              <code style={{ color: '#38bdf8' }}>python scripts/train_intent_model.py</code>
            </li>
            <li>
              Generate new evaluation metrics and confusion matrices:
              <br />
              <code style={{ color: '#38bdf8' }}>python scripts/evaluate_models.py</code>
            </li>
          </ol>
        </div>
      </div>

      {/* Viva Defense & Technical Limitations */}
      <div className="card">
        <div className="card-title">
          <AlertTriangle size={20} color="#f59e0b" />
          Key Limitations to Discuss During Project Defense
        </div>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '0.5rem' }}>
          <li>
            <strong>Synthetic Training Data:</strong> Training and evaluation was conducted on synthetic campus utterances. Real student queries often contain typos, regional slang, or multi-topic questions.
          </li>
          <li>
            <strong>Bag-of-Words Limitation:</strong> TF-IDF and Logistic Regression are computationally lightweight and interpretable, but they lack deep contextual word embeddings found in transformers.
          </li>
          <li>
            <strong>Acoustic Features vs ASR:</strong> Visualizing MFCCs, energy, and spectrograms in the Speech Lab demonstrates acoustic signal properties; these raw visual features alone do not decode linguistic phonemes.
          </li>
          <li>
            <strong>Confidence Calibration:</strong> Classifier softmax probabilities and FAQ cosine similarities are heuristic ranking scores rather than mathematically calibrated probabilities of factual correctness.
          </li>
        </ul>
      </div>
    </div>
  );
};
