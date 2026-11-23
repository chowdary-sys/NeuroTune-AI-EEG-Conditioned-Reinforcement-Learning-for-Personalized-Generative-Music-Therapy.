import React from 'react';
import { X } from 'lucide-react';

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
              <span>SIMPLE GUIDE TO THE RESEARCH PAPER</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Plain-English walkthrough plus exact formulas and benchmark numbers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400 font-mono">01.</span> What Problem Does This Project Solve?
            </h3>
            <p>
              Normal music playlists are static—they play the same songs even if you start feeling more stressed.
              NeuroTune AI creates a <strong>closed loop</strong>: it reads simulated brainwaves, estimates your current mood (positive/negative) and energy (calm/tense), and uses Reinforcement Learning to keep adjusting custom music until your mood moves into the Calm Goal zone.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400 font-mono">02.</span> The 4 Core Ideas (In Plain Words + Math)
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  A. Reading Brain Balance (Frontal Alpha Asymmetry)
                </div>
                <p className="text-slate-300 mb-1">
                  Compares relaxed Alpha waves on the left vs. right front of the head. Positive balance suggests a happier, calmer mood; negative balance suggests stress.
                </p>
                <div className="text-slate-400 font-mono text-[11px]">
                  Formula: FAA = ln(α_F4) − ln(α_F3)
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  B. Translating Brainwaves to Mood (Ridge Regression)
                </div>
                <p className="text-slate-300 mb-1">
                  Converts 11 brainwave readings into a point on the 2D Mood Map with 85.1% mood-box accuracy and 0.194 average error (RMSE).
                </p>
                <div className="text-slate-400 font-mono text-[11px]">
                  Formula: W* = (X^T · X + λ · I)^(-1) · X^T · Y
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  C. Scoring Each Song Step (Reward Function)
                </div>
                <p className="text-slate-300 mb-1">
                  Gives points when the listener gets closer to the Calm Goal AND when the music sounds smooth and matches their taste.
                </p>
                <div className="text-slate-400 font-mono text-[11px]">
                  Formula: R_t = w₁·ΔDist + w₂·Q_music + w₃·P_listener + w₄·Feedback (λ_q = 0.5)
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-300 font-semibold mb-1">
                  D. Self-Learning Music AI (REINFORCE)
                </div>
                <p className="text-slate-300 mb-1">
                  Picks music speed (BPM), feel (Major/Minor), and busyness, then reinforces choices that earned better rewards.
                </p>
                <div className="text-slate-400 font-mono text-[11px]">
                  Formula: θ ← θ + α · ∑ ∇_θ ln π_θ(u_t | s_t) · (G_t − b(s_t))
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400 font-mono">03.</span> Exact Research Paper Test Setup & Results (Tables 2 & 3)
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
              <div>· Training batch: <strong>512 simulated listeners/step</strong> · Test set: <strong>1,000 listeners/seed</strong></div>
              <div>· Training length: <strong>300 REINFORCE iterations</strong> · Decisions per session: <strong>10</strong></div>
              <div>· Adam LR: <strong>0.02</strong> · Discount: <strong>γ = 0.9</strong> · Quality weight: <strong>λ_q = 0.5</strong></div>
              <div>· Goal mood: <strong>(0.5, −0.5)</strong> · Calm success boundary: <strong>distance d_T ≤ 0.3</strong></div>
              <div>· Seeds: <strong>0–4 (main tables)</strong>; <strong>0–2 (noise & diversity sweeps)</strong></div>
              <div>· Proposed (EEG+RL) Result: <strong>d_T = 0.272 ± 0.009</strong> · <strong>Success = 60.3 ± 3.2%</strong> · <strong>Q_avg = 0.938</strong></div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-amber-200/90 text-xs">
            <strong className="text-amber-300 block mb-1">Important Note (Not a Medical Device):</strong>
            This website is a research simulation and learning tool. It does not claim clinically validated emotion diagnosis and should not replace professional medical care.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
