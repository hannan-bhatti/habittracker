import type React from 'react';
import { Flame, CheckSquare, Sparkles, TrendingUp } from 'lucide-react';
import type { EnrichedHabit } from '../types/habit';

interface DashboardStatsProps {
  selectedDayDone: number;
  totalHabits: number;
  selectedDayPct: number;
  selectedDayLabel: string;
  overallStreak: number;
  totalCheckinsWeek: number;
  totalPossibleWeek: number;
  weeklyCompletionPct: number;
  bestHabit: EnrichedHabit | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  selectedDayDone,
  totalHabits,
  selectedDayPct,
  selectedDayLabel,
  overallStreak,
  totalCheckinsWeek,
  totalPossibleWeek,
  weeklyCompletionPct,
  bestHabit
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Selected Day Completion */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {selectedDayLabel}&apos;s Rhythm
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {selectedDayPct}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({selectedDayDone}/{totalHabits})
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-500"
              style={{ width: `${selectedDayPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Overall Daily Streak */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Streak
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-500/20" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {overallStreak}
            </span>
            <span className="text-xs text-slate-400 font-medium">days active</span>
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 truncate">
            {overallStreak > 0 ? 'Momentum running strong!' : 'Check in today to spark streak'}
          </p>
        </div>
      </div>

      {/* 3. Weekly Volume */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Weekly Volume
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalCheckinsWeek}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {totalPossibleWeek} ({weeklyCompletionPct}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-500"
              style={{ width: `${weeklyCompletionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Best Performing Routine */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top Consistency
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {bestHabit ? (
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {bestHabit.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400">
                  {bestHabit.stats.currentStreak}d streak
                </span>
                <span className="text-[10px] text-slate-400">
                  • {bestHabit.stats.completedThisWeek}/{bestHabit.targetPerWeek} this week
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">No habits tracked yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
