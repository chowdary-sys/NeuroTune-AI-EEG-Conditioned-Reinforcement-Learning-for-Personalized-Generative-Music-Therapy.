import React, { useState } from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  ChevronRight,
  Disc,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { ClosedLoopState, defaultClosedLoopController } from '../services/closedLoopController';
import { EmotionCircumplex } from './EmotionCircumplex';

interface ClosedLoopTabProps {
  state: ClosedLoopState;
}

export const ClosedLoopTab: React.FC<ClosedLoopTabProps> = ({ state }) => {
  const [satisfaction, setSatisfaction] = useState<number>(4);
  const [perceivedQuality, setPerceivedQuality] = useState<number>(4);
  const [perceivedShift, setPerceivedShift] = useState<number>(1);
  const [speedMs, setSpeedMs] = useState<number>(3000);

  const loopStages = [
    {
      id: 'eeg_acquisition',
      title: '1. EEG Acquisition',
      desc: 'Acquire 128 raw samples across F3, F4, Pz leads at 128 Hz.',
    },
    {
      id: 'preprocessing',
      title: '2. Preprocessing & PSD',
      desc: 'Biquad filter 0.5-45Hz, compute Theta, Alpha, Beta & FAA.',
    },
    {
      id: 'emotion_estimation',
      title: '3. Affective Decoder',
      desc: 'Ridge Regression estimates continuous Valence & Arousal.',
    },
    {
      id: 'rl_decision',
      title: '4. REINFORCE Decision',
      desc: 'Sample Tempo from N(μ(s), σ²), Mode and Density from Softmax.',
    },
    {
      id: 'music_generation',
      title: '5. Procedural Synthesis',
      desc: 'Web Audio API updates polyphonic chords, scale, and density.',
    },
    {
      id: 'playback',
      title: '6. Acoustic Stimulus',
      desc: 'Real-time auditory entrainment stimulus delivered to listener.',
    },
    {
      id: 'listener_feedback',
      title: '7. Feedback Collection',
      desc: 'Subjective rating (1-5 stars) and perceived emotional shift.',
    },
    {
      id: 'policy_update',
      title: '8. Policy Update',
      desc: 'Calculate R_t and optimize REINFORCE policy parameters.',
    },
    {
      id: 'idle',
      title: '9. Next Window Cycle',
      desc: 'Listener physiology transitions towards target; loop repeats.',
    },
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
      {/* Control Console */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CLOSED-LOOP CONTROLLER</span>
              <span>·</span>
              <span>CONTINUOUS NEURAL FEEDBACK ARCHITECTURE</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RotateCcw className={`w-5 h-5 text-cyan-400 ${state.isRunning ? 'animate-spin' : ''}`} />
              Closed-Loop Execution & Real-Time Observer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cycle continuously or advance step-by-step to observe how generative music parameters entrain brain dynamics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-500">Speed:</span>
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
                <option value={1500} className="bg-slate-900">1.5s / step (Fast)</option>
                <option value={3000} className="bg-slate-900">3.0s / step (Normal)</option>
                <option value={5000} className="bg-slate-900">5.0s / step (Relaxed)</option>
              </select>
            </div>

            <button
              onClick={handleStepOnce}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step Single Window</span>
            </button>

            <button
              onClick={handleToggleLoop}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                state.isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/40'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${state.isRunning ? 'animate-spin' : ''}`} />
              <span>{state.isRunning ? 'Pause Loop' : 'Run Continuous Loop'}</span>
            </button>

            <button
              onClick={() => defaultClosedLoopController.resetSession()}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer text-xs"
              title="Reset current session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 9-Stage Flow Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 mt-6">
          {loopStages.map((stage, idx) => {
            const isStageActive = state.currentStage === stage.id;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all ${
                  isStageActive
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                  {isStageActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                </div>
                <div className="text-xs font-semibold text-slate-200 leading-tight">{stage.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">{stage.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Feedback Collection & Step History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Listener Feedback Submission (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Listener Subjective Feedback Intake
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Feedback updates w₄ in multi-objective reward R_t
            </p>

            <div className="space-y-4">
              {/* Satisfaction Rating */}
              <div>
                <label className="text-xs font-mono text-slate-300 flex justify-between mb-1">
                  <span>Perceived Satisfaction:</span>
                  <span className="text-amber-400 font-bold">{satisfaction} / 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSatisfaction(star)}
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

              {/* Perceived Music Quality */}
              <div>
                <label className="text-xs font-mono text-slate-300 flex justify-between mb-1">
                  <span>Acoustic Consonance Quality:</span>
                  <span className="text-cyan-400 font-bold">{perceivedQuality} / 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setPerceivedQuality(star)}
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

              {/* Perceived Emotional Shift */}
              <div>
                <label className="text-xs font-mono text-slate-300 flex justify-between mb-1.5">
                  <span>Felt Emotional Direction:</span>
                  <span className="text-emerald-400 font-bold">
                    {perceivedShift > 0 ? '+ Uplifted / Soothed' : '- Increased Tension'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    onClick={() => setPerceivedShift(1)}
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      perceivedShift > 0
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    + Toward Goal
                  </button>
                  <button
                    onClick={() => setPerceivedShift(-1)}
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      perceivedShift < 0
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    - Agitated
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 leading-normal">
                Subjective inputs adjust the online reward scalar before being packaged with EEG state features for the next REINFORCE episode.
              </div>
            </div>
          </div>

          {/* Active Decision KPI Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Session Progress
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-white">
                Step {state.currentStep} / {state.maxSteps}
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Dist: {state.distanceToTarget}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${(state.currentStep / state.maxSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Step Telemetry Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Session Decision Telemetry Log
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Full step-by-step sequence of EEG features, affective predictions, actions, and rewards
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {state.sessionSteps.length} recorded steps
              </span>
            </div>

            {state.sessionSteps.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs">
                No steps executed in this session yet. Click "Step Single Window" or "Run Continuous Loop" to observe closed-loop entrainment.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-2">Step</th>
                      <th className="py-2 px-2">Affect (V, A)</th>
                      <th className="py-2 px-2">FAA</th>
                      <th className="py-2 px-2">Action</th>
                      <th className="py-2 px-2 text-right">Reward R_t</th>
                      <th className="py-2 px-2 text-right">Target Dist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
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
                          <td className="py-2 px-2 text-slate-200">
                            <span className="text-cyan-300 font-semibold">{step.selectedAction.tempo} BPM</span> ·{' '}
                            <span className="capitalize">{step.selectedAction.mode}</span> ·{' '}
                            <span className="text-slate-400">{step.selectedAction.density}</span>
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
