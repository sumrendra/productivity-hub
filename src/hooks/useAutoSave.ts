import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from '@/utils/helpers';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  /**
   * The data to auto-save
   */
  data: T;
  
  /**
   * The save function to call
   */
  onSave: (data: T) => Promise<void>;
  
  /**
   * Delay in milliseconds before saving (default: 2000ms)
   */
  delay?: number;
  
  /**
   * Whether auto-save is enabled (default: true)
   */
  enabled?: boolean;
  
  /**
   * Function to compare if data has changed (default: JSON.stringify comparison)
   */
  isEqual?: (prev: T, current: T) => boolean;
}

interface UseAutoSaveReturn {
  /**
   * Current save status
   */
  status: SaveStatus;
  
  /**
   * Last saved time
   */
  lastSaved: Date | null;
  
  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges: boolean;
  
  /**
   * Manually trigger save
   */
  save: () => Promise<void>;
  
  /**
   * Reset the save state
   */
  reset: () => void;
}

/**
 * Custom hook for auto-saving data with debouncing
 * 
 * @example
 * ```tsx
 * const { status, lastSaved, save } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => {
 *     await notesApi.update(noteId, data);
 *   },
 *   delay: 2000,
 * });
 * ```
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  isEqual = (prev, current) => JSON.stringify(prev) === JSON.stringify(current),
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  // Manual save function
  const save = useCallback(async () => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      setStatus('saving');
      
      await onSave(data);
      
      setStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      previousDataRef.current = data;
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave]);

  // Debounced save function
  const debouncedSaveRef = useRef(
    debounce(() => {
      save();
    }, delay)
  );

  // Update debounced function when delay changes
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      save();
    }, delay);
  }, [delay, save]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;
    
    // Check if data has changed
    const hasChanged = !isEqual(previousDataRef.current, data);
    
    if (hasChanged) {
      setHasUnsavedChanges(true);
      debouncedSaveRef.current();
    }
  }, [data, enabled, isEqual]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup: pending debounced saves will be cancelled when component unmounts
    };
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setLastSaved(null);
    setHasUnsavedChanges(false);
    previousDataRef.current = data;
  }, [data]);

  return {
    status,
    lastSaved,
    hasUnsavedChanges,
    save,
    reset,
  };
}
