import type {
  SystemHealth,
  SystemConfig,
  QueryResult,
  TranscriptionResponse,
  SpeechAnalysisResponse,
  AnalyticsSummaryResponse,
  ModelEvaluationData
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Keep default errorDetail
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const apiClient = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getConfig(): Promise<SystemConfig> {
    const res = await fetch(`${API_BASE}/api/config`);
    return handleResponse<SystemConfig>(res);
  },

  async queryText(text: string): Promise<QueryResult> {
    const res = await fetch(`${API_BASE}/api/query/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse<QueryResult>(res);
  },

  async transcribeAudio(file: File): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio_file', file);
    const res = await fetch(`${API_BASE}/api/speech/transcribe`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<TranscriptionResponse>(res);
  },

  async analyzeAudio(file: File): Promise<SpeechAnalysisResponse> {
    const formData = new FormData();
    formData.append('audio_file', file);
    const res = await fetch(`${API_BASE}/api/speech/analyze`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<SpeechAnalysisResponse>(res);
  },

  async synthesizeSpeech(text: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/api/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      let msg = 'Failed to synthesize speech';
      try {
        const err = await res.json();
        if (err.detail) msg = err.detail;
      } catch {}
      throw new Error(msg);
    }
    return res.blob();
  },

  async getAnalytics(): Promise<AnalyticsSummaryResponse> {
    const res = await fetch(`${API_BASE}/api/analytics/summary`);
    return handleResponse<AnalyticsSummaryResponse>(res);
  },

  async clearAnalytics(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/api/analytics/clear`, {
      method: 'POST',
    });
    return handleResponse<{ status: string }>(res);
  },

  async getEvaluation(): Promise<ModelEvaluationData> {
    const res = await fetch(`${API_BASE}/api/evaluation`);
    return handleResponse<ModelEvaluationData>(res);
  },
};
