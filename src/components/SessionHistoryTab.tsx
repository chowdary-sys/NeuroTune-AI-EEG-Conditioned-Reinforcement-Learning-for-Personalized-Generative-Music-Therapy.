import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileJson,
  FolderOpen,
  Trash2,
  XCircle,
} from 'lucide-react';
import { defaultStorage } from '../services/storageService';
import { SessionRecord } from '../types/neurotune';

export const SessionHistoryTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>(defaultStorage.getSessionHistory());
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear session telemetry logs?')) {
      defaultStorage.clearSessions();
      setSessions([]);
    }
  };

  const handleExportJson = () => {
    const jsonStr = defaultStorage.exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neurotune_research_sessions_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>RESEARCH REPOSITORY</span>
            <span>·</span>
            <span>AUDIT & REPRODUCIBILITY LOG</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            Session Archives & Neural Trajectories
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persistent records of closed-loop iterations, extracted spectral features, and REINFORCE returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Archive JSON</span>
          </button>
          {sessions.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-mono border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear all stored session logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No Recorded Sessions Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-mono">
            Execute closed-loop iterations from the "Closed Loop" or "Overview" tab to log full EEG trajectories and policy updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const startTimeStr = new Date(session.startTime).toLocaleString();
            return (
              <div
                key={session.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Session Card Header */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{session.userName}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {session.id}
                        </span>
                        {session.converged ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Target Reached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                            Sub-threshold
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        Started: {startTimeStr} · Steps: {session.steps.length} · Algorithm:{' '}
                        {session.algorithm}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Initial Affect</div>
                      <div className="text-slate-200 font-semibold">
                        V: {session.initialEmotion.valence.toFixed(2)} · A:{' '}
                        {session.initialEmotion.arousal.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Final Affect</div>
                      <div className="text-cyan-400 font-semibold">
                        V: {session.finalEmotion.valence.toFixed(2)} · A:{' '}
                        {session.finalEmotion.arousal.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Mean Reward</div>
                      <div className="text-emerald-400 font-bold">
                        +{session.averageReward.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Target Dist</div>
                      <div className="text-slate-300 font-bold">
                        {session.finalDistance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Session Step Log Details */}
                {isExpanded && (
                  <div className="p-5 bg-slate-950/80 border-t border-slate-800">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                      Step-by-Step EEG & Policy Decision Trace
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                            <th className="py-2 px-2">Step</th>
                            <th className="py-2 px-2">EEG Preprocessing (FAA, Arousal)</th>
                            <th className="py-2 px-2">Emotion Estimate (V, A)</th>
                            <th className="py-2 px-2">Selected Music Action</th>
                            <th className="py-2 px-2 text-right">Step Reward</th>
                            <th className="py-2 px-2 text-right">Target Dist</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {session.steps.map((st) => (
                            <tr key={st.step} className="hover:bg-slate-900/50">
                              <td className="py-2 px-2 text-slate-300 font-bold">#{st.step}</td>
                              <td className="py-2 px-2 text-slate-400">
                                FAA: {st.eegFeatures.faa} · Ratio: {st.eegFeatures.arousalRatio}
                              </td>
                              <td className="py-2 px-2">
                                <span className={st.emotionBefore.valence >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  V: {st.emotionBefore.valence > 0 ? `+${st.emotionBefore.valence}` : st.emotionBefore.valence}
                                </span>
                                ,{' '}
                                <span className={st.emotionBefore.arousal <= 0 ? 'text-cyan-400' : 'text-amber-400'}>
                                  A: {st.emotionBefore.arousal > 0 ? `+${st.emotionBefore.arousal}` : st.emotionBefore.arousal}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-slate-200">
                                <strong className="text-cyan-300">{st.selectedAction.tempo} BPM</strong> ·{' '}
                                <span className="capitalize">{st.selectedAction.mode}</span> ·{' '}
                                <span>{st.selectedAction.density}</span>
                              </td>
                              <td
                                className={`py-2 px-2 text-right font-bold ${
                                  st.reward.totalReward > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {st.reward.totalReward > 0
                                  ? `+${st.reward.totalReward.toFixed(2)}`
                                  : st.reward.totalReward.toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-right text-slate-300 font-semibold">
                                {st.distanceToTarget}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
