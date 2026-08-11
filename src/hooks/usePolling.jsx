import { useEffect, useRef, useCallback } from 'react';

/**
 * Smart polling hook
 * - Tab visible হলে poll করে
 * - Tab hidden হলে pause করে
 * - Window focus হলে তুরন্ত একবার fetch করে
 * - Interval: default 30s
 */
export default function usePolling(
  fetchFn,
  {
    interval  = 30_000,
    enabled   = true,
    immediate = false,
  } = {},
) {
  const timerRef     = useRef(null);
  const fetchRef     = useRef(fetchFn);
  const mountedRef   = useRef(true);

  // Always latest fetchFn
  useEffect(() => { fetchRef.current = fetchFn; }, [fetchFn]);

  const poll = useCallback(() => {
    if (!mountedRef.current) return;
    fetchRef.current?.();
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    mountedRef.current = true;

    // Immediate first fetch
    if (immediate) poll();

    start();

    // ── Visibility change: pause when hidden ──────────────
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        poll();   // তুরন্ত একবার
        start();  // তারপর interval
      }
    };

    // ── Window focus: তুরন্ত fetch ────────────────────────
    const onFocus = () => {
      poll();
      start(); // reset interval
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      mountedRef.current = false;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, poll, start, stop, immediate]);

  return { poll };
}