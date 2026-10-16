import { LocalNotifications } from '@capacitor/local-notifications';
import type { Habit, NotificationConfig } from '../types/habit';

/**
 * Deterministically generates a stable 32-bit positive integer ID for each habit notification.
 */
export function getHabitNotificationId(habitId: string): number {
  let hash = 0;
  for (let i = 0; i < habitId.length; i++) {
    hash = (hash << 5) - hash + habitId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000000) + 1000;
}

/**
 * Configures the Android notification channel and schedules recurring daily notifications
 * for each individual habit at its allocated time, along with morning kick-off and evening reflection.
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
        description: 'Timely reminders when scheduled habit times arrive',
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
          schedule: { on: { hour: mH, minute: mM }, repeats: true }
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
          schedule: { on: { hour: eH, minute: eM }, repeats: true }
        });
      }
    }

    // 6. Schedule every habit at its individually allocated time
    if (notifications.habitRemindersEnabled !== false) {
      habits.forEach((habit) => {
        if (!habit.time) return;
        const [hH, hM] = habit.time.split(':').map(Number);
        if (isNaN(hH) || isNaN(hM)) return;

        const notifId = getHabitNotificationId(habit.id);
        const detail = habit.identity
          ? `“${habit.identity}”`
          : habit.note
          ? habit.note
          : `Stay consistent with your ${habit.category || 'daily'} habit!`;

        const locationText = habit.location ? ` (📍 ${habit.location})` : '';

        list.push({
          id: notifId,
          title: `Time for: ${habit.name} ⏰`,
          body: `${detail}${locationText}`,
          channelId: 'habits-daily-channel',
          schedule: { on: { hour: hH, minute: hM }, repeats: true }
        });
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
