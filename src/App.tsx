import React, { useEffect, useState } from 'react';
import { Header, NavTab } from './components/Header';
import { KpiRow } from './components/KpiRow';
import { OverviewTab } from './components/OverviewTab';
import { EegMonitoringTab } from './components/EegMonitoringTab';
import { EmotionDetectionTab } from './components/EmotionDetectionTab';
import { MusicGeneratorTab } from './components/MusicGeneratorTab';
import { ReinforcementLearningTab } from './components/ReinforcementLearningTab';
import { ClosedLoopTab } from './components/ClosedLoopTab';
import { EvaluationTab } from './components/EvaluationTab';
import { SessionHistoryTab } from './components/SessionHistoryTab';
import { PrivacyPolicyTab } from './components/PrivacyPolicyTab';
import { TermsTab } from './components/TermsTab';
import { UserProfileModal } from './components/UserProfileModal';
import { ResearchDocsModal } from './components/ResearchDocsModal';
import {
  ClosedLoopState,
  defaultClosedLoopController,
} from './services/closedLoopController';
import { defaultStorage } from './services/storageService';
import { ListenerProfile } from './types/neurotune';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [loopState, setLoopState] = useState<ClosedLoopState>(defaultClosedLoopController.getState());
  const [activeProfile, setActiveProfile] = useState<ListenerProfile>(defaultStorage.getActiveProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = defaultClosedLoopController.subscribe((newState) => {
      setLoopState(newState);
      setActiveProfile(newState.profile);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const handleToggleLoop = () => {
    if (loopState.isRunning) {
      defaultClosedLoopController.stopContinuousLoop();
    } else {
      defaultClosedLoopController.startContinuousLoop(3000);
    }
  };

  const isLegalPage = activeTab === 'privacy' || activeTab === 'terms';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
        isLoopRunning={loopState.isRunning}
        onToggleLoop={handleToggleLoop}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isLegalPage && <KpiRow state={loopState} />}

        {activeTab === 'overview' && (
          <OverviewTab
            state={loopState}
            onNavigateTab={handleSelectTab}
            onOpenDocsModal={() => setIsDocsModalOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'eeg' && <EegMonitoringTab />}

        {activeTab === 'emotion' && <EmotionDetectionTab />}

        {activeTab === 'music' && <MusicGeneratorTab />}

        {activeTab === 'rl' && <ReinforcementLearningTab />}

        {activeTab === 'closed_loop' && <ClosedLoopTab state={loopState} />}

        {activeTab === 'benchmarks' && <EvaluationTab />}

        {activeTab === 'history' && <SessionHistoryTab />}

        {activeTab === 'privacy' && <PrivacyPolicyTab />}

        {activeTab === 'terms' && <TermsTab />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-400">
            NeuroTune: Closed-Loop EEG Music Therapy Simulation (Not a Medical Device)
          </div>
          <div className="flex items-center gap-5 text-xs">
            <button
              onClick={() => handleSelectTab('overview')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Home
            </button>
            <button
              onClick={() => handleSelectTab('privacy')}
              className={`transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'privacy' ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleSelectTab('terms')}
              className={`transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'terms' ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </footer>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        activeProfile={activeProfile}
        onProfileUpdated={(p) => setActiveProfile(p)}
      />

      <ResearchDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
