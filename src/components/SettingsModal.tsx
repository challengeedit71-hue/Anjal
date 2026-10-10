import React, { useState } from 'react';
import { X, Sliders, Volume2, Sparkles, RotateCcw, Play, Check } from 'lucide-react';
import { AssistantSettings, PersonaType } from '../types/chat';
import { AVAILABLE_VOICES, DEFAULT_SETTINGS, PERSONA_PROMPTS } from '../utils/constants';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onSave: (newSettings: AssistantSettings) => void;
  onTestVoice: (voiceName: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestVoice,
}) => {
  const [localSettings, setLocalSettings] = useState<AssistantSettings>(settings);
  const [activeTab, setActiveTab] = useState<'persona' | 'voice' | 'customization'>('persona');

  if (!isOpen) return null;

  const handlePersonaChange = (p: PersonaType) => {
    setLocalSettings((prev) => ({
      ...prev,
      persona: p,
      customSystemPrompt: p === 'custom' ? prev.customSystemPrompt : PERSONA_PROMPTS[p]?.prompt || '',
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Assistant Settings & Behavior
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure AI personality, temperature, voice persona, and behavior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('persona')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'persona'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Persona & Instructions
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'voice'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Voice & Speech
          </button>
          <button
            onClick={() => setActiveTab('customization')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'customization'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Customization Guide
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'persona' && (
            <div className="space-y-5">
              {/* Persona selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Assistant Persona
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(PERSONA_PROMPTS) as PersonaType[]).map((key) => {
                    const info = PERSONA_PROMPTS[key];
                    const isSelected = localSettings.persona === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePersonaChange(key)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {info.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {info.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom System Instruction */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  System Instructions (Prompt)
                </label>
                <textarea
                  rows={4}
                  value={
                    localSettings.persona === 'custom'
                      ? localSettings.customSystemPrompt
                      : PERSONA_PROMPTS[localSettings.persona]?.prompt || ''
                  }
                  onChange={(e) => {
                    setLocalSettings((prev) => ({
                      ...prev,
                      persona: 'custom',
                      customSystemPrompt: e.target.value,
                    }));
                  }}
                  placeholder="Provide custom instructions, response style, role guidelines, or format..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <span className="text-[11px] text-slate-400">
                  Editing this field automatically switches your persona to &quot;Custom Persona&quot;.
                </span>
              </div>

              {/* Temperature Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Creativity & Temperature ({localSettings.temperature})
                  </label>
                  <span className="text-xs text-slate-500">
                    {localSettings.temperature < 0.4
                      ? 'Precise & Deterministic'
                      : localSettings.temperature > 0.8
                      ? 'Highly Creative'
                      : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localSettings.temperature}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>0.0 (Strict / Code)</span>
                  <span>0.7 (Default)</span>
                  <span>1.0 (Inventive)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Voice Model Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Gemini Neural Voice Model (3.8 Flash Lite TTS)
                </label>
                <div className="space-y-2">
                  {AVAILABLE_VOICES.map((v) => {
                    const isSelected = localSettings.voiceName === v.id;
                    return (
                      <div
                        key={v.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                        }`}
                      >
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => setLocalSettings((prev) => ({ ...prev, voiceName: v.id as any }))}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {v.label}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {v.gender}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onTestVoice(v.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <Play className="w-3 h-3 text-indigo-500" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalSettings((prev) => ({ ...prev, voiceName: v.id as any }))}
                            className={`p-1 rounded-full ${
                              isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TTS Engine Mode */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Auto-Speak AI Responses
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.autoSpeak}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, autoSpeak: e.target.checked }))
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When enabled, Aura will automatically speak responses aloud once generation finishes.
                </p>
              </div>

              {/* Fallback Engine Option */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Text-To-Speech Engine
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocalSettings((prev) => ({ ...prev, ttsEngine: 'gemini' }))}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      localSettings.ttsEngine === 'gemini'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-semibold">Gemini Neural TTS (HD)</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      High-fidelity 24kHz studio voice via Gemini 3.8
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalSettings((prev) => ({ ...prev, ttsEngine: 'browser' }))}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      localSettings.ttsEngine === 'browser'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-semibold">Device Native Speech</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Instant zero-latency browser Web Speech synthesis
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customization' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* In-App PWA Install Option */}
              <PWAInstallButton variant="settings" />

              <div className="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Customization Map</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Here is where you can easily adapt and brand this application:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">1. Name & Branding:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Update <code className="text-indigo-500 font-mono">src/utils/constants.ts</code> (<code className="font-mono">APP_CONFIG.name</code>) and <code className="text-indigo-500 font-mono">metadata.json</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">2. Colors & Styling:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Update primary accents in <code className="text-indigo-500 font-mono">src/index.css</code> or Tailwind classes (<code className="font-mono">indigo-*</code>, <code className="font-mono">slate-*</code>) across components.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">3. AI Model & Prompts:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Update model configurations in <code className="text-indigo-500 font-mono">server.ts</code> (<code className="font-mono">gemini-3.8-flash</code>) or persona presets in <code className="text-indigo-500 font-mono">src/utils/constants.ts</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">4. Logo & Avatar:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Modify the logo icon in <code className="text-indigo-500 font-mono">src/components/Header.tsx</code> and <code className="text-indigo-500 font-mono">src/components/Sidebar.tsx</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
