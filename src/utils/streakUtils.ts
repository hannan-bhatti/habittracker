import type { Habit, HabitStats, DayInfo, EnrichedHabit, IdentitySummary } from '../types/habit';
import { formatDateKey, parseDateKey, getTodayDateKey } from './dateUtils';

/**
 * Calculates current and longest streaks, and total votes cast for a specific habit.
 */
export function calculateHabitStats(habit: Habit, weekDays: DayInfo[]): HabitStats {
  const { completedDates = {}, targetPerWeek = 5, priorStreak = 0, bestStreakRecord = 0 } = habit;

  // Week-specific stats
  const completedThisWeek = weekDays.filter((d) => Boolean(completedDates[d.dateStr])).length;
  const completionRateThisWeek = Math.round((completedThisWeek / 7) * 100);
  const isTargetMet = completedThisWeek >= targetPerWeek;

  // Total lifetime votes cast for this habit's identity
  const totalVotesCast = Object.values(completedDates).filter(Boolean).length;

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
    isTargetMet,
    totalVotesCast
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

/**
 * Groups habits by identity and calculates votes cast, tiers, and momentum levels.
 */
export function calculateIdentitySummaries(habits: EnrichedHabit[]): IdentitySummary[] {
  const map = new Map<string, { category: string; habits: EnrichedHabit[] }>();

  habits.forEach((h) => {
    const idKey = h.identity && h.identity.trim().length > 0
      ? h.identity.trim()
      : `Someone aligned with ${h.category}`;

    const existing = map.get(idKey) || { category: h.category, habits: [] };
    existing.habits.push(h);
    map.set(idKey, existing);
  });

  const summaries: IdentitySummary[] = [];

  map.forEach((data, identity) => {
    let totalVotes = 0;
    let weeklyVotes = 0;

    data.habits.forEach((h) => {
      totalVotes += h.stats.totalVotesCast;
      weeklyVotes += h.stats.completedThisWeek;
    });

    // Level Tiers:
    // Tier 1: 0 - 9 votes (Aspiring)
    // Tier 2: 10 - 24 votes (Emerging)
    // Tier 3: 25 - 49 votes (Consistent)
    // Tier 4: 50+ votes (Embodied)
    let levelName = '🌱 Aspiring';
    let levelTier = 1;
    let levelProgressPct = Math.min(100, Math.round((totalVotes / 10) * 100));
    let nextTierVotes = 10;

    if (totalVotes >= 50) {
      levelName = '👑 Embodied Identity';
      levelTier = 4;
      levelProgressPct = 100;
      nextTierVotes = 50;
    } else if (totalVotes >= 25) {
      levelName = '🌲 Consistent Habit';
      levelTier = 3;
      levelProgressPct = Math.min(100, Math.round(((totalVotes - 25) / 25) * 100));
      nextTierVotes = 50;
    } else if (totalVotes >= 10) {
      levelName = '🌿 Emerging Habit';
      levelTier = 2;
      levelProgressPct = Math.min(100, Math.round(((totalVotes - 10) / 15) * 100));
      nextTierVotes = 25;
    }

    summaries.push({
      identity,
      category: data.category,
      totalVotes,
      weeklyVotes,
      levelName,
      levelTier,
      levelProgressPct,
      nextTierVotes,
      habits: data.habits
    });
  });

  // Sort by highest votes cast
  return summaries.sort((a, b) => b.totalVotes - a.totalVotes);
}
