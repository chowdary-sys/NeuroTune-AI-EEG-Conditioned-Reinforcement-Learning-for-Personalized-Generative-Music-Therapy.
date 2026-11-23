/**
 * Storage Service for User Profiles and Session Logs
 * Manages clinical profiles, session histories, and data persistence
 */

import { ListenerProfile, SessionRecord } from '../types/neurotune';

export const DEFAULT_PROFILES: ListenerProfile[] = [
  {
    id: 'sub-anxiety',
    name: 'Subject #01 (Anxiety Dominant)',
    role: 'Clinical Subject',
    targetEmotion: {
      valence: 0.60,
      arousal: -0.35,
      label: 'Serene & Calm (Low Arousal, Positive Valence)',
    },
    preferredTempoRange: [65, 85],
    modeAffinity: { major: 0.85, minor: 0.15 },
    densityPreference: 'medium',
    heterogeneityFactor: 0.15,
    noiseLevel: 1.0,
  },
  {
    id: 'sub-depressive',
    name: 'Subject #02 (Dysphoria / Low Arousal)',
    role: 'Clinical Subject',
    targetEmotion: {
      valence: 0.50,
      arousal: 0.20,
      label: 'Active & Uplifted (Moderate Arousal, Positive Valence)',
    },
    preferredTempoRange: [85, 115],
    modeAffinity: { major: 0.90, minor: 0.10 },
    densityPreference: 'medium',
    heterogeneityFactor: 0.20,
    noiseLevel: 1.0,
  },
  {
    id: 'sub-adhd-focus',
    name: 'Subject #03 (Cognitive Focus / ADHD)',
    role: 'Study Participant',
    targetEmotion: {
      valence: 0.40,
      arousal: -0.10,
      label: 'Steady Flow State (Neutral Arousal, Positive Valence)',
    },
    preferredTempoRange: [75, 95],
    modeAffinity: { major: 0.70, minor: 0.30 },
    densityPreference: 'sparse',
    heterogeneityFactor: 0.10,
    noiseLevel: 0.8,
  },
  {
    id: 'sub-healthy-control',
    name: 'Subject #04 (Normative Control)',
    role: 'Control Group',
    targetEmotion: {
      valence: 0.50,
      arousal: 0.0,
      label: 'Balanced Equilibrium',
    },
    preferredTempoRange: [70, 105],
    modeAffinity: { major: 0.75, minor: 0.25 },
    densityPreference: 'medium',
    heterogeneityFactor: 0.05,
    noiseLevel: 0.5,
  },
];

const PROFILES_KEY = 'neurotune_profiles_v1';
const SESSIONS_KEY = 'neurotune_sessions_v1';
const ACTIVE_PROFILE_KEY = 'neurotune_active_profile_id_v1';

export class StorageService {
  public getProfiles(): ListenerProfile[] {
    try {
      const data = localStorage.getItem(PROFILES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PROFILES;
  }

  public saveProfiles(profiles: ListenerProfile[]) {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // Ignore
    }
  }

  public getActiveProfileId(): string {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || DEFAULT_PROFILES[0].id;
  }

  public setActiveProfileId(id: string) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }

  public getActiveProfile(): ListenerProfile {
    const profiles = this.getProfiles();
    const id = this.getActiveProfileId();
    return profiles.find((p) => p.id === id) || profiles[0] || DEFAULT_PROFILES[0];
  }

  public getSessionHistory(): SessionRecord[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore
    }
    return [];
  }

  public saveSession(session: SessionRecord) {
    try {
      const sessions = this.getSessionHistory();
      sessions.unshift(session);
      // Keep last 50 sessions
      if (sessions.length > 50) sessions.pop();
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  }

  public clearSessions() {
    localStorage.removeItem(SESSIONS_KEY);
  }

  public exportDataJson(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      profiles: this.getProfiles(),
      sessions: this.getSessionHistory(),
    };
    return JSON.stringify(payload, null, 2);
  }
}

export const defaultStorage = new StorageService();
