import React, { useMemo } from 'react';
import { OrbState, OrbSettings, OrbColor } from '../types/chat';
import { Mic, Activity, AlertCircle, Volume2, WifiOff } from 'lucide-react';

interface NovaOrbProps {
  state: OrbState;
  settings: OrbSettings;
  audioLevel?: number; // 0 to 100
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
}

export const NovaOrb: React.FC<NovaOrbProps> = ({
  state,
  settings,
  audioLevel = 0,
  onClick,
  interactive = true,
  className = '',
}) => {
  const { orbType, color, size, particleEffects, auraBorderMode } = settings;

  // Resolve color palettes based on chosen aura signature
  const colorMap: Record<
    OrbColor,
    {
      core: string;
      glow: string;
      ring: string;
      secondary: string;
      outerGlow: string;
      spark: string;
    }
  > = {
    crimson: {
      core: '#ff1133',
      glow: 'rgba(255, 17, 51, 0.75)',
      ring: '#ff2a4b',
      secondary: '#99001a',
      outerGlow: 'rgba(255, 30, 56, 0.35)',
      spark: '#ff6680',
    },
    blue: {
      core: '#00d2ff',
      glow: 'rgba(0, 210, 255, 0.75)',
      ring: '#00e5ff',
      secondary: '#0055aa',
      outerGlow: 'rgba(0, 210, 255, 0.35)',
      spark: '#80e5ff',
    },
    emerald: {
      core: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.75)',
      ring: '#10b981',
      secondary: '#065f46',
      outerGlow: 'rgba(0, 255, 136, 0.35)',
      spark: '#6ee7b7',
    },
    purple: {
      core: '#b02aef',
      glow: 'rgba(176, 42, 239, 0.75)',
      ring: '#c084fc',
      secondary: '#581c87',
      outerGlow: 'rgba(192, 132, 252, 0.35)',
      spark: '#e879f9',
    },
    solar: {
      core: '#ff9900',
      glow: 'rgba(255, 153, 0, 0.75)',
      ring: '#fbbf24',
      secondary: '#9a3412',
      outerGlow: 'rgba(251, 191, 36, 0.35)',
      spark: '#fde047',
    },
  };

  const palette = colorMap[color] || colorMap.crimson;

  // Dynamic scale multiplier based on state & audio frequency level
  const audioScaleBoost = (audioLevel / 100) * 0.25;
  const baseScale = size * (state === 'listening' ? 1.08 + audioScaleBoost : state === 'speaking' ? 1.05 + audioScaleBoost : 1.0);

  // Particle items around the orb
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 360) / 12;
      const radius = 95 + (i % 3) * 15;
      const rad = (angle * Math.PI) / 180;
      const x = 140 + radius * Math.cos(rad);
      const y = 140 + radius * Math.sin(rad);
      const delay = (i * 0.25).toFixed(2);
      const sizeDot = 2 + (i % 3);
      return { id: i, x, y, delay, sizeDot };
    });
  }, []);

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{
        transform: `scale(${baseScale})`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Outer ambient blur flare */}
      <div
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: '280px',
          height: '280px',
          background: `radial-gradient(circle, ${palette.outerGlow} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(35px)',
          opacity: state === 'listening' || state === 'speaking' ? 1 : 0.65,
          transform: state === 'processing' ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      <svg
        viewBox="0 0 280 280"
        className="w-56 h-56 sm:w-64 sm:h-64 overflow-visible"
        style={{ filter: `drop-shadow(0 0 25px ${palette.glow})` }}
      >
        <defs>
          {/* Radial Gradient for Inner Sphere */}
          <radialGradient id={`coreGrad-${color}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor={palette.core} />
            <stop offset="70%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor="#08080c" />
          </radialGradient>

          {/* Linear Gradients for Orbital Rings */}
          <linearGradient id={`ringGrad1-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.ring} stopOpacity="0.9" />
            <stop offset="50%" stopColor={palette.core} stopOpacity="0.3" />
            <stop offset="100%" stopColor={palette.ring} stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id={`ringGrad2-${color}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor={palette.ring} stopOpacity="0.4" />
            <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.1" />
          </linearGradient>

          {/* Filter for glowing rings */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Orbiting Ring 1 (Tilted 30deg) */}
        <g
          style={{
            transformOrigin: '140px 140px',
            animation: state === 'processing'
              ? 'spinFast 2s linear infinite'
              : state === 'listening'
              ? 'spinMedium 6s linear infinite'
              : 'spinSlow 16s linear infinite',
          }}
        >
          <ellipse
            cx="140"
            cy="140"
            rx="110"
            ry="75"
            fill="none"
            stroke={`url(#ringGrad1-${color})`}
            strokeWidth={orbType === 'neon' ? '2.5' : '1.8'}
            strokeDasharray={orbType === 'energy' ? '8 6 22 4' : orbType === 'classic' ? 'none' : '14 8 2 8'}
            transform="rotate(-25 140 140)"
            filter="url(#neonGlow)"
          />
        </g>

        {/* 2. Orbiting Ring 2 (Tilted -45deg, Counter-rotating) */}
        <g
          style={{
            transformOrigin: '140px 140px',
            animation: state === 'processing'
              ? 'spinReverseFast 2.5s linear infinite'
              : state === 'speaking'
              ? 'spinMedium 5s linear infinite reverse'
              : 'spinSlow 20s linear infinite reverse',
          }}
        >
          <ellipse
            cx="140"
            cy="140"
            rx="125"
            ry="65"
            fill="none"
            stroke={`url(#ringGrad2-${color})`}
            strokeWidth={orbType === 'neon' ? '2.2' : '1.5'}
            strokeDasharray={orbType === 'energy' ? '12 8 4 6' : '6 6'}
            transform="rotate(35 140 140)"
            opacity="0.85"
            filter="url(#neonGlow)"
          />
        </g>

        {/* 3. Orbiting Ring 3 (Outer planetary ring) */}
        <g
          style={{
            transformOrigin: '140px 140px',
            animation: 'spinSlow 28s linear infinite',
          }}
        >
          <ellipse
            cx="140"
            cy="140"
            rx="132"
            ry="92"
            fill="none"
            stroke={palette.ring}
            strokeWidth="1"
            strokeDasharray="4 16 8 12"
            transform="rotate(70 140 140)"
            opacity={state === 'listening' ? '0.9' : '0.45'}
          />
        </g>

        {/* Particle sparks floating around orb */}
        {particleEffects &&
          particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.sizeDot}
              fill={palette.spark}
              style={{
                opacity: 0.8,
                animation: `pulseDot 3s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                filter: `drop-shadow(0 0 4px ${palette.ring})`,
              }}
            />
          ))}

        {/* 4. Pulse ripple wave when speaking or listening */}
        {(state === 'listening' || state === 'speaking') && (
          <circle
            cx="140"
            cy="140"
            r="82"
            fill="none"
            stroke={palette.ring}
            strokeWidth="1.5"
            opacity="0.5"
            style={{
              animation: 'orbWave 1.8s ease-out infinite',
            }}
          />
        )}

        {/* 5. Central Solid Glowing Core Sphere */}
        <g
          style={{
            transformOrigin: '140px 140px',
            animation: state === 'listening'
              ? 'orbBreath 1.5s ease-in-out infinite'
              : state === 'speaking'
              ? 'orbBreath 1.2s ease-in-out infinite'
              : 'orbBreath 4s ease-in-out infinite',
          }}
        >
          {/* Back sphere glow shadow */}
          <circle
            cx="140"
            cy="140"
            r="56"
            fill={`url(#coreGrad-${color})`}
            filter="url(#neonGlow)"
          />

          {/* Front high-specular shine */}
          <ellipse
            cx="132"
            cy="126"
            rx="22"
            ry="14"
            fill="#ffffff"
            opacity="0.35"
            transform="rotate(-20 132 126)"
          />

          {/* Core State Icon Overlay */}
          <g transform="translate(126, 126)">
            {state === 'listening' && (
              <Mic
                className="w-7 h-7 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                strokeWidth={2.5}
              />
            )}
            {state === 'speaking' && (
              <Volume2
                className="w-7 h-7 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse"
                strokeWidth={2.5}
              />
            )}
            {state === 'processing' && (
              <Activity
                className="w-7 h-7 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-spin"
                strokeWidth={2.5}
              />
            )}
            {state === 'error' && (
              <AlertCircle
                className="w-7 h-7 text-amber-200 filter drop-shadow-[0_0_8px_rgba(255,100,0,0.9)]"
                strokeWidth={2.5}
              />
            )}
            {state === 'offline' && (
              <WifiOff
                className="w-7 h-7 text-slate-400"
                strokeWidth={2.2}
              />
            )}
            {state === 'idle' && (
              <Mic
                className="w-7 h-7 text-white/90 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] group-hover:scale-110 transition-transform"
                strokeWidth={2.2}
              />
            )}
          </g>
        </g>
      </svg>

      {/* Embedded CSS animations for 60fps hardware accelerated performance */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinMedium {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinFast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverseFast {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes orbBreath {
          0%, 100% { transform: scale(0.97); }
          50% { transform: scale(1.03); }
        }
        @keyframes orbWave {
          0% { r: 58px; opacity: 0.8; stroke-width: 2px; }
          100% { r: 110px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};
