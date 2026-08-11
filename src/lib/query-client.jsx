// src/lib/query-client.jsx
import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // ── Stale time: 30s → এর মধ্যে refetch হবে না ──────────
      staleTime:            30_000,
      // ── Cache time: 5min → background এ data রাখবে ─────────
      gcTime:               5 * 60_000,
      // ── Window focus এ refetch করবে না ─────────────────────
      refetchOnWindowFocus: false,
      // ── Reconnect এ refetch করবে ────────────────────────────
      refetchOnReconnect:   true,
      // ── Mount এ refetch করবে না (cache থাকলে) ───────────────
      refetchOnMount:       true,
      // ── Retry: 1 বার, 2s delay ──────────────────────────────
      retry:      1,
      retryDelay: 2_000,
      // ── Network error হলে retry করবে ─────────────────────────
      networkMode: 'online',
    },
    mutations: {
      // ── Mutation retry করবে না ───────────────────────────────
      retry:       0,
      networkMode: 'online',
    },
  },
});