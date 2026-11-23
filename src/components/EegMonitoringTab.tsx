import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Download,
  FileText,
  Radio,
  RefreshCw,
  Sliders,
  Upload,
} from 'lucide-react';
import { EegFrequencyFeatures, EegRawSample } from '../types/neurotune';
import { defaultEegEngine } from '../services/eegEngine';
import { defaultClosedLoopController } from '../services/closedLoopController';

export const EegMonitoringTab: React.FC = () => {
  const [isRealMode, setIsRealMode] = useState<boolean>(defaultEegEngine.isRealDevice());
  const [noiseLevel, setNoiseLevel] = useState<number>(defaultEegEngine.getNoiseLevel());
  const [activeEmotionalPreset, setActiveEmotionalPreset] = useState<string>('anxious');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'f3' | 'f4' | 'pz'>('all');
  const [filterMode, setFilterMode] = useState<'raw' | 'filtered'>('filtered');
  const [features, setFeatures] = useState<EegFrequencyFeatures>({
    thetaF3: 14.2,
    alphaF3: 16.5,
    betaF3: 22.8,
    thetaF4: 13.8,
    alphaF4: 12.1,
    betaF4: 24.2,
    thetaPz: 18.4,
    alphaPz: 19.2,
    betaPz: 21.5,
    faa: -0.31,
    arousalRatio: 0.58,
    signalQuality: 98.4,
    noiseRms: 2.15,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Oscilloscope waveform history buffer
  const waveformBuffer = useRef<Array<{ raw: EegRawSample; filtered: EegRawSample }>>([]);

  // Emotional presets for synthetic EEG generation
  const emotionalPresets = [
    {
      id: 'anxious',
      name: 'High Arousal, Negative Valence (Anxious / Tense)',
      valence: -0.55,
      arousal: 0.65,
      desc: 'Elevated Beta in all leads, suppressed F4 alpha, negative FAA',
    },
    {
      id: 'depressed',
      name: 'Low Arousal, Negative Valence (Depressed / Dysphoric)',
      valence: -0.45,
      arousal: -0.50,
      desc: 'Elevated Theta, low Beta, suppressed Alpha in both leads',
    },
    {
      id: 'calm',
      name: 'Low Arousal, Positive Valence (Serene / Calm)',
      valence: 0.60,
      arousal: -0.40,
      desc: 'High Alpha in F3/F4, balanced or positive FAA, low Beta',
    },
    {
      id: 'excited',
      name: 'High Arousal, Positive Valence (Excited / Flow)',
      valence: 0.65,
      arousal: 0.55,
      desc: 'Robust Alpha and Beta, strong positive FAA (Left Frontal dominance)',
    },
  ];

  const handleSelectPreset = (preset: typeof emotionalPresets[0]) => {
    setActiveEmotionalPreset(preset.id);
    defaultClosedLoopController.setSimulatedPatientEmotion(preset.valence, preset.arousal);
  };

  const handleNoiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setNoiseLevel(val);
    defaultEegEngine.setNoiseLevel(val);
  };

  // Real-time animation loop for EEG oscilloscope
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sampleCounter = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      // Generate 2 new samples per frame (approx 120Hz at 60fps)
      for (let s = 0; s < 2; s++) {
        const raw = defaultEegEngine.generateNextRawSample();
        const filtered = defaultEegEngine.filterSample(raw);
        waveformBuffer.current.push({ raw, filtered });

        if (waveformBuffer.current.length > 360) {
          waveformBuffer.current.shift();
        }
      }

      sampleCounter++;
      // Every 30 frames (~0.5s), re-extract frequency features from window
      if (sampleCounter % 30 === 0 && waveformBuffer.current.length >= 64) {
        const windowSamples = waveformBuffer.current.map((w) =>
          filterMode === 'filtered' ? w.filtered : w.raw
        );
        const feat = defaultEegEngine.extractWindowFeatures(windowSamples);
        setFeatures(feat);
      }

      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope canvas background
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, w, h);

      // Grid coordinate lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const numLines = 8;
      for (let i = 1; i < numLines; i++) {
        const y = (h / numLines) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const buf = waveformBuffer.current;
      if (buf.length < 2) return;

      const channels: Array<{
        key: 'f3' | 'f4' | 'pz';
        label: string;
        color: string;
        baseY: number;
      }> = [
        { key: 'f3', label: 'Lead 1: F3 (Left Frontal)', color: '#38bdf8', baseY: h * 0.22 },
        { key: 'f4', label: 'Lead 2: F4 (Right Frontal)', color: '#818cf8', baseY: h * 0.52 },
        { key: 'pz', label: 'Lead 3: Pz (Parietal Midline)', color: '#34d399', baseY: h * 0.82 },
      ];

      channels.forEach(({ key, label, color, baseY }) => {
        if (selectedChannel !== 'all' && selectedChannel !== key) return;

        // Channel baseline label
        ctx.fillStyle = color;
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(label, 12, baseY - 22);

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(w, baseY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Waveform trace
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.beginPath();

        const stepX = w / 360;
        const scaleY = 0.75; // uV to pixel height

        for (let i = 0; i < buf.length; i++) {
          const sample = filterMode === 'filtered' ? buf[i].filtered : buf[i].raw;
          const val = sample[key];
          const x = i * stepX;
          const y = baseY - val * scaleY;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [filterMode, selectedChannel]);

  // CSV Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const parsed: EegRawSample[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 4) {
          parsed.push({
            timestamp: parseFloat(parts[0]) || Date.now() + i * 8,
            f3: parseFloat(parts[1]) || 0,
            f4: parseFloat(parts[2]) || 0,
            pz: parseFloat(parts[3]) || 0,
          });
        }
      }

      if (parsed.length > 0) {
        defaultEegEngine.loadCsvEegData(parsed);
        setIsRealMode(true);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent = defaultEegEngine.generateSampleEegCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'neurotune_clinical_sample_3lead.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Ribbon & Source Mode Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isRealMode
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {isRealMode ? 'Active Hardware Acquisition Mode' : 'Physiological EEG Simulation Engine'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isRealMode
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {isRealMode ? 'HARDWARE / FILE STREAM' : 'SYNTHETIC 3-LEAD'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Source: <span className="font-mono text-slate-300">{defaultEegEngine.getDeviceName()}</span> · 128 Hz Sampling Rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !isRealMode;
              setIsRealMode(next);
              defaultEegEngine.setDeviceConnection(next, next ? 'BioAmp Emulated LSL Stream' : 'Simulated BioAmp 3-Channel');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
              isRealMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
            }`}
          >
            {isRealMode ? 'Switch to Simulation Mode' : 'Connect Real Hardware (Mock)'}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload CSV EEG recording"
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={downloadSampleCsv}
            title="Download Sample 20s CSV"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Grid: Oscilloscope + Controls & Spectral Extraction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Oscilloscope (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  3-Channel Real-Time Oscilloscope
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Channels: F3 (Left Frontal), F4 (Right Frontal), Pz (Parietal)
                </span>
              </div>

              {/* Display Controls: Channel Filter & Raw/Filtered Toggle */}
              <div className="flex items-center gap-2 font-mono text-xs">
                {/* Raw vs Filtered */}
                <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setFilterMode('raw')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'raw'
                        ? 'bg-slate-800 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw EEG
                  </button>
                  <button
                    onClick={() => setFilterMode('filtered')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'filtered'
                        ? 'bg-slate-800 text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Filtered (0.5-45Hz)
                  </button>
                </div>

                {/* Channel Filter */}
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                >
                  <option value="all">All 3 Leads</option>
                  <option value="f3">Lead F3 Only</option>
                  <option value="f4">Lead F4 Only</option>
                  <option value="pz">Lead Pz Only</option>
                </select>
              </div>
            </div>

            {/* Canvas Oscilloscope */}
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={320}
                className="w-full block bg-slate-950"
                style={{ height: '320px' }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-4">
                <span>Vertical scale: ±50 μV</span>
                <span>Sweep: 3.0 s window</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Signal Quality: {features.signalQuality}%</span>
                <span>·</span>
                <span>RMS Noise: {features.noiseRms} μV</span>
              </div>
            </div>
          </div>

          {/* Controllable Noise & Affective State Presets */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Controllable Simulation Parameters (Research Configuration)
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Select physiological affective signatures to simulate clinical presentations and modulate white Gaussian noise level σ.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {emotionalPresets.map((preset) => {
                const isActive = activeEmotionalPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 border-cyan-500 shadow-sm shadow-cyan-950'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-mono">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Noise Level Slider */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">
                  White Gaussian Noise Level (σ): <strong className="text-cyan-400">{noiseLevel.toFixed(1)}</strong>
                </span>
                <span className="text-slate-500">Benchmark range: [0.5, 1.0, 1.5, 2.0]</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={noiseLevel}
                onChange={handleNoiseChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.5 (Clinical Shielded)</span>
                <span>1.0 (Standard Research)</span>
                <span>1.5 (High Motion)</span>
                <span>2.0 (Extreme Noise Stress)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Frequency Band Features & Derived Affective Markers (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Extracted Spectral Band Power */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-1">
              Extracted Frequency Band Powers
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Welch PSD estimation (μV²/Hz) per lead
            </p>

            {/* Band bars for F3 */}
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-sky-400 font-semibold mb-2">
                  Lead F3 (Left Frontal)
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">θ (4-8 Hz):</span>
                    <span className="text-slate-200">{features.thetaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.thetaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">α (8-13 Hz):</span>
                    <span className="text-slate-200">{features.alphaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">β (13-30 Hz):</span>
                    <span className="text-slate-200">{features.betaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF3 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Band bars for F4 */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-mono text-indigo-400 font-semibold mb-2">
                  Lead F4 (Right Frontal)
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">α (8-13 Hz):</span>
                    <span className="text-slate-200">{features.alphaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF4 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">β (13-30 Hz):</span>
                    <span className="text-slate-200">{features.betaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF4 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Band bars for Pz */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-mono text-emerald-400 font-semibold mb-2">
                  Lead Pz (Parietal Midline)
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">β (13-30 Hz):</span>
                    <span className="text-slate-200">{features.betaPz.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.betaPz * 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Derived Affective Neuro-Markers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">
              Derived Affective Neuro-Markers
            </h4>

            <div className="space-y-3 font-mono text-xs">
              {/* Frontal Alpha Asymmetry */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Frontal Alpha Asymmetry (FAA)</span>
                  <span
                    className={`font-bold ${
                      features.faa >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {features.faa > 0 ? `+${features.faa}` : features.faa}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Formula: ln(α_F4) - ln(α_F3)
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {features.faa >= 0
                    ? 'Left hemisphere dominance (Positive affect / Approach motivation)'
                    : 'Right hemisphere dominance (Negative affect / Withdrawal motivation)'}
                </div>
              </div>

              {/* Arousal Ratio */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parietal Arousal Ratio</span>
                  <span className="font-bold text-cyan-400">{features.arousalRatio}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Formula: β_Pz / (α_Pz + θ_Pz)
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {features.arousalRatio > 0.5
                    ? 'Elevated physiological activation / Mental load'
                    : 'Reduced autonomic arousal / Sedation state'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
