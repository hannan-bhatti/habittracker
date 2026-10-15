import type React from 'react';
import { useState, useMemo } from 'react';
import {
  X,
  Clock,
  MapPin,
  Link2,
  Search,
  Flame
} from 'lucide-react';
import type { Habit, CategoryInfo } from '../../types/habit';
import { triggerHaptic } from '../../utils/haptics';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habitData: Partial<Habit>) => void;
  editingHabit: Habit | null;
  habits: Habit[];
  categories: CategoryInfo[];
  defaultCategory?: string;
}

const COMMON_LOCATIONS = [
  'Living Room Mat',
  'Home Work Desk',
  'Prayer Rug / Mosque',
  'Kitchen Counter',
  'Bedside / Bedroom',
  'Outdoors / Park',
  'Office'
];

interface HabitFormContentProps {
  editingHabit: Habit | null;
  defaultCategory: string;
  categories: CategoryInfo[];
  habits: Habit[];
  onClose: () => void;
  onSaveHabit: (habitData: Partial<Habit>) => void;
}

const HabitFormContent: React.FC<HabitFormContentProps> = ({
  editingHabit,
  defaultCategory,
  categories,
  habits,
  onClose,
  onSaveHabit
}) => {
  const [formName, setFormName] = useState(editingHabit ? editingHabit.name : '');
  const [formCategory, setFormCategory] = useState(
    editingHabit ? editingHabit.category : defaultCategory
  );
  const [formTime, setFormTime] = useState(
    editingHabit ? editingHabit.time : defaultCategory === 'Prayer' ? '05:15' : '07:00'
  );
  const [formLocation, setFormLocation] = useState(
    editingHabit
      ? editingHabit.location
      : defaultCategory === 'Prayer'
      ? 'Prayer Rug / Mosque'
      : 'Living Room Mat'
  );
  const [formStackedOn, setFormStackedOn] = useState(
    editingHabit?.stackedOnHabitId || ''
  );
  const [modalStackTab, setModalStackTab] = useState<'browse' | 'suggestions'>('browse');
  const [searchPreviousHabits, setSearchPreviousHabits] = useState('');
  const [formTarget, setFormTarget] = useState(editingHabit?.targetPerWeek || 5);
  const [formNote, setFormNote] = useState(editingHabit?.note || '');
  const [formError, setFormError] = useState('');

  // Prevent circular stacking: habit A cannot stack on habit B if B is stacked on A
  const availablePreviousHabits = useMemo(() => {
    let list = habits.filter((h) => !editingHabit || h.id !== editingHabit.id);

    if (editingHabit) {
      list = list.filter((h) => h.stackedOnHabitId !== editingHabit.id);
    }

    if (!searchPreviousHabits.trim()) return list;
    const q = searchPreviousHabits.toLowerCase();
    return list.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        (h.location && h.location.toLowerCase().includes(q))
    );
  }, [habits, editingHabit, searchPreviousHabits]);

  // Smart suggestions for habit stacking
  const habitStackSuggestions = useMemo(() => {
    const list = [];
    const availableAnchors = habits.filter(
      (h) => (!editingHabit || h.id !== editingHabit.id) && h.stackedOnHabitId !== (editingHabit ? editingHabit.id : '')
    );

    if (formCategory === 'Prayer') {
      const prayerAnchor = availableAnchors.find((h) => h.category === 'Prayer');
      if (prayerAnchor) {
        list.push({
          anchorHabit: prayerAnchor,
          suggestedLocation: prayerAnchor.location || 'Prayer Rug / Mosque',
          suggestedTime: '05:45',
          reason: `Perform right after "${prayerAnchor.name}".`
        });
      }
    } else if (formCategory === 'Fitness') {
      const morningAnchor = availableAnchors.find(
        (h) => h.category === 'Prayer' || h.name.toLowerCase().includes('water')
      );
      if (morningAnchor) {
        list.push({
          anchorHabit: morningAnchor,
          suggestedLocation: 'Living Room Mat',
          suggestedTime: '07:00',
          reason: `Flow into movement right after "${morningAnchor.name}".`
        });
      }
    } else if (formCategory === 'Work & Study') {
      const fitAnchor = availableAnchors.find((h) => h.category === 'Fitness' || h.category === 'Prayer');
      if (fitAnchor) {
        list.push({
          anchorHabit: fitAnchor,
          suggestedLocation: 'Home Work Desk',
          suggestedTime: '09:00',
          reason: `Sit down to study with a clear mind after "${fitAnchor.name}".`
        });
      }
    } else if (formCategory === 'Health') {
      const anchor = availableAnchors[0];
      if (anchor) {
        list.push({
          anchorHabit: anchor,
          suggestedLocation: 'Kitchen Counter',
          suggestedTime: '07:30',
          reason: `Hydrate or nourish right after "${anchor.name}".`
        });
      }
    }

    if (list.length === 0 && availableAnchors.length > 0) {
      list.push({
        anchorHabit: availableAnchors[0],
        suggestedLocation: availableAnchors[0].location || 'Home',
        suggestedTime: availableAnchors[0].time || '07:00',
        reason: `Anchor this with "${availableAnchors[0].name}".`
      });
    }

    return list;
  }, [habits, formCategory, editingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setFormError('Please enter a habit title.');
      return;
    }
    if (!formTime.trim()) {
      setFormError('Time cue is mandatory (e.g. 07:00 AM).');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Location cue is mandatory (e.g. Living Room Mat, Desk).');
      return;
    }

    triggerHaptic('success');
    onSaveHabit({
      name: formName.trim(),
      category: formCategory,
      time: formTime.trim(),
      location: formLocation.trim(),
      stackedOnHabitId: formStackedOn || undefined,
      targetPerWeek: Number(formTarget),
      note: formNote.trim()
    });
  };

  return (
    <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-2xl animate-check-pop space-y-4 my-auto modal-scroll-area">
      {/* Modal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {editingHabit ? 'Edit Habit' : 'New Habit'}
          </h3>
          <p className="text-[11px] text-slate-400">
            Every lasting habit has a clear time, location, and anchor trigger.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Habit Title <span className="text-teal-600 dark:text-teal-400">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              setFormError('');
            }}
            placeholder="e.g. 5 Daily Prayers, 30min Calisthenics, Deep Coding..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = formCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setFormCategory(cat.id);
                    if (cat.id === 'Prayer') {
                      setFormLocation('Prayer Rug / Mosque');
                      setFormTime('05:15');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>Time <span className="text-teal-600 dark:text-teal-400">*</span></span>
            </label>
            <input
              type="time"
              value={formTime}
              onChange={(e) => {
                setFormTime(e.target.value);
                setFormError('');
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">When will you do this?</span>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>Location <span className="text-teal-600 dark:text-teal-400">*</span></span>
            </label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => {
                setFormLocation(e.target.value);
                setFormError('');
              }}
              placeholder="e.g. Living Room Mat, Desk, Mosque"
              className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Where will you perform it?</span>
          </div>

          {/* Common Locations */}
          <div className="col-span-1 sm:col-span-2 pt-1">
            <span className="text-[10px] text-slate-400 block mb-1">Quick location suggestions:</span>
            <div className="flex flex-wrap gap-1">
              {COMMON_LOCATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setFormLocation(loc)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    formLocation === loc
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Habit Stacking */}
        <div className="p-4 rounded-2xl border border-teal-300/80 dark:border-teal-800/80 bg-teal-50/30 dark:bg-teal-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-teal-950 dark:text-teal-200">
                  Anchor Habit (Habit Stacking)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Pair this routine with an existing anchor for atomic momentum
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              Optional
            </span>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setModalStackTab('browse')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                modalStackTab === 'browse'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Habits ({availablePreviousHabits.length})
            </button>
            <button
              type="button"
              onClick={() => setModalStackTab('suggestions')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                modalStackTab === 'suggestions'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Smart Suggestions
            </button>
          </div>

          {/* TAB 1: BROWSE */}
          {modalStackTab === 'browse' && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchPreviousHabits}
                  onChange={(e) => setSearchPreviousHabits(e.target.value)}
                  placeholder="Search previous habits to attach..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {availablePreviousHabits.length === 0 ? (
                  <div className="p-3 text-center text-slate-400 text-xs">
                    No matching previous habits available.
                  </div>
                ) : (
                  availablePreviousHabits.map((prevHabit) => {
                    const isSelected = formStackedOn === prevHabit.id;
                    const cat = categories.find((c) => c.id === prevHabit.category);
                    const CatIcon = cat ? cat.icon : Flame;

                    return (
                      <div
                        key={prevHabit.id}
                        onClick={() => {
                          triggerHaptic('selection');
                          setFormStackedOn(isSelected ? '' : prevHabit.id);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {prevHabit.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {prevHabit.time} • {prevHabit.location}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-teal-600 text-white' : 'text-teal-600 border border-teal-200'}`}>
                          {isSelected ? 'Attached ✓' : '+ Attach'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUGGESTIONS */}
          {modalStackTab === 'suggestions' && (
            <div className="space-y-1.5">
              {habitStackSuggestions.map((sug) => {
                const isCurrent = formStackedOn === sug.anchorHabit.id;
                return (
                  <div
                    key={sug.anchorHabit.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">After &ldquo;{sug.anchorHabit.name}&rdquo;</p>
                      <p className="text-[10px] text-slate-400 truncate">{sug.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setFormStackedOn(sug.anchorHabit.id);
                        setFormLocation(sug.suggestedLocation);
                        setFormTime(sug.suggestedTime);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white'
                      }`}
                    >
                      {isCurrent ? 'Attached ✓' : 'Use Stack'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current Stack Summary */}
          {formStackedOn ? (
            <div className="p-3 rounded-xl bg-teal-100/60 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
              <span>
                Rule: After finishing <strong>{habits.find((h) => h.id === formStackedOn)?.name}</strong>, perform this habit.
              </span>
              <button
                type="button"
                onClick={() => setFormStackedOn('')}
                className="text-xs font-bold text-red-500 hover:underline cursor-pointer ml-2"
              >
                Detach
              </button>
            </div>
          ) : null}
        </div>

        {/* Weekly Target */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-600 dark:text-slate-400">Weekly Target</span>
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">{formTarget} days / week</span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            value={formTarget}
            onChange={(e) => setFormTarget(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            Note or Cue Prompt (Optional)
          </label>
          <input
            type="text"
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            placeholder="e.g. Place workout mat by bedside the night before"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {formError && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
  habits,
  categories,
  defaultCategory = 'Fitness'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <HabitFormContent
        key={editingHabit ? editingHabit.id : 'new-habit-form'}
        editingHabit={editingHabit}
        defaultCategory={defaultCategory}
        categories={categories}
        habits={habits}
        onClose={onClose}
        onSaveHabit={onSaveHabit}
      />
    </div>
  );
};
