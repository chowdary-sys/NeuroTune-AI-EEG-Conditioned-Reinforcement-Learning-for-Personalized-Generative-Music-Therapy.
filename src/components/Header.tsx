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
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand wordmark */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span className="p-1.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-700">
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
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenDocsModal}
              title="Read a simple guide to the research paper"
              className="px-2.5 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <span className="hidden sm:inline">Paper Guide</span>
            </button>

            <button
              onClick={onOpenProfileModal}
              title="Pick or customize the listener profile"
              className="px-3 py-2 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5 text-cyan-600" />
              <span className="max-w-[110px] truncate">{activeProfile.name.split('(')[0].trim()}</span>
            </button>

            <button
              onClick={onToggleLoop}
              className={`px-4 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isLoopRunning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {isLoopRunning ? 'Pause Therapy' : 'Start Therapy'}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
