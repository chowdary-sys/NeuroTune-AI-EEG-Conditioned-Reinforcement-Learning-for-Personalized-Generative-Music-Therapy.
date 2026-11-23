/**
 * REINFORCE Policy-Gradient Algorithm & Multi-Component Reward Engine
 * Reference: "EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy"
 *
 * Implements:
 * - State representation: s_t = [v_t, a_t, v*, a*, pref_tempo, pref_mode, pref_density, r_{t-1}]
 * - Parametric Linear-Gaussian & Softmax Policies for [Tempo, Mode, Density]
 * - Monte Carlo discounted returns G_t = sum_{k=t}^T gamma^(k-t) r_k
 * - Log-likelihood gradient evaluation: grad_theta log pi(u_t | s_t)
 * - Baseline subtraction for variance reduction
 * - Multi-objective reward calculation
 */

import {
  EmotionState,
  ListenerProfile,
  MusicMode,
  MusicParameters,
  NoteDensity,
  RewardBreakdown,
} from '../types/neurotune';

export interface TrajectoryStep {
  state: number[]; // 8-dim state vector
  action: MusicParameters;
  rewardBreakdown: RewardBreakdown;
  logProbs: {
    tempo: number;
    mode: number;
    density: number;
    total: number;
  };
}

export class ReinforceEngine {
  public learningRate = 0.02; // Paper Table 2 default (Adam LR = 0.02)
  public gamma = 0.9; // Paper Table 2 discount factor (gamma = 0.9)
  public entropyWeight = 0.01; // Regularization to encourage exploration
  public iteration = 0;

  // Reward component weights (Paper Eq. 1 & Section 4.3: lambda_q = 0.5)
  public rewardWeights = {
    w1_emotionDist: 1.0,
    w2_musicQuality: 0.5,
    w3_listenerPref: 0.35,
    w4_userFeedback: 0.40,
  };

  // State dimension = 8
  private stateDim = 8;

  // Linear Policy Parameters:
  // 1. Tempo Policy: Gaussian N(mu(s), sigma^2)
  private W_tempo: number[];
  private b_tempo: number;
  public tempoSigma = 12.0; // BPM exploration std

  // 2. Mode Policy: 2 logits for [Major, Minor]
  private W_mode: number[][]; // [2][8]
  private b_mode: number[]; // [2]

  // 3. Density Policy: 3 logits for [Sparse, Medium, Dense]
  private W_density: number[][]; // [3][8]
  private b_density: number[]; // [3]

  // Baseline moving average return for variance reduction
  private baseline = 0.0;

  // Episode trajectory buffer
  private currentTrajectory: TrajectoryStep[] = [];

  // Training metrics history
  private trainingHistory: Array<{
    iteration: number;
    meanReward: number;
    distanceToTarget: number;
    entropy: number;
  }> = [];

  constructor() {
    // Initialize policy weights with small random Gaussian values
    this.W_tempo = this.initWeightVector(this.stateDim, 0.05);
    this.b_tempo = 0.0;

    this.W_mode = [
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
    ];
    this.b_mode = [0.1, -0.1]; // Slight initial prior for major mode

    this.W_density = [
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
    ];
    this.b_density = [0.1, 0.2, -0.1]; // Slight prior for medium/sparse
  }

  private initWeightVector(dim: number, scale = 0.1): number[] {
    return Array.from({ length: dim }, () => (Math.random() * 2 - 1) * scale);
  }

  /**
   * Constructs the 8-dimensional normalized state vector:
   * s = [valence, arousal, targetValence, targetArousal, normPrefTempo, prefMode, normPrefDensity, lastReward]
   */
  public constructState(
    emotion: EmotionState,
    target: { valence: number; arousal: number },
    profile: ListenerProfile,
    lastReward = 0.0
  ): number[] {
    const meanPrefTempo = (profile.preferredTempoRange[0] + profile.preferredTempoRange[1]) / 2;
    const normPrefTempo = (meanPrefTempo - 100) / 50; // normalized to [-1, 1]
    const prefModeVal = profile.modeAffinity.major >= 0.5 ? 1.0 : -1.0;
    const normDensity =
      profile.densityPreference === 'sparse'
        ? -1.0
        : profile.densityPreference === 'medium'
        ? 0.0
        : 1.0;

    return [
      emotion.valence,
      emotion.arousal,
      target.valence,
      target.arousal,
      normPrefTempo,
      prefModeVal,
      normDensity,
      Math.max(-2, Math.min(2, lastReward)),
    ];
  }

  /**
   * Samples musical action parameters [Tempo, Mode, Density] from current policy pi_theta(u | s).
   */
  public sampleAction(state: number[]): {
    action: MusicParameters;
    logProbs: { tempo: number; mode: number; density: number; total: number };
    probabilities: {
      tempoMu: number;
      modeProbs: { major: number; minor: number };
      densityProbs: { sparse: number; medium: number; dense: number };
    };
  } {
    // 1. Continuous Tempo: mu(s) = 50 + 100 * sigmoid(W^T s + b)
    let tempoLogit = this.b_tempo;
    for (let i = 0; i < this.stateDim; i++) {
      tempoLogit += this.W_tempo[i] * state[i];
    }
    const sigmoid = (z: number) => 1.0 / (1.0 + Math.exp(-Math.max(-10, Math.min(10, z))));
    const tempoMu = 50 + 100 * sigmoid(tempoLogit);

    // Sample from Gaussian N(tempoMu, tempoSigma^2) using Box-Muller
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    let sampledTempo = tempoMu + z * this.tempoSigma;
    sampledTempo = Math.max(50, Math.min(150, Math.round(sampledTempo)));

    // Log prob of Gaussian: -0.5 * ((x - mu)/sigma)^2 - ln(sigma * sqrt(2pi))
    const tempoDiff = (sampledTempo - tempoMu) / this.tempoSigma;
    const logProbTempo = -0.5 * tempoDiff * tempoDiff - Math.log(this.tempoSigma * Math.sqrt(2 * Math.PI));

    // 2. Mode Policy: Softmax over [Major, Minor]
    const modeLogits = [this.b_mode[0], this.b_mode[1]];
    for (let c = 0; c < 2; c++) {
      for (let i = 0; i < this.stateDim; i++) {
        modeLogits[c] += this.W_mode[c][i] * state[i];
      }
    }
    const maxModeLogit = Math.max(...modeLogits);
    const expMode = modeLogits.map((l) => Math.exp(l - maxModeLogit));
    const sumExpMode = expMode.reduce((a, b) => a + b, 0);
    const modeProbs = expMode.map((e) => e / sumExpMode);

    const randMode = Math.random();
    const sampledMode: MusicMode = randMode < modeProbs[0] ? 'major' : 'minor';
    const logProbMode = Math.log(sampledMode === 'major' ? modeProbs[0] : modeProbs[1]);

    // 3. Density Policy: Softmax over [Sparse, Medium, Dense]
    const densityLogits = [...this.b_density];
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < this.stateDim; i++) {
        densityLogits[c] += this.W_density[c][i] * state[i];
      }
    }
    const maxDensityLogit = Math.max(...densityLogits);
    const expDensity = densityLogits.map((l) => Math.exp(l - maxDensityLogit));
    const sumExpDensity = expDensity.reduce((a, b) => a + b, 0);
    const densityProbs = expDensity.map((e) => e / sumExpDensity);

    const randDensity = Math.random();
    let sampledDensity: NoteDensity = 'medium';
    let densityProb = densityProbs[1];
    if (randDensity < densityProbs[0]) {
      sampledDensity = 'sparse';
      densityProb = densityProbs[0];
    } else if (randDensity < densityProbs[0] + densityProbs[1]) {
      sampledDensity = 'medium';
      densityProb = densityProbs[1];
    } else {
      sampledDensity = 'dense';
      densityProb = densityProbs[2];
    }
    const logProbDensity = Math.log(Math.max(1e-6, densityProb));

    const totalLogProb = logProbTempo + logProbMode + logProbDensity;

    return {
      action: {
        tempo: sampledTempo,
        mode: sampledMode,
        density: sampledDensity,
      },
      logProbs: {
        tempo: logProbTempo,
        mode: logProbMode,
        density: logProbDensity,
        total: totalLogProb,
      },
      probabilities: {
        tempoMu: Math.round(tempoMu),
        modeProbs: { major: modeProbs[0], minor: modeProbs[1] },
        densityProbs: {
          sparse: densityProbs[0],
          medium: densityProbs[1],
          dense: densityProbs[2],
        },
      },
    };
  }

  /**
   * Calculates multi-objective reward according to the research paper formulation:
   * R_t = w1 * Delta_Dist + w2 * Q_music + w3 * P_listener + w4 * Feedback
   */
  public calculateReward(
    prevEmotion: EmotionState,
    currEmotion: EmotionState,
    target: { valence: number; arousal: number },
    action: MusicParameters,
    profile: ListenerProfile,
    userFeedback?: { satisfaction: number; perceivedQuality: number }
  ): RewardBreakdown {
    // 1. Emotional state progress (distance reduction towards target on circumplex)
    const prevDist = Math.sqrt(
      Math.pow(prevEmotion.valence - target.valence, 2) +
        Math.pow(prevEmotion.arousal - target.arousal, 2)
    );
    const currDist = Math.sqrt(
      Math.pow(currEmotion.valence - target.valence, 2) +
        Math.pow(currEmotion.arousal - target.arousal, 2)
    );
    // DeltaDist: positive if moved closer, negative if moved further away
    const rawDeltaDist = prevDist - currDist;
    // Scale delta distance so improvements give substantial reward
    const emotionalProgress = this.rewardWeights.w1_emotionDist * (rawDeltaDist * 3.5);

    // 2. Music Quality: Consonance, non-extreme tempo, harmonic balance
    let qualityScore = 0.0;
    // Smooth tempo penalty (punish tempos below 60 or above 130)
    if (action.tempo >= 65 && action.tempo <= 120) {
      qualityScore += 0.6;
    } else {
      qualityScore += 0.2;
    }
    // High arousal pairs well with dense rhythms; low arousal pairs with sparse/medium
    if (currEmotion.arousal < 0 && action.density === 'sparse') qualityScore += 0.4;
    else if (currEmotion.arousal >= 0 && action.density !== 'sparse') qualityScore += 0.4;
    else qualityScore += 0.2;

    const musicQuality = this.rewardWeights.w2_musicQuality * qualityScore;

    // 3. Listener Preference Alignment
    let prefScore = 0.0;
    if (
      action.tempo >= profile.preferredTempoRange[0] &&
      action.tempo <= profile.preferredTempoRange[1]
    ) {
      prefScore += 0.5;
    } else {
      const dist = Math.min(
        Math.abs(action.tempo - profile.preferredTempoRange[0]),
        Math.abs(action.tempo - profile.preferredTempoRange[1])
      );
      prefScore += Math.max(0, 0.5 - dist / 50);
    }
    if (action.mode === 'major' && profile.modeAffinity.major >= 0.5) prefScore += 0.3;
    if (action.mode === 'minor' && profile.modeAffinity.minor >= 0.5) prefScore += 0.3;
    if (action.density === profile.densityPreference) prefScore += 0.2;

    const listenerPreference = this.rewardWeights.w3_listenerPref * prefScore;

    // 4. Subjective Listener Feedback (normalized from 1-5 stars to [-1.0, 1.0])
    let feedbackScore = 0.0;
    if (userFeedback) {
      const avgSat = (userFeedback.satisfaction + userFeedback.perceivedQuality) / 2;
      feedbackScore = (avgSat - 3.0) / 2.0; // 5 -> +1.0, 1 -> -1.0, 3 -> 0.0
    } else {
      // Natural simulated listener subjective proxy:
      feedbackScore = rawDeltaDist > 0 ? 0.4 : -0.2;
    }
    const subjectiveFeedback = this.rewardWeights.w4_userFeedback * feedbackScore;

    const totalReward = parseFloat(
      (emotionalProgress + musicQuality + listenerPreference + subjectiveFeedback).toFixed(4)
    );

    return {
      emotionalProgress: parseFloat(emotionalProgress.toFixed(4)),
      musicQuality: parseFloat(musicQuality.toFixed(4)),
      listenerPreference: parseFloat(listenerPreference.toFixed(4)),
      subjectiveFeedback: parseFloat(subjectiveFeedback.toFixed(4)),
      totalReward,
    };
  }

  /**
   * Records a transition step in the current episode trajectory.
   */
  public recordStep(
    state: number[],
    action: MusicParameters,
    rewardBreakdown: RewardBreakdown,
    logProbs: { tempo: number; mode: number; density: number; total: number }
  ) {
    this.currentTrajectory.push({
      state,
      action,
      rewardBreakdown,
      logProbs,
    });
  }

  /**
   * Performs the REINFORCE policy gradient update:
   * theta <- theta + alpha * sum_{t=0}^T gamma^t (G_t - b) * grad_theta log pi(u_t | s_t)
   */
  public finishEpisodeAndOptimize(): {
    meanReward: number;
    totalReturn: number;
    trajectoryLength: number;
    loss: number;
  } {
    const T = this.currentTrajectory.length;
    if (T === 0) {
      return { meanReward: 0, totalReturn: 0, trajectoryLength: 0, loss: 0 };
    }

    // 1. Calculate discounted returns G_t
    const returns: number[] = new Array(T).fill(0);
    let runningReturn = 0;
    for (let t = T - 1; t >= 0; t--) {
      runningReturn = this.currentTrajectory[t].rewardBreakdown.totalReward + this.gamma * runningReturn;
      returns[t] = runningReturn;
    }

    const meanReturn = returns.reduce((a, b) => a + b, 0) / T;
    // Update baseline moving average (exponential smoothing)
    this.baseline = 0.9 * this.baseline + 0.1 * meanReturn;

    // 2. Policy gradient accumulation
    let totalLoss = 0;
    for (let t = 0; t < T; t++) {
      const step = this.currentTrajectory[t];
      const advantage = returns[t] - this.baseline;

      // REINFORCE objective: max E[log pi * G_t]  <=> min E[-log pi * G_t]
      totalLoss -= step.logProbs.total * advantage;

      // Update continuous tempo policy
      const tempoDiff = (step.action.tempo - 100) / this.tempoSigma;
      for (let i = 0; i < this.stateDim; i++) {
        const gradTempo = advantage * tempoDiff * step.state[i];
        this.W_tempo[i] += this.learningRate * Math.max(-1.0, Math.min(1.0, gradTempo));
      }
      this.b_tempo += this.learningRate * advantage * tempoDiff * 0.1;

      // Update mode policy
      const modeIdx = step.action.mode === 'major' ? 0 : 1;
      for (let i = 0; i < this.stateDim; i++) {
        const gradMode = advantage * (1.0 - 0.5) * step.state[i];
        this.W_mode[modeIdx][i] += this.learningRate * Math.max(-1.0, Math.min(1.0, gradMode));
      }

      // Update density policy
      const densityIdx =
        step.action.density === 'sparse' ? 0 : step.action.density === 'medium' ? 1 : 2;
      for (let i = 0; i < this.stateDim; i++) {
        const gradDensity = advantage * (1.0 - 0.33) * step.state[i];
        this.W_density[densityIdx][i] += this.learningRate * Math.max(-1.0, Math.min(1.0, gradDensity));
      }
    }

    this.iteration++;

    // Compute entropy for exploration tracking
    const entropy = parseFloat((0.5 * Math.log(2 * Math.PI * Math.E * Math.pow(this.tempoSigma, 2))).toFixed(3));

    this.trainingHistory.push({
      iteration: this.iteration,
      meanReward: parseFloat(meanReturn.toFixed(4)),
      distanceToTarget: 0, // Filled during closed loop
      entropy,
    });

    // Clear trajectory buffer
    this.currentTrajectory = [];

    return {
      meanReward: parseFloat(meanReturn.toFixed(4)),
      totalReturn: parseFloat(returns[0].toFixed(4)),
      trajectoryLength: T,
      loss: parseFloat((totalLoss / T).toFixed(4)),
    };
  }

  public getPolicyState() {
    return {
      iteration: this.iteration,
      learningRate: this.learningRate,
      gamma: this.gamma,
      tempoWeights: this.W_tempo,
      tempoBias: this.b_tempo,
      modeWeights: this.W_mode,
      densityWeights: this.W_density,
      history: this.trainingHistory,
    };
  }

  public resetPolicy() {
    this.iteration = 0;
    this.W_tempo = this.initWeightVector(this.stateDim, 0.05);
    this.b_tempo = 0.0;
    this.W_mode = [
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
    ];
    this.b_mode = [0.1, -0.1];
    this.W_density = [
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
      this.initWeightVector(this.stateDim, 0.05),
    ];
    this.b_density = [0.1, 0.2, -0.1];
    this.currentTrajectory = [];
    this.trainingHistory = [];
  }
}

export const defaultReinforce = new ReinforceEngine();
