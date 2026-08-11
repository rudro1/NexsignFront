// src/hooks/useFieldAutoSave.js
// Module 1 — Auto-save hook for field coordinates
// Debounces saves so rapid drag/resize doesn't spam the API
import { useRef, useCallback, useEffect } from 'react';
import { api } from '@/api/apiClient';

/**
 * useFieldAutoSave
 *
 * Usage:
 *   const { save, saveNow, status } = useFieldAutoSave(documentId);
 *   // Call save(fields) on every field change — debounced 1.5s
 *   // Call saveNow(fields) to save immediately (on step change, send)
 *
 * @param {string|null} documentId  — MongoDB _id of the document (null = not yet saved)
 * @param {number}      [delay=1500] — debounce delay in ms
 */
export function useFieldAutoSave(documentId, delay = 1500) {
  const timerRef  = useRef(null);
  const statusRef = useRef('idle'); // 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  const abortRef  = useRef(null);

  // Cancel any pending save on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const doSave = useCallback(async (fields) => {
    if (!documentId) return; // no doc ID yet — skip
    if (abortRef.current) abortRef.current.abort();
    const controller  = new AbortController();
    abortRef.current  = controller;
    statusRef.current = 'saving';

    try {
      await api.put(`/documents/${documentId}/fields`, { fields }, {
        signal: controller.signal,
      });
      statusRef.current = 'saved';
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      statusRef.current = 'error';
      console.warn('[useFieldAutoSave] save failed:', err?.response?.data?.message || err.message);
    }
  }, [documentId]);

  /** Debounced save — call on every field state change */
  const save = useCallback((fields) => {
    if (!documentId) return;
    statusRef.current = 'pending';
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(fields), delay);
  }, [documentId, delay, doSave]);

  /** Immediate save — call before navigating away or sending */
  const saveNow = useCallback(async (fields) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await doSave(fields);
  }, [doSave]);

  return { save, saveNow, statusRef };
}
