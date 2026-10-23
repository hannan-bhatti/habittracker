import type React from 'react';
import { useState } from 'react';
import {
  Check,
  Flame,
  Clock,
  MapPin,
  Link2,
  Edit3,
  Trash2,
  Search,
  Plus,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import type { Habit, EnrichedHabit, DayInfo, CategoryInfo } from '../types/habit';
import { triggerHaptic } from '../utils/haptics';

interface HabitTableProps {
  habits: EnrichedHabit[];
  allHabitsCount: number;
  categoryCounts?: Record<string, number>;
  weekDays: DayInfo[];
  selectedDateStr: string;
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onOpenEditModal: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenAddModal: () => void;
  onLoadTemplates?: () => void;
  popEffects: Record<string, number>;
}

export const HabitTable: React.FC<HabitTableProps> = ({
  habits,
  allHabitsCount,
  categoryCounts,
  weekDays,
  selectedDateStr,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onToggleHabitDate,
  onOpenEditModal,
  onDeleteHabit,
  onOpenAddModal,
  onLoadTemplates,
  popEffects
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Category Pills & Search Filter */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onSelectCategory('All');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({allHabitsCount})
          </button>
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const count = categoryCounts ? (categoryCounts[cat.id] ?? 0) : habits.filter((h) => h.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  triggerHaptic('selection');
                  onSelectCategory(cat.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search habits, cues, places..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Habits Matrix Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3.5 pl-5 pr-3">Habit & Intention Cues</th>
                {weekDays.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`py-3.5 px-1 text-center w-11 ${
                      d.dateStr === selectedDateStr
                        ? 'text-teal-600 dark:text-teal-400 font-black'
                        : ''
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] font-medium opacity-75">{d.dayNumber}</div>
                  </th>
                ))}
                <th className="py-3.5 pr-5 text-right w-24">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    {allHabitsCount === 0 ? (
                      <div className="max-w-md mx-auto px-4 py-3 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-xs">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                            Start Your Personal Habit Journey
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Your habit tracker is ready! Create your own personal habit, or load our starter template for inspiration.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={onOpenAddModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Create Your First Habit
                          </button>
                          {onLoadTemplates && (
                            <button
                              type="button"
                              onClick={onLoadTemplates}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              Load Starter Templates
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-2">
                        <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                          No habits found matching your filter
                        </p>
                        <p className="text-xs text-slate-400">
                          {searchQuery
                            ? `No results for "${searchQuery}". Try a different keyword.`
                            : `No habits exist in the "${selectedCategory}" category.`}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={onOpenAddModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/70 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add a Habit in {selectedCategory}
                          </button>
                          {selectedCategory !== 'All' && (
                            <button
                              type="button"
                              onClick={() => onSelectCategory('All')}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            >
                              Show All Categories
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                habits.map((h) => {
                  const categoryInfo = categories.find((c) => c.id === h.category);
                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Habit Details */}
                      <td className="py-3.5 pl-5 pr-3 max-w-[280px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {h.name}
                              </span>
                              {categoryInfo && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${categoryInfo.badgeClass}`}>
                                  {categoryInfo.label}
                                </span>
                              )}
                            </div>

                            {/* Implementation Intention Cues */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium">
                                <Clock className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                                {h.time}
                              </span>
                              <span className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[130px]">
                                <MapPin className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                                {h.location}
                              </span>
                              {h.stackedAnchorHabit && (
                                <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[140px]">
                                  <Link2 className="w-2.5 h-2.5" />
                                  After {h.stackedAnchorHabit.name}
                                </span>
                              )}
                            </div>

                            {/* Aligned Identity Pill */}
                            {h.identity && (
                              <div
                                className="inline-flex items-center gap-1 text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50/90 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/70 rounded-md px-1.5 py-0.5 truncate max-w-[240px]"
                                title={`Aligned Identity: "${h.identity}"`}
                              >
                                <Sparkles className="w-2.5 h-2.5 shrink-0 text-teal-600 dark:text-teal-400" />
                                <span className="truncate italic font-medium">&ldquo;{h.identity}&rdquo;</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 shrink-0">
                            {confirmDeleteId === h.id ? (
                              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-lg text-[11px] text-red-600">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteHabit(h.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="font-bold underline cursor-pointer"
                                >
                                  Del
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-slate-400 cursor-pointer ml-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onOpenEditModal(h)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit habit"
                                  aria-label="Edit habit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(h.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                  title="Delete habit"
                                  aria-label="Delete habit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 7-Day Completion Checkboxes */}
                      {weekDays.map((d) => {
                        const isDone = Boolean(h.completedDates && h.completedDates[d.dateStr]);
                        const isSelectedDay = d.dateStr === selectedDateStr;
                        const hasPop = Boolean(popEffects[`${h.id}-${d.dateStr}`]);

                        return (
                          <td key={d.dateStr} className="py-2 px-1 text-center relative">
                            {hasPop && (
                              <span className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold animate-float-plus shadow-sm whitespace-nowrap">
                                +1 Vote
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onToggleHabitDate(h.id, d.dateStr)}
                              className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-xs hover:brightness-105 active:scale-90'
                                  : isSelectedDay
                                  ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-300 dark:text-slate-600 hover:border-teal-400 hover:bg-white dark:hover:bg-slate-700'
                              }`}
                              title={`${isDone ? 'Mark uncompleted' : 'Mark completed'} for ${d.full} (${d.displayDate})`}
                              aria-label={`Toggle habit ${h.name} on ${d.full}`}
                            >
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[3] animate-check-pop" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Streak Column */}
                      <td className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-teal-600 dark:text-teal-400">
                          <Flame className="w-3.5 h-3.5 fill-teal-500/20" />
                          {h.stats.currentStreak}d
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 block">
                          Best {h.stats.longestStreak}d
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
