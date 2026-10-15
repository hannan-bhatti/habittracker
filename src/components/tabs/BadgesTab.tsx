import type React from 'react';
import { Award, Lock, Sparkles } from 'lucide-react';
import type { BadgeItem } from '../../types/habit';

interface BadgesTabProps {
  badges: BadgeItem[];
}

export const BadgesTab: React.FC<BadgesTabProps> = ({ badges }) => {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Milestone Badges & Achievements</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earn genuine milestone badges as your consistency compounds over time.
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <Sparkles className="w-3.5 h-3.5" />
          {unlockedCount} of {badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {badges.map((badge) => {
          const IconComp = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? 'bg-white dark:bg-slate-900/90 border-teal-500/40 shadow-xs hover:border-teal-500'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.isUnlocked
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-2xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {badge.title}
                      </h3>
                      {badge.isUnlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
                          Unlocked
                        </span>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{badge.progressText}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-300"
                    style={{ width: `${badge.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
