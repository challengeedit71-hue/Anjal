import { Smartphone, MessageSquare, Compass, Settings, Mic } from 'lucide-react';
import { ActiveScreen, OrbColor } from '../types/chat';

interface BottomNavBarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOrbClick: () => void;
  orbColor: OrbColor;
  isListening?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onNavigate,
  onOrbClick,
  orbColor,
  isListening = false,
}) => {
  const glowStyles: Record<OrbColor, string> = {
    crimson: 'shadow-[0_0_20px_rgba(255,30,56,0.55)] border-red-500/60 bg-red-600',
    blue: 'shadow-[0_0_20px_rgba(0,210,255,0.55)] border-cyan-400/60 bg-cyan-600',
    emerald: 'shadow-[0_0_20px_rgba(0,255,136,0.55)] border-emerald-400/60 bg-emerald-600',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.55)] border-purple-400/60 bg-purple-600',
    solar: 'shadow-[0_0_20px_rgba(255,153,0,0.55)] border-amber-400/60 bg-amber-600',
  };

  const navItems = [
    { id: 'home' as ActiveScreen, label: 'Assistant', icon: Smartphone },
    { id: 'chat' as ActiveScreen, label: 'Chat', icon: MessageSquare },
    { id: 'orb' as const, label: 'Voice', special: true },
    { id: 'discover' as ActiveScreen, label: 'Discover', icon: Compass },
    { id: 'settings' as ActiveScreen, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pb-3 pt-2">
      <div className="relative flex items-center justify-around bg-[#0e0e14]/90 backdrop-blur-xl border border-white/10 rounded-3xl py-2 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          if (item.special) {
            return (
              <div key="orb-central" className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={onOrbClick}
                  aria-label="Activate Voice Assistant"
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 text-white transition-all transform active:scale-95 hover:scale-105 ${
                    glowStyles[orbColor]
                  } ${isListening ? 'animate-pulse ring-4 ring-red-400/40' : ''}`}
                >
                  <div className="absolute inset-1 rounded-full bg-radial from-white/40 via-transparent to-black/30 pointer-events-none" />
                  <Mic className="w-6 h-6 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActiveScreen)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-red-500 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5 shadow-[0_0_6px_#ff1e38]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
