// src/pages/DocumentDetail.jsx
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import useSocket from '@/hooks/useSocket';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────
// Validate MongoDB ObjectId (24 hex chars)
// ─────────────────────────────────────────────────────────────────
const isValidObjectId = (id) =>
  !!id && id !== 'new' && /^[a-f\d]{24}$/i.test(id);

// ─────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft:       { label: 'Draft',       bg: 'bg-slate-100 dark:bg-slate-800',        text: 'text-slate-600 dark:text-slate-400',     dot: 'bg-slate-400'   },
  pending:     { label: 'Pending',     bg: 'bg-amber-100 dark:bg-amber-900/30',      text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-400'   },
  in_progress: { label: 'In Progress', bg: 'bg-sky-100 dark:bg-sky-900/30',          text: 'text-sky-700 dark:text-sky-400',         dot: 'bg-sky-400'     },
  sent:        { label: 'Sent',        bg: 'bg-blue-100 dark:bg-blue-900/30',        text: 'text-blue-700 dark:text-blue-400',       dot: 'bg-blue-400'    },
  completed:   { label: 'Completed',   bg: 'bg-emerald-100 dark:bg-emerald-900/30',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  declined:    { label: 'Declined',    bg: 'bg-red-100 dark:bg-red-900/30',          text: 'text-red-700 dark:text-red-400',         dot: 'bg-red-500'     },
  voided:      { label: 'Voided',      bg: 'bg-slate-100 dark:bg-slate-800',         text: 'text-slate-500 dark:text-slate-400',     dot: 'bg-slate-400'   },
};

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                      rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────
const Ic = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  FileText: ({ cls = 'w-5 h-5' }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Monitor: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Refresh: ({ spin }) => (
    <svg className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────
function Sk({ className }) {
  return (
    <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Sk className="w-9 h-9 rounded-xl" />
          <Sk className="h-7 w-72 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Sk key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-5 gap-5">
          <Sk className="lg:col-span-3 h-96 rounded-2xl" />
          <Sk className="lg:col-span-2 h-96 rounded-2xl" />
        </div>
        <Sk className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mini toast
// ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);
  return { toast, show };
}

// ─────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl
                      shadow-2xl border border-slate-100 dark:border-slate-800
                      p-6 w-full max-w-sm z-10">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl
                        flex items-center justify-center mx-auto mb-4 text-red-500">
          <Ic.Trash />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center mb-1">
          Delete Document?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            "{title}"
          </span>{' '}
          will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-slate-200
                       dark:border-slate-700 text-sm font-semibold
                       text-slate-600 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-slate-800
                       transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600
                       text-white text-sm font-semibold transition-colors
                       flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Ic.Spinner /> : <Ic.Trash />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Signing Timeline
// ─────────────────────────────────────────────────────────────────
function SigningTimeline({ parties }) {
  return (
    <div className="space-y-3">
      {(parties || []).map((party, idx) => {
        const isDone     = party.status === 'completed' || party.status === 'signed';
        const isActive   = party.status === 'in_progress' || party.status === 'sent';
        const isDeclined = party.status === 'declined';

        return (
          <div key={idx} className="relative">
            {idx < parties.length - 1 && (
              <div className={`absolute left-[18px] top-10 w-0.5 h-6 z-0
                ${isDone
                  ? 'bg-emerald-300 dark:bg-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            )}
            <div className={`relative z-10 flex items-start gap-3 p-3.5 rounded-xl transition-colors
              ${isActive
                ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50'
                : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-800/50'
                  : isDeclined
                    ? 'bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-800/50'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'}`}>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center
                             text-sm font-bold text-white shrink-0 shadow-sm
                  ${isDone ? 'bg-emerald-500' : isActive ? 'bg-[#28ABDF]' : isDeclined ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                style={!isDone && !isActive && !isDeclined && party.color ? { backgroundColor: party.color } : {}}
              >
                {isDone ? <Ic.Check /> : (party.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {party.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{party.email}</p>
                  </div>
                  <StatusBadge status={party.status === 'signed' ? 'completed' : (party.status || 'pending')} />
                </div>
                {party.signedAt && (
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Ic.Clock />{fmtDateTime(party.signedAt)}</span>
                    {party.ipAddress && <span className="flex items-center gap-1"><Ic.Globe />{party.ipAddress}</span>}
                    {(party.city || party.postalCode) && (
                      <span className="flex items-center gap-1">
                        <Ic.MapPin />
                        {[party.city, party.postalCode].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {party.device && <span className="flex items-center gap-1"><Ic.Monitor />{party.device}</span>}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                #{idx + 1}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Audit Log Entry
// ─────────────────────────────────────────────────────────────────
function AuditEntry({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const actionColors = {
    created:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    sent:      'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
    viewed:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    signed:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    declined:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    voided:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  const cls = actionColors[entry.action] || actionColors.viewed;

  return (
    <div className="flex gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="mt-0.5 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cls}`}>
          {entry.action}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
          {entry.actorName || entry.signerName || 'System'}
          {entry.actorEmail && (
            <span className="text-slate-400 font-normal ml-1">· {entry.actorEmail}</span>
          )}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {fmtDateTime(entry.timestamp || entry.createdAt)}
        </p>
        {(entry.device || entry.browser || entry.os || entry.ip || entry.city || entry.postalCode) && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[11px] text-[#28ABDF] hover:underline mt-1 font-medium"
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
        )}
        {expanded && (
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              { icon: Ic.Monitor, label: 'Device',  val: entry.device },
              { icon: Ic.Globe,   label: 'Browser', val: entry.browser },
              { icon: Ic.Globe,   label: 'OS',      val: entry.os },
              { icon: Ic.Globe,   label: 'IP',      val: entry.ip || entry.ipAddress },
              { icon: Ic.MapPin,  label: 'City',    val: entry.city },
              { icon: Ic.MapPin,  label: 'Postal',  val: entry.postalCode },
            ].filter(r => r.val).map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Icon />
                <span className="text-slate-400">{label}:</span>
                <span className="font-medium truncate">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CC Row
// ─────────────────────────────────────────────────────────────────
function CcRow({ cc }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl
                    bg-slate-50 dark:bg-slate-800/60
                    border border-slate-100 dark:border-slate-700">
      <div className="w-8 h-8 rounded-lg bg-[#28ABDF]/10 flex items-center justify-center shrink-0">
        <Ic.Mail />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
          {cc.name || 'No name'}
          {cc.designation && (
            <span className="text-slate-400 font-normal ml-1">· {cc.designation}</span>
          )}
        </p>
        <p className="text-[11px] text-slate-400 truncate">{cc.email}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
export default function DocumentDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const socket   = useSocket();
  const { toast, show: showToast } = useToast();

  const [doc,          setDoc]          = useState(null);
  const [auditLogs,    setAuditLogs]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState('overview');
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [copying,      setCopying]      = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ══════════════════════════════════════════════════════════════
  // GUARD: If id is not a valid MongoDB ObjectId, redirect to
  // the new document editor rather than hitting the backend with /new.
  // This fixes the 500 error on /api/documents/new
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isValidObjectId(id)) {
      // id is "new" or garbage — send to editor
      navigate('/documents/new', { replace: true });
    }
  }, [id, navigate]);

  // ── Load document ─────────────────────────────────────────────
  const loadDoc = useCallback(async () => {
    if (!isValidObjectId(id)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/documents/${id}`);
      if (mountedRef.current)
        setDoc(res.data?.document || res.data);
    } catch (err) {
      if (mountedRef.current) {
        const status = err.status || err.response?.status;
        if (status === 404) {
          navigate('/dashboard', { replace: true });
        } else {
          setError(err.message || 'Failed to load document.');
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id, navigate]);

  // ── Load audit ────────────────────────────────────────────────
  const loadAudit = useCallback(async () => {
    if (!isValidObjectId(id)) return;

    setAuditLoading(true);
    try {
      const res = await api.get(`/documents/${id}/audit`, { noCache: true });
      if (mountedRef.current)
        setAuditLogs(res.data?.logs ?? res.data?.auditLogs ?? []);
    } catch {
      /* non-critical */
    } finally {
      if (mountedRef.current) setAuditLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isValidObjectId(id)) {
      loadDoc();
      loadAudit();
    }
  }, [loadDoc, loadAudit, id]);

  // ── Socket: real-time updates ─────────────────────────────────
  useEffect(() => {
    if (!socket?.on) return;
    const onUpdate = (updated) => {
      if (!mountedRef.current) return;
      if (updated._id === id || updated.id === id) {
        setDoc(prev => prev ? { ...prev, ...updated } : updated);
      }
    };
    const cleanup1 = socket.on('document:updated', onUpdate);
    const cleanup2 = socket.on('document:signed',  onUpdate);
    return () => {
      if (typeof cleanup1 === 'function') cleanup1();
      if (typeof cleanup2 === 'function') cleanup2();
    };
  }, [socket, id]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/documents/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
      setShowDelete(false);
    } finally {
      if (mountedRef.current) setDeleting(false);
    }
  }, [id, navigate, showToast]);

  // ── Copy signing link ─────────────────────────────────────────
  const copySigningLink = useCallback(async (party) => {
    if (!party?.signingToken) return;
    const url = `${window.location.origin}/sign/${party.signingToken}`;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      showToast('Signing link copied!', 'success');
    } catch {
      showToast('Could not copy link.', 'error');
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  }, [showToast]);

  // ── Progress ──────────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!doc?.parties?.length) return 0;
    const done = doc.parties.filter(
      p => p.status === 'completed' || p.status === 'signed'
    ).length;
    return Math.round((done / doc.parties.length) * 100);
  }, [doc]);

  // ── Early return for invalid id (redirect in progress) ───────
  if (!isValidObjectId(id)) {
    return null;
  }

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
                      flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl
                          flex items-center justify-center mx-auto mb-4 text-red-500">
            <Ic.Warning />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Failed to Load
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 h-10 rounded-xl border border-slate-200
                         dark:border-slate-700 text-sm font-semibold
                         text-slate-600 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={loadDoc}
              className="flex-1 h-10 rounded-xl bg-[#28ABDF] hover:bg-sky-600
                         text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl
                         shadow-xl text-sm font-semibold text-white
                         ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <DeleteModal
          title={doc?.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start
                        justify-between gap-4 mb-7">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center shrink-0
                         hover:border-[#28ABDF] hover:text-[#28ABDF]
                         text-slate-600 dark:text-slate-300
                         transition-colors shadow-sm mt-0.5"
            >
              <Ic.ArrowLeft />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold
                               text-slate-900 dark:text-white truncate">
                  {doc?.title}
                </h1>
                <StatusBadge status={doc?.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                {doc?.companyName && (
                  <>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {doc.companyName}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span>Created {fmtDate(doc?.createdAt)}</span>
                <span>·</span>
                <span>{doc?.parties?.length || 0} signers</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadDoc}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center
                         hover:border-[#28ABDF] hover:text-[#28ABDF]
                         text-slate-400 transition-colors shadow-sm"
              title="Refresh"
            >
              <Ic.Refresh />
            </button>
            {doc?.fileUrl && (
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-xl border border-slate-200
                           dark:border-slate-700 bg-white dark:bg-slate-900
                           text-sm font-semibold text-slate-600 dark:text-slate-300
                           flex items-center gap-2
                           hover:border-[#28ABDF] hover:text-[#28ABDF]
                           transition-colors shadow-sm"
              >
                <Ic.Download />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
            <button
              onClick={() => setShowDelete(true)}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center
                         hover:border-red-300 hover:text-red-500
                         text-slate-400 transition-colors shadow-sm"
              title="Delete"
            >
              <Ic.Trash />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Signing Progress
            </p>
            <p className={`text-xs font-bold
              ${progress === 100 ? 'text-emerald-600' : 'text-[#28ABDF]'}`}>
              {progress}% Complete
            </p>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700
                ${progress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#28ABDF] to-sky-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-slate-400">
              {doc?.parties?.filter(
                p => p.status === 'completed' || p.status === 'signed'
              ).length || 0} of {doc?.parties?.length || 0} signed
            </p>
            {doc?.completedAt && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Completed {fmtDateTime(doc.completedAt)}
              </p>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 p-1
                        bg-white dark:bg-slate-900 rounded-xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm w-fit mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'signers',  label: `Signers (${doc?.parties?.length || 0})` },
            { id: 'audit',    label: `Audit (${auditLogs.length})` },
            { id: 'cc',       label: `CC (${doc?.ccList?.length || 0})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm
                          font-semibold transition-all whitespace-nowrap
                ${activeTab === t.id
                  ? 'bg-[#28ABDF] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700
                               dark:text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/40
                                   flex items-center justify-center text-[#28ABDF]">
                    <Ic.Users />
                  </span>
                  Signing Order
                </h3>
                <SigningTimeline parties={doc?.parties} />
              </div>

              {doc?.fileUrl && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl
                                border border-slate-100 dark:border-slate-800
                                shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700
                                 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800
                                     flex items-center justify-center text-slate-500">
                      <Ic.FileText />
                    </span>
                    Document Preview
                  </h3>
                  <div className="rounded-xl overflow-hidden border
                                  border-slate-200 dark:border-slate-700
                                  bg-slate-100 dark:bg-slate-950">
                    <iframe
                      src={`${doc.fileUrl}#toolbar=0&navpanes=0`}
                      className="w-full border-0 block"
                      style={{ height: '400px' }}
                      title="Document preview"
                    />
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2
                               h-9 rounded-xl border border-slate-200
                               dark:border-slate-700 text-sm font-medium
                               text-slate-600 dark:text-slate-300
                               hover:border-[#28ABDF] hover:text-[#28ABDF]
                               transition-colors"
                  >
                    <Ic.Download />
                    Open full PDF
                  </a>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700
                               dark:text-slate-300 mb-3">
                  Document Info
                </h3>
                <div className="space-y-0">
                  {[
                    { label: 'Status',  value: <StatusBadge status={doc?.status} /> },
                    { label: 'Created', value: fmtDate(doc?.createdAt) },
                    { label: 'Updated', value: fmtDate(doc?.updatedAt) },
                    { label: 'Pages',   value: doc?.totalPages || '—'  },
                    { label: 'Fields',  value: doc?.fields?.length || 0 },
                    { label: 'CC',      value: doc?.ccList?.length || 0 },
                  ].map(({ label, value }) => (
                    <div key={label}
                         className="flex items-center justify-between py-2.5
                                    border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(doc?.companyName || doc?.companyLogo) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl
                                border border-slate-100 dark:border-slate-800
                                shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700
                                 dark:text-slate-300 mb-3">
                    Brand
                  </h3>
                  <div className="flex items-center gap-3">
                    {doc.companyLogo && (
                      <img
                        src={doc.companyLogo}
                        alt="Logo"
                        className="h-10 max-w-[80px] object-contain"
                      />
                    )}
                    {doc.companyName && (
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {doc.companyName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SIGNERS */}
        {activeTab === 'signers' && (
          <div className="space-y-3">
            {(doc?.parties || []).map((party, i) => (
              <div key={i}
                   className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center
                                  justify-center text-white font-bold text-sm
                                  shadow-sm shrink-0"
                      style={{ backgroundColor: party.color || '#0ea5e9' }}
                    >
                      {(party.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {party.name}
                      </p>
                      <p className="text-xs text-slate-400">{party.email}</p>
                      {party.designation && (
                        <p className="text-[11px] text-slate-400">{party.designation}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={party.status === 'signed' ? 'completed' : party.status} />
                </div>

                {party.signedAt && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 p-3
                                  rounded-xl bg-emerald-50 dark:bg-emerald-900/15
                                  border border-emerald-100 dark:border-emerald-800/50">
                    {[
                      { icon: Ic.Clock,   label: 'Signed at', val: fmtDateTime(party.signedAt) },
                      { icon: Ic.Globe,   label: 'IP',        val: party.ipAddress },
                      { icon: Ic.MapPin,  label: 'Location',  val: [party.city, party.postalCode].filter(Boolean).join(', ') },
                      { icon: Ic.Monitor, label: 'Device',    val: party.device },
                      { icon: Ic.Globe,   label: 'Browser',   val: party.browser },
                      { icon: Ic.Globe,   label: 'OS',        val: party.os },
                    ].filter(r => r.val).map(({ icon: Icon, label, val }) => (
                      <div key={label} className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <Icon />{label}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!doc?.parties?.length && (
              <div className="py-16 text-center bg-white dark:bg-slate-900
                              rounded-2xl border border-dashed
                              border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-400">No signers found</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl
                          border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800
                            flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700
                             dark:text-slate-300 flex items-center gap-2">
                <Ic.Shield />
                Audit Trail
              </h3>
              <button
                onClick={loadAudit}
                className="text-xs text-[#28ABDF] hover:underline
                           font-medium flex items-center gap-1"
              >
                <Ic.Refresh spin={auditLoading} />
                Refresh
              </button>
            </div>
            <div className="px-5 divide-y divide-slate-50 dark:divide-slate-800">
              {auditLoading ? (
                <div className="py-10 flex justify-center">
                  <Ic.Spinner />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400">No audit events yet</p>
                </div>
              ) : (
                auditLogs.map((entry, i) => (
                  <AuditEntry key={entry._id || i} entry={entry} />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: CC */}
        {activeTab === 'cc' && (
          <div className="space-y-3">
            {doc?.ccList?.length > 0 ? (
              <>
                <p className="text-xs text-slate-400 px-0.5">
                  {doc.ccList.length} CC recipient{doc.ccList.length !== 1 ? 's' : ''} —
                  received a copy of signed documents
                </p>
                {doc.ccList.map((cc, i) => (
                  <CcRow key={i} cc={cc} />
                ))}
              </>
            ) : (
              <div className="py-16 text-center bg-white dark:bg-slate-900
                              rounded-2xl border border-dashed
                              border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800
                                flex items-center justify-center mx-auto mb-3
                                text-slate-300 dark:text-slate-600">
                  <Ic.Mail />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No CC recipients
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  CC recipients were not added to this document
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}