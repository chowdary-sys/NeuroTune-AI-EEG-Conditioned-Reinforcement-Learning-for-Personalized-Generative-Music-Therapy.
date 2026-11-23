import React, { useState } from 'react';
import {
  Disc,
  Info,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react';
import { ClosedLoopState, defaultClosedLoopController } from '../services/closedLoopController';

interface ClosedLoopTabProps {
  state: ClosedLoopState;
}

export const ClosedLoopTab: React.FC<ClosedLoopTabProps> = ({ state }) => {
  const [satisfaction, setSatisfaction] = useState<number>(4);
  const [perceivedQuality, setPerceivedQuality] = useState<number>(4);
  const [perceivedShift, setPerceivedShift] = useState<number>(1);
  const [speedMs, setSpeedMs] = useState<number>(3000);

  const applyFeedback = (sat: number, qual: number, shift: number) => {
    setSatisfaction(sat);
    setPerceivedQuality(qual);
    setPerceivedShift(shift);
    defaultClosedLoopController.setUserFeedbackOverride({
      satisfaction: sat,
      perceivedQuality: qual,
      perceivedShift: shift,
    });
  };

  const loopStages = [
    { id: 'eeg_acquisition', title: '1. Read Brainwaves', desc: 'Collect 1 second of 3-sensor signals.' },
    { id: 'preprocessing', title: '2. Clean Signal', desc: 'Remove noise and measure wave bands.' },
    { id: 'emotion_estimation', title: '3. Guess Mood', desc: 'Estimate Mood and Energy on map.' },
    { id: 'rl_decision', title: '4. AI Chooses', desc: 'Pick best speed, feel, and busyness.' },
    { id: 'music_generation', title: '5. Create Music', desc: 'Update chords and melody notes.' },
    { id: 'playback', title: '6. Play Audio', desc: 'Play calming music to listener.' },
    { id: 'listener_feedback', title: '7. Check Rating', desc: 'Read your star feedback and mood shift.' },
    { id: 'policy_update', title: '8. Score and Learn', desc: 'Update AI memory from reward.' },
    { id: 'idle', title: '9. Next Cycle', desc: 'Repeat until calm goal is reached.' },
  ];

  const handleStepOnce = async () => {
    await defaultClosedLoopController.executeSingleStep();
  };

  const handleToggleLoop = () => {
    if (state.isRunning) {
      defaultClosedLoopController.stopContinuousLoop();
    } else {
      defaultClosedLoopController.startContinuousLoop(speedMs);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          Run the therapy loop one step at a time or automatically. Use the star ratings on the left to tell the algorithm how the music sounds; your ratings directly change the reward score on the next step.
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              Live Therapy Loop and Step Log
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Each full session runs for 10 steps, then automatically saves to your Saved Sessions tab.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-xs">
              <span className="text-slate-400">Loop Speed:</span>
              <select
                value={speedMs}
                onChange={(e) => {
                  const s = parseInt(e.target.value, 10);
                  setSpeedMs(s);
                  if (state.isRunning) {
                    defaultClosedLoopController.stopContinuousLoop();
                    defaultClosedLoopController.startContinuousLoop(s);
                  }
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={1500} className="bg-slate-900">Fast (1.5s per step)</option>
                <option value={3000} className="bg-slate-900">Normal (3.0s per step)</option>
                <option value={5000} className="bg-slate-900">Slow (5.0s per step)</option>
              </select>
            </div>

            <button
              onClick={handleStepOnce}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Run 1 Step</span>
            </button>

            <button
              onClick={handleToggleLoop}
              className={`px-5 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                state.isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>{state.isRunning ? 'Pause Loop' : 'Start Live Loop'}</span>
            </button>

            <button
              onClick={() => defaultClosedLoopController.resetSession()}
              className="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md border border-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Start a fresh 10-step session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 mt-6">
          {loopStages.map((stage, idx) => {
            const isStageActive = state.currentStage === stage.id;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isStageActive
                    ? 'bg-cyan-950/60 border-cyan-400'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                  {isStageActive && <span className="text-[10px] font-mono text-cyan-400">ACTIVE</span>}
                </div>
                <div className="text-xs font-semibold text-slate-200 leading-tight">{stage.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-normal">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Rate the Music (Optional)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tell the algorithm how the music sounds right now. Your rating updates the step reward on every step.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 flex justify-between mb-1">
                  <span>1. How much do you enjoy it?</span>
                  <span className="text-amber-400 font-mono font-bold tabular-nums">{satisfaction} / 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => applyFeedback(star, perceivedQuality, perceivedShift)}
                      className="p-1 text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= satisfaction
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 flex justify-between mb-1">
                  <span>2. Does the music sound smooth?</span>
                  <span className="text-cyan-400 font-mono font-bold tabular-nums">{perceivedQuality} / 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => applyFeedback(satisfaction, star, perceivedShift)}
                      className="p-1 text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= perceivedQuality
                            ? 'text-cyan-400 fill-cyan-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 flex justify-between mb-1.5">
                  <span>3. How did it make you feel?</span>
                  <span className="text-emerald-400 font-semibold">
                    {perceivedShift > 0 ? 'More Calm' : 'More Tense'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => applyFeedback(satisfaction, perceivedQuality, 1)}
                    className={`p-2 rounded-md border text-center transition-colors cursor-pointer ${
                      perceivedShift > 0
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Helped Me Relax
                  </button>
                  <button
                    onClick={() => applyFeedback(satisfaction, perceivedQuality, -1)}
                    className={`p-2 rounded-md border text-center transition-colors cursor-pointer ${
                      perceivedShift < 0
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Felt Agitated
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Current Session Progress
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-white tabular-nums">
                Step {state.currentStep} / {state.maxSteps}
              </span>
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                Distance: {state.distanceToTarget.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-xs mt-2 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full transition-all"
                style={{ width: `${(state.currentStep / state.maxSteps) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {state.distanceToTarget <= 0.3
                ? 'Success: Listener is inside the green Calm Goal zone (≤ 0.30).'
                : 'Goal: bring distance down to 0.30 or lower.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Step-by-Step Activity Log
                </h3>
                <p className="text-xs text-slate-400">
                  Every row shows the listener's mood, what music the AI chose, and distance to Calm.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {state.sessionSteps.length} steps recorded
              </span>
            </div>

            {state.sessionSteps.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-slate-400 text-xs">
                No steps yet in this session. Press <strong>Run 1 Step</strong> or <strong>Start Live Loop</strong> above to begin.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 scrollbar-thin">
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-2">Step</th>
                      <th className="py-2 px-2">Mood Before (M, E)</th>
                      <th className="py-2 px-2">Brain Balance</th>
                      <th className="py-2 px-2">Music Played</th>
                      <th className="py-2 px-2 text-right">Reward</th>
                      <th className="py-2 px-2 text-right">Goal Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {state.sessionSteps.map((step) => {
                      const v = step.emotionBefore.valence;
                      const a = step.emotionBefore.arousal;
                      return (
                        <tr key={step.step} className="hover:bg-slate-800/30">
                          <td className="py-2 px-2 text-slate-300 font-bold">#{step.step}</td>
                          <td className="py-2 px-2">
                            <span className={v >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                            </span>
                            ,{' '}
                            <span className={a <= 0 ? 'text-cyan-400' : 'text-amber-400'}>
                              {a > 0 ? `+${a.toFixed(2)}` : a.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-300">
                            {step.eegFeatures.faa > 0 ? `+${step.eegFeatures.faa}` : step.eegFeatures.faa}
                          </td>
                          <td className="py-2 px-2 text-slate-200 font-sans">
                            <span className="text-cyan-300 font-mono font-semibold">{step.selectedAction.tempo} BPM</span> ·{' '}
                            <span className="capitalize">{step.selectedAction.mode}</span> ·{' '}
                            <span className="text-slate-400 capitalize">{step.selectedAction.density}</span>
                          </td>
                          <td
                            className={`py-2 px-2 text-right font-bold ${
                              step.reward.totalReward > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {step.reward.totalReward > 0
                              ? `+${step.reward.totalReward.toFixed(2)}`
                              : step.reward.totalReward.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right text-slate-300 font-semibold">
                            {step.distanceToTarget}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
