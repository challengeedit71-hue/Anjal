import React, { useState } from 'react';
import {
  AssistantSettings,
  ActiveScreen,
  UserProfile,
  LanguageMode,
} from '../types/chat';
import { AVAILABLE_VOICES, PERSONA_PROMPTS } from '../utils/constants';
import {
  ArrowLeft,
  User,
  Sliders,
  Radio,
  Volume2,
  Languages,
  Trash2,
  Cpu,
  Shield,
  Smartphone,
  ExternalLink,
  Vibrate,
  Sparkles,
  Check,
  Phone,
  MessageCircle,
  Camera,
  Mic,
  Users,
  Folder,
  Bell,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { AppUpdateModal } from './AppUpdateModal';

interface SettingsScreenProps {
  settings: AssistantSettings;
  onUpdateSettings: (updater: (prev: AssistantSettings) => AssistantSettings) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onClearHistory: () => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  onClearHistory,
  onOpenAuth,
  onBack,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase">
            Aura Control & Settings
          </h1>
          <p className="text-xs text-slate-400">System parameters and neural configuration</p>
        </div>
      </div>

      {/* 1. Profile Card */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/60 overflow-hidden bg-slate-800">
            <img
              src={settings.profile.avatar}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>{settings.profile.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ff1e38]" />
            </div>
            <div className="text-xs text-slate-400">{settings.profile.email}</div>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
        >
          Switch
        </button>
      </div>

      {/* 2. Visual Identity & Launcher Core (Matches Screenshot 3) */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Visual Identity
        </h2>
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-3">
          <div className="text-xs font-semibold text-white mb-2">Launcher Core Identity</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'default', label: 'Default', border: 'border-purple-500' },
              { id: 'auraRed', label: 'Aura Red', border: 'border-red-500' },
              { id: 'midnight', label: 'Midnight', border: 'border-slate-500' },
            ].map((theme) => {
              const isSelected = settings.profile.themeStyle === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, themeStyle: theme.id as any },
                    }));
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-red-500/20 border-red-500 text-white shadow-md'
                      : 'bg-[#181824] border-white/5 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg mb-1 flex items-center justify-center bg-gradient-to-tr from-black to-red-950 border ${theme.border}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ff1e38]" />
                  </div>
                  <span className="text-[11px] font-medium">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aura Signature link */}
        <button
          onClick={() => onNavigate('orb-custom')}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Radio className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-xs font-semibold text-white">Aura Signature</div>
              <div className="text-[10px] text-slate-400">
                Current: {settings.orb.color.toUpperCase()} • {settings.orb.orbType.toUpperCase()}
              </div>
            </div>
          </div>
          <Sliders className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 3. AI Providers & Connectors */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          AI & Connectors
        </h2>

        <button
          onClick={() => onNavigate('connectors')}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all text-left mb-2"
        >
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-xs font-semibold text-white">Model Connectors</div>
              <div className="text-[10px] text-slate-400">
                Gemini, Groq, OpenAI, Claude, Perplexity
              </div>
            </div>
          </div>
          <span className="text-xs text-red-400 font-semibold flex items-center space-x-1">
            <span>Manage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Persona Selector */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Assistant Persona Protocol
          </label>
          <select
            value={settings.persona}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                persona: e.target.value as any,
              }))
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            {Object.entries(PERSONA_PROMPTS).map(([key, val]) => (
              <option key={key} value={key} className="bg-[#14141e]">
                {val.name} ({val.description.slice(0, 32)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Voice & Language Controls */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Voice & Language
        </h2>

        {/* Language Selection */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1">
            <Languages className="w-3.5 h-3.5 text-red-400" />
            <span>Default Response Language</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['english', 'hinglish', 'hindi'] as LanguageMode[]).map((lang) => {
              const isSelected = settings.language === lang;
              return (
                <button
                  key={lang}
                  onClick={() =>
                    onUpdateSettings((prev) => ({ ...prev, language: lang }))
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-black/30 border border-white/5 text-slate-400'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Neural Voice Selection */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice Timber</span>
          </label>
          <select
            value={settings.voiceName}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                voiceName: e.target.value as any,
              }))
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            {AVAILABLE_VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#14141e]">
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-slate-300">Auto-speak assistant replies</span>
          <button
            onClick={() =>
              onUpdateSettings((prev) => ({
                ...prev,
                autoSpeak: !prev.autoSpeak,
              }))
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.autoSpeak ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.autoSpeak ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Phone Access & System Permissions (Requested by User) */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-red-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Phone Access & Permissions
            </h2>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              settings.phoneAccess?.enabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            {settings.phoneAccess?.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Allows AK Editor Amit to execute voice commands for launching apps, dialing calls, sending WhatsApp messages, and accessing hardware.
        </p>

        {/* Master ON/OFF Toggle */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-white">Full Phone Access</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Master control for hardware actions & app intents
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                phoneAccess: {
                  ...prev.phoneAccess,
                  enabled: !prev.phoneAccess?.enabled,
                },
              }));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.phoneAccess?.enabled ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.phoneAccess?.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Siri-Style "Hey Angel" Wake Word Toggle */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/30 to-black/40 border border-red-500/20 flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>'Hey Angel' Wake Word</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">Siri-Style</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Voice activation upon hearing "Hey Angel" or "Angel"
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings((prev) => ({
                ...prev,
                phoneAccess: {
                  ...prev.phoneAccess,
                  wakeWordEnabled: !prev.phoneAccess?.wakeWordEnabled,
                },
              }));
            }}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.phoneAccess?.wakeWordEnabled ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.phoneAccess?.wakeWordEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Permissions Status List */}
        <div className="space-y-2 mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Essential Android Permissions</span>
            <span className="text-[10px] text-emerald-400 font-mono">All Legitimate APIs</span>
          </div>

          {[
            {
              id: 'allowCallPhone',
              name: 'Phone Calls & Dialer',
              permission: 'android.permission.CALL_PHONE',
              icon: Phone,
              desc: 'Dial contacts & phone numbers via tel: intent',
              enabled: settings.phoneAccess?.allowCallPhone,
            },
            {
              id: 'allowWhatsApp',
              name: 'WhatsApp & Messaging',
              permission: 'android.permission.SEND_SMS',
              icon: MessageCircle,
              desc: 'Send WhatsApp texts and SMS messages',
              enabled: settings.phoneAccess?.allowWhatsApp,
            },
            {
              id: 'allowCamera',
              name: 'Camera & Vision Sensor',
              permission: 'android.permission.CAMERA',
              icon: Camera,
              desc: 'Capture photos, OCR, and multimodal scene analysis',
              enabled: settings.phoneAccess?.allowCamera,
            },
            {
              id: 'allowAppsLaunch',
              name: 'App Launcher Engine',
              permission: 'android.permission.QUERY_ALL_PACKAGES',
              icon: Smartphone,
              desc: 'Open installed apps (YouTube, Maps, Instagram, etc.)',
              enabled: settings.phoneAccess?.allowAppsLaunch,
            },
            {
              id: 'allowContacts',
              name: 'Contacts Access',
              permission: 'android.permission.READ_CONTACTS',
              icon: Users,
              desc: 'Identify contacts for voice dialing & messaging',
              enabled: settings.phoneAccess?.allowContacts,
            },
            {
              id: 'allowNotifications',
              name: 'System Notifications',
              permission: 'android.permission.POST_NOTIFICATIONS',
              icon: Bell,
              desc: 'Receive assistant reminders and speech alerts',
              enabled: settings.phoneAccess?.allowNotifications,
            },
          ].map((perm) => {
            const Icon = perm.icon;
            return (
              <div
                key={perm.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center space-x-1.5">
                      <span>{perm.name}</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Granted</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {perm.permission}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!settings.phoneAccess?.enabled}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings((prev) => ({
                      ...prev,
                      phoneAccess: {
                        ...prev.phoneAccess,
                        [perm.id]: !prev.phoneAccess?.[perm.id as keyof typeof prev.phoneAccess],
                      },
                    }));
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 disabled:opacity-30 ${
                    perm.enabled && settings.phoneAccess?.enabled
                      ? 'bg-red-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      perm.enabled && settings.phoneAccess?.enabled
                        ? 'translate-x-4'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Anti-Hacking Sandbox Notice */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start space-x-2.5 text-xs text-emerald-300 mb-3">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <p className="leading-relaxed text-[11px] text-slate-300">
            <strong className="text-emerald-400">Security Architecture:</strong> AK Editor Amit operates exclusively within standard Android Intent protocols. It launches applications, dials phone numbers, and activates camera sensors upon your voice command. Protected lockscreen credentials and passwords remain encrypted and secure.
          </p>
        </div>

        {/* Quick Launch Phone Actions */}
        <button
          onClick={() => onNavigate('phone-actions')}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition-all"
        >
          <span>Open Phone Actions & Dialer Hub</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 6. Android App Installation & Native APK Hub */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-[#14141e] border border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Install App to Android & Native APK</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-mono">
            Install Ready
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          App: <strong>AK Editor Amit</strong> (Package: <code className="text-red-400 font-mono">com.akeditoramit.aiassistant</code>). Install directly to your Android device home screen, or export complete Kotlin &amp; Jetpack Compose source code with APK build scripts.
        </p>
        <button
          onClick={() => onNavigate('android-project')}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow active:scale-95 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install to Android / View APK Project</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Chat History Management */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Data & Storage
        </h2>
        {showClearConfirm ? (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40">
            <p className="text-xs text-red-300 mb-3">
              Are you sure? This will permanently delete all stored local conversations.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-red-950/30 hover:border-red-500/30 border border-white/5 text-xs font-medium text-red-400 flex items-center justify-center space-x-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Local Conversation History</span>
          </button>
        )}
      </div>

      {/* 7. Software Updates & Version */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-white text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>App Updates & System Sync</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-mono font-bold">
            v2.4.0
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Check for new versions, refresh cached modules, and sync the latest voice features and phone skins.
        </p>
        <button
          onClick={() => {
            triggerHaptic();
            setShowUpdateModal(true);
          }}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check for Updates (v2.4.0)</span>
        </button>
      </div>

      {/* Developer & System Branding Footer */}
      <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
        <div className="text-slate-300 font-bold tracking-wide">
          AK Editor Amit • Intelligent Voice Assistant
        </div>
        <div>Developer: AK Editor Amit | Version: 2.4.0</div>
        <div>Powered by Google Gemini 3.8 Flash & Android Intents</div>
      </div>

      {/* App Update Modal */}
      <AppUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />
    </div>
  );
};
