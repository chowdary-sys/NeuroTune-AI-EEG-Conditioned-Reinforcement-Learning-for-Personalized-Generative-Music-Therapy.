/**
 * NeuroTune AI – EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy
 * Main Application Root
 */

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
    // Subscribe to real-time closed-loop state updates
    const unsubscribe = defaultClosedLoopController.subscribe((newState) => {
      setLoopState(newState);
      setActiveProfile(newState.profile);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleLoop = () => {
    if (loopState.isRunning) {
      defaultClosedLoopController.stopContinuousLoop();
    } else {
      defaultClosedLoopController.startContinuousLoop(3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header (3-zone contract) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
        isLoopRunning={loopState.isRunning}
        onToggleLoop={handleToggleLoop}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Telemetry Ribbon */}
        <KpiRow state={loopState} />

        {/* Tab View Routing */}
        {activeTab === 'overview' && (
          <OverviewTab
            state={loopState}
            onNavigateTab={setActiveTab}
            onOpenDocsModal={() => setIsDocsModalOpen(true)}
          />
        )}

        {activeTab === 'eeg' && <EegMonitoringTab />}

        {activeTab === 'emotion' && <EmotionDetectionTab />}

        {activeTab === 'music' && <MusicGeneratorTab />}

        {activeTab === 'rl' && <ReinforcementLearningTab />}

        {activeTab === 'closed_loop' && <ClosedLoopTab state={loopState} />}

        {activeTab === 'benchmarks' && <EvaluationTab />}

        {activeTab === 'history' && <SessionHistoryTab />}
      </main>

      {/* Research Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            NeuroTune AI · "EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy"
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Client Engine: Web Audio + TS + Recharts</span>
            <span>·</span>
            <span>Backend: FastAPI + SciPy</span>
            <span>·</span>
            <span>Simulated Cohort N=512</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
