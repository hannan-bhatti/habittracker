import type React from 'react';

interface DailyHabitTrackerLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

/**
 * Habit Tracker Brand Logo:
 * Circular badge with delicate lattice grid texture and iconic dual-T geometric monogram.
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
      {/* Soft Ambient Glow */}
      <div
        className={`absolute inset-0 rounded-full bg-sky-400/20 blur-md ${
          animated ? 'animate-pulse-glow' : 'opacity-60 group-hover:opacity-100 transition-opacity'
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
          {/* Subtle Diagonal Lattice / Grid Pattern */}
          <pattern
            id="logoGridPattern"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45 0 0)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e2e8f0" strokeWidth="0.75" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="#e2e8f0" strokeWidth="0.75" />
          </pattern>
          <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Circular Base with Subtle Border */}
        <circle
          cx="28"
          cy="28"
          r="26"
          className="fill-white dark:fill-slate-900 transition-colors"
        />
        <circle
          cx="28"
          cy="28"
          r="26"
          stroke="#cbd5e1"
          strokeWidth="1.2"
          className="dark:stroke-slate-700"
        />

        {/* Diagonal Lattice Grid Overlay inside the Circle */}
        <circle
          cx="28"
          cy="28"
          r="25.4"
          fill="url(#logoGridPattern)"
          className="opacity-80 dark:opacity-20"
        />

        {/* Dual-T Geometric Monogram (Habit Tracker Icon) */}
        <g className={animated ? 'animate-bounce-subtle' : ''}>
          {/* Lower-left T-shape */}
          <polygon
            points="17.5,22.1 14.7,25.2 21.2,31.7 18.4,35.1 21.2,37.6 24.3,34.8 31.1,41.3 33.9,38.5"
            fill="url(#logoBlueGrad)"
          />
          {/* Upper-right T-shape */}
          <polygon
            points="24.0,15.6 21.2,18.4 37.6,34.8 40.4,31.7 33.9,25.2 40.7,18.4 37.6,15.3 30.8,22.1"
            fill="url(#logoBlueGrad)"
          />
        </g>
      </svg>
    </div>
  );
};

