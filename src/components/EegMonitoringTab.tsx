import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Download,
  Info,
  Radio,
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
  const waveformBuffer = useRef<Array<{ raw: EegRawSample; filtered: EegRawSample }>>([]);

  const emotionalPresets = [
    {
      id: 'anxious',
      name: 'Stressed / Tense',
      valence: -0.55,
      arousal: 0.65,
      desc: 'Fast Beta waves are high; brain looks alert and worried',
    },
    {
      id: 'depressed',
      name: 'Sad / Low Energy',
      valence: -0.45,
      arousal: -0.50,
      desc: 'Slow Theta waves are higher; low energy and negative mood balance',
    },
    {
      id: 'calm',
      name: 'Calm / Relaxed',
      valence: 0.60,
      arousal: -0.40,
      desc: 'Steady Alpha waves in both sides; peaceful and low stress',
    },
    {
      id: 'excited',
      name: 'Happy / Excited',
      valence: 0.65,
      arousal: 0.55,
      desc: 'Strong left-brain happiness balance with lively Beta energy',
    },
  ];

  const handleSelectPreset = (preset: (typeof emotionalPresets)[0]) => {
    setActiveEmotionalPreset(preset.id);
    defaultClosedLoopController.setSimulatedPatientEmotion(preset.valence, preset.arousal);
  };

  const handleNoiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setNoiseLevel(val);
    defaultEegEngine.setNoiseLevel(val);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sampleCounter = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      for (let s = 0; s < 2; s++) {
        const raw = defaultEegEngine.generateNextRawSample();
        const filtered = defaultEegEngine.filterSample(raw);
        waveformBuffer.current.push({ raw, filtered });

        if (waveformBuffer.current.length > 360) {
          waveformBuffer.current.shift();
        }
      }

      sampleCounter++;
      if (sampleCounter % 30 === 0 && waveformBuffer.current.length >= 64) {
        const windowSamples = waveformBuffer.current.map((w) =>
          filterMode === 'filtered' ? w.filtered : w.raw
        );
        const feat = defaultEegEngine.extractWindowFeatures(windowSamples);
        setFeatures(feat);
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, w, h);

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
        { key: 'f3', label: 'Sensor 1: F3 (Front Left)', color: '#38bdf8', baseY: h * 0.22 },
        { key: 'f4', label: 'Sensor 2: F4 (Front Right)', color: '#818cf8', baseY: h * 0.52 },
        { key: 'pz', label: 'Sensor 3: Pz (Top Back)', color: '#34d399', baseY: h * 0.82 },
      ];

      channels.forEach(({ key, label, color, baseY }) => {
        if (selectedChannel !== 'all' && selectedChannel !== key) return;

        ctx.fillStyle = color;
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(label, 12, baseY - 22);

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(w, baseY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.beginPath();

        const stepX = w / 360;
        const scaleY = 0.75;

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
    link.setAttribute('download', 'neurotune_sample_brainwaves.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Plain-English Explainer Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          This screen shows live simulated brainwaves from 3 sensors on the head (Front Left, Front Right, and Top Back).
          Pick a feeling below to test how the brainwaves change, add signal noise to test robustness, or upload your own CSV brainwave file.
        </div>
      </div>

      {/* Mode Banner */}
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
            <h3 className="text-sm font-semibold text-white">
              {isRealMode ? 'Using External Device / Uploaded CSV File' : 'Using Built-In Brainwave Simulator'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Source: <span className="font-mono text-slate-300">{defaultEegEngine.getDeviceName()}</span> · 128 readings per second
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const next = !isRealMode;
              setIsRealMode(next);
              defaultEegEngine.setDeviceConnection(next, next ? 'External Hardware / CSV Stream' : 'Simulated 3-Sensor EEG');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isRealMode
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
            }`}
          >
            {isRealMode ? 'Back to Simulator' : 'Test Real Device Mode'}
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
            title="Upload your own CSV recording"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={downloadSampleCsv}
            title="Download a sample CSV recording"
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Brainwave Graph (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Brainwave Lines (3 Sensors)
                </h3>
                <span className="text-xs text-slate-400">
                  Switch between raw messy waves and cleaned waves (0.5–45 Hz filter)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setFilterMode('raw')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'raw'
                        ? 'bg-slate-800 text-amber-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw (Unfiltered)
                  </button>
                  <button
                    onClick={() => setFilterMode('filtered')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'filtered'
                        ? 'bg-slate-800 text-cyan-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cleaned Signal
                  </button>
                </div>

                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as 'all' | 'f3' | 'f4' | 'pz')}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">Show All 3 Sensors</option>
                  <option value="f3">F3 (Front Left)</option>
                  <option value="f4">F4 (Front Right)</option>
                  <option value="pz">Pz (Top Back)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={320}
                className="w-full block bg-slate-950"
                style={{ height: '320px' }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-4">
                <span>Height: ±50 μV</span>
                <span>Window: 3 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Signal Clarity: {features.signalQuality}%</span>
                <span>·</span>
                <span>Noise: {features.noiseRms} μV</span>
              </div>
            </div>
          </div>

          {/* Interactive Presets & Noise Slider */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Test Different Listener Moods & Signal Noise
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Click any feeling below to change the simulated listener's brainwaves right away:
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
                      <span className="text-xs font-semibold text-white">{preset.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">
                  Add Background Static / Noise (σ): <strong className="text-cyan-400 font-mono">{noiseLevel.toFixed(1)}</strong>
                </span>
                <span className="text-slate-500 text-[11px]">Paper tests: 0.5, 1.0, 1.5, 2.0</span>
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
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.5 (Very Clean)</span>
                <span>1.0 (Normal Noise)</span>
                <span>1.5 (Noisy)</span>
                <span>2.0 (Very Messy)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Brainwave Speeds & Mood Clues (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-1">
              Brainwave Energy by Speed
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              How strong each wave rhythm is right now:
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-sky-400 mb-2">
                  F3 Sensor (Front Left)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Theta (4–8 Hz · Sleepy)</span>
                    <span className="text-slate-200 font-mono">{features.thetaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.thetaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Alpha (8–13 Hz · Relaxed)</span>
                    <span className="text-slate-200 font-mono">{features.alphaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Beta (13–30 Hz · Alert / Tense)</span>
                    <span className="text-slate-200 font-mono">{features.betaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF3 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-indigo-400 mb-2">
                  F4 Sensor (Front Right)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Alpha (Relaxed)</span>
                    <span className="text-slate-200 font-mono">{features.alphaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF4 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Beta (Alert / Tense)</span>
                    <span className="text-slate-200 font-mono">{features.betaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF4 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-emerald-400 mb-2">
                  Pz Sensor (Top Back)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Beta (Alertness)</span>
                    <span className="text-slate-200 font-mono">{features.betaPz.toFixed(1)}</span>
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

          {/* Derived Mood Clues */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">
              Two Main Mood Clues From These Waves
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Left vs Right Balance (FAA)</span>
                  <span
                    className={`font-mono font-bold ${
                      features.faa >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {features.faa > 0 ? `+${features.faa}` : features.faa}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {features.faa >= 0
                    ? 'Positive = More left-brain activity (happier mood clue)'
                    : 'Negative = More right-brain activity (stressed mood clue)'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Energy Ratio (Beta / Slow)</span>
                  <span className="font-mono font-bold text-cyan-400">{features.arousalRatio}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {features.arousalRatio > 0.5
                    ? 'Higher score = Brain looks busy, alert, or tense'
                    : 'Lower score = Brain looks calm and relaxed'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
