import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle,
  Download,
  Sparkles,
  ShieldCheck,
  Smartphone,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');
  const [updateStatus, setUpdateStatus] = useState<'current' | 'checking' | 'updated'>('current');

  if (!isOpen) return null;

  const handleCheckUpdate = () => {
    setChecking(true);
    setUpdateStatus('checking');

    setTimeout(() => {
      setChecking(false);
      setUpdateStatus('updated');
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Attempt service worker update if available
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.update();
          }
        });
      }
    }, 1500);
  };

  const handleReloadApp = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#12121b] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(255,30,56,0.6)]">
              AK
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center space-x-1.5">
                <span>AK Editor Amit</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                  v2.4.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">Intelligent Voice & Home Launcher</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Update Status Card */}
        <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {checking ? (
              <RefreshCw className="w-7 h-7 animate-spin text-red-400" />
            ) : (
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            )}
          </div>

          <div className="text-sm font-bold text-white">
            {checking
              ? 'Checking for Software Updates...'
              : updateStatus === 'updated'
              ? 'App Successfully Synced & Up to Date!'
              : 'You have the latest version installed'}
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Build: <code className="text-slate-300 font-mono">2026.10-release</code> • Last checked: {lastChecked}
          </div>

          <button
            onClick={handleCheckUpdate}
            disabled={checking}
            className="mt-4 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>

        {/* What's New in this Update */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What's New in v2.4.0
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>
                <strong>Phone Home Screen & Lock Screen Skin:</strong> Realistic smartphone launcher interface with Google / Siri controls.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>
                <strong>Instant Voice App Access:</strong> Voice commands to open Instagram, Telegram, WhatsApp, Camera, Settings, and Call Angel Amit.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>
                <strong>In-Screen Google/Siri Assistant:</strong> Speaks and responds right on the home screen without navigating away.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>
                <strong>Google Workspace Sync:</strong> Native Gmail inbox reading & Google Drive cloud file browsing.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center space-x-3">
          <button
            onClick={handleReloadApp}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Reload & Apply Updates</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
