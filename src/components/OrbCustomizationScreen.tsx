import React from 'react';
import { NovaOrb } from './NovaOrb';
import { OrbSettings, OrbType, OrbColor } from '../types/chat';
import { ArrowLeft, Check, Sparkles, Volume2, Vibrate, Shield } from 'lucide-react';

interface OrbCustomizationScreenProps {
  settings: OrbSettings;
  onUpdateSettings: (updater: (prev: OrbSettings) => OrbSettings) => void;
  onBack: () => void;
}

export const OrbCustomizationScreen: React.FC<OrbCustomizationScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const orbTypes: { id: OrbType; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'energy', label: 'Energy' },
    { id: 'neon', label: 'Neon' },
    { id: 'quantum', label: 'Quantum' },
    { id: 'solar', label: 'Solar' },
  ];

  const colorOptions: { id: OrbColor; name: string; hex: string }[] = [
    { id: 'crimson', name: 'Crimson Aura', hex: '#ff1e38' },
    { id: 'blue', name: 'Cyber Cyan', hex: '#00d2ff' },
    { id: 'emerald', name: 'Matrix Green', hex: '#00ff88' },
    { id: 'purple', name: 'Void Purple', hex: '#b02aef' },
    { id: 'solar', name: 'Solar Amber', hex: '#ff9900' },
  ];

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(35);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase">
            Orb Customization
          </h1>
          <p className="text-xs text-slate-400">Personalize AI core visual presence</p>
        </div>
      </div>

      {/* Live Preview Box (Matching Screenshot 4) */}
      <div className="relative my-4 p-6 rounded-3xl bg-[#0d0d14] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-radial from-white/[0.03] to-transparent pointer-events-none" />
        <NovaOrb
          state="idle"
          settings={settings}
          audioLevel={settings.voiceVisualizer ? 35 : 0}
          interactive={false}
          className="scale-95"
        />
        <div className="absolute bottom-3 right-4 text-[10px] uppercase font-mono tracking-wider text-slate-500">
          Live Core Rendering
        </div>
      </div>

      {/* 1. Orb Type Selection */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Orb Type
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {orbTypes.map((t) => {
            const isSelected = settings.orbType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  triggerHaptic();
                  onUpdateSettings((prev) => ({ ...prev, orbType: t.id }));
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(255,30,56,0.6)]'
                    : 'bg-[#14141e] text-slate-300 border border-white/5 hover:border-white/20'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Signature Selection */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Aura Signature Color
        </label>
        <div className="flex items-center space-x-3 overflow-x-auto pb-1">
          {colorOptions.map((c) => {
            const isSelected = settings.color === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  triggerHaptic();
                  onUpdateSettings((prev) => ({ ...prev, color: c.id }));
                }}
                className={`flex items-center space-x-2 py-2 px-3 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white/10 border-white/40 text-white shadow-md'
                    : 'bg-[#14141e] border-white/5 text-slate-400 hover:border-white/15'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px]"
                  style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}` }}
                />
                <span>{c.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Adjust Orb Size Slider */}
      <div className="mb-5 p-3.5 rounded-2xl bg-[#14141e] border border-white/5">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300">Adjust Orb Size</span>
          <span className="text-red-400 font-mono">
            {Math.round(settings.size * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.05"
          value={settings.size}
          onChange={(e) =>
            onUpdateSettings((prev) => ({
              ...prev,
              size: parseFloat(e.target.value),
            }))
          }
          className="w-full accent-red-500 cursor-pointer"
        />
      </div>

      {/* 4. System Presence Toggles (Matching Screenshot 4) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          System Presence
        </h3>

        {/* Aura Border Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5">
          <div className="pr-4">
            <div className="text-sm font-semibold text-white">Aura Border Mode</div>
            <div className="text-xs text-slate-400">
              Shows a rotating perimeter aura border instead of central orb
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                auraBorderMode: !prev.auraBorderMode,
              }));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.auraBorderMode ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.auraBorderMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Voice Visualizer */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5">
          <div className="pr-4">
            <div className="text-sm font-semibold text-white">Voice Visualizer</div>
            <div className="text-xs text-slate-400">
              Show reactive audio spectrum rings on home screen
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                voiceVisualizer: !prev.voiceVisualizer,
              }));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.voiceVisualizer ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.voiceVisualizer ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Particle Effects */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5">
          <div className="pr-4">
            <div className="text-sm font-semibold text-white">Particle Sparks</div>
            <div className="text-xs text-slate-400">
              Floating energy particles orbiting the neural core
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                particleEffects: !prev.particleEffects,
              }));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.particleEffects ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.particleEffects ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Haptic Feedback */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5">
          <div className="pr-4">
            <div className="text-sm font-semibold text-white">Haptic Feedback</div>
            <div className="text-xs text-slate-400">Sensible physical vibrations on touch</div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                hapticFeedback: !prev.hapticFeedback,
              }));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.hapticFeedback ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
