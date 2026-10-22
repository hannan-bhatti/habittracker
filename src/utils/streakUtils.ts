import type { Habit, HabitStats, DayInfo, EnrichedHabit, IdentitySummary } from '../types/habit';
import { formatDateKey, parseDateKey, getTodayDateKey } from './dateUtils';

/**
 * Calculates current and longest streaks, and total votes cast for a specific habit.
 */
export function calculateHabitStats(
  habit: Habit,
  weekDays: DayInfo[],
  todayKey: string = getTodayDateKey()
): HabitStats {
  const { completedDates = {}, targetPerWeek = 5, priorStreak = 0, bestStreakRecord = 0 } = habit;

  // Week-specific stats
  const completedThisWeek = weekDays.filter((d) => Boolean(completedDates[d.dateStr])).length;
  const completionRateThisWeek = Math.round((completedThisWeek / 7) * 100);
  const isTargetMet = completedThisWeek >= targetPerWeek;

  // Active completed date keys sorted chronologically
  const activeDateKeys = Object.keys(completedDates)
    .filter((k) => Boolean(completedDates[k]))
    .sort();

  // Total lifetime votes cast for this habit's identity
  const totalVotesCast = activeDateKeys.length;

  // Consecutive day streak calculation from today / yesterday
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

  // Calculate maximum historical consecutive streak across all recorded dates
  let maxHistoricalStreak = 0;
  let currentRun = 0;
  let prevDayEpoch: number | null = null;

  for (const key of activeDateKeys) {
    const d = parseDateKey(key);
    const dayEpoch = Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    if (prevDayEpoch !== null && dayEpoch === prevDayEpoch + 1) {
      currentRun++;
    } else {
      currentRun = 1;
    }
    if (currentRun > maxHistoricalStreak) {
      maxHistoricalStreak = currentRun;
    }
    prevDayEpoch = dayEpoch;
  }

  const totalCurrentStreak = streak > 0 ? streak + priorStreak : 0;
  const longestStreak = Math.max(bestStreakRecord, totalCurrentStreak, maxHistoricalStreak);

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
export function calculateOverallDailyStreak(
  habits: Habit[],
  todayKey: string = getTodayDateKey()
): number {
  if (habits.length === 0) return 0;

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
export function calculateIdentitySummaries(
  habits: EnrichedHabit[],
  customIdentities: string[] = []
): IdentitySummary[] {
  const map = new Map<string, { category: string; habits: EnrichedHabit[] }>();

  habits.forEach((h) => {
    if (h.identity && h.identity.trim().length > 0) {
      const idKey = h.identity.trim();
      const existing = map.get(idKey) || { category: h.category, habits: [] };
      existing.habits.push(h);
      map.set(idKey, existing);
    }
  });

  // Include custom user-defined identities that may not yet have habit routines attached
  customIdentities.forEach((cid) => {
    const trimmed = cid.trim();
    if (trimmed && !map.has(trimmed)) {
      map.set(trimmed, { category: 'Personal', habits: [] });
    }
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
