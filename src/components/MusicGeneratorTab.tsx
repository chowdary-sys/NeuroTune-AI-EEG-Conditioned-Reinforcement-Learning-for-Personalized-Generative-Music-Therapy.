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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 block mb-0.5">What This Page Does:</strong>
          This is the live music synthesizer built into your browser. Press <strong>Play Music</strong> to hear it,
          and adjust the speed, mood (Major/Minor), or busyness yourself, or watch the AI update them during a live session.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-600" />
              Live AI Music Player and Controls
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Creates calming chords, melody, and gentle rhythm in real time without pre-recorded audio files.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!playbackState.isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-5 py-2.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Music</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer"
              title="Stop music"
            >
              <Square className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={toggleMute}
                className="text-slate-600 hover:text-slate-900 cursor-pointer p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-600" />
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
                className="w-20 accent-cyan-600 cursor-pointer"
                title="Volume"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Live Sound Wave</span>
            <span className={playbackState.isPlaying ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {playbackState.isPlaying ? 'Playing Now' : 'Paused (Press Play Music to hear)'}
            </span>
          </div>
          <AudioVisualizer height={130} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-200">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-800">
                1. Music Speed (Tempo)
              </span>
              <span className="text-xl font-mono font-bold text-cyan-700 tabular-nums">
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
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>50 (Very Slow)</span>
              <span>100 (Medium)</span>
              <span>150 (Fast)</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-800">
                2. Musical Feel (Mode)
              </span>
              <span className="text-xs font-mono text-sky-700 uppercase font-semibold">
                {params.mode}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleModeChange('major')}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  params.mode === 'major'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                }`}
              >
                Major (Bright)
              </button>
              <button
                onClick={() => handleModeChange('minor')}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  params.mode === 'minor'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                }`}
              >
                Minor (Soft)
              </button>
            </div>
            <div className="text-[11px] text-slate-600 mt-2">
              {params.mode === 'major'
                ? 'Bright, warm chords to help lift mood up'
                : 'Gentle, thoughtful chords for quiet reflection'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-800">
                3. Note Busyness (Density)
              </span>
              <span className="text-xs font-mono text-emerald-700 uppercase font-semibold">
                {params.density}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {(['sparse', 'medium', 'dense'] as NoteDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDensityChange(d)}
                  className={`py-2 px-2 rounded-md text-xs capitalize transition-colors cursor-pointer ${
                    params.density === d
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-600 mt-2">
              {params.density === 'sparse'
                ? 'Fewer, longer notes (very peaceful)'
                : params.density === 'medium'
                ? 'Balanced steady melody'
                : 'More frequent flowing notes (higher energy)'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Warm Background Chords
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Soft layered tones fade in smoothly like a gentle keyboard pad to create a relaxing atmosphere.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Gentle Melody Notes
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Plays soft musical patterns at the exact BPM speed and note busyness chosen by the AI.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Deep Bass and Soft Pulse
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Adds a steady low heartbeat-like pulse so the listener's breathing and energy settle into rhythm.
          </p>
        </div>
      </div>
    </div>
  );
};
