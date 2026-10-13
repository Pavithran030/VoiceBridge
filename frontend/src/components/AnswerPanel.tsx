import React, { useState } from 'react';
import { Volume2, HelpCircle, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import type { QueryResult } from '../api/types';
import { apiClient } from '../api/client';

interface AnswerPanelProps {
  result: QueryResult;
  onSelectSuggestion: (text: string) => void;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({ result, onSelectSuggestion }) => {
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleSpeak = async () => {
    if (!result.answer) return;
    setIsSynthesizing(true);
    setTtsError(null);
    try {
      const audioBlob = await apiClient.synthesizeSpeech(result.answer);
      const url = URL.createObjectURL(audioBlob);
      setTtsAudioUrl(url);
    } catch (err: any) {
      setTtsError(err.message || 'Speech synthesis is unavailable in this environment.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const renderOutcomeHeader = () => {
    switch (result.status) {
      case 'answered':
        return (
          <div className="outcome-banner outcome-answered">
            <div className="outcome-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CheckCircle size={20} />
                <span>Verified Campus FAQ Answer</span>
              </div>
              <span className="outcome-tag">
                Answered
              </span>
            </div>
            <p className="answer-body">{result.answer}</p>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{result.explanation}</div>
          </div>
        );

      case 'clarification_needed':
        return (
          <div className="outcome-banner outcome-clarification">
            <div className="outcome-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <HelpCircle size={20} />
                <span>Clarification Needed</span>
              </div>
              <span className="outcome-tag">
                Ambiguous
              </span>
            </div>
            <p className="answer-body">
              We could not confidently determine your specific question. To ensure you receive
              accurate information, please clarify:
            </p>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{result.explanation}</div>
          </div>
        );

      case 'no_answer':
      default:
        return (
          <div className="outcome-banner outcome-no_answer">
            <div className="outcome-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <AlertTriangle size={20} />
                <span>Information Not Available</span>
              </div>
              <span className="outcome-tag">
                No Match
              </span>
            </div>
            <p className="answer-body">
              No verified campus answer met the required confidence criteria for this inquiry.
            </p>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{result.explanation}</div>
          </div>
        );
    }
  };

  return (
    <div className="card">
      {renderOutcomeHeader()}

      {/* TTS Speech Synthesis Button for answered queries */}
      {result.status === 'answered' && result.answer && (
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleSpeak}
            disabled={isSynthesizing}
          >
            {isSynthesizing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Synthesizing Speech...
              </>
            ) : (
              <>
                <Volume2 size={16} />
                Speak Answer Aloud
              </>
            )}
          </button>

          {ttsAudioUrl && (
            <div className="audio-player-wrapper">
              <audio controls autoPlay src={ttsAudioUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {ttsError && (
            <div style={{ color: '#92400e', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Note: {ttsError}
            </div>
          )}
        </div>
      )}

      {/* Relevant follow-up suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div className="metric-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowRight size={14} />
            Recommended Follow-Ups & Clarifications
          </div>
          <div>
            {result.suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                className="chip chip-suggestion"
                onClick={() => onSelectSuggestion(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
