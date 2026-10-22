import { LocalNotifications } from '@capacitor/local-notifications';
import type { Habit, NotificationConfig } from '../types/habit';

/**
 * Calculates advance reminder time given a time string "HH:mm" and lead minutes.
 * Correctly wraps around the 24-hour boundary (e.g. 00:05 with 10m lead -> 23:55).
 */
export function calculateAdvanceTime(
  timeStr: string,
  leadMinutes: number
): { hour: number; minute: number; timeString: string } {
  if (!timeStr) return { hour: 0, minute: 0, timeString: '00:00' };
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) {
    return { hour: 0, minute: 0, timeString: '00:00' };
  }
  const total = h * 60 + m;
  const target = (total - leadMinutes + 24 * 60) % (24 * 60);
  const remH = Math.floor(target / 60);
  const remM = target % 60;
  const timeString = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}`;
  return { hour: remH, minute: remM, timeString };
}

/**
 * Deterministically generates a stable 32-bit positive integer ID for each habit notification.
 * Uses distinct offset ranges for advance lead reminders vs exact-time alerts.
 */
export function getHabitNotificationId(habitId: string, alertType: 'lead' | 'exact' = 'lead'): number {
  let hash = 0;
  const key = `${habitId}_${alertType}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000000) + (alertType === 'lead' ? 2000 : 1000);
}

/**
 * Configures the Android notification channel and schedules recurring daily notifications
 * for each individual habit at its advance reminder time (default 10 mins before),
 * its exact start time, along with morning kick-off and evening reflection.
 */
export async function scheduleAllNotifications(
  notifications: NotificationConfig,
  habits: Habit[]
): Promise<boolean> {
  try {
    // 1. Configure Android Notification Channel for high-visibility heads-up alerts
    try {
      await LocalNotifications.createChannel({
        id: 'habits-daily-channel',
        name: 'Daily Habit Reminders',
        description: 'Advance reminders and timely alerts when scheduled habit times arrive',
        importance: 4, // High importance (banners + sound)
        visibility: 1,
        vibration: true
      });
    } catch {
      // Ignored if unsupported on platform
    }

    // 2. Check / Request Permissions
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    if (perm.display !== 'granted') {
      return false;
    }

    // 3. Cancel previously pending notifications to avoid duplicate alerts
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    if (!notifications.enabled) {
      return true;
    }

    const list: Array<{
      id: number;
      title: string;
      body: string;
      channelId?: string;
      schedule: {
        on: { hour: number; minute: number };
        repeats: boolean;
        allowWhileIdle?: boolean;
      };
    }> = [];

    // 4. Morning Habit Kick-off Alert
    if (notifications.morningTime) {
      const [mH, mM] = notifications.morningTime.split(':').map(Number);
      if (!isNaN(mH) && !isNaN(mM)) {
        list.push({
          id: 101,
          title: 'Habit Tracker ☀️',
          body: 'A fresh day has begun! Check off your morning habits and build momentum.',
          channelId: 'habits-daily-channel',
          schedule: { on: { hour: mH, minute: mM }, repeats: true, allowWhileIdle: true }
        });
      }
    }

    // 5. Evening Daily Reflection Alert
    if (notifications.eveningTime) {
      const [eH, eM] = notifications.eveningTime.split(':').map(Number);
      if (!isNaN(eH) && !isNaN(eM)) {
        list.push({
          id: 103,
          title: 'Evening Reflection 🌙',
          body: 'Review your habit streaks and write your 1-sentence reflection.',
          channelId: 'habits-daily-channel',
          schedule: { on: { hour: eH, minute: eM }, repeats: true, allowWhileIdle: true }
        });
      }
    }

    // 6. Schedule per-habit advance reminders (10 mins before) and start alerts
    if (notifications.habitRemindersEnabled !== false) {
      const leadMinutes = notifications.reminderLeadMinutes ?? 10;
      const remindAtExact = notifications.remindAtExactTime ?? true;

      habits.forEach((habit) => {
        if (!habit.time) return;
        const [hH, hM] = habit.time.split(':').map(Number);
        if (isNaN(hH) || isNaN(hM)) return;

        const detail = habit.identity
          ? `“${habit.identity}”`
          : habit.note
          ? habit.note
          : `Stay consistent with your ${habit.category || 'daily'} habit!`;

        const locationText = habit.location ? ` • 📍 ${habit.location}` : '';

        // 6A. 10-Minute (or configured lead) Advance Reminder
        if (leadMinutes > 0) {
          const adv = calculateAdvanceTime(habit.time, leadMinutes);
          const leadNotifId = getHabitNotificationId(habit.id, 'lead');

          list.push({
            id: leadNotifId,
            title: `Starting in ${leadMinutes}m: ${habit.name} ⏳`,
            body: `Scheduled for ${habit.time}. ${detail}${locationText}`,
            channelId: 'habits-daily-channel',
            schedule: { on: { hour: adv.hour, minute: adv.minute }, repeats: true, allowWhileIdle: true }
          });
        }

        // 6B. Exact Scheduled Start Time Alert
        if (remindAtExact || leadMinutes === 0) {
          const exactNotifId = getHabitNotificationId(habit.id, 'exact');

          list.push({
            id: exactNotifId,
            title: `Time for: ${habit.name} ⏰`,
            body: `${detail}${locationText}`,
            channelId: 'habits-daily-channel',
            schedule: { on: { hour: hH, minute: hM }, repeats: true, allowWhileIdle: true }
          });
        }
      });
    }

    if (list.length > 0) {
      await LocalNotifications.schedule({ notifications: list });
    }

    return true;
  } catch (err) {
    console.warn('Failed to schedule local notifications:', err);
    return false;
  }
}
