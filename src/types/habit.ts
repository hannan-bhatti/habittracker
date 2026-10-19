import type React from 'react';

export interface Habit {
  id: string;
  name: string;
  category: string;
  identity?: string; // Identity Statement: "I am the type of person who..."
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
  totalVotesCast: number; // Lifetime votes cast for this habit's identity
}

export interface EnrichedHabit extends Habit {
  stats: HabitStats;
  stackedAnchorHabit?: Habit;
}

export interface IdentitySummary {
  identity: string;
  category: string;
  totalVotes: number;
  weeklyVotes: number;
  levelName: string;
  levelTier: number; // 1 to 4
  levelProgressPct: number;
  nextTierVotes: number;
  habits: EnrichedHabit[];
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
  habitRemindersEnabled?: boolean;
  reminderLeadMinutes?: number; // Advance reminder minutes (e.g. 10m before). Default: 10
  remindAtExactTime?: boolean;  // Also alert right at habit start time. Default: true
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
