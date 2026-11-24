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

  const hasLiveHistory = policyState.history.length > 0;
  const chartData = hasLiveHistory
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

  const rewardBreakdown = state.lastReward;

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 block mb-0.5">What This Page Does:</strong>
          The REINFORCE policy learns which music parameters move the listener closer to the green Calm Goal.
          Whenever music reduces goal distance smoothly and matches listener preferences, it receives a higher reward score and reinforces those weights.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-600" />
              Self-Learning AI Brain (REINFORCE Engine)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Maps estimated mood, target goal, and listener taste to Speed (BPM), Feel (Major/Minor), and Note Busyness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => defaultClosedLoopController.finishSession()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium border border-slate-300 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
              <span>Save Session and Train</span>
            </button>
            <button
              onClick={() => defaultReinforce.resetPolicy()}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors cursor-pointer text-xs whitespace-nowrap"
              title="Reset AI weights back to start"
            >
              Reset Weights
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <div className="text-slate-900 font-semibold mb-1">
            Policy Update Rule:
          </div>
          <p className="text-slate-700">
            Actions that achieve a higher discounted return than the running baseline are reinforced for future steps.
          </p>
          <div className="text-cyan-800 font-mono text-[11px] font-medium mt-2 flex flex-wrap gap-4">
            <span>∇_θ J(θ) = E [ ∑ ∇_θ ln π_θ(u_t | s_t) (G_t - b(s_t)) ]</span>
            <span>Training Rounds Completed: {policyState.iteration}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Live Step Reward Breakdown
              </h3>
              <span className="text-sm font-mono font-bold text-emerald-700 tabular-nums">
                {rewardBreakdown
                  ? `Total: ${rewardBreakdown.totalReward > 0 ? `+${rewardBreakdown.totalReward.toFixed(2)}` : rewardBreakdown.totalReward.toFixed(2)}`
                  : 'No step run yet'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              {rewardBreakdown
                ? 'Measured scores from the latest executed therapy step:'
                : 'Run at least 1 step from the header or Live Loop tab to compute live reward values.'}
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-medium">1. Closer to Calm Goal (ΔDist)</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown
                      ? rewardBreakdown.emotionalProgress > 0
                        ? `+${rewardBreakdown.emotionalProgress.toFixed(2)}`
                        : rewardBreakdown.emotionalProgress.toFixed(2)
                      : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Positive when the blue mood dot moves closer to the green Calm Goal.
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-xs mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{
                      width: rewardBreakdown
                        ? `${Math.min(100, Math.max(4, rewardBreakdown.emotionalProgress * 50))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-medium">2. Smooth Music Transitions (Q_music)</span>
                  <span className="text-cyan-700 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown ? `+${rewardBreakdown.musicQuality.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Rewards smooth, gentle changes instead of sudden speed jumps (λ_q = 0.5).
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-xs mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full transition-all"
                    style={{
                      width: rewardBreakdown ? `${Math.min(100, rewardBreakdown.musicQuality * 100)}%` : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-medium">3. Matches Listener Taste (Preference)</span>
                  <span className="text-sky-700 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown ? `+${rewardBreakdown.listenerPreference.toFixed(2)}` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Points added when tempo and mode fit the selected listener profile.
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-xs mt-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full transition-all"
                    style={{
                      width: rewardBreakdown ? `${Math.min(100, rewardBreakdown.listenerPreference * 100)}%` : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-medium">4. Listener Feedback</span>
                  <span className="text-amber-700 font-mono font-bold text-sm tabular-nums">
                    {rewardBreakdown
                      ? rewardBreakdown.subjectiveFeedback > 0
                        ? `+${rewardBreakdown.subjectiveFeedback.toFixed(2)}`
                        : rewardBreakdown.subjectiveFeedback.toFixed(2)
                      : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Reflects the listener rating set inside the Live Loop tab.
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-xs mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{
                      width: rewardBreakdown
                        ? `${Math.min(100, Math.max(4, (rewardBreakdown.subjectiveFeedback + 0.5) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              AI Learning Settings
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Paper defaults: Learning Rate 0.02 · Discount γ = 0.90 · Exploration ±12 BPM
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Learning Rate (α):</span>
                  <span className="text-cyan-700 font-mono font-bold tabular-nums">{lr.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.08"
                  step="0.005"
                  value={lr}
                  onChange={handleLrChange}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Discount Factor (γ):</span>
                  <span className="text-cyan-700 font-mono font-bold tabular-nums">{gamma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={handleGammaChange}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Tempo Exploration Spread (σ BPM):</span>
                  <span className="text-cyan-700 font-mono font-bold tabular-nums">{tempoSigma.toFixed(1)} BPM</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="25.0"
                  step="1.0"
                  value={tempoSigma}
                  onChange={handleSigmaChange}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-600 mb-2">
                Active Music Choice:
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">SPEED</div>
                  <div className="text-base font-bold text-cyan-700 mt-0.5 tabular-nums">
                    {state.currentAction.tempo}
                  </div>
                  <div className="text-[10px] text-slate-500">BPM</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">FEEL</div>
                  <div className="text-base font-bold text-sky-700 mt-0.5 capitalize">
                    {state.currentAction.mode}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {state.currentAction.mode === 'major' ? 'Bright' : 'Soft'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500">BUSYNESS</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5 capitalize">
                    {state.currentAction.density}
                  </div>
                  <div className="text-[10px] text-slate-500">Density</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              {hasLiveHistory
                ? 'Live Session Training Curve'
                : 'Reference Paper Training Curve (300 Iterations)'}
            </h3>
            <p className="text-xs text-slate-600">
              {hasLiveHistory
                ? 'Recorded mean episode return and target distance from your completed sessions.'
                : 'Published 5-seed paper benchmark curve shown before your first 10-step session finishes.'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Live Updates: <strong>{policyState.iteration}</strong>
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="iteration" stroke="#475569" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#334155' }} />
              <Line
                type="monotone"
                dataKey="meanReward"
                name="Mean Episode Return (higher = better)"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="distanceToTarget"
                name="Distance to Calm Goal (lower = better)"
                stroke="#0284c7"
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
