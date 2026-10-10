import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isStreaming: boolean;
  onStop: () => void;
  isListening: boolean;
  isProcessingAudio: boolean;
  onToggleVoice: () => void;
  interimVoiceText?: string;
  audioLevel?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isStreaming,
  onStop,
  isListening,
  isProcessingAudio,
  onToggleVoice,
  interimVoiceText,
  audioLevel = 0,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        onSend();
      }
    }
  };

  return (
    <div className="shrink-0 p-3 bg-[#0e0e14]/95 backdrop-blur-xl border-t border-white/10 select-none">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Interim Voice Recognition Live Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-semibold text-white shrink-0">Listening:</span>
              <span className="truncate italic text-red-300">
                {interimVoiceText || 'Speak now...'}
              </span>
            </div>
            {/* Audio level meter bars */}
            <div className="flex items-end gap-0.5 h-3.5 shrink-0 pl-2">
              <div
                className="w-1 bg-red-500 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (audioLevel / 100) * 14)}px` }}
              />
              <div
                className="w-1 bg-red-500 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, ((audioLevel * 1.3) / 100) * 14)}px` }}
              />
              <div
                className="w-1 bg-red-500 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (audioLevel / 100) * 14)}px` }}
              />
            </div>
          </div>
        )}

        {/* Audio Processing Banner */}
        {isProcessingAudio && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Transcribing audio stream...</span>
          </div>
        )}

        {/* Main Input Box */}
        <div className="relative flex items-end gap-1.5 p-1.5 rounded-2xl border border-white/10 bg-[#13131b] focus-within:border-red-500/70 focus-within:ring-2 focus-within:ring-red-500/20 shadow-md transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NOVA anything..."
            className="flex-1 bg-transparent border-0 px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-36 leading-relaxed"
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isListening ? 'Stop recording' : 'Speak with microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Stop / Send Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (input.trim()) onSend();
                }}
                disabled={!input.trim()}
                className={`p-2 rounded-xl transition-all ${
                  input.trim()
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(255,30,56,0.5)]'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
