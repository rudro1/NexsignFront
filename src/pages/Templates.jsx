// src/pages/Templates.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutTemplate, Plus, Loader2, RefreshCw,
  Search, X, AlertTriangle, Users, CheckCircle2,
  Clock3, Zap, ChevronRight, Trash2, Eye,
  FileSignature, Crown, BarChart3, Send,
  Archive, MoreVertical, TrendingUp,
} from 'lucide-react';

import { Button }                           from '@/components/ui/button';
import { Input }                            from '@/components/ui/input';
import { Badge }                            from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTemplates, useTemplateMutations } from '@/hooks/useTemplate';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtRelative(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return fmtDate(d);
}

// ═══════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════
const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    bg:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot:   'bg-slate-400',
  },
  boss_pending: {
    label: 'Awaiting Your Signature',
    bg:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    dot:   'bg-amber-500 animate-pulse',
  },
  active: {
    label: 'Active',
    bg:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
    dot:   'bg-sky-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    bg:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    dot:   'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    bg:    'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-500',
    dot:   'bg-slate-400',
  },
};

// ═══════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════
function TemplateSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800
                    bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════
function StatCard({ label, value, icon: Icon, color, loading }) {
  const colors = {
    sky:   'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border
                    border-slate-100 dark:border-slate-800
                    p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center
                       justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-10 bg-slate-100 dark:bg-slate-800
                          rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900
                        dark:text-white leading-none">
            {value ?? 0}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
function ProgressBar({ signed = 0, total = 0 }) {
  const pct = total > 0 ? Math.round((signed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{signed}/{total} signed</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700
                     bg-gradient-to-r from-sky-400 to-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE CARD
// ═══════════════════════════════════════════════════════════════
function TemplateCard({ template, onDelete, onView }) {
  const nav       = useNavigate();
  const mutations = useTemplateMutations();

  const status     = STATUS_CONFIG[template.status] || STATUS_CONFIG.draft;
  const isBossSign = template.status === 'boss_pending';
  const isActive   = template.status === 'active';

  const signed  = template.stats?.signed           || 0;
  const total   = template.stats?.totalRecipients  || template.recipients?.length || 0;
  const pending = template.stats?.pending          || 0;
  const declined= template.stats?.declined         || 0;

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${template.title}"? This cannot be undone.`)) return;

    // Optimistic
    onDelete(template._id);

    const res = await mutations.deleteTemplate(template._id);
    if (!res.success) {
      toast.error(res.error || 'Delete failed.');
    } else {
      toast.success('Template deleted.');
    }
  }, [template, onDelete, mutations]);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border
                    border-slate-100 dark:border-slate-800
                    hover:border-slate-200 dark:hover:border-slate-700
                    hover:shadow-md transition-all duration-200
                    flex flex-col">

      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-3">

        {/* Logo / Icon */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0
                        bg-gradient-to-br from-sky-50 to-sky-100
                        dark:from-sky-900/30 dark:to-sky-900/20
                        flex items-center justify-center">
          {template.companyLogo ? (
            <img
              src={template.companyLogo}
              alt={template.companyName || 'Logo'}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <LayoutTemplate className="w-5 h-5 text-sky-500" />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-white
                         text-sm leading-snug truncate">
            {template.title}
          </h3>
          {template.companyName && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {template.companyName}
            </p>
          )}
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-7 h-7 rounded-lg flex items-center
                         justify-center text-slate-400
                         hover:text-slate-600 hover:bg-slate-100
                         dark:hover:bg-slate-800 transition-colors
                         opacity-0 group-hover:opacity-100"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => nav(`/templates/${template._id}`)}
              className="gap-2 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="gap-2 cursor-pointer text-red-500
                         focus:text-red-500 focus:bg-red-50
                         dark:focus:bg-red-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats grid */}
      <div className="px-5 pb-3 grid grid-cols-3 gap-2">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl
                        p-2.5 text-center">
          <p className="text-base font-bold text-slate-800 dark:text-white">
            {total}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Recipients</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl
                        p-2.5 text-center">
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {signed}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Signed</p>
        </div>
        <div className={`rounded-xl p-2.5 text-center
          ${declined > 0
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-slate-50 dark:bg-slate-800/50'
          }`}>
          <p className={`text-base font-bold
            ${declined > 0
              ? 'text-red-500'
              : 'text-slate-800 dark:text-white'
            }`}>
            {pending}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending</p>
        </div>
      </div>

      {/* Progress (active templates) */}
      {(isActive || template.status === 'completed') && total > 0 && (
        <div className="px-5 pb-3">
          <ProgressBar signed={signed} total={total} />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pb-4 mt-auto space-y-3">

        {/* Status + date */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-[11px]
                            font-semibold px-2.5 py-1 rounded-full
                            ${status.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            {fmtRelative(template.updatedAt || template.createdAt)}
          </span>
        </div>

        {/* CTA Button */}
        {isBossSign ? (
          <Link to={`/templates/${template._id}`} className="block">
            <Button
              size="sm"
              className="w-full h-9 rounded-xl font-semibold gap-2
                         bg-amber-500 hover:bg-amber-600 text-white
                         shadow-sm shadow-amber-400/25
                         transition-all hover:-translate-y-0.5"
            >
              <Crown className="w-3.5 h-3.5" />
              Sign Now
            </Button>
          </Link>
        ) : (
          <Link to={`/templates/${template._id}`} className="block">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 rounded-xl font-medium gap-2
                         border-slate-200 dark:border-slate-700
                         hover:border-sky-400 hover:text-sky-600
                         dark:hover:border-sky-500 dark:hover:text-sky-400
                         transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              {isActive ? 'Track Progress' : 'View Details'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FILTER TABS
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { key: 'all',          label: 'All'       },
  { key: 'boss_pending', label: 'Needs Sign' },
  { key: 'active',       label: 'Active'    },
  { key: 'completed',    label: 'Completed' },
  { key: 'draft',        label: 'Draft'     },
];

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function Templates() {
  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const {
    templates,
    stats,
    loading,
    error,
    isStale,
    refetch,
    optimisticDelete,
  } = useTemplates({
    status:  activeTab,
    search,
    limit:   20,
    enabled: true,
  });

  // Client-side filter for instant search feel
  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(t =>
      (t.title       || '').toLowerCase().includes(q) ||
      (t.companyName || '').toLowerCase().includes(q),
    );
  }, [templates, search]);

  // Count boss_pending for badge
  const needsSignCount = useMemo(
    () => templates.filter(t => t.status === 'boss_pending').length,
    [templates],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10 space-y-6">

        {/* ════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold
                           text-slate-900 dark:text-white tracking-tight">
              Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create once, distribute to many — One-to-Many signing workflow
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Stale indicator */}
            {isStale && !loading && (
              <span className="text-xs text-slate-400 hidden sm:block">
                Refreshing…
              </span>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              disabled={loading}
              aria-label="Refresh"
              className="h-10 w-10 rounded-xl border-slate-200
                         dark:border-slate-700 hover:border-sky-400
                         hover:text-sky-500 transition-colors"
            >
              <RefreshCw className={`w-4 h-4
                ${loading ? 'animate-spin text-sky-500' : ''}`}
              />
            </Button>

            <Link to="/templates/new">
              <Button
                className="h-10 px-5 rounded-xl font-semibold gap-2
                           bg-[#28ABDF] hover:bg-[#2399c8] text-white
                           shadow-md shadow-sky-400/25
                           transition-all hover:-translate-y-0.5
                           active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            STATS ROW
        ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Templates"
            value={stats?.total}
            icon={LayoutTemplate}
            color="sky"
            loading={loading && !templates.length}
          />
          <StatCard
            label="Needs Your Signature"
            value={stats?.boss_pending}
            icon={Crown}
            color="amber"
            loading={loading && !templates.length}
          />
          <StatCard
            label="Active"
            value={stats?.active}
            icon={Zap}
            color="sky"
            loading={loading && !templates.length}
          />
          <StatCard
            label="Completed"
            value={stats?.completed}
            icon={CheckCircle2}
            color="green"
            loading={loading && !templates.length}
          />
        </div>

        {/* ════════════════════════════════════════════════════
            SEARCH + FILTERS
        ════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2
                               w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         text-sm focus-visible:ring-[#28ABDF]/30
                         focus-visible:border-[#28ABDF]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-400 hover:text-slate-600
                           transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto
                          pb-1 sm:pb-0 no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2 rounded-xl text-xs
                            font-semibold whitespace-nowrap transition-all
                            ${activeTab === tab.key
                              ? 'bg-[#28ABDF] text-white shadow-sm shadow-sky-400/25'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:text-sky-600'
                            }`}
              >
                {tab.label}
                {tab.key === 'boss_pending' && needsSignCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4
                                   rounded-full bg-amber-500 text-white
                                   text-[9px] font-bold flex items-center
                                   justify-center">
                    {needsSignCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            ERROR
        ════════════════════════════════════════════════════ */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl
                          bg-red-50 dark:bg-red-900/20
                          border border-red-100 dark:border-red-900">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={refetch}
              className="rounded-lg border-red-200 text-red-500 text-xs"
            >
              Retry
            </Button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TEMPLATE GRID
        ════════════════════════════════════════════════════ */}
        {loading && !templates.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <TemplateSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} activeTab={activeTab} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(tpl => (
                <TemplateCard
                  key={tpl._id}
                  template={tpl}
                  onDelete={optimisticDelete}
                />
              ))}
            </div>

            {/* Count */}
            <p className="text-xs text-slate-400 px-0.5">
              Showing {filtered.length}
              {search
                ? ` result${filtered.length !== 1 ? 's' : ''} for "${search}"`
                : ` template${filtered.length !== 1 ? 's' : ''}`
              }
            </p>
          </>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ search, activeTab }) {
  const isFiltered = search || activeTab !== 'all';

  return (
    <div className="py-20 text-center bg-white dark:bg-slate-900
                    rounded-2xl border-2 border-dashed
                    border-slate-200 dark:border-slate-700">
      <div className="w-16 h-16 rounded-2xl
                      bg-gradient-to-br from-sky-50 to-sky-100
                      dark:from-sky-900/30 dark:to-sky-900/20
                      flex items-center justify-center
                      mx-auto mb-5">
        <LayoutTemplate className="w-7 h-7 text-sky-400" />
      </div>

      <h3 className="font-bold text-slate-700 dark:text-slate-300
                     text-lg mb-2">
        {isFiltered
          ? 'No templates found'
          : 'No templates yet'
        }
      </h3>

      <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
        {isFiltered
          ? 'Try adjusting your search or filter'
          : 'Create your first template to start sending documents to multiple recipients at once'
        }
      </p>

      {!isFiltered && (
        <Link to="/templates/new">
          <Button
            className="rounded-xl bg-[#28ABDF] hover:bg-[#2399c8]
                       text-white gap-2 shadow-md shadow-sky-400/25
                       transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create First Template
          </Button>
        </Link>
      )}
    </div>
  );
}