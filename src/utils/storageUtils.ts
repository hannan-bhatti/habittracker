import type { Habit, NotificationConfig } from '../types/habit';
import { formatDateKey, getTodayDateKey, getWeekDates } from './dateUtils';
import { IDENTITY_PRESETS } from '../constants/identities';

const STORAGE_KEY_HABITS = 'habit_tracker_v6_habits';
const STORAGE_KEY_JOURNALS = 'habit_tracker_v6_journals';
const STORAGE_KEY_NOTIFS = 'habit_tracker_v6_notifs';
const STORAGE_KEY_DARK = 'habit_dark_teal_v2';
const STORAGE_KEY_CUSTOM_IDENTITIES = 'habit_tracker_custom_identities_v1';
const STORAGE_KEY_DELETED_IDENTITIES = 'habit_tracker_deleted_identities_v1';

export const INITIAL_NOTIFICATIONS: NotificationConfig = {
  enabled: true,
  morningTime: '07:00',
  eveningTime: '21:30',
  soundEnabled: true
};

export function getInitialHabits(): Habit[] {
  const currentWeek = getWeekDates(0);
  const todayKey = getTodayDateKey();

  // Helper to mark dates up to today or recent days for demo momentum
  const createDemoDates = (daysActive: number[]): Record<string, boolean> => {
    const dates: Record<string, boolean> = {};
    daysActive.forEach((dayIdx) => {
      if (currentWeek[dayIdx] && currentWeek[dayIdx].dateStr <= todayKey) {
        dates[currentWeek[dayIdx].dateStr] = true;
      }
    });
    return dates;
  };

  return [
    {
      id: 'h0',
      name: '5 Daily Prayers',
      category: 'Prayer',
      identity: 'A devoted servant who grounds each day in prayer & presence',
      targetPerWeek: 7,
      priorStreak: 21,
      bestStreakRecord: 35,
      note: 'Pray on time with focus and presence',
      time: '05:15',
      location: 'Prayer Rug / Mosque',
      completedDates: createDemoDates([0, 1, 2, 3]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'hp2',
      name: 'Morning & Evening Remembrance',
      category: 'Prayer',
      identity: 'Someone who lives with peace, gratitude, and remembrance',
      targetPerWeek: 7,
      priorStreak: 12,
      bestStreakRecord: 20,
      note: '10 mins peace, gratitude, and reflection',
      time: '05:45',
      location: 'Prayer Rug / Mosque',
      stackedOnHabitId: 'h0',
      completedDates: createDemoDates([0, 1, 2]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'h1',
      name: 'Morning Calisthenics & Movement',
      category: 'Fitness',
      identity: 'An athlete who honors their body with daily strength & mobility',
      targetPerWeek: 5,
      priorStreak: 8,
      bestStreakRecord: 16,
      note: 'Push-ups, mobility, and core stretch',
      time: '07:00',
      location: 'Living Room Mat',
      completedDates: createDemoDates([0, 1, 3]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'h2',
      name: 'Focused Study & Coding',
      category: 'Work & Study',
      identity: 'A focused builder who crafts meaningful work with deep concentration',
      targetPerWeek: 6,
      priorStreak: 14,
      bestStreakRecord: 22,
      note: '2 hours distraction-free building',
      time: '09:00',
      location: 'Home Work Desk',
      stackedOnHabitId: 'h1',
      completedDates: createDemoDates([0, 1, 2]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'h3',
      name: 'Drink 8 Glasses of Water',
      category: 'Health',
      identity: 'Someone who respects their body through pure hydration & vitality',
      targetPerWeek: 7,
      priorStreak: 18,
      bestStreakRecord: 25,
      note: 'Keep full water bottle on desk',
      time: '07:30',
      location: 'Kitchen Counter',
      completedDates: createDemoDates([0, 1, 2, 3]),
      createdAt: new Date().toISOString()
    },
    {
      id: 'h4',
      name: 'Sleep Before 11 PM',
      category: 'Health',
      identity: 'Someone who prioritizes restorative sleep and high daily energy',
      targetPerWeek: 7,
      priorStreak: 5,
      bestStreakRecord: 12,
      note: 'Screen off 30 minutes before sleep',
      time: '22:30',
      location: 'Bedside / Bedroom',
      completedDates: createDemoDates([0, 1, 2]),
      createdAt: new Date().toISOString()
    }
  ];
}

export function loadHabitsFromStorage(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HABITS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((h: Partial<Habit>, idx: number) => ({
          id: h.id || `h_${Date.now()}_${idx}`,
          name: h.name || 'Untitled Habit',
          category: h.category || 'Fitness',
          identity:
            h.identity && !h.identity.startsWith('Someone aligned with ')
              ? h.identity
              : (h.category && IDENTITY_PRESETS[h.category]?.[0]) || 'A person committed to daily growth',
          targetPerWeek: Number(h.targetPerWeek) || 5,
          priorStreak: Number(h.priorStreak) || 0,
          bestStreakRecord: Number(h.bestStreakRecord) || 1,
          note: h.note || '',
          time: h.time || '07:00',
          location: h.location || 'Home',
          stackedOnHabitId: h.stackedOnHabitId || undefined,
          completedDates: h.completedDates || {},
          createdAt: h.createdAt || new Date().toISOString()
        }));
      }
    }

    return getInitialHabits();
  } catch {
    return getInitialHabits();
  }
}

export function saveHabitsToStorage(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  } catch {
    // LocalStorage write error (quota exceeded, etc.)
  }
}

export function loadJournalsFromStorage(): Record<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_JOURNALS);
    if (saved) return JSON.parse(saved);

    const today = getTodayDateKey();
    return {
      [today]: 'Started the day with calm focus, clear intent, and momentum.'
    };
  } catch {
    return {};
  }
}

export function saveJournalsToStorage(journals: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(journals));
  } catch {
    // Ignored
  }
}

export function loadNotificationsFromStorage(): NotificationConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (saved) return JSON.parse(saved);

    return INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotificationsToStorage(cfg: NotificationConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(cfg));
  } catch {
    // Ignored
  }
}

export function loadDarkModeFromStorage(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DARK);
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
}

export function saveDarkModeToStorage(isDark: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_DARK, JSON.stringify(isDark));
  } catch {
    // Ignored
  }
}

export function loadCustomIdentitiesFromStorage(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_IDENTITIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCustomIdentitiesToStorage(identities: string[]): void {
  try {
    const clean = Array.from(new Set(identities.map((s) => s.trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEY_CUSTOM_IDENTITIES, JSON.stringify(clean));
  } catch {
    // Ignored
  }
}

export function loadDeletedIdentitiesFromStorage(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DELETED_IDENTITIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveDeletedIdentitiesToStorage(identities: string[]): void {
  try {
    const clean = Array.from(new Set(identities.map((s) => s.trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEY_DELETED_IDENTITIES, JSON.stringify(clean));
  } catch {
    // Ignored
  }
}

/**
 * Exports all user data as a JSON download file.
 */
export function exportUserData(
  habits: Habit[],
  journals: Record<string, string>,
  customIdentities?: string[],
  deletedIdentities?: string[]
) {
  const data = {
    appName: 'HabitTracker',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    habits,
    journals,
    customIdentities: customIdentities || loadCustomIdentitiesFromStorage(),
    deletedIdentities: deletedIdentities || loadDeletedIdentitiesFromStorage()
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-tracker-backup-${formatDateKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported JSON file string.
 */
export function parseImportData(rawJson: string): {
  habits: Habit[];
  journals: Record<string, string>;
  customIdentities?: string[];
  deletedIdentities?: string[];
} {
  const parsed = JSON.parse(rawJson);
  if (!parsed || !Array.isArray(parsed.habits)) {
    throw new Error('Invalid backup file: missing habits list.');
  }

  const habits: Habit[] = parsed.habits.map((h: Partial<Habit>, idx: number) => ({
    id: h.id || `h_${Date.now()}_${idx}`,
    name: String(h.name || 'Imported Habit'),
    category: String(h.category || 'Fitness'),
    identity: h.identity ? String(h.identity) : undefined,
    targetPerWeek: Number(h.targetPerWeek) || 5,
    priorStreak: Number(h.priorStreak) || 0,
    bestStreakRecord: Number(h.bestStreakRecord) || 1,
    note: String(h.note || ''),
    time: String(h.time || '07:00'),
    location: String(h.location || 'Home'),
    stackedOnHabitId: h.stackedOnHabitId || undefined,
    completedDates: h.completedDates && typeof h.completedDates === 'object' ? h.completedDates : {},
    createdAt: h.createdAt || new Date().toISOString()
  }));

  const journals: Record<string, string> =
    parsed.journals && typeof parsed.journals === 'object' ? parsed.journals : {};

  const customIdentities: string[] =
    Array.isArray(parsed.customIdentities)
      ? parsed.customIdentities.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

  const deletedIdentities: string[] =
    Array.isArray(parsed.deletedIdentities)
      ? parsed.deletedIdentities.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

  return { habits, journals, customIdentities, deletedIdentities };
}

