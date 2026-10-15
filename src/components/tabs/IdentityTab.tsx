import { useState } from 'react';
import { UserCheck, Sparkles, Plus, Award, Quote, CheckCircle2 } from 'lucide-react';
import type { IdentitySummary } from '../../types/habit';
import { DEFAULT_IDENTITY_QUOTE } from '../../constants/identities';
import { triggerHaptic } from '../../utils/haptics';
import { DailyHabitTrackerLogo } from '../DailyHabitTrackerLogo';

interface IdentityTabProps {
  identities: IdentitySummary[];
  onOpenAddModalWithCategory: (catId: string, preselectedIdentity?: string) => void;
  onAddCustomIdentity?: (identity: string) => void;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({
  identities,
  onOpenAddModalWithCategory,
  onAddCustomIdentity
}) => {
  const [newIdentityText, setNewIdentityText] = useState('');
  const totalLifetimeVotes = identities.reduce((acc, curr) => acc + curr.totalVotes, 0);
  const embodiedCount = identities.filter((i) => i.levelTier >= 4).length;

  const handleCreateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newIdentityText.trim();
    if (!trimmed) return;
    triggerHaptic('selection');
    if (onAddCustomIdentity) {
      onAddCustomIdentity(trimmed);
    }
    setNewIdentityText('');
  };

  return (
    <div className="space-y-6">
      {/* Inspirational Identity Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-teal-900 via-slate-900 to-sky-950 text-white border border-teal-500/30 shadow-md">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <DailyHabitTrackerLogo size={36} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                Atomic Habit System
              </span>
              <span className="text-xs font-bold text-slate-200">
                Identity-Based Habit Architecture
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 max-w-3xl">
            <Quote className="w-6 h-6 text-teal-400/40 shrink-0 mt-1" />
            <p className="text-sm sm:text-base font-medium italic text-slate-200 leading-relaxed">
              &ldquo;{DEFAULT_IDENTITY_QUOTE.quote}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-teal-500/20">
            <span className="text-xs text-teal-400/80 font-semibold">
              — {DEFAULT_IDENTITY_QUOTE.author}
            </span>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-teal-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {totalLifetimeVotes} Total Identity Votes
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-sky-300">
                <Award className="w-3.5 h-3.5" />
                {embodiedCount} Embodied Identities
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Define a New Identity Creator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Define a New Identity
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Write the type of person you wish to become. You can then attach habits to build proof.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateIdentity} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newIdentityText}
            onChange={(e) => setNewIdentityText(e.target.value)}
            placeholder='e.g. "An inspiring teacher who leads with patience", "A disciplined writer"...'
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!newIdentityText.trim()}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              newIdentityText.trim()
                ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs hover:brightness-105 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            + Save Identity
          </button>
        </form>
      </div>

      {/* Identity Pillars Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Your Active Identities & Evidence</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each completed habit casts an undeniable vote of evidence for who you are becoming.
            </p>
          </div>
        </div>

        {identities.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
            <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No identity statements configured yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When creating or editing a habit, anchor it to an identity to build deep self-belief.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {identities.map((item) => {
              const tierBadgeColor =
                item.levelTier === 4
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : item.levelTier === 3
                  ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                  : item.levelTier === 2
                  ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

              return (
                <div
                  key={item.identity}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Identity Statement & Tier Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider block">
                          Identity Statement
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                          &ldquo;I am {item.identity.toLowerCase().startsWith('i am') ? item.identity.slice(5) : item.identity}&rdquo;
                        </h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${tierBadgeColor}`}>
                        {item.levelName}
                      </span>
                    </div>

                    {/* Votes Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.totalVotes} Votes Cast ({item.weeklyVotes} this week)
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">
                          {item.levelTier >= 4 ? 'Embodied (50+)' : `Next: ${item.nextTierVotes} votes`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-sky-500 transition-all duration-500"
                          style={{ width: `${item.levelProgressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Habits Reinforcing this Identity */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Supporting Habit Loops ({item.habits.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.habits.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            No habits attached yet. Click &ldquo;+ Add Habit&rdquo; below to start voting!
                          </span>
                        ) : (
                          item.habits.map((h) => (
                            <span
                              key={h.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                            >
                              <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{h.name}</span>
                              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold ml-0.5">
                                ({h.stats.totalVotesCast}v)
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Habit for this Identity */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Category: <strong>{item.category}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAddModalWithCategory(item.category, item.identity)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Habit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
