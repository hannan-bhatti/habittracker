import type React from 'react';

interface DailyHabitTrackerLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

/**
 * Vector Brand Logo: Interlocking habit loop arcs, gradient base, and inner momentum spark.
 */
export const DailyHabitTrackerLogo: React.FC<DailyHabitTrackerLogoProps> = ({
  size = 48,
  className = '',
  animated = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 select-none group ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/25 to-sky-500/25 blur-md ${
          animated ? 'animate-pulse-glow' : 'opacity-70 group-hover:opacity-100 transition-opacity'
        }`}
      />

      {/* SVG Vector Brand Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="dhtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="dhtFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Squircle Base */}
        <rect
          x="3"
          y="3"
          width="50"
          height="50"
          rx="15"
          className="fill-white dark:fill-slate-900 transition-colors"
        />
        <rect
          x="3"
          y="3"
          width="50"
          height="50"
          rx="15"
          stroke="url(#dhtLogoGrad)"
          strokeWidth="1.8"
          strokeOpacity="0.5"
        />

        {/* Outer Circular Habit Loop (Segmented 280-degree activity arc) */}
        <path
          d="M 28 11 A 17 17 0 1 1 14 36"
          stroke="url(#dhtLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          className={animated ? 'animate-orbit-spin' : ''}
        />

        {/* Progress Milestone Beads on the arc */}
        <circle cx="28" cy="11" r="2.8" fill="#0d9488" />
        <circle cx="45" cy="28" r="2.8" fill="#0284c7" />
        <circle cx="14" cy="36" r="2.8" fill="#38bdf8" />

        {/* Inner Momentum Core Flame & Star */}
        <path
          d="M 28 20 C 31 24, 34 26, 34 30 C 34 33.3, 31.3 36, 28 36 C 24.7 36, 22 33.3, 22 30 C 22 26.5, 25 24, 28 20 Z"
          fill="url(#dhtFlameGrad)"
        />
        <circle cx="28" cy="31" r="1.8" fill="#ffffff" />
      </svg>
    </div>
  );
};
