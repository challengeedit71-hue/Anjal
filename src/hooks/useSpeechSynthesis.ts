import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseSpeechSynthesisProps {
  voiceName?: string;
  engine?: 'gemini' | 'browser';
  onError?: (err: string) => void;
}

export function useSpeechSynthesis({
  voiceName = 'Kore',
  engine = 'gemini',
  onError,
}: UseSpeechSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop any active speech
  const stop = useCallback(() => {
    // Abort pending fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop HTML5 audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }

    // Stop browser speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoadingAudio(false);
    setSpeakingMessageId(null);
  }, []);

  // Speak using browser Web Speech API
  const speakWithBrowser = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onError?.('Speech synthesis is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();

      // Clean markdown code blocks for speech
      const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.').replace(/[#*_`]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (messageId) setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [onError]
  );

  const clientCooldownUntilRef = useRef<number>(0);

  // Speak using Gemini Neural TTS
  const speakWithGemini = useCallback(
    async (text: string, messageId: string) => {
      stop();

      // Check if client is currently in cooldown from a 429 quota limit
      if (Date.now() < clientCooldownUntilRef.current) {
        speakWithBrowser(text, messageId);
        return;
      }

      // Check cache first
      const cachedUrl = audioCacheRef.current.get(messageId);
      if (cachedUrl) {
        try {
          const audio = new Audio(cachedUrl);
          audioElementRef.current = audio;
          setIsSpeaking(true);
          setSpeakingMessageId(messageId);

          audio.onended = () => {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
          };

          await audio.play();
          return;
        } catch {
          // Fall through to re-fetching if cached playback fails
        }
      }

      setIsLoadingAudio(true);
      if (messageId) setSpeakingMessageId(messageId);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: voiceName,
          }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (data.fallbackToBrowser || !data.audio) {
          if (data.fallbackToBrowser) {
            clientCooldownUntilRef.current = Date.now() + 60000;
          }
          setIsLoadingAudio(false);
          speakWithBrowser(text, messageId);
          return;
        }

        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        audioCacheRef.current.set(messageId, audioUrl);

        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          speakWithBrowser(text, messageId);
        };

        setIsLoadingAudio(false);
        setIsSpeaking(true);
        await audio.play();
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setIsLoadingAudio(false);
        clientCooldownUntilRef.current = Date.now() + 60000;
        // Fallback to browser voice so the user always hears audio seamlessly
        speakWithBrowser(text, messageId);
      }
    },
    [speakWithBrowser, stop, voiceName]
  );

  const speak = useCallback(
    (text: string, messageId: string) => {
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
        return;
      }

      if (engine === 'browser') {
        speakWithBrowser(text, messageId);
      } else {
        speakWithGemini(text, messageId);
      }
    },
    [engine, isSpeaking, speakWithBrowser, speakWithGemini, speakingMessageId, stop]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSpeaking,
    speakingMessageId,
    isLoadingAudio,
    speak,
    stop,
  };
}
