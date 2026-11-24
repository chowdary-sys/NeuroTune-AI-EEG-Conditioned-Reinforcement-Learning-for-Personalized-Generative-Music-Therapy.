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

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
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
        { key: 'f3', label: 'Sensor 1: F3 (Front Left)', color: '#0284c7', baseY: h * 0.22 },
        { key: 'f4', label: 'Sensor 2: F4 (Front Right)', color: '#d97706', baseY: h * 0.52 },
        { key: 'pz', label: 'Sensor 3: Pz (Top Back)', color: '#059669', baseY: h * 0.82 },
      ];

      channels.forEach(({ key, label, color, baseY }) => {
        if (selectedChannel !== 'all' && selectedChannel !== key) return;

        ctx.fillStyle = color;
        ctx.font = '600 11px JetBrains Mono';
        ctx.fillText(label, 12, baseY - 22);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(w, baseY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineWidth = 1.75;
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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 block mb-0.5">What This Page Does:</strong>
          This screen displays live simulated brainwaves from 3 sensors on the head (Front Left F3, Front Right F4, and Top Back Pz).
          Pick a feeling below to test how the brainwaves change, add signal noise to test robustness, or upload your own CSV brainwave file.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${
              isRealMode
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}
          >
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isRealMode ? 'Using External Device or Uploaded CSV File' : 'Using Built-In Brainwave Simulator'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Source: <span className="font-mono text-slate-800">{defaultEegEngine.getDeviceName()}</span> · 128 readings per second
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isRealMode
                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
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
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-600" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={downloadSampleCsv}
            title="Download a sample CSV recording"
            className="px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  Live Brainwave Lines (3 Sensors)
                </h3>
                <span className="text-xs text-slate-600">
                  Switch between raw messy waves and cleaned waves (0.5 to 45 Hz filter)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
                  <button
                    onClick={() => setFilterMode('raw')}
                    className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                      filterMode === 'raw'
                        ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Raw (Unfiltered)
                  </button>
                  <button
                    onClick={() => setFilterMode('filtered')}
                    className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                      filterMode === 'filtered'
                        ? 'bg-white text-cyan-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cleaned Signal
                  </button>
                </div>

                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as 'all' | 'f3' | 'f4' | 'pz')}
                  className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Show All 3 Sensors</option>
                  <option value="f3">F3 (Front Left)</option>
                  <option value="f4">F4 (Front Right)</option>
                  <option value="pz">Pz (Top Back)</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
              <canvas
                ref={canvasRef}
                width={800}
                height={320}
                className="w-full block bg-white"
                style={{ height: '320px' }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-mono tabular-nums">
              <div className="flex items-center gap-4">
                <span>Height: ±50 μV</span>
                <span>Window: 3 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-semibold">Clarity: {features.signalQuality}%</span>
                <span>·</span>
                <span>Noise: {features.noiseRms} μV</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              Test Different Listener Moods and Signal Noise
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              Click any feeling below to change the simulated listener brainwaves right away:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {emotionalPresets.map((preset) => {
                const isActive = activeEmotionalPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-cyan-50 border-cyan-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{preset.name}</span>
                      {isActive && <span className="text-[10px] font-mono text-cyan-700 font-bold">ACTIVE</span>}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-700">
                  Add Background Static / Noise (σ): <strong className="text-cyan-700 font-mono">{noiseLevel.toFixed(1)}</strong>
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
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5 (Very Clean)</span>
                <span>1.0 (Normal Noise)</span>
                <span>1.5 (Noisy)</span>
                <span>2.0 (Very Messy)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              Brainwave Energy by Speed
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              How strong each wave rhythm is right now:
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-sky-700 mb-2">
                  F3 Sensor (Front Left)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Theta (4 to 8 Hz · Sleepy)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.thetaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-slate-500 h-full transition-all"
                      style={{ width: `${Math.min(100, features.thetaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Alpha (8 to 13 Hz · Relaxed)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.alphaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF3 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Beta (13 to 30 Hz · Alert / Tense)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.betaF3.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF3 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-amber-700 mb-2">
                  F4 Sensor (Front Right)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Alpha (Relaxed)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.alphaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full transition-all"
                      style={{ width: `${Math.min(100, features.alphaF4 * 3)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Beta (Alert / Tense)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.betaF4.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${Math.min(100, features.betaF4 * 3)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-emerald-700 mb-2">
                  Pz Sensor (Top Back)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Beta (Alertness)</span>
                    <span className="text-slate-900 font-mono tabular-nums font-medium">{features.betaPz.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${Math.min(100, features.betaPz * 3)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Two Main Mood Clues From These Waves
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">Left vs Right Balance (FAA)</span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      features.faa >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {features.faa > 0 ? `+${features.faa}` : features.faa}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {features.faa >= 0
                    ? 'Positive = More left-brain activity (happier mood clue)'
                    : 'Negative = More right-brain activity (stressed mood clue)'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">Energy Ratio (Beta / Slow)</span>
                  <span className="font-mono font-bold text-cyan-700 tabular-nums">{features.arousalRatio}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
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
