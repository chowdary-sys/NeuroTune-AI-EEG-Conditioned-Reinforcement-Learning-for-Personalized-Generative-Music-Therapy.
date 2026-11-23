/**
 * Closed-Loop Feedback Architecture Controller
 * Reference: "EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy"
 *
 * Implements the continuous 9-stage cycle:
 * EEG Input -> Preprocessing -> Emotion Estimation -> Reinforcement Learning
 * -> Music Generation -> Playback -> Listener Feedback -> Policy Update -> Next Window
 */

import {
  ClosedLoopStepRecord,
  EmotionState,
  ListenerProfile,
  MusicParameters,
  RewardBreakdown,
  SessionRecord,
} from '../types/neurotune';
import { defaultEegEngine, EegEngine } from './eegEngine';
import { defaultRidgeEncoder, RidgeRegressionEncoder } from './ridgeRegression';
import { defaultReinforce, ReinforceEngine } from './reinforceRL';
import { defaultAudioEngine, AudioEngine } from './audioEngine';
import { defaultStorage } from './storageService';

export type LoopStage =
  | 'idle'
  | 'eeg_acquisition'
  | 'preprocessing'
  | 'emotion_estimation'
  | 'rl_decision'
  | 'music_generation'
  | 'playback'
  | 'listener_feedback'
  | 'policy_update';

export class ClosedLoopController {
  private eegEngine: EegEngine;
  private ridgeEncoder: RidgeRegressionEncoder;
  private reinforce: ReinforceEngine;
  private audioEngine: AudioEngine;

  private isRunning = false;
  private loopTimer: number | null = null;
  private currentStage: LoopStage = 'idle';
  private currentStep = 0;
  private maxStepsPerSession = 10; // Paper default: 10 decisions per session

  // Active listener profile (Paper Section 5.1 target s_tgt = (0.5, -0.5))
  private activeProfile: ListenerProfile = {
    id: 'sub-001',
    name: 'Clinical Patient (Anxiety-Dominant)',
    role: 'Clinical Subject',
    targetEmotion: {
      valence: 0.5, // Positive/Content
      arousal: -0.5, // Relaxed/Calm
      label: 'Serene & Calm (0.5, -0.5)',
    },
    preferredTempoRange: [65, 85],
    modeAffinity: {
      major: 0.8,
      minor: 0.2,
    },
    densityPreference: 'medium',
    heterogeneityFactor: 0.3,
    noiseLevel: 0.5,
  };

  // State caches
  private currentRawWindow: Array<{ timestamp: number; f3: number; f4: number; pz: number }> = [];
  private lastEmotion: EmotionState | null = null;
  private initialSessionEmotion: EmotionState | null = null;
  private lastReward: RewardBreakdown | null = null;
  private currentAction: MusicParameters = { tempo: 75, mode: 'major', density: 'medium' };
  private sessionHistory: ClosedLoopStepRecord[] = [];
  private completedSessions: SessionRecord[] = [];

  // Listeners for UI state reactivity
  private subscribers: Array<(state: ClosedLoopState) => void> = [];

  constructor(
    eeg = defaultEegEngine,
    encoder = defaultRidgeEncoder,
    rl = defaultReinforce,
    audio = defaultAudioEngine
  ) {
    this.eegEngine = eeg;
    this.ridgeEncoder = encoder;
    this.reinforce = rl;
    this.audioEngine = audio;

    // Seed initial simulated patient state from N((-0.4, 0.5), 0.3^2 I) (Paper Section 5.1)
    this.eegEngine.setEmotionalState(-0.4, 0.5);
  }

  public subscribe(cb: (state: ClosedLoopState) => void) {
    this.subscribers.push(cb);
    this.notify();
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach((cb) => cb(state));
  }

  public setListenerProfile(profile: ListenerProfile) {
    this.activeProfile = profile;
    this.eegEngine.setNoiseLevel(profile.noiseLevel);
    this.notify();
  }

  public getProfile(): ListenerProfile {
    return this.activeProfile;
  }

  public setTargetEmotion(valence: number, arousal: number, label = 'Custom Target') {
    this.activeProfile.targetEmotion = {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(-1, Math.min(1, arousal)),
      label,
    };
    this.notify();
  }

  public setSimulatedPatientEmotion(valence: number, arousal: number) {
    this.eegEngine.setEmotionalState(valence, arousal);
    // Run an immediate single estimation pass to update state
    this.executeSingleStep(true);
  }

  /**
   * Executes a single step through the 9-stage closed-loop pipeline.
   */
  public async executeSingleStep(skipPlayback = false): Promise<ClosedLoopStepRecord> {
    this.currentStep++;

    // 1. EEG INPUT
    this.currentStage = 'eeg_acquisition';
    this.notify();

    // Accumulate 128 samples (1.0s window)
    const rawSamples: Array<{ timestamp: number; f3: number; f4: number; pz: number }> = [];
    for (let i = 0; i < 128; i++) {
      rawSamples.push(this.eegEngine.generateNextRawSample());
    }
    this.currentRawWindow = rawSamples;

    // 2. PREPROCESSING
    this.currentStage = 'preprocessing';
    this.notify();
    const filteredSamples = rawSamples.map((s) => this.eegEngine.filterSample(s));
    const eegFeatures = this.eegEngine.extractWindowFeatures(filteredSamples);

    // 3. EMOTION ESTIMATION
    this.currentStage = 'emotion_estimation';
    this.notify();
    const estimatedEmotion = this.ridgeEncoder.predict(eegFeatures);
    if (!this.lastEmotion) {
      this.lastEmotion = estimatedEmotion;
      this.initialSessionEmotion = estimatedEmotion;
    }

    // 4. REINFORCEMENT LEARNING
    this.currentStage = 'rl_decision';
    this.notify();
    const stateVector = this.reinforce.constructState(
      estimatedEmotion,
      this.activeProfile.targetEmotion,
      this.activeProfile,
      this.lastReward ? this.lastReward.totalReward : 0
    );

    const { action, logProbs } = this.reinforce.sampleAction(stateVector);
    this.currentAction = action;

    // 5. MUSIC GENERATION & 6. PLAYBACK
    this.currentStage = 'music_generation';
    this.notify();
    this.audioEngine.setParameters({
      tempo: action.tempo,
      mode: action.mode,
      density: action.density,
    });

    if (!skipPlayback && !this.audioEngine.getPlaybackState().isPlaying) {
      this.audioEngine.play();
    }
    this.currentStage = 'playback';
    this.notify();

    // 7. SIMULATE PHYSIOLOGICAL RESPONSE & LISTENER FEEDBACK
    // The research paper models physiological affective transition:
    // Music parameters steer the listener towards target or away based on mode/tempo consonance.
    const deltaV =
      action.mode === 'major'
        ? 0.14 * (1.0 - this.activeProfile.heterogeneityFactor)
        : -0.09 * (1.0 - this.activeProfile.heterogeneityFactor);

    // Tempo steering: optimal target tempo pulls arousal towards matching rate
    const targetBpm = 60 + ((this.activeProfile.targetEmotion.arousal + 1) / 2) * 60;
    const tempoError = action.tempo - targetBpm;
    const deltaA =
      action.tempo > 100
        ? 0.08 * (action.tempo / 100)
        : -0.10 * (1.0 - action.tempo / 100);

    // Next listener emotional state in physiology:
    const newPhysioValence = Math.max(
      -1,
      Math.min(1, estimatedEmotion.valence + deltaV + (Math.random() - 0.5) * 0.05)
    );
    const newPhysioArousal = Math.max(
      -1,
      Math.min(1, estimatedEmotion.arousal + deltaA + (Math.random() - 0.5) * 0.05)
    );
    this.eegEngine.setEmotionalState(newPhysioValence, newPhysioArousal);

    // Subjective feedback proxy
    this.currentStage = 'listener_feedback';
    this.notify();
    const currentDist = Math.sqrt(
      Math.pow(estimatedEmotion.valence - this.activeProfile.targetEmotion.valence, 2) +
        Math.pow(estimatedEmotion.arousal - this.activeProfile.targetEmotion.arousal, 2)
    );
    const userFeedback = {
      satisfaction: currentDist < 0.4 ? 5 : currentDist < 0.7 ? 4 : currentDist < 1.0 ? 3 : 2,
      perceivedQuality: action.tempo >= 65 && action.tempo <= 110 ? 5 : 4,
      perceivedShift: deltaV > 0 ? 1 : -1,
    };

    // 8. REWARD CALCULATION & POLICY UPDATE
    this.currentStage = 'policy_update';
    this.notify();
    const nextEmotionEstimate: EmotionState = {
      valence: parseFloat(newPhysioValence.toFixed(3)),
      arousal: parseFloat(newPhysioArousal.toFixed(3)),
      quadrant:
        newPhysioValence >= 0
          ? newPhysioArousal >= 0
            ? 'Excited/Joyful'
            : 'Serene/Calm'
          : newPhysioArousal >= 0
          ? 'Anxious/Tense'
          : 'Depressed/Sad',
      confidence: estimatedEmotion.confidence,
      timestamp: Date.now(),
    };

    const rewardBreakdown = this.reinforce.calculateReward(
      estimatedEmotion,
      nextEmotionEstimate,
      this.activeProfile.targetEmotion,
      action,
      this.activeProfile,
      userFeedback
    );
    this.lastReward = rewardBreakdown;

    // Record step in REINFORCE trajectory
    this.reinforce.recordStep(stateVector, action, rewardBreakdown, logProbs);

    const stepRecord: ClosedLoopStepRecord = {
      step: this.currentStep,
      timestamp: Date.now(),
      eegFeatures,
      emotionBefore: estimatedEmotion,
      selectedAction: action,
      reward: rewardBreakdown,
      emotionAfter: nextEmotionEstimate,
      distanceToTarget: parseFloat(currentDist.toFixed(3)),
      userFeedback,
    };

    this.sessionHistory.push(stepRecord);
    this.lastEmotion = nextEmotionEstimate;

    // Check if session reached max steps or convergence
    if (this.currentStep >= this.maxStepsPerSession) {
      this.finishSession();
    }

    this.currentStage = 'idle';
    this.notify();

    return stepRecord;
  }

  public finishSession() {
    if (this.sessionHistory.length === 0) return;

    // Optimize policy with REINFORCE episode completion
    this.reinforce.finishEpisodeAndOptimize();

    const initialEmotion = this.initialSessionEmotion || this.sessionHistory[0].emotionBefore;
    const finalEmotion = this.sessionHistory[this.sessionHistory.length - 1].emotionAfter;
    const target = this.activeProfile.targetEmotion;
    const finalDistance = Math.sqrt(
      Math.pow(finalEmotion.valence - target.valence, 2) +
        Math.pow(finalEmotion.arousal - target.arousal, 2)
    );
    const avgReward =
      this.sessionHistory.reduce((acc, s) => acc + s.reward.totalReward, 0) /
      this.sessionHistory.length;

    const completedSession: SessionRecord = {
      id: `ses-${Date.now().toString(36)}`,
      userId: this.activeProfile.id,
      userName: this.activeProfile.name,
      startTime: this.sessionHistory[0].timestamp,
      endTime: Date.now(),
      initialEmotion,
      finalEmotion,
      targetEmotion: { valence: target.valence, arousal: target.arousal },
      steps: [...this.sessionHistory],
      averageReward: parseFloat(avgReward.toFixed(3)),
      finalDistance: parseFloat(finalDistance.toFixed(3)),
      converged: finalDistance <= 0.3,
      algorithm: 'Proposed EEG + RL',
    };

    this.completedSessions.unshift(completedSession);
    defaultStorage.saveSession(completedSession);
    this.currentStep = 0;
    this.sessionHistory = [];
    this.initialSessionEmotion = null;
    this.notify();
  }

  public startContinuousLoop(intervalMs = 3000) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.notify();

    this.executeSingleStep();
    this.loopTimer = window.setInterval(() => {
      if (this.isRunning) {
        this.executeSingleStep();
      }
    }, intervalMs);
  }

  public stopContinuousLoop() {
    this.isRunning = false;
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.currentStage = 'idle';
    this.notify();
  }

  public resetSession() {
    this.currentStep = 0;
    this.sessionHistory = [];
    this.lastReward = null;
    this.lastEmotion = null;
    this.initialSessionEmotion = null;
    this.eegEngine.setEmotionalState(-0.5, 0.6);
    this.notify();
  }

  public getState(): ClosedLoopState {
    const target = this.activeProfile.targetEmotion;
    const currentEmotion = this.lastEmotion || {
      valence: -0.5,
      arousal: 0.6,
      quadrant: 'Anxious/Tense',
      confidence: 0.92,
      timestamp: Date.now(),
    };
    const distanceToTarget = Math.sqrt(
      Math.pow(currentEmotion.valence - target.valence, 2) +
        Math.pow(currentEmotion.arousal - target.arousal, 2)
    );

    return {
      isRunning: this.isRunning,
      currentStage: this.currentStage,
      currentStep: this.currentStep,
      maxSteps: this.maxStepsPerSession,
      currentEmotion,
      initialEmotion: this.initialSessionEmotion || currentEmotion,
      targetEmotion: target,
      distanceToTarget: parseFloat(distanceToTarget.toFixed(3)),
      currentAction: this.currentAction,
      lastReward: this.lastReward,
      rawSamples: this.currentRawWindow,
      sessionSteps: [...this.sessionHistory],
      completedSessions: [...this.completedSessions],
      profile: this.activeProfile,
    };
  }
}

export interface ClosedLoopState {
  isRunning: boolean;
  currentStage: LoopStage;
  currentStep: number;
  maxSteps: number;
  currentEmotion: EmotionState;
  initialEmotion: EmotionState;
  targetEmotion: { valence: number; arousal: number; label: string };
  distanceToTarget: number;
  currentAction: MusicParameters;
  lastReward: RewardBreakdown | null;
  rawSamples: Array<{ timestamp: number; f3: number; f4: number; pz: number }>;
  sessionSteps: ClosedLoopStepRecord[];
  completedSessions: SessionRecord[];
  profile: ListenerProfile;
}

export const defaultClosedLoopController = new ClosedLoopController();
