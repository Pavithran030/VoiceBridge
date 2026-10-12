import React from 'react';
import { Volume2 } from 'lucide-react';
import { Navigation } from './Navigation';
import type { TabType } from './Navigation';
import type { SystemHealth } from '../api/types';

interface AppLayoutProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  health: SystemHealth | null;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  health,
  children,
}) => {
  const isOnline = health?.status === 'ok';

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Volume2 size={24} color="#fff" />
          </div>
          <div>
            <div className="brand-title">VoiceBridge</div>
            <div className="brand-subtitle">
              Speech-Enabled Campus Helpdesk • NLP & Signal Processing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`status-badge ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span className="pulse-dot" />
            <span>{isOnline ? 'Backend Online (Port 8000)' : 'Connecting to API...'}</span>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <Navigation activeTab={activeTab} onSelectTab={onSelectTab} />

      {/* Main Page Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <strong>VoiceBridge: Speech-Enabled Campus Helpdesk</strong> • Academic Mini Project
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
          Dual-Confidence Retrieval • Local Whisper ASR • librosa Speech Lab • VADER Sentiment • SQLite Privacy Log
        </div>
        <div style={{ marginTop: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
          Notice: Institutional dates, fees, and contacts are synthetic demo placeholders. Consult verified administrative offices for real campus policies.
        </div>
      </footer>
    </div>
  );
};
