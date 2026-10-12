import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, icon }) => {
  return (
    <div className="metric-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div className="metric-label">{label}</div>
        {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      </div>
      <div className="metric-value">{value}</div>
      {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtext}</div>}
    </div>
  );
};
