import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Sliders,
  Square,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AssistantSettings } from '../types/chat';
import { PERSONA_PROMPTS } from '../utils/constants';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  onRenameTitle: (newTitle: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  settings: AssistantSettings;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title,
  onRenameTitle,
  isStreaming,
  onStopStreaming,
  onClearChat,
  onOpenSettings,
  settings,
  theme,
  onToggleTheme,
  isSpeaking,
  onStopSpeaking,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onRenameTitle(tempTitle.trim());
    }
    setIsEditing(false);
  };

  const personaLabel = PERSONA_PROMPTS[settings.persona]?.name || 'Helpful Assistant';

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-20">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Open chat sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex items-center gap-2">
          {isEditing ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  if (tempTitle.trim()) onRenameTitle(tempTitle.trim());
                  setIsEditing(false);
                }}
                className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded border border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </form>
          ) : (
            <h1
              onClick={() => {
                setTempTitle(title);
                setIsEditing(true);
              }}
              className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Click to rename"
            >
              {title || 'New Conversation'}
            </h1>
          )}

          {/* Persona badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
            <span>{personaLabel}</span>
          </span>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Active Speech Indicator & Stop speech */}
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 animate-pulse transition-colors"
            title="Stop voice audio"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Speaking...</span>
            <VolumeX className="w-3 h-3 ml-0.5 text-slate-400" />
          </button>
        )}

        {/* Streaming Stop Button */}
        {isStreaming && (
          <button
            onClick={onStopStreaming}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 transition-colors cursor-pointer"
            title="Stop AI generation"
          >
            <Square className="w-3 h-3 fill-rose-600 dark:fill-rose-400" />
            <span>Stop Generating</span>
          </button>
        )}

        {/* Clear Current Chat Button */}
        <button
          onClick={onClearChat}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1"
          title="Clear current conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>

        {/* In-App Install App Button */}
        <PWAInstallButton variant="header" />

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings & Persona"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>
    </header>
  );
};
