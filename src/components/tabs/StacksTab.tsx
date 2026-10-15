import type React from 'react';
import { Layers, Plus, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Habit, EnrichedHabit } from '../../types/habit';

interface StacksTabProps {
  chains: Array<{ anchor: Habit; stacked: EnrichedHabit[] }>;
  onOpenAddModal: () => void;
}

export const StacksTab: React.FC<StacksTabProps> = ({ chains, onOpenAddModal }) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Habit Stacking Chains</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formula: &ldquo;After [Current Habit], I will [New Habit]&rdquo; anchored by context and physical cues.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Stack</span>
        </button>
      </div>

      {chains.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No linked habit stacks yet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When creating or editing a habit, choose an anchor habit to build a seamless routine chain.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add a habit and stack it
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {chains.map(({ anchor, stacked }) => (
            <div
              key={anchor.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3"
            >
              {/* Anchor Habit */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">
                      Anchor Routine
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {anchor.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" /> {anchor.time}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" /> {anchor.location}
                  </span>
                </div>
              </div>

              {/* Stacked Habits List */}
              <div className="pl-4 border-l-2 border-teal-500/40 space-y-2.5 mt-2">
                {stacked.map((sh) => (
                  <div
                    key={sh.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {sh.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Cue: Immediately after finishing {anchor.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sh.time}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-3 h-3" /> {sh.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
