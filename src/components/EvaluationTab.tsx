import React, { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  CheckCircle2,
  Download,
  Play,
  Zap,
} from 'lucide-react';
import { defaultBenchmarkService } from '../services/simulationBenchmark';
import { EvaluationBenchmarkResult } from '../types/neurotune';

export const EvaluationTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'benchmarks' | 'curves' | 'ablation' | 'qualitative' | 'sensitivity'
  >('benchmarks');
  const [interactiveResult, setInteractiveResult] = useState<EvaluationBenchmarkResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation controls matching Table 2 defaults
  const [numListeners, setNumListeners] = useState(1000);
  const [randomSeed, setRandomSeed] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0.5);
  const [heterogeneity, setHeterogeneity] = useState(0.3);

  const benchmarkData = defaultBenchmarkService.getBenchmarkTable();
  const learningCurves = defaultBenchmarkService.getLearningCurves();
  const noiseData = defaultBenchmarkService.getNoiseSensitivityData();
  const heterogeneityData = defaultBenchmarkService.getHeterogeneityData();
  const ablationData = defaultBenchmarkService.getAblationStudy();
  const trajectoryData = defaultBenchmarkService.getQualitativeTrajectory();

  const handleRunInteractiveTrial = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = defaultBenchmarkService.runInteractiveTrial(
        numListeners,
        10,
        randomSeed,
        noiseLevel,
        heterogeneity
      );
      setInteractiveResult(result);
      setIsSimulating(false);
    }, 250);
  };

  const handleDownloadCsv = () => {
    const csv = defaultBenchmarkService.exportBenchmarkCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neurotune_paper_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const proposedSeries = trajectoryData.map((p) => ({ x: p.proposedValence, y: p.proposedArousal, step: p.step }));
  const fixedSeries = trajectoryData.map((p) => ({ x: p.fixedValence, y: p.fixedArousal, step: p.step }));
  const catalogueSeries = trajectoryData.map((p) => ({ x: p.catalogueValence, y: p.catalogueArousal, step: p.step }));
  const oracleSeries = trajectoryData.map((p) => ({ x: p.oracleValence, y: p.oracleArousal, step: p.step }));

  return (
    <div className="space-y-6">
      {/* Benchmark Header & Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>SECTION 6 · RESULTS AND DISCUSSION</span>
              <span>·</span>
              <span>SYNTHETIC SIMULATOR (5 SEEDS × 1,000 TEST LISTENERS)</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Empirical Performance & Benchmark Evaluation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exact reproduction of Tables 3–5 & Figures 2–4: 512 listeners/iteration, 300 iterations, 10 decisions/session, Adam LR = 0.02, γ = 0.9, λ_q = 0.5, target s_tgt = (0.5, −0.5), success threshold d_T ≤ 0.3.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Paper Results CSV</span>
            </button>
          </div>
        </div>

        {/* Evaluation Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pt-2 font-mono text-xs overflow-x-auto">
          {[
            { id: 'benchmarks', label: '6.1 Main Results (Table 3)' },
            { id: 'ablation', label: '6.2 Ablation Study (Table 4)' },
            { id: 'curves', label: 'Training Curves (Fig. 2)' },
            { id: 'qualitative', label: '6.3 Trajectory (Fig. 3)' },
            { id: 'sensitivity', label: '6.4 Sensitivity (Table 5 & Fig. 4)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: Table 3 Main Experimental Results & Interactive Runner */}
      {activeSubTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-white">
                Table 3. Main Experimental Results (Mean ± SD over Five Seeds 0–4)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                1,000 held-out listeners/seed · Ridge encoder RMSE 0.194 (85.1% quadrant acc.)
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              All behavioral metrics use the true simulated state s_T (hidden from policy). Success rate measures sessions with d_T ≤ 0.3.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Final dist. d_T ↓</th>
                    <th className="py-2.5 px-3">Improvement Δd ↑</th>
                    <th className="py-2.5 px-3">Success rate (%) ↑</th>
                    <th className="py-2.5 px-3">Music quality Q_avg ↑</th>
                    <th className="py-2.5 px-3 text-right">Latency (ms) ↓</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {benchmarkData.map((row) => {
                    const isProposed = row.algorithm.includes('Proposed');
                    const isOracle = row.algorithm.includes('Oracle');
                    return (
                      <tr
                        key={row.algorithm}
                        className={`hover:bg-slate-800/30 ${
                          isProposed ? 'bg-cyan-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 flex items-center gap-2">
                          {isProposed && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          <span className={isProposed ? 'text-cyan-300' : isOracle ? 'text-indigo-300' : 'text-slate-200'}>
                            {row.algorithm}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {row.finalDistance.toFixed(3)} ± {row.finalDistanceStd.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-emerald-400">
                          {row.improvementDelta.toFixed(3)} ± {row.improvementStd.toFixed(3)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              row.successRate >= 90
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : row.successRate >= 55
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : row.successRate >= 30
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {row.successRate.toFixed(1)} ± {row.successRateStd.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {row.musicQuality.toFixed(3)} ± {row.musicQualityStd.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {row.latencyMs.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <p>
                <strong>Key Findings (Section 6.1):</strong> Proposed (EEG + RL) ends closest to the target among all deployable methods (<span className="font-mono text-cyan-300">d_T = 0.272</span>): 29.3% lower than Fixed playlist (<span className="font-mono">0.385</span>), 61.3% lower than Catalogue recommendation (<span className="font-mono">0.705</span>), and 66.9% lower than Random (<span className="font-mono">0.822</span>). Success rate rises to <span className="font-mono text-emerald-400">60.3%</span> vs. <span className="font-mono">36.1%</span> (+24.1 pts) with highest music quality (<span className="font-mono text-cyan-300">0.938</span>).
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Note: Results quantify behavior inside the synthetic simulator (Section 4) and do not represent clinical efficacy on real patients.
              </p>
            </div>
          </div>

          {/* Interactive Monte Carlo Simulation Runner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                Live Held-Out Listener Simulation Runner (Table 2 Configuration)
              </h3>
              <span className="text-xs font-mono text-slate-400">s_&#123;t+1&#125; = clip(s_t + α_u(f(p_t) + b_u − s_t) + η_t)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Run held-out synthetic cohorts with α_u ~ U(0.25, 0.5), hidden bias b_u ~ N(0, σ_b² I), process noise SD 0.05, and 4-window averaged EEG observations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Test Listeners / Seed:</label>
                <select
                  value={numListeners}
                  onChange={(e) => setNumListeners(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value={256}>256 (Quick)</option>
                  <option value={512}>512 (Train Batch)</option>
                  <option value={1000}>1,000 (Paper Test Set)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Random Seed (0–4):</label>
                <select
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value={0}>Seed 0</option>
                  <option value={1}>Seed 1</option>
                  <option value={2}>Seed 2</option>
                  <option value={3}>Seed 3</option>
                  <option value={4}>Seed 4</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Per-Window EEG Noise (σ):</label>
                <select
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value={0.1}>σ = 0.1</option>
                  <option value={0.5}>σ = 0.5 (Paper Default)</option>
                  <option value={1.0}>σ = 1.0</option>
                  <option value={2.0}>σ = 2.0</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Listener Bias SD:</label>
                <select
                  value={heterogeneity}
                  onChange={(e) => setHeterogeneity(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value={0.0}>SD = 0.0 (Identical)</option>
                  <option value={0.15}>SD = 0.15</option>
                  <option value={0.3}>SD = 0.30 (Paper Default)</option>
                  <option value={0.45}>SD = 0.45</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunInteractiveTrial}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950"
            >
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-bounce' : ''}`} />
              <span>{isSimulating ? 'Running Synthetic Cohort...' : `Run Held-Out Evaluation (N = ${numListeners}, Seed = ${randomSeed})`}</span>
            </button>

            {interactiveResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs">
                <div className="text-cyan-400 font-semibold mb-2 flex items-center justify-between">
                  <span>{interactiveResult.algorithm}</span>
                  <span className="text-emerald-400 font-bold">Success Rate (d_T ≤ 0.3): {interactiveResult.successRate}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>Final dist d_T: <strong>{interactiveResult.finalDistance} ± {interactiveResult.finalDistanceStd}</strong></div>
                  <div>Improvement Δd: <strong>{interactiveResult.improvementDelta}</strong></div>
                  <div>Music Quality Q_avg: <strong>{interactiveResult.musicQuality}</strong></div>
                  <div>Latency: <strong>{interactiveResult.latencyMs} ms</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Table 4 Ablation Study */}
      {activeSubTab === 'ablation' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-2">
            Table 4. Ablation Results (Mean ± SD over Five Seeds)
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-mono">
            Component isolation across EEG inputs, feedback inputs (Δz_t, p_&#123;t-1&#125;), RL policy learning, and reward terms.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3">Final dist. d_T ↓</th>
                  <th className="py-2.5 px-3">Success rate (%) ↑</th>
                  <th className="py-2.5 px-3">Music quality Q_avg ↑</th>
                  <th className="py-2.5 px-3">Empirical Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ablationData.map((row, idx) => (
                  <tr key={row.variant} className={`hover:bg-slate-800/30 ${idx === 0 ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-3 px-3 font-bold text-slate-200">{row.variant}</td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">
                      {row.finalDistance.toFixed(3)} ± {row.finalDistanceStd.toFixed(3)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-400 font-bold">
                        {row.successRate.toFixed(1)} ± {row.successRateStd.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {row.musicQuality.toFixed(3)} ± {row.musicQualityStd.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Figure 2 Training Curves (300 Iterations) */}
      {activeSubTab === 'curves' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Figure 2. Training Curves (Mean Episode Return, Smoothed over 10 Iterations, 5 Seeds)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Full proposed policy vs. four ablations over 300 REINFORCE training iterations (batch size 512)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Iterations: 0 to 300</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={learningCurves} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Training iteration', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0.5, 5.8]} label={{ value: 'Mean episode return', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
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
                <Line type="monotone" dataKey="fullProposed" name="Full (proposed)" stroke="#e2e8f0" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="noFeedbackInputs" name="No feedback inputs" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rewardWithoutQuality" name="Reward without quality" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="noEegInput" name="No EEG input" stroke="#94a3b8" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="rewardQualityOnly" name="Reward quality-only" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Figure 3 Qualitative Trajectory Analysis */}
      {activeSubTab === 'qualitative' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">
              Figure 3. Qualitative Analysis — Held-Out Listener State Trajectory (Section 6.3)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Hidden bias b = (−0.33, −0.37), responsiveness 0.45, starting 1.32 from target (0.5, −0.5) with success radius d_T ≤ 0.3.
            </p>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Valence"
                  domain={[-0.8, 0.9]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Valence (true simulated state)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Arousal"
                  domain={[-1.05, 0.6]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Arousal (true simulated state)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                />
                <ReferenceArea x1={0.2} x2={0.8} y1={-0.8} y2={-0.2} fill="#10b981" fillOpacity={0.08} stroke="#10b981" strokeDasharray="4 4" />
                <ReferenceDot x={0.5} y={-0.5} r={6} fill="#facc15" stroke="#ffffff" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                <Scatter name="Fixed playlist (ends 0.53 away)" data={fixedSeries} fill="#94a3b8" line={{ stroke: '#94a3b8', strokeWidth: 2 }} />
                <Scatter name="Catalogue rec (ends 0.90 away)" data={catalogueSeries} fill="#f97316" line={{ stroke: '#f97316', strokeWidth: 2 }} />
                <Scatter name="Proposed EEG + RL (ends 0.17 away)" data={proposedSeries} fill="#38bdf8" line={{ stroke: '#38bdf8', strokeWidth: 2.5 }} />
                <Scatter name="Oracle reference" data={oracleSeries} fill="#10b981" line={{ stroke: '#10b981', strokeWidth: 2 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
            At step 0, encoder estimates z = (−0.58, −0.27) and policy selects (τ, μ, δ) = (0.22, 0.99, 0.18) with Q = 0.97. Under Proposed (EEG + RL), the listener enters the d ≤ 0.3 success region after 2 decisions and finishes 0.17 from target, whereas Fixed playlist ends 0.53 away and Catalogue ends 0.90 away.
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Table 5 & Figure 4 Noise & Heterogeneity Sweeps */}
      {activeSubTab === 'sensitivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Figure 4 Left: Noise Sensitivity */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-1">
                Figure 4 (Left). Final Distance vs. Per-Window EEG Noise σ
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Mean over three seeds (0–2); lower distance d_T is better
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={noiseData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="noiseLevel" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 0.85]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                    <Line type="monotone" dataKey="fixedPlaylist" name="Fixed playlist" stroke="#94a3b8" strokeWidth={2} />
                    <Line type="monotone" dataKey="catalogue" name="Catalogue" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="proposed" name="Proposed (EEG+RL)" stroke="#38bdf8" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="oracle" name="Oracle" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                At σ = 1.0 and 2.0, Proposed distance (0.532, 0.544) exceeds Fixed playlist (0.387), identifying the high-noise failure regime.
              </div>
            </div>

            {/* Figure 4 Right: Listener Heterogeneity */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-1">
                Figure 4 (Right). Final Distance vs. SD of Hidden Listener Bias
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Mean over three seeds (0–2); lower distance d_T is better
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heterogeneityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="heterogeneity" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 0.95]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                    <Line type="monotone" dataKey="fixedPlaylist" name="Fixed playlist" stroke="#94a3b8" strokeWidth={2} />
                    <Line type="monotone" dataKey="catalogue" name="Catalogue" stroke="#f97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="proposed" name="Proposed (EEG+RL)" stroke="#38bdf8" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="oracle" name="Oracle" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                When listeners are identical (SD 0.0), Fixed playlist (0.158) beats Proposed (0.177); adaptation wins under substantial heterogeneity (SD ≥ 0.15).
              </div>
            </div>
          </div>

          {/* Exact Table 5 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              Table 5. Sensitivity of Final Distance d_T (Lower Is Better) to EEG Noise & Listener Heterogeneity (Mean ± SD, 3 Seeds)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Setting</th>
                    <th className="py-2 px-3">Fixed playlist</th>
                    <th className="py-2 px-3">Catalogue</th>
                    <th className="py-2 px-3">Proposed</th>
                    <th className="py-2 px-3">Oracle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {noiseData.map((row) => (
                    <tr key={`n-${row.noiseLevel}`} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-200 font-semibold">EEG noise σ = {row.noiseLevel}</td>
                      <td className="py-2 px-3 text-slate-300">{row.fixedPlaylist.toFixed(3)} ± {row.fixedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-300">{row.catalogue.toFixed(3)} ± {row.catalogueStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">{row.proposed.toFixed(3)} ± {row.proposedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-emerald-400">{row.oracle.toFixed(3)} ± {row.oracleStd.toFixed(3)}</td>
                    </tr>
                  ))}
                  {heterogeneityData.map((row) => (
                    <tr key={`h-${row.heterogeneity}`} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-200 font-semibold">Listener bias SD = {row.heterogeneity}</td>
                      <td className="py-2 px-3 text-slate-300">{row.fixedPlaylist.toFixed(3)} ± {row.fixedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-300">{row.catalogue.toFixed(3)} ± {row.catalogueStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">{row.proposed.toFixed(3)} ± {row.proposedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-emerald-400">{row.oracle.toFixed(3)} ± {row.oracleStd.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
