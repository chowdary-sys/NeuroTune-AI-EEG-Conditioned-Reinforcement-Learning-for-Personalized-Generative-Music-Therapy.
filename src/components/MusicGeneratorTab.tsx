import React, { useEffect, useState } from 'react';
import {
  Disc,
  FastForward,
  Music,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Square,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { defaultAudioEngine } from '../services/audioEngine';
import { defaultClosedLoopController } from '../services/closedLoopController';
import { MusicMode, NoteDensity } from '../types/neurotune';
import { AudioVisualizer } from './AudioVisualizer';

export const MusicGeneratorTab: React.FC = () => {
  const [params, setParams] = useState(defaultAudioEngine.getParameters());
  const [playbackState, setPlaybackState] = useState(defaultAudioEngine.getPlaybackState());
  const [volume, setVolume] = useState<number>(params.masterVolume || 0.75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Poll audio parameters when RL agent updates them
    const timer = setInterval(() => {
      setParams(defaultAudioEngine.getParameters());
      setPlaybackState(defaultAudioEngine.getPlaybackState());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const handlePlay = () => {
    defaultAudioEngine.play();
    setPlaybackState(defaultAudioEngine.getPlaybackState());
  };

  const handlePause = () => {
    defaultAudioEngine.pause();
    setPlaybackState(defaultAudioEngine.getPlaybackState());
  };

  const handleStop = () => {
    defaultAudioEngine.stop();
    setPlaybackState(defaultAudioEngine.getPlaybackState());
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempo = parseInt(e.target.value, 10);
    defaultAudioEngine.setParameters({ tempo });
    setParams((prev) => ({ ...prev, tempo }));
  };

  const handleModeChange = (mode: MusicMode) => {
    defaultAudioEngine.setParameters({ mode });
    setParams((prev) => ({ ...prev, mode }));
  };

  const handleDensityChange = (density: NoteDensity) => {
    defaultAudioEngine.setParameters({ density });
    setParams((prev) => ({ ...prev, density }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (!isMuted) {
      defaultAudioEngine.setVolume(vol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      defaultAudioEngine.setVolume(volume);
      setIsMuted(false);
    } else {
      defaultAudioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Synthesizer Studio Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>WEB AUDIO API PROCEDURAL SYNTHESIZER</span>
              <span>·</span>
              <span>REAL-TIME RL STEERING</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              Generative Affective Music Console
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic multi-oscillator polyphonic progression generator. Parameters adapt in real time as the REINFORCE policy samples actions.
            </p>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-3">
            {!playbackState.isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Synthesizer</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Stop playback"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-slate-200 cursor-pointer p-1"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-cyan-400 cursor-pointer"
                title="Master volume"
              />
            </div>
          </div>
        </div>

        {/* Real-time Oscilloscope & Frequency Spectrum Visualizer */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Audio AnalyserNode (Oscilloscope & Spectral FFT)</span>
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  playbackState.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>{playbackState.isPlaying ? 'Engine Streaming' : 'Standby'}</span>
            </span>
          </div>
          <AudioVisualizer height={130} />
        </div>

        {/* Dynamic Music Parameters (Tempo, Mode, Density) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-800">
          {/* 1. Tempo (BPM) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Acoustic Tempo
              </span>
              <span className="text-xl font-mono font-bold text-cyan-400">
                {params.tempo} <span className="text-xs text-slate-500">BPM</span>
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="1"
              value={params.tempo}
              onChange={handleTempoChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>50 (Largo / Meditative)</span>
              <span>100 (Andante)</span>
              <span>150 (Vivace)</span>
            </div>
          </div>

          {/* 2. Musical Mode (Major / Minor) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Harmonic Mode
              </span>
              <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                {params.mode === 'major' ? 'Ionian Scale' : 'Aeolian Scale'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleModeChange('major')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  params.mode === 'major'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Major (Uplifting)
              </button>
              <button
                onClick={() => handleModeChange('minor')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  params.mode === 'minor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Minor (Introspective)
              </button>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {params.mode === 'major'
                ? 'Progression: C - F - G - Am (Valence elevation)'
                : 'Progression: Am - F - C - G (Reflective/Sedative)'}
            </div>
          </div>

          {/* 3. Note Density (Sparse, Medium, Dense) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Note Density
              </span>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                {params.density}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {(['sparse', 'medium', 'dense'] as NoteDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDensityChange(d)}
                  className={`py-2 px-2 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                    params.density === d
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {params.density === 'sparse'
                ? 'Sustained 1/2 notes (Low cognitive load)'
                : params.density === 'medium'
                ? 'Quarter notes (Steady rhythmic focus)'
                : 'Flowing 1/8 notes (High acoustic energy)'}
            </div>
          </div>
        </div>
      </div>

      {/* Procedural Sound Synthesis Architecture Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Warm Polyphonic Pad Section
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Dual sine and triangle oscillator voices with 6Hz detuning for natural chorus.
            Envelope: 400ms linear attack, sustained organ timbre, routed through dynamic Biquad lowpass filter.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Melodic Arpeggiation Section
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Triangle oscillator lead articulating pentatonic intervals in synchrony with the RL-prescribed tempo.
            Note durations scale dynamically (180ms to 600ms) with density.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Acoustic Cadence & Sub-Bass
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Sub-bass root fundamental (87-196 Hz) paired with organic pitch-envelope percussion pulse
            (140Hz decaying to 35Hz) providing entrainment rhythm.
          </p>
        </div>
      </div>
    </div>
  );
};
