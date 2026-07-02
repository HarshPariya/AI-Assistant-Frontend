import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to use Voice AI.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled && !isRecording}
      className={`p-2 rounded-xl transition-all flex items-center justify-center ${
        isRecording 
          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse" 
          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
      } ${disabled && !isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isRecording ? "Stop Recording" : "Start Voice Input"}
    >
      {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
    </button>
  );
}
