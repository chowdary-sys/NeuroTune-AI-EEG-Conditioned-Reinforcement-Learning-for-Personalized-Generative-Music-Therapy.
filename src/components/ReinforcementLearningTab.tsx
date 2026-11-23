import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BrainCircuit,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  TrendingUp,
  Zap,
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

  // Trajectory sample history or paper Figure 2 convergence curve (0-300 iterations)
  const chartData = policyState.history.length > 0
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
      {/* Policy Gradient Formulation Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>REINFORCE MONTE CARLO POLICY GRADIENT</span>
              <span>·</span>
              <span>CLOSED-LOOP REWARD OPTIMIZATION</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              Reinforcement Learning Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Policy gradient agent mapping 8-dimensional affective-preference states to generative music actions: Tempo ~ N(μ(s), σ²), Mode ~ Softmax(s), Density ~ Softmax(s).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => defaultClosedLoopController.finishSession()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trigger Policy Update</span>
            </button>
            <button
              onClick={() => defaultReinforce.resetPolicy()}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer text-xs font-mono"
              title="Reset policy parameters"
            >
              Reset Policy
            </button>
          </div>
        </div>

        {/* Mathematical Formulation Callout */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">
            Policy Gradient Objective & REINFORCE Update
          </div>
          <div className="text-cyan-300 font-semibold">
            ∇_θ J(θ) = E_π [ ∑_&#123;t=0&#125;^T ∇_θ ln π_θ(u_t | s_t) (G_t - b(s_t)) ]
          </div>
          <div className="text-slate-400 text-[11px] mt-1.5 flex flex-wrap gap-4">
            <span>Discounted Return: G_t = ∑_&#123;k=t&#125;^T γ^&#123;k-t&#125; R_k</span>
            <span>Baseline: b(s) = Moving Avg Return</span>
            <span>Iterations: {policyState.iteration}</span>
          </div>
        </div>
      </div>

      {/* Grid: Multi-Objective Reward & Policy Hyperparameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Multi-Objective Reward Decomposition (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Multi-Objective Reward Formulation (R_t)
              </h3>
              <span className="text-sm font-mono font-bold text-emerald-400">
                Total: {rewardBreakdown.totalReward > 0 ? `+${rewardBreakdown.totalReward.toFixed(2)}` : rewardBreakdown.totalReward.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              R_t = w₁·ΔDist + w₂·Q_music + w₃·P_listener + w₄·Feedback
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Component 1: Emotional Progress */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">1. Emotional State Progress (ΔDist)</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {rewardBreakdown.emotionalProgress > 0 ? `+${rewardBreakdown.emotionalProgress.toFixed(2)}` : rewardBreakdown.emotionalProgress.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  w₁ = 1.00 · Formula: ‖e_&#123;t-1&#125; - e*‖₂ - ‖e_t - e*‖₂
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, rewardBreakdown.emotionalProgress * 50))}%` }}
                  />
                </div>
              </div>

              {/* Component 2: Music Quality */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">2. Music Quality & Consonance (Q_music)</span>
                  <span className="text-cyan-400 font-bold text-sm">
                    +{rewardBreakdown.musicQuality.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  w₂ = 0.25 · Penalizes tempo jitter, rewards harmonic flow
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, rewardBreakdown.musicQuality * 200)}%` }}
                  />
                </div>
              </div>

              {/* Component 3: Listener Preference */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">3. Listener Preference Fit (P_listener)</span>
                  <span className="text-indigo-400 font-bold text-sm">
                    +{rewardBreakdown.listenerPreference.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  w₃ = 0.35 · Alignment with clinical patient baseline preferences
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, rewardBreakdown.listenerPreference * 200)}%` }}
                  />
                </div>
              </div>

              {/* Component 4: Subjective Feedback */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">4. Subjective Listener Feedback</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {rewardBreakdown.subjectiveFeedback > 0 ? `+${rewardBreakdown.subjectiveFeedback.toFixed(2)}` : rewardBreakdown.subjectiveFeedback.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  w₄ = 0.40 · Normalized satisfaction and perceived emotional shift
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, (rewardBreakdown.subjectiveFeedback + 0.5) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Policy Hyperparameters & Current Action Distribution (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Policy Hyperparameters
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Research experimental defaults (LR: 0.02, γ: 0.95, σ: 12 BPM)
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Policy Learning Rate (α):</span>
                  <span className="text-cyan-400 font-bold">{lr.toFixed(3)}</span>
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
                  <span>Discount Factor (γ):</span>
                  <span className="text-cyan-400 font-bold">{gamma.toFixed(2)}</span>
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
                  <span>Tempo Exploration Std (σ):</span>
                  <span className="text-cyan-400 font-bold">{tempoSigma.toFixed(1)} BPM</span>
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

            {/* Current Policy Sampled Action */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Active Sampled Action State
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">TEMPO</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {state.currentAction.tempo}
                  </div>
                  <div className="text-[10px] text-slate-500">BPM</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">MODE</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5 capitalize">
                    {state.currentAction.mode}
                  </div>
                  <div className="text-[10px] text-slate-500">Softmax</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500">DENSITY</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 capitalize">
                    {state.currentAction.density}
                  </div>
                  <div className="text-[10px] text-slate-500">Softmax</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Curve Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Policy Learning & Target Distance Convergence Curve
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Empirical return and distance to therapeutic target over policy iterations
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Training Iteration: <strong>{policyState.iteration} / 300</strong>
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
                name="Mean Discounted Return (G_t)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="distanceToTarget"
                name="Distance to Target (‖e_t - e*‖)"
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
