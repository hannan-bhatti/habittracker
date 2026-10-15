import type { DayInfo } from '../types/habit';

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns 7 DayInfo objects for the target week (Monday through Sunday).
 * @param weekOffset 0 for current week, -1 for last week, +1 for next week, etc.
 */
export function getWeekDates(weekOffset: number = 0): DayInfo[] {
  const now = new Date();
  const todayKey = getTodayDateKey();

  // Find Monday of the target week
  const currentDayOfWeek = now.getDay();
  const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek);

  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + (weekOffset * 7));

  const days: DayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = formatDateKey(d);
    const dayOfWeek = d.getDay();
    const dayLabel = DAY_NAMES[dayOfWeek];
    const fullDay = DAY_FULL_NAMES[dayOfWeek];
    const displayDate = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;

    days.push({
      key: dayLabel,
      label: dayLabel,
      full: fullDay,
      dateStr,
      displayDate,
      dayNumber: d.getDate(),
      isToday: dateStr === todayKey,
      isFuture: dateStr > todayKey
    });
  }

  return days;
}

export function formatWeekRangeDisplay(days: DayInfo[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[6];
  const firstDate = parseDateKey(first.dateStr);
  const lastDate = parseDateKey(last.dateStr);

  const firstMonth = MONTH_NAMES[firstDate.getMonth()];
  const lastMonth = MONTH_NAMES[lastDate.getMonth()];
  const year = lastDate.getFullYear();

  if (firstMonth === lastMonth) {
    return `${firstMonth} ${firstDate.getDate()} – ${lastDate.getDate()}, ${year}`;
  }
  return `${firstMonth} ${firstDate.getDate()} – ${lastMonth} ${lastDate.getDate()}, ${year}`;
}
