// src/pages/Audit.jsx

import React, {
  useEffect, useMemo, useState, useCallback, useRef,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { toast }  from 'sonner';
import {
  Loader2, ShieldCheck, ArrowLeft, Download,
  User, Mail, MapPin, Clock, Monitor,
  Globe, AlertTriangle, CheckCircle2,
  XCircle, Send, Eye, FileText,
  RefreshCw, Hash, Smartphone,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function formatTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  });
}

function formatTimeShort(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function timeAgo(v) {
  if (!v) return '';
  const diff = Date.now() - new Date(v).getTime();
  const m    = Math.floor(diff / 60000);
  const h    = Math.floor(m / 60);
  const d    = Math.floor(h / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return 'Just now';
}

// Event metadata
const EVENT_META = {
  document_created:  { color: 'bg-sky-500',     icon: FileText,     label: 'Document Created'  },
  document_sent:     { color: 'bg-blue-500',     icon: Send,         label: 'Document Sent'     },
  document_viewed:   { color: 'bg-slate-400',    icon: Eye,          label: 'Document Viewed'   },
  signed:            { color: 'bg-emerald-500',  icon: CheckCircle2, label: 'Signed'            },
  declined:          { color: 'bg-red-500',      icon: XCircle,      label: 'Declined'          },
  completed:         { color: 'bg-emerald-600',  icon: ShieldCheck,  label: 'Completed'         },
  reminder_sent:     { color: 'bg-amber-500',    icon: Clock,        label: 'Reminder Sent'     },
};

function getEventMeta(type) {
  const key = (type || '').toLowerCase().replace(/\s+/g, '_');
  return EVENT_META[key] || {
    color: 'bg-slate-300',
    icon:  FileText,
    label: type || 'Event',
  };
}

function getStatusStyle(status) {
  switch ((status || '').toLowerCase()) {
    case 'signed':
    case 'completed': return {
      bg:   'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot:  'bg-emerald-500',
    };
    case 'pending': return {
      bg:   'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      dot:  'bg-amber-500',
    };
    case 'declined': return {
      bg:   'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      dot:  'bg-red-500',
    };
    default: return {
      bg:   'bg-slate-50 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      dot:  'bg-slate-400',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function InfoChip({ icon: Icon, label, value, mono }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500
                    dark:text-slate-400">
      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
      {label && (
        <span className="text-slate-400 font-medium shrink-0">
          {label}:
        </span>
      )}
      <span className={`text-slate-700 dark:text-slate-300 truncate
                        ${mono ? 'font-mono text-[11px]' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children, action }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl
                    border border-slate-100 dark:border-slate-800
                    shadow-sm overflow-hidden">
      <div className="flex items-center justify-between
                      px-5 py-4 border-b border-slate-50
                      dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h2 className="font-semibold text-sm text-slate-800
                         dark:text-white">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Signer Card
// ─────────────────────────────────────────────────────────────────
function SignerCard({ party, index }) {
  const status  = party.status || (party.signedAt ? 'signed' : 'pending');
  const style   = getStatusStyle(status);
  const location = [
    party.signedCity || party.city,
    party.signedPostalCode || party.postalCode,
  ].filter(Boolean).join(', ');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl
                    border border-slate-100 dark:border-slate-800
                    shadow-sm p-4 space-y-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center
                       justify-center text-white text-sm font-bold
                       shrink-0"
            style={{ backgroundColor: party.color || '#94a3b8' }}
          >
            {(party.name || '#')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-800
                          dark:text-white truncate">
              {party.name || '—'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {party.email || '—'}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         text-xs font-semibold shrink-0 ${style.bg} ${style.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Signing details */}
      {party.signedAt && (
        <div className="pt-3 border-t border-slate-50
                        dark:border-slate-800 space-y-2">
          <InfoChip
            icon={Clock}
            label="Signed"
            value={formatTime(party.signedAt)}
          />
          <InfoChip
            icon={Globe}
            label="IP"
            value={party.signedIpAddress || party.ipAddress}
            mono
          />
          {location && (
            <InfoChip
              icon={MapPin}
              label="Location"
              value={location}
            />
          )}
          {(party.signedDevice || party.device) && (
            <InfoChip
              icon={Smartphone}
              label="Device"
              value={party.signedDevice || party.device}
            />
          )}
          {(party.signedBrowser || party.browser) && (
            <InfoChip
              icon={Monitor}
              label="Browser"
              value={`${party.signedBrowser || party.browser || ''}${party.signedOs || party.os ? ` · ${party.signedOs || party.os}` : ''}`}
            />
          )}
        </div>
      )}

      {/* Pending */}
      {!party.signedAt && status === 'pending' && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50
                        dark:border-slate-800">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Awaiting signature
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Event Timeline Item
// ─────────────────────────────────────────────────────────────────
function TimelineItem({ event, isLast }) {
  const meta  = getEventMeta(event.eventType);
  const Icon  = meta.icon;
  const actor = [event.actorName, event.actorEmail
    ? `<${event.actorEmail}>` : '']
    .filter(Boolean).join(' ') || 'System';

  return (
    <div className="flex gap-4">
      {/* Line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-xl flex items-center
                         justify-center shrink-0 text-white ${meta.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800
                          mt-2 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-1 mb-1.5">
          <p className="text-sm font-semibold text-slate-800
                        dark:text-white">
            {meta.label}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{formatTimeShort(event.occurredAt)}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{timeAgo(event.occurredAt)}</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl
                        px-3 py-2.5 space-y-1.5">
          <InfoChip icon={User}  value={actor} />
          {event.ipAddress && (
            <InfoChip icon={Globe} label="IP" value={event.ipAddress} mono />
          )}
          {event.location && (
            <InfoChip icon={MapPin} value={event.location} />
          )}
          {event.device && (
            <InfoChip icon={Smartphone} value={event.device} />
          )}
          {event.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400
                          italic mt-1">
              {event.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────
function AuditSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100
                          dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-60 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100
                                   dark:bg-slate-800" />
        ))}
      </div>

      {/* Signers */}
      <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-36 rounded-2xl bg-slate-100
                                   dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
export default function Audit() {
  const { id } = useParams();

  const [loading,  setLoading]  = useState(true);
  const [audit,    setAudit]    = useState(null);
  const [error,    setError]    = useState(null);
  const [syncing,  setSyncing]  = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchAudit = useCallback(async (silent = false) => {
    if (!id) return;
    silent ? setSyncing(true) : setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/documents/${id}/audit`);
      if (mountedRef.current) {
        setAudit(res.data?.audit || res.data || null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err.response?.data?.error
                 || err.response?.data?.message
                 || 'Failed to load audit log.';
        setError(msg);
        if (!silent) toast.error(msg);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setSyncing(false);
      }
    }
  }, [id]);

  useEffect(() => { fetchAudit(false); }, [fetchAudit]);

  // ── Derived ───────────────────────────────────────────────────
  const parties = useMemo(() => audit?.parties ?? [], [audit]);
  const events  = useMemo(() => audit?.events  ?? [], [audit]);

  const stats = useMemo(() => ({
    total:     parties.length,
    signed:    parties.filter(p =>
                 p.status === 'signed' || p.signedAt
               ).length,
    pending:   parties.filter(p =>
                 !p.signedAt && p.status !== 'declined'
               ).length,
    declined:  parties.filter(p => p.status === 'declined').length,
    completed: audit?.status === 'completed',
  }), [parties, audit]);

  // ── Download ──────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    try {
      const res = await api.get(
        `/documents/${id}/audit/download`,
        { responseType: 'blob' }
      );
      const url  = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `audit-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download audit log.');
    }
  }, [id]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  // No ID
  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
                      flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm p-8 text-center max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-amber-400
                                     mx-auto mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No document ID
          </p>
          <p className="text-sm text-slate-400 mb-5">
            Please navigate from a document.
          </p>
          <Link to="/dashboard">
            <Button className="w-full rounded-xl bg-[#28ABDF]
                               hover:bg-[#2399c8] text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10 space-y-6">

        {/* ══════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#28ABDF]/10
                            flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#28ABDF]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold
                             text-slate-900 dark:text-white
                             tracking-tight">
                Audit Log
              </h1>
              {audit?.title && (
                <p className="text-sm text-slate-500 dark:text-slate-400
                              truncate max-w-xs sm:max-w-sm">
                  {audit.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchAudit(true)}
              disabled={syncing}
              aria-label="Refresh"
              className="h-9 w-9 rounded-xl border-slate-200
                         dark:border-slate-700 hover:border-[#28ABDF]
                         hover:text-[#28ABDF] transition-colors"
            >
              <RefreshCw className={`w-4 h-4
                ${syncing ? 'animate-spin' : ''}`}
              />
            </Button>

            {audit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-9 px-4 rounded-xl border-slate-200
                           dark:border-slate-700 gap-1.5 text-sm
                           font-medium hover:border-[#28ABDF]
                           hover:text-[#28ABDF] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            )}

            <Link to="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl border-slate-200
                           dark:border-slate-700 gap-1.5 text-sm
                           font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Loading ─────────────────────────────────────────── */}
        {loading && <AuditSkeleton />}

        {/* ── Error ───────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex items-center gap-4 p-5 rounded-2xl
                          bg-red-50 dark:bg-red-900/20
                          border border-red-100 dark:border-red-900">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400
                            text-sm">
                {error}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAudit(false)}
              className="rounded-xl border-red-200 text-red-500 shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── No data ─────────────────────────────────────────── */}
        {!loading && !error && !audit && (
          <div className="text-center py-20 bg-white dark:bg-slate-900
                          rounded-2xl border border-dashed
                          border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              No audit data found
            </p>
            <p className="text-sm text-slate-400 mt-1">
              This document may not have any activity yet.
            </p>
          </div>
        )}

        {/* ── Audit content ────────────────────────────────────── */}
        {!loading && audit && (
          <>
            {/* ════════════════════════════════════════════════════
                STATS
            ════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: 'Total Signers',
                  value: stats.total,
                  icon:  User,
                  bg:    'bg-sky-50 dark:bg-sky-900/20',
                  text:  'text-sky-700 dark:text-sky-400',
                  icon_c:'text-sky-500',
                },
                {
                  label: 'Signed',
                  value: stats.signed,
                  icon:  CheckCircle2,
                  bg:    'bg-emerald-50 dark:bg-emerald-900/20',
                  text:  'text-emerald-700 dark:text-emerald-400',
                  icon_c:'text-emerald-500',
                },
                {
                  label: 'Pending',
                  value: stats.pending,
                  icon:  Clock,
                  bg:    'bg-amber-50 dark:bg-amber-900/20',
                  text:  'text-amber-700 dark:text-amber-400',
                  icon_c:'text-amber-500',
                },
                {
                  label: 'Status',
                  value: stats.completed ? 'Complete' : 'In Progress',
                  icon:  ShieldCheck,
                  bg:    stats.completed
                           ? 'bg-emerald-50 dark:bg-emerald-900/20'
                           : 'bg-slate-50 dark:bg-slate-800',
                  text:  stats.completed
                           ? 'text-emerald-700 dark:text-emerald-400'
                           : 'text-slate-600 dark:text-slate-400',
                  icon_c: stats.completed
                            ? 'text-emerald-500'
                            : 'text-slate-400',
                },
              ].map(s => (
                <div
                  key={s.label}
                  className={`rounded-2xl p-4 ${s.bg}
                              border border-white/60
                              dark:border-slate-700/40`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`w-4 h-4 ${s.icon_c}`} />
                    <p className="text-xs font-medium text-slate-500
                                  dark:text-slate-400">
                      {s.label}
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${s.text}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* ════════════════════════════════════════════════════
                DOCUMENT META
            ════════════════════════════════════════════════════ */}
            {(audit.documentId || audit.createdAt || audit.completedAt) && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm px-5 py-4">
                <div className="flex flex-wrap gap-4">
                  {audit.documentId && (
                    <InfoChip
                      icon={Hash}
                      label="Doc ID"
                      value={audit.documentId}
                      mono
                    />
                  )}
                  {audit.createdAt && (
                    <InfoChip
                      icon={Clock}
                      label="Created"
                      value={formatTime(audit.createdAt)}
                    />
                  )}
                  {audit.completedAt && (
                    <InfoChip
                      icon={CheckCircle2}
                      label="Completed"
                      value={formatTime(audit.completedAt)}
                    />
                  )}
                  {audit.ipAddress && (
                    <InfoChip
                      icon={Globe}
                      label="Origin IP"
                      value={audit.ipAddress}
                      mono
                    />
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════
                SIGNERS
            ════════════════════════════════════════════════════ */}
            <SectionCard
              title={`Signers (${parties.length})`}
              icon={User}
              iconColor="text-[#28ABDF]"
            >
              {parties.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No signers recorded.
                </div>
              ) : (
                <div className="p-4 grid sm:grid-cols-2
                                lg:grid-cols-3 gap-4">
                  {parties.map((party, i) => (
                    <SignerCard
                      key={`${party.email}-${i}`}
                      party={party}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ════════════════════════════════════════════════════
                EVENT TIMELINE
            ════════════════════════════════════════════════════ */}
            <SectionCard
              title={`Event Timeline (${events.length})`}
              icon={Clock}
              iconColor="text-purple-500"
            >
              {events.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No events recorded yet.
                </div>
              ) : (
                <div className="p-5">
                  {events.map((ev, idx) => (
                    <TimelineItem
                      key={`${ev.eventType}-${idx}`}
                      event={ev}
                      isLast={idx === events.length - 1}
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ════════════════════════════════════════════════════
                LEGAL FOOTER
            ════════════════════════════════════════════════════ */}
            <div className="flex items-start gap-3 p-4 rounded-2xl
                            bg-white dark:bg-slate-900
                            border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#28ABDF] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400
                            leading-relaxed">
                This audit log is cryptographically sealed and
                tamper-evident. All timestamps are recorded in UTC and
                converted to local time for display. IP addresses and
                device information are collected for legal compliance
                and fraud prevention purposes.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}