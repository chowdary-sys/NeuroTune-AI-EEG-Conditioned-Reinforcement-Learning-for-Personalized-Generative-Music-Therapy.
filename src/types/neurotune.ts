/**
 * NeuroTune AI - Research Data Types & System Interfaces
 * Reference: "EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy"
 */

export interface EegRawSample {
  timestamp: number;
  f3: number; // Left frontal (microvolts)
  f4: number; // Right frontal (microvolts)
  pz: number; // Parietal midline (microvolts)
}

export interface EegFrequencyFeatures {
  thetaF3: number;
  alphaF3: number;
  betaF3: number;
  thetaF4: number;
  alphaF4: number;
  betaF4: number;
  thetaPz: number;
  alphaPz: number;
  betaPz: number;
  // Derived affective neuro-markers:
  faa: number; // Frontal Alpha Asymmetry: ln(Alpha_F4) - ln(Alpha_F3)
  arousalRatio: number; // Beta_Pz / (Alpha_Pz + Theta_Pz)
  signalQuality: number; // 0 to 100% SNR / contact quality
  noiseRms: number; // Noise RMS microvolts
}

export type AffectQuadrant = 
  | 'Excited/Joyful'   // +Valence, +Arousal
  | 'Anxious/Tense'    // -Valence, +Arousal
  | 'Depressed/Sad'    // -Valence, -Arousal
  | 'Serene/Calm';     // +Valence, -Arousal

export interface EmotionState {
  valence: number; // [-1.0, 1.0]
  arousal: number; // [-1.0, 1.0]
  quadrant: AffectQuadrant;
  confidence: number; // [0.0, 1.0]
  timestamp: number;
}

export type MusicMode = 'major' | 'minor';
export type NoteDensity = 'sparse' | 'medium' | 'dense';

export interface MusicParameters {
  tempo: number; // 50 - 150 BPM
  mode: MusicMode;
  density: NoteDensity;
  masterVolume?: number;
}

export interface RewardBreakdown {
  emotionalProgress: number; // w1 * (prevDist - currDist)
  musicQuality: number; // w2 * Q(action)
  listenerPreference: number; // w3 * P(action, pref)
  subjectiveFeedback: number; // w4 * userScore
  totalReward: number;
}

export interface ListenerProfile {
  id: string;
  name: string;
  role: 'Clinical Subject' | 'Study Participant' | 'Control Group';
  targetEmotion: {
    valence: number; // e.g. +0.6 (positive)
    arousal: number; // e.g. -0.4 (relaxed)
    label: string;
  };
  preferredTempoRange: [number, number]; // e.g. [65, 95]
  modeAffinity: {
    major: number; // 0 to 1
    minor: number;
  };
  densityPreference: NoteDensity;
  heterogeneityFactor: number; // 0.0 to 0.45
  noiseLevel: number; // 0.5 to 2.0
}

export interface ClosedLoopStepRecord {
  step: number;
  timestamp: number;
  eegFeatures: EegFrequencyFeatures;
  emotionBefore: EmotionState;
  selectedAction: MusicParameters;
  reward: RewardBreakdown;
  emotionAfter: EmotionState;
  distanceToTarget: number;
  userFeedback?: {
    satisfaction: number; // 1 to 5
    perceivedQuality: number; // 1 to 5
    perceivedShift: number; // -2 to +2
  };
}

export interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  startTime: number;
  endTime: number;
  initialEmotion: EmotionState;
  finalEmotion: EmotionState;
  targetEmotion: { valence: number; arousal: number };
  steps: ClosedLoopStepRecord[];
  averageReward: number;
  finalDistance: number;
  converged: boolean;
  algorithm: 'Proposed EEG + RL' | 'Random Baseline' | 'Fixed Playlist' | 'Catalogue Rec' | 'Oracle Reference';
}

export interface ReinforcePolicyState {
  iteration: number;
  learningRate: number;
  gamma: number;
  entropy: number;
  policyWeights: {
    tempo: number[];
    mode: number[];
    density: number[];
  };
  history: Array<{
    iteration: number;
    meanReward: number;
    distanceToTarget: number;
    entropy: number;
  }>;
}

export interface EvaluationBenchmarkResult {
  algorithm: string;
  finalDistance: number;
  finalDistanceStd: number;
  improvementDelta: number;
  improvementStd: number;
  successRate: number; // % reaching target within d_T <= 0.3
  successRateStd: number;
  musicQuality: number; // Q_avg in [0, 1]
  musicQualityStd: number;
  latencyMs: number; // mean CPU ms per decision
}

export interface ExperimentalConfig {
  listenersPerIteration: number; // 512
  testListenersPerSeed: number; // 1000
  policyIterations: number; // 300
  decisionsPerSession: number; // 10
  learningRate: number; // 0.02
  discountGamma: number; // 0.9
  qualityWeightLambdaQ: number; // 0.5
  batchSize: number; // 512
  randomSeeds: number[]; // [0, 1, 2, 3, 4]
  eegNoiseLevels: number[]; // [0.1, 0.5, 1.0, 2.0]
  heterogeneityLevels: number[]; // [0.0, 0.15, 0.3, 0.45]
  successThreshold: number; // 0.3
}

