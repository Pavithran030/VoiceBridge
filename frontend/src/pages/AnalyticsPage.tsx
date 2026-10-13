import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldCheck, RefreshCw, Trash2, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import type { AnalyticsSummaryResponse } from '../api/types';
import { apiClient } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { ErrorMessage } from '../components/ErrorMessage';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const summary = await apiClient.getAnalytics();
      setData(summary);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all logged aggregate query metadata?')) return;
    try {
      await apiClient.clearAnalytics();
      fetchAnalytics();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clear analytics.');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Helpdesk Usage Analytics</h1>
          <p>Aggregate query traffic, resolution performance, and sentiment indicators.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleClear} disabled={isLoading || !data?.total_queries}>
            <Trash2 size={16} />
            Reset Data
          </button>
        </div>
      </div>

      <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />

      {/* Privacy Notice Banner */}
      <div className="success-banner">
        <ShieldCheck size={20} />
        <div>
          <strong>Privacy Preserving Design:</strong> By system default, VoiceBridge logs only aggregate event metadata (timestamp, confidence score, and status). Student question text and audio recordings are never permanently stored.
        </div>
      </div>

      {data && (
        <>
          {/* Summary KPIs */}
          <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
            <MetricCard
              label="Total Queries"
              value={data.total_queries}
              subtext="Handled by Helpdesk"
              icon={<BarChart2 size={18} />}
            />
            <MetricCard
              label="Resolution Rate"
              value={`${data.resolution_rate}%`}
              subtext={`${data.answered_count} answered with high confidence`}
              icon={<CheckCircle size={18} color="#10b981" />}
            />
            <MetricCard
              label="Clarifications"
              value={data.clarification_count}
              subtext="Ambiguous or conflicting topics"
              icon={<HelpCircle size={18} color="#f59e0b" />}
            />
            <MetricCard
              label="No-Answer Fallbacks"
              value={data.no_answer_count}
              subtext="Safely withheld responses"
              icon={<XCircle size={18} color="#ef4444" />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Intent Distribution */}
            <div className="card">
              <div className="card-title">Query Intent Frequency</div>
              <div className="card-subtitle">Distribution of user inquiries across campus departments.</div>
              {Object.keys(data.intent_frequency).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                  {Object.entries(data.intent_frequency).map(([intent, count]) => {
                    const pct = Math.round((count / data.total_queries) * 100);
                    return (
                      <div key={intent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{intent.replace('_', ' ')}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                        </div>
                        <div className="confidence-bar">
                          <div className="confidence-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                  No queries logged yet.
                </div>
              )}
            </div>

            {/* Sentiment Breakdown */}
            <div className="card">
              <div className="card-title">Sentiment Polarity Breakdown</div>
              <div className="card-subtitle">VADER sentiment classifications of incoming student queries.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#34d399' }}>Positive Queries</span>
                    <span>{data.sentiment_breakdown.positive}</span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${data.total_queries ? (data.sentiment_breakdown.positive / data.total_queries) * 100 : 0}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#94a3b8' }}>Neutral Queries</span>
                    <span>{data.sentiment_breakdown.neutral}</span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${data.total_queries ? (data.sentiment_breakdown.neutral / data.total_queries) * 100 : 0}%`,
                        backgroundColor: '#64748b',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: '#f87171' }}>Negative / Grievance Queries</span>
                    <span>{data.sentiment_breakdown.negative}</span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${data.total_queries ? (data.sentiment_breakdown.negative / data.total_queries) * 100 : 0}%`,
                        backgroundColor: '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Event Log Metadata Table */}
          <div className="card">
            <div className="card-title">Recent Event Metadata Audit Log</div>
            <div className="card-subtitle">
              Inspectable log showing how the system handled previous queries (timestamps, confidence, decisions).
            </div>
            {data.recent_events.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Mode</th>
                      <th>Predicted Intent</th>
                      <th>Confidence</th>
                      <th>Similarity</th>
                      <th>Sentiment</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_events.map((evt) => (
                      <tr key={evt.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td>
                          <span className="chip" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {evt.input_mode}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {evt.predicted_intent.replace('_', ' ')}
                        </td>
                        <td>{(evt.intent_confidence * 100).toFixed(1)}%</td>
                        <td>{(evt.faq_similarity * 100).toFixed(1)}%</td>
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>{evt.sentiment_label}</span>
                        </td>
                        <td>
                          <span
                            className="outcome-tag"
                            style={{
                              backgroundColor:
                                evt.status === 'answered'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : evt.status === 'clarification_needed'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)',
                              color:
                                evt.status === 'answered'
                                  ? '#34d399'
                                  : evt.status === 'clarification_needed'
                                  ? '#fbbf24'
                                  : '#f87171',
                            }}
                          >
                            {evt.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No events recorded yet. Try asking a question on the Ask VoiceBridge page!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
