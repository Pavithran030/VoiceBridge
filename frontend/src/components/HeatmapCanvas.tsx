import React, { useRef, useEffect } from 'react';

interface HeatmapCanvasProps {
  title: string;
  subtitle: string;
  times: number[];
  yLabels: string[] | number[];
  values: number[][]; // [y_index][x_index]
  yAxisTitle: string;
  colorMap?: 'viridis' | 'magma';
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  title,
  subtitle,
  times,
  yLabels,
  values,
  yAxisTitle,
  colorMap = 'magma',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simple perceptually-inspired color map
  const getColor = (norm: number): string => {
    // Clamped between 0 and 1
    const t = Math.max(0, Math.min(1, norm));
    if (colorMap === 'magma') {
      // Dark purple -> Red -> Yellow
      const r = Math.round(255 * Math.sin(t * Math.PI * 0.9));
      const g = Math.round(255 * Math.pow(t, 2));
      const b = Math.round(180 * (1 - t) + 20);
      return `rgb(${r},${g},${b})`;
    } else {
      // Dark blue -> Green -> Yellow
      const r = Math.round(255 * Math.pow(t, 1.5));
      const g = Math.round(220 * t);
      const b = Math.round(220 * (1 - t * 0.7));
      return `rgb(${r},${g},${b})`;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !values.length || !values[0]?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numRows = values.length;
    const numCols = values[0].length;
    const width = canvas.width;
    const height = canvas.height;

    // Find min and max
    let min = Infinity;
    let max = -Infinity;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const v = values[r][c];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const range = max - min || 1;

    const cellWidth = width / numCols;
    const cellHeight = height / numRows;

    // Draw cells (Row 0 is usually highest frequency in image, or inverted)
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const val = values[r][c];
        const norm = (val - min) / range;
        ctx.fillStyle = getColor(norm);
        // Invert Y so lowest frequency/index is at bottom
        const yPos = height - (r + 1) * cellHeight;
        ctx.fillRect(c * cellWidth, yPos, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
  }, [values, colorMap]);

  const maxTime = times.length ? times[times.length - 1] : 0;
  const minLabel = yLabels.length ? yLabels[0] : '';
  const maxLabel = yLabels.length ? yLabels[yLabels.length - 1] : '';

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-subtitle">{subtitle}</div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Y Axis Label */}
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          {yAxisTitle}
        </div>

        <div style={{ flex: 1 }}>
          <div className="canvas-wrapper" style={{ padding: '0.5rem' }}>
            <canvas ref={canvasRef} width={800} height={220} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.4rem',
              }}
            >
              <span>0.00s</span>
              <span>Time (seconds)</span>
              <span>{maxTime.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>High</span>
          <div
            style={{
              width: '14px',
              height: '180px',
              borderRadius: '4px',
              background:
                colorMap === 'magma'
                  ? 'linear-gradient(to top, #1e1b4b, #ef4444, #fde047)'
                  : 'linear-gradient(to top, #0284c7, #10b981, #facc15)',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Low</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        <span>Bottom: {String(minLabel)}</span>
        <span>Top: {String(maxLabel)}</span>
      </div>
    </div>
  );
};
