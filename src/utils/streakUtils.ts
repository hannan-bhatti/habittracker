import type { Habit, HabitStats, DayInfo } from '../types/habit';
import { formatDateKey, parseDateKey, getTodayDateKey } from './dateUtils';

/**
 * Calculates current and longest streaks for a specific habit across actual dates.
 */
export function calculateHabitStats(habit: Habit, weekDays: DayInfo[]): HabitStats {
  const { completedDates = {}, targetPerWeek = 5, priorStreak = 0, bestStreakRecord = 0 } = habit;

  // Week-specific stats
  const completedThisWeek = weekDays.filter((d) => Boolean(completedDates[d.dateStr])).length;
  const completionRateThisWeek = Math.round((completedThisWeek / 7) * 100);
  const isTargetMet = completedThisWeek >= targetPerWeek;

  // Consecutive day streak calculation
  const todayKey = getTodayDateKey();
  const todayDate = parseDateKey(todayKey);

  let streak = 0;
  let checkDate = new Date(todayDate);

  // If today is completed, start counting from today
  if (completedDates[todayKey]) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not yet completed, check if yesterday was completed to keep the active streak alive
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    if (completedDates[yesterdayKey]) {
      checkDate = yesterday;
    } else {
      checkDate = new Date(0); // Terminate
    }
  }

  // Count consecutive days backward
  if (checkDate.getTime() > 0) {
    while (true) {
      const key = formatDateKey(checkDate);
      if (completedDates[key]) {
        if (key !== todayKey) {
          streak++;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const totalCurrentStreak = streak > 0 ? streak + priorStreak : 0;
  const longestStreak = Math.max(bestStreakRecord, totalCurrentStreak);

  return {
    completedThisWeek,
    completionRateThisWeek,
    currentStreak: totalCurrentStreak,
    longestStreak,
    isTargetMet
  };
}

/**
 * Calculates overall active daily streak across all habits without arbitrary magic numbers.
 */
export function calculateOverallDailyStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  const todayKey = getTodayDateKey();
  const todayDate = parseDateKey(todayKey);

  const isDaySuccessful = (dateKey: string): boolean => {
    const doneCount = habits.filter((h) => Boolean(h.completedDates && h.completedDates[dateKey])).length;
    return habits.length > 0 && doneCount >= Math.max(1, Math.ceil(habits.length * 0.5));
  };

  let streak = 0;
  let checkDate = new Date(todayDate);

  if (isDaySuccessful(todayKey)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    if (isDaySuccessful(yesterdayKey)) {
      checkDate = yesterday;
    } else {
      return 0;
    }
  }

  while (true) {
    const key = formatDateKey(checkDate);
    if (isDaySuccessful(key)) {
      if (key !== todayKey) {
        streak++;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
