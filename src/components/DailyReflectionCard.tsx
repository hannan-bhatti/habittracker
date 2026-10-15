import type React from 'react';
import { BookOpen } from 'lucide-react';

interface DailyReflectionCardProps {
  selectedDateStr: string;
  selectedDisplayDate: string;
  journalText: string;
  onChangeJournal: (dateStr: string, text: string) => void;
}

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({
  selectedDateStr,
  selectedDisplayDate,
  journalText,
  onChangeJournal
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Daily Reflection ({selectedDisplayDate})
          </span>
        </div>
        <span className="text-[11px] text-slate-400">1 sentence reflection</span>
      </div>
      <input
        type="text"
        value={journalText}
        onChange={(e) => onChangeJournal(selectedDateStr, e.target.value)}
        placeholder="What went well today? (e.g., Focused morning work, prayed on time, calm mindset...)"
        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
      />
    </div>
  );
};
