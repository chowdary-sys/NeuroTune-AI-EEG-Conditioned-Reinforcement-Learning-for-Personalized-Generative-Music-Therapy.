import React, { useState } from 'react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  HelpCircle,
  Layers,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { defaultRidgeEncoder } from '../services/ridgeRegression';
import { defaultClosedLoopController } from '../services/closedLoopController';
import { EmotionCircumplex } from './EmotionCircumplex';
import { EmotionState } from '../types/neurotune';

export const EmotionDetectionTab: React.FC = () => {
  const [lambda, setLambda] = useState<number>(defaultRidgeEncoder.getRegularization());
  const modelSummary = defaultRidgeEncoder.getModelSummary();
  const state = defaultClosedLoopController.getState();

  const handleLambdaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLambda(val);
    defaultRidgeEncoder.setRegularization(val);
  };

  const featureLabels = [
    'θ_F3 (Theta Left Frontal)',
    'α_F3 (Alpha Left Frontal)',
    'β_F3 (Beta Left Frontal)',
    'θ_F4 (Theta Right Frontal)',
    'α_F4 (Alpha Right Frontal)',
    'β_F4 (Beta Right Frontal)',
    'θ_Pz (Theta Parietal)',
    'α_Pz (Alpha Parietal)',
    'β_Pz (Beta Parietal)',
    'FAA (Frontal Alpha Asymmetry)',
    'Arousal Ratio [β / (α + θ)]',
  ];

  return (
    <div className="space-y-6">
      {/* Research Disclaimer Box (Strict compliance with guidelines) */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-amber-300">
            RESEARCH SIMULATION NOTICE: NON-CLINICAL VALIDATION BOUNDARY
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            Emotion estimation is implemented according to the simulation study methodology in the research paper.
            Affective dimensional predictions (Valence and Arousal) are mathematical representations derived
            from regularized spectral EEG correlates and do not constitute clinically validated diagnostic instruments.
          </p>
        </div>
      </div>

      {/* Main Grid: Circumplex Plane + Ridge Regression Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Circumplex Affect Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Russell's Circumplex Affective Plane
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              2D continuous affect coordinates: Valence × Arousal
            </p>

            <EmotionCircumplex
              currentEmotion={state.currentEmotion}
              targetEmotion={state.targetEmotion}
              trajectory={state.sessionSteps.map((s) => ({
                valence: s.emotionBefore.valence,
                arousal: s.emotionBefore.arousal,
                step: s.step,
              }))}
              onSelectTarget={(v, a) => defaultClosedLoopController.setTargetEmotion(v, a)}
              interactive={true}
            />

            {/* Before vs After Session Comparison */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Session Initial State
                </span>
                <div className="text-sm font-bold text-slate-200 mt-1">
                  V: {state.initialEmotion.valence > 0 ? `+${state.initialEmotion.valence}` : state.initialEmotion.valence} · A: {state.initialEmotion.arousal > 0 ? `+${state.initialEmotion.arousal}` : state.initialEmotion.arousal}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {state.initialEmotion.quadrant}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Current Predicted State
                </span>
                <div className="text-sm font-bold text-cyan-400 mt-1">
                  V: {state.currentEmotion.valence > 0 ? `+${state.currentEmotion.valence}` : state.currentEmotion.valence} · A: {state.currentEmotion.arousal > 0 ? `+${state.currentEmotion.arousal}` : state.currentEmotion.arousal}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {state.currentEmotion.quadrant}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ridge Regression Encoder Architecture & Test Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mathematical Formulation & Regularization Tuning */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Ridge Regression EEG Affective Decoder
              </h3>
              <span className="text-xs font-mono text-cyan-400">λ = {lambda.toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 mb-4 leading-relaxed">
              <div className="text-slate-500 text-[10px] uppercase">Closed-Form Analytical Solution</div>
              <div className="text-cyan-300 mt-1 font-semibold">
                W* = (X^T · X + λ · I)^(-1) · X^T · Y
              </div>
              <div className="text-slate-400 text-[11px] mt-1">
                Linear mapping from 11D normalized spectral features with L2 penalty, squashed by hyperbolic tangent.
              </div>
            </div>

            {/* Lambda Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">
                  L2 Regularization Parameter (λ): <strong className="text-cyan-400">{lambda.toFixed(2)}</strong>
                </span>
                <span className="text-slate-500">Default: 1.0</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={lambda}
                onChange={handleLambdaChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.1 (Unregularized / OLS limit)</span>
                <span>1.0 (Optimal Generalization)</span>
                <span>10.0 (High Shrinkage)</span>
              </div>
            </div>

            {/* Test Partition Validation Metrics (Ground Truth) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Held-Out Synthetic Encoder Evaluation (2,400 calibration samples · RMSE = {modelSummary.testMetrics.encoderRmse})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">QUADRANT ACC.</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {(modelSummary.testMetrics.classificationAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Sign of (V, A)</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ENCODER RMSE</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {modelSummary.testMetrics.encoderRmse}
                  </div>
                  <div className="text-[10px] text-slate-400">z vs true s</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">PRECISION</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {(modelSummary.testMetrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Macro avg</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500">F1-SCORE</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {(modelSummary.testMetrics.f1Score * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">4-Quadrant</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Valence: R² = {modelSummary.testMetrics.valenceR2} (MSE = {modelSummary.testMetrics.valenceMse})</span>
                <span>Arousal: R² = {modelSummary.testMetrics.arousalR2} (MSE = {modelSummary.testMetrics.arousalMse})</span>
              </div>
            </div>
          </div>

          {/* Model Weights Inspector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-2">
              Feature Coefficient Loading Matrix (W)
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Standardized regression weights for each spectral feature across emotional dimensions
            </p>

            <div className="overflow-x-auto max-h-56 scrollbar-thin">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-1.5 px-2">Feature</th>
                    <th className="py-1.5 px-2 text-right">Valence W_v</th>
                    <th className="py-1.5 px-2 text-right">Arousal W_a</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {featureLabels.map((lbl, idx) => {
                    const wv = modelSummary.weightsValence[idx];
                    const wa = modelSummary.weightsArousal[idx];
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-1 px-2 text-slate-300">{lbl}</td>
                        <td
                          className={`py-1 px-2 text-right font-bold ${
                            wv > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {wv > 0 ? `+${wv.toFixed(2)}` : wv.toFixed(2)}
                        </td>
                        <td
                          className={`py-1 px-2 text-right font-bold ${
                            wa > 0 ? 'text-amber-400' : 'text-indigo-400'
                          }`}
                        >
                          {wa > 0 ? `+${wa.toFixed(2)}` : wa.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
