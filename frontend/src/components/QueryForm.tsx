import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, Upload } from 'lucide-react';

interface QueryFormProps {
  onSubmit: (text: string) => void;
  onAudioSelected: (file: File) => void;
  isLoading: boolean;
  isTranscribing: boolean;
  maxLength?: number;
}

const SAMPLE_QUESTIONS = [
  { label: '💰 Tuition Fees', query: 'How do I pay semester tuition fees online?' },
  { label: '📅 Exam Schedule', query: 'When will the end semester exam timetable be announced?' },
  { label: '🏠 Hostel Admission', query: 'How do I apply for hostel room allotment?' },
  { label: '📚 Library Hours', query: 'What are the central library working hours?' },
  { label: '🚌 Bus Transport', query: 'Where can I find campus bus routes and timings?' },
];

export const QueryForm: React.FC<QueryFormProps> = ({
  onSubmit,
  onAudioSelected,
  isLoading,
  isTranscribing,
  maxLength = 1000,
}) => {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim() && !isLoading && !isTranscribing) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSampleClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
    if (!isLoading && !isTranscribing) {
      onSubmit(sampleQuery);
    }
  };

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `recording_${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        stream.getTracks().forEach((track) => track.stop());
        onAudioSelected(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied. You can still upload an audio file or type your query.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onAudioSelected(file);
      e.target.value = '';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      {/* Quick sample chips */}
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
          Quick Inquiries:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {SAMPLE_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="chip chip-suggestion"
              onClick={() => handleSampleClick(item.query)}
              disabled={isLoading || isTranscribing}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            id="query-input"
            className="textarea"
            rows={3}
            placeholder="Type your campus question here (e.g. fees, exam timetable, hostel, library, departments)..."
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isTranscribing}
          />
        </div>

        {/* Input Card Actions Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Audio Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!isRecording ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={startRecording}
                disabled={isLoading || isTranscribing}
                title="Record question via microphone"
              >
                <Mic size={16} color="#ef4444" />
                Record Voice
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-recording"
                onClick={stopRecording}
              >
                <MicOff size={16} />
                Stop Recording ({recordSeconds}s)
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.m4a,.ogg,.flac"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isLoading || isTranscribing || isRecording}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isTranscribing || isRecording}
              title="Upload audio clip (.wav, .mp3, .m4a)"
            >
              <Upload size={16} />
              Upload Audio
            </button>

            {isTranscribing && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#2563eb',
                  fontSize: '0.85rem',
                }}
              >
                <Loader2 size={16} className="animate-spin" />
                Transcribing with Whisper...
              </div>
            )}
          </div>

          {/* Character counter & Primary Submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              {query.length}/{maxLength}
            </span>
            <button
              type="submit"
              className="btn"
              disabled={!query.trim() || isLoading || isTranscribing}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Ask Helpdesk
                </>
              )}
            </button>
          </div>
        </div>

        {micError && (
          <div style={{ color: '#92400e', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Note: {micError}
          </div>
        )}
      </form>
    </div>
  );
};
