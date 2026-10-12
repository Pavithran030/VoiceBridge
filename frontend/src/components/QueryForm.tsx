import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface QueryFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  maxLength?: number;
}

export const QueryForm: React.FC<QueryFormProps> = ({
  onSubmit,
  isLoading,
  maxLength = 1000,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <label htmlFor="query-input" className="label">
        Type your campus question:
      </label>
      <textarea
        id="query-input"
        className="textarea"
        rows={3}
        placeholder="e.g. When do end semester exams begin, or how do I apply for hostel rooms?"
        value={query}
        onChange={(e) => setQuery(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {query.length} / {maxLength} characters
        </span>
        <button
          type="submit"
          className="btn"
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send size={18} />
              Ask VoiceBridge
            </>
          )}
        </button>
      </div>
    </form>
  );
};
