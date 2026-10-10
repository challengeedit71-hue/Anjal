import React, { useEffect, useRef } from 'react';

interface SiriWaveformProps {
  isActive: boolean;
  audioLevel?: number; // 0 to 100
  color?: 'crimson' | 'blue' | 'emerald' | 'purple' | 'solar';
  height?: number;
  className?: string;
  showGlow?: boolean;
}

export const SiriWaveform: React.FC<SiriWaveformProps> = ({
  isActive,
  audioLevel = 0,
  color = 'crimson',
  height = 90,
  className = '',
  showGlow = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const colorPalettes = {
    crimson: {
      primary: '#ff1e38',
      secondary: '#ff4d6d',
      tertiary: '#ff758f',
      glow: 'rgba(255, 30, 56, 0.45)',
    },
    blue: {
      primary: '#00d2ff',
      secondary: '#3a86ff',
      tertiary: '#70e000',
      glow: 'rgba(0, 210, 255, 0.45)',
    },
    emerald: {
      primary: '#00ff88',
      secondary: '#10b981',
      tertiary: '#06d6a0',
      glow: 'rgba(0, 255, 136, 0.45)',
    },
    purple: {
      primary: '#a855f7',
      secondary: '#c084fc',
      tertiary: '#e879f9',
      glow: 'rgba(168, 85, 247, 0.45)',
    },
    solar: {
      primary: '#ff9900',
      secondary: '#ffb703',
      tertiary: '#fb8500',
      glow: 'rgba(255, 153, 0, 0.45)',
    },
  };

  const palette = colorPalettes[color] || colorPalettes.crimson;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let h = (canvas.height = height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, h);

      // Baseline wave configuration
      const baseAmplitude = isActive ? Math.max(12, (audioLevel / 100) * (h / 2.2)) : 4;
      const speed = isActive ? 0.08 + (audioLevel / 100) * 0.06 : 0.02;
      phaseRef.current += speed;

      const waves = [
        {
          color: palette.primary,
          alpha: 0.85,
          freq: 0.02,
          ampMult: 1.0,
          speedMult: 1.0,
          lineWidth: 3,
        },
        {
          color: palette.secondary,
          alpha: 0.6,
          freq: 0.025,
          ampMult: 0.75,
          speedMult: -0.8,
          lineWidth: 2.5,
        },
        {
          color: palette.tertiary,
          alpha: 0.45,
          freq: 0.035,
          ampMult: 0.5,
          speedMult: 1.3,
          lineWidth: 2,
        },
        {
          color: '#ffffff',
          alpha: 0.7,
          freq: 0.015,
          ampMult: 0.35,
          speedMult: -0.5,
          lineWidth: 1.5,
        },
      ];

      const centerY = h / 2;

      // Draw waves with smooth cubic bezier curve or sine formula
      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.alpha;

        if (showGlow && isActive) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = w.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.moveTo(0, centerY);

        const step = 4;
        for (let x = 0; x <= width; x += step) {
          // Window envelope function to taper edges gracefully to 0
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            centerY +
            Math.sin(x * w.freq + phaseRef.current * w.speedMult) *
              baseAmplitude *
              w.ampMult *
              envelope;
          ctx.lineTo(x, y);
        }

        ctx.stroke();
      });

      ctx.globalAlpha = 1.0;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, audioLevel, color, height, showGlow, palette]);

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full pointer-events-none block"
        style={{ height }}
      />
      {showGlow && isActive && (
        <div
          className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-8 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity"
          style={{ backgroundColor: palette.primary }}
        />
      )}
    </div>
  );
};
