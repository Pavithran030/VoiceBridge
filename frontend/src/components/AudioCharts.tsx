import React, { useRef, useEffect } from 'react';
import type { WaveformData, TimeSeriesData } from '../api/types';

interface WaveformChartProps {
  waveform: WaveformData;
  title: string;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({ waveform, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform.amplitude.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid lines & Zero line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw waveform path
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const n = waveform.amplitude.length;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * width;
      // Amplitude scaled to center
      const y = (height / 2) - (waveform.amplitude[i] * (height / 2) * 0.95);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [waveform]);

  const maxTime = waveform.time_seconds.length ? waveform.time_seconds[waveform.time_seconds.length - 1] : 0;

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-subtitle">
        Oscillogram displaying sound pressure variations over time (Total Duration: {maxTime.toFixed(2)}s).
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={160} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          <span>0.00s</span>
          <span>Time (seconds)</span>
          <span>{maxTime.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
};

interface TimeSeriesChartProps {
  data: TimeSeriesData;
  title: string;
  description: string;
  color?: string;
  unitLabel?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  description,
  color = '#10b981',
  unitLabel = 'Magnitude',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.values.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...data.values, 0.0001);
    const minVal = Math.min(...data.values, 0);
    const range = maxVal - minVal || 1;

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Area fill
    ctx.fillStyle = `${color}22`;
    ctx.beginPath();
    ctx.moveTo(0, height);

    const n = data.values.length;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * width;
      const normalized = (data.values[i] - minVal) / range;
      const y = height - (normalized * height * 0.9 + height * 0.05);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * width;
      const normalized = (data.values[i] - minVal) / range;
      const y = height - (normalized * height * 0.9 + height * 0.05);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [data, color]);

  const maxTime = data.time_seconds.length ? data.time_seconds[data.time_seconds.length - 1] : 0;
  const peakVal = data.values.length ? Math.max(...data.values).toFixed(4) : '0';

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title">{title}</div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Peak: {peakVal} {unitLabel}
        </span>
      </div>
      <div className="card-subtitle">{description}</div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={140} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          <span>0.00s</span>
          <span>Time (seconds)</span>
          <span>{maxTime.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
};
