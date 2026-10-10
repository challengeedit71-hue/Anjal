import React, { useState } from 'react';
import { SiriWaveform } from './SiriWaveform';
import { NovaOrb } from './NovaOrb';
import { OrbState, OrbSettings } from '../types/chat';
import {
  Mic,
  X,
  Volume2,
  VolumeX,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FloatingAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  orbState: OrbState;
  orbSettings: OrbSettings;
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  lastResponse?: string;
  actionFeedback?: string | null;
  onTriggerVoice: () => void;
  onStopSpeaking?: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export const FloatingAssistantOverlay: React.FC<FloatingAssistantOverlayProps> = ({
  isOpen,
  onClose,
  orbState,
  orbSettings,
  audioLevel,
  isListening,
  isSpeaking,
  lastResponse,
  actionFeedback,
  onTriggerVoice,
  onStopSpeaking,
  onExecuteCommand,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  // Minimized Floating Bubble View (stays in bottom corner like Messenger / Siri Bubble)
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex items-center space-x-2 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="relative group p-1 rounded-full bg-black/90 border border-red-500/50 shadow-[0_0_20px_rgba(255,30,56,0.6)] backdrop-blur-md active:scale-95 transition-transform"
          title="Angel Voice Assistant Active (Tap to expand)"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-inner">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
        </button>
      </div>
    );
  }

  // Expanded Floating HUD (Apple Siri / Google Assistant floating card)
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 max-w-md mx-auto select-none pointer-events-auto animate-slideUp">
      <div className="bg-[#101018]/95 border border-red-500/50 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-red-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff1e38] animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Siri & Angel Background Assistant
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-white/5"
            >
              Minimize
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className="mt-2.5 p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 font-medium flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Waveform / Voice Animation */}
        <div className="my-3 flex flex-col items-center">
          <SiriWaveform
            isActive={isListening || isSpeaking || orbState === 'listening'}
            audioLevel={audioLevel}
            color={orbSettings.color}
            height={36}
          />

          <div className="mt-1 text-[11px] font-semibold text-slate-300">
            {isListening
              ? 'Listening... Speak now'
              : isSpeaking
              ? 'Speaking response...'
              : 'Say "Hey Siri" or "Hey Angel"'}
          </div>
        </div>

        {/* Response snippet if present */}
        {lastResponse && (
          <div className="text-xs text-slate-200 max-h-24 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/5 mb-3">
            {lastResponse.slice(0, 180)}...
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
          <button
            onClick={() => onExecuteCommand('Hey Siri open Instagram')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-medium truncate"
          >
            📸 Instagram
          </button>
          <button
            onClick={() => onExecuteCommand('Hey Siri open Telegram')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-medium truncate"
          >
            ✈️ Telegram
          </button>
          <button
            onClick={() => onExecuteCommand('Call the Angel Amit')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-medium truncate"
          >
            📞 Call Amit
          </button>
          <button
            onClick={() => onExecuteCommand('Open WhatsApp')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-medium truncate"
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
