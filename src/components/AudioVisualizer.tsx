import React, { useEffect, useRef } from 'react';
import { defaultAudioEngine } from '../services/audioEngine';

interface AudioVisualizerProps {
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ height = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const analyser = defaultAudioEngine.getAnalyser();

      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Dark background with subtle grid lines
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, h);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      if (!analyser) {
        // Flat resting line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        return;
      }

      // 1. Frequency Spectrum Bars (Background)
      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqData);

      const barWidth = (width / bufferLength) * 2.2;
      let barX = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        const barHeight = (freqData[i] / 255) * (h * 0.85);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.fillRect(barX, h - barHeight, barWidth - 1, barHeight);
        barX += barWidth;
      }

      // 2. Waveform Oscilloscope (Foreground)
      const timeData = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(timeData);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8'; // Sky cyan
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full block"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
