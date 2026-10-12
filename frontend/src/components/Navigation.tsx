import React from 'react';
import { MessageSquare, Activity, BarChart2, Award, Info } from 'lucide-react';

export type TabType = 'home' | 'speech_lab' | 'analytics' | 'evaluation' | 'about';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="nav-bar" aria-label="Main Navigation">
      <button
        className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <MessageSquare size={18} />
        Ask VoiceBridge
      </button>

      <button
        className={`nav-tab ${activeTab === 'speech_lab' ? 'active' : ''}`}
        onClick={() => onSelectTab('speech_lab')}
      >
        <Activity size={18} />
        Speech Lab
      </button>

      <button
        className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
      >
        <BarChart2 size={18} />
        Analytics
      </button>

      <button
        className={`nav-tab ${activeTab === 'evaluation' ? 'active' : ''}`}
        onClick={() => onSelectTab('evaluation')}
      >
        <Award size={18} />
        Model Evaluation
      </button>

      <button
        className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
        onClick={() => onSelectTab('about')}
      >
        <Info size={18} />
        About & Help
      </button>
    </nav>
  );
};
