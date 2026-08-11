// // src/pages/Dashboard.jsx
// import React, {
//   useState, useEffect, useCallback,
//   useMemo, useRef, useTransition,
// } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Plus, Search, FileText, CheckCircle2,
//   Send, RefreshCw, X, AlertTriangle,
//   Clock, Loader2, LayoutGrid, List,
//   ChevronDown,
// } from 'lucide-react';
// import StatsCard    from '@/components/dashboard/StatsCard';
// import DocumentCard from '@/components/dashboard/DocumentCard';
// import { useAuth }  from '@/lib/AuthContext';
// import usePolling   from '@/hooks/usePolling';
// import { toast }    from 'sonner';

// // ════════════════════════════════════════════════════════════════
// // CACHE
// // ════════════════════════════════════════════════════════════════
// const CACHE_KEY = (uid) => `nexsign_docs_v3_${uid}`;

// const readCache = (uid) => {
//   try {
//     const raw = localStorage.getItem(CACHE_KEY(uid));
//     if (!raw) return { documents: [], stats: null, totalPages: 1 };
//     return JSON.parse(raw);
//   } catch {
//     return { documents: [], stats: null, totalPages: 1 };
//   }
// };

// const writeCache = (uid, data) => {
//   try {
//     localStorage.setItem(CACHE_KEY(uid), JSON.stringify(data));
//   } catch {}
// };

// // ════════════════════════════════════════════════════════════════
// // CONSTANTS
// // ════════════════════════════════════════════════════════════════
// const STATUS_TABS = [
//   { value: 'all',         label: 'All'      },
//   { value: 'in_progress', label: 'Active'   },
//   { value: 'completed',   label: 'Done'     },
//   { value: 'draft',       label: 'Drafts'   },
//   { value: 'declined',    label: 'Declined' },
// ];

// const PAGE_LIMIT = 10;

// // ════════════════════════════════════════════════════════════════
// // SKELETON — memoized, no re-render
// // ════════════════════════════════════════════════════════════════
// const DocSkeleton = React.memo(function DocSkeleton({ viewMode }) {
//   if (viewMode === 'list') {
//     return (
//       <div className="rounded-2xl bg-white dark:bg-slate-900
//                       border border-slate-100 dark:border-slate-800
//                       animate-pulse">
//         <div className="p-4 flex items-center gap-4">
//           <div className="w-10 h-10 rounded-xl bg-slate-100
//                           dark:bg-slate-800 shrink-0" />
//           <div className="flex-1 space-y-2 min-w-0">
//             <div className="h-4 bg-slate-100 dark:bg-slate-800
//                             rounded w-2/5" />
//             <div className="h-3 bg-slate-100 dark:bg-slate-800
//                             rounded w-1/4" />
//           </div>
//           <div className="hidden sm:flex items-center gap-3 shrink-0">
//             <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800
//                             rounded-lg" />
//             <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800
//                             rounded-lg" />
//           </div>
//           <div className="w-8 h-8 rounded-lg bg-slate-100
//                           dark:bg-slate-800 shrink-0" />
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="rounded-2xl bg-white dark:bg-slate-900
//                     border border-slate-100 dark:border-slate-800
//                     animate-pulse">
//       <div className="p-5 space-y-4">
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex items-center gap-3 flex-1 min-w-0">
//             <div className="w-10 h-10 rounded-xl bg-slate-100
//                             dark:bg-slate-800 shrink-0" />
//             <div className="space-y-2 flex-1 min-w-0">
//               <div className="h-4 bg-slate-100 dark:bg-slate-800
//                               rounded w-3/4" />
//               <div className="h-3 bg-slate-100 dark:bg-slate-800
//                               rounded w-1/2" />
//             </div>
//           </div>
//           <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800
//                           rounded-lg shrink-0" />
//         </div>
//         <div className="h-1.5 bg-slate-100 dark:bg-slate-800
//                         rounded-full" />
//         <div className="flex items-center justify-between pt-1
//                         border-t border-slate-50 dark:border-slate-800/60">
//           <div className="flex gap-1">
//             {[0, 1, 2].map(i => (
//               <div key={i} className="w-7 h-7 rounded-full
//                                       bg-slate-100 dark:bg-slate-800" />
//             ))}
//           </div>
//           <div className="h-7 w-20 bg-slate-100 dark:bg-slate-800
//                           rounded-xl" />
//         </div>
//       </div>
//     </div>
//   );
// });

// const StatsCardSkeleton = React.memo(function StatsCardSkeleton() {
//   return (
//     <div className="rounded-2xl bg-white dark:bg-slate-900
//                     border border-slate-100 dark:border-slate-800
//                     p-5 animate-pulse">
//       <div className="flex items-start justify-between gap-3 mb-4">
//         <div className="w-11 h-11 rounded-2xl bg-slate-100
//                         dark:bg-slate-800" />
//         <div className="h-5 w-10 bg-slate-100 dark:bg-slate-800
//                         rounded-lg" />
//       </div>
//       <div className="space-y-2">
//         <div className="h-8 w-14 bg-slate-100 dark:bg-slate-800
//                         rounded" />
//         <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800
//                         rounded" />
//       </div>
//     </div>
//   );
// });

// // ════════════════════════════════════════════════════════════════
// // EMPTY STATE
// // ════════════════════════════════════════════════════════════════
// const EmptyState = React.memo(function EmptyState({ isFiltered, onClear }) {
//   if (isFiltered) {
//     return (
//       <div className="col-span-full flex flex-col items-center
//                       justify-center py-16 text-center
//                       bg-white dark:bg-slate-900 rounded-2xl
//                       border border-dashed border-slate-200
//                       dark:border-slate-800">
//         <div className="w-14 h-14 rounded-2xl bg-slate-50
//                         dark:bg-slate-800 flex items-center
//                         justify-center mb-4">
//           <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
//         </div>
//         <p className="font-semibold text-slate-700 dark:text-slate-300
//                       mb-1">
//           No results found
//         </p>
//         <p className="text-sm text-slate-400 dark:text-slate-500
//                       mb-5 max-w-xs">
//           Try adjusting your search or filter
//         </p>
//         <Button
//           variant="outline" size="sm" onClick={onClear}
//           className="rounded-xl gap-1.5 border-slate-200
//                      dark:border-slate-700 hover:border-sky-400
//                      hover:text-sky-500 transition-all"
//         >
//           <X className="w-3.5 h-3.5" /> Clear filters
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="col-span-full">
//       <div className="relative overflow-hidden rounded-2xl
//                       border border-dashed border-sky-200
//                       dark:border-slate-700 py-20 text-center
//                       bg-gradient-to-br from-sky-50 via-white
//                       to-indigo-50 dark:from-slate-900
//                       dark:via-slate-900 dark:to-slate-800/50">
//         <div className="absolute top-0 right-0 w-72 h-72
//                         bg-sky-100/60 dark:bg-sky-900/10 rounded-full
//                         -translate-y-1/2 translate-x-1/2
//                         blur-3xl pointer-events-none" />
//         <div className="absolute bottom-0 left-0 w-56 h-56
//                         bg-indigo-100/40 dark:bg-indigo-900/10
//                         rounded-full translate-y-1/2 -translate-x-1/2
//                         blur-3xl pointer-events-none" />
//         <div className="relative">
//           <div className="w-20 h-20 rounded-3xl mx-auto mb-5
//                           bg-gradient-to-br from-sky-400/20
//                           to-indigo-400/20 flex items-center
//                           justify-center shadow-xl
//                           shadow-sky-100/50 dark:shadow-none
//                           ring-1 ring-sky-200/50 dark:ring-sky-900/50">
//             <FileText className="w-9 h-9 text-sky-500" />
//           </div>
//           <h3 className="text-xl font-bold text-slate-800
//                          dark:text-white mb-2">
//             No documents yet
//           </h3>
//           <p className="text-sm text-slate-500 dark:text-slate-400
//                         mb-8 max-w-xs mx-auto leading-relaxed">
//             Upload your first PDF and send it for signatures
//           </p>
//           <Link to="/documents/new">
//             <Button className="bg-sky-500 hover:bg-sky-600 text-white
//                                h-11 px-8 rounded-xl font-semibold
//                                shadow-lg shadow-sky-400/30 gap-2
//                                hover:-translate-y-0.5 transition-all
//                                duration-200">
//               <Plus className="w-4 h-4" />
//               Create First Document
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// });

// // ════════════════════════════════════════════════════════════════
// // DOCUMENT GRID — separate component prevents full re-render
// // ════════════════════════════════════════════════════════════════
// const DocumentGrid = React.memo(function DocumentGrid({
//   docs, viewMode, onDelete, isPending,
// }) {
//   return (
//     <div
//       className={[
//         'transition-opacity duration-150',
//         isPending ? 'opacity-60' : 'opacity-100',
//         viewMode === 'grid'
//           ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
//           : 'flex flex-col gap-3',
//       ].join(' ')}
//     >
//       {docs.length === 0
//         ? null // handled outside
//         : docs.map(doc => (
//             <DocumentCard
//               key={doc._id}
//               doc={doc}
//               viewMode={viewMode}
//               onDelete={onDelete}
//             />
//           ))
//       }
//     </div>
//   );
// });

// // ════════════════════════════════════════════════════════════════
// // MAIN DASHBOARD
// // ════════════════════════════════════════════════════════════════
// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, isAdmin, loading: authLoading } = useAuth();
//   const uid = user?.id || user?._id;

//   // ── useTransition for non-blocking filter/search ──────────────
//   const [isPending, startTransition] = useTransition();

//   // ── Seed from cache ───────────────────────────────────────────
//   const seed = useMemo(() => readCache(uid), [uid]);

//   // ── Core state ────────────────────────────────────────────────
//   const [documents,     setDocuments]     = useState(seed.documents  ?? []);
//   const [stats,         setStats]         = useState(seed.stats      ?? null);
//   const [page,          setPage]          = useState(1);
//   const [hasMore,       setHasMore]       = useState(false);
//   const [isLoading,     setIsLoading]     = useState(!seed.documents?.length);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [fetchError,    setFetchError]    = useState(null);

//   // ── Filter state — transitions make these non-blocking ────────
//   const [searchInput, setSearchInput] = useState('');
//   const [search,      setSearch]      = useState('');
//   const [activeTab,   setActiveTab]   = useState('all');
//   const [viewMode,    setViewMode]    = useState('grid');

//   const mountedRef = useRef(true);
//   useEffect(() => {
//     mountedRef.current = true;
//     return () => { mountedRef.current = false; };
//   }, []);

//   // ── Admin redirect ────────────────────────────────────────────
//   useEffect(() => {
//     if (!authLoading && isAdmin) navigate('/admin', { replace: true });
//   }, [isAdmin, authLoading, navigate]);

//   // ════════════════════════════════════════════════════════════
//   // FETCH PAGE 1
//   // ════════════════════════════════════════════════════════════
//   const fetchDocuments = useCallback(async (silent = false) => {
//     if (!uid) return;
//     silent ? setIsSyncing(true) : setIsLoading(true);
//     setFetchError(null);

//     try {
//       const res = await api.get('/documents', {
//         params: { page: 1, limit: PAGE_LIMIT },
//       });
//       if (!mountedRef.current) return;

//       const docs        = res.data?.documents  ?? [];
//       const pagination  = res.data?.pagination ?? {};
//       const newStats    = res.data?.stats      ?? null;
//       const total       = pagination.total     ?? 0;
//       const more        = pagination.hasMore   ?? (total > docs.length);

//       setDocuments(docs);
//       setPage(1);
//       setHasMore(more);
//       if (newStats) setStats(newStats);

//       writeCache(uid, {
//         documents:  docs,
//         stats:      newStats,
//         totalPages: pagination.totalPages || 1,
//       });

//     } catch (err) {
//       if (err?.__cancelled || !mountedRef.current) return;
//       const cached = readCache(uid);
//       if (!cached.documents?.length) {
//         setFetchError('Could not load documents. Please retry.');
//       }
//     } finally {
//       if (mountedRef.current) {
//         setIsLoading(false);
//         setIsSyncing(false);
//       }
//     }
//   }, [uid]);

//   // ════════════════════════════════════════════════════════════
//   // LOAD MORE
//   // ════════════════════════════════════════════════════════════
//   const loadMore = useCallback(async () => {
//     if (!uid || isLoadingMore || !hasMore) return;
//     setIsLoadingMore(true);

//     try {
//       const next = page + 1;
//       const res  = await api.get('/documents', {
//         params: { page: next, limit: PAGE_LIMIT },
//       });
//       if (!mountedRef.current) return;

//       const newDocs   = res.data?.documents  ?? [];
//       const pg        = res.data?.pagination ?? {};
//       const total     = pg.total             ?? 0;

//       setDocuments(prev => {
//         const ids  = new Set(prev.map(d => d._id));
//         const all  = [...prev, ...newDocs.filter(d => !ids.has(d._id))];
//         setHasMore(pg.hasMore ?? (all.length < total));
//         return all;
//       });
//       setPage(next);

//     } catch {
//       toast.error('Failed to load more.');
//     } finally {
//       if (mountedRef.current) setIsLoadingMore(false);
//     }
//   }, [uid, page, hasMore, isLoadingMore]);

//   // ── Initial load ──────────────────────────────────────────────
//   useEffect(() => {
//     if (authLoading || isAdmin || !uid) return;
//     const cached = readCache(uid);
//     if (cached.documents?.length) {
//       setDocuments(cached.documents);
//       if (cached.stats) setStats(cached.stats);
//       setIsLoading(false);
//       fetchDocuments(true);        // silent bg sync
//     } else {
//       fetchDocuments(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [authLoading, isAdmin, uid]);

//   // ── Smart Polling 30s ─────────────────────────────────────────
//   usePolling(
//     useCallback(() => fetchDocuments(true), [fetchDocuments]),
//     { interval: 30_000, enabled: !authLoading && !isAdmin && !!uid },
//   );

//   // ── Search debounce — inside transition (non-blocking) ────────
//   useEffect(() => {
//     const t = setTimeout(() => {
//       startTransition(() => setSearch(searchInput));
//     }, 250);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   // ── Tab switch — instant + non-blocking ───────────────────────
//   const handleTabChange = useCallback((value) => {
//     startTransition(() => setActiveTab(value));
//   }, []);

//   // ════════════════════════════════════════════════════════════
//   // OPTIMISTIC DELETE
//   // — UI removes instantly, backend fires async
//   // — Cache updated immediately
//   // — Stats decremented immediately
//   // ════════════════════════════════════════════════════════════
//   const handleDelete = useCallback((id) => {
//     // 1. Instant UI removal
//     setDocuments(prev => {
//       const next = prev.filter(d => d._id !== id);
//       // 2. Update cache in same tick
//       const cached = readCache(uid);
//       writeCache(uid, { ...cached, documents: next });
//       return next;
//     });

//     // 3. Decrement stats
//     setStats(prev =>
//       prev ? { ...prev, total: Math.max(0, (prev.total || 1) - 1) } : prev
//     );
//   }, [uid]);

//   // ════════════════════════════════════════════════════════════
//   // DERIVED
//   // ════════════════════════════════════════════════════════════
//   const displayStats = useMemo(() => {
//     if (stats) return stats;
//     const pending = documents.filter(d =>
//       d.status === 'in_progress' || d.status === 'sent'
//     ).length;
//     return {
//       total:     documents.length,
//       pending,
//       completed: documents.filter(d => d.status === 'completed').length,
//       draft:     documents.filter(d => d.status === 'draft').length,
//     };
//   }, [stats, documents]);

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     return documents.filter(doc => {
//       const matchQ = !q || (doc.title || '').toLowerCase().includes(q);
//       const matchS =
//         activeTab === 'all'         ? true
//         : activeTab === 'in_progress'
//           ? doc.status === 'in_progress' || doc.status === 'sent'
//           : doc.status === activeTab;
//       return matchQ && matchS;
//     });
//   }, [documents, search, activeTab]);

//   const isFiltered = search.trim() !== '' || activeTab !== 'all';

//   const clearFilters = useCallback(() => {
//     setSearchInput('');
//     startTransition(() => {
//       setSearch('');
//       setActiveTab('all');
//     });
//   }, []);

//   const tabCount = useCallback((value) => {
//     if (value === 'all')         return displayStats.total     ?? 0;
//     if (value === 'in_progress') return displayStats.pending   ?? 0;
//     if (value === 'completed')   return displayStats.completed ?? 0;
//     if (value === 'draft')       return displayStats.draft     ?? 0;
//     return documents.filter(d => d.status === value).length;
//   }, [displayStats, documents]);

//   const greet = useMemo(() => {
//     const h = new Date().getHours();
//     return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
//   }, []);

//   const firstName = useMemo(
//     () => (user?.name || user?.full_name || 'there').split(' ')[0],
//     [user],
//   );

//   const completionRate = useMemo(() => {
//     if (!displayStats.total) return null;
//     return Math.round(((displayStats.completed || 0) / displayStats.total) * 100);
//   }, [displayStats]);

//   if (authLoading || isAdmin) return null;

//   // ════════════════════════════════════════════════════════════
//   // RENDER
//   // ════════════════════════════════════════════════════════════
//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
//                       py-6 sm:py-10 space-y-5 sm:space-y-7">

//         {/* ══════════════════════════════════════
//             HEADER
//         ══════════════════════════════════════ */}
//         <div className="flex flex-col sm:flex-row sm:items-center
//                         sm:justify-between gap-4">
//           <div>
//             <div className="flex items-center gap-2.5 mb-1 flex-wrap">
//               <h1 className="text-2xl sm:text-3xl font-bold
//                              text-slate-900 dark:text-white
//                              tracking-tight">
//                 {greet},{' '}
//                 <span className="text-sky-500">{firstName}</span>
//                 {' '}👋
//               </h1>
//               {isSyncing && (
//                 <Loader2 className="w-4 h-4 animate-spin
//                                     text-sky-400 shrink-0" />
//               )}
//             </div>
//             <p className="text-sm text-slate-500 dark:text-slate-400">
//               Manage and track all your signature requests
//             </p>
//           </div>

//           <div className="flex items-center gap-2.5 shrink-0">
//             {/* Refresh */}
//             <Button
//               variant="outline" size="icon"
//               onClick={() => fetchDocuments(false)}
//               disabled={isLoading || isSyncing}
//               title="Refresh"
//               className="h-10 w-10 rounded-xl border-slate-200
//                          dark:border-slate-700 bg-white
//                          dark:bg-slate-900 shadow-sm
//                          hover:border-sky-400 hover:text-sky-500
//                          disabled:opacity-40 transition-all"
//             >
//               <RefreshCw className={`w-4 h-4 transition-transform
//                 duration-500
//                 ${isLoading || isSyncing ? 'animate-spin' : ''}`}
//               />
//             </Button>

//             {/* New Document */}
//             <Link to="/documents/new">
//               <Button className="h-10 px-5 rounded-xl font-semibold
//                                  bg-sky-500 hover:bg-sky-600 text-white
//                                  shadow-md shadow-sky-400/25 gap-2
//                                  hover:-translate-y-0.5
//                                  active:translate-y-0
//                                  transition-all duration-150
//                                  whitespace-nowrap">
//                 <Plus className="w-4 h-4" />
//                 New Document
//               </Button>
//             </Link>
//           </div>
//         </div>

//         {/* ══════════════════════════════════════
//             STATS
//         ══════════════════════════════════════ */}
//         <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
//           {isLoading && !stats ? (
//             [0,1,2,3].map(i => <StatsCardSkeleton key={i} />)
//           ) : (
//             <>
//               <StatsCard
//                 label="Total Documents"
//                 value={displayStats.total ?? 0}
//                 icon={FileText} color="sky"
//               />
//               <StatsCard
//                 label="Awaiting"
//                 value={displayStats.pending ?? 0}
//                 icon={Send} color="amber"
//               />
//               <StatsCard
//                 label="Completed"
//                 value={displayStats.completed ?? 0}
//                 icon={CheckCircle2} color="green"
//                 badge={completionRate != null ? `${completionRate}%` : undefined}
//               />
//               <StatsCard
//                 label="Drafts"
//                 value={displayStats.draft ?? 0}
//                 icon={Clock} color="purple"
//               />
//             </>
//           )}
//         </div>

//         {/* ══════════════════════════════════════
//             TOOLBAR
//         ══════════════════════════════════════ */}
//         <div className="bg-white dark:bg-slate-900 rounded-2xl
//                         border border-slate-100 dark:border-slate-800
//                         shadow-sm overflow-hidden">

//           {/* Search + View toggle */}
//           <div className="flex items-center gap-3 px-4 pt-4 pb-3
//                           border-b border-slate-100 dark:border-slate-800">
//             <div className="relative flex-1 min-w-0">
//               <Search className="absolute left-3.5 top-1/2
//                                  -translate-y-1/2 w-4 h-4
//                                  text-slate-400 pointer-events-none z-10" />
//               <Input
//                 placeholder="Search documents..."
//                 value={searchInput}
//                 onChange={e => setSearchInput(e.target.value)}
//                 className="pl-10 pr-9 h-10 rounded-xl text-sm
//                            bg-slate-50 dark:bg-slate-800/80
//                            border-slate-200 dark:border-slate-700
//                            placeholder:text-slate-400 dark:text-white
//                            focus-visible:ring-sky-400/30
//                            focus-visible:border-sky-400
//                            transition-all duration-150"
//               />
//               {searchInput && (
//                 <button
//                   type="button"
//                   onClick={() => setSearchInput('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2
//                              text-slate-400 hover:text-slate-700
//                              dark:hover:text-slate-200
//                              transition-colors z-10 p-0.5
//                              rounded-md hover:bg-slate-100
//                              dark:hover:bg-slate-700"
//                 >
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               )}
//             </div>

//             {/* View mode toggle */}
//             <div className="flex items-center p-1 rounded-xl
//                             bg-slate-100 dark:bg-slate-800
//                             border border-slate-200 dark:border-slate-700
//                             shrink-0 gap-0.5">
//               {[
//                 { mode: 'grid', Icon: LayoutGrid },
//                 { mode: 'list', Icon: List },
//               ].map(({ mode, Icon }) => (
//                 <button
//                   key={mode}
//                   type="button"
//                   onClick={() => setViewMode(mode)}
//                   className={`p-1.5 rounded-lg transition-all
//                               duration-150
//                     ${viewMode === mode
//                       ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm'
//                       : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
//                     }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Status Tabs */}
//           <div className="flex items-center gap-0.5 px-3 py-2
//                           overflow-x-auto scrollbar-none
//                           [-webkit-overflow-scrolling:touch]">
//             {STATUS_TABS.map(tab => {
//               const count  = tabCount(tab.value);
//               const active = activeTab === tab.value;
//               return (
//                 <button
//                   key={tab.value}
//                   type="button"
//                   onClick={() => handleTabChange(tab.value)}
//                   className={`
//                     flex items-center gap-1.5
//                     px-3 sm:px-3.5 py-2 rounded-xl
//                     text-sm font-medium whitespace-nowrap
//                     transition-all duration-150
//                     min-h-[36px]
//                     ${active
//                       ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
//                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
//                     }
//                   `}
//                 >
//                   {tab.label}
//                   {count > 0 && (
//                     <span className={`
//                       text-[10px] font-bold px-1.5 py-0.5
//                       rounded-full min-w-[18px] text-center
//                       leading-none transition-all duration-150
//                       ${active
//                         ? 'bg-sky-500 text-white'
//                         : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
//                       }
//                     `}>
//                       {count > 99 ? '99+' : count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* ══════════════════════════════════════
//             RESULTS BAR
//         ══════════════════════════════════════ */}
//         {!isLoading && documents.length > 0 && (
//           <div className="flex items-center justify-between -mt-1 px-0.5">
//             <p className="text-xs text-slate-400 dark:text-slate-500">
//               {isFiltered ? (
//                 <>
//                   <span className="font-semibold text-slate-700
//                                    dark:text-slate-300">
//                     {filtered.length}
//                   </span>
//                   {' of '}{documents.length} documents
//                   {isPending && (
//                     <span className="ml-1.5 inline-block w-3 h-3
//                                      border-2 border-slate-300
//                                      border-t-sky-400 rounded-full
//                                      animate-spin align-middle" />
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <span className="font-semibold text-slate-700
//                                    dark:text-slate-300">
//                     {documents.length}
//                   </span>
//                   {' document'}{documents.length !== 1 ? 's' : ''}
//                   {hasMore && (
//                     <span className="text-slate-400 dark:text-slate-600">
//                       {' · more available'}
//                     </span>
//                   )}
//                 </>
//               )}
//             </p>
//             {isFiltered && (
//               <button
//                 type="button"
//                 onClick={clearFilters}
//                 className="text-xs font-semibold text-sky-500
//                            hover:text-sky-600 hover:underline
//                            transition-colors"
//               >
//                 Clear filters
//               </button>
//             )}
//           </div>
//         )}

//         {/* ══════════════════════════════════════
//             ERROR — no data
//         ══════════════════════════════════════ */}
//         {fetchError && documents.length === 0 && (
//           <div className="rounded-2xl bg-red-50 dark:bg-red-900/10
//                           border border-red-100 dark:border-red-900/40
//                           px-5 py-4 flex flex-col sm:flex-row
//                           sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl bg-red-100
//                               dark:bg-red-900/30 flex items-center
//                               justify-center shrink-0">
//                 <AlertTriangle className="w-4 h-4 text-red-500" />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-red-700
//                                dark:text-red-400">
//                   Failed to load
//                 </p>
//                 <p className="text-xs text-red-500/80 dark:text-red-400/60 mt-0.5">
//                   {fetchError}
//                 </p>
//               </div>
//             </div>
//             <Button
//               size="sm" variant="outline"
//               onClick={() => fetchDocuments(false)}
//               className="rounded-xl border-red-200 dark:border-red-800
//                          text-red-600 dark:text-red-400 font-semibold
//                          hover:bg-red-50 gap-1.5 shrink-0"
//             >
//               <RefreshCw className="w-3.5 h-3.5" /> Retry
//             </Button>
//           </div>
//         )}

//         {/* ══════════════════════════════════════
//             SKELETONS
//         ══════════════════════════════════════ */}
//         {isLoading && (
//           <div className={
//             viewMode === 'grid'
//               ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
//               : 'flex flex-col gap-3'
//           }>
//             {[0,1,2,3,4,5].map(i => (
//               <DocSkeleton key={i} viewMode={viewMode} />
//             ))}
//           </div>
//         )}

//         {/* ══════════════════════════════════════
//             DOCUMENT CARDS
//         ══════════════════════════════════════ */}
//         {!isLoading && (
//           <>
//             {filtered.length === 0 ? (
//               <div className={
//                 viewMode === 'grid'
//                   ? 'grid sm:grid-cols-2 lg:grid-cols-3'
//                   : ''
//               }>
//                 <EmptyState isFiltered={isFiltered} onClear={clearFilters} />
//               </div>
//             ) : (
//               <DocumentGrid
//                 docs={filtered}
//                 viewMode={viewMode}
//                 onDelete={handleDelete}
//                 isPending={isPending}
//               />
//             )}

//             {/* Load More */}
//             {hasMore && !isFiltered && filtered.length > 0 && (
//               <div className="flex justify-center pt-2">
//                 <Button
//                   variant="outline"
//                   onClick={loadMore}
//                   disabled={isLoadingMore}
//                   className="h-11 px-8 rounded-xl font-semibold
//                              border-slate-200 dark:border-slate-700
//                              bg-white dark:bg-slate-900
//                              text-slate-600 dark:text-slate-300
//                              hover:border-sky-400 hover:text-sky-500
//                              shadow-sm gap-2 transition-all
//                              disabled:opacity-50 active:scale-95"
//                 >
//                   {isLoadingMore ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Loading...
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDown className="w-4 h-4" />
//                       Load More
//                     </>
//                   )}
//                 </Button>
//               </div>
//             )}
//           </>
//         )}

//         {/* ══════════════════════════════════════
//             SOFT ERROR (cached data showing)
//         ══════════════════════════════════════ */}
//         {fetchError && documents.length > 0 && (
//           <div className="flex items-center gap-3 px-4 py-3
//                           rounded-xl bg-amber-50 dark:bg-amber-900/10
//                           border border-amber-200/60
//                           dark:border-amber-800/40">
//             <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
//             <p className="text-xs text-amber-700 dark:text-amber-400
//                           font-medium flex-1">
//               Showing cached data — sync failed.
//             </p>
//             <button
//               type="button"
//               onClick={() => fetchDocuments(true)}
//               className="text-xs font-bold text-amber-600
//                          dark:text-amber-400 hover:underline shrink-0"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// src/pages/Dashboard.jsx

import React, {
  useState, useEffect, useCallback,
  useMemo, useRef, useTransition,
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Search, FileText, CheckCircle2,
  Send, RefreshCw, X, AlertTriangle,
  Clock, Loader2, LayoutGrid, List,
  ChevronDown,
} from 'lucide-react';
import StatsCard    from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth }  from '@/lib/AuthContext';
import usePolling   from '@/hooks/usePolling';
import { toast }    from 'sonner';

// ════════════════════════════════════════════════════════════════
// CACHE
// ════════════════════════════════════════════════════════════════
const CACHE_KEY = (uid) => `nexsign_docs_v3_${uid}`;
const readCache = (uid) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY(uid));
    if (!raw) return { documents: [], stats: null, totalPages: 1 };
    return JSON.parse(raw);
  } catch { return { documents: [], stats: null, totalPages: 1 }; }
};
const writeCache = (uid, data) => {
  try { localStorage.setItem(CACHE_KEY(uid), JSON.stringify(data)); } catch {}
};

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const STATUS_TABS = [
  { value: 'all',         label: 'All'      },
  { value: 'in_progress', label: 'Active'   },
  { value: 'completed',   label: 'Done'     },
  { value: 'draft',       label: 'Drafts'   },
  { value: 'declined',    label: 'Declined' },
];
const PAGE_LIMIT = 10;

// ════════════════════════════════════════════════════════════════
// SKELETON
// ════════════════════════════════════════════════════════════════
const DocSkeleton = React.memo(function DocSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-900
                      border border-slate-100 dark:border-slate-800
                      animate-pulse w-full">
        <div className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100
                          dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-2/5" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900
                    border border-slate-100 dark:border-slate-800
                    animate-pulse w-full">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100
                            dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
          <div className="h-5 w-14 bg-slate-100 dark:bg-slate-800
                          rounded-lg shrink-0" />
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <div className="flex items-center justify-between pt-1
                        border-t border-slate-50 dark:border-slate-800/60">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full
                                      bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
});

const StatsCardSkeleton = React.memo(function StatsCardSkeleton() {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900
                    border border-slate-100 dark:border-slate-800
                    p-4 animate-pulse w-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-5 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="space-y-1.5">
        <div className="h-7 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════
// EMPTY STATE
// ════════════════════════════════════════════════════════════════
const EmptyState = React.memo(function EmptyState({ isFiltered, onClear }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center
                      py-12 text-center bg-white dark:bg-slate-900
                      rounded-xl border border-dashed
                      border-slate-200 dark:border-slate-800 w-full">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800
                        flex items-center justify-center mb-3">
          <Search className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1 text-sm">
          No results found
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 max-w-[200px]">
          Try adjusting your search or filter
        </p>
        <Button variant="outline" size="sm" onClick={onClear}
          className="rounded-xl gap-1.5 border-slate-200 dark:border-slate-700
                     hover:border-sky-400 hover:text-sky-500 text-xs">
          <X className="w-3 h-3" /> Clear filters
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl
                      border border-dashed border-sky-200 dark:border-slate-700
                      py-14 text-center
                      bg-gradient-to-br from-sky-50 via-white to-indigo-50
                      dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
        <div className="absolute top-0 right-0 w-48 h-48
                        bg-sky-100/60 dark:bg-sky-900/10 rounded-full
                        -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative px-4">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4
                          bg-gradient-to-br from-sky-400/20 to-indigo-400/20
                          flex items-center justify-center shadow-lg
                          ring-1 ring-sky-200/50 dark:ring-sky-900/50">
            <FileText className="w-7 h-7 text-sky-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">
            No documents yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400
                        mb-6 max-w-[240px] mx-auto leading-relaxed">
            Upload your first PDF and send it for signatures
          </p>
          <Link to="/documents/new">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white
                               h-10 px-6 rounded-xl font-semibold
                               shadow-lg shadow-sky-400/30 gap-2
                               hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> Create First Document
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════
// DOCUMENT GRID
// ════════════════════════════════════════════════════════════════
const DocumentGrid = React.memo(function DocumentGrid({
  docs, viewMode, onDelete, isPending,
}) {
  return (
    <div className={[
      'w-full transition-opacity duration-150',
      isPending ? 'opacity-60' : 'opacity-100',
      viewMode === 'grid'
        // ✅ mobile: 1 col, sm: 2 col, lg: 3 col
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
        : 'flex flex-col gap-2.5',
    ].join(' ')}>
      {docs.map(doc => (
        <DocumentCard
          key={doc._id}
          doc={doc}
          viewMode={viewMode}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

// ════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const uid = user?.id || user?._id;

  const [isPending, startTransition] = useTransition();
  const seed = useMemo(() => readCache(uid), [uid]);

  const [documents,     setDocuments]     = useState(seed.documents  ?? []);
  const [stats,         setStats]         = useState(seed.stats      ?? null);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [isLoading,     setIsLoading]     = useState(!seed.documents?.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [fetchError,    setFetchError]    = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  // ✅ mobile default: list (cards won't overflow)
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'list' : 'grid'
  );

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, authLoading, navigate]);

  // ════════════════════════════════════════════════════════
  // FETCH
  // ════════════════════════════════════════════════════════
  const fetchDocuments = useCallback(async (silent = false) => {
    if (!uid) return;
    silent ? setIsSyncing(true) : setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/documents', {
        params: { page: 1, limit: PAGE_LIMIT },
      });
      if (!mountedRef.current) return;
      const docs       = res.data?.documents  ?? [];
      const pagination = res.data?.pagination ?? {};
      const newStats   = res.data?.stats      ?? null;
      const total      = pagination.total     ?? 0;
      const more       = pagination.hasMore   ?? (total > docs.length);
      setDocuments(docs);
      setPage(1);
      setHasMore(more);
      if (newStats) setStats(newStats);
      writeCache(uid, {
        documents: docs, stats: newStats,
        totalPages: pagination.totalPages || 1,
      });
    } catch (err) {
      if (err?.__cancelled || !mountedRef.current) return;
      const cached = readCache(uid);
      if (!cached.documents?.length)
        setFetchError('Could not load documents. Please retry.');
    } finally {
      if (mountedRef.current) { setIsLoading(false); setIsSyncing(false); }
    }
  }, [uid]);

  const loadMore = useCallback(async () => {
    if (!uid || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const res  = await api.get('/documents', {
        params: { page: next, limit: PAGE_LIMIT },
      });
      if (!mountedRef.current) return;
      const newDocs = res.data?.documents  ?? [];
      const pg      = res.data?.pagination ?? {};
      const total   = pg.total             ?? 0;
      setDocuments(prev => {
        const ids = new Set(prev.map(d => d._id));
        const all = [...prev, ...newDocs.filter(d => !ids.has(d._id))];
        setHasMore(pg.hasMore ?? (all.length < total));
        return all;
      });
      setPage(next);
    } catch { toast.error('Failed to load more.'); }
    finally { if (mountedRef.current) setIsLoadingMore(false); }
  }, [uid, page, hasMore, isLoadingMore]);

  useEffect(() => {
    if (authLoading || isAdmin || !uid) return;
    const cached = readCache(uid);
    if (cached.documents?.length) {
      setDocuments(cached.documents);
      if (cached.stats) setStats(cached.stats);
      setIsLoading(false);
      fetchDocuments(true);
    } else {
      fetchDocuments(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin, uid]);

  usePolling(
    useCallback(() => fetchDocuments(true), [fetchDocuments]),
    { interval: 30_000, enabled: !authLoading && !isAdmin && !!uid },
  );

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(() => setSearch(searchInput));
    }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleTabChange = useCallback((value) => {
    startTransition(() => setActiveTab(value));
  }, []);

  const handleDelete = useCallback((id) => {
    setDocuments(prev => {
      const next = prev.filter(d => d._id !== id);
      const cached = readCache(uid);
      writeCache(uid, { ...cached, documents: next });
      return next;
    });
    setStats(prev =>
      prev ? { ...prev, total: Math.max(0, (prev.total || 1) - 1) } : prev
    );
  }, [uid]);

  // ════════════════════════════════════════════════════
  // DERIVED
  // ════════════════════════════════════════════════════
  const displayStats = useMemo(() => {
    if (stats) return stats;
    const pending = documents.filter(d =>
      d.status === 'in_progress' || d.status === 'sent'
    ).length;
    return {
      total:     documents.length,
      pending,
      completed: documents.filter(d => d.status === 'completed').length,
      draft:     documents.filter(d => d.status === 'draft').length,
    };
  }, [stats, documents]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const matchQ = !q || (doc.title || '').toLowerCase().includes(q);
      const matchS =
        activeTab === 'all' ? true
        : activeTab === 'in_progress'
          ? doc.status === 'in_progress' || doc.status === 'sent'
          : doc.status === activeTab;
      return matchQ && matchS;
    });
  }, [documents, search, activeTab]);

  const isFiltered = search.trim() !== '' || activeTab !== 'all';

  const clearFilters = useCallback(() => {
    setSearchInput('');
    startTransition(() => { setSearch(''); setActiveTab('all'); });
  }, []);

  const tabCount = useCallback((value) => {
    if (value === 'all')         return displayStats.total     ?? 0;
    if (value === 'in_progress') return displayStats.pending   ?? 0;
    if (value === 'completed')   return displayStats.completed ?? 0;
    if (value === 'draft')       return displayStats.draft     ?? 0;
    return documents.filter(d => d.status === value).length;
  }, [displayStats, documents]);

  const greet = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const firstName = useMemo(
    () => (user?.name || user?.full_name || 'there').split(' ')[0],
    [user],
  );

  const completionRate = useMemo(() => {
    if (!displayStats.total) return null;
    return Math.round(((displayStats.completed || 0) / displayStats.total) * 100);
  }, [displayStats]);

  if (authLoading || isAdmin) return null;

  // ════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════
  return (
    // ✅ overflow-x-hidden — iPhone scroll fix
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
                    overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto
                      px-3 sm:px-6 lg:px-8
                      py-4 sm:py-8
                      space-y-4 sm:space-y-6">

        {/* ── HEADER ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold
                             text-slate-900 dark:text-white tracking-tight
                             leading-tight">
                {greet},{' '}
                <span className="text-sky-500">{firstName}</span>
                {' '}👋
              </h1>
              {isSyncing && (
                <Loader2 className="w-3.5 h-3.5 animate-spin
                                    text-sky-400 shrink-0" />
              )}
            </div>
            <p className="text-xs sm:text-sm
                          text-slate-500 dark:text-slate-400">
              Manage and track your signature requests
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline" size="icon"
              onClick={() => fetchDocuments(false)}
              disabled={isLoading || isSyncing}
              title="Refresh"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl
                         border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-900 shadow-sm
                         hover:border-sky-400 hover:text-sky-500
                         disabled:opacity-40 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 transition-transform
                duration-500
                ${isLoading || isSyncing ? 'animate-spin' : ''}`} />
            </Button>

            <Link to="/documents/new">
              <Button className="h-9 sm:h-10 px-3 sm:px-5 rounded-xl
                                 font-semibold bg-sky-500 hover:bg-sky-600
                                 text-white shadow-md shadow-sky-400/25
                                 gap-1.5 hover:-translate-y-0.5
                                 active:translate-y-0 transition-all
                                 text-xs sm:text-sm whitespace-nowrap">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">New Doc</span>
                <span className="xs:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ── STATS ──────────────────────────────── */}
        {/* ✅ mobile: 2x2 grid, xl: 4 in a row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 w-full">
          {isLoading && !stats ? (
            [0,1,2,3].map(i => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <StatsCard
                label="Total" value={displayStats.total ?? 0}
                icon={FileText} color="sky" />
              <StatsCard
                label="Awaiting" value={displayStats.pending ?? 0}
                icon={Send} color="amber" />
              <StatsCard
                label="Completed" value={displayStats.completed ?? 0}
                icon={CheckCircle2} color="green"
                badge={completionRate != null
                  ? `${completionRate}%` : undefined} />
              <StatsCard
                label="Drafts" value={displayStats.draft ?? 0}
                icon={Clock} color="purple" />
            </>
          )}
        </div>

        {/* ── TOOLBAR ────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm overflow-hidden w-full">

          {/* Search + View toggle */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5
                          border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-3.5 h-3.5 text-slate-400
                                 pointer-events-none z-10" />
              <Input
                placeholder="Search..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9 pr-8 h-9 rounded-xl text-sm
                           bg-slate-50 dark:bg-slate-800/80
                           border-slate-200 dark:border-slate-700
                           placeholder:text-slate-400 dark:text-white
                           focus-visible:ring-sky-400/30
                           focus-visible:border-sky-400" />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-700 z-10 p-0.5
                             rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center p-0.5 rounded-xl
                            bg-slate-100 dark:bg-slate-800
                            border border-slate-200 dark:border-slate-700
                            shrink-0 gap-0.5">
              {[
                { mode: 'grid', Icon: LayoutGrid },
                { mode: 'list', Icon: List },
              ].map(({ mode, Icon }) => (
                <button key={mode} type="button"
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-all
                    ${viewMode === mode
                      ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs — horizontal scroll on mobile */}
          <div className="flex items-center gap-0.5 px-2 py-1.5
                          overflow-x-auto
                          scrollbar-none
                          [-webkit-overflow-scrolling:touch]
                          [scrollbar-width:none]">
            {STATUS_TABS.map(tab => {
              const count  = tabCount(tab.value);
              const active = activeTab === tab.value;
              return (
                <button key={tab.value} type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={`
                    flex items-center gap-1 shrink-0
                    px-2.5 sm:px-3 py-1.5 rounded-lg
                    text-xs sm:text-sm font-medium whitespace-nowrap
                    transition-all duration-150
                    ${active
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}>
                  {tab.label}
                  {count > 0 && (
                    <span className={`
                      text-[9px] font-bold px-1 py-0.5
                      rounded-full min-w-[16px] text-center leading-none
                      ${active
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RESULTS BAR ────────────────────────── */}
        {!isLoading && documents.length > 0 && (
          <div className="flex items-center justify-between px-0.5 -mt-1">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isFiltered ? (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {filtered.length}
                  </span>
                  {' of '}{documents.length} documents
                  {isPending && (
                    <span className="ml-1 inline-block w-2.5 h-2.5
                                     border-2 border-slate-300
                                     border-t-sky-400 rounded-full
                                     animate-spin align-middle" />
                  )}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {documents.length}
                  </span>
                  {' doc'}{documents.length !== 1 ? 's' : ''}
                  {hasMore && (
                    <span className="text-slate-400"> · more available</span>
                  )}
                </>
              )}
            </p>
            {isFiltered && (
              <button type="button" onClick={clearFilters}
                className="text-xs font-semibold text-sky-500
                           hover:text-sky-600 hover:underline">
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── ERROR ──────────────────────────────── */}
        {fetchError && documents.length === 0 && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/10
                          border border-red-100 dark:border-red-900/40
                          px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30
                              flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Failed to load
                </p>
                <p className="text-xs text-red-500/80 truncate">
                  {fetchError}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline"
              onClick={() => fetchDocuments(false)}
              className="rounded-xl border-red-200 dark:border-red-800
                         text-red-600 dark:text-red-400 font-semibold
                         hover:bg-red-50 gap-1.5 shrink-0 text-xs">
              <RefreshCw className="w-3 h-3" /> Retry
            </Button>
          </div>
        )}

        {/* ── SKELETONS ──────────────────────────── */}
        {isLoading && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full'
              : 'flex flex-col gap-2.5 w-full'
          }>
            {[0,1,2,3,4,5].map(i => (
              <DocSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* ── DOCUMENTS ──────────────────────────── */}
        {!isLoading && (
          <>
            {filtered.length === 0 ? (
              <EmptyState isFiltered={isFiltered} onClear={clearFilters} />
            ) : (
              <DocumentGrid
                docs={filtered}
                viewMode={viewMode}
                onDelete={handleDelete}
                isPending={isPending}
              />
            )}

            {/* Load More */}
            {hasMore && !isFiltered && filtered.length > 0 && (
              <div className="flex justify-center pt-2 pb-4">
                <Button variant="outline" onClick={loadMore}
                  disabled={isLoadingMore}
                  className="h-10 px-6 rounded-xl font-semibold
                             border-slate-200 dark:border-slate-700
                             bg-white dark:bg-slate-900
                             text-slate-600 dark:text-slate-300
                             hover:border-sky-400 hover:text-sky-500
                             shadow-sm gap-2 text-sm
                             disabled:opacity-50 active:scale-95">
                  {isLoadingMore ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Load More</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* ── SOFT ERROR ─────────────────────────── */}
        {fetchError && documents.length > 0 && (
          <div className="flex items-center gap-2.5 px-3 py-2.5
                          rounded-xl bg-amber-50 dark:bg-amber-900/10
                          border border-amber-200/60 dark:border-amber-800/40">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400
                          font-medium flex-1 min-w-0">
              Showing cached data
            </p>
            <button type="button" onClick={() => fetchDocuments(true)}
              className="text-xs font-bold text-amber-600
                         dark:text-amber-400 hover:underline shrink-0">
              Retry
            </button>
          </div>
        )}

      </div>
    </div>
  );
}