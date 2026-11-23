import React, { useEffect, useState } from 'react';
import {
  Info,
  Music,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { defaultAudioEngine } from '../services/audioEngine';
import { MusicMode, NoteDensity } from '../types/neurotune';
import { AudioVisualizer } from './AudioVisualizer';

export const MusicGeneratorTab: React.FC = () => {
  const [params, setParams] = useState(defaultAudioEngine.getParameters());
  const [playbackState, setPlaybackState] = useState(defaultAudioEngine.getPlaybackState());
  const [volume, setVolume] = useState<number>(params.masterVolume || 0.75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
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
      {/* Plain-English Explainer Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          This is the live music synthesizer built into your browser. Press <strong>Play Music</strong> to hear it,
          and try changing the speed, mood (Major/Minor), or busyness yourself—or watch the AI move them during a live session.
        </div>
      </div>

      {/* Music Player Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              Live AI Music Player & Controls
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Creates calming chords, melody, and gentle rhythm in real time without pre-recorded MP3 files.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!playbackState.isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/50 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Music</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950/50 whitespace-nowrap"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Stop music"
            >
              <Square className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
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
                title="Volume"
              />
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Live Sound Wave</span>
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  playbackState.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>{playbackState.isPlaying ? 'Playing Now' : 'Paused (Press Play Music to hear)'}</span>
            </span>
          </div>
          <AudioVisualizer height={130} />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-800">
          {/* 1. Speed */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                1. Music Speed (Tempo)
              </span>
              <span className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
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
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50 (Very Slow)</span>
              <span>100 (Medium)</span>
              <span>150 (Fast)</span>
            </div>
          </div>

          {/* 2. Feel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                2. Musical Feel (Mode)
              </span>
              <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                {params.mode}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleModeChange('major')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  params.mode === 'major'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Major (Bright)
              </button>
              <button
                onClick={() => handleModeChange('minor')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  params.mode === 'minor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Minor (Soft)
              </button>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {params.mode === 'major'
                ? 'Bright, warm chords to help lift mood up'
                : 'Gentle, thoughtful chords for quiet reflection'}
            </div>
          </div>

          {/* 3. Busyness */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                3. Note Busyness (Density)
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
                  className={`py-2 px-2 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                    params.density === d
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {params.density === 'sparse'
                ? 'Fewer, longer notes (very peaceful)'
                : params.density === 'medium'
                ? 'Balanced steady melody'
                : 'More frequent flowing notes (higher energy)'}
            </div>
          </div>
        </div>
      </div>

      {/* Sound Layers Explained Simply */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Warm Background Chords
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Soft layered tones fade in smoothly like a gentle keyboard pad to create a relaxing atmosphere.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Gentle Melody Notes
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plays soft musical patterns at the exact BPM speed and note busyness chosen by the AI.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            Deep Bass & Soft Pulse
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adds a steady low heartbeat-like pulse so the listener's breathing and energy naturally settle into rhythm.
          </p>
        </div>
      </div>
    </div>
  );
};
