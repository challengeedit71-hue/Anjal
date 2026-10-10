import { useState, useRef, useCallback, useEffect } from 'react';

// SpeechRecognition interface declarations for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop audio visualizer
  const stopAudioLevelMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Start audio visualizer meter
  const startAudioLevelMeter = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch {
      // AudioContext meter is optional for visual flare
    }
  }, []);

  // Transcribe recorded audio with server-side Gemini 3.5 Transcribe
  const transcribeAudioBlob = async (blob: Blob) => {
    try {
      setIsProcessingAudio(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Data,
              mimeType: blob.type || 'audio/webm',
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Transcription failed');
          }

          const data = await response.json();
          if (data.text) {
            onTranscript(data.text);
          }
        } catch (err: any) {
          onError?.(err?.message || 'Failed to transcribe audio.');
        } finally {
          setIsProcessingAudio(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setIsProcessingAudio(false);
      onError?.(err?.message || 'Error processing audio file.');
    }
  };

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore already stopped
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }

    stopAudioLevelMeter();
    setIsListening(false);
    setInterimText('');
  }, [stopAudioLevelMeter]);

  // Start listening with graceful permission handling
  const startListening = useCallback(async () => {
    setPermissionDenied(false);

    // Check if mediaDevices is supported
    if (!navigator?.mediaDevices?.getUserMedia) {
      onError?.('Microphone recording is not supported in this browser.');
      return;
    }

    const win = window as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    try {
      // Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionDenied(false);
      startAudioLevelMeter(stream);

      if (SpeechRecognition) {
        // Use Web Speech API for real-time interactive transcription
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setInterimText('');
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              currentInterim += transcript;
            }
          }

          if (currentInterim) {
            setInterimText(currentInterim);
          }

          if (finalTranscript.trim()) {
            onTranscript(finalTranscript.trim());
            setInterimText('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          if (event.error === 'not-allowed') {
            setPermissionDenied(true);
            onError?.('Microphone permission was denied. Please allow microphone access in your browser settings to use voice features.');
            stopListening();
          } else if (event.error === 'no-speech') {
            // Keep listening, do not abort
          } else {
            stopListening();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimText('');
          stopAudioLevelMeter();
        };

        recognition.start();
      } else {
        // Fallback: Record with MediaRecorder and send to Gemini API
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            transcribeAudioBlob(audioBlob);
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.warn('Microphone access notice:', err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        String(err?.message || '').toLowerCase().includes('denied') ||
        String(err?.message || '').toLowerCase().includes('not allowed');

      if (isDenied) {
        setPermissionDenied(true);
        onError?.('Microphone permission was denied. Please allow microphone access in your browser settings to speak.');
      } else {
        onError?.(err?.message || 'Could not access microphone.');
      }
      stopListening();
    }
  }, [onError, onTranscript, startAudioLevelMeter, stopAudioLevelMeter, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isProcessingAudio,
    interimText,
    audioLevel,
    permissionDenied,
    startListening,
    stopListening,
    toggleListening,
  };
}
