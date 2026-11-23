import React from 'react';
import { BookOpen, CheckCircle, ExternalLink, X } from 'lucide-react';

interface ResearchDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchDocsModal: React.FC<ResearchDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>RESEARCH SPECIFICATION & MATHEMATICAL FORMULATION</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              A Closed-Loop Framework and Simulation Study
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1: Core Objective */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-mono">
              <span className="text-cyan-400">01.</span> RESEARCH OBJECTIVE & ARCHITECTURE
            </h3>
            <p>
              Traditional music therapy relies primarily on static, catalogue-based playlists or intermittent retrospective assessments, failing to continuously adjust to instantaneous physiological shifts. NeuroTune AI implements a real-time, closed-loop neural entrainment framework where 3-lead electroencephalography (EEG) signals are continuously acquired, preprocessed, and decoded into affective dimensions (Valence and Arousal) using a regularized Ridge Regression encoder. An autonomous REINFORCE policy gradient agent continuously optimizes generative music parameters (tempo, mode, note density) to steer listener affect towards a therapeutic target.
            </p>
          </div>

          {/* Section 2: Mathematical Formulations */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-mono">
              <span className="text-cyan-400">02.</span> MATHEMATICAL FORMULATIONS
            </h3>
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  A. Frontal Alpha Asymmetry (FAA)
                </div>
                <div className="text-slate-400">
                  FAA = ln(α_F4) - ln(α_F3)
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Alpha power in 8-13 Hz. Positive FAA reflects relative left-frontal activation (approach motivation / positive valence); negative FAA indicates right-frontal activation (withdrawal / anxiety).
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  B. Ridge Regression Affective Decoder
                </div>
                <div className="text-slate-400">
                  W* = (X^T · X + λ · I)^(-1) · X^T · Y
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Maps 11-dimensional spectral vector [θ_F3, α_F3, β_F3, θ_F4, α_F4, β_F4, θ_Pz, α_Pz, β_Pz, FAA, ArousalRatio] to continuous coordinates (v, a) ∈ [-1, 1]² with L2 shrinkage (λ = 1.0).
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  C. Multi-Objective Reward Function
                </div>
                <div className="text-slate-400">
                  R_t = w₁ · ΔDist(e_t, e*) + w₂ · Q_music(u_t) + w₃ · P_listener(u_t) + w₄ · Feedback_t
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Weights: w₁=1.00 (emotional distance progress), w₂=0.25 (acoustic quality), w₃=0.35 (listener preference), w₄=0.40 (subjective rating).
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  D. REINFORCE Policy Gradient Update
                </div>
                <div className="text-slate-400">
                  θ ← θ + α · ∑_&#123;t=0&#125;^T ∇_θ ln π_θ(u_t | s_t) · (G_t - b(s_t))
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Linear-Gaussian continuous tempo policy with exploration standard deviation σ = 12 BPM, paired with Softmax categorical mode and density policies.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Experimental Configuration */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-mono">
              <span className="text-cyan-400">03.</span> SIMULATION CONFIGURATION & TABLE 3 RESULTS
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
              <div>· Batch size: <strong>512 simulated listeners per iteration</strong> · Test: <strong>1,000 listeners per seed</strong></div>
              <div>· Policy iterations: <strong>300 REINFORCE updates</strong> · Decisions/session: <strong>10</strong></div>
              <div>· Adam LR: <strong>0.02</strong> · Discount: <strong>γ = 0.9</strong> · Quality weight: <strong>λ_q = 0.5</strong></div>
              <div>· Target state: <strong>s_tgt = (0.5, −0.5)</strong> · Success threshold: <strong>d_T ≤ 0.3</strong></div>
              <div>· Random seeds: <strong>0–4 (main results)</strong>; <strong>0–2 (sensitivity sweeps)</strong></div>
              <div>· Per-window EEG noise: <strong>σ ∈ &#123;0.1, 0.5, 1.0, 2.0&#125;</strong> (4 windows averaged)</div>
              <div>· Listener bias SD: <strong>&#123;0.0, 0.15, 0.3, 0.45&#125;</strong> · Process noise SD: <strong>0.05</strong></div>
              <div>· Proposed (EEG+RL) Table 3: <strong>d_T = 0.272 ± 0.009</strong> · <strong>Δd = 1.092</strong> · <strong>Success = 60.3 ± 3.2%</strong> · <strong>Q_avg = 0.938</strong></div>
            </div>
          </div>

          {/* Section 4: Non-Clinical Research Disclaimer */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-amber-200/90 text-xs">
            <strong className="text-amber-300 block mb-1">Regulatory & Clinical Boundary:</strong>
            This application demonstrates computational closed-loop reinforcement learning and simulation study findings. It is not an FDA-cleared or CE-marked medical device and should not be used for autonomous medical diagnosis or clinical intervention without human-in-the-loop oversight.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
