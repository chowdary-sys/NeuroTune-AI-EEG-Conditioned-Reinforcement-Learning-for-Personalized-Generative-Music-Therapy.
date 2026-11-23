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
  Info,
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Shows:</strong>
          These are the exact Section 5 and Section 6 test results from the research paper (1,000 simulated listeners across 5 random runs).
          Use the 5 tabs below to compare our AI against fixed playlists, see which parts matter most, and check high-noise limits.
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>RESEARCH PAPER RESULTS</span>
              <span>·</span>
              <span>5 SEEDS × 1,000 SIMULATED LISTENERS</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Research Results and Comparisons
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Table 2 settings: 512 listeners/round, 300 rounds, 10 steps/session, goal (0.5, -0.5), Calm Goal reached when distance d_T ≤ 0.3.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Paper Results (.csv)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-800 pt-2 text-xs overflow-x-auto">
          {[
            { id: 'benchmarks', label: '1. Main Results (Table 3)' },
            { id: 'ablation', label: '2. What Parts Matter (Table 4)' },
            { id: 'curves', label: '3. Learning Curves (Fig. 2)' },
            { id: 'qualitative', label: '4. One Listener Journey (Fig. 3)' },
            { id: 'sensitivity', label: '5. Noise and Taste Tests (Table 5 & Fig. 4)' },
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

      {/* SUB-TAB 1: Table 3 Main Results */}
      {activeSubTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 mb-4 leading-relaxed">
              <strong className="text-cyan-300">In Simple Words:</strong> Our AI (<strong>Proposed EEG + RL</strong>) helps <strong>60.3%</strong> of listeners reach the Calm Goal, compared to <strong>36.1%</strong> with a normal Fixed Playlist and <strong>5.9%</strong> with Random music, while maintaining <strong>0.938</strong> music smoothness.
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-white">
                Table 3. Main Experimental Results (Mean ± SD over Five Seeds 0 to 4)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                1,000 test listeners/seed · Mood encoder error RMSE 0.194 (85.1% accuracy)
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Lower final distance (d_T) and higher success rate (%) and music quality (Q_avg) are better. Oracle shows the upper reference bound if true state were known with zero error.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Distance Left (d_T) ↓</th>
                    <th className="py-2.5 px-3">Mood Gain (Δd) ↑</th>
                    <th className="py-2.5 px-3">Reached Calm (%) ↑</th>
                    <th className="py-2.5 px-3">Music Smoothness (Q_avg) ↑</th>
                    <th className="py-2.5 px-3 text-right">Speed (ms) ↓</th>
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
                        <td className="py-3 px-3 flex items-center gap-2 font-sans">
                          {isProposed && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          <span className={isProposed ? 'text-cyan-300 font-semibold' : isOracle ? 'text-sky-300' : 'text-slate-200'}>
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
                            className={`px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                              row.successRate >= 90
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
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
                <strong>Paper Takeaway (Section 6.1):</strong> Proposed (EEG + RL) finishes closest to the goal among all deployable methods (<span className="font-mono text-cyan-300">d_T = 0.272</span>): 29.3% closer than Fixed playlist (<span className="font-mono">0.385</span>), 61.3% closer than Catalogue (<span className="font-mono">0.705</span>), and 66.9% closer than Random (<span className="font-mono">0.822</span>). Success rises from <span className="font-mono">36.1%</span> to <span className="font-mono text-emerald-400">60.3%</span> (+24.1 pts).
              </p>
              <p className="text-[11px] text-slate-400">
                Note: Results come from the paper's computer simulator (Section 4) and are not clinical patient trials.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                Run Your Own Group Test (Interactive Simulator)
              </h3>
              <span className="text-xs font-mono text-slate-400">Table 2 Settings</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Change the group size, brainwave noise, or listener taste variety, then press the button below to test a synthetic cohort:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Number of Listeners:</label>
                <select
                  value={numListeners}
                  onChange={(e) => setNumListeners(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200"
                >
                  <option value={256}>256 Listeners (Fast)</option>
                  <option value={512}>512 Listeners (Train Batch)</option>
                  <option value={1000}>1,000 Listeners (Paper Test)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Random Run (Seed 0 to 4):</label>
                <select
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200"
                >
                  <option value={0}>Seed 0</option>
                  <option value={1}>Seed 1</option>
                  <option value={2}>Seed 2</option>
                  <option value={3}>Seed 3</option>
                  <option value={4}>Seed 4</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Brainwave Noise (σ):</label>
                <select
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200"
                >
                  <option value={0.1}>σ = 0.1 (Very Clean)</option>
                  <option value={0.5}>σ = 0.5 (Paper Default)</option>
                  <option value={1.0}>σ = 1.0 (Noisy)</option>
                  <option value={2.0}>σ = 2.0 (Extreme Noise)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Personal Taste Variety:</label>
                <select
                  value={heterogeneity}
                  onChange={(e) => setHeterogeneity(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200"
                >
                  <option value={0.0}>SD = 0.0 (All Identical)</option>
                  <option value={0.15}>SD = 0.15 (Low Variety)</option>
                  <option value={0.3}>SD = 0.30 (Paper Default)</option>
                  <option value={0.45}>SD = 0.45 (High Variety)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunInteractiveTrial}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isSimulating ? 'Testing Listeners...' : `Test ${numListeners} Listeners Now (Seed ${randomSeed})`}</span>
            </button>

            {interactiveResult && (
              <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-cyan-500/40 font-mono text-xs tabular-nums">
                <div className="text-cyan-400 font-semibold mb-2 flex items-center justify-between font-sans">
                  <span>{interactiveResult.algorithm}</span>
                  <span className="text-emerald-400 font-bold">Reached Calm (d_T ≤ 0.3): {interactiveResult.successRate}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>Final Distance: <strong>{interactiveResult.finalDistance} ± {interactiveResult.finalDistanceStd}</strong></div>
                  <div>Mood Gain Δd: <strong>{interactiveResult.improvementDelta}</strong></div>
                  <div>Music Quality: <strong>{interactiveResult.musicQuality}</strong></div>
                  <div>Decision Speed: <strong>{interactiveResult.latencyMs} ms</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Table 4 Ablation Study */}
      {activeSubTab === 'ablation' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 mb-4 leading-relaxed">
            <strong className="text-cyan-300">In Simple Words:</strong> Turning off individual pieces lowers performance. Without brainwaves (<strong>No EEG</strong>), success drops from <strong>60.3%</strong> to <strong>24.9%</strong>. Without remembering the previous step (<strong>No feedback</strong>), success drops to <strong>51.0%</strong>.
          </div>

          <h3 className="text-sm font-semibold text-white mb-2">
            Table 4. Ablation Results (Mean ± SD over Five Seeds)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparing the full system against versions missing EEG input, feedback memory, RL training, or quality penalties.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Tested Version</th>
                  <th className="py-2.5 px-3">Distance Left (d_T) ↓</th>
                  <th className="py-2.5 px-3">Reached Calm (%) ↑</th>
                  <th className="py-2.5 px-3">Music Quality (Q_avg) ↑</th>
                  <th className="py-2.5 px-3">What Happened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ablationData.map((row, idx) => (
                  <tr key={row.variant} className={`hover:bg-slate-800/30 ${idx === 0 ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-3 px-3 font-bold text-slate-200 font-sans">{row.variant}</td>
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
                    <td className="py-3 px-3 text-slate-300 text-[11px] font-sans">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Figure 2 Training Curves */}
      {activeSubTab === 'curves' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 mb-4 leading-relaxed">
            <strong className="text-cyan-300">In Simple Words:</strong> Over 300 practice rounds, the full AI (white line) improves fastest and reaches the highest average episode return (around <strong>5.51</strong>).
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Figure 2. Training Curves (Mean Episode Return, Smoothed over 10 Iterations, 5 Seeds)
              </h3>
              <p className="text-xs text-slate-400">
                Higher line indicates higher combined therapy and music score across 300 REINFORCE rounds (512 listeners per batch)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">0 to 300 rounds</span>
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

      {/* SUB-TAB 4: Figure 3 Qualitative Trajectory */}
      {activeSubTab === 'qualitative' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 mb-4 leading-relaxed">
            <strong className="text-cyan-300">In Simple Words:</strong> Starting <strong>1.32</strong> away from Calm, our AI (blue path) enters the green Calm Goal box in 2 steps and finishes <strong>0.17</strong> away, while Fixed Playlist stops at <strong>0.53</strong> away.
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">
              Figure 3. One Listener's Mood Journey on the Map (Section 6.3)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hidden listener bias b = (-0.33, -0.37), responsiveness 0.45, starting 1.32 from target (0.5, -0.5) with green success zone d_T ≤ 0.3.
            </p>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Mood (Valence)"
                  domain={[-0.8, 0.9]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Mood Feel / Valence (left = negative, right = positive)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Energy (Arousal)"
                  domain={[-1.05, 0.6]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Energy / Arousal', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
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

          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            At step 0, the decoder reads z = (-0.58, -0.27) and the AI picks music parameters (0.22, 0.99, 0.18) with smoothness Q = 0.97. Under Proposed (EEG + RL), the listener enters the green Calm zone (d ≤ 0.3) after 2 decisions and finishes 0.17 from goal, whereas Fixed playlist stops at 0.53 and Catalogue at 0.90.
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Table 5 & Figure 4 Noise & Diversity */}
      {activeSubTab === 'sensitivity' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
            <strong className="text-cyan-300">In Simple Words (Honest Limits From the Paper):</strong> Our AI performs best when brainwaves are reasonably clean (noise σ ≤ 0.5) and when listeners have distinct preferences (SD ≥ 0.15). Under very high EEG noise (σ ≥ 1.0) or identical listeners (SD = 0.0), a Fixed Playlist performs better because there is little reliable variation to adapt to.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-1">
                Figure 4 (Left). Effect of Brainwave Noise (σ)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Lower distance (d_T) is better · Average across 3 runs (seeds 0 to 2)
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
              <div className="text-[11px] text-slate-400 mt-2">
                At high noise (σ = 1.0 and 2.0), Proposed distance (0.532, 0.544) is higher than Fixed playlist (0.387), identifying the high-noise limit.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-1">
                Figure 4 (Right). Effect of Listener Differences (Taste SD)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Lower distance (d_T) is better · Average across 3 runs (seeds 0 to 2)
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
              <div className="text-[11px] text-slate-400 mt-2">
                When all listeners are identical (SD 0.0), Fixed playlist (0.158) beats Proposed (0.177); AI personalization wins when listeners differ (SD ≥ 0.15).
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              Table 5. Final Distance d_T (Lower Is Better) Across Noise and Listener Variety (Mean ± SD, 3 Seeds)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Test Condition</th>
                    <th className="py-2 px-3">Fixed playlist</th>
                    <th className="py-2 px-3">Catalogue</th>
                    <th className="py-2 px-3">Proposed (EEG+RL)</th>
                    <th className="py-2 px-3">Oracle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {noiseData.map((row) => (
                    <tr key={`n-${row.noiseLevel}`} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-200 font-semibold font-sans">Brainwave noise σ = {row.noiseLevel}</td>
                      <td className="py-2 px-3 text-slate-300">{row.fixedPlaylist.toFixed(3)} ± {row.fixedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-300">{row.catalogue.toFixed(3)} ± {row.catalogueStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">{row.proposed.toFixed(3)} ± {row.proposedStd.toFixed(3)}</td>
                      <td className="py-2 px-3 text-emerald-400">{row.oracle.toFixed(3)} ± {row.oracleStd.toFixed(3)}</td>
                    </tr>
                  ))}
                  {heterogeneityData.map((row) => (
                    <tr key={`h-${row.heterogeneity}`} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-200 font-semibold font-sans">Listener taste SD = {row.heterogeneity}</td>
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
