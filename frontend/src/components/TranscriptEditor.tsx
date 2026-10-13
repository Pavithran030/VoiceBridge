import React, { useState, useEffect } from 'react';
import { Check, Edit3, Trash2 } from 'lucide-react';

interface TranscriptEditorProps {
  initialTranscript: string;
  durationSeconds?: number;
  onSubmit: (editedText: string) => void;
  onDiscard: () => void;
  isLoading: boolean;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  initialTranscript,
  durationSeconds,
  onSubmit,
  onDiscard,
  isLoading,
}) => {
  const [text, setText] = useState(initialTranscript);

  useEffect(() => {
    setText(initialTranscript);
  }, [initialTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  return (
    <div
      className="card"
      style={{
        border: '1.5px solid #2563eb',
        backgroundColor: '#eff6ff',
      }}
    >
      <div className="card-title">
        <Edit3 size={18} color="#60a5fa" />
        Review & Edit Speech Transcript
      </div>
      <div className="card-subtitle">
        Review the automatic transcription below. You may fix any misrecognized words before querying.
        {durationSeconds ? ` (Audio duration: ${durationSeconds}s)` : ''}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <button type="submit" className="btn" disabled={!text.trim() || isLoading}>
            <Check size={18} />
            Submit Verified Question
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onDiscard}
            disabled={isLoading}
          >
            <Trash2 size={18} />
            Discard
          </button>
        </div>
      </form>
    </div>
  );
};
