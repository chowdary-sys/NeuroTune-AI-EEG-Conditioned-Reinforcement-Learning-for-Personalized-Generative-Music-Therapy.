-- Database Schema for NeuroTune AI Research Platform
-- Supports SQLite and PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'Clinical Subject',
    target_valence FLOAT NOT NULL DEFAULT 0.55,
    target_arousal FLOAT NOT NULL DEFAULT -0.35,
    pref_tempo_min INT NOT NULL DEFAULT 65,
    pref_tempo_max INT NOT NULL DEFAULT 85,
    pref_mode VARCHAR(16) NOT NULL DEFAULT 'major',
    pref_density VARCHAR(16) NOT NULL DEFAULT 'medium',
    heterogeneity_factor FLOAT NOT NULL DEFAULT 0.15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eeg_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    initial_valence FLOAT NOT NULL,
    initial_arousal FLOAT NOT NULL,
    final_valence FLOAT NOT NULL,
    final_arousal FLOAT NOT NULL,
    target_valence FLOAT NOT NULL,
    target_arousal FLOAT NOT NULL,
    average_reward FLOAT NOT NULL,
    final_distance FLOAT NOT NULL,
    converged BOOLEAN NOT NULL DEFAULT FALSE,
    algorithm VARCHAR(64) NOT NULL DEFAULT 'Proposed EEG + RL'
);

CREATE TABLE IF NOT EXISTS session_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) REFERENCES eeg_sessions(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Frequency Band Powers (uV^2)
    theta_f3 FLOAT,
    alpha_f3 FLOAT,
    beta_f3 FLOAT,
    theta_f4 FLOAT,
    alpha_f4 FLOAT,
    beta_f4 FLOAT,
    theta_pz FLOAT,
    alpha_pz FLOAT,
    beta_pz FLOAT,
    faa FLOAT NOT NULL,
    arousal_ratio FLOAT NOT NULL,
    signal_quality FLOAT NOT NULL,
    
    -- Estimated Affect
    valence_before FLOAT NOT NULL,
    arousal_before FLOAT NOT NULL,
    quadrant_before VARCHAR(32) NOT NULL,
    
    -- Selected Music Actions
    selected_tempo INT NOT NULL,
    selected_mode VARCHAR(16) NOT NULL,
    selected_density VARCHAR(16) NOT NULL,
    
    -- Multi-Objective Rewards
    reward_emotion_progress FLOAT NOT NULL,
    reward_music_quality FLOAT NOT NULL,
    reward_listener_pref FLOAT NOT NULL,
    reward_subjective_feedback FLOAT NOT NULL,
    reward_total FLOAT NOT NULL,
    
    -- Post-Decision Affect
    valence_after FLOAT NOT NULL,
    arousal_after FLOAT NOT NULL,
    distance_to_target FLOAT NOT NULL,
    
    -- Listener Subjective Ratings
    listener_satisfaction INT,
    perceived_quality INT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON eeg_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_steps_session_id ON session_steps(session_id);
