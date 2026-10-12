import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import type { TabType } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { SpeechLabPage } from './pages/SpeechLabPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { AboutPage } from './pages/AboutPage';
import type { SystemHealth } from './api/types';
import { apiClient } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await apiClient.getHealth();
        setHealth(res);
      } catch {
        setHealth({
          status: 'error',
          app_name: 'VoiceBridge',
          version: '1.0.0',
          environment: 'offline',
          model_ready: false,
          asr_ready: false,
          tts_ready: false,
        });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'speech_lab':
        return <SpeechLabPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab} health={health}>
      {renderPage()}
    </AppLayout>
  );
};

export default App;
