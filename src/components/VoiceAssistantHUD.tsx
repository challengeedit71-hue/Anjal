import React, { useState } from 'react';
import { NovaOrb } from './NovaOrb';
import { SiriWaveform } from './SiriWaveform';
import { OrbState, OrbSettings, LanguageMode } from '../types/chat';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Zap,
  Send,
  AlertTriangle,
  RefreshCw,
  Phone,
  MessageCircle,
  Camera,
  Smartphone,
} from 'lucide-react';

interface VoiceAssistantHUDProps {
  orbState: OrbState;
  orbSettings: OrbSettings;
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  permissionDenied?: boolean;
  transcript: string;
  assistantResponse: string;
  language: LanguageMode;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onRepeatSpeaking: () => void;
  onChangeLanguage: (lang: LanguageMode) => void;
  onSendTextPrompt?: (prompt: string) => void;
  onClose: () => void;
}

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
  orbState,
  orbSettings,
  audioLevel,
  isListening,
  isSpeaking,
  permissionDenied = false,
  transcript,
  assistantResponse,
  language,
  onToggleListening,
  onStopSpeaking,
  onRepeatSpeaking,
  onChangeLanguage,
  onSendTextPrompt,
  onClose,
}) => {
  const [hudInput, setHudInput] = useState('');

  const handleHudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hudInput.trim()) return;
    onSendTextPrompt?.(hudInput.trim());
    setHudInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07070a]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ff1e38] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
            NOVA NEURAL HUD
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 text-xs">
            {(['english', 'hinglish', 'hindi'] as LanguageMode[]).map((l) => (
              <button
                key={l}
                onClick={() => onChangeLanguage(l)}
                className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-semibold tracking-wider transition-all ${
                  language === l
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            aria-label="Exit voice mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Centerpiece: Massive Reactive AI Orb */}
      <div className="flex flex-col items-center justify-center my-auto">
        <NovaOrb
          state={permissionDenied ? 'error' : orbState}
          settings={orbSettings}
          audioLevel={audioLevel}
          onClick={onToggleListening}
          className="scale-110 sm:scale-125 cursor-pointer"
        />

        {/* Dynamic Status / Subtitles */}
        <div className="mt-6 max-w-md w-full text-center px-4">
          {permissionDenied ? (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-left space-y-2.5 animate-fadeIn">
              <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Microphone Permission Required</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Microphone access was blocked. Tap the lock icon in your browser address bar to allow microphone access, or tap below to re-request.
              </p>
              <button
                onClick={onToggleListening}
                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Grant Microphone Permission</span>
              </button>
            </div>
          ) : isListening ? (
            <div className="space-y-2">
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Microphone Open • Speak Now</span>
              </span>
              <p className="text-base sm:text-lg font-medium text-white italic drop-shadow-md min-h-[3rem]">
                "{transcript || 'Listening for your voice...'}"
              </p>
            </div>
          ) : isSpeaking ? (
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-center space-x-1.5">
                <Volume2 className="w-4 h-4 animate-pulse text-cyan-400" />
                <span>NOVA Speaking</span>
              </span>
              <p className="text-xs sm:text-sm font-normal text-slate-200 line-clamp-4 overflow-hidden">
                {assistantResponse}
              </p>
            </div>
          ) : orbState === 'processing' ? (
            <div className="space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center justify-center space-x-1.5 animate-pulse">
                <Zap className="w-4 h-4" />
                <span>Synthesizing neural response...</span>
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Voice Assistant Standby
              </span>
              <p className="text-xs sm:text-sm text-slate-400">
                Tap the orb or the mic button below to speak
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col items-center space-y-3 max-w-md w-full mx-auto">
        {/* Quick Text Input inside HUD (Fallback if mic is muted or denied) */}
        <form onSubmit={handleHudSubmit} className="w-full">
          <div className="flex items-center bg-[#13131b] border border-white/10 rounded-2xl p-1.5 focus-within:border-red-500/70 shadow-lg">
            <input
              type="text"
              value={hudInput}
              onChange={(e) => setHudInput(e.target.value)}
              placeholder="Or type here to hear NOVA speak..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!hudInput.trim()}
              className="p-2 rounded-xl bg-red-600 disabled:opacity-30 text-white hover:bg-red-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Siri Glowing Waveform Canvas */}
        <div className="w-full max-w-sm my-1">
          <SiriWaveform
            isActive={isListening || isSpeaking || orbState === 'processing'}
            audioLevel={audioLevel}
            color={orbSettings.color}
            height={60}
          />
        </div>

        {/* Quick Voice Command Suggestion Chips */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 py-1">
          {[
            { label: 'Call 9876543210', icon: Phone },
            { label: 'Open WhatsApp', icon: MessageCircle },
            { label: 'Open Camera', icon: Camera },
            { label: 'Check Gmail', icon: Smartphone },
          ].map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.label}
                onClick={() => onSendTextPrompt?.(cmd.label)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[10px] text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <Icon className="w-3 h-3 text-red-400" />
                <span>"{cmd.label}"</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-6">
          {/* Repeat Speaking Button */}
          <button
            onClick={onRepeatSpeaking}
            disabled={!assistantResponse}
            className="p-3.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 transition-colors"
            title="Repeat response"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Main Push to Talk Mic Button */}
          <button
            onClick={onToggleListening}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
              isListening
                ? 'bg-red-600 shadow-[0_0_30px_rgba(255,30,56,0.9)] ring-4 ring-red-400/30'
                : permissionDenied
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/10 border border-white/20 hover:bg-red-600/80 text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : permissionDenied ? (
              <RefreshCw className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Stop / Interrupt Speaking Button */}
          <button
            onClick={onStopSpeaking}
            disabled={!isSpeaking}
            className="p-3.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 transition-colors"
            title="Stop speaking"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
