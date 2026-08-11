// src/hooks/useTemplate.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { templateApi, apiCache } from '@/api/apiClient';
import usePolling from '@/hooks/usePolling';

// ═══════════════════════════════════════════════════════════════
// CACHE — localStorage stale-while-revalidate
// ═══════════════════════════════════════════════════════════════
const CACHE_KEY     = 'nexsign_templates_cache';
const CACHE_TTL_MS  = 60_000; // 1 min

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {}
}

function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// 1. useTemplates — list with polling + cache
// ═══════════════════════════════════════════════════════════════
export function useTemplates({
  status  = '',
  search  = '',
  page    = 1,
  limit   = 10,
  enabled = true,
} = {}) {
  const cached = readCache();

  const [templates,  setTemplates]  = useState(cached?.data?.templates  || []);
  const [pagination, setPagination] = useState(cached?.data?.pagination || null);
  const [stats,      setStats]      = useState(cached?.data?.stats      || null);
  const [loading,    setLoading]    = useState(!cached);
  const [error,      setError]      = useState(null);
  const [isStale,    setIsStale]    = useState(!!cached);

  const abortRef = useRef(null);

  const fetch = useCallback(async (silent = false) => {
    if (!enabled) return;

    // Cancel previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (!silent) setLoading(true);
    setError(null);

    try {
      const res = await templateApi.getAll({
        ...(status && status !== 'all' ? { status } : {}),
        ...(search ? { search } : {}),
        page,
        limit,
      });

      const payload = res.data;

      setTemplates(payload.templates  || []);
      setPagination(payload.pagination || null);
      setIsStale(false);

      // Build stats from templates
      const all = payload.templates || [];
      setStats({
        total:       payload.pagination?.total || 0,
        active:      all.filter(t => t.status === 'active').length,
        completed:   all.filter(t => t.status === 'completed').length,
        boss_pending:all.filter(t => t.status === 'boss_pending').length,
        draft:       all.filter(t => t.status === 'draft').length,
      });

      // Write to localStorage cache
      writeCache({
        templates:  payload.templates  || [],
        pagination: payload.pagination || null,
        stats,
      });

    } catch (err) {
      if (err.__cancelled) return;
      setError(err.message || 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, [enabled, status, search, page, limit]);

  // Initial fetch
  useEffect(() => {
    fetch(!!cached); // silent if we have cache
  }, [fetch]);

  // Polling — 30s
  usePolling(() => fetch(true), {
    interval:  30_000,
    enabled:   enabled,
    immediate: false,
  });

  // Optimistic delete
  const optimisticDelete = useCallback((id) => {
    setTemplates(prev => prev.filter(t => String(t._id) !== String(id)));
    clearCache();
    apiCache.invalidatePattern('/templates');
  }, []);

  // Optimistic update
  const optimisticUpdate = useCallback((id, updates) => {
    setTemplates(prev =>
      prev.map(t =>
        String(t._id) === String(id) ? { ...t, ...updates } : t,
      ),
    );
  }, []);

  return {
    templates,
    pagination,
    stats,
    loading,
    error,
    isStale,
    refetch: () => fetch(false),
    optimisticDelete,
    optimisticUpdate,
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. useTemplate — single template with sessions
// ═══════════════════════════════════════════════════════════════
export function useTemplate(id, { enabled = true } = {}) {
  const [template,     setTemplate]     = useState(null);
  const [sessions,     setSessions]     = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetch = useCallback(async (silent = false) => {
    if (!id || !enabled) return;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const [tmplRes, sessRes] = await Promise.allSettled([
        templateApi.getOne(id),
        templateApi.getSessions(id),
      ]);

      if (tmplRes.status === 'fulfilled') {
        setTemplate(tmplRes.value.data.template);
        setSessionStats(
          tmplRes.value.data.template?.sessionStats || null,
        );
      } else {
        setError(tmplRes.reason?.message || 'Failed to load template.');
      }

      if (sessRes.status === 'fulfilled') {
        setSessions(sessRes.value.data.sessions || []);
        setSessionStats(sessRes.value.data.stats || null);
      }

    } catch (err) {
      setError(err.message || 'Failed to load template.');
    } finally {
      setLoading(false);
    }
  }, [id, enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  // Poll sessions — 30s (active templates only)
  usePolling(
    () => {
      if (!template) return;
      if (!['active', 'boss_pending'].includes(template.status)) return;
      fetch(true);
    },
    {
      interval:  30_000,
      enabled:   enabled && !!id,
      immediate: false,
    },
  );

  // Optimistic session update
  const optimisticSessionUpdate = useCallback((sessionId, updates) => {
    setSessions(prev =>
      prev.map(s =>
        String(s._id) === String(sessionId) ? { ...s, ...updates } : s,
      ),
    );
  }, []);

  return {
    template,
    sessions,
    sessionStats,
    loading,
    error,
    refetch:               () => fetch(false),
    optimisticSessionUpdate,
    setTemplate,
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. useTemplateSession — employee signing view (public)
// ═══════════════════════════════════════════════════════════════
export function useTemplateSession(token, { enabled = true } = {}) {
  const [session,  setSession]  = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [code,     setCode]     = useState(null);

  const fetch = useCallback(async () => {
    if (!token || !enabled) return;
    setLoading(true);
    setError(null);
    setCode(null);

    try {
      const res = await templateApi.validateEmployeeToken(token);
      setSession(res.data.session   || null);
      setTemplate(res.data.template || null);
    } catch (err) {
      setError(err.message || 'Invalid or expired signing link.');
      setCode(err.code     || null);
    } finally {
      setLoading(false);
    }
  }, [token, enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    session,
    template,
    loading,
    error,
    code,
    refetch: fetch,
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. useTemplateMutations — create / boss-sign / delete / resend
// ═══════════════════════════════════════════════════════════════
export function useTemplateMutations() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return { success: true, data: result.data };
    } catch (err) {
      const msg = err.message || 'Something went wrong.';
      setError(msg);
      return { success: false, error: msg, code: err.code };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new template
  const createTemplate = useCallback((data) =>
    run(() => templateApi.create(data)),
  [run]);

  // Update template (draft/boss_pending only)
  const updateTemplate = useCallback((id, data) =>
    run(() => templateApi.update(id, data)),
  [run]);

  // Soft delete template
  const deleteTemplate = useCallback((id) =>
    run(() => templateApi.delete(id)),
  [run]);

  // Boss signs — most important mutation
  const bossSign = useCallback((id, data) =>
    run(() => templateApi.bossSign(id, data)),
  [run]);

  // Employee signs
  const employeeSign = useCallback(async (token, data) => {
  setLoading(true);
  setError(null);
  try {
    const result  = await templateApi.submitEmployeeSignature(token, data);
    const resData = result?.data;
    return {
      success:       resData?.success !== false,
      message:       resData?.message || 'Signed!',
      missingFields: resData?.missingFields || [],
    };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Submission failed.';
    setError(msg);
    return {
      success:       false,
      message:       msg,
      missingFields: err?.response?.data?.missingFields || [],
    };
  } finally {
    setLoading(false);
  }
}, []);

const employeeDecline = useCallback(async (token, reason = '') => {
  setLoading(true);
  setError(null);
  try {
    const result  = await templateApi.declineEmployee(token, { reason });
    const resData = result?.data;
    return {
      success: resData?.success !== false,
      message: resData?.message || 'Declined.',
    };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Failed to decline.';
    setError(msg);
    return { success: false, message: msg };
  } finally {
    setLoading(false);
  }
}, []);

  // Resend email to specific employee
  const resendEmail = useCallback((templateId, sessionId) =>
    run(() => templateApi.resendEmail(templateId, sessionId)),
  [run]);

  return {
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    bossSign,
    employeeSign,
    employeeDecline,
    resendEmail,
    clearError: () => setError(null),
  };
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT — convenience
// ═══════════════════════════════════════════════════════════════
export default function useTemplateHook(id, options) {
  return useTemplate(id, options);
}