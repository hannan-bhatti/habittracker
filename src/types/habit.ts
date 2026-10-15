import type React from 'react';

export interface Habit {
  id: string;
  name: string;
  category: string;
  targetPerWeek: number;
  priorStreak: number;
  bestStreakRecord: number;
  note: string;
  time: string; // e.g., "05:30", "07:00", "22:30"
  location: string; // e.g., "Living Room Mat", "Prayer Rug / Mosque", "Home Desk"
  stackedOnHabitId?: string; // ID of the anchor habit
  // Persistent completions by YYYY-MM-DD date key: true
  completedDates: Record<string, boolean>;
  createdAt: string;
}

export interface HabitStats {
  completedThisWeek: number;
  completionRateThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  isTargetMet: boolean;
}

export interface EnrichedHabit extends Habit {
  stats: HabitStats;
  stackedAnchorHabit?: Habit;
}

export interface DayInfo {
  key: string;       // "Mon", "Tue", etc.
  label: string;     // "Mon"
  full: string;      // "Monday"
  dateStr: string;   // "YYYY-MM-DD"
  displayDate: string; // "Oct 15"
  dayNumber: number; // 15
  isToday: boolean;
  isFuture: boolean;
}

export interface CategoryInfo {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  accent: string;
}

export interface DailyChartPoint {
  day: string;
  fullDay: string;
  date: string;
  dateStr: string;
  percentage: number;
  completed: number;
  total: number;
  isSelected: boolean;
  isFuture: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  morningTime: string;
  eveningTime: string;
  soundEnabled: boolean;
}

export interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  isUnlocked: boolean;
  progressText: string;
  progressPct: number;
}
