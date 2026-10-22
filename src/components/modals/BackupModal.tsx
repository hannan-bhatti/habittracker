import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import { Database, Download, Upload, RotateCcw, X, AlertTriangle, Copy } from 'lucide-react';
import type { Habit } from '../../types/habit';
import { exportUserData, serializeBackupData, parseImportData } from '../../utils/storageUtils';
import { triggerHaptic } from '../../utils/haptics';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  journals: Record<string, string>;
  customIdentities?: string[];
  deletedIdentities?: string[];
  onImportSuccess: (
    habits: Habit[],
    journals: Record<string, string>,
    customIdentities?: string[],
    deletedIdentities?: string[]
  ) => void;
  onResetDefaults: () => void;
  onClearAllHabits: () => void;
  showToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  habits,
  journals,
  customIdentities,
  deletedIdentities,
  onImportSuccess,
  onResetDefaults,
  onClearAllHabits,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = async () => {
    triggerHaptic('success');
    const result = await exportUserData(habits, journals, customIdentities, deletedIdentities);
    if (result === 'shared') {
      showToast('Backup ready to save or share! 📁');
    } else if (result === 'copied') {
      showToast('Backup JSON copied to clipboard! 📋');
    } else {
      showToast('Data exported successfully! 📁');
    }
  };

  const handleCopyJson = async () => {
    try {
      const jsonStr = serializeBackupData(habits, journals, customIdentities, deletedIdentities);
      await navigator.clipboard.writeText(jsonStr);
      triggerHaptic('success');
      showToast('Backup JSON copied to clipboard! 📋');
    } catch {
      triggerHaptic('warning');
      showToast('Could not copy to clipboard.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const { habits: importedHabits, journals: importedJournals, customIdentities, deletedIdentities } = parseImportData(rawJson);
        triggerHaptic('success');
        onImportSuccess(importedHabits, importedJournals, customIdentities, deletedIdentities);
        showToast(`Imported ${importedHabits.length} habits successfully! 🎉`);
        onClose();
      } catch (err) {
        triggerHaptic('warning');
        setImportError(err instanceof Error ? err.message : 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold">Data Backup & Restore</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close backup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-slate-200">
                Export Data Backup
              </span>
              <span className="text-[11px] text-slate-400">
                Download, share, or copy all your habits, dates, and reflections.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all cursor-pointer"
                title="Copy backup JSON to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-slate-200">
                Import from Backup
              </span>
              <span className="text-[11px] text-slate-400">
                Restore your habits from a previously saved JSON file.
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Habit Management Controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {/* Clear All Habits Option */}
            {confirmClearAll ? (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 space-y-2">
                <p className="text-xs font-bold text-red-800 dark:text-red-200">
                  Delete all current habits? (Your settings will remain)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllHabits();
                      setConfirmClearAll(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmClearAll(true);
                    setConfirmReset(false);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Clear all habits</span>
                </button>
              </div>
            )}

            {/* Reset to Default Template */}
            {confirmReset ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  Load the 6 starter template habits?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      onResetDefaults();
                      setConfirmReset(false);
                      onClose();
                      showToast('Loaded starter habits template.');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 cursor-pointer"
                  >
                    Yes, Load Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(true);
                    setConfirmClearAll(false);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load starter template habits</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
