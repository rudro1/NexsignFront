import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Pencil, Layout, Download, Eye,
  XCircle, Users, Trash2,
} from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const STATUS = {
  draft: {
    label: 'Draft', icon: Pencil,
    card:       'border-slate-200 dark:border-slate-700/50',
    badge:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon_bg:    'bg-slate-100 dark:bg-slate-800',
    icon_color: 'text-slate-500',
    bar:        'from-slate-300 to-slate-400',
  },
  pending: {
    label: 'Pending', icon: Clock,
    card:       'border-amber-200/60 dark:border-amber-800/40',
    badge:      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon_bg:    'bg-amber-50 dark:bg-amber-900/20',
    icon_color: 'text-amber-500',
    bar:        'from-amber-400 to-amber-500',
  },
  in_progress: {
    label: 'In Progress', icon: Clock,
    card:       'border-sky-200/60 dark:border-sky-800/40',
    badge:      'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon_bg:    'bg-sky-50 dark:bg-sky-900/20',
    icon_color: 'text-sky-500',
    bar:        'from-sky-400 to-sky-500',
  },
  sent: {
    label: 'Sent', icon: Clock,
    card:       'border-sky-200/60 dark:border-sky-800/40',
    badge:      'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon_bg:    'bg-sky-50 dark:bg-sky-900/20',
    icon_color: 'text-sky-500',
    bar:        'from-sky-400 to-sky-500',
  },
  completed: {
    label: 'Completed', icon: CheckCircle2,
    card:       'border-emerald-200/60 dark:border-emerald-800/40',
    badge:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon_bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    icon_color: 'text-emerald-500',
    bar:        'from-emerald-400 to-emerald-500',
  },
  declined: {
    label: 'Declined', icon: XCircle,
    card:       'border-red-200/60 dark:border-red-800/40',
    badge:      'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon_bg:    'bg-red-50 dark:bg-red-900/20',
    icon_color: 'text-red-500',
    bar:        'from-red-400 to-red-500',
  },
  cancelled: {
    label: 'Cancelled', icon: AlertCircle,
    card:       'border-red-200/60 dark:border-red-800/40',
    badge:      'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon_bg:    'bg-red-50 dark:bg-red-900/20',
    icon_color: 'text-red-500',
    bar:        'from-red-400 to-red-500',
  },
  template: {
    label: 'Template', icon: Layout,
    card:       'border-violet-200/60 dark:border-violet-800/40',
    badge:      'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon_bg:    'bg-violet-50 dark:bg-violet-900/20',
    icon_color: 'text-violet-500',
    bar:        'from-violet-400 to-violet-500',
  },
};

const PARTY_COLORS = [
  '#0ea5e9','#8b5cf6','#f59e0b',
  '#10b981','#ef4444','#ec4899',
];

// ── Avatar Stack ──────────────────────────────────────────────────
const AvatarStack = ({ parties }) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <div className="flex -space-x-1.5 shrink-0">
      {parties.slice(0, 3).map((p, i) => (
        <div
          key={i}
          title={`${p.name || `Party ${i + 1}`}${p.status === 'signed' ? ' ✓' : ''}`}
          className={cn(
            'w-6 h-6 rounded-full border-2',
            'border-white dark:border-slate-900',
            'flex items-center justify-center',
            'text-[9px] font-black text-white',
            'shadow-sm select-none',
            p.status === 'signed' && 'ring-1 ring-emerald-400',
          )}
          style={{ background: PARTY_COLORS[i % PARTY_COLORS.length] }}
        >
          {(p.name || 'P').charAt(0).toUpperCase()}
        </div>
      ))}
      {parties.length > 3 && (
        <div className="w-6 h-6 rounded-full border-2
                        border-white dark:border-slate-900
                        bg-slate-100 dark:bg-slate-700
                        flex items-center justify-center
                        text-[9px] font-black text-slate-500">
          +{parties.length - 3}
        </div>
      )}
    </div>
    <span className="text-[10px] font-semibold text-slate-400 truncate">
      {parties.length} {parties.length === 1 ? 'party' : 'parties'}
    </span>
  </div>
);

// ── Action Button ─────────────────────────────────────────────────
const ActionBtn = ({ onClick, variant = 'default', children, className }) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    primary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm',
    ghost:   'bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800',
    danger:  'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800',
  };
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg',
        'text-[10px] sm:text-xs font-semibold transition-all duration-150',
        'active:scale-95 whitespace-nowrap',
        variants[variant], className,
      )}>
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const DocumentCard = React.memo(({ doc, viewMode = 'grid', onDelete }) => {
  const navigate = useNavigate();
  const parties  = doc?.parties || [];

  const cfg = useMemo(() => {
    if (doc.isTemplate) return STATUS.template;
    return STATUS[doc.status] || STATUS.draft;
  }, [doc.status, doc.isTemplate]);

  const StatusIcon = cfg.icon;

  const progress = useMemo(() => {
    if (!parties.length) return 0;
    return Math.round(
      (parties.filter(p => p.status === 'signed').length / parties.length) * 100
    );
  }, [parties]);

  const signedCount = useMemo(
    () => parties.filter(p => p.status === 'signed').length,
    [parties],
  );

  const currentSigner = useMemo(() => {
    if (doc.status !== 'in_progress' && doc.status !== 'sent') return null;
    if (doc.isTemplate) return null;
    return parties.find(p => p.status !== 'signed') || null;
  }, [parties, doc.status, doc.isTemplate]);

  const formattedDate = useMemo(() => {
    const d = new Date(doc.createdAt || doc.updatedAt);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }, [doc.createdAt, doc.updatedAt]);

  const canDelete = useMemo(
    () => !!onDelete && (doc.status === 'draft' || doc.status === 'completed'),
    [onDelete, doc.status],
  );

  // ── Handlers ──────────────────────────────────────────────────
  const handleCardClick = useCallback(() => {
    if (doc.isTemplate)         return navigate(`/templates/${doc._id}`);
    if (doc.status === 'draft') return navigate(`/document-editor?id=${doc._id}`);
    navigate(`/documents/${doc._id}`);
  }, [doc, navigate]);

  const stop = (fn) => (e) => { e.stopPropagation(); fn(e); };

  const handleView = stop(() => {
    if (doc.signedFileUrl) window.open(doc.signedFileUrl, '_blank');
  });

  const handleDownload = stop(() => {
    if (!doc.signedFileUrl) return;
    const a = document.createElement('a');
    a.href = doc.signedFileUrl;
    a.download = `${doc.title || 'document'}.pdf`;
    a.target = '_blank';
    a.click();
  });

  const handleDelete = stop(async () => {
    if (!canDelete) return;
    if (!window.confirm('Delete this document?')) return;
    try {
      const { api } = await import('@/api/apiClient');
      await api.delete(`/documents/${doc._id}`);
      onDelete?.(doc._id);
    } catch (err) {
      alert(err?.message || 'Failed to delete.');
    }
  });

  // ── LIST VIEW ─────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className={cn(
          'group w-full flex items-center gap-2 sm:gap-3',
          'bg-white dark:bg-slate-900/80 rounded-xl',
          'border-2 cursor-pointer',
          'px-3 py-3 sm:px-4 sm:py-3.5',
          'transition-all duration-200',
          'hover:shadow-md active:scale-[0.99]',
          // ✅ overflow fix
          'overflow-hidden',
          cfg.card,
        )}
      >
        {/* Icon */}
        <div className={cn(
          'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center',
          'justify-center shrink-0', cfg.icon_bg,
        )}>
          <StatusIcon size={14} className={cfg.icon_color} />
        </div>

        {/* Title + date */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs sm:text-sm font-bold
                        text-slate-900 dark:text-white
                        truncate group-hover:text-sky-500
                        transition-colors">
            {doc.title || 'Untitled Document'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 shrink-0">
              {formattedDate}
            </span>
            {currentSigner && (
              <>
                <span className="text-slate-300 dark:text-slate-600 shrink-0">·</span>
                <span className="flex items-center gap-1
                                 text-[10px] text-sky-500
                                 font-medium truncate">
                  <span className="w-1 h-1 rounded-full bg-sky-400
                                   animate-pulse shrink-0" />
                  <span className="truncate">{currentSigner.name}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress — hidden on small mobile */}
        {!doc.isTemplate && parties.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800
                            rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full bg-gradient-to-r', cfg.bar)}
                   style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
              {signedCount}/{parties.length}
            </span>
          </div>
        )}

        {/* Badge — hidden on xs */}
        <span className={cn(
          'hidden sm:block shrink-0 px-2 py-0.5 rounded-lg',
          'text-[9px] font-bold uppercase tracking-wide',
          cfg.badge,
        )}>
          {cfg.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0"
             onClick={e => e.stopPropagation()}>
          {doc.status === 'completed' && doc.signedFileUrl ? (
            <>
              <ActionBtn onClick={handleView} variant="ghost">
                <Eye size={11} />
                <span className="hidden sm:inline">View</span>
              </ActionBtn>
              <ActionBtn onClick={handleDownload} variant="primary">
                <Download size={11} />
                <span className="hidden sm:inline">PDF</span>
              </ActionBtn>
            </>
          ) : (
            <ActionBtn onClick={stop(handleCardClick)} variant="default">
              <span className="hidden xs:inline">
                {doc.isTemplate ? 'Use'
                  : doc.status === 'draft' ? 'Edit' : 'Manage'}
              </span>
              <ArrowRight size={11} />
            </ActionBtn>
          )}
          {canDelete && (
            <ActionBtn onClick={handleDelete} variant="danger">
              <Trash2 size={11} />
            </ActionBtn>
          )}
        </div>
      </div>
    );
  }

  // ── GRID VIEW ─────────────────────────────────────────────────
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-col w-full',
        'bg-white dark:bg-slate-900/80',
        'rounded-xl border-2 cursor-pointer',
        'transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        'active:scale-[0.99]',
        // ✅ critical: prevent overflow on iPhone
        'overflow-hidden',
        cfg.card,
      )}
    >
      {/* Top accent */}
      {doc.status === 'completed' && (
        <div className="absolute inset-x-6 top-0 h-0.5
                        bg-gradient-to-r from-emerald-400
                        to-emerald-500 rounded-full" />
      )}

      <div className="p-3 sm:p-4 flex flex-col gap-3 h-full">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center',
              'justify-center shrink-0 mt-0.5', cfg.icon_bg,
            )}>
              <StatusIcon size={14} className={cfg.icon_color} />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="text-xs sm:text-sm font-bold
                             text-slate-900 dark:text-white
                             truncate leading-snug
                             group-hover:text-sky-500 transition-colors">
                {doc.title || 'Untitled Document'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {formattedDate || '—'}
              </p>
            </div>
          </div>

          {/* Badge + delete */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn(
              'px-1.5 py-0.5 rounded-lg shrink-0',
              'text-[9px] font-bold uppercase tracking-wide',
              cfg.badge,
            )}>
              {cfg.label}
            </span>
            {canDelete && (
              <button type="button" onClick={handleDelete}
                className="p-1 rounded-lg text-slate-300
                           hover:text-red-500 hover:bg-red-50
                           dark:hover:bg-red-900/20
                           opacity-0 group-hover:opacity-100
                           transition-all">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!doc.isTemplate && parties.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold
                               text-slate-400 uppercase tracking-wide">
                Progress
              </span>
              <span className="text-[10px] font-bold
                               text-slate-600 dark:text-slate-300 tabular-nums">
                {signedCount}/{parties.length} · {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800
                            rounded-full overflow-hidden">
              <div className={cn(
                'h-full rounded-full bg-gradient-to-r',
                'transition-all duration-700 ease-out', cfg.bar,
              )}
              style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Template recipients */}
        {doc.isTemplate && doc.recipientCount != null && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                          bg-violet-50 dark:bg-violet-900/20
                          border border-violet-100 dark:border-violet-800/30">
            <Users size={11} className="text-violet-500 shrink-0" />
            <span className="text-[10px] font-semibold
                             text-violet-700 dark:text-violet-400 truncate">
              {doc.recipientCount} recipients
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2.5 border-t border-slate-100
                        dark:border-slate-800
                        flex items-center justify-between gap-2">
          {parties.length > 0
            ? <AvatarStack parties={parties} />
            : (
              <span className="flex items-center gap-1
                               text-[10px] text-slate-400 min-w-0">
                <FileText size={11} className="shrink-0" />
                <span className="truncate">
                  {doc.isTemplate ? 'Template' : 'No parties'}
                </span>
              </span>
            )
          }

          <div className="flex items-center gap-1 shrink-0"
               onClick={e => e.stopPropagation()}>
            {doc.status === 'completed' && doc.signedFileUrl ? (
              <>
                <ActionBtn onClick={handleView} variant="ghost">
                  <Eye size={11} />
                </ActionBtn>
                <ActionBtn onClick={handleDownload} variant="primary">
                  <Download size={11} />
                  <span className="hidden sm:inline">PDF</span>
                </ActionBtn>
              </>
            ) : (
              <ActionBtn onClick={stop(handleCardClick)} variant="default">
                {doc.isTemplate ? 'Use'
                  : doc.status === 'draft' ? 'Edit' : 'Open'}
                <ArrowRight size={11} />
              </ActionBtn>
            )}
          </div>
        </div>

        {/* Awaiting chip */}
        {currentSigner && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                          bg-sky-50 dark:bg-sky-900/20
                          border border-sky-100 dark:border-sky-800/40
                          overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400
                             animate-pulse shrink-0" />
            <p className="text-[10px] font-medium text-sky-600
                          dark:text-sky-400 truncate">
              Awaiting{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {currentSigner.name}
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
});

DocumentCard.displayName = 'DocumentCard';
export default DocumentCard;