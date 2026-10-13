import React, { useState } from 'react';
import { QueryForm } from '../components/QueryForm';
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
    if (suggestionText.endsWith('?') || suggestionText.startsWith('How') || suggestionText.startsWith('When')) {
      handleTextSubmit(suggestionText);
    } else {
      handleTextSubmit(`Tell me about ${suggestionText}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Campus Helpdesk Assistant</h1>
        <p>Ask campus questions via typed text or speech. Responses are verified against indexed official campus FAQs.</p>
      </div>

      <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />

      {/* Unified Input Component */}
      <QueryForm
        onSubmit={handleTextSubmit}
        onAudioSelected={handleAudioSelected}
        isLoading={isQuerying}
        isTranscribing={isTranscribing}
      />

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

      {/* Answer and Explainability Results */}
      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <AnswerPanel result={result} onSelectSuggestion={handleSuggestionClick} />
          <ConfidenceDetails result={result} />
        </div>
      )}
    </div>
  );
};
