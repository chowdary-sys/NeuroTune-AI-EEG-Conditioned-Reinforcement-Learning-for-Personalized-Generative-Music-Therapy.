import React, { useState } from 'react';
import {
  Award,
  BrainCircuit,
  Info,
  RefreshCw,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { defaultReinforce } from '../services/reinforceRL';
import { defaultClosedLoopController } from '../services/closedLoopController';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const ReinforcementLearningTab: React.FC = () => {
  const policyState = defaultReinforce.getPolicyState();
  const state = defaultClosedLoopController.getState();
  const [lr, setLr] = useState<number>(defaultReinforce.learningRate);
  const [gamma, setGamma] = useState<number>(defaultReinforce.gamma);
  const [tempoSigma, setTempoSigma] = useState<number>(defaultReinforce.tempoSigma);

  const handleLrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLr(val);
    defaultReinforce.learningRate = val;
  };

  const handleGammaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setGamma(val);
    defaultReinforce.gamma = val;
  };

  const handleSigmaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTempoSigma(val);
    defaultReinforce.tempoSigma = val;
  };

  const chartData =
    policyState.history.length > 0
      ? policyState.history
      : [
          { iteration: 0, meanReward: 0.80, distanceToTarget: 1.32, entropy: 4.1 },
          { iteration: 50, meanReward: 4.18, distanceToTarget: 0.45, entropy: 3.6 },
          { iteration: 100, meanReward: 5.06, distanceToTarget: 0.34, entropy: 3.3 },
          { iteration: 150, meanReward: 5.34, distanceToTarget: 0.30, entropy: 3.1 },
          { iteration: 200, meanReward: 5.45, distanceToTarget: 0.28, entropy: 2.9 },
          { iteration: 250, meanReward: 5.49, distanceToTarget: 0.274, entropy: 2.8 },
          { iteration: 300, meanReward: 5.51, distanceToTarget: 0.272, entropy: 2.7 },
        ];

  const rewardBreakdown = state.lastReward || {
    emotionalProgress: 0.72,
    musicQuality: 0.47,
    listenerPreference: 0.31,
    subjectiveFeedback: 0.18,
    totalReward: 1.68,
  };

  return (
    <div className="space-y-6">
      {/* Plain-English Explainer Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          Think of the AI Brain like a DJ learning by trial and error (called <strong>REINFORCE</strong>).
          Whenever its music moves the listener closer to the green Calm Goal without sounding bumpy, it earns a high <strong>Reward Score</strong> and remembers to make similar choices next time!
        </div>
      </div>

      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              Self-Learning AI Brain (REINFORCE Engine)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Looks at your mood, calm goal, and music preferences, then chooses the best Speed (BPM), Feel (Major/Minor), and Note Busyness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => defaultClosedLoopController.finishSession()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Session & Train AI</span>
            </button>
            <button
              onClick={() => defaultReinforce.resetPolicy()}
              className="px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer text-xs whitespace-nowrap"
              title="Reset AI weights back to start"
            >
              Reset AI Memory
            </button>
          </div>
        </div>

        {/* Simple Rule Box + Paper Formula */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="text-slate-400 font-semibold mb-1">
            How the AI Updates Its Strategy:
          </div>
          <p className="text-slate-300">
            If the music improved the listener's mood more than usual, the AI increases the chance of picking that music style again. If not, it tries a different combination.
          </p>
          <div className="text-cyan-300/90 font-mono text-[11px] mt-2 flex flex-wrap gap-4">
            <span>Paper Formula: ∇_θ J(θ) = E [ ∑ ∇_θ ln π_θ(u_t | s_t) (G_t - b(s_t)) ]</span>
            <span>Training Rounds Done: {policyState.iteration}</span>
          </div>
        </div>
      </div>

      {/* Grid: Reward Breakdown & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: How Reward Score is Built */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                How the AI Score (Reward) Is Calculated
              </h3>
              <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                Total: {rewardBreakdown.totalReward > 0 ? `+${rewardBreakdown.totalReward.toFixed(2)}` : rewardBreakdown.totalReward.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              The AI gets points from 4 parts after every music step:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-medium">1. Closer to Calm Goal (ΔDist)</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown.emotionalProgress > 0 ? `+${rewardBreakdown.emotionalProgress.toFixed(2)}` : rewardBreakdown.emotionalProgress.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Biggest reward when the blue mood dot moves closer to the green Calm Goal.
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, rewardBreakdown.emotionalProgress * 50))}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-medium">2. Smooth Music Transitions (Q_music)</span>
                  <span className="text-cyan-400 font-mono font-bold text-sm tabular-nums">
                    +{rewardBreakdown.musicQuality.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Rewards smooth, gentle changes instead of sudden jarring speed jumps (λ_q = 0.5).
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, rewardBreakdown.musicQuality * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-medium">3. Matches Listener Taste (Preference)</span>
                  <span className="text-indigo-400 font-mono font-bold text-sm tabular-nums">
                    +{rewardBreakdown.listenerPreference.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Extra points when the music fits the listener's favorite BPM range and mode.
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, rewardBreakdown.listenerPreference * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-medium">4. Listener Star Feedback</span>
                  <span className="text-amber-400 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown.subjectiveFeedback > 0 ? `+${rewardBreakdown.subjectiveFeedback.toFixed(2)}` : rewardBreakdown.subjectiveFeedback.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Reflects how pleasant the listener rated the music (set yours in the Live Loop tab).
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, (rewardBreakdown.subjectiveFeedback + 0.5) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Learning Settings & Current Choice */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              AI Learning Settings
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paper defaults: Learning Rate 0.02 · Future Discount γ = 0.90 · Exploration ±12 BPM
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>How Fast AI Learns (Learning Rate):</span>
                  <span className="text-cyan-400 font-mono font-bold">{lr.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.08"
                  step="0.005"
                  value={lr}
                  onChange={handleLrChange}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>How Far Ahead AI Plans (Discount γ):</span>
                  <span className="text-cyan-400 font-mono font-bold">{gamma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={handleGammaChange}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>How Much Speed Variety AI Tries (σ BPM):</span>
                  <span className="text-cyan-400 font-mono font-bold">{tempoSigma.toFixed(1)} BPM</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="25.0"
                  step="1.0"
                  value={tempoSigma}
                  onChange={handleSigmaChange}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-medium text-slate-400 mb-2">
                Music Choice Picked by AI Right Now:
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">SPEED</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5 tabular-nums">
                    {state.currentAction.tempo}
                  </div>
                  <div className="text-[10px] text-slate-500">BPM</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">FEEL</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5 capitalize">
                    {state.currentAction.mode}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {state.currentAction.mode === 'major' ? 'Bright' : 'Soft'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">BUSYNESS</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 capitalize">
                    {state.currentAction.density}
                  </div>
                  <div className="text-[10px] text-slate-500">Density</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Graph */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              How the AI Improves Over Time (Learning Curve)
            </h3>
            <p className="text-xs text-slate-400">
              Green line going up = higher AI score · Blue line going down = listener finishes closer to the Calm Goal!
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Progress: <strong>{policyState.iteration} / 300 rounds</strong>
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Line
                type="monotone"
                dataKey="meanReward"
                name="AI Score (higher = better)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="distanceToTarget"
                name="Distance to Calm Goal (lower = better)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
