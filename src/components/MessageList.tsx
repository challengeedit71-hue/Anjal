import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle,
  ArrowDown,
  Loader2,
  Flame,
} from 'lucide-react';
import { Message, QuickPrompt } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { QUICK_PROMPTS } from '../utils/constants';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onSendPrompt: (text: string) => void;
  onSpeak: (text: string, messageId: string) => void;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  isLoadingAudio: boolean;
  onRetry: (messageIndex: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  onSendPrompt,
  onSpeak,
  isSpeaking,
  speakingMessageId,
  isLoadingAudio,
  onRetry,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll on new messages or streaming changes
  useEffect(() => {
    if (!showScrollBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, showScrollBottom]);

  // Monitor scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setShowScrollBottom(false);
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  // Empty state if no messages
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center select-none">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/25 ring-4 ring-red-950/40">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
              NOVA Conversational Core
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
              Powered by Google Gemini 3.8. Ask questions, analyze code, translate Hinglish, or speak in natural voice.
            </p>
          </div>

          {/* Quick Starters */}
          <div className="grid grid-cols-1 gap-2 pt-2 text-left">
            {QUICK_PROMPTS.map((qp: QuickPrompt) => (
              <button
                key={qp.id}
                onClick={() => onSendPrompt(qp.prompt)}
                className="p-3 rounded-2xl border border-white/5 bg-[#14141e] hover:border-red-500/50 hover:bg-[#181824] transition-all group text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-red-400 mb-0.5 flex items-center justify-between">
                  <span>{qp.title}</span>
                  <span className="text-[10px] text-slate-500">→</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {qp.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 relative"
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isCurrentlySpeaking = isSpeaking && speakingMessageId === msg.id;
          const isAudioLoadingForMsg = isLoadingAudio && speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                </div>
              )}

              {/* Message Content Container */}
              <div
                className={`group relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-tr-xs shadow-md shadow-red-950/40'
                    : 'bg-[#14141e] border border-white/10 text-slate-100 rounded-tl-xs shadow-md'
                }`}
              >
                {/* Error Banner */}
                {msg.error ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{msg.errorMessage || 'Failed to generate response'}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {msg.content || 'An error occurred while communicating with the AI service.'}
                    </p>
                    <button
                      onClick={() => onRetry(index)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-500/30 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : isUser ? (
                  /* User message text */
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-sans">
                    {msg.content}
                  </div>
                ) : (
                  /* Assistant message formatted with markdown */
                  <div>
                    {msg.content ? (
                      <div className="text-xs sm:text-sm">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    ) : (
                      /* Initial Typing Indicator */
                      <div className="flex items-center gap-1.5 py-2 px-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot-1" />
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot-2" />
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot-3" />
                        <span className="text-xs text-slate-400 ml-2 font-mono">
                          Synthesizing...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Strip for Assistant */}
                {!isUser && !msg.error && msg.content && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      {/* Copy message button */}
                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        className="p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Text to Speech button */}
                      <button
                        onClick={() => onSpeak(msg.content, msg.id)}
                        disabled={isAudioLoadingForMsg}
                        className={`p-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors ${
                          isCurrentlySpeaking ? 'text-red-400 font-semibold' : ''
                        }`}
                        title={isCurrentlySpeaking ? 'Stop speech' : 'Listen to response'}
                      >
                        {isAudioLoadingForMsg ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                        ) : isCurrentlySpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-30 p-2.5 rounded-full bg-[#1e1e2d] text-white shadow-xl border border-white/20 hover:bg-red-600 transition-all cursor-pointer"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
