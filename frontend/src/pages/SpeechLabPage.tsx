import React, { useState, useRef } from 'react';
import { Activity, Upload, Loader2, Info } from 'lucide-react';
import type { SpeechAnalysisResponse } from '../api/types';
import { apiClient } from '../api/client';
import { WaveformChart, TimeSeriesChart } from '../components/AudioCharts';
import { HeatmapCanvas } from '../components/HeatmapCanvas';
import { ErrorMessage } from '../components/ErrorMessage';
import { MetricCard } from '../components/MetricCard';

export const SpeechLabPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<SpeechAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsAnalyzing(true);
      setErrorMessage(null);
      try {
        const res = await apiClient.analyzeAudio(file);
        setAnalysis(res);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to extract audio features.');
      } finally {
        setIsAnalyzing(false);
        e.target.value = '';
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Speech Lab & Acoustic Feature Analyzer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Interactive educational laboratory demonstrating short-time signal processing, STFT spectrograms, and MFCC representations.
        </p>
      </div>

      <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />

      {/* Upload Box */}
      <div className="card">
        <div className="card-title">
          <Upload size={20} />
          Select Audio Sample for Analysis
        </div>
        <div className="card-subtitle">
          Upload any WAV, MP3, M4A, or FLAC speech file (up to 10 MB) to inspect its mathematical acoustic features.
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,.m4a,.ogg,.flac"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={isAnalyzing}
        />

        <button
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Computing FFT & Mel Filterbank Features...
            </>
          ) : (
            <>
              <Activity size={18} />
              Upload Audio to Analyze
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div style={{ marginTop: '1.5rem' }}>
          {/* Audio Metadata KPI Cards */}
          <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
            <MetricCard
              label="Signal Duration"
              value={`${analysis.duration_seconds.toFixed(2)} s`}
              subtext="Total audio length"
            />
            <MetricCard
              label="Sampling Frequency"
              value={`${analysis.sample_rate} Hz`}
              subtext="Digital samples per second"
            />
            <MetricCard
              label="STFT Frame / Hop"
              value={`${analysis.frame_length} / ${analysis.hop_length}`}
              subtext="Window length and step size"
            />
            <MetricCard
              label="Mel Coefficients"
              value={`${analysis.num_mfcc}`}
              subtext="Static cepstral coefficients"
            />
          </div>

          {analysis.notes && (
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: '#93c5fd',
                marginBottom: '1.5rem',
              }}
            >
              <strong>Signal Status:</strong> {analysis.notes}
            </div>
          )}

          {/* 1. Waveform Plot */}
          <WaveformChart
            waveform={analysis.waveform}
            title="1. Time-Domain Waveform x(t)"
          />

          {/* 2. Short-Time Energy Plot */}
          <TimeSeriesChart
            data={analysis.energy}
            title="2. Short-Time Energy (STE)"
            description="Formula: E_m = sum(x[n + mH]^2 * w[n]). Highlights high-energy voiced speech segments and unvoiced/silent intervals."
            color="#10b981"
            unitLabel="Energy"
          />

          {/* 3. Zero-Crossing Rate Plot */}
          <TimeSeriesChart
            data={analysis.zero_crossing_rate}
            title="3. Zero-Crossing Rate (ZCR)"
            description="Rate at which speech signal changes sign across adjacent samples. High ZCR typically correlates with unvoiced fricatives and environmental noise."
            color="#f59e0b"
            unitLabel="Crossings"
          />

          {/* 4. Spectrogram Heatmap */}
          <HeatmapCanvas
            title="4. Short-Time Fourier Transform (STFT) Log Spectrogram"
            subtitle="Displays spectral power density over time. Vertical axis shows frequency bins (Hz), horizontal axis shows time (s)."
            times={analysis.spectrogram.times}
            yLabels={analysis.spectrogram.frequencies.map((f) => `${Math.round(f)} Hz`)}
            values={analysis.spectrogram.values}
            yAxisTitle="Frequency (Hz)"
            colorMap="magma"
          />

          {/* 5. MFCC Heatmap */}
          <HeatmapCanvas
            title="5. Mel-Frequency Cepstral Coefficients (MFCCs)"
            subtitle="Compact representations of the speech vocal tract spectral envelope filtered through biologically-motivated Mel filterbanks."
            times={analysis.mfcc.times}
            yLabels={analysis.mfcc.coefficients.map((c) => `Coeff ${c}`)}
            values={analysis.mfcc.values}
            yAxisTitle="MFCC Index"
            colorMap="viridis"
          />

          {/* Educational Signal Processing Concepts Note */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-title">
              <Info size={18} color="#60a5fa" />
              Speech Processing Concepts Summary for Project Review
            </div>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '0.5rem' }}>
              <li>
                <strong>Voiced vs Unvoiced Speech:</strong> Voiced sounds (like vowels) show high Short-Time Energy and low ZCR. Unvoiced consonants (like 's', 'sh') show lower energy and higher ZCR.
              </li>
              <li>
                <strong>STFT Framing:</strong> Non-stationary speech is assumed quasi-stationary within short 20-30 ms frames, windowed with a Hann window to reduce spectral leakage.
              </li>
              <li>
                <strong>Mel Scale & DCT:</strong> The Mel filterbank models non-linear human auditory frequency perception. Discrete Cosine Transform (DCT) decorrelates filterbank log energies to produce MFCCs.
              </li>
            </ul>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: 'var(--text-muted)',
          }}
        >
          <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Audio Analyzed Yet
          </div>
          <p style={{ maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
            Upload any speech audio sample to visualize actual computed waveforms, short-time energy, zero-crossing rate, STFT spectrogram, and MFCCs.
          </p>
        </div>
      )}
    </div>
  );
};
