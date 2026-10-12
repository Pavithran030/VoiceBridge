import React, { useState } from 'react';
import { QueryForm } from '../components/QueryForm';
import { AudioUploader } from '../components/AudioUploader';
import { TranscriptEditor } from '../components/TranscriptEditor';
import { AnswerPanel } from '../components/AnswerPanel';
import { ConfidenceDetails } from '../components/ConfidenceDetails';
import { ErrorMessage } from '../components/ErrorMessage';
import type { QueryResult } from '../api/types';
import { apiClient } from '../api/client';

export const HomePage: React.FC = () => {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [transcriptDuration, setTranscriptDuration] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTextSubmit = async (text: string) => {
    setIsQuerying(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.queryText(text);
      setResult(res);
      // Clear transcript editor if it was open
      setPendingTranscript(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process question.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAudioSelected = async (file: File) => {
    setIsTranscribing(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.transcribeAudio(file);
      if (res.status === 'success' && res.transcript) {
        setPendingTranscript(res.transcript);
        setTranscriptDuration(res.duration_seconds);
      } else {
        setErrorMessage(
          res.message || 'Could not transcribe speech. Please type your query directly.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Error occurred during speech recognition. You can still type your query.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    // If the suggestion is a question, run it directly
    if (suggestionText.endsWith('?') || suggestionText.startsWith('How') || suggestionText.startsWith('When')) {
      handleTextSubmit(suggestionText);
    } else {
      // Re-query with the suggested topic
      handleTextSubmit(`Tell me about ${suggestionText}`);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Ask VoiceBridge Helpdesk
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Ask questions regarding admissions, fees, exam timetables, departments, library, hostels, or transport.
        </p>
      </div>

      <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />

      {/* Primary Input Section */}
      <div className="card">
        <QueryForm onSubmit={handleTextSubmit} isLoading={isQuerying} />
        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            OR USE VOICE
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>
        <AudioUploader
          onAudioSelected={handleAudioSelected}
          isTranscribing={isTranscribing}
        />
      </div>

      {/* Editable Speech Transcript Section */}
      {pendingTranscript && (
        <TranscriptEditor
          initialTranscript={pendingTranscript}
          durationSeconds={transcriptDuration}
          onSubmit={handleTextSubmit}
          onDiscard={() => setPendingTranscript(null)}
          isLoading={isQuerying}
        />
      )}

      {/* NLP Answer and Explainability Results */}
      {result && (
        <div style={{ marginTop: '2rem' }}>
          <AnswerPanel result={result} onSelectSuggestion={handleSuggestionClick} />
          <ConfidenceDetails result={result} />
        </div>
      )}
    </div>
  );
};
