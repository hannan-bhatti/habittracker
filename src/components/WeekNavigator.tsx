import type React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { DayInfo } from '../types/habit';
import { formatWeekRangeDisplay } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/haptics';

interface WeekNavigatorProps {
  weekDays: DayInfo[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  weekOffset: number;
  onChangeWeekOffset: (newOffset: number) => void;
  dayCompletionRates: Record<string, number>;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekDays,
  selectedDateStr,
  onSelectDate,
  weekOffset,
  onChangeWeekOffset,
  dayCompletionRates
}) => {
  const rangeDisplay = formatWeekRangeDisplay(weekDays);

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5">
      {/* Week Header & Range Navigator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {rangeDisplay}
          </span>
          {weekOffset === 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Current Week
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onChangeWeekOffset(0);
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors cursor-pointer mr-1"
            >
              Current Week
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onChangeWeekOffset(weekOffset - 1);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Previous week"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onChangeWeekOffset(weekOffset + 1);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Next week"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((d) => {
          const isSelected = d.dateStr === selectedDateStr;
          const pct = dayCompletionRates[d.dateStr] || 0;

          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onSelectDate(d.dateStr);
              }}
              className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-600 to-sky-600 text-white border-teal-500 shadow-md shadow-teal-600/20 scale-[1.03] z-10'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-white dark:hover:bg-slate-800'
              } ${d.isFuture ? 'opacity-70' : ''}`}
            >
              {/* Day Label */}
              <span className={`text-[10px] sm:text-xs font-semibold ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-slate-400'}`}>
                {d.label}
              </span>

              {/* Day Number */}
              <span className="text-sm sm:text-base font-extrabold my-0.5">
                {d.dayNumber}
              </span>

              {/* Progress Dot / Ring */}
              <div className="mt-1 flex items-center justify-center">
                {pct >= 100 ? (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'} animate-pulse`} />
                ) : pct > 0 ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-200' : 'bg-sky-500'}`} />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-700'}`} />
                )}
              </div>

              {/* "Today" Badge */}
              {d.isToday && (
                <span
                  className={`absolute -top-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-tight uppercase ${
                    isSelected
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
