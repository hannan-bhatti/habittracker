import type React from 'react';
import { useState, useEffect } from 'react';
import { Bell, X, Volume2, Clock, Hourglass, Timer } from 'lucide-react';
import type { Habit, NotificationConfig } from '../../types/habit';
import { calculateAdvanceTime } from '../../utils/notificationUtils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotificationConfig;
  onChangeConfig: (cfg: NotificationConfig) => void;
  onSave: (cfg: NotificationConfig) => void;
  habits?: Habit[];
}

interface NotificationModalContentProps {
  onClose: () => void;
  config: NotificationConfig;
  onChangeConfig: (cfg: NotificationConfig) => void;
  onSave: (cfg: NotificationConfig) => void;
  habits: Habit[];
}

const NotificationModalContent: React.FC<NotificationModalContentProps> = ({
  onClose,
  config,
  onChangeConfig,
  onSave,
  habits
}) => {
  const [draftConfig, setDraftConfig] = useState<NotificationConfig>(config);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const habitRemindersActive = draftConfig.enabled && (draftConfig.habitRemindersEnabled !== false);
  const scheduledHabits = habits.filter((h) => Boolean(h.time));
  const leadMinutes = draftConfig.reminderLeadMinutes ?? 10;
  const remindAtExact = draftConfig.remindAtExactTime ?? true;

  const handleSaveClick = () => {
    onChangeConfig(draftConfig);
    onSave(draftConfig);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl animate-check-pop space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold">Reminder & Sound Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close notification settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Master Notifications Enable */}
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs sm:text-sm font-semibold block">Enable Notifications</span>
              <span className="text-[11px] text-slate-400">Receive timely habit alerts and reflections</span>
            </div>
            <input
              type="checkbox"
              checked={draftConfig.enabled}
              onChange={(e) => setDraftConfig({ ...draftConfig, enabled: e.target.checked })}
              className="w-4 h-4 accent-teal-600 cursor-pointer"
            />
          </label>

          {/* Per-Habit Scheduled Time Alerts */}
          <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs sm:text-sm font-bold block text-slate-900 dark:text-slate-100">
                    Per-Habit Task Reminders
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block">
                    Receive actionable alerts before each habit needs to be performed
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={draftConfig.habitRemindersEnabled !== false}
                disabled={!draftConfig.enabled}
                onChange={(e) =>
                  setDraftConfig({ ...draftConfig, habitRemindersEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-teal-600 cursor-pointer shrink-0 ml-2"
              />
            </label>

            {habitRemindersActive && (
              <div className="space-y-3 pt-2 border-t border-teal-200/60 dark:border-teal-900/40">
                {/* Advance Notice Minutes Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-teal-200/40 dark:border-teal-800/40">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                        Advance Notice
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Remind before scheduled time
                      </span>
                    </div>
                  </div>
                  <select
                    value={leadMinutes}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, reminderLeadMinutes: Number(e.target.value) })
                    }
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 outline-none cursor-pointer"
                  >
                    <option value={10}>10 mins before (Recommended)</option>
                    <option value={5}>5 mins before</option>
                    <option value={15}>15 mins before</option>
                    <option value={30}>30 mins before</option>
                    <option value={0}>At exact time only</option>
                  </select>
                </div>

                {/* Optional Alert at Exact Start Time */}
                {leadMinutes > 0 && (
                  <label className="flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg bg-white/40 dark:bg-slate-800/40 border border-teal-200/30 dark:border-teal-900/30">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Also chime right when task starts
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindAtExact}
                      onChange={(e) =>
                        setDraftConfig({ ...draftConfig, remindAtExactTime: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-teal-600 cursor-pointer"
                    />
                  </label>
                )}

                {/* Scheduled Habits Alarms Live Preview */}
                {scheduledHabits.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block mb-1.5">
                      Active Alarms ({scheduledHabits.length} habits):
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {scheduledHabits.map((h) => {
                        const adv = calculateAdvanceTime(h.time, leadMinutes);
                        return (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-teal-200/60 dark:border-teal-800/60 shadow-2xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {h.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold">
                              {leadMinutes > 0 ? (
                                <>
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-300">
                                    ⏳ {adv.timeString} ({leadMinutes}m before)
                                  </span>
                                  {remindAtExact && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/70 text-teal-700 dark:text-teal-300">
                                      ⏰ {h.time}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/70 text-teal-700 dark:text-teal-300">
                                  ⏰ {h.time}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Morning Kick-off */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold block">Morning Habit Kick-off</span>
              <span className="text-[11px] text-slate-400">Time to start morning routines</span>
            </div>
            <input
              type="time"
              value={draftConfig.morningTime}
              disabled={!draftConfig.enabled}
              onChange={(e) => setDraftConfig({ ...draftConfig, morningTime: e.target.value })}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Evening Reflection */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold block">Evening Reflection</span>
              <span className="text-[11px] text-slate-400">Journal and daily check-in</span>
            </div>
            <input
              type="time"
              value={draftConfig.eveningTime}
              disabled={!draftConfig.enabled}
              onChange={(e) => setDraftConfig({ ...draftConfig, eveningTime: e.target.value })}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
            />
          </div>

          {/* Web Audio Chimes Toggle */}
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <div>
                <span className="text-xs sm:text-sm font-semibold block">Habit Completion Sound</span>
                <span className="text-[11px] text-slate-400">Play pleasant harmonic chimes on check-off</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={draftConfig.soundEnabled}
              onChange={(e) => setDraftConfig({ ...draftConfig, soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-teal-600 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onSave,
  habits = []
}) => {
  if (!isOpen) return null;

  return (
    <NotificationModalContent
      onClose={onClose}
      config={config}
      onChangeConfig={onChangeConfig}
      onSave={onSave}
      habits={habits}
    />
  );
};
