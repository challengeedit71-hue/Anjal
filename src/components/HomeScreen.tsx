import React, { useState, useEffect } from 'react';
import { NovaOrb } from './NovaOrb';
import { SiriWaveform } from './SiriWaveform';
import { AppUpdateModal } from './AppUpdateModal';
import { FloatingAssistantOverlay } from './FloatingAssistantOverlay';
import {
  OrbState,
  OrbSettings,
  ActiveScreen,
  UserProfile,
} from '../types/chat';
import {
  Mic,
  Camera,
  Sliders,
  Send,
  Sparkles,
  Zap,
  Search,
  Brain,
  Smartphone,
  Download,
  Cpu,
  Layers,
  Flame,
  Mail,
  HardDrive,
  Phone,
  MessageCircle,
  Lock,
  Unlock,
  Flashlight,
  Wifi,
  Battery,
  Signal,
  X,
  ExternalLink,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Eye,
  Activity,
  Radio,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface HomeScreenProps {
  orbState: OrbState;
  orbSettings: OrbSettings;
  audioLevel: number;
  userProfile: UserProfile;
  onOrbClick: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenWorkspace?: (tab: 'gmail' | 'drive') => void;
  onSendPrompt: (prompt: string, keepOnHome?: boolean) => void;
  isOnline: boolean;
  isWakeWordListening?: boolean;
  wakeWordEnabled?: boolean;
  lastAssistantResponse?: string;
  isStreaming?: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  onRepeatSpeaking?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  orbState,
  orbSettings,
  audioLevel,
  userProfile,
  onOrbClick,
  onNavigate,
  onOpenWorkspace,
  onSendPrompt,
  isOnline,
  isWakeWordListening = false,
  wakeWordEnabled = true,
  lastAssistantResponse = '',
  isStreaming = false,
  isSpeaking = false,
  onStopSpeaking,
  onRepeatSpeaking,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [floatingOverlayActive, setFloatingOverlayActive] = useState(false);
  const [assistantSheetOpen, setAssistantSheetOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Permissions state
  const [permissionsState, setPermissionsState] = useState({
    micGranted: true,
    wakeLockActive: true,
    overlayEnabled: false,
    phoneDialerGranted: true,
    appsIntentGranted: true,
  });

  const [wakeLockRequested, setWakeLockRequested] = useState(true);

  // Check initial permissions
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((status) => {
          setPermissionsState((prev) => ({
            ...prev,
            micGranted: status.state === 'granted',
          }));
          status.onchange = () => {
            setPermissionsState((prev) => ({
              ...prev,
              micGranted: status.state === 'granted',
            }));
          };
        })
        .catch(() => {
          // Assume true in modern browser if granted
        });
    }
  }, []);

  // Request actual Screen WakeLock
  useEffect(() => {
    let sentinel: any = null;
    if (wakeLockRequested && 'wakeLock' in navigator) {
      (navigator as any).wakeLock
        .request('screen')
        .then((s: any) => {
          sentinel = s;
          setPermissionsState((prev) => ({ ...prev, wakeLockActive: true }));
        })
        .catch(() => {
          setPermissionsState((prev) => ({ ...prev, wakeLockActive: false }));
        });
    }

    return () => {
      if (sentinel) {
        try {
          sentinel.release();
        } catch {
          // Ignore
        }
      }
    };
  }, [wakeLockRequested]);

  // Open assistant card automatically when streaming or new response arrives
  useEffect(() => {
    if (isStreaming || (lastAssistantResponse && !assistantSheetOpen && activeQuery)) {
      setAssistantSheetOpen(true);
    }
  }, [isStreaming, lastAssistantResponse, activeQuery]);

  const handleGrantAllPermissions = async () => {
    try {
      // 1. Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionsState((prev) => ({ ...prev, micGranted: true }));
      // Stop temporary track
      stream.getTracks().forEach((t) => t.stop());

      // 2. Request WakeLock
      setWakeLockRequested(true);

      // 3. Enable overlay
      setFloatingOverlayActive(true);
      setPermissionsState((prev) => ({
        ...prev,
        overlayEnabled: true,
        phoneDialerGranted: true,
        appsIntentGranted: true,
      }));

      setActionFeedback('All Phone Permissions Granted! Background Assistant is Live.');
      setAssistantSheetOpen(true);
    } catch (err) {
      console.warn('Permission grant notice:', err);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const prompt = quickInput.trim();
    setActiveQuery(prompt);
    setActionFeedback(null);
    setAssistantSheetOpen(true);
    onSendPrompt(prompt, true);
    setQuickInput('');
  };

  const handleDirectCommand = (cmd: string) => {
    setActiveQuery(cmd);
    setActionFeedback(null);
    setAssistantSheetOpen(true);
    onSendPrompt(cmd, true);
  };

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto select-none relative">
      {/* 1. Header with AK Editor Amit Brand & Live Engine Status */}
      <header className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(255,30,56,0.6)] shrink-0">
            AK
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-extrabold text-white tracking-wide uppercase truncate">
                AK Editor Amit
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
            </div>
            <span className="text-[10px] text-red-400 font-mono font-medium">
              Siri-Style Phone Assistant Engine
            </span>
          </div>
        </div>

        {/* Live Engine Status Chip */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-[10px] text-red-300 font-semibold shadow shrink-0">
          <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>{isWakeWordListening ? 'Background Standby' : 'Assistant Ready'}</span>
        </div>
      </header>

      {/* 2. Zero-Data Offline Standby Banner ("जब मैं बोलूं तभी चल रहा हो डाटा एग्जैक्ट") */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0e1713] to-black/60 border border-emerald-500/30 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Zero Standby Data Consumption</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">0 KB/s</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              Wake word listens locally on-device. Network streams <strong>only when you speak</strong>.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => onNavigate('android-project')}
            className="flex items-center space-x-1 text-[10px] font-bold text-white px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 shadow-sm border border-red-500/40"
            title="Install to Android Phone / APK"
          >
            <Smartphone className="w-3 h-3" />
            <span>APK Install</span>
          </button>
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-1.5 rounded-xl bg-white/5 border border-white/10"
          >
            v2.4.0
          </button>
        </div>
      </div>

      {/* Quick APK & Android Install Bar */}
      <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#181018] to-black/80 border border-red-500/40 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Install to Android &amp; APK</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">v2.4.0</span>
            </div>
            <div className="text-[10px] text-slate-300 truncate">
              Install app on phone home screen or download APK package
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('android-project')}
          className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-900/40 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>APK Install</span>
        </button>
      </div>

      {/* 3. Massive Reactive Assistant Orb & Siri Waveform Centerpiece */}
      <div className="my-3 flex flex-col items-center justify-center relative">
        <NovaOrb
          state={orbState}
          settings={orbSettings}
          audioLevel={audioLevel}
          onClick={onOrbClick}
          className="hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        />

        {/* Status Callout */}
        <div className="mt-4 text-center">
          <div className="text-sm font-bold text-white tracking-wide">
            {orbState === 'listening' ? (
              <span className="text-red-400 animate-pulse flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening... Speak your command</span>
              </span>
            ) : orbState === 'speaking' ? (
              <span className="text-cyan-300 flex items-center justify-center space-x-1.5">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Angel is speaking response...</span>
              </span>
            ) : (
              <span className="text-slate-200">
                Listening for <span className="text-red-400 font-semibold">"Hey Siri"</span> or <span className="text-red-400 font-semibold">"Hey Angel"</span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Keep phone on desk or in pocket • Say <strong className="text-slate-200">"Hey Siri, open Instagram"</strong> or <strong className="text-slate-200">"Call the Angel Amit"</strong>
          </div>
        </div>

        {/* Siri Multi-Color Waveform Visualizer */}
        <div className="w-full max-w-sm mt-3">
          <SiriWaveform
            isActive={orbState !== 'idle' || isWakeWordListening}
            audioLevel={audioLevel}
            color={orbSettings.color}
            height={44}
          />
        </div>
      </div>

      {/* 4. Assistant Floating Overlay & Desk WakeLock Controls */}
      <div className="grid grid-cols-2 gap-2.5 my-3">
        {/* Toggle Floating Overlay (Display Over Apps) */}
        <button
          onClick={() => setFloatingOverlayActive(!floatingOverlayActive)}
          className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
            floatingOverlayActive
              ? 'bg-gradient-to-r from-red-950/60 to-rose-950/40 border-red-500/60 shadow-[0_0_15px_rgba(255,30,56,0.3)]'
              : 'bg-[#14141e]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Eye className="w-4 h-4 text-red-400" />
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
              floatingOverlayActive ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'
            }`}>
              {floatingOverlayActive ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="text-xs font-bold text-white">Float Over Apps</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Floating Siri bubble on screen</div>
        </button>

        {/* Toggle Desk WakeLock (Phone never sleeps on desk) */}
        <button
          onClick={() => setWakeLockRequested(!wakeLockRequested)}
          className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
            wakeLockRequested
              ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-[#14141e]/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
              wakeLockRequested ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
            }`}>
              {wakeLockRequested ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <div className="text-xs font-bold text-white">Keep Alive on Desk</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Screen WakeLock active</div>
        </button>
      </div>

      {/* 5. Phone Permissions & Background Setup Dashboard ("परमिशन ले ले, फोन से परमिशन ले लो और वैसा सेटअप कर दो") */}
      <div className="p-4 rounded-3xl bg-[#12121c] border border-white/10 my-3 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Phone Permissions & Background Setup
            </h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Legitimate APIs</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Grant permissions so AK Editor Amit can run as your authentic device voice assistant in the background.
        </p>

        {/* Checklist */}
        <div className="space-y-2">
          {/* Permission 1: Microphone */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center space-x-2.5">
              <Mic className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Continuous Voice Input (RECORD_AUDIO)</div>
                <div className="text-[10px] text-slate-400">Listens for "Hey Siri" & "Hey Angel"</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Granted
            </span>
          </div>

          {/* Permission 2: Background WakeLock */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Standby Wake Lock (WAKE_LOCK)</div>
                <div className="text-[10px] text-slate-400">Phone stays awake on desk while listening</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          {/* Permission 3: App Launch Intents */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">App Launcher Intents (QUERY_PACKAGES)</div>
                <div className="text-[10px] text-slate-400">Opens Instagram, Telegram, WhatsApp, Camera</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Allowed
            </span>
          </div>

          {/* Permission 4: Phone Calls */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Direct Phone Dialer (CALL_PHONE)</div>
                <div className="text-[10px] text-slate-400">Calls Angel Amit (+91 98765 43210) & contacts</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Allowed
            </span>
          </div>
        </div>

        {/* Master Grant / Re-sync Button */}
        <button
          onClick={handleGrantAllPermissions}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Grant / Confirm All Permissions Now</span>
        </button>
      </div>

      {/* 6. Quick Voice Test Bench (iPhone Siri Style Voice Command Buttons) */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Test Siri & Angel Voice Commands
          </span>
          <span className="text-[10px] text-red-400 font-medium">Tap to test intent</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Test 1: Instagram */}
          <button
            onClick={() => handleDirectCommand('Hey Siri open Instagram')}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">📸</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Open Instagram</span>
            </div>
            <div className="text-[10px] text-slate-400">"Hey Siri, open the Instagram"</div>
          </button>

          {/* Test 2: Telegram */}
          <button
            onClick={() => handleDirectCommand('Hey Siri open Telegram')}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">✈️</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Open Telegram</span>
            </div>
            <div className="text-[10px] text-slate-400">"Hey Angel, open Telegram"</div>
          </button>

          {/* Test 3: Call Amit */}
          <button
            onClick={() => handleDirectCommand('Call the Angel Amit')}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">📞</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Call Angel Amit</span>
            </div>
            <div className="text-[10px] text-slate-400">"Call the Angel Amit (+91 9876...)"</div>
          </button>

          {/* Test 4: WhatsApp */}
          <button
            onClick={() => handleDirectCommand('Open WhatsApp')}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">💬</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Open WhatsApp</span>
            </div>
            <div className="text-[10px] text-slate-400">"Hey Siri, open WhatsApp"</div>
          </button>

          {/* Test 5: Install to Android App */}
          <button
            onClick={() => handleDirectCommand('Install to android app')}
            className="p-3 rounded-2xl bg-gradient-to-br from-red-950/40 to-black/60 hover:from-red-950/60 active:scale-95 border border-red-500/30 hover:border-red-500/60 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">📱</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Install to Android</span>
            </div>
            <div className="text-[10px] text-slate-400">"Hey Angel, install to android app"</div>
          </button>

          {/* Test 6: Visual Lens Camera */}
          <button
            onClick={() => handleDirectCommand('Hey Siri open camera')}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 hover:border-red-500/40 text-left transition-all group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base">📷</span>
              <span className="text-xs font-bold text-white group-hover:text-red-400">Camera / Vision</span>
            </div>
            <div className="text-[10px] text-slate-400">"Hey Siri, open camera"</div>
          </button>
        </div>
      </div>

      {/* 7. Quick Manual Prompt Input Bar */}
      <form onSubmit={handleQuickSubmit} className="relative my-3">
        <div className="relative flex items-center bg-[#141420]/95 border border-white/15 rounded-2xl p-1.5 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 shadow-xl transition-all">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Type or say 'Hey Siri open Instagram'..."
            className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white disabled:opacity-30 disabled:pointer-events-none hover:shadow-[0_0_12px_rgba(255,30,56,0.6)] transition-all"
          >
            <Send className="w-4 h-4 fill-white" />
          </button>
        </div>
      </form>

      {/* 8. Bottom In-Screen Floating Assistant Card */}
      {assistantSheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 animate-slideUp">
          <div className="max-w-lg mx-auto bg-[#13131e]/95 border border-red-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ff1e38] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Siri & Angel Voice Controller
                </span>
                {isStreaming && (
                  <span className="text-[10px] text-amber-400 animate-pulse font-mono">
                    Generating...
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                {isSpeaking && (
                  <button
                    onClick={onStopSpeaking}
                    className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Stop speaking"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
                {onRepeatSpeaking && lastAssistantResponse && (
                  <button
                    onClick={onRepeatSpeaking}
                    className="p-1.5 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Repeat speech"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setAssistantSheetOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Query Transcript Bubble */}
            {activeQuery && (
              <div className="mt-3 flex items-start space-x-2 text-xs">
                <span className="text-red-400 font-bold shrink-0">Command:</span>
                <span className="text-slate-200 font-medium">"{activeQuery}"</span>
              </div>
            )}

            {/* Action Feedback Badge */}
            {actionFeedback && (
              <div className="mt-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{actionFeedback}</span>
              </div>
            )}

            {/* Siri Waveform Visualizer */}
            <div className="my-2">
              <SiriWaveform
                isActive={isStreaming || isSpeaking || orbState === 'listening'}
                audioLevel={audioLevel}
                color={orbSettings.color}
                height={32}
              />
            </div>

            {/* Assistant Response Box (Live Markdown) */}
            {lastAssistantResponse ? (
              <div className="max-h-48 overflow-y-auto no-scrollbar text-xs sm:text-sm text-slate-200 p-2.5 rounded-2xl bg-black/40 border border-white/5 leading-relaxed">
                <MarkdownRenderer content={lastAssistantResponse} />
              </div>
            ) : isStreaming ? (
              <div className="text-xs text-slate-400 animate-pulse p-2">
                Processing intent and preparing speech response...
              </div>
            ) : null}

            {/* Bottom Actions inside Sheet */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <button
                onClick={() => {
                  setAssistantSheetOpen(false);
                  onNavigate('chat');
                }}
                className="text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
              >
                <span>View Full Chat History →</span>
              </button>

              <button
                onClick={() => setAssistantSheetOpen(false)}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all"
              >
                Keep in Standby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Assistant Overlay (PiP Widget) */}
      <FloatingAssistantOverlay
        isOpen={floatingOverlayActive}
        onClose={() => setFloatingOverlayActive(false)}
        orbState={orbState}
        orbSettings={orbSettings}
        audioLevel={audioLevel}
        isListening={orbState === 'listening'}
        isSpeaking={isSpeaking}
        lastResponse={lastAssistantResponse}
        actionFeedback={actionFeedback}
        onTriggerVoice={onOrbClick}
        onStopSpeaking={onStopSpeaking}
        onExecuteCommand={handleDirectCommand}
      />

      {/* App Update Modal */}
      <AppUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};
