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
  const padding = 42;
  const plotWidth = size - 2 * padding;
  const plotHeight = size - 2 * padding;

  const toSvgX = (v: number) => padding + ((v + 1) / 2) * plotWidth;
  const toSvgY = (a: number) => padding + ((1 - a) / 2) * plotHeight;

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
  const targetRadius = (0.30 / 2) * plotWidth;

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
    <div className="flex flex-col items-center">
      <div className="relative border border-slate-200 rounded-lg bg-white p-2 w-full max-w-[380px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          onClick={handleSvgClick}
          className={`w-full h-auto ${interactive ? 'cursor-pointer' : 'cursor-default'} select-none`}
        >
          {/* Light Quadrant Background Tints */}
          <rect
            x={padding}
            y={padding}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(244, 63, 94, 0.06)"
          />
          <rect
            x={padding + plotWidth / 2}
            y={padding}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(245, 158, 11, 0.06)"
          />
          <rect
            x={padding}
            y={padding + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(100, 116, 139, 0.06)"
          />
          <rect
            x={padding + plotWidth / 2}
            y={padding + plotHeight / 2}
            width={plotWidth / 2}
            height={plotHeight / 2}
            fill="rgba(16, 185, 129, 0.07)"
          />

          <line
            x1={padding}
            y1={padding + plotHeight / 2}
            x2={padding + plotWidth}
            y2={padding + plotHeight / 2}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1={padding + plotWidth / 2}
            y1={padding}
            x2={padding + plotWidth / 2}
            y2={padding + plotHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          <circle
            cx={padding + plotWidth / 2}
            cy={padding + plotHeight / 2}
            r={plotWidth * 0.25}
            fill="none"
            stroke="#cbd5e1"
            strokeDasharray="4 4"
          />
          <circle
            cx={padding + plotWidth / 2}
            cy={padding + plotHeight / 2}
            r={plotWidth * 0.45}
            fill="none"
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />

          <text
            x={padding + 10}
            y={padding + 20}
            className="text-[11px] font-mono fill-rose-700 font-semibold tracking-wide"
          >
            STRESSED / TENSE
          </text>
          <text
            x={padding + plotWidth - 10}
            y={padding + 20}
            textAnchor="end"
            className="text-[11px] font-mono fill-amber-700 font-semibold tracking-wide"
          >
            HAPPY / EXCITED
          </text>
          <text
            x={padding + 10}
            y={padding + plotHeight - 12}
            className="text-[11px] font-mono fill-slate-600 font-semibold tracking-wide"
          >
            SAD / TIRED
          </text>
          <text
            x={padding + plotWidth - 10}
            y={padding + plotHeight - 12}
            textAnchor="end"
            className="text-[11px] font-mono fill-emerald-700 font-semibold tracking-wide"
          >
            CALM / RELAXED
          </text>

          <text
            x={padding + plotWidth / 2}
            y={padding - 14}
            textAnchor="middle"
            className="text-[10px] font-mono fill-slate-700 uppercase tracking-wider font-semibold"
          >
            HIGH ENERGY / TENSE (+Arousal)
          </text>
          <text
            x={padding + plotWidth / 2}
            y={size - 12}
            textAnchor="middle"
            className="text-[10px] font-mono fill-slate-700 uppercase tracking-wider font-semibold"
          >
            LOW ENERGY / CALM (-Arousal)
          </text>
          <text
            x={padding - 6}
            y={padding + plotHeight / 2 + 3}
            textAnchor="end"
            className="text-[10px] font-mono fill-slate-600 font-semibold"
          >
            - Mood
          </text>
          <text
            x={padding + plotWidth + 6}
            y={padding + plotHeight / 2 + 3}
            textAnchor="start"
            className="text-[10px] font-mono fill-slate-600 font-semibold"
          >
            + Mood
          </text>

          <circle
            cx={targetX}
            cy={targetY}
            r={targetRadius}
            fill="rgba(16, 185, 129, 0.16)"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          <circle cx={targetX} cy={targetY} r={6} fill="#059669" />
          <text
            x={targetX}
            y={targetY - 11}
            textAnchor="middle"
            className="text-[10px] font-mono fill-emerald-700 font-bold"
          >
            Calm Goal ({targetEmotion.valence > 0 ? `+${targetEmotion.valence}` : targetEmotion.valence}, {targetEmotion.arousal > 0 ? `+${targetEmotion.arousal}` : targetEmotion.arousal})
          </text>

          {trajectory.length > 1 && (
            <g>
              <polyline
                points={trajectory.map((p) => `${toSvgX(p.valence)},${toSvgY(p.arousal)}`).join(' ')}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.85"
              />
              {trajectory.map((p, idx) => (
                <circle
                  key={idx}
                  cx={toSvgX(p.valence)}
                  cy={toSvgY(p.arousal)}
                  r={3}
                  fill="#0369a1"
                  stroke="#0284c7"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          <circle
            cx={currX}
            cy={currY}
            r={14}
            fill="rgba(2, 132, 199, 0.15)"
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          <circle cx={currX} cy={currY} r={7} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <text
            x={currX}
            y={currY + 20}
            textAnchor="middle"
            className="text-[10px] font-mono fill-sky-900 font-bold"
          >
            Now ({currentEmotion.valence > 0 ? `+${currentEmotion.valence}` : currentEmotion.valence}, {currentEmotion.arousal > 0 ? `+${currentEmotion.arousal}` : currentEmotion.arousal})
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 w-full max-w-[380px] text-xs text-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-sky-600 inline-block"></span>
          <span>
            Now: <strong className="text-slate-900">{friendlyQuadrant(currentEmotion.quadrant)}</strong>
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
          <span>Calm Goal (d_T ≤ 0.30)</span>
        </span>
      </div>

      {interactive && (
        <p className="text-[11px] text-slate-500 mt-1.5 text-center">
          Click anywhere inside the map above to move your green Calm Goal.
        </p>
      )}
    </div>
  );
};
