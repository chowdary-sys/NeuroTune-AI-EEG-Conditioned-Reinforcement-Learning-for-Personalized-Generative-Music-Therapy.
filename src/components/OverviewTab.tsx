import React from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Disc,
  Play,
  Sliders,
  User,
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
  onOpenProfileModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  state,
  onNavigateTab,
  onOpenDocsModal,
  onOpenProfileModal,
}) => {
  const { currentEmotion, targetEmotion, currentAction, profile, isRunning } = state;
  const isAudioPlaying = defaultAudioEngine.getPlaybackState().isPlaying;

  const stages = [
    { num: 1, key: 'eeg_acquisition', label: 'Read Brainwaves', desc: '3 sensor channels (F3, F4, Pz)' },
    { num: 2, key: 'preprocessing', label: 'Filter Noise', desc: 'Keep 0.5 to 45 Hz waves' },
    { num: 3, key: 'emotion_estimation', label: 'Estimate Mood', desc: 'Compute Valence and Arousal' },
    { num: 4, key: 'rl_decision', label: 'Select Music', desc: 'Policy chooses tempo and mode' },
    { num: 5, key: 'music_generation', label: 'Build Sound', desc: 'Synthesize chords and melody' },
    { num: 6, key: 'playback', label: 'Play Audio', desc: 'Stream sound via Web Audio' },
    { num: 7, key: 'listener_feedback', label: 'Check Shift', desc: 'Measure response to goal' },
    { num: 8, key: 'policy_update', label: 'Update Policy', desc: 'Update REINFORCE weights' },
    { num: 9, key: 'idle', label: 'Next Window', desc: 'Read next 1-second sample' },
  ];

  return (
    <div className="space-y-6">
      {/* Concrete Research Hero */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>RESEARCH IMPLEMENTATION</span>
              <span>·</span>
              <span>CLOSED-LOOP EEG AND REINFORCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              EEG-Conditioned Reinforcement Learning for Personalized Generative Music
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              This tool simulates 3-channel EEG signals (F3, F4, Pz), estimates Mood (Valence) and
              Energy (Arousal) using Ridge Regression, and runs a REINFORCE policy gradient loop that
              adjusts tempo, musical mode, and note density in real time toward a chosen target state.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => defaultClosedLoopController.executeSingleStep()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Run 1 Step</span>
            </button>
            <button
              onClick={() => {
                if (isRunning) defaultClosedLoopController.stopContinuousLoop();
                else defaultClosedLoopController.startContinuousLoop(2500);
              }}
              className={`px-4 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Pause Therapy Loop' : 'Start Therapy Loop'}</span>
            </button>
            <button
              onClick={onOpenDocsModal}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium text-center transition-colors cursor-pointer"
            >
              Read Paper Guide →
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Quick Start Guide */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              How to Use This Application in 3 Steps
            </h2>
            <p className="text-xs text-slate-400">
              Follow these three steps to run the complete brainwave-to-music simulation.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('benchmarks')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>View Paper Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 mb-1">01. PICK LISTENER</div>
              <div className="text-sm font-semibold text-white">Choose a Listener Profile</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Select a listener preset or click anywhere inside the Mood Map below to move the green Calm Goal.
              </p>
            </div>
            <button
              onClick={onOpenProfileModal}
              className="w-fit px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pick Listener Profile</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">02. RUN AND LISTEN</div>
              <div className="text-sm font-semibold text-white">Start the Live Music Loop</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Press Start Therapy Loop (or Run 1 Step). Browser audio plays while the algorithm adjusts tempo and mode.
              </p>
            </div>
            <button
              onClick={() => defaultClosedLoopController.executeSingleStep()}
              className="w-fit px-3 py-1.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 text-xs font-medium text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run 1 Step Now</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 mb-1">03. CHECK RESULT</div>
              <div className="text-sm font-semibold text-white">Watch the Blue Dot Converge</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Watch the current mood marker move into the green target circle (distance ≤ 0.30). Sessions save after 10 steps.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('closed_loop')}
              className="w-fit px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Live Loop</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9-Stage Cycle */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Closed-Loop Cycle (9 Stages)</h3>
            <p className="text-xs text-slate-400">
              Each therapy step passes through these 9 stages from brainwave reading to policy update.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('closed_loop')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Open Live Loop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {stages.map((stage) => {
            const isCurrent = state.currentStage === stage.key;
            return (
              <div
                key={stage.num}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-colors ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500">0{stage.num}</span>
                  {isCurrent && <span className="text-[10px] font-mono text-cyan-400">ACTIVE</span>}
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

      {/* Main 2-Column Split: Mood Map & Music Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                Live Mood Map
              </h3>
              <button
                onClick={() => onNavigateTab('emotion')}
                className="text-xs text-slate-400 hover:text-cyan-400 font-medium cursor-pointer"
              >
                More Details →
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Blue marker shows the estimated state; green circle shows the target Calm Goal.
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
                <div className="text-slate-400 text-[10px]">STARTED AT</div>
                <div className="text-slate-200 mt-0.5 tabular-nums">
                  Mood: {state.initialEmotion.valence.toFixed(2)} · Energy: {state.initialEmotion.arousal.toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">DISTANCE TO GOAL</div>
                <div className="text-emerald-400 mt-0.5 font-bold tabular-nums">
                  {state.distanceToTarget.toFixed(2)} <span className="text-[10px] text-slate-500">(goal ≤ 0.30)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Current Listener
              </span>
              <button
                onClick={onOpenProfileModal}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Switch Person →
              </button>
            </div>
            <h4 className="text-base font-semibold text-white">{profile.name}</h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Mood Goal:</span>
                <span className="text-emerald-400 font-medium">{profile.targetEmotion.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Favorite Speed:</span>
                <span className="font-mono">{profile.preferredTempoRange[0]} to {profile.preferredTempoRange[1]} BPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taste Diversity Factor:</span>
                <span className="font-mono">h = {profile.heterogeneityFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EEG Noise Setting:</span>
                <span className="font-mono">σ = {profile.noiseLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Live Web Audio Synthesizer
                </h3>
                <p className="text-xs text-slate-400">
                  Sound generated directly in your browser and steered by the RL policy.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isAudioPlaying) defaultAudioEngine.pause();
                    else defaultAudioEngine.play();
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isAudioPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>{isAudioPlaying ? 'Pause Audio' : 'Play Audio'}</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <AudioVisualizer height={100} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Music Speed
                </span>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1 tabular-nums">
                  {currentAction.tempo} <span className="text-xs text-slate-500">BPM</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentAction.tempo < 75 ? 'Slow and calm' : currentAction.tempo < 105 ? 'Gentle pace' : 'Energetic beat'}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Musical Feel
                </span>
                <div className="text-xl font-mono font-bold text-sky-400 mt-1 capitalize">
                  {currentAction.mode}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentAction.mode === 'major' ? 'Bright and uplifting' : 'Soft and quiet'}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Note Busyness
                </span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1 capitalize">
                  {currentAction.density}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentAction.density === 'sparse'
                    ? 'Long peaceful notes'
                    : currentAction.density === 'medium'
                    ? 'Balanced melody'
                    : 'Fast flowing notes'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Live progression: C, G, Am, F</span>
              <button
                onClick={() => onNavigateTab('music')}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
              >
                Adjust Music Manually →
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">
                Paper Results Summary (Tables 2 and 3)
              </h3>
              <button
                onClick={() => onNavigateTab('benchmarks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
              >
                Full Paper Tables →
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      1. 3-Channel EEG Band-Pass Filtering (0.5 to 45 Hz)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Extracts Theta, Alpha, and Beta power plus Frontal Alpha Asymmetry
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 shrink-0">F3, F4, Pz</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      2. Ridge Regression Mood Encoder (2,400 Calibration Samples)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Maps 11 spectral features to continuous Valence and Arousal
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400 shrink-0">85.1% Acc · RMSE 0.194</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      3. REINFORCE Policy Gradient Optimizer
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Maintains smooth musical transitions across 10-step sessions
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-sky-400 shrink-0">Q_avg = 0.938</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      4. Held-Out Evaluation (1,000 Listeners across Seeds 0 to 4)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      60.3% reach target zone vs 36.1% with a fixed playlist
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 shrink-0">d_T = 0.272 · 60.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
