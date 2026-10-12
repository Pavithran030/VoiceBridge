import React, { useState, useRef } from 'react';
import { Mic, MicOff, Upload, FileAudio, Loader2 } from 'lucide-react';

interface AudioUploaderProps {
  onAudioSelected: (file: File) => void;
  isTranscribing: boolean;
  supportedFormats?: string[];
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onAudioSelected,
  isTranscribing,
  supportedFormats = ['.wav', '.mp3', '.m4a', '.ogg', '.flac'],
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser environment.');
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
        const audioFile = new File([audioBlob], `mic_recording_${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        // Stop all audio tracks
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
      setMicError(err.message || 'Microphone access denied or unavailable.');
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
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="card" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="card-title">
        <FileAudio size={20} />
        Or Speak / Upload Audio Query
      </div>
      <div className="card-subtitle">
        Record via microphone or upload an audio clip ({supportedFormats.join(', ')}).
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Microphone record button */}
        {!isRecording ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={startRecording}
            disabled={isTranscribing}
          >
            <Mic size={18} color="#ef4444" />
            Start Voice Recording
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={stopRecording}
          >
            <MicOff size={18} />
            Stop Recording ({recordSeconds}s)
          </button>
        )}

        {/* File upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isTranscribing || isRecording}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTranscribing || isRecording}
        >
          <Upload size={18} />
          Choose Audio File
        </button>

        {isTranscribing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-light)', fontSize: '0.9rem' }}>
            <Loader2 size={18} className="animate-spin" />
            Transcribing speech using local Whisper...
          </div>
        )}
      </div>

      {micError && (
        <div style={{ color: 'var(--warning-text)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
          Notice: {micError} (Please use the file upload option instead).
        </div>
      )}
    </div>
  );
};
