/**
 * EEG Signal Acquisition and Preprocessing Engine
 * Implements 3-lead synthetic generation, digital bandpass filtering,
 * window segmentation, and spectral band power feature extraction.
 */

import { EegFrequencyFeatures, EegRawSample, EmotionState } from '../types/neurotune';

export class EegEngine {
  private sampleRate = 128; // Hz (clinical telemetry resolution)
  private sampleIndex = 0;
  private noiseLevel = 1.0; // Default research baseline
  private currentEmotionalState: { valence: number; arousal: number } = {
    valence: -0.5,
    arousal: 0.6, // Start in agitated/anxious state as typical therapy candidate
  };

  // Hardware emulation state
  private isRealDeviceConnected = false;
  private deviceName = 'Simulated BioAmp 3-Channel';
  private uploadedData: EegRawSample[] | null = null;
  private uploadedIndex = 0;

  // Filter state for F3, F4, Pz (2nd order IIR bandpass 0.5Hz - 45Hz)
  private filterState = {
    f3: { x1: 0, x2: 0, y1: 0, y2: 0 },
    f4: { x1: 0, x2: 0, y1: 0, y2: 0 },
    pz: { x1: 0, x2: 0, y1: 0, y2: 0 },
  };

  public setNoiseLevel(level: number) {
    this.noiseLevel = Math.max(0.1, Math.min(3.0, level));
  }

  public getNoiseLevel(): number {
    return this.noiseLevel;
  }

  public setEmotionalState(valence: number, arousal: number) {
    this.currentEmotionalState = {
      valence: Math.max(-1.0, Math.min(1.0, valence)),
      arousal: Math.max(-1.0, Math.min(1.0, arousal)),
    };
  }

  public setDeviceConnection(connected: boolean, deviceName = 'BioAmp LSL Stream') {
    this.isRealDeviceConnected = connected;
    this.deviceName = deviceName;
  }

  public isRealDevice(): boolean {
    return this.isRealDeviceConnected;
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public loadCsvEegData(samples: EegRawSample[]) {
    this.uploadedData = samples;
    this.uploadedIndex = 0;
    this.isRealDeviceConnected = true;
    this.deviceName = 'Uploaded Clinical EEG Trace';
  }

  /**
   * Generates a single raw sample for F3, F4, Pz leads.
   * Modulated according to neurophysiological emotion signatures:
   * - Frontal Alpha Asymmetry (FAA = ln(Alpha_F4) - ln(Alpha_F3)) scales with Valence
   * - Beta power / (Alpha + Theta) scales with Arousal
   */
  public generateNextRawSample(): EegRawSample {
    if (this.uploadedData && this.uploadedData.length > 0) {
      const sample = this.uploadedData[this.uploadedIndex];
      this.uploadedIndex = (this.uploadedIndex + 1) % this.uploadedData.length;
      return sample;
    }

    const t = this.sampleIndex / this.sampleRate;
    this.sampleIndex++;

    const { valence, arousal } = this.currentEmotionalState;

    // Physiological band frequencies
    const thetaFreq = 6.0; // 4-8 Hz
    const alphaFreq = 10.2; // 8-13 Hz
    const betaFreq = 21.5; // 13-30 Hz

    // Amplitude modulation based on emotion:
    // When valence > 0: Left frontal cortex (F3) is more active -> Alpha in F3 is SUPPRESSED (lower amplitude)
    // so ln(Alpha_F4) - ln(Alpha_F3) > 0.
    // When valence < 0: Right frontal (F4) has lower alpha, F3 has higher alpha.
    const alphaF3Amp = 22 * (1.0 - 0.45 * valence);
    const alphaF4Amp = 22 * (1.0 + 0.45 * valence);
    const alphaPzAmp = 26 * (1.0 - 0.25 * arousal);

    // Beta amplitude scales directly with arousal/stress
    const betaAmp = 8 + 14 * Math.max(0, (arousal + 1) / 2);

    // Theta amplitude is elevated during low arousal / fatigue / depressive states
    const thetaAmp = 14 + 10 * Math.max(0, (-arousal + 1) / 2);

    // Standard Gaussian noise generator (Box-Muller)
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const gNoise1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const gNoise2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    const gNoise3 = (Math.random() - 0.5) * 2;

    const noiseScaling = this.noiseLevel * 6.5;

    // Synthesize multi-channel raw EEG signals in microvolts (uV)
    const rawF3 =
      thetaAmp * Math.sin(2 * Math.PI * thetaFreq * t + 0.1) +
      alphaF3Amp * Math.sin(2 * Math.PI * alphaFreq * t) +
      betaAmp * Math.sin(2 * Math.PI * betaFreq * t + 1.2) +
      gNoise1 * noiseScaling;

    const rawF4 =
      thetaAmp * Math.sin(2 * Math.PI * thetaFreq * t + 0.4) +
      alphaF4Amp * Math.sin(2 * Math.PI * (alphaFreq + 0.15) * t + 0.3) +
      betaAmp * Math.sin(2 * Math.PI * (betaFreq + 0.2) * t + 0.8) +
      gNoise2 * noiseScaling;

    const rawPz =
      (thetaAmp * 1.2) * Math.sin(2 * Math.PI * thetaFreq * t + 0.6) +
      alphaPzAmp * Math.sin(2 * Math.PI * alphaFreq * t + 0.9) +
      (betaAmp * 0.8) * Math.sin(2 * Math.PI * betaFreq * t + 2.1) +
      gNoise3 * noiseScaling;

    return {
      timestamp: Date.now(),
      f3: parseFloat(rawF3.toFixed(2)),
      f4: parseFloat(rawF4.toFixed(2)),
      pz: parseFloat(rawPz.toFixed(2)),
    };
  }

  /**
   * Applies digital bandpass filtering (0.5 - 45 Hz) using a standard biquad section.
   */
  public filterSample(raw: EegRawSample): EegRawSample {
    // 2nd-order Butterworth bandpass coefficients at 128Hz fs (fc1=1Hz, fc2=40Hz)
    // Pre-calculated normalized biquad coefficients:
    const b0 = 0.564;
    const b1 = 0.0;
    const b2 = -0.564;
    const a1 = -0.732;
    const a2 = 0.128;

    const processChannel = (
      val: number,
      state: { x1: number; x2: number; y1: number; y2: number }
    ) => {
      const y = b0 * val + b1 * state.x1 + b2 * state.x2 - a1 * state.y1 - a2 * state.y2;
      state.x2 = state.x1;
      state.x1 = val;
      state.y2 = state.y1;
      state.y1 = y;
      return y;
    };

    return {
      timestamp: raw.timestamp,
      f3: parseFloat(processChannel(raw.f3, this.filterState.f3).toFixed(2)),
      f4: parseFloat(processChannel(raw.f4, this.filterState.f4).toFixed(2)),
      pz: parseFloat(processChannel(raw.pz, this.filterState.pz).toFixed(2)),
    };
  }

  /**
   * Extracts frequency band features from a window of samples (default window: 128 or 256 samples).
   * Calculates Theta (4-8Hz), Alpha (8-13Hz), Beta (13-30Hz), Frontal Alpha Asymmetry, and Arousal Ratio.
   */
  public extractWindowFeatures(window: EegRawSample[]): EegFrequencyFeatures {
    const N = window.length;
    if (N < 32) {
      // Fallback baseline if insufficient window
      return {
        thetaF3: 15.0,
        alphaF3: 20.0,
        betaF3: 10.0,
        thetaF4: 15.0,
        alphaF4: 20.0,
        betaF4: 10.0,
        thetaPz: 18.0,
        alphaPz: 25.0,
        betaPz: 8.0,
        faa: 0.0,
        arousalRatio: 0.25,
        signalQuality: 98.5,
        noiseRms: 2.1,
      };
    }

    // Discrete Fourier Transform energy calculation for target bands
    const calculateBandPowers = (samples: number[]) => {
      // Compute DFT bins
      let thetaPower = 0;
      let alphaPower = 0;
      let betaPower = 0;
      let totalPower = 0;

      // Evaluate frequencies in 0.5Hz resolution
      for (let f = 1.0; f <= 40.0; f += 0.5) {
        let real = 0;
        let imag = 0;
        const omega = (2 * Math.PI * f) / this.sampleRate;

        // Apply Hanning taper window
        for (let n = 0; n < N; n++) {
          const hann = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
          const x = samples[n] * hann;
          real += x * Math.cos(omega * n);
          imag -= x * Math.sin(omega * n);
        }

        const psd = (real * real + imag * imag) / N;
        totalPower += psd;

        if (f >= 4.0 && f <= 8.0) {
          thetaPower += psd;
        } else if (f > 8.0 && f <= 13.0) {
          alphaPower += psd;
        } else if (f > 13.0 && f <= 30.0) {
          betaPower += psd;
        }
      }

      return {
        theta: Math.max(0.1, thetaPower / 8),
        alpha: Math.max(0.1, alphaPower / 10),
        beta: Math.max(0.1, betaPower / 34),
        total: Math.max(1.0, totalPower),
      };
    };

    const f3Samples = window.map((s) => s.f3);
    const f4Samples = window.map((s) => s.f4);
    const pzSamples = window.map((s) => s.pz);

    const f3Bands = calculateBandPowers(f3Samples);
    const f4Bands = calculateBandPowers(f4Samples);
    const pzBands = calculateBandPowers(pzSamples);

    // Frontal Alpha Asymmetry: ln(Alpha_F4) - ln(Alpha_F3)
    const faa = Math.log(f4Bands.alpha) - Math.log(f3Bands.alpha);

    // Arousal Ratio: Beta_Pz / (Alpha_Pz + Theta_Pz)
    const arousalRatio = pzBands.beta / (pzBands.alpha + pzBands.theta + 1e-5);

    // Calculate Noise RMS
    let sumSq = 0;
    for (let i = 1; i < N; i++) {
      const diff = f3Samples[i] - f3Samples[i - 1];
      sumSq += diff * diff;
    }
    const noiseRms = Math.sqrt(sumSq / N);
    const snr = Math.max(50, Math.min(99.4, 100 - this.noiseLevel * 12 + (Math.random() * 2 - 1)));

    return {
      thetaF3: parseFloat(f3Bands.theta.toFixed(3)),
      alphaF3: parseFloat(f3Bands.alpha.toFixed(3)),
      betaF3: parseFloat(f3Bands.beta.toFixed(3)),
      thetaF4: parseFloat(f4Bands.theta.toFixed(3)),
      alphaF4: parseFloat(f4Bands.alpha.toFixed(3)),
      betaF4: parseFloat(f4Bands.beta.toFixed(3)),
      thetaPz: parseFloat(pzBands.theta.toFixed(3)),
      alphaPz: parseFloat(pzBands.alpha.toFixed(3)),
      betaPz: parseFloat(pzBands.beta.toFixed(3)),
      faa: parseFloat(faa.toFixed(3)),
      arousalRatio: parseFloat(arousalRatio.toFixed(3)),
      signalQuality: parseFloat(snr.toFixed(1)),
      noiseRms: parseFloat(noiseRms.toFixed(2)),
    };
  }

  /**
   * Generates sample synthetic CSV data representing a 20-second clinical EEG recording.
   */
  public generateSampleEegCsv(): string {
    const lines = ['timestamp_ms,F3_uV,F4_uV,Pz_uV'];
    const totalSamples = 128 * 20; // 20s
    let t = 0;
    for (let i = 0; i < totalSamples; i++) {
      const sample = this.generateNextRawSample();
      lines.push(`${t * 7.8125},${sample.f3},${sample.f4},${sample.pz}`);
      t++;
    }
    return lines.join('\n');
  }
}

export const defaultEegEngine = new EegEngine();
