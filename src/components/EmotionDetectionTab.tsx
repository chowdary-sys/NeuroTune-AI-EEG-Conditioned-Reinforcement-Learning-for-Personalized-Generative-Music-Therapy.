import React, { useState } from 'react';
import {
  AlertTriangle,
  Brain,
  Info,
  Layers,
} from 'lucide-react';
import { defaultRidgeEncoder } from '../services/ridgeRegression';
import { defaultClosedLoopController } from '../services/closedLoopController';
import { EmotionCircumplex } from './EmotionCircumplex';

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
    'Theta · Front Left (Sleepy)',
    'Alpha · Front Left (Relaxed)',
    'Beta · Front Left (Alert)',
    'Theta · Front Right (Sleepy)',
    'Alpha · Front Right (Relaxed)',
    'Beta · Front Right (Alert)',
    'Theta · Top Back (Sleepy)',
    'Alpha · Top Back (Relaxed)',
    'Beta · Top Back (Alert)',
    'Left-Right Happiness Balance (FAA)',
    'Energy Ratio [Beta / (Alpha + Theta)]',
  ];

  const friendlyQuadrant = (q: string) => {
    switch (q) {
      case 'Anxious/Tense':
        return 'Stressed / Tense';
      case 'Excited/Joyful':
        return 'Happy / Excited';
      case 'Depressed/Sad':
        return 'Sad / Tired';
      case 'Serene/Calm':
        return 'Calm / Relaxed';
      default:
        return q;
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Intro Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">What This Page Does:</strong>
          The app turns 11 brainwave numbers into two simple mood scores: <strong>Mood Feel (Valence)</strong> from sad to happy,
          and <strong>Energy Level (Arousal)</strong> from calm to tense. Click anywhere on the map to set a new Calm Goal!
        </div>
      </div>

      {/* Non-Clinical Notice */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-amber-300">
            Research Demo Notice (Not a Medical Tool)
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            Mood predictions here are math estimates used to test our research simulation. They are not clinically validated and should not be used for medical diagnosis.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mood Map (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              2D Mood Map (Before vs. Now)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Left/Right = Sad to Happy · Up/Down = Tense to Calm
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

            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Mood at Session Start
                </span>
                <div className="text-sm font-mono font-bold text-slate-200 mt-1 tabular-nums">
                  M: {state.initialEmotion.valence > 0 ? `+${state.initialEmotion.valence}` : state.initialEmotion.valence} · E: {state.initialEmotion.arousal > 0 ? `+${state.initialEmotion.arousal}` : state.initialEmotion.arousal}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {friendlyQuadrant(state.initialEmotion.quadrant)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Mood Right Now
                </span>
                <div className="text-sm font-mono font-bold text-cyan-400 mt-1 tabular-nums">
                  M: {state.currentEmotion.valence > 0 ? `+${state.currentEmotion.valence}` : state.currentEmotion.valence} · E: {state.currentEmotion.arousal > 0 ? `+${state.currentEmotion.arousal}` : state.currentEmotion.arousal}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {friendlyQuadrant(state.currentEmotion.quadrant)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Translator Details & Accuracy (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Brainwave-to-Mood Translator (Ridge Regression)
              </h3>
              <span className="text-xs font-mono text-cyan-400">Smoothness λ = {lambda.toFixed(1)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4 leading-relaxed">
              <div className="text-slate-400 text-[11px] font-semibold mb-1">How the Math Works Simply:</div>
              <p className="text-slate-300">
                Think of this like a weighted recipe. It multiplies each of the 11 brainwave readings by a learned weight to guess Mood and Energy.
                The <span className="font-mono text-cyan-300">λ</span> slider keeps the weights gentle so noisy brainwaves don't cause wild guesses.
              </p>
              <div className="text-cyan-300/90 mt-2 font-mono text-[11px]">
                Paper Formula: W* = (X^T · X + λ · I)^(-1) · X^T · Y
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">
                  Noise Protection Strength (λ): <strong className="text-cyan-400 font-mono">{lambda.toFixed(1)}</strong>
                </span>
                <span className="text-slate-400 text-[11px]">Paper default: 1.0</span>
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
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.1 (More Reactive)</span>
                <span>1.0 (Balanced Best)</span>
                <span>10.0 (Very Cautious)</span>
              </div>
            </div>

            {/* Paper Encoder Test Scores */}
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-medium text-slate-300 mb-3">
                Accuracy on Test Brainwaves (2,400 samples · exact paper test results)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">RIGHT MOOD AREA</div>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-0.5 tabular-nums">
                    {(modelSummary.testMetrics.classificationAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">4-box accuracy</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">AVERAGE ERROR</div>
                  <div className="text-base font-mono font-bold text-cyan-400 mt-0.5 tabular-nums">
                    {modelSummary.testMetrics.encoderRmse}
                  </div>
                  <div className="text-[10px] text-slate-400">RMSE (lower = better)</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">PRECISION</div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-0.5 tabular-nums">
                    {(modelSummary.testMetrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Average match</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">F1-SCORE</div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-0.5 tabular-nums">
                    {(modelSummary.testMetrics.f1Score * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Overall balance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Learned Feature Weights Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-1">
              Which Brainwaves Matter Most?
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Green/positive numbers push Mood or Energy up; negative numbers pull them down.
            </p>

            <div className="overflow-x-auto max-h-56 scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-1.5 px-2">Brainwave Reading</th>
                    <th className="py-1.5 px-2 text-right">Mood Effect</th>
                    <th className="py-1.5 px-2 text-right">Energy Effect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {featureLabels.map((lbl, idx) => {
                    const wv = modelSummary.weightsValence[idx];
                    const wa = modelSummary.weightsArousal[idx];
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-1.5 px-2 text-slate-300 font-sans">{lbl}</td>
                        <td
                          className={`py-1.5 px-2 text-right font-bold tabular-nums ${
                            wv > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {wv > 0 ? `+${wv.toFixed(2)}` : wv.toFixed(2)}
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right font-bold tabular-nums ${
                            wa > 0 ? 'text-amber-400' : 'text-sky-400'
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
