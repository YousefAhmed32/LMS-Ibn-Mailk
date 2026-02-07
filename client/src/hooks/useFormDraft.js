import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFormDraft - Persist form state in localStorage with auto-save
 * 
 * Features:
 * - Auto-saves form state every `interval` ms (debounced)
 * - On mount, checks for existing draft and returns it via `hasDraft` + `draftDate`
 * - `restoreDraft()` loads the saved draft into state
 * - `discardDraft()` removes the saved draft from localStorage
 * - `clearDraft()` removes draft after successful submission
 * - Only clears on explicit call (not on unmount)
 * 
 * @param {string} key - Unique localStorage key (e.g. 'create-course-draft' or 'edit-course-{id}')
 * @param {object} currentData - Current form data to auto-save
 * @param {object} options - { interval: number (ms), enabled: boolean }
 * @returns {{ hasDraft, draftDate, restoreDraft, discardDraft, clearDraft }}
 */
const useFormDraft = (key, currentData, options = {}) => {
  const { interval = 5000, enabled = true } = options;
  const storageKey = `form-draft:${key}`;
  
  // Check for existing draft on mount
  const [draftInfo, setDraftInfo] = useState(() => {
    if (!enabled) return { hasDraft: false, draftDate: null };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          hasDraft: true,
          draftDate: parsed._savedAt ? new Date(parsed._savedAt) : null
        };
      }
    } catch (e) {
      // Corrupt draft, ignore
    }
    return { hasDraft: false, draftDate: null };
  });

  // Ref to hold latest data for the save interval
  const dataRef = useRef(currentData);
  useEffect(() => {
    dataRef.current = currentData;
  }, [currentData]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;
    
    const timer = setInterval(() => {
      try {
        const toSave = { ...dataRef.current, _savedAt: new Date().toISOString() };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch (e) {
        console.warn('useFormDraft: failed to save draft', e);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [storageKey, interval, enabled]);

  // Restore draft data
  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Remove internal metadata before returning
        const { _savedAt, ...data } = parsed;
        return data;
      }
    } catch (e) {
      console.warn('useFormDraft: failed to restore draft', e);
    }
    return null;
  }, [storageKey]);

  // Discard draft (user chose not to restore)
  const discardDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftInfo({ hasDraft: false, draftDate: null });
  }, [storageKey]);

  // Clear draft (after successful save)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftInfo({ hasDraft: false, draftDate: null });
  }, [storageKey]);

  return {
    hasDraft: draftInfo.hasDraft,
    draftDate: draftInfo.draftDate,
    restoreDraft,
    discardDraft,
    clearDraft
  };
};

export default useFormDraft;
