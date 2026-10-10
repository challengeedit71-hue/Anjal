import React, { useState } from 'react';
import { Download, Smartphone, Monitor, Share, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'settings';
  className?: string;
  onInstallStarted?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
  onInstallStarted,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and running standalone, don't show install buttons
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Aura AI is installed and running as a standalone app!</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    onInstallStarted?.();
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Variant: Header */}
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 transition-all cursor-pointer shadow-xs ${className}`}
          title="Install Aura AI App to your device"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {/* Variant: Sidebar */}
      {variant === 'sidebar' && (
        <div className={`p-3 mx-3 my-1 rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 shadow-xs ${className}`}>
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span>Install Aura AI</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                Launch instantly from your home screen or dock with zero browser UI.
              </p>
              <button
                onClick={handleClick}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant: Settings Tab */}
      {variant === 'settings' && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Progressive Web App (PWA)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Install onto Windows, Mac, Android, iPhone, or Linux.
                </p>
              </div>
            </div>
            <button
              onClick={handleClick}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>
        </div>
      )}

      {/* Guided Install Modal for iOS / Desktop / unsupported automatic prompt */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Install Aura AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Standalone Desktop & Mobile Experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {isIOS ? (
                /* iOS Safari instructions */
                <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>How to install on iOS Safari:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
                    <li>
                      Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-600 dark:text-indigo-400" /> <strong>Share</strong> icon in the bottom Safari toolbar.
                    </li>
                    <li>
                      Scroll down the share sheet and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                    </li>
                    <li>
                      Tap <strong>&quot;Add&quot;</strong> in the top-right corner to place Aura AI on your home screen.
                    </li>
                  </ol>
                </div>
              ) : (
                /* Desktop Chrome / Edge / Android instructions */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
                      <Monitor className="w-4 h-4 text-indigo-500" />
                      <span>On Desktop (Chrome, Edge, Brave):</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Click the <strong>Install icon</strong> in your browser&apos;s URL address bar (a computer or down arrow icon), or open the browser menu (⋮) and select <strong>&quot;Install Aura AI...&quot;</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
                      <Smartphone className="w-4 h-4 text-indigo-500" />
                      <span>On Android (Chrome, Edge, Firefox):</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tap the three dots menu (⋮) in the top-right corner, then select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
