import type React from 'react';
import {
  Plus,
  Moon,
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Database
} from 'lucide-react';
import { DailyHabitTrackerLogo } from './DailyHabitTrackerLogo';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAddModal: () => void;
  onOpenNotifModal: () => void;
  onOpenBackupModal: () => void;
  logoTapped: boolean;
  onTapLogo: () => void;
  todayDateFormatted: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenAddModal,
  onOpenNotifModal,
  onOpenBackupModal,
  logoTapped,
  onTapLogo,
  todayDateFormatted
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#070b12]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <DailyHabitTrackerLogo
            size={40}
            animated={logoTapped}
            onClick={onTapLogo}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-sky-600 dark:from-teal-300 dark:via-teal-200 dark:to-sky-300 bg-clip-text text-transparent whitespace-nowrap">
                Habit Tracker
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Atomic Daily Loops
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {todayDateFormatted} • Build small, win consistently
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleSound();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={soundEnabled ? 'Chime sound enabled (Click to mute)' : 'Chime sound muted (Click to enable)'}
            aria-label="Toggle completion sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Backup & Restore Modal */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onOpenBackupModal();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Backup & Restore Data (Export/Import)"
            aria-label="Backup and restore data"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Notifications Modal */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onOpenNotifModal();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Reminder Settings"
            aria-label="Notification settings"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onToggleDarkMode();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-teal-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Add Habit Primary CTA */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 hover:from-teal-500 hover:to-sky-500 active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-teal-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">New Habit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
