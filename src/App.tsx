import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  Sparkles,
  Award,
  Layers,
  LayoutDashboard,
  Calendar,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { LocalNotifications } from '@capacitor/local-notifications';

import type {
  Habit,
  EnrichedHabit,
  DailyChartPoint,
  BadgeItem,
  NotificationConfig
} from './types/habit';
import { CATEGORIES } from './constants/categories';

import {
  getWeekDates,
  getTodayDateKey,
  parseDateKey
} from './utils/dateUtils';
import { triggerHaptic } from './utils/haptics';
import { playCompletionChime, playUncheckTone } from './utils/soundUtils';
import {
  calculateHabitStats,
  calculateOverallDailyStreak,
  calculateIdentitySummaries
} from './utils/streakUtils';
import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
  loadJournalsFromStorage,
  saveJournalsToStorage,
  loadNotificationsFromStorage,
  saveNotificationsToStorage,
  loadDarkModeFromStorage,
  saveDarkModeToStorage,
  getInitialHabits,
  loadCustomIdentitiesFromStorage,
  saveCustomIdentitiesToStorage,
  loadDeletedIdentitiesFromStorage,
  saveDeletedIdentitiesToStorage
} from './utils/storageUtils';

import { Header } from './components/Header';
import { WeekNavigator } from './components/WeekNavigator';
import { DashboardStats } from './components/DashboardStats';
import { DailyReflectionCard } from './components/DailyReflectionCard';
import { HabitTable } from './components/HabitTable';
import { WeeklyChart } from './components/WeeklyChart';
import { IdentityTab } from './components/tabs/IdentityTab';
import { StacksTab } from './components/tabs/StacksTab';
import { HeatmapTab } from './components/tabs/HeatmapTab';
import { BadgesTab } from './components/tabs/BadgesTab';
import { HabitModal } from './components/modals/HabitModal';
import { NotificationModal } from './components/modals/NotificationModal';
import { BackupModal } from './components/modals/BackupModal';

export default function App() {
  // Theme & Notifications initial state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadDarkModeFromStorage());
  const [notifications, setNotifications] = useState<NotificationConfig>(() => loadNotificationsFromStorage());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const cfg = loadNotificationsFromStorage();
    return cfg.soundEnabled ?? true;
  });

  // Active View Tab: 'dashboard' | 'identity' | 'stacks' | 'heatmap' | 'badges'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'identity' | 'stacks' | 'heatmap' | 'badges'>('dashboard');

  // Multi-week navigation state
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateKey());

  // Core Data
  const [habits, setHabits] = useState<Habit[]>(() => loadHabitsFromStorage());
  const [dailyJournals, setDailyJournals] = useState<Record<string, string>>(() => loadJournalsFromStorage());
  const [customIdentities, setCustomIdentities] = useState<string[]>(() => loadCustomIdentitiesFromStorage());
  const [deletedIdentities, setDeletedIdentities] = useState<string[]>(() => loadDeletedIdentitiesFromStorage());
  const [preselectedIdentity, setPreselectedIdentity] = useState<string>('');

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI feedback & animations
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [popEffects, setPopEffects] = useState<Record<string, number>>({});
  const [logoTapped, setLogoTapped] = useState<boolean>(false);

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Sync Dark Mode class with body & Android status bar
  useEffect(() => {
    saveDarkModeToStorage(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#070b12' }).catch(() => {});
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#f8fafc' }).catch(() => {});
    }
  }, [isDarkMode]);

  // Hide Native Splash on Mount
  useEffect(() => {
    SplashScreen.hide().catch(() => {});
    triggerHaptic('light');
  }, []);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    const isAnyModalOpen = isHabitModalOpen || isNotifModalOpen || isBackupModalOpen;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHabitModalOpen, isNotifModalOpen, isBackupModalOpen]);

  // Persist habits
  useEffect(() => {
    saveHabitsToStorage(habits);
  }, [habits]);

  // Persist journals
  useEffect(() => {
    saveJournalsToStorage(dailyJournals);
  }, [dailyJournals]);

  // Persist notifications config
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  // Auto-dismiss celebration toast
  useEffect(() => {
    if (!celebrationToast) return;
    const timer = setTimeout(() => setCelebrationToast(null), 2500);
    return () => clearTimeout(timer);
  }, [celebrationToast]);

  const showToast = useCallback((msg: string) => {
    setCelebrationToast(msg);
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0d9488', '#0284c7', '#38bdf8', '#f59e0b']
      });
    } catch {
      // Ignored
    }
  }, []);

  // Compute 7 days for the active week view
  const weekDays = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Handle week offset changes synchronously without setState in effect
  const handleChangeWeekOffset = (newOffset: number) => {
    setWeekOffset(newOffset);
    const newWeekDays = getWeekDates(newOffset);
    const todayDay = newWeekDays.find((d) => d.isToday);
    setSelectedDateStr(todayDay ? todayDay.dateStr : newWeekDays[0].dateStr);
  };

  // Enriched Habits with week stats & stacked anchor resolution
  const enrichedHabits = useMemo(() => {
    const habitMap = new Map<string, Habit>();
    habits.forEach((h) => habitMap.set(h.id, h));

    return habits.map((h): EnrichedHabit => ({
      ...h,
      stats: calculateHabitStats(h, weekDays),
      stackedAnchorHabit: h.stackedOnHabitId ? habitMap.get(h.stackedOnHabitId) : undefined
    }));
  }, [habits, weekDays]);

  // Identity Summaries aggregating votes per identity (including custom-defined identities)
  const identitySummaries = useMemo(() => {
    return calculateIdentitySummaries(enrichedHabits, customIdentities);
  }, [enrichedHabits, customIdentities]);

  // Filtered Habits by category & search
  const filteredHabits = useMemo(() => {
    return enrichedHabits.filter((h) => {
      const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        (h.location && h.location.toLowerCase().includes(q)) ||
        (h.note && h.note.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [enrichedHabits, selectedCategory, searchQuery]);

  // Habit Stacking Chains
  const habitStacksChains = useMemo(() => {
    const chains: Array<{ anchor: Habit; stacked: EnrichedHabit[] }> = [];
    const stackedHabits = enrichedHabits.filter((h) => h.stackedAnchorHabit);
    const anchorMap = new Map<string, EnrichedHabit[]>();

    stackedHabits.forEach((sh) => {
      if (sh.stackedAnchorHabit) {
        const arr = anchorMap.get(sh.stackedAnchorHabit.id) || [];
        arr.push(sh);
        anchorMap.set(sh.stackedAnchorHabit.id, arr);
      }
    });

    anchorMap.forEach((stacked, anchorId) => {
      const anchor = habits.find((h) => h.id === anchorId);
      if (anchor) {
        chains.push({ anchor, stacked });
      }
    });

    return chains;
  }, [enrichedHabits, habits]);

  // Daily Chart Points & Metrics
  const dashboardMetrics = useMemo(() => {
    const totalHabits = habits.length;

    const dailyChartData: DailyChartPoint[] = weekDays.map((d) => {
      const completed = habits.filter((h) => Boolean(h.completedDates && h.completedDates[d.dateStr])).length;
      const percentage = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      return {
        day: d.label,
        fullDay: d.full,
        date: d.displayDate,
        dateStr: d.dateStr,
        percentage,
        completed,
        total: totalHabits,
        isSelected: d.dateStr === selectedDateStr,
        isFuture: d.isFuture
      };
    });

    const selectedPoint = dailyChartData.find((p) => p.dateStr === selectedDateStr) || dailyChartData[0];
    const selectedDayDone = selectedPoint ? selectedPoint.completed : 0;
    const selectedDayPct = selectedPoint ? selectedPoint.percentage : 0;

    const totalCheckinsWeek = dailyChartData.reduce((acc, d) => acc + d.completed, 0);
    const totalPossibleWeek = totalHabits * 7;
    const weeklyCompletionPct = totalPossibleWeek > 0 ? Math.round((totalCheckinsWeek / totalPossibleWeek) * 100) : 0;

    // Calculate overall daily streak accurately without magic numbers
    const overallStreak = calculateOverallDailyStreak(habits);

    const sortedByBest = [...enrichedHabits].sort((a, b) => {
      if (b.stats.completionRateThisWeek !== a.stats.completionRateThisWeek) {
        return b.stats.completionRateThisWeek - a.stats.completionRateThisWeek;
      }
      return b.stats.currentStreak - a.stats.currentStreak;
    });

    return {
      selectedDayDone,
      selectedDayPct,
      totalHabits,
      overallStreak,
      totalCheckinsWeek,
      totalPossibleWeek,
      weeklyCompletionPct,
      bestHabit: sortedByBest[0] || null,
      dailyChartData
    };
  }, [habits, weekDays, selectedDateStr, enrichedHabits]);

  // Day Completion Rates map for the 7-day strip
  const dayCompletionRates = useMemo(() => {
    const map: Record<string, number> = {};
    dashboardMetrics.dailyChartData.forEach((d) => {
      map[d.dateStr] = d.percentage;
    });
    return map;
  }, [dashboardMetrics.dailyChartData]);

  // Honest Milestone Badges
  const badges: BadgeItem[] = useMemo(() => {
    let totalLifetimeCheckins = 0;
    habits.forEach((h) => {
      totalLifetimeCheckins += Object.values(h.completedDates || {}).filter(Boolean).length;
    });

    const overallStreak = dashboardMetrics.overallStreak;
    const journalCount = Object.values(dailyJournals).filter((j) => j && j.trim().length > 0).length;
    const stackedCount = habits.filter((h) => h.stackedOnHabitId).length;

    return [
      {
        id: 'b1',
        title: 'First Step',
        desc: 'Log your first completed habit routine',
        icon: Sparkles,
        isUnlocked: totalLifetimeCheckins >= 1,
        progressText: `${Math.min(1, totalLifetimeCheckins)}/1 Done`,
        progressPct: Math.min(100, totalLifetimeCheckins >= 1 ? 100 : 0)
      },
      {
        id: 'b2',
        title: '3-Day Momentum',
        desc: 'Maintain an active habit streak of at least 3 days',
        icon: Flame,
        isUnlocked: overallStreak >= 3,
        progressText: `${Math.min(3, overallStreak)}/3 Days`,
        progressPct: Math.min(100, Math.round((overallStreak / 3) * 100))
      },
      {
        id: 'b3',
        title: '7-Day Rhythm',
        desc: 'Keep an active daily streak going for a full week',
        icon: Award,
        isUnlocked: overallStreak >= 7,
        progressText: `${Math.min(7, overallStreak)}/7 Days`,
        progressPct: Math.min(100, Math.round((overallStreak / 7) * 100))
      },
      {
        id: 'b4',
        title: 'Habit Stacker',
        desc: 'Create at least 2 linked habit stacks',
        icon: Layers,
        isUnlocked: stackedCount >= 2,
        progressText: `${Math.min(2, stackedCount)}/2 Stacks`,
        progressPct: Math.min(100, Math.round((stackedCount / 2) * 100))
      },
      {
        id: 'b5',
        title: 'Century Club',
        desc: 'Achieve 50 total lifetime check-ins',
        icon: Award,
        isUnlocked: totalLifetimeCheckins >= 50,
        progressText: `${Math.min(50, totalLifetimeCheckins)}/50 Logs`,
        progressPct: Math.min(100, Math.round((totalLifetimeCheckins / 50) * 100))
      },
      {
        id: 'b6',
        title: 'Mindful Soul',
        desc: 'Write 3 daily reflection journal entries',
        icon: Award,
        isUnlocked: journalCount >= 3,
        progressText: `${Math.min(3, journalCount)}/3 Notes`,
        progressPct: Math.min(100, Math.round((journalCount / 3) * 100))
      }
    ];
  }, [habits, dashboardMetrics.overallStreak, dailyJournals]);

  // Toggle habit check-in for a specific date
  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentDates = { ...(h.completedDates || {}) };
        const nextVal = !currentDates[dateStr];

        if (nextVal) {
          currentDates[dateStr] = true;
          triggerHaptic('success');
          playCompletionChime(soundEnabled);
          triggerCelebration();
          if (h.identity) {
            showToast(`+1 Vote cast: "${h.identity}"`);
          } else {
            showToast(`Checked off "${h.name}"`);
          }

          // Animation pop effect
          setPopEffects((pe) => ({ ...pe, [`${habitId}-${dateStr}`]: Date.now() }));
          setTimeout(() => {
            setPopEffects((pe) => {
              const copy = { ...pe };
              delete copy[`${habitId}-${dateStr}`];
              return copy;
            });
          }, 900);
        } else {
          delete currentDates[dateStr];
          triggerHaptic('light');
          playUncheckTone(soundEnabled);
        }

        return { ...h, completedDates: currentDates };
      })
    );
  };

  // Identity Handlers (Custom & Pre-defined)
  const handleAddCustomIdentity = (identity: string) => {
    const trimmed = identity.trim();
    if (!trimmed) return;
    setCustomIdentities((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [trimmed, ...prev];
      saveCustomIdentitiesToStorage(next);
      return next;
    });
    // If it was previously marked as deleted, unmark it
    setDeletedIdentities((prev) => {
      if (!prev.includes(trimmed)) return prev;
      const next = prev.filter((id) => id !== trimmed);
      saveDeletedIdentitiesToStorage(next);
      return next;
    });
    showToast(`Saved identity: "${trimmed}"`);
  };

  const handleDeleteIdentity = (identity: string) => {
    const trimmed = identity.trim();
    if (!trimmed) return;

    // 1. Add to deleted identities list (to hide from predefined suggestions)
    setDeletedIdentities((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      saveDeletedIdentitiesToStorage(next);
      return next;
    });

    // 2. Remove from customIdentities list (if present)
    setCustomIdentities((prev) => {
      const next = prev.filter((id) => id !== trimmed);
      saveCustomIdentitiesToStorage(next);
      return next;
    });

    // 3. Unlink from any existing habits that held this identity
    setHabits((prev) =>
      prev.map((h) => (h.identity === trimmed ? { ...h, identity: undefined } : h))
    );

    // 4. Clear preselected identity if matching
    if (preselectedIdentity === trimmed) {
      setPreselectedIdentity('');
    }

    showToast(`Deleted identity: "${trimmed}"`);
  };

  const handleRestoreDefaultIdentities = () => {
    setDeletedIdentities([]);
    saveDeletedIdentitiesToStorage([]);
    showToast('Restored all default identity suggestions! ✨');
  };


  // Habit CRUD
  const handleOpenAddModal = (catId?: string, identity?: string) => {
    triggerHaptic('selection');
    setEditingHabit(null);
    if (catId && catId !== 'All') setSelectedCategory(catId);
    setPreselectedIdentity(identity || '');
    setIsHabitModalOpen(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    triggerHaptic('selection');
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = (habitData: Partial<Habit>) => {
    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === editingHabit.id
            ? {
                ...h,
                ...habitData,
                name: habitData.name || h.name,
                category: habitData.category || h.category,
                time: habitData.time || h.time,
                location: habitData.location || h.location,
                stackedOnHabitId: habitData.stackedOnHabitId,
                targetPerWeek: habitData.targetPerWeek || h.targetPerWeek,
                note: habitData.note !== undefined ? habitData.note : h.note,
                identity: habitData.identity !== undefined ? habitData.identity : h.identity
              }
            : h
        )
      );
      showToast(`Updated "${habitData.name}"`);
    } else {
      // Create new habit with empty completedDates
      const newHabit: Habit = {
        id: `h_${Date.now()}`,
        name: habitData.name || 'Untitled Habit',
        category: habitData.category || 'Fitness',
        time: habitData.time || '07:00',
        location: habitData.location || 'Home',
        stackedOnHabitId: habitData.stackedOnHabitId,
        targetPerWeek: habitData.targetPerWeek || 5,
        priorStreak: 0,
        bestStreakRecord: 1,
        note: habitData.note || 'Small daily steps build lasting consistency',
        identity: habitData.identity,
        completedDates: {},
        createdAt: new Date().toISOString()
      };
      setHabits((prev) => [newHabit, ...prev]);
      showToast(`Added: "${newHabit.name}"`);
    }
    setIsHabitModalOpen(false);
  };

  const handleDeleteHabit = (id: string) => {
    triggerHaptic('light');
    // Clean up dangling pointers: if any habit was stacked on this deleted habit, clear stackedOnHabitId (Fixes Bug 7)
    setHabits((prev) =>
      prev
        .filter((h) => h.id !== id)
        .map((h) => (h.stackedOnHabitId === id ? { ...h, stackedOnHabitId: undefined } : h))
    );
    showToast('Habit removed');
  };

  // Schedule notifications with Capacitor
  const handleSaveNotifications = async () => {
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        if (notifications.enabled) {
          const list = [];
          const [mH, mM] = notifications.morningTime.split(':').map(Number);
          list.push({
            id: 101,
            title: 'Daily Habit Momentum ☀️',
            body: 'A fresh day has begun. Check off your morning routines!',
            schedule: { on: { hour: mH, minute: mM }, repeats: true }
          });

          const [eH, eM] = notifications.eveningTime.split(':').map(Number);
          list.push({
            id: 103,
            title: 'Evening Reflection 🌙',
            body: 'Review your habit streaks and write your 1-sentence reflection.',
            schedule: { on: { hour: eH, minute: eM }, repeats: true }
          });

          await LocalNotifications.schedule({ notifications: list });
          showToast('Notification schedule updated!');
        } else {
          showToast('Notifications disabled.');
        }
      }
    } catch {
      showToast('Notification preferences saved.');
    }
    setIsNotifModalOpen(false);
  };

  // Selected Day Display info
  const selectedDayInfo = useMemo(() => {
    const found = weekDays.find((d) => d.dateStr === selectedDateStr);
    if (found) return found;
    const d = parseDateKey(selectedDateStr);
    return {
      key: 'Day',
      label: 'Day',
      full: 'Selected Day',
      dateStr: selectedDateStr,
      displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
      dayNumber: d.getDate(),
      isToday: selectedDateStr === getTodayDateKey(),
      isFuture: selectedDateStr > getTodayDateKey()
    };
  }, [weekDays, selectedDateStr]);

  const todayDateFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(parseDateKey(getTodayDateKey()));
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-[#070b12] text-slate-100' : 'bg-slate-50 text-slate-900'
      } pb-20 antialiased`}
    >
      {/* Toast Notification */}
      {celebrationToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-teal-600 text-white text-xs sm:text-sm font-bold shadow-xl animate-check-pop flex items-center gap-2 select-none">
          <Sparkles className="w-4 h-4" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled((prev) => {
            const next = !prev;
            setNotifications((n) => ({ ...n, soundEnabled: next }));
            return next;
          });
        }}
        onOpenAddModal={() => handleOpenAddModal(selectedCategory)}
        onOpenNotifModal={() => setIsNotifModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        logoTapped={logoTapped}
        onTapLogo={() => {
          setLogoTapped(true);
          triggerHaptic('light');
          setTimeout(() => setLogoTapped(false), 800);
        }}
        todayDateFormatted={todayDateFormatted}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('dashboard');
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('identity');
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'identity'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Identity Hub ({identitySummaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('stacks');
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stacks'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Habit Stacks ({habitStacksChains.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('heatmap');
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>20-Week Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('badges');
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badges ({badges.filter((b) => b.isUnlocked).length}/{badges.length})</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dynamic Week Navigator */}
            <WeekNavigator
              weekDays={weekDays}
              selectedDateStr={selectedDateStr}
              onSelectDate={(dateStr) => setSelectedDateStr(dateStr)}
              weekOffset={weekOffset}
              onChangeWeekOffset={handleChangeWeekOffset}
              dayCompletionRates={dayCompletionRates}
            />

            {/* Dashboard Stats Cards */}
            <DashboardStats
              selectedDayDone={dashboardMetrics.selectedDayDone}
              totalHabits={dashboardMetrics.totalHabits}
              selectedDayPct={dashboardMetrics.selectedDayPct}
              selectedDayLabel={selectedDayInfo.isToday ? 'Today' : selectedDayInfo.label}
              overallStreak={dashboardMetrics.overallStreak}
              totalCheckinsWeek={dashboardMetrics.totalCheckinsWeek}
              totalPossibleWeek={dashboardMetrics.totalPossibleWeek}
              weeklyCompletionPct={dashboardMetrics.weeklyCompletionPct}
              bestHabit={dashboardMetrics.bestHabit}
            />

            {/* Daily 1-Sentence Reflection Card */}
            <DailyReflectionCard
              selectedDateStr={selectedDateStr}
              selectedDisplayDate={selectedDayInfo.displayDate}
              journalText={dailyJournals[selectedDateStr] || ''}
              onChangeJournal={(dateStr, text) => {
                setDailyJournals((prev) => ({ ...prev, [dateStr]: text }));
              }}
            />

            {/* Habits Matrix Table */}
            <HabitTable
              habits={filteredHabits}
              allHabitsCount={habits.length}
              weekDays={weekDays}
              selectedDateStr={selectedDateStr}
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              onToggleHabitDate={handleToggleHabitDate}
              onOpenEditModal={handleOpenEditModal}
              onDeleteHabit={handleDeleteHabit}
              onOpenAddModal={() => handleOpenAddModal(selectedCategory)}
              popEffects={popEffects}
            />

            {/* Weekly Progress Trend Chart */}
            <WeeklyChart
              chartData={dashboardMetrics.dailyChartData}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* TAB 2: IDENTITY HUB */}
        {activeTab === 'identity' && (
          <IdentityTab
            identities={identitySummaries}
            onOpenAddModalWithCategory={(catId, identity) => handleOpenAddModal(catId, identity)}
            onAddCustomIdentity={handleAddCustomIdentity}
            onDeleteIdentity={handleDeleteIdentity}
          />
        )}

        {/* TAB 2: HABIT STACKS */}
        {activeTab === 'stacks' && (
          <StacksTab
            chains={habitStacksChains}
            onOpenAddModal={() => handleOpenAddModal('Fitness')}
          />
        )}

        {/* TAB 3: HEATMAP */}
        {activeTab === 'heatmap' && (
          <HeatmapTab
            habits={habits}
            onSelectDate={(dateStr) => {
              setSelectedDateStr(dateStr);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* TAB 4: BADGES */}
        {activeTab === 'badges' && <BadgesTab badges={badges} />}
      </main>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setPreselectedIdentity('');
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
        habits={habits}
        categories={CATEGORIES}
        defaultCategory={selectedCategory === 'All' ? 'Fitness' : selectedCategory}
        initialIdentity={preselectedIdentity}
        customIdentities={customIdentities}
        deletedIdentities={deletedIdentities}
        onAddCustomIdentity={handleAddCustomIdentity}
        onDeleteCustomIdentity={handleDeleteIdentity}
        onDeletePredefinedIdentity={handleDeleteIdentity}
        onRestoreDefaultIdentities={handleRestoreDefaultIdentities}
      />

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        config={notifications}
        onChangeConfig={(newCfg) => setNotifications(newCfg)}
        onSave={handleSaveNotifications}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        habits={habits}
        journals={dailyJournals}
        onImportSuccess={(newHabits, newJournals, importedCustomIdentities, importedDeletedIdentities) => {
          setHabits(newHabits);
          setDailyJournals(newJournals);
          if (importedCustomIdentities && importedCustomIdentities.length > 0) {
            setCustomIdentities(importedCustomIdentities);
            saveCustomIdentitiesToStorage(importedCustomIdentities);
          }
          if (importedDeletedIdentities) {
            setDeletedIdentities(importedDeletedIdentities);
            saveDeletedIdentitiesToStorage(importedDeletedIdentities);
          }
        }}
        onResetDefaults={() => {
          setHabits(getInitialHabits());
          setDailyJournals({
            [getTodayDateKey()]: 'Fresh start with clear intentions and momentum.'
          });
          setCustomIdentities([]);
          saveCustomIdentitiesToStorage([]);
          setDeletedIdentities([]);
          saveDeletedIdentitiesToStorage([]);
        }}
        showToast={showToast}
      />
    </div>
  );
}