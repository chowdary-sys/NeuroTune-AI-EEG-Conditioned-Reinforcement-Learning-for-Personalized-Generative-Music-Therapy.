import React from 'react';
import { Activity, BookOpen, User } from 'lucide-react';
import { ListenerProfile } from '../types/neurotune';

export type NavTab =
  | 'overview'
  | 'eeg'
  | 'emotion'
  | 'music'
  | 'rl'
  | 'closed_loop'
  | 'benchmarks'
  | 'history'
  | 'privacy'
  | 'terms';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeProfile: ListenerProfile;
  onOpenProfileModal: () => void;
  onOpenDocsModal: () => void;
  isLoopRunning: boolean;
  onToggleLoop: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeProfile,
  onOpenProfileModal,
  onOpenDocsModal,
  isLoopRunning,
  onToggleLoop,
}) => {
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'overview', label: 'Home' },
    { id: 'eeg', label: 'Brainwaves' },
    { id: 'emotion', label: 'Mood Map' },
    { id: 'music', label: 'Music Player' },
    { id: 'rl', label: 'AI Brain' },
    { id: 'closed_loop', label: 'Live Loop' },
    { id: 'benchmarks', label: 'Paper Results' },
    { id: 'history', label: 'Saved Sessions' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand wordmark */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span className="p-1.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-400">
                <Activity className="w-5 h-5" />
              </span>
              NeuroTune
            </button>
          </div>

          {/* Single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action buttons (non-pill rectangular shapes, zero purple/indigo) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenDocsModal}
              title="Read a simple guide to the research paper"
              className="px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-md border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Paper Guide</span>
            </button>

            <button
              onClick={onOpenProfileModal}
              title="Pick or customize the listener profile"
              className="px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[110px] truncate">{activeProfile.name.split('(')[0].trim()}</span>
            </button>

            <button
              onClick={onToggleLoop}
              className={`px-4 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isLoopRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {isLoopRunning ? 'Pause Therapy' : 'Start Therapy'}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
