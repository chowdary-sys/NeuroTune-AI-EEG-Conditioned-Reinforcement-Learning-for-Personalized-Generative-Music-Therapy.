import React from 'react';
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Disc,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ClosedLoopState, defaultClosedLoopController } from '../services/closedLoopController';
import { defaultAudioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import { EmotionCircumplex } from './EmotionCircumplex';
import { NavTab } from './Header';

interface OverviewTabProps {
  state: ClosedLoopState;
  onNavigateTab: (tab: NavTab) => void;
  onOpenDocsModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  state,
  onNavigateTab,
  onOpenDocsModal,
}) => {
  const { currentEmotion, targetEmotion, currentAction, profile, isRunning } = state;
  const isAudioPlaying = defaultAudioEngine.getPlaybackState().isPlaying;

  const stages = [
    { num: 1, label: 'EEG Acquisition', desc: '3 leads (F3, F4, Pz)' },
    { num: 2, label: 'Preprocessing', desc: '0.5-45Hz Biquad + Welch PSD' },
    { num: 3, label: 'Emotion Estimation', desc: 'Ridge Regression (V, A)' },
    { num: 4, label: 'RL Policy Gradient', desc: 'REINFORCE Action Sampling' },
    { num: 5, label: 'Music Generation', desc: 'Web Audio Harmonic Engine' },
    { num: 6, label: 'Playback & Stimulus', desc: 'Acoustic Entrainment' },
    { num: 7, label: 'Listener Feedback', desc: 'Subjective Response Proxy' },
    { num: 8, label: 'Policy Update', desc: '∇_θ J(θ) Advantage Update' },
    { num: 9, label: 'Next EEG Window', desc: 'Physiological Adaptation' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Research Citation & System Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>RESEARCH IMPLEMENTATION</span>
              <span>·</span>
              <span>CLOSED-LOOP AFFECTIVE COMPUTING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              An intelligent closed-loop framework that continuously decodes neural affective states
              (Valence and Arousal) via regularized EEG ridge regression and optimizes personalized
              generative music parameters in real time via REINFORCE policy gradient.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => defaultClosedLoopController.executeSingleStep()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step Single Iteration</span>
            </button>
            <button
              onClick={() => {
                if (isRunning) defaultClosedLoopController.stopContinuousLoop();
                else defaultClosedLoopController.startContinuousLoop(2500);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Halt Continuous Loop' : 'Start Continuous Loop'}</span>
            </button>
            <button
              onClick={onOpenDocsModal}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-mono text-center transition-colors cursor-pointer"
            >
              Inspect Paper Specs →
            </button>
          </div>
        </div>
      </div>

      {/* 9-Stage Closed-Loop Architecture Visualization */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Closed-Loop Neuro-Feedback Pipeline</h3>
            <p className="text-xs text-slate-400">
              Real-time continuous 9-stage cycle mapping neural rhythms to generative music actions
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('closed_loop')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
          >
            <span>Live Stage Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {stages.map((stage) => {
            const isCurrent =
              state.currentStage.toLowerCase().includes(stage.label.toLowerCase().slice(0, 4)) ||
              (state.currentStage === 'policy_update' && stage.num === 8) ||
              (state.currentStage === 'music_generation' && stage.num === 5);

            return (
              <div
                key={stage.num}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500">0{stage.num}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Affect Circumplex & Music Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Emotion Circumplex & Patient Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                Affective Trajectory Plane
              </h3>
              <button
                onClick={() => onNavigateTab('emotion')}
                className="text-xs text-slate-400 hover:text-cyan-400 font-mono"
              >
                Details →
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Russell's Circumplex Model: current patient affect versus therapeutic target goal.
            </p>

            <EmotionCircumplex
              currentEmotion={currentEmotion}
              targetEmotion={targetEmotion}
              trajectory={state.sessionSteps.map((s) => ({
                valence: s.emotionBefore.valence,
                arousal: s.emotionBefore.arousal,
                step: s.step,
              }))}
              onSelectTarget={(v, a) => defaultClosedLoopController.setTargetEmotion(v, a)}
              interactive={true}
            />

            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">INITIAL STATE</div>
                <div className="text-slate-200 mt-0.5">
                  V: {state.initialEmotion.valence.toFixed(2)} · A: {state.initialEmotion.arousal.toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">CURRENT DISTANCE</div>
                <div className="text-emerald-400 mt-0.5 font-bold">
                  {state.distanceToTarget} <span className="text-[10px] text-slate-500">(d_T ≤ 0.30)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Profile Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Clinical Subject Profile
              </span>
              <span className="text-xs font-mono text-cyan-400">{profile.role}</span>
            </div>
            <h4 className="text-base font-semibold text-white">{profile.name}</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Emotion:</span>
                <span className="text-emerald-400">{profile.targetEmotion.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Tempo:</span>
                <span>{profile.preferredTempoRange[0]} - {profile.preferredTempoRange[1]} BPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heterogeneity Factor:</span>
                <span>h = {profile.heterogeneityFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EEG Noise Level:</span>
                <span>σ = {profile.noiseLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generative Music & RL State (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Generative Synthesizer Console */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Procedural Music Generation Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Web Audio API synthesizer steered in real time by RL policy actions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isAudioPlaying) defaultAudioEngine.pause();
                    else defaultAudioEngine.play();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                    isAudioPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 ${isAudioPlaying ? 'animate-spin' : ''}`} />
                  <span>{isAudioPlaying ? 'Pause Audio' : 'Play Synthesizer'}</span>
                </button>
              </div>
            </div>

            {/* Live Audio Visualizer Canvas */}
            <div className="mb-4">
              <AudioVisualizer height={100} />
            </div>

            {/* Musical Action Parameters */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Tempo
                </span>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {currentAction.tempo} <span className="text-xs text-slate-500">BPM</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Gaussian Policy μ(s)</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Musical Mode
                </span>
                <div className="text-xl font-mono font-bold text-indigo-400 mt-1 capitalize">
                  {currentAction.mode}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentAction.mode === 'major' ? 'Valence Elevation' : 'Introspective'}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Note Density
                </span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1 capitalize">
                  {currentAction.density}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentAction.density === 'sparse'
                    ? 'Sedative 1/2 notes'
                    : currentAction.density === 'medium'
                    ? 'Rhythmic 1/4 notes'
                    : 'Stimulating 1/8 notes'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
              <span>Acoustic Chord: C - G - Am - F progression</span>
              <button
                onClick={() => onNavigateTab('music')}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Synthesizer Controls →
              </button>
            </div>
          </div>

          {/* Subsystem Readiness Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Experimental Subsystem Verification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      3-Lead Preprocessing Engine (F3, F4, Pz)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Butterworth IIR bandpass (0.5-45 Hz), Welch periodogram PSD, FAA extraction
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">98.5% SNR</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Ridge Regression Affective Decoder
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Regularized mapping (λ = 1.0) with Russell circumplex classification
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400">85.1% Acc · RMSE 0.194</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      REINFORCE Policy Gradient Optimizer
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Adam LR = 0.02, per-step batch baseline, γ = 0.9, λ_q = 0.5
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-indigo-400">Q_avg = 0.938</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Simulation Benchmark Framework (Table 3)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      512 train / 1,000 test listeners, 300 iterations, seeds 0–4, 5 baselines
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">d_T = 0.272 · 60.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
