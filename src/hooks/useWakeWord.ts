import { useEffect, useRef, useState, useCallback } from 'react';
import { detectWakeWord } from '../services/voiceCommandService';

interface UseWakeWordProps {
  enabled: boolean;
  onWakeWordDetected: (command: string) => void;
  isMainVoiceActive: boolean;
}

export function useWakeWord({
  enabled,
  onWakeWordDetected,
  isMainVoiceActive,
}: UseWakeWordProps) {
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [standbyDataBytes, setStandbyDataBytes] = useState(0); // Remains 0 during offline on-device listening
  const [lastDetectedPhrase, setLastDetectedPhrase] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const enabledRef = useRef(enabled);
  const isMainVoiceActiveRef = useRef(isMainVoiceActive);
  const wakeLockSentinelRef = useRef<any>(null);
  const audioContextKeepAliveRef = useRef<AudioContext | null>(null);

  enabledRef.current = enabled;
  isMainVoiceActiveRef.current = isMainVoiceActive;

  // Request Screen Wake Lock so phone doesn't sleep while on desk
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockSentinelRef.current) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        wakeLockSentinelRef.current = sentinel;
        setWakeLockActive(true);

        sentinel.addEventListener('release', () => {
          wakeLockSentinelRef.current = null;
          setWakeLockActive(false);
        });
      }
    } catch {
      setWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch {
        // Ignore
      }
      wakeLockSentinelRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  // Background audio keep-alive to prevent OS from killing microphone worker
  const startAudioKeepAlive = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !audioContextKeepAliveRef.current) {
        const ctx = new AudioCtx();
        audioContextKeepAliveRef.current = ctx;

        // Silent oscillator loop to keep audio thread alive
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001; // virtually inaudible keep-alive
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      }
    } catch {
      // Ignore
    }
  }, []);

  const stopAudioKeepAlive = useCallback(() => {
    if (audioContextKeepAliveRef.current) {
      try {
        audioContextKeepAliveRef.current.close();
      } catch {
        // Ignore
      }
      audioContextKeepAliveRef.current = null;
    }
  }, []);

  const startHotwordListener = useCallback(() => {
    if (!enabledRef.current || isMainVoiceActiveRef.current) {
      return;
    }

    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    // Keep screen and audio thread alive
    requestWakeLock();
    startAudioKeepAlive();

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      // Use device default/multilingual recognition
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        setIsWakeWordListening(true);
      };

      recognition.onresult = (event: any) => {
        // Offline on-device processing: 0 bytes sent to external network
        setStandbyDataBytes(0);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const { detected, cleanCommand } = detectWakeWord(transcript);

          if (detected) {
            setLastDetectedPhrase(transcript);
            try {
              recognition.stop();
            } catch {
              // Ignore
            }
            setIsWakeWordListening(false);
            onWakeWordDetected(cleanCommand);
            return;
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setIsWakeWordListening(false);
        }
      };

      recognition.onend = () => {
        setIsWakeWordListening(false);
        // Automatically restart listener if still enabled and main voice isn't busy
        if (enabledRef.current && !isMainVoiceActiveRef.current) {
          setTimeout(() => {
            if (enabledRef.current && !isMainVoiceActiveRef.current) {
              try {
                recognition.start();
              } catch {
                // Ignore
              }
            }
          }, 500);
        }
      };

      recognition.start();
    } catch {
      setIsWakeWordListening(false);
    }
  }, [onWakeWordDetected, requestWakeLock, startAudioKeepAlive]);

  const stopHotwordListener = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsWakeWordListening(false);
    releaseWakeLock();
    stopAudioKeepAlive();
  }, [releaseWakeLock, stopAudioKeepAlive]);

  useEffect(() => {
    if (enabled && !isMainVoiceActive) {
      startHotwordListener();
    } else {
      stopHotwordListener();
    }

    return () => {
      stopHotwordListener();
    };
  }, [enabled, isMainVoiceActive, startHotwordListener, stopHotwordListener]);

  return {
    isWakeWordListening,
    wakeLockActive,
    standbyDataBytes,
    lastDetectedPhrase,
    startHotwordListener,
    stopHotwordListener,
    requestWakeLock,
  };
}
