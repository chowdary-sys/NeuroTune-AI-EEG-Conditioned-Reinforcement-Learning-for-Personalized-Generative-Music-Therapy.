/**
 * Procedural Music Synthesis Engine via Web Audio API
 * Generates dynamic harmonic progressions, melodic arpeggiations, and rhythmic pulses
 * strictly steered in real-time by the Reinforcement Learning agent's actions:
 * - Tempo (50-150 BPM)
 * - Mode (Major / Minor scales)
 * - Note Density (Sparse, Medium, Dense)
 */

import { MusicMode, MusicParameters, NoteDensity } from '../types/neurotune';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isPaused = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  // Music parameters
  private currentParams: MusicParameters = {
    tempo: 78,
    mode: 'major',
    density: 'medium',
    masterVolume: 0.75,
  };

  // Scheduling timer & state
  private schedulerInterval: number | null = null;
  private currentStep = 0;
  private chordIndex = 0;

  // Musical note frequencies (Hz) for procedural generation
  // Base scale notes: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88
  // Minor notes: Eb4=311.13, Ab4=415.30, Bb4=466.16
  private scales = {
    major: {
      chords: [
        [261.63, 329.63, 392.0, 523.25], // C Major
        [349.23, 440.0, 523.25, 659.25], // F Major
        [392.0, 493.88, 587.33, 783.99], // G Major
        [220.0, 261.63, 329.63, 440.0],  // A Minor
      ],
      leadNotes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // C Major Pentatonic / Diatonic
      bassNotes: [130.81, 174.61, 196.0, 110.0],
    },
    minor: {
      chords: [
        [220.0, 261.63, 329.63, 440.0],  // A Minor
        [174.61, 220.0, 261.63, 349.23], // F Major
        [261.63, 329.63, 392.0, 523.25], // C Major
        [196.0, 246.94, 293.66, 392.0],  // G Major
      ],
      leadNotes: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33], // A Minor Pentatonic
      bassNotes: [110.0, 87.31, 130.81, 98.0],
    },
  };

  private ensureAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentParams.masterVolume || 0.75, this.ctx.currentTime);

      // Warm Master Lowpass Filter
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(2800, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Analyser Node for Visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      // Routing: Filter -> MasterGain -> Analyser -> Destination
      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public setParameters(params: Partial<MusicParameters>) {
    this.currentParams = { ...this.currentParams, ...params };

    // Update filter warmth based on mode and density
    if (this.filterNode && this.ctx) {
      const targetFreq = this.currentParams.mode === 'minor' ? 2200 : 3200;
      this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    }

    // If currently playing, restart scheduler interval to adjust to the new tempo
    if (this.isPlaying && !this.isPaused) {
      this.startScheduler();
    }
  }

  public getParameters(): MusicParameters {
    return { ...this.currentParams };
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1.0, vol));
    this.currentParams.masterVolume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public play() {
    const ctx = this.ensureAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.startScheduler();
  }

  public pause() {
    this.isPaused = true;
    this.isPlaying = false;
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.chordIndex = 0;
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  public getPlaybackState(): { isPlaying: boolean; isPaused: boolean; tempo: number; mode: MusicMode; density: NoteDensity } {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      tempo: this.currentParams.tempo,
      mode: this.currentParams.mode,
      density: this.currentParams.density,
    };
  }

  /**
   * Schedules rhythmic and melodic events based on BPM and density.
   */
  private startScheduler() {
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
    }

    // Base 16th note interval at current BPM:
    // 60 / BPM = seconds per quarter note -> (60 / BPM) / 4 = seconds per 16th note
    const sixteenthSec = (60 / this.currentParams.tempo) / 4;
    const intervalMs = Math.max(30, Math.round(sixteenthSec * 1000));

    this.schedulerInterval = window.setInterval(() => {
      if (!this.isPlaying || this.isPaused || !this.ctx) return;
      this.tick();
    }, intervalMs);
  }

  private tick() {
    if (!this.ctx || !this.filterNode) return;
    const now = this.ctx.currentTime;
    const mode = this.currentParams.mode;
    const density = this.currentParams.density;
    const scaleData = this.scales[mode];

    // Every 16 steps (one 4/4 bar), change chord progression
    if (this.currentStep % 16 === 0) {
      this.chordIndex = (this.chordIndex + 1) % scaleData.chords.length;
      const chord = scaleData.chords[this.chordIndex];
      const bassNote = scaleData.bassNotes[this.chordIndex];

      // Play warm chord pad
      this.synthesizePadChord(chord, now, sixteenthToSec(this.currentParams.tempo) * 16);
      // Play sub-bass tone
      this.synthesizeBass(bassNote, now, sixteenthToSec(this.currentParams.tempo) * 8);
    }

    // Determine melodic triggers based on density:
    // Sparse: triggers on step 0 and 8 (half notes)
    // Medium: triggers on step 0, 4, 8, 12 (quarter notes)
    // Dense: triggers on even steps 0, 2, 4, 6, 8, 10, 12, 14 (eighth notes)
    let shouldTriggerLead = false;
    if (density === 'sparse' && (this.currentStep % 8 === 0)) {
      shouldTriggerLead = true;
    } else if (density === 'medium' && (this.currentStep % 4 === 0)) {
      shouldTriggerLead = true;
    } else if (density === 'dense' && (this.currentStep % 2 === 0)) {
      shouldTriggerLead = true;
    }

    if (shouldTriggerLead) {
      const notes = scaleData.leadNotes;
      // Procedural melodic selection with gentle interval jumps
      const noteIdx = (this.currentStep * 3 + this.chordIndex * 2) % notes.length;
      const noteFreq = notes[noteIdx];
      const noteDuration = density === 'sparse' ? 0.6 : density === 'medium' ? 0.35 : 0.18;
      this.synthesizeLead(noteFreq, now, noteDuration);
    }

    // Soft acoustic percussion pulse on quarter notes (steps 0, 4, 8, 12)
    if (this.currentStep % 4 === 0) {
      this.synthesizePercussionPulse(now, this.currentStep === 0);
    }

    this.currentStep = (this.currentStep + 1) % 64;
  }

  /**
   * Multi-oscillator harmonic chord pad with soft attack & slow release.
   */
  private synthesizePadChord(frequencies: number[], startTime: number, duration: number) {
    if (!this.ctx || !this.filterNode) return;

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Slight detune for warm chorus effect
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime(idx * 4 - 6, startTime);

      // ADSR Envelope: Soft 0.3s attack, gentle decay
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.08 / frequencies.length, startTime + 0.4);
      gain.gain.setValueAtTime(0.08 / frequencies.length, startTime + duration - 0.4);
      gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.filterNode!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }

  /**
   * Resonant melodic lead tone with subtle pitch articulation.
   */
  private synthesizeLead(frequency: number, startTime: number, duration: number) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Warm sub-bass note anchor.
   */
  private synthesizeBass(frequency: number, startTime: number, duration: number) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.14, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Soft organic acoustic beat pulse (subtle woodblock/kick resonance).
   */
  private synthesizePercussionPulse(startTime: number, isDownbeat: boolean) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isDownbeat ? 140 : 100;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.09);

    const amp = isDownbeat ? 0.12 : 0.07;
    gain.gain.setValueAtTime(amp, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  /**
   * Returns audio analyzer node for real-time oscilloscope or FFT spectrum rendering.
   */
  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}

function sixteenthToSec(bpm: number): number {
  return (60 / bpm) / 4;
}

export const defaultAudioEngine = new AudioEngine();
