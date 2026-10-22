import React, { useMemo } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import type { Habit } from '../../types/habit';
import { formatDateKey, parseDateKey, getTodayDateKey } from '../../utils/dateUtils';

interface HeatmapTabProps {
  habits: Habit[];
  todayKey?: string;
  onSelectDate: (dateStr: string) => void;
}

export const HeatmapTab: React.FC<HeatmapTabProps> = ({ habits, todayKey: propTodayKey, onSelectDate }) => {
  const todayKey = propTodayKey || getTodayDateKey();

  // Generate real 20-week historical grid ending on current week's Sunday
  const heatmapData = useMemo(() => {
    const totalWeeks = 20;
    const anchorDate = parseDateKey(todayKey);
    const currentDay = anchorDate.getDay();
    // End date is Sunday of current week
    const diffToSunday = (currentDay === 0 ? 0 : 7 - currentDay);
    const endSunday = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate() + diffToSunday);

    // Start date is 20 weeks before (total 140 days)
    const startDate = new Date(endSunday);
    startDate.setDate(startDate.getDate() - (totalWeeks * 7 - 1));

    const weeks = [];
    const curDate = new Date(startDate);

    let totalCheckinsCount = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = formatDateKey(curDate);
        const isFuture = dateStr > todayKey;

        // Calculate actual completions on this date
        const completedCount = habits.filter(
          (h) => Boolean(h.completedDates && h.completedDates[dateStr])
        ).length;

        totalCheckinsCount += completedCount;

        const totalHabits = habits.length;
        const pct = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

        let level = 0;
        if (completedCount > 0) {
          if (pct >= 80) level = 4;
          else if (pct >= 55) level = 3;
          else if (pct >= 30) level = 2;
          else level = 1;
        }

        days.push({
          dateStr,
          dateObj: new Date(curDate),
          level,
          completedCount,
          totalHabits,
          pct: Math.round(pct),
          isFuture,
          isToday: dateStr === todayKey
        });

        curDate.setDate(curDate.getDate() + 1);
      }
      weeks.push(days);
    }

    return { weeks, totalCheckinsCount };
  }, [habits, todayKey]);

  const levelClasses: Record<number, string> = {
    0: 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-800',
    1: 'bg-teal-200 dark:bg-teal-950/80 border-teal-300 dark:border-teal-900',
    2: 'bg-teal-400 dark:bg-teal-800 border-teal-500 dark:border-teal-700',
    3: 'bg-teal-600 dark:bg-teal-600 border-teal-700 dark:border-teal-500',
    4: 'bg-teal-500 dark:bg-teal-400 border-teal-400 dark:border-teal-300 shadow-2xs'
  };

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Consistency Heatmap (Last 20 Weeks)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every green square represents real completed habits on that day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5" />
            {heatmapData.totalCheckinsCount} Lifetime Check-ins
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px] flex gap-2">
          {/* Day of Week Labels */}
          <div className="flex flex-col justify-between py-1 text-[10px] font-bold text-slate-400 select-none">
            {dayLabels.map((l, i) => (
              <span key={i} className="h-4 leading-4">{l}</span>
            ))}
          </div>

          {/* 20 Week Columns */}
          <div className="flex-1 flex gap-1.5">
            {heatmapData.weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex-1 flex flex-col gap-1.5">
                {week.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => onSelectDate(d.dateStr)}
                    className={`h-4 rounded-md border transition-all cursor-pointer hover:scale-125 relative group ${
                      levelClasses[d.level]
                    } ${d.isToday ? 'ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900' : ''} ${
                      d.isFuture ? 'opacity-30 pointer-events-none' : ''
                    }`}
                    title={`${d.dateStr}: ${d.completedCount}/${d.totalHabits} completed (${d.pct}%)`}
                    aria-label={`${d.dateStr}: ${d.completedCount} completed`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px]">Click any cell to navigate to that day</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px]">Less</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <span className="w-3 h-3 rounded-xs bg-teal-200 dark:bg-teal-950 border border-teal-300 dark:border-teal-900" />
            <span className="w-3 h-3 rounded-xs bg-teal-400 dark:bg-teal-800 border border-teal-500 dark:border-teal-700" />
            <span className="w-3 h-3 rounded-xs bg-teal-600 dark:bg-teal-600 border border-teal-700 dark:border-teal-500" />
            <span className="w-3 h-3 rounded-xs bg-teal-500 dark:bg-teal-400 border border-teal-400 dark:border-teal-300" />
          </div>
          <span className="text-[10px]">More</span>
        </div>
      </div>
    </div>
  );
};
