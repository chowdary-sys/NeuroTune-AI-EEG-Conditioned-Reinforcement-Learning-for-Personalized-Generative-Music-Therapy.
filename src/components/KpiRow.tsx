import React from 'react';
import { ClosedLoopState } from '../services/closedLoopController';

interface KpiRowProps {
  state: ClosedLoopState;
}

export const KpiRow: React.FC<KpiRowProps> = ({ state }) => {
  const { currentEmotion, currentAction, lastReward, sessionSteps, completedSessions } = state;

  const formatVal = (num: number) => (num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2));

  const recentStepsWithFeedback = sessionSteps.filter((s) => s.userFeedback);
  const avgSatisfaction =
    recentStepsWithFeedback.length > 0
      ? (
          recentStepsWithFeedback.reduce((acc, s) => acc + (s.userFeedback?.satisfaction || 0), 0) /
          recentStepsWithFeedback.length
        ).toFixed(1)
      : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Mood Feel (Valence) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Mood Feel (Valence)
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {formatVal(currentEmotion.valence)}
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-1.5">-1 to +1</span>
        </div>
        <div className="text-[11px] text-slate-400">
          <span className={currentEmotion.valence >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {currentEmotion.valence >= 0 ? 'Positive / Calm' : 'Negative / Upset'}
          </span>
        </div>
      </div>

      {/* 2. Energy Level (Arousal) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Energy Level (Arousal)
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {formatVal(currentEmotion.arousal)}
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-1.5">-1 to +1</span>
        </div>
        <div className="text-[11px] text-slate-400">
          <span className={currentEmotion.arousal <= 0 ? 'text-cyan-400 font-medium' : 'text-amber-400 font-medium'}>
            {currentEmotion.arousal <= 0 ? 'Calm / Low Energy' : 'Tense / High Energy'}
          </span>
        </div>
      </div>

      {/* 3. Music Speed */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Music Playing Now
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-cyan-400">
            {currentAction.tempo}
          </span>
          <span className="text-xs font-mono uppercase text-slate-500 ml-1.5">BPM</span>
        </div>
        <div className="text-[11px] text-slate-400 capitalize">
          {currentAction.mode} ({currentAction.mode === 'major' ? 'bright' : 'soft'}) · {currentAction.density}
        </div>
      </div>

      {/* 4. AI Score (Real state only, zero fake defaults) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Step Reward Score
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-emerald-400">
            {lastReward
              ? lastReward.totalReward > 0
                ? `+${lastReward.totalReward.toFixed(2)}`
                : lastReward.totalReward.toFixed(2)
              : '--'}
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-1.5">
            {lastReward ? 'points' : 'pending'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {lastReward ? `Mood shift: ${formatVal(lastReward.emotionalProgress)}` : 'Run 1 step to score'}
        </div>
      </div>

      {/* 5. Distance to Goal */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Distance to Calm Goal
        </span>
        <div className="my-1.5 flex items-baseline">
          <span
            className={`text-2xl font-mono font-bold tabular-nums ${
              state.distanceToTarget <= 0.3 ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {state.distanceToTarget.toFixed(2)}
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-1.5">goal ≤ 0.30</span>
        </div>
        <div className="text-[11px] text-slate-400">
          {avgSatisfaction ? `Step rating: ${avgSatisfaction} / 5.0` : 'No step rating yet'}
        </div>
      </div>

      {/* 6. Therapy Progress */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400">
          Session Progress
        </span>
        <div className="my-1.5 flex items-baseline">
          <span className="text-2xl font-mono font-bold tabular-nums text-white">
            {state.currentStep}/{state.maxSteps}
          </span>
          <span className="text-[11px] font-mono text-slate-500 ml-1.5">
            steps ({completedSessions.length} saved)
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {state.distanceToTarget <= 0.3 ? 'Inside calm target zone' : 'Target radius: 0.30'}
        </div>
      </div>
    </div>
  );
};
