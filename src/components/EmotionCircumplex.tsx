import React from 'react';
import { EmotionState } from '../types/neurotune';

interface EmotionCircumplexProps {
  currentEmotion: EmotionState;
  targetEmotion: { valence: number; arousal: number; label?: string };
  trajectory?: Array<{ valence: number; arousal: number; step: number }>;
  onSelectTarget?: (valence: number, arousal: number) => void;
  interactive?: boolean;
}

export const EmotionCircumplex: React.FC<EmotionCircumplexProps> = ({
  currentEmotion,
  targetEmotion,
  trajectory = [],
  onSelectTarget,
  interactive = true,
}) => {
  const size = 380;
  const padding = 40;
  const plotWidth = size - 2 * padding;
  const plotHeight = size - 2 * padding;

  // Convert (valence, arousal) in [-1, 1] to SVG coordinates
  const toSvgX = (v: number) => padding + ((v + 1) / 2) * plotWidth;
  const toSvgY = (a: number) => padding + ((1 - a) / 2) * plotHeight; // Invert Y for Cartesian coordinates

  // Convert SVG coordinate back to (v, a)
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onSelectTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normX = (clickX - padding) / plotWidth;
    const normY = (clickY - padding) / plotHeight;

    const v = Math.max(-1, Math.min(1, normX * 2 - 1));
    const a = Math.max(-1, Math.min(1, 1 - normY * 2));

    onSelectTarget(parseFloat(v.toFixed(2)), parseFloat(a.toFixed(2)));
  };

  const currX = toSvgX(currentEmotion.valence);
  const currY = toSvgY(currentEmotion.arousal);

  const targetX = toSvgX(targetEmotion.valence);
  const targetY = toSvgY(targetEmotion.arousal);
  const targetRadius = (0.30 / 2) * plotWidth; // d_T <= 0.3 success boundary (Section 5.4)

  return (
    <div className="flex flex-col items-center">
      <div className="relative border border-slate-800 rounded-xl bg-slate-950 p-2 shadow-inner">
        <svg
          width={size}
          height={size}
          onClick={handleSvgClick}
          className={`${interactive ? 'cursor-crosshair' : 'cursor-default'} select-none`}
        >
          {/* Subtle Quadrant Background Tints */}
          {/* Q2: Anxious / Tense (-V, +A) */}
          <rect
            x={padding}
            y={padding}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(244, 63, 94, 0.04)"
          />
          {/* Q1: Excited / Joyful (+V, +A) */}
          <rect
            x={padding + plotWidth / 2}
            y={padding}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(245, 158, 11, 0.04)"
          />
          {/* Q3: Depressed / Sad (-V, -A) */}
          <rect
            x={padding}
            y={padding + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(99, 102, 241, 0.04)"
          />
          {/* Q4: Serene / Calm (+V, -A) */}
          <rect
            x={padding + plotWidth / 2}
            y={padding + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(16, 185, 129, 0.05)"
          />

          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding + plotHeight / 2}
            x2={padding + plotWidth}
            y2={padding + plotHeight / 2}
            stroke="rgba(71, 85, 105, 0.5)"
            strokeWidth="1.5"
          />
          <line
            x1={padding + plotWidth / 2}
            y1={padding}
            x2={padding + plotWidth / 2}
            y2={padding + plotHeight}
            stroke="rgba(71, 85, 105, 0.5)"
            strokeWidth="1.5"
          />

          {/* Tick circles */}
          <circle
            cx={padding + plotWidth / 2}
            cy={padding + plotHeight / 2}
            r={plotWidth * 0.25}
            fill="none"
            stroke="rgba(51, 65, 85, 0.3)"
            strokeDasharray="4 4"
          />
          <circle
            cx={padding + plotWidth / 2}
            cy={padding + plotHeight / 2}
            r={plotWidth * 0.45}
            fill="none"
            stroke="rgba(51, 65, 85, 0.2)"
            strokeDasharray="4 4"
          />

          {/* Quadrant Labels */}
          <text
            x={padding + 12}
            y={padding + 22}
            className="text-[11px] font-mono fill-rose-400/80 font-medium tracking-wide"
          >
            ANXIOUS / TENSE
          </text>
          <text
            x={padding + plotWidth - 12}
            y={padding + 22}
            textAnchor="end"
            className="text-[11px] font-mono fill-amber-400/80 font-medium tracking-wide"
          >
            EXCITED / FLOW
          </text>
          <text
            x={padding + 12}
            y={padding + plotHeight - 14}
            className="text-[11px] font-mono fill-indigo-400/80 font-medium tracking-wide"
          >
            DYSPHORIC / FATIGUE
          </text>
          <text
            x={padding + plotWidth - 12}
            y={padding + plotHeight - 14}
            textAnchor="end"
            className="text-[11px] font-mono fill-emerald-400/80 font-medium tracking-wide"
          >
            SERENE / CALM
          </text>

          {/* Axis Labels */}
          <text
            x={padding + plotWidth / 2}
            y={padding - 14}
            textAnchor="middle"
            className="text-[10px] font-mono fill-slate-400 uppercase tracking-wider font-semibold"
          >
            + Arousal (Activation)
          </text>
          <text
            x={padding + plotWidth / 2}
            y={size - 12}
            textAnchor="middle"
            className="text-[10px] font-mono fill-slate-400 uppercase tracking-wider font-semibold"
          >
            - Arousal (Sedation)
          </text>
          <text
            x={padding - 8}
            y={padding + plotHeight / 2 + 3}
            textAnchor="end"
            className="text-[10px] font-mono fill-slate-400 uppercase tracking-wider font-semibold"
          >
            - Valence
          </text>
          <text
            x={padding + plotWidth + 8}
            y={padding + plotHeight / 2 + 3}
            textAnchor="start"
            className="text-[10px] font-mono fill-slate-400 uppercase tracking-wider font-semibold"
          >
            + Valence
          </text>

          {/* Target Epsilon Success Zone */}
          <circle
            cx={targetX}
            cy={targetY}
            r={targetRadius}
            fill="rgba(16, 185, 129, 0.12)"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Target Center Point */}
          <circle cx={targetX} cy={targetY} r={6} fill="#10b981" />
          <text
            x={targetX}
            y={targetY - 10}
            textAnchor="middle"
            className="text-[10px] font-mono fill-emerald-400 font-bold"
          >
            Target ({targetEmotion.valence > 0 ? `+${targetEmotion.valence}` : targetEmotion.valence}, {targetEmotion.arousal > 0 ? `+${targetEmotion.arousal}` : targetEmotion.arousal})
          </text>

          {/* Trajectory Polyline */}
          {trajectory.length > 1 && (
            <g>
              <polyline
                points={trajectory.map((p) => `${toSvgX(p.valence)},${toSvgY(p.arousal)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.75"
              />
              {trajectory.map((p, idx) => (
                <circle
                  key={idx}
                  cx={toSvgX(p.valence)}
                  cy={toSvgY(p.arousal)}
                  r={3}
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Current State Confidence Ellipse */}
          <circle
            cx={currX}
            cy={currY}
            r={14}
            fill="rgba(56, 189, 248, 0.2)"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Current State Indicator */}
          <circle cx={currX} cy={currY} r={7} fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
          <text
            x={currX}
            y={currY + 20}
            textAnchor="middle"
            className="text-[10px] font-mono fill-sky-200 font-semibold"
          >
            Current ({currentEmotion.valence > 0 ? `+${currentEmotion.valence}` : currentEmotion.valence}, {currentEmotion.arousal > 0 ? `+${currentEmotion.arousal}` : currentEmotion.arousal})
          </text>
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between w-full max-w-[380px] text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
          <span>Estimated Affect: <strong className="text-slate-200">{currentEmotion.quadrant}</strong></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Target Zone (d_T ≤ 0.30)</span>
        </span>
      </div>

      {interactive && (
        <p className="text-[11px] text-slate-500 mt-1">
          Click anywhere inside the circumplex coordinate plane to retarget the therapeutic goal.
        </p>
      )}
    </div>
  );
};
