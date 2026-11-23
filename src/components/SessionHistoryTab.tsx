import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FolderOpen,
  Info,
  Trash2,
} from 'lucide-react';
import { defaultStorage } from '../services/storageService';
import { SessionRecord } from '../types/neurotune';

export const SessionHistoryTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>(defaultStorage.getSessionHistory());
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    defaultStorage.clearSessions();
    setSessions([]);
    setConfirmClear(false);
  };

  const handleExportJson = () => {
    const jsonStr = defaultStorage.exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neurotune_saved_sessions_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Plain-English Explainer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          Every time you finish a 10-step therapy session, it is saved here automatically. Click any saved session card to inspect every music change and mood step from start to finish.
        </div>
      </div>

      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            Saved Therapy Sessions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review past sessions, see if the listener reached the Calm Goal, or download your history as a JSON file.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download History (.json)</span>
          </button>
          {sessions.length > 0 && (
            <button
              onClick={handleClear}
              onBlur={() => setConfirmClear(false)}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Delete all saved sessions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? 'Click Again to Confirm' : 'Clear History'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">No Saved Sessions Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Press <strong>Start Therapy</strong> at the top of the screen (or finish 10 steps in <strong>Live Loop</strong>) and your completed session will appear right here.
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
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{session.userName}</span>
                        {session.converged ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Calm Goal Reached!
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                            Getting Closer
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {startTimeStr} · {session.steps.length} steps · {session.algorithm}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 font-mono text-xs tabular-nums">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Start Mood</div>
                      <div className="text-slate-200 font-semibold">
                        M: {session.initialEmotion.valence.toFixed(2)} · E: {session.initialEmotion.arousal.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">End Mood</div>
                      <div className="text-cyan-400 font-semibold">
                        M: {session.finalEmotion.valence.toFixed(2)} · E: {session.finalEmotion.arousal.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Avg AI Score</div>
                      <div className="text-emerald-400 font-bold">
                        +{session.averageReward.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Final Distance</div>
                      <div className="text-slate-200 font-bold">
                        {session.finalDistance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-slate-950/80 border-t border-slate-800">
                    <h5 className="text-xs font-semibold text-slate-300 mb-3">
                      Step-by-Step Breakdown
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs tabular-nums">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                            <th className="py-2 px-2">Step</th>
                            <th className="py-2 px-2">Brain Balance & Energy</th>
                            <th className="py-2 px-2">Mood Estimate (M, E)</th>
                            <th className="py-2 px-2">Music Played</th>
                            <th className="py-2 px-2 text-right">AI Score</th>
                            <th className="py-2 px-2 text-right">Goal Distance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {session.steps.map((st) => (
                            <tr key={st.step} className="hover:bg-slate-900/50">
                              <td className="py-2 px-2 text-slate-300 font-bold">#{st.step}</td>
                              <td className="py-2 px-2 text-slate-400">
                                FAA: {st.eegFeatures.faa} · Ratio: {st.eegFeatures.arousalRatio}
                              </td>
                              <td className="py-2 px-2">
                                <span className={st.emotionBefore.valence >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {st.emotionBefore.valence > 0 ? `+${st.emotionBefore.valence}` : st.emotionBefore.valence}
                                </span>
                                ,{' '}
                                <span className={st.emotionBefore.arousal <= 0 ? 'text-cyan-400' : 'text-amber-400'}>
                                  {st.emotionBefore.arousal > 0 ? `+${st.emotionBefore.arousal}` : st.emotionBefore.arousal}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-slate-200 font-sans">
                                <strong className="text-cyan-300 font-mono">{st.selectedAction.tempo} BPM</strong> ·{' '}
                                <span className="capitalize">{st.selectedAction.mode}</span> ·{' '}
                                <span className="capitalize">{st.selectedAction.density}</span>
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
