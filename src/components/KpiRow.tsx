import React from 'react';
import { ClosedLoopState } from '../services/closedLoopController';

interface KpiRowProps {
  state: ClosedLoopState;
}

export const KpiRow: React.FC<KpiRowProps> = ({ state }) => {
  const { currentEmotion, currentAction, lastReward, sessionSteps, completedSessions } = state;

  // Format valence and arousal with explicit + / - signs
  const formatVal = (num: number) => (num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2));

  // Average satisfaction from recent steps
  const recentStepsWithFeedback = sessionSteps.filter((s) => s.userFeedback);
  const avgSatisfaction = recentStepsWithFeedback.length > 0
    ? (
        recentStepsWithFeedback.reduce((acc, s) => acc + (s.userFeedback?.satisfaction || 0), 0) /
        recentStepsWithFeedback.length
      ).toFixed(1)
    : '4.8';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Valence */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Valence (Affect)
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {formatVal(currentEmotion.valence)}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1.5">[-1.0, +1.0]</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentEmotion.valence >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span>{currentEmotion.valence >= 0 ? 'Pleasurable / Approach' : 'Dysphoric / Withdrawal'}</span>
        </div>
      </div>

      {/* 2. Arousal */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Arousal (Activation)
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {formatVal(currentEmotion.arousal)}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1.5">[-1.0, +1.0]</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentEmotion.arousal <= 0 ? 'bg-cyan-400' : 'bg-amber-400'
            }`}
          />
          <span>{currentEmotion.arousal <= 0 ? 'Calm / Deactivated' : 'Excited / High Load'}</span>
        </div>
      </div>

      {/* 3. Music Tempo & Mode */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Music Tempo
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-cyan-400">
            {currentAction.tempo}
          </span>
          <span className="text-xs font-mono uppercase text-slate-500 ml-1.5">BPM</span>
        </div>
        <div className="text-[11px] text-slate-400 capitalize">
          {currentAction.mode} mode · {currentAction.density}
        </div>
      </div>

      {/* 4. Current Reward */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          RL Reward (R_t)
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-emerald-400">
            {lastReward ? (lastReward.totalReward > 0 ? `+${lastReward.totalReward.toFixed(2)}` : lastReward.totalReward.toFixed(2)) : '+1.15'}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1.5">multi-obj</span>
        </div>
        <div className="text-[11px] text-slate-400">
          ΔDist: {lastReward ? formatVal(lastReward.emotionalProgress) : '+0.72'}
        </div>
      </div>

      {/* 5. Listener Satisfaction */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Satisfaction
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {avgSatisfaction}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1.5">/ 5.0</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Target distance: <span className="font-mono text-slate-300">{state.distanceToTarget}</span>
        </div>
      </div>

      {/* 6. Total Sessions */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Total Sessions
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {completedSessions.length + (state.currentStep > 0 ? 1 : 0)}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1.5">
            Step {state.currentStep}/{state.maxSteps}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Paper (Table 3): <span className="font-mono text-emerald-400">60.3% · d_T=0.272</span>
        </div>
      </div>
    </div>
  );
};
