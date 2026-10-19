import type React from 'react';
import { useState, useMemo } from 'react';
import {
  X,
  Clock,
  MapPin,
  Link2,
  Search,
  Flame,
  UserCheck,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Hourglass
} from 'lucide-react';
import type { Habit, CategoryInfo } from '../../types/habit';
import { IDENTITY_PRESETS } from '../../constants/identities';
import { triggerHaptic } from '../../utils/haptics';
import { DailyHabitTrackerLogo } from '../DailyHabitTrackerLogo';
import { calculateAdvanceTime } from '../../utils/notificationUtils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habitData: Partial<Habit>) => void;
  editingHabit: Habit | null;
  habits: Habit[];
  categories: CategoryInfo[];
  defaultCategory?: string;
  initialIdentity?: string;
  customIdentities?: string[];
  deletedIdentities?: string[];
  onAddCustomIdentity?: (identity: string) => void;
  onDeleteCustomIdentity?: (identity: string) => void;
  onDeletePredefinedIdentity?: (identity: string) => void;
  onRestoreDefaultIdentities?: () => void;
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
  initialIdentity?: string;
  customIdentities?: string[];
  deletedIdentities?: string[];
  onAddCustomIdentity?: (identity: string) => void;
  onDeleteCustomIdentity?: (identity: string) => void;
  onDeletePredefinedIdentity?: (identity: string) => void;
  onRestoreDefaultIdentities?: () => void;
}

const HabitFormContent: React.FC<HabitFormContentProps> = ({
  editingHabit,
  defaultCategory,
  categories,
  habits,
  onClose,
  onSaveHabit,
  initialIdentity = '',
  customIdentities = [],
  deletedIdentities = [],
  onAddCustomIdentity,
  onDeleteCustomIdentity,
  onDeletePredefinedIdentity,
  onRestoreDefaultIdentities
}) => {
  // 3-Step Wizard Navigation State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [formName, setFormName] = useState(editingHabit ? editingHabit.name : '');
  const [formCategory, setFormCategory] = useState(
    editingHabit ? editingHabit.category : defaultCategory
  );
  // Identity is mandatory: start empty for new habits unless preselected
  const [formIdentity, setFormIdentity] = useState(
    editingHabit?.identity || initialIdentity || ''
  );
  const [customIdentityInput, setCustomIdentityInput] = useState('');
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

  // Suggestions for identity based on current category, excluding any deleted presets
  const identitySuggestions = useMemo(() => {
    const raw = IDENTITY_PRESETS[formCategory] || IDENTITY_PRESETS['Personal'] || [];
    return raw.filter((s) => !deletedIdentities.includes(s));
  }, [formCategory, deletedIdentities]);

  const hasDeletedSuggestionsInCurrentCategory = useMemo(() => {
    const raw = IDENTITY_PRESETS[formCategory] || IDENTITY_PRESETS['Personal'] || [];
    return raw.some((s) => deletedIdentities.includes(s));
  }, [formCategory, deletedIdentities]);

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

  // Save custom identity
  const handleSaveAndSelectCustomIdentity = () => {
    const trimmed = customIdentityInput.trim();
    if (!trimmed) return;
    triggerHaptic('selection');
    if (onAddCustomIdentity) {
      onAddCustomIdentity(trimmed);
    }
    setFormIdentity(trimmed);
    setCustomIdentityInput('');
    setFormError('');
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = () => {
    if (!formName.trim()) {
      setFormError('Please enter a habit title.');
      return;
    }
    if (!formIdentity.trim()) {
      setFormError('Identity is mandatory. Please select or write your aligned identity.');
      return;
    }
    setFormError('');
    triggerHaptic('selection');
    setCurrentStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = () => {
    if (!formTime.trim()) {
      setFormError('Time cue is mandatory (e.g. 07:00 AM).');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Location cue is mandatory (e.g. Living Room Mat, Desk).');
      return;
    }
    setFormError('');
    triggerHaptic('selection');
    setCurrentStep(3);
  };

  // Final Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setCurrentStep(1);
      setFormError('Please enter a habit title.');
      return;
    }
    if (!formIdentity.trim()) {
      setCurrentStep(1);
      setFormError('Identity is mandatory! Please write your own identity or select one to proceed.');
      return;
    }
    if (!formTime.trim()) {
      setCurrentStep(2);
      setFormError('Time cue is mandatory (e.g. 07:00 AM).');
      return;
    }
    if (!formLocation.trim()) {
      setCurrentStep(2);
      setFormError('Location cue is mandatory (e.g. Living Room Mat, Desk).');
      return;
    }

    triggerHaptic('success');
    onSaveHabit({
      name: formName.trim(),
      category: formCategory,
      identity: formIdentity.trim(),
      time: formTime.trim(),
      location: formLocation.trim(),
      stackedOnHabitId: formStackedOn || undefined,
      targetPerWeek: Number(formTarget),
      note: formNote.trim()
    });
  };

  const selectedAnchorHabit = habits.find((h) => h.id === formStackedOn);

  return (
    <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-2xl animate-check-pop space-y-4 my-auto modal-scroll-area">
      {/* Modal Header with Incorporated Habit Momentum Brand Logo */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <DailyHabitTrackerLogo size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {editingHabit ? 'Edit Habit Routine' : 'Build Habit Routine'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                Step {currentStep} of 3
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {currentStep === 1 && 'Who do you wish to become?'}
              {currentStep === 2 && 'When and where will you perform this?'}
              {currentStep === 3 && 'Stacking routine & weekly target'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) {
              setFormError('');
              setCurrentStep(1);
              triggerHaptic('selection');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 1
              ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-2xs'
              : currentStep > 1
              ? 'bg-slate-100 dark:bg-slate-800/80 text-teal-600 dark:text-teal-400 cursor-pointer'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
            currentStep > 1 ? 'bg-teal-600 text-white' : currentStep === 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
          }`}>
            {currentStep > 1 ? '✓' : '1'}
          </span>
          <span className="truncate">Identity</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentStep === 3) {
              setFormError('');
              setCurrentStep(2);
              triggerHaptic('selection');
            } else if (currentStep === 1 && formName.trim() && formIdentity.trim()) {
              setFormError('');
              setCurrentStep(2);
              triggerHaptic('selection');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 2
              ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-2xs'
              : currentStep > 2
              ? 'bg-slate-100 dark:bg-slate-800/80 text-teal-600 dark:text-teal-400 cursor-pointer'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
            currentStep > 2 ? 'bg-teal-600 text-white' : currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
          }`}>
            {currentStep > 2 ? '✓' : '2'}
          </span>
          <span className="truncate">Cues</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentStep === 2 && formTime.trim() && formLocation.trim()) {
              setFormError('');
              setCurrentStep(3);
              triggerHaptic('selection');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 3
              ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
            currentStep === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
          }`}>
            3
          </span>
          <span className="truncate">Cadence</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ================= STEP 1: IDENTITY & HABIT ================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-check-pop">
            {/* Habit Title */}
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
                placeholder="e.g. 5 Daily Prayers, 30min Strength Training, Deep Coding..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                autoFocus
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

            {/* Identity Alignment Section (Mandatory) */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              !formIdentity.trim()
                ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-teal-300/80 dark:border-teal-800/80 bg-teal-50/30 dark:bg-teal-950/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-2xs ${
                    formIdentity.trim() ? 'bg-teal-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Aligned Identity
                      </h4>
                      <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                        * Mandatory
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Every habit is a vote for who you wish to become.
                    </p>
                  </div>
                </div>
                {formIdentity.trim() ? (
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    Aligned
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Required to Continue
                  </span>
                )}
              </div>

              {/* Active Selected Identity Banner or Warning */}
              {formIdentity.trim() ? (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 shadow-2xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                      Active Selected Identity:
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                      &ldquo;I am {formIdentity.toLowerCase().startsWith('i am') ? formIdentity.slice(5) : formIdentity}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormIdentity('');
                      triggerHaptic('light');
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Clear / Change
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <span>No identity selected yet. You must write your own or pick one below to create this habit.</span>
                </div>
              )}

              {/* Write Your Own Identity */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Plus className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>Write Your Own Identity:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customIdentityInput}
                    onChange={(e) => setCustomIdentityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveAndSelectCustomIdentity();
                      }
                    }}
                    placeholder='e.g. "A focused developer who codes daily", "An early riser"...'
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    disabled={!customIdentityInput.trim()}
                    onClick={handleSaveAndSelectCustomIdentity}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      customIdentityInput.trim()
                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs hover:brightness-105 active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    + Save & Select
                  </button>
                </div>
              </div>

              {/* Your Saved Custom Identities (if any exist) */}
              {customIdentities && customIdentities.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Your Custom Identities ({customIdentities.length}):
                  </span>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                    {customIdentities.map((cid) => {
                      const isSelected = formIdentity === cid;
                      return (
                        <div
                          key={cid}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-2xs'
                              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                          }`}
                          onClick={() => {
                            setFormIdentity(cid);
                            setFormError('');
                            triggerHaptic('selection');
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs truncate">&ldquo;I am {cid}&rdquo;</span>
                          </div>
                          {onDeleteCustomIdentity && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCustomIdentity(cid);
                                if (formIdentity === cid) setFormIdentity('');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Remove from custom identities"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category Presets */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Suggestions for {formCategory}:
                  </span>
                  {hasDeletedSuggestionsInCurrentCategory && onRestoreDefaultIdentities && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        onRestoreDefaultIdentities();
                      }}
                      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Restore defaults
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                  {identitySuggestions.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-1">
                      No suggestions remaining for {formCategory}. Write your own above!
                    </p>
                  ) : (
                    identitySuggestions.map((suggestion) => {
                      const isSelected = formIdentity === suggestion;
                      return (
                        <div
                          key={suggestion}
                          onClick={() => {
                            setFormIdentity(suggestion);
                            setFormError('');
                            triggerHaptic('selection');
                          }}
                          className={`text-left text-xs p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 font-bold text-teal-900 dark:text-teal-200 shadow-2xs'
                              : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="truncate">&ldquo;I am {suggestion}&rdquo;</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                            {onDeletePredefinedIdentity && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic('light');
                                  onDeletePredefinedIdentity(suggestion);
                                  if (formIdentity === suggestion) {
                                    setFormIdentity('');
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                                title="Delete pre-defined suggestion"
                                aria-label={`Delete suggestion ${suggestion}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: IMPLEMENTATION CUES ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-check-pop">
            {/* Implementation Cue Psychology Tip */}
            <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Implementation Intention:</strong> Stating the precise time and place primes your brain to initiate the habit automatically when the moment arrives.
              </p>
            </div>

            {/* Time & Location Grid */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Time Cue <span className="text-teal-600 dark:text-teal-400">*</span></span>
                </label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => {
                    setFormTime(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
                <div className="flex flex-wrap items-center justify-between gap-1 mt-1">
                  <span className="text-[10px] text-slate-400">What exact time of day will you perform this?</span>
                  {formTime && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                      <Hourglass className="w-2.5 h-2.5" />
                      10m reminder: {calculateAdvanceTime(formTime, 10).timeString}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Location Cue <span className="text-teal-600 dark:text-teal-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => {
                    setFormLocation(e.target.value);
                    setFormError('');
                  }}
                  placeholder="e.g. Living Room Mat, Desk, Mosque, Kitchen"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Where in your environment will this routine occur?</span>
              </div>

              {/* Common Location Suggestion Chips */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Quick Location Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LOCATIONS.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => {
                        setFormLocation(loc);
                        setFormError('');
                        triggerHaptic('light');
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        formLocation === loc
                          ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Intention Formula Preview */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-sky-50 dark:from-teal-950/40 dark:to-sky-950/40 border border-teal-200 dark:border-teal-800 text-slate-800 dark:text-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                Your Implementation Formula:
              </span>
              <p className="text-xs sm:text-sm font-semibold italic">
                &ldquo;I will <strong className="text-teal-700 dark:text-teal-300 not-italic">{formName || 'complete this routine'}</strong> at <strong className="text-sky-700 dark:text-sky-300 not-italic">{formTime || 'my set time'}</strong> in <strong className="text-teal-700 dark:text-teal-300 not-italic">{formLocation || 'my chosen space'}</strong>.&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 3: STACKING & CADENCE ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-check-pop">
            {/* Habit Stacking */}
            <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/20 dark:bg-teal-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Anchor Habit (Habit Stacking)
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Pair this routine with an existing anchor for atomic momentum
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                  Optional
                </span>
              </div>

              {/* Stack Tabs */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalStackTab('browse')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                    modalStackTab === 'browse'
                      ? 'bg-white dark:bg-slate-900 shadow-2xs text-teal-600 dark:text-teal-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All Habits ({availablePreviousHabits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalStackTab('suggestions')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                    modalStackTab === 'suggestions'
                      ? 'bg-white dark:bg-slate-900 shadow-2xs text-teal-600 dark:text-teal-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Smart Suggestions
                </button>
              </div>

              {modalStackTab === 'browse' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchPreviousHabits}
                      onChange={(e) => setSearchPreviousHabits(e.target.value)}
                      placeholder="Search previous habits to attach..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    <button
                      type="button"
                      onClick={() => setFormStackedOn('')}
                      className={`w-full text-left p-2 rounded-xl text-xs border transition-colors cursor-pointer flex items-center justify-between ${
                        !formStackedOn
                          ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/60 font-bold text-teal-800 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>Standalone Habit (No anchor)</span>
                      {!formStackedOn && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                    {availablePreviousHabits.map((h) => {
                      const isSelected = formStackedOn === h.id;
                      return (
                        <button
                          type="button"
                          key={h.id}
                          onClick={() => {
                            setFormStackedOn(h.id);
                            triggerHaptic('selection');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs border transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/60 font-bold text-teal-800 dark:text-teal-300'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{h.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">
                              ({h.time} • {h.location})
                            </span>
                          </div>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <span className="text-[10px] text-teal-600 font-bold">+ Attach</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {habitStackSuggestions.map((sug) => {
                    const isSelected = formStackedOn === sug.anchorHabit.id;
                    return (
                      <div
                        key={sug.anchorHabit.id}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/60 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            After {sug.anchorHabit.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{sug.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormStackedOn(sug.anchorHabit.id);
                            setFormTime(sug.suggestedTime);
                            setFormLocation(sug.suggestedLocation);
                            triggerHaptic('selection');
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                          }`}
                        >
                          {isSelected ? 'Applied' : 'Apply Stack'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Target Frequency */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Weekly Target</span>
                </label>
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                  {formTarget} days / week
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={formTarget}
                onChange={(e) => setFormTarget(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
                <span>1 day</span>
                <span>3 days</span>
                <span>5 days</span>
                <span>Everyday (7d)</span>
              </div>
            </div>

            {/* Cue / Reflection Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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

            {/* Final Habit Blueprint Preview with Brand Seal */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 via-slate-50 to-sky-50 dark:from-teal-950/50 dark:via-slate-900 dark:to-sky-950/50 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Habit Blueprint Summary
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Ready to lock in
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Identity:</strong> <span className="italic text-teal-700 dark:text-teal-300">&ldquo;I am {formIdentity}&rdquo;</span>
                </p>
                <p>
                  <strong>Routine:</strong> {selectedAnchorHabit ? `After ${selectedAnchorHabit.name}, I will ` : 'I will '}
                  <strong className="text-slate-900 dark:text-slate-100">{formName}</strong> at {formTime} in {formLocation}.
                </p>
                <p className="text-[11px] text-slate-500">
                  <strong>Cadence:</strong> {formTarget} days per week ({formCategory})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold animate-check-pop">
            {formError}
          </div>
        )}

        {/* Modal Action Buttons Per Step */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Left Action: Cancel or Back */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setCurrentStep((s) => (s > 1 ? (s - 1 as 1 | 2 | 3) : s));
                triggerHaptic('light');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {/* Right Action: Next Step or Complete */}
          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleProceedToStep2}
              disabled={!formName.trim() || !formIdentity.trim()}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                !formName.trim() || !formIdentity.trim()
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                  : 'bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white active:scale-95'
              }`}
            >
              <span>Continue to Cues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleProceedToStep3}
              disabled={!formTime.trim() || !formLocation.trim()}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                !formTime.trim() || !formLocation.trim()
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                  : 'bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white active:scale-95'
              }`}
            >
              <span>Continue to Stacking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{editingHabit ? 'Save Changes' : 'Create Routine'}</span>
            </button>
          )}
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
  defaultCategory = 'Fitness',
  initialIdentity,
  customIdentities,
  deletedIdentities,
  onAddCustomIdentity,
  onDeleteCustomIdentity,
  onDeletePredefinedIdentity,
  onRestoreDefaultIdentities
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <HabitFormContent
        key={editingHabit ? editingHabit.id : `new-habit-form-${initialIdentity || 'empty'}`}
        editingHabit={editingHabit}
        defaultCategory={defaultCategory}
        categories={categories}
        habits={habits}
        onClose={onClose}
        onSaveHabit={onSaveHabit}
        initialIdentity={initialIdentity}
        customIdentities={customIdentities}
        deletedIdentities={deletedIdentities}
        onAddCustomIdentity={onAddCustomIdentity}
        onDeleteCustomIdentity={onDeleteCustomIdentity}
        onDeletePredefinedIdentity={onDeletePredefinedIdentity}
        onRestoreDefaultIdentities={onRestoreDefaultIdentities}
      />
    </div>
  );
};
