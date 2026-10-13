import React, { useState, useRef } from 'react';
import { Activity, Upload, Loader2, PlayCircle } from 'lucide-react';
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

  const handleDemoAudio = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.analyzeSampleAudio();
      setAnalysis(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze demo audio sample.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Speech Signal Processing Lab</h1>
        <p>Acoustic feature extraction: Waveform, Short-Time Energy, Zero-Crossing Rate, STFT Spectrogram, and MFCCs.</p>
      </div>

      <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />

      {/* Action Controls Card */}
      <div className="card">
        <div className="card-title">
          <Activity size={18} color="#38bdf8" />
          Select Audio for Signal Processing
        </div>
        <div className="card-subtitle">
          Test instantly using the built-in demo sample, or upload any speech audio file (.wav, .mp3, .m4a).
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={handleDemoAudio}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Computing FFT & Mel Filterbanks...
              </>
            ) : (
              <>
                <PlayCircle size={16} />
                Analyze Demo Audio (Instant)
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a,.ogg,.flac"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isAnalyzing}
          />

          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            <Upload size={16} />
            Upload Custom File
          </button>
        </div>
      </div>

      {/* Analysis Output Section */}
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
              subtext="Samples per second"
            />
            <MetricCard
              label="STFT Frame / Hop"
              value={`${analysis.frame_length} / ${analysis.hop_length}`}
              subtext="Window & step size"
            />
            <MetricCard
              label="Mel Coefficients"
              value={`${analysis.num_mfcc}`}
              subtext="Cepstral dimensions"
            />
          </div>

          {analysis.notes && (
            <div className="info-banner">
              <strong>Status:</strong> {analysis.notes}
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
            description="Highlights high-energy voiced speech segments versus silent or unvoiced intervals."
            color="#10b981"
            unitLabel="Energy"
          />

          {/* 3. Zero-Crossing Rate Plot */}
          <TimeSeriesChart
            data={analysis.zero_crossing_rate}
            title="3. Zero-Crossing Rate (ZCR)"
            description="Rate of signal sign changes across consecutive samples; elevated in unvoiced consonants and fricatives."
            color="#f59e0b"
            unitLabel="Crossings"
          />

          {/* 4. Spectrogram Heatmap */}
          <HeatmapCanvas
            title="4. STFT Log Spectrogram (Time-Frequency Representation)"
            subtitle="Spectral power distribution across frequency bins over time."
            times={analysis.spectrogram.times}
            yLabels={analysis.spectrogram.frequencies.map((f) => `${Math.round(f)} Hz`)}
            values={analysis.spectrogram.values}
            yAxisTitle="Frequency (Hz)"
            colorMap="magma"
          />

          {/* 5. MFCC Heatmap */}
          <HeatmapCanvas
            title="5. Mel-Frequency Cepstral Coefficients (MFCCs)"
            subtitle="Vocal tract spectral envelope representations projected onto non-linear Mel filterbanks."
            times={analysis.mfcc.times}
            yLabels={analysis.mfcc.coefficients.map((c) => `Coeff ${c}`)}
            values={analysis.mfcc.values}
            yAxisTitle="MFCC Index"
            colorMap="viridis"
          />
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            color: 'var(--text-muted)',
          }}
        >
          <Activity size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Ready for Acoustic Analysis
          </div>
          <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '0.85rem' }}>
            Click <strong>"Analyze Demo Audio"</strong> above for an instant test, or upload your own WAV or MP3 recording to inspect real-time speech feature representations.
          </p>
        </div>
      )}
    </div>
  );
};
