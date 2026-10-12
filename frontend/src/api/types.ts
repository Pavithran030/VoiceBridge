export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  model_ready: boolean;
  asr_ready: boolean;
  tts_ready: boolean;
}

export interface SystemConfig {
  app_name: string;
  version: string;
  max_text_length: number;
  max_audio_size_bytes: number;
  supported_audio_extensions: string[];
  intent_confidence_threshold: number;
  faq_similarity_threshold: number;
  asr_enabled: boolean;
  tts_enabled: boolean;
  asr_model_name: string;
}

export interface EntityItem {
  text: string;
  label: string;
  start: number;
  end: number;
  source: 'spacy' | 'rules';
}

export interface SentimentResult {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
  method: 'vader' | 'lexicon_fallback';
}

export interface FaqMatch {
  faq_id: string;
  intent: string;
  similarity: number;
  question: string;
  office_or_category?: string;
}

export interface QueryResult {
  status: 'answered' | 'clarification_needed' | 'no_answer';
  original_text: string;
  normalized_text: string;
  predicted_intent: string;
  intent_confidence: number;
  entities: EntityItem[];
  sentiment: SentimentResult;
  faq_match: FaqMatch | null;
  answer: string | null;
  explanation: string;
  suggestions: string[];
}

export interface TranscriptionResponse {
  transcript: string;
  status: 'success' | 'empty' | 'error';
  language: string;
  duration_seconds: number;
  message: string;
}

export interface TimeSeriesData {
  time_seconds: number[];
  values: number[];
}

export interface WaveformData {
  time_seconds: number[];
  amplitude: number[];
}

export interface SpectrogramData {
  times: number[];
  frequencies: number[];
  values: number[][];
}

export interface MfccData {
  times: number[];
  coefficients: number[];
  values: number[][];
}

export interface SpeechAnalysisResponse {
  duration_seconds: number;
  sample_rate: number;
  frame_length: number;
  hop_length: number;
  num_mfcc: number;
  waveform: WaveformData;
  energy: TimeSeriesData;
  zero_crossing_rate: TimeSeriesData;
  spectrogram: SpectrogramData;
  mfcc: MfccData;
  notes: string;
}

export interface EventMetadata {
  id: number;
  timestamp: string;
  input_mode: string;
  predicted_intent: string;
  intent_confidence: number;
  faq_similarity: number;
  status: string;
  sentiment_label: string;
}

export interface AnalyticsSummaryResponse {
  total_queries: number;
  answered_count: number;
  clarification_count: number;
  no_answer_count: number;
  resolution_rate: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  intent_frequency: Record<string, number>;
  recent_events: EventMetadata[];
}

export interface ModelEvaluationData {
  generated: boolean;
  message?: string;
  dataset_info?: {
    total_samples: number;
    train_samples: number;
    test_samples: number;
    random_seed: number;
    class_counts: Record<string, number>;
  };
  overall_metrics?: {
    accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
  };
  classification_report?: Record<string, any>;
  confusion_matrix?: {
    labels: string[];
    matrix: number[][];
  };
  retrieval_metrics?: {
    total_test_cases: number;
    correct_count: number;
    top1_accuracy: number;
  };
}
