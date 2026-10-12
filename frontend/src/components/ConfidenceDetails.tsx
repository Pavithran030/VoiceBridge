import React from 'react';
import { Tag, Smile, Frown, Meh, Cpu, BookOpen } from 'lucide-react';
import type { QueryResult } from '../api/types';

interface ConfidenceDetailsProps {
  result: QueryResult;
}

export const ConfidenceDetails: React.FC<ConfidenceDetailsProps> = ({ result }) => {
  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <Smile size={16} color="#34d399" />;
      case 'negative':
        return <Frown size={16} color="#f87171" />;
      default:
        return <Meh size={16} color="#94a3b8" />;
    }
  };

  const intentConfPct = Math.round(result.intent_confidence * 100);
  const faqSimPct = result.faq_match ? Math.round(result.faq_match.similarity * 100) : 0;

  return (
    <div className="card">
      <div className="card-title">
        <Cpu size={20} color="#818cf8" />
        NLP Explainability & Confidence Metrics
      </div>
      <div className="card-subtitle">
        Transparent view into dual-confidence thresholds, entities, and sentiment signals.
      </div>

      <div className="metrics-grid">
        {/* Intent Confidence Card */}
        <div className="metric-box">
          <div className="metric-label">Predicted Intent</div>
          <div className="metric-value" style={{ textTransform: 'capitalize' }}>
            {result.predicted_intent.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Classifier Score: {intentConfPct}%
          </div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${intentConfPct}%` }} />
          </div>
        </div>

        {/* FAQ Similarity Card */}
        <div className="metric-box">
          <div className="metric-label">FAQ Relevance</div>
          <div className="metric-value">
            {result.faq_match ? `${faqSimPct}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Match: {result.faq_match?.faq_id || 'None above threshold'}
          </div>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width: `${faqSimPct}%`,
                background: faqSimPct > 40 ? 'linear-gradient(90deg, #3b82f6, #10b981)' : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Sentiment Card */}
        <div className="metric-box">
          <div className="metric-label">Estimated Sentiment</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            {getSentimentIcon(result.sentiment.label)}
            <span style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>
              {result.sentiment.label}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Score: {result.sentiment.score} ({result.sentiment.method})
          </div>
        </div>
      </div>

      {/* Extracted Entities */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="metric-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Tag size={14} />
          Detected Campus Entities
        </div>
        {result.entities.length > 0 ? (
          <div>
            {result.entities.map((ent, idx) => (
              <span key={idx} className="chip">
                <strong>{ent.text}</strong> ({ent.label} • {ent.source})
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No specific campus entities (e.g. course code, office, semester) matched.
          </span>
        )}
      </div>

      {/* Matched FAQ Details */}
      {result.faq_match && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={14} />
            Closest FAQ Question:
          </div>
          <div style={{ fontSize: '0.95rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
            "{result.faq_match.question}"
          </div>
        </div>
      )}
    </div>
  );
};
