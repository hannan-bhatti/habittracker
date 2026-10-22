import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { Habit, NotificationConfig } from '../types/habit';
import { formatDateKey, getTodayDateKey, getWeekDates } from './dateUtils';
import { IDENTITY_PRESETS } from '../constants/identities';

export const STORAGE_KEY_HABITS = 'habit_tracker_v7_habits';
export const STORAGE_KEY_JOURNALS = 'habit_tracker_v7_journals';
export const STORAGE_KEY_NOTIFS = 'habit_tracker_v7_notifs';
export const STORAGE_KEY_DARK = 'habit_dark_teal_v2';
export const STORAGE_KEY_CUSTOM_IDENTITIES = 'habit_tracker_custom_identities_v1';
export const STORAGE_KEY_DELETED_IDENTITIES = 'habit_tracker_deleted_identities_v1';
export const STORAGE_KEY_INITIALIZED = 'habit_tracker_initialized_v2';

export const INITIAL_NOTIFICATIONS: NotificationConfig = {
  enabled: true,
  morningTime: '07:00',
  eveningTime: '21:30',
  soundEnabled: true,
  habitRemindersEnabled: true,
  reminderLeadMinutes: 10,
  remindAtExactTime: true
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

function normalizeHabits(raw: unknown[]): Habit[] {
  return raw.map((item, idx: number) => {
    const h = (item && typeof item === 'object' ? item : {}) as Partial<Habit>;
    return {
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
      completedDates: h.completedDates && typeof h.completedDates === 'object' ? h.completedDates : {},
      createdAt: h.createdAt || new Date().toISOString()
    };
  });
}

/**
 * Synchronous initial load for React state (zero UI flash).
 * Returns empty array [] if initialized or if user cleared habits.
 */
export function loadHabitsFromStorage(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HABITS);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return normalizeHabits(parsed);
      }
    }

    // Check legacy v6 storage
    const legacySaved = localStorage.getItem('habit_tracker_v6_habits');
    if (legacySaved !== null) {
      const parsedLegacy = JSON.parse(legacySaved);
      if (Array.isArray(parsedLegacy)) {
        return normalizeHabits(parsedLegacy);
      }
    }

    // If app has ever been initialized, keep user's state (even if 0 habits)
    const isInit = localStorage.getItem(STORAGE_KEY_INITIALIZED);
    if (isInit === 'true') {
      return [];
    }

    // Fresh install: start clean so the user doesn't have to clear someone else's demo data!
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    Preferences.set({ key: STORAGE_KEY_INITIALIZED, value: 'true' }).catch(() => {});
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves habits to both localStorage and native Android SharedPreferences (via Capacitor Preferences).
 */
export function saveHabitsToStorage(habits: Habit[]) {
  try {
    const serialized = JSON.stringify(habits);
    localStorage.setItem(STORAGE_KEY_HABITS, serialized);
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    Preferences.set({ key: STORAGE_KEY_HABITS, value: serialized }).catch(() => {});
    Preferences.set({ key: STORAGE_KEY_INITIALIZED, value: 'true' }).catch(() => {});
  } catch {
    // LocalStorage write error (quota exceeded, etc.)
  }
}

export function clearAllHabitsFromStorage() {
  try {
    const serialized = JSON.stringify([]);
    localStorage.setItem(STORAGE_KEY_HABITS, serialized);
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    Preferences.set({ key: STORAGE_KEY_HABITS, value: serialized }).catch(() => {});
    Preferences.set({ key: STORAGE_KEY_INITIALIZED, value: 'true' }).catch(() => {});
  } catch {
    // Ignored
  }
}

export function loadJournalsFromStorage(): Record<string, string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_JOURNALS);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveJournalsToStorage(journals: Record<string, string>) {
  try {
    const serialized = JSON.stringify(journals);
    localStorage.setItem(STORAGE_KEY_JOURNALS, serialized);
    Preferences.set({ key: STORAGE_KEY_JOURNALS, value: serialized }).catch(() => {});
  } catch {
    // Ignored
  }
}

export function loadNotificationsFromStorage(): NotificationConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_NOTIFICATIONS,
        ...parsed,
        reminderLeadMinutes: parsed.reminderLeadMinutes ?? 10,
        remindAtExactTime: parsed.remindAtExactTime ?? true
      };
    }

    return INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotificationsToStorage(cfg: NotificationConfig) {
  try {
    const serialized = JSON.stringify(cfg);
    localStorage.setItem(STORAGE_KEY_NOTIFS, serialized);
    Preferences.set({ key: STORAGE_KEY_NOTIFS, value: serialized }).catch(() => {});
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
    const serialized = JSON.stringify(isDark);
    localStorage.setItem(STORAGE_KEY_DARK, serialized);
    Preferences.set({ key: STORAGE_KEY_DARK, value: serialized }).catch(() => {});
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
    const serialized = JSON.stringify(clean);
    localStorage.setItem(STORAGE_KEY_CUSTOM_IDENTITIES, serialized);
    Preferences.set({ key: STORAGE_KEY_CUSTOM_IDENTITIES, value: serialized }).catch(() => {});
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
    const serialized = JSON.stringify(clean);
    localStorage.setItem(STORAGE_KEY_DELETED_IDENTITIES, serialized);
    Preferences.set({ key: STORAGE_KEY_DELETED_IDENTITIES, value: serialized }).catch(() => {});
  } catch {
    // Ignored
  }
}

/**
 * Hydrates state and localStorage from native Android SharedPreferences on app launch.
 * This guarantees that even if WebView cache was discarded by Android OS on app close,
 * the user's data is fully recovered from native persistent storage.
 */
export async function hydrateNativeStorage(): Promise<{
  habits?: Habit[];
  journals?: Record<string, string>;
  notifications?: NotificationConfig;
  isDarkMode?: boolean;
  customIdentities?: string[];
  deletedIdentities?: string[];
  isInitialized: boolean;
}> {
  try {
    const [
      habitsPref,
      journalsPref,
      notifsPref,
      darkPref,
      customPref,
      deletedPref,
      initPref
    ] = await Promise.all([
      Preferences.get({ key: STORAGE_KEY_HABITS }),
      Preferences.get({ key: STORAGE_KEY_JOURNALS }),
      Preferences.get({ key: STORAGE_KEY_NOTIFS }),
      Preferences.get({ key: STORAGE_KEY_DARK }),
      Preferences.get({ key: STORAGE_KEY_CUSTOM_IDENTITIES }),
      Preferences.get({ key: STORAGE_KEY_DELETED_IDENTITIES }),
      Preferences.get({ key: STORAGE_KEY_INITIALIZED })
    ]);

    const isInitialized =
      initPref.value === 'true' || localStorage.getItem(STORAGE_KEY_INITIALIZED) === 'true';

    let habits: Habit[] | undefined;
    if (habitsPref.value !== null) {
      try {
        const parsed = JSON.parse(habitsPref.value);
        if (Array.isArray(parsed)) {
          habits = normalizeHabits(parsed);
          localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
        }
      } catch {
        // Ignored
      }
    }

    let journals: Record<string, string> | undefined;
    if (journalsPref.value !== null) {
      try {
        journals = JSON.parse(journalsPref.value);
        if (journals) {
          localStorage.setItem(STORAGE_KEY_JOURNALS, journalsPref.value);
        }
      } catch {
        // Ignored
      }
    }

    let notifications: NotificationConfig | undefined;
    if (notifsPref.value !== null) {
      try {
        notifications = JSON.parse(notifsPref.value);
        if (notifications) {
          localStorage.setItem(STORAGE_KEY_NOTIFS, notifsPref.value);
        }
      } catch {
        // Ignored
      }
    }

    let isDarkMode: boolean | undefined;
    if (darkPref.value !== null) {
      try {
        isDarkMode = JSON.parse(darkPref.value);
        if (typeof isDarkMode === 'boolean') {
          localStorage.setItem(STORAGE_KEY_DARK, darkPref.value);
        }
      } catch {
        // Ignored
      }
    }

    let customIdentities: string[] | undefined;
    if (customPref.value !== null) {
      try {
        const parsed = JSON.parse(customPref.value);
        if (Array.isArray(parsed)) {
          customIdentities = parsed.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
          );
          localStorage.setItem(STORAGE_KEY_CUSTOM_IDENTITIES, JSON.stringify(customIdentities));
        }
      } catch {
        // Ignored
      }
    }

    let deletedIdentities: string[] | undefined;
    if (deletedPref.value !== null) {
      try {
        const parsed = JSON.parse(deletedPref.value);
        if (Array.isArray(parsed)) {
          deletedIdentities = parsed.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
          );
          localStorage.setItem(STORAGE_KEY_DELETED_IDENTITIES, JSON.stringify(deletedIdentities));
        }
      } catch {
        // Ignored
      }
    }

    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    }

    return {
      habits,
      journals,
      notifications,
      isDarkMode,
      customIdentities,
      deletedIdentities,
      isInitialized
    };
  } catch {
    return {
      isInitialized: localStorage.getItem(STORAGE_KEY_INITIALIZED) === 'true'
    };
  }
}

/**
 * Builds the serialized JSON backup string for all user data.
 */
export function serializeBackupData(
  habits: Habit[],
  journals: Record<string, string>,
  customIdentities?: string[],
  deletedIdentities?: string[]
): string {
  const data = {
    appName: 'HabitTracker',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    habits,
    journals,
    customIdentities: customIdentities ?? loadCustomIdentitiesFromStorage(),
    deletedIdentities: deletedIdentities ?? loadDeletedIdentitiesFromStorage()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Exports all user data as a JSON download file (or native share sheet / clipboard on Android).
 */
export async function exportUserData(
  habits: Habit[],
  journals: Record<string, string>,
  customIdentities?: string[],
  deletedIdentities?: string[]
): Promise<'shared' | 'downloaded' | 'copied'> {
  const jsonStr = serializeBackupData(habits, journals, customIdentities, deletedIdentities);
  const fileName = `habit-tracker-backup-${formatDateKey(new Date())}.json`;

  // On native mobile (Android WebView), <a download> with blob URLs is often ignored.
  // Prefer Web Share API with file/text or fallback to download + clipboard copy.
  if (Capacitor.isNativePlatform() && typeof navigator !== 'undefined') {
    try {
      const file = new File([jsonStr], fileName, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Habit Tracker Backup',
          text: 'Habit Tracker JSON data backup',
          files: [file]
        });
        return 'shared';
      }
      if (navigator.share) {
        await navigator.share({
          title: fileName,
          text: jsonStr
        });
        return 'shared';
      }
    } catch (err) {
      // If user dismissed share sheet (AbortError), don't throw; otherwise try clipboard/download
      if (err instanceof Error && err.name === 'AbortError') {
        return 'shared';
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(jsonStr);
        return 'copied';
      } catch {
        // Continue to standard anchor fallback
      }
    }
  }

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
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

