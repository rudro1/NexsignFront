// // src/pages/TemplateDetail.jsx
// import React, {
//   useState, useCallback, useMemo, useRef, useEffect,
// } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import {
//   ArrowLeft, Crown, Users, CheckCircle2, Clock3,
//   XCircle, Eye, Send, RefreshCw, Trash2,
//   MoreVertical, Download, AlertTriangle, Loader2,
//   LayoutTemplate, PenTool, Search, X, Mail,
//   TrendingUp, FileText,
// } from 'lucide-react';
// import { Button }   from '@/components/ui/button';
// import { Input }    from '@/components/ui/input';
// import { Badge }    from '@/components/ui/badge';
// import {
//   DropdownMenu, DropdownMenuContent,
//   DropdownMenuItem, DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Dialog, DialogContent, DialogHeader,
//   DialogTitle, DialogDescription,
// } from '@/components/ui/dialog';

// import { useTemplate, useTemplateMutations } from '@/hooks/useTemplate';
// import SignaturePad from '@/components/signing/SignaturePad';

// // ═══════════════════════════════════════════════════════════════
// // HELPERS
// // ═══════════════════════════════════════════════════════════════
// function fmtDate(d) {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric',
//   });
// }
// function fmtRelative(d) {
//   if (!d) return '—';
//   const diff  = Date.now() - new Date(d).getTime();
//   const mins  = Math.floor(diff / 60_000);
//   const hours = Math.floor(diff / 3_600_000);
//   const days  = Math.floor(diff / 86_400_000);
//   if (mins  < 1)  return 'Just now';
//   if (mins  < 60) return `${mins}m ago`;
//   if (hours < 24) return `${hours}h ago`;
//   if (days  < 7)  return `${days}d ago`;
//   return fmtDate(d);
// }

// // ═══════════════════════════════════════════════════════════════
// // STATUS CONFIG  (TemplateSession statuses)
// // ═══════════════════════════════════════════════════════════════
// const SESSION_STATUS = {
//   pending:  {
//     label: 'Pending',
//     bg:    'bg-amber-100 dark:bg-amber-900/30',
//     text:  'text-amber-700 dark:text-amber-400',
//     dot:   'bg-amber-400',
//     icon:  Clock3,
//   },
//   viewed:   {
//     label: 'Viewed',
//     bg:    'bg-sky-100 dark:bg-sky-900/30',
//     text:  'text-sky-700 dark:text-sky-400',
//     dot:   'bg-sky-400 animate-pulse',
//     icon:  Eye,
//   },
//   signing:  {
//     label: 'Signing',
//     bg:    'bg-blue-100 dark:bg-blue-900/30',
//     text:  'text-blue-700 dark:text-blue-400',
//     dot:   'bg-blue-400 animate-pulse',
//     icon:  PenTool,
//   },
//   signed:   {
//     label: 'Signed',
//     bg:    'bg-emerald-100 dark:bg-emerald-900/30',
//     text:  'text-emerald-700 dark:text-emerald-400',
//     dot:   'bg-emerald-500',
//     icon:  CheckCircle2,
//   },
//   declined: {
//     label: 'Declined',
//     bg:    'bg-red-100 dark:bg-red-900/30',
//     text:  'text-red-700 dark:text-red-400',
//     dot:   'bg-red-500',
//     icon:  XCircle,
//   },
//   expired:  {
//     label: 'Expired',
//     bg:    'bg-slate-100 dark:bg-slate-800',
//     text:  'text-slate-500 dark:text-slate-400',
//     dot:   'bg-slate-400',
//     icon:  Clock3,
//   },
// };

// const TEMPLATE_STATUS = {
//   draft:        { label: 'Draft',              color: 'text-slate-500',                bg: 'bg-slate-100 dark:bg-slate-800'           },
//   boss_pending: { label: 'Awaiting Your Sign', color: 'text-amber-600',                bg: 'bg-amber-100 dark:bg-amber-900/30'        },
//   active:       { label: 'Active',             color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30'           },
//   completed:    { label: 'Completed',          color: 'text-emerald-600',              bg: 'bg-emerald-100 dark:bg-emerald-900/30'    },
//   archived:     { label: 'Archived',           color: 'text-slate-500',                bg: 'bg-slate-100 dark:bg-slate-800'           },
// };

// // ═══════════════════════════════════════════════════════════════
// // SKELETON
// // ═══════════════════════════════════════════════════════════════
// function Skeleton({ className }) {
//   return (
//     <div className={`animate-pulse rounded-xl
//                      bg-slate-100 dark:bg-slate-800 ${className}`} />
//   );
// }

// function PageSkeleton() {
//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] p-6 space-y-6">
//       <div className="flex items-center gap-3">
//         <Skeleton className="w-9 h-9 rounded-xl" />
//         <Skeleton className="h-7 w-64" />
//       </div>
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
//       </div>
//       <Skeleton className="h-96 rounded-2xl" />
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // STAT CARD
// // ═══════════════════════════════════════════════════════════════
// function StatCard({ label, value, icon: Icon, color, sub }) {
//   const clr = {
//     sky:     'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
//     emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
//     amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
//     red:     'bg-red-50 dark:bg-red-900/20 text-red-500',
//   }[color] || 'bg-slate-50 dark:bg-slate-800 text-slate-500';

//   return (
//     <div className="bg-white dark:bg-slate-900 rounded-2xl border
//                     border-slate-100 dark:border-slate-800 p-4
//                     flex items-center gap-4">
//       <div className={`w-11 h-11 rounded-xl flex items-center
//                        justify-center shrink-0 ${clr}`}>
//         <Icon className="w-5 h-5" />
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-slate-900
//                       dark:text-white leading-none">
//           {value ?? 0}
//         </p>
//         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//           {label}
//         </p>
//         {sub && (
//           <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // SESSION ROW
// // ═══════════════════════════════════════════════════════════════
// function SessionRow({ session, templateId, onResend }) {
//   const [resending, setResending] = useState(false);
//   const cfg = SESSION_STATUS[session.status] || SESSION_STATUS.pending;
//   const Icon = cfg.icon;

//   const canResend = ['pending', 'viewed', 'expired'].includes(session.status);

//   const handleResend = async () => {
//     setResending(true);
//     try {
//       await onResend(session._id);
//     } finally {
//       setResending(false);
//     }
//   };

//   return (
//     <div className="flex items-center gap-3 p-3 rounded-xl
//                     border border-slate-100 dark:border-slate-800
//                     bg-white dark:bg-slate-900
//                     hover:border-slate-200 dark:hover:border-slate-700
//                     transition-colors group">

//       {/* Avatar */}
//       <div className="w-9 h-9 rounded-xl bg-gradient-to-br
//                       from-sky-100 to-sky-200 dark:from-sky-900/40
//                       dark:to-sky-900/20 flex items-center justify-center
//                       text-sky-600 dark:text-sky-400 font-bold
//                       text-sm shrink-0">
//         {(session.recipientName?.[0] || '?').toUpperCase()}
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-semibold text-slate-800
//                       dark:text-white truncate">
//           {session.recipientName}
//         </p>
//         <p className="text-[11px] text-slate-400 truncate">
//           {session.recipientEmail}
//           {session.recipientDesignation && (
//             <span className="ml-1 text-slate-300">
//               · {session.recipientDesignation}
//             </span>
//           )}
//         </p>
//       </div>

//       {/* Status */}
//       <span className={`hidden sm:inline-flex items-center gap-1.5
//                         text-[11px] font-semibold px-2 py-1
//                         rounded-full shrink-0
//                         ${cfg.bg} ${cfg.text}`}>
//         <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//         {cfg.label}
//       </span>

//       {/* Date */}
//       <span className="hidden lg:block text-[11px] text-slate-400 shrink-0">
//         {session.signedAt
//           ? fmtRelative(session.signedAt)
//           : fmtRelative(session.sentAt)
//         }
//       </span>

//       {/* Actions */}
//       <div className="flex items-center gap-1 shrink-0">
//         {session.signedFileUrl && (
//           <a
//             href={session.signedFileUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="p-1.5 rounded-lg text-slate-400
//                        hover:text-emerald-500 hover:bg-emerald-50
//                        dark:hover:bg-emerald-900/20 transition-colors"
//             title="Download signed PDF"
//           >
//             <Download className="w-3.5 h-3.5" />
//           </a>
//         )}

//         {canResend && (
//           <button
//             onClick={handleResend}
//             disabled={resending}
//             className="p-1.5 rounded-lg text-slate-400
//                        hover:text-sky-500 hover:bg-sky-50
//                        dark:hover:bg-sky-900/20 transition-colors
//                        disabled:opacity-50"
//             title="Resend email"
//           >
//             {resending
//               ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
//               : <Mail    className="w-3.5 h-3.5" />
//             }
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // BOSS SIGN MODAL
// // ═══════════════════════════════════════════════════════════════
// function BossSignModal({ template, onClose, onSigned }) {
//   const mutations = useTemplateMutations();
//   const [signing,  setSigning]  = useState(false);
//   const [sigData,  setSigData]  = useState(null);

//   const handleSign = async () => {
//     if (!sigData) {
//       toast.error('Please draw your signature first.');
//       return;
//     }
//     setSigning(true);
//     try {
//       const res = await mutations.bossSign(template._id, {
//         signatureDataUrl: sigData,
//         fieldValues:      [],
//       });

//       if (!res.success) {
//         toast.error(res.error || 'Signing failed.');
//         return;
//       }

//       toast.success(`Signed! Emails sent to ${
//         template.stats?.totalRecipients || template.recipients?.length || 0
//       } employees.`);
//       onSigned(res.data?.template);

//     } catch (err) {
//       toast.error(err?.message || 'Signing failed.');
//     } finally {
//       setSigning(false);
//     }
//   };

//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden
//                                 border border-slate-100 dark:border-slate-800">

//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 border-b border-slate-100
//                         dark:border-slate-800 bg-gradient-to-r
//                         from-amber-50 to-orange-50
//                         dark:from-amber-900/20 dark:to-orange-900/10">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 rounded-xl bg-amber-500/10
//                             flex items-center justify-center">
//               <Crown className="w-5 h-5 text-amber-500" />
//             </div>
//             <div>
//               <DialogTitle className="text-base font-bold text-slate-800
//                                        dark:text-white">
//                 Sign as Authoriser
//               </DialogTitle>
//               <DialogDescription className="text-xs text-slate-500 mt-0.5">
//                 Your signature will be embedded into the PDF
//               </DialogDescription>
//             </div>
//           </div>

//           {/* Template info */}
//           <div className="mt-3 p-3 rounded-xl bg-white/60
//                           dark:bg-slate-800/60 backdrop-blur-sm">
//             <p className="text-xs text-slate-500 font-medium">Template</p>
//             <p className="text-sm font-semibold text-slate-800
//                           dark:text-white mt-0.5 truncate">
//               {template.title}
//             </p>
//             <p className="text-[11px] text-slate-400 mt-1">
//               Will be sent to{' '}
//               <span className="font-semibold text-amber-600">
//                 {template.recipients?.length || 0} employees
//               </span>{' '}
//               after signing
//             </p>
//           </div>
//         </div>

//         {/* Signature pad */}
//         <div className="px-6 py-5">
//           <p className="text-xs font-semibold text-slate-500
//                         uppercase tracking-wide mb-3">
//             Draw Your Signature
//           </p>
//           <SignaturePad
//             onChange={setSigData}
//             height={180}
//           />
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 flex gap-3">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             disabled={signing}
//             className="flex-1 h-11 rounded-xl border-slate-200
//                        dark:border-slate-700 font-semibold"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSign}
//             disabled={signing || !sigData}
//             className="flex-1 h-11 rounded-xl font-semibold gap-2
//                        bg-amber-500 hover:bg-amber-600 text-white
//                        shadow-md shadow-amber-400/25
//                        disabled:opacity-60"
//           >
//             {signing
//               ? <Loader2 className="w-4 h-4 animate-spin" />
//               : <Crown   className="w-4 h-4" />
//             }
//             {signing ? 'Signing…' : 'Sign & Send to All'}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // PROGRESS BAR
// // ═══════════════════════════════════════════════════════════════
// function ProgressBar({ signed = 0, total = 0 }) {
//   const pct = total > 0 ? Math.round((signed / total) * 100) : 0;
//   return (
//     <div className="space-y-1.5">
//       <div className="flex justify-between text-xs text-slate-400">
//         <span>{signed} of {total} signed</span>
//         <span className="font-bold text-slate-600 dark:text-slate-300">
//           {pct}%
//         </span>
//       </div>
//       <div className="h-2 bg-slate-100 dark:bg-slate-800
//                       rounded-full overflow-hidden">
//         <div
//           className="h-full rounded-full transition-all duration-700
//                      bg-gradient-to-r from-emerald-400 to-emerald-500"
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ═══════════════════════════════════════════════════════════════
// export default function TemplateDetail() {
//   const { id }   = useParams();
//   const navigate = useNavigate();

//   const {
//     template, sessions, sessionStats,
//     loading, error,
//     refetch, optimisticSessionUpdate,
//     setTemplate,
//   } = useTemplate(id);

//   const mutations = useTemplateMutations();

//   const [activeTab,     setActiveTab]     = useState('sessions');
//   const [sessionFilter, setSessionFilter] = useState('all');
//   const [search,        setSearch]        = useState('');
//   const [showBossSign,  setShowBossSign]  = useState(false);
//   const [showDelete,    setShowDelete]    = useState(false);
//   const [deleting,      setDeleting]      = useState(false);

//   // ── Boss sign needed → auto open modal ───────────────────────
//   useEffect(() => {
//     if (template?.status === 'boss_pending') {
//       // small delay for UX
//       const t = setTimeout(() => setShowBossSign(true), 600);
//       return () => clearTimeout(t);
//     }
//   }, [template?.status]);

//   // ── Stats ──────────────────────────────────────────────────
//   const stats = useMemo(() => {
//     if (sessionStats) return sessionStats;
//     const signed   = sessions.filter(s => s.status === 'signed').length;
//     const declined = sessions.filter(s => s.status === 'declined').length;
//     const viewed   = sessions.filter(s => s.viewedAt).length;
//     const total    = sessions.length;
//     const pending  = total - signed - declined;
//     return { total, signed, declined, viewed, pending };
//   }, [sessions, sessionStats]);

//   // ── Filtered sessions ─────────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = sessions;

//     if (sessionFilter !== 'all') {
//       list = list.filter(s => s.status === sessionFilter);
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(s =>
//         s.recipientName?.toLowerCase().includes(q)  ||
//         s.recipientEmail?.toLowerCase().includes(q),
//       );
//     }

//     return list;
//   }, [sessions, sessionFilter, search]);

//   // ── Resend ─────────────────────────────────────────────────
//   const handleResend = useCallback(async (sessionId) => {
//     const res = await mutations.resendEmail(id, sessionId);
//     if (res.success) {
//       toast.success('Reminder sent!');
//       optimisticSessionUpdate(sessionId, {
//         reminderCount: 1,
//         lastReminderAt: new Date().toISOString(),
//       });
//     } else {
//       toast.error(res.error || 'Failed to send reminder.');
//     }
//   }, [id, mutations, optimisticSessionUpdate]);

//   // ── Delete ──────────────────────────────────────────────────
//   const handleDelete = useCallback(async () => {
//     setDeleting(true);
//     const res = await mutations.deleteTemplate(id);
//     if (res.success) {
//       toast.success('Template deleted.');
//       navigate('/templates', { replace: true });
//     } else {
//       toast.error(res.error || 'Delete failed.');
//       setDeleting(false);
//       setShowDelete(false);
//     }
//   }, [id, mutations, navigate]);

//   // ── Boss signed callback ───────────────────────────────────
//   const handleBossSigned = useCallback((updatedTemplate) => {
//     setShowBossSign(false);
//     if (updatedTemplate) setTemplate(updatedTemplate);
//     refetch();
//     toast.success('Template is now active!');
//   }, [setTemplate, refetch]);

//   // ─────────────────────────────────────────────────────────
//   if (loading) return <PageSkeleton />;

//   if (error || !template) {
//     return (
//       <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
//                       flex items-center justify-center p-4">
//         <div className="bg-white dark:bg-slate-900 rounded-2xl border
//                         border-slate-100 dark:border-slate-800
//                         p-8 max-w-sm w-full text-center">
//           <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
//           <p className="font-semibold text-slate-800 dark:text-white mb-1">
//             {error || 'Template not found'}
//           </p>
//           <div className="flex gap-3 mt-5">
//             <Button
//               variant="outline"
//               onClick={() => navigate('/templates')}
//               className="flex-1 rounded-xl"
//             >
//               Back
//             </Button>
//             <Button
//               onClick={refetch}
//               className="flex-1 rounded-xl bg-[#28ABDF]
//                          hover:bg-sky-600 text-white"
//             >
//               Retry
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const tmplStatus = TEMPLATE_STATUS[template.status]
//                   || TEMPLATE_STATUS.draft;
//   const isBossSign = template.status === 'boss_pending';
//   const isActive   = template.status === 'active';
//   const isCompleted = template.status === 'completed';

//   // ─────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">

//       {/* ── Boss Sign Modal ────────────────────────────────── */}
//       {showBossSign && (
//         <BossSignModal
//           template={template}
//           onClose={() => setShowBossSign(false)}
//           onSigned={handleBossSigned}
//         />
//       )}

//       {/* ── Delete Confirm ──────────────────────────────────── */}
//       {showDelete && (
//         <div className="fixed inset-0 z-50 flex items-center
//                         justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => !deleting && setShowDelete(false)}
//           />
//           <div className="relative bg-white dark:bg-slate-900 rounded-2xl
//                           border border-slate-100 dark:border-slate-800
//                           p-6 w-full max-w-sm shadow-2xl">
//             <div className="w-12 h-12 rounded-2xl bg-red-100
//                             dark:bg-red-900/30 flex items-center
//                             justify-center mx-auto mb-4">
//               <Trash2 className="w-5 h-5 text-red-500" />
//             </div>
//             <h3 className="text-base font-bold text-slate-800
//                            dark:text-white text-center mb-1">
//               Delete Template?
//             </h3>
//             <p className="text-sm text-slate-500 text-center mb-5">
//               "{template.title}" will be permanently deleted.
//             </p>
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowDelete(false)}
//                 disabled={deleting}
//                 className="flex-1 h-10 rounded-xl"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="flex-1 h-10 rounded-xl bg-red-500
//                            hover:bg-red-600 text-white gap-2"
//               >
//                 {deleting
//                   ? <Loader2 className="w-4 h-4 animate-spin" />
//                   : <Trash2  className="w-4 h-4" />
//                 }
//                 Delete
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
//                       py-6 sm:py-10 space-y-6">

//         {/* ══════════════════════════════════════════════════
//             HEADER
//         ══════════════════════════════════════════════════ */}
//         <div className="flex flex-col sm:flex-row sm:items-center
//                         justify-between gap-4">
//           <div className="flex items-center gap-3 min-w-0">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => navigate('/templates')}
//               className="h-9 w-9 rounded-xl border-slate-200
//                          dark:border-slate-700 shrink-0"
//             >
//               <ArrowLeft className="w-4 h-4" />
//             </Button>

//             {/* Logo / Icon */}
//             <div className="w-10 h-10 rounded-xl overflow-hidden
//                             bg-sky-50 dark:bg-sky-900/30 shrink-0
//                             flex items-center justify-center">
//               {template.companyLogo ? (
//                 <img
//                   src={template.companyLogo}
//                   alt="Logo"
//                   className="w-full h-full object-contain p-1"
//                 />
//               ) : (
//                 <LayoutTemplate className="w-5 h-5 text-sky-500" />
//               )}
//             </div>

//             <div className="min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h1 className="text-xl font-bold text-slate-900
//                                dark:text-white truncate">
//                   {template.title}
//                 </h1>
//                 <span className={`text-[11px] font-semibold px-2.5 py-1
//                                   rounded-full ${tmplStatus.bg}
//                                   ${tmplStatus.color}`}>
//                   {tmplStatus.label}
//                 </span>
//               </div>
//               <p className="text-xs text-slate-400 mt-0.5">
//                 {template.companyName && (
//                   <span className="text-slate-500 font-medium mr-1">
//                     {template.companyName} ·
//                   </span>
//                 )}
//                 Created {fmtDate(template.createdAt)}
//                 {' · '}{template.recipients?.length || 0} employees
//               </p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-2 shrink-0">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={refetch}
//               className="h-9 w-9 rounded-xl border-slate-200
//                          dark:border-slate-700"
//               title="Refresh"
//             >
//               <RefreshCw className="w-4 h-4" />
//             </Button>

//             {/* Boss Sign CTA */}
//             {isBossSign && (
//               <Button
//                 onClick={() => setShowBossSign(true)}
//                 className="h-9 px-4 rounded-xl font-semibold gap-2
//                            bg-amber-500 hover:bg-amber-600 text-white
//                            shadow-md shadow-amber-400/25
//                            transition-all hover:-translate-y-0.5"
//               >
//                 <Crown className="w-4 h-4" />
//                 Sign Now
//               </Button>
//             )}

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="h-9 w-9 rounded-xl border-slate-200
//                              dark:border-slate-700"
//                 >
//                   <MoreVertical className="w-4 h-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-44">
//                 {template.fileUrl && (
//                   <DropdownMenuItem asChild>
//                     <a
//                       href={template.bossSignedFileUrl || template.fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="gap-2 cursor-pointer"
//                     >
//                       <FileText className="w-3.5 h-3.5" />
//                       View PDF
//                     </a>
//                   </DropdownMenuItem>
//                 )}
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={() => setShowDelete(true)}
//                   className="gap-2 cursor-pointer text-red-500
//                              focus:text-red-500 focus:bg-red-50
//                              dark:focus:bg-red-900/20"
//                 >
//                   <Trash2 className="w-3.5 h-3.5" />
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* ══════════════════════════════════════════════════
//             BOSS SIGN BANNER
//         ══════════════════════════════════════════════════ */}
//         {isBossSign && (
//           <div className="p-4 rounded-2xl bg-gradient-to-r
//                           from-amber-50 to-orange-50
//                           dark:from-amber-900/20 dark:to-orange-900/10
//                           border border-amber-200 dark:border-amber-800/40
//                           flex flex-col sm:flex-row sm:items-center
//                           gap-3">
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <div className="w-10 h-10 rounded-xl bg-amber-500/20
//                               flex items-center justify-center shrink-0">
//                 <Crown className="w-5 h-5 text-amber-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-bold text-amber-800
//                               dark:text-amber-400">
//                   Your signature is required
//                 </p>
//                 <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
//                   Sign this template to distribute it to{' '}
//                   {template.recipients?.length || 0} employees
//                 </p>
//               </div>
//             </div>
//             <Button
//               onClick={() => setShowBossSign(true)}
//               className="h-9 px-5 rounded-xl font-semibold gap-2
//                          bg-amber-500 hover:bg-amber-600 text-white
//                          shadow-sm shrink-0"
//             >
//               <PenTool className="w-3.5 h-3.5" />
//               Sign as Boss
//             </Button>
//           </div>
//         )}

//         {/* ══════════════════════════════════════════════════
//             STATS
//         ══════════════════════════════════════════════════ */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//           <StatCard
//             label="Total Employees"
//             value={stats.total || template.recipients?.length || 0}
//             icon={Users}
//             color="sky"
//           />
//           <StatCard
//             label="Signed"
//             value={stats.signed || 0}
//             icon={CheckCircle2}
//             color="emerald"
//             sub={stats.total
//               ? `${Math.round(((stats.signed||0)/stats.total)*100)}% rate`
//               : undefined
//             }
//           />
//           <StatCard
//             label="Pending"
//             value={stats.pending || 0}
//             icon={Clock3}
//             color="amber"
//           />
//           <StatCard
//             label="Declined"
//             value={stats.declined || 0}
//             icon={XCircle}
//             color="red"
//           />
//         </div>

//         {/* ══════════════════════════════════════════════════
//             PROGRESS (active/completed only)
//         ══════════════════════════════════════════════════ */}
//         {(isActive || isCompleted) && stats.total > 0 && (
//           <div className="bg-white dark:bg-slate-900 rounded-2xl border
//                           border-slate-100 dark:border-slate-800 p-5">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-slate-700
//                              dark:text-slate-300 flex items-center gap-2">
//                 <TrendingUp className="w-4 h-4 text-emerald-500" />
//                 Signing Progress
//               </h3>
//               {isCompleted && (
//                 <span className="text-xs font-bold text-emerald-500
//                                  flex items-center gap-1">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   All Signed!
//                 </span>
//               )}
//             </div>
//             <ProgressBar
//               signed={stats.signed || 0}
//               total={stats.total || 0}
//             />

//             {/* Boss signature info */}
//             {template.bossSignature?.signedAt && (
//               <div className="mt-4 pt-4 border-t border-slate-50
//                               dark:border-slate-800 flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-amber-100
//                                 dark:bg-amber-900/30 flex items-center
//                                 justify-center shrink-0">
//                   <Crown className="w-4 h-4 text-amber-500" />
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-slate-700
//                                 dark:text-slate-300">
//                     Boss signed{' '}
//                     {fmtRelative(template.bossSignature.signedAt)}
//                   </p>
//                   <p className="text-[11px] text-slate-400">
//                     {[
//                       template.bossSignature.city,
//                       template.bossSignature.country,
//                     ].filter(Boolean).join(', ') || 'Location unknown'}
//                     {template.bossSignature.device && (
//                       <span className="ml-1">
//                         · {template.bossSignature.device}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <span className="ml-auto text-[11px] font-semibold
//                                  text-emerald-500 flex items-center gap-1">
//                   <CheckCircle2 className="w-3 h-3" />
//                   Verified
//                 </span>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ══════════════════════════════════════════════════
//             SESSIONS TAB HEADER
//         ══════════════════════════════════════════════════ */}
//         <div className="bg-white dark:bg-slate-900 rounded-2xl border
//                         border-slate-100 dark:border-slate-800 overflow-hidden">

//           {/* Filter bar */}
//           <div className="px-4 pt-4 pb-3 border-b border-slate-50
//                           dark:border-slate-800 flex flex-col
//                           sm:flex-row gap-3">

//             {/* Search */}
//             <div className="relative flex-1 max-w-xs">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2
//                                  w-3.5 h-3.5 text-slate-400" />
//               <Input
//                 placeholder="Search employees…"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 className="pl-8 h-9 text-xs rounded-xl
//                            border-slate-200 dark:border-slate-700
//                            focus-visible:ring-[#28ABDF]/30"
//               />
//               {search && (
//                 <button
//                   onClick={() => setSearch('')}
//                   className="absolute right-2.5 top-1/2 -translate-y-1/2
//                              text-slate-400 hover:text-slate-600"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               )}
//             </div>

//             {/* Status filters */}
//             <div className="flex items-center gap-1.5 overflow-x-auto
//                             no-scrollbar pb-0.5 sm:pb-0">
//               {[
//                 { key: 'all',      label: 'All'      },
//                 { key: 'pending',  label: 'Pending'  },
//                 { key: 'viewed',   label: 'Viewed'   },
//                 { key: 'signed',   label: 'Signed'   },
//                 { key: 'declined', label: 'Declined' },
//                 { key: 'expired',  label: 'Expired'  },
//               ].map(f => {
//                 const count = f.key === 'all'
//                   ? sessions.length
//                   : sessions.filter(s => s.status === f.key).length;
//                 return (
//                   <button
//                     key={f.key}
//                     onClick={() => setSessionFilter(f.key)}
//                     className={`px-3 py-1.5 rounded-lg text-[11px]
//                                 font-semibold whitespace-nowrap transition-all
//                       ${sessionFilter === f.key
//                         ? 'bg-[#28ABDF] text-white'
//                         : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
//                       }`}
//                   >
//                     {f.label}
//                     <span className="ml-1 opacity-70">({count})</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Session list */}
//           <div className="p-4 space-y-2">
//             {loading && !sessions.length ? (
//               [...Array(5)].map((_, i) => (
//                 <Skeleton key={i} className="h-14 rounded-xl" />
//               ))
//             ) : filtered.length === 0 ? (
//               <div className="py-14 text-center">
//                 <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
//                 <p className="text-sm font-semibold text-slate-500
//                               dark:text-slate-400">
//                   {isBossSign
//                     ? 'Sign as Boss to create employee sessions'
//                     : 'No sessions found'
//                   }
//                 </p>
//                 {!isBossSign && (
//                   <p className="text-xs text-slate-400 mt-1">
//                     Try a different filter or search
//                   </p>
//                 )}
//               </div>
//             ) : (
//               filtered.map(session => (
//                 <SessionRow
//                   key={session._id}
//                   session={session}
//                   templateId={id}
//                   onResend={handleResend}
//                 />
//               ))
//             )}
//           </div>

//           {/* Footer count */}
//           {filtered.length > 0 && (
//             <div className="px-4 pb-4 text-xs text-slate-400">
//               Showing {filtered.length} of {sessions.length} employees
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }

// src/pages/TemplateDetail.jsx
// ✅ BUG 2 FIX: After boss signs, redirect to /templates (list)
//    with a success toast — no longer stays on same page
//    which caused the "redirect back to sign again" loop
import React, {
  useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Crown, Users, CheckCircle2, Clock3,
  XCircle, Eye, Send, RefreshCw, Trash2,
  MoreVertical, Download, AlertTriangle, Loader2,
  LayoutTemplate, PenTool, Search, X, Mail,
  TrendingUp, FileText,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

import { useTemplate, useTemplateMutations } from '@/hooks/useTemplate';
import SignaturePad from '@/components/signing/SignaturePad';

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
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return fmtDate(d);
}

const SESSION_STATUS = {
  pending:  {
    label: 'Pending',
    bg:    'bg-amber-100 dark:bg-amber-900/30',
    text:  'text-amber-700 dark:text-amber-400',
    dot:   'bg-amber-400',
    icon:  Clock3,
  },
  viewed:   {
    label: 'Viewed',
    bg:    'bg-sky-100 dark:bg-sky-900/30',
    text:  'text-sky-700 dark:text-sky-400',
    dot:   'bg-sky-400 animate-pulse',
    icon:  Eye,
  },
  signing:  {
    label: 'Signing',
    bg:    'bg-blue-100 dark:bg-blue-900/30',
    text:  'text-blue-700 dark:text-blue-400',
    dot:   'bg-blue-400 animate-pulse',
    icon:  PenTool,
  },
  signed:   {
    label: 'Signed',
    bg:    'bg-emerald-100 dark:bg-emerald-900/30',
    text:  'text-emerald-700 dark:text-emerald-400',
    dot:   'bg-emerald-500',
    icon:  CheckCircle2,
  },
  declined: {
    label: 'Declined',
    bg:    'bg-red-100 dark:bg-red-900/30',
    text:  'text-red-700 dark:text-red-400',
    dot:   'bg-red-500',
    icon:  XCircle,
  },
  expired:  {
    label: 'Expired',
    bg:    'bg-slate-100 dark:bg-slate-800',
    text:  'text-slate-500 dark:text-slate-400',
    dot:   'bg-slate-400',
    icon:  Clock3,
  },
};

const TEMPLATE_STATUS = {
  draft:        { label: 'Draft',              color: 'text-slate-500',                bg: 'bg-slate-100 dark:bg-slate-800'           },
  boss_pending: { label: 'Awaiting Your Sign', color: 'text-amber-600',                bg: 'bg-amber-100 dark:bg-amber-900/30'        },
  active:       { label: 'Active',             color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30'           },
  completed:    { label: 'Completed',          color: 'text-emerald-600',              bg: 'bg-emerald-100 dark:bg-emerald-900/30'    },
  archived:     { label: 'Archived',           color: 'text-slate-500',                bg: 'bg-slate-100 dark:bg-slate-800'           },
};

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  const clr = {
    sky:     'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
    amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
    red:     'bg-red-50 dark:bg-red-900/20 text-red-500',
  }[color] || 'bg-slate-50 dark:bg-slate-800 text-slate-500';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border
                    border-slate-100 dark:border-slate-800 p-4
                    flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center
                       justify-center shrink-0 ${clr}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900
                      dark:text-white leading-none">
          {value ?? 0}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </p>
        {sub && (
          <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session, templateId, onResend }) {
  const [resending, setResending] = useState(false);
  const cfg = SESSION_STATUS[session.status] || SESSION_STATUS.pending;
  const Icon = cfg.icon;

  const canResend = ['pending', 'viewed', 'expired'].includes(session.status);

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend(session._id);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl
                    border border-slate-100 dark:border-slate-800
                    bg-white dark:bg-slate-900
                    hover:border-slate-200 dark:hover:border-slate-700
                    transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br
                      from-sky-100 to-sky-200 dark:from-sky-900/40
                      dark:to-sky-900/20 flex items-center justify-center
                      text-sky-600 dark:text-sky-400 font-bold
                      text-sm shrink-0">
        {(session.recipientName?.[0] || '?').toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800
                      dark:text-white truncate">
          {session.recipientName}
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {session.recipientEmail}
          {session.recipientDesignation && (
            <span className="ml-1 text-slate-300">
              · {session.recipientDesignation}
            </span>
          )}
        </p>
      </div>

      <span className={`hidden sm:inline-flex items-center gap-1.5
                        text-[11px] font-semibold px-2 py-1
                        rounded-full shrink-0
                        ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>

      <span className="hidden lg:block text-[11px] text-slate-400 shrink-0">
        {session.signedAt
          ? fmtRelative(session.signedAt)
          : fmtRelative(session.sentAt)
        }
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {session.signedFileUrl && (
          <a
            href={session.signedFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400
                       hover:text-emerald-500 hover:bg-emerald-50
                       dark:hover:bg-emerald-900/20 transition-colors"
            title="Download signed PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}

        {canResend && (
          <button
            onClick={handleResend}
            disabled={resending}
            className="p-1.5 rounded-lg text-slate-400
                       hover:text-sky-500 hover:bg-sky-50
                       dark:hover:bg-sky-900/20 transition-colors
                       disabled:opacity-50"
            title="Resend email"
          >
            {resending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Mail    className="w-3.5 h-3.5" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// BOSS SIGN MODAL
// ✅ BUG 2 FIX: After successful sign, navigate AWAY from this
//    page to prevent the "redirect back to sign again" loop.
//    The response from bossSign includes redirectUrl which we use.
// ════════════════════════════════════════════════════════════════
function BossSignModal({ template, onClose, onSigned }) {
  const navigate  = useNavigate();
  const mutations = useTemplateMutations();
  const [signing,  setSigning]  = useState(false);
  const [sigData,  setSigData]  = useState(null);

  const handleSign = async () => {
    if (!sigData) {
      toast.error('Please draw your signature first.');
      return;
    }
    setSigning(true);
    try {
      const res = await mutations.bossSign(template._id, {
        signatureDataUrl: sigData,
        fieldValues:      [],
      });

      if (!res.success) {
        toast.error(res.error || 'Signing failed.');
        return;
      }

      const recipientCount = template.stats?.totalRecipients
        || template.recipients?.length || 0;

      toast.success(
        `Signed! Emails sent to ${recipientCount} employee${recipientCount !== 1 ? 's' : ''}.`,
        { duration: 5000 }
      );

      // ✅ BUG 2 FIX: Close modal first
      onClose();

      // ✅ BUG 2 FIX: Navigate to templates list, NOT back to this page.
      // The old code called onSigned() which setTemplate() and refetch()
      // but if status was still 'boss_pending' on re-render, the useEffect
      // would re-open the modal → infinite loop.
      // Now we navigate away completely.
      const redirectUrl = res.data?.redirectUrl || '/templates';
      navigate(redirectUrl, {
        state: {
          // Pass success info for dashboard optimistic update
          templateSigned: true,
          templateId:     template._id,
          templateTitle:  template.title,
        },
        replace: true,
      });

    } catch (err) {
      toast.error(err?.message || 'Signing failed.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden
                                border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100
                        dark:border-slate-800 bg-gradient-to-r
                        from-amber-50 to-orange-50
                        dark:from-amber-900/20 dark:to-orange-900/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10
                            flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800
                                       dark:text-white">
                Sign as Authoriser
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Your signature will be embedded into the PDF for all employees
              </DialogDescription>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-white/60
                          dark:bg-slate-800/60 backdrop-blur-sm">
            <p className="text-xs text-slate-500 font-medium">Template</p>
            <p className="text-sm font-semibold text-slate-800
                          dark:text-white mt-0.5 truncate">
              {template.title}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Will be sent to{' '}
              <span className="font-semibold text-amber-600">
                {template.recipients?.length || 0} employees
              </span>{' '}
              after signing
            </p>
          </div>
        </div>

        {/* Signature pad */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-500
                        uppercase tracking-wide mb-3">
            Draw Your Signature
          </p>
          <SignaturePad
            onChange={setSigData}
            height={180}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={signing}
            className="flex-1 h-11 rounded-xl border-slate-200
                       dark:border-slate-700 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={signing || !sigData}
            className="flex-1 h-11 rounded-xl font-semibold gap-2
                       bg-amber-500 hover:bg-amber-600 text-white
                       shadow-md shadow-amber-400/25
                       disabled:opacity-60"
          >
            {signing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Crown   className="w-4 h-4" />
            }
            {signing ? 'Signing…' : 'Sign & Send to All'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProgressBar({ signed = 0, total = 0 }) {
  const pct = total > 0 ? Math.round((signed / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{signed} of {total} signed</span>
        <span className="font-bold text-slate-600 dark:text-slate-300">
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800
                      rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700
                     bg-gradient-to-r from-emerald-400 to-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
export default function TemplateDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const {
    template, sessions, sessionStats,
    loading, error,
    refetch, optimisticSessionUpdate,
    setTemplate,
  } = useTemplate(id);

  const mutations = useTemplateMutations();

  const [activeTab,     setActiveTab]     = useState('sessions');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [search,        setSearch]        = useState('');
  const [showBossSign,  setShowBossSign]  = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  // ✅ BUG 2 FIX: Track if boss sign modal was already shown
  // to prevent re-opening after navigation back.
  // Use a ref so it persists across renders but doesn't cause re-renders.
  const bossSignShownRef = useRef(false);

  // ✅ BUG 2 FIX: Only auto-open boss sign modal once per mount.
  // If boss has already signed (bossSignedFileUrl exists), NEVER open.
  useEffect(() => {
    if (!template) return;
    if (bossSignShownRef.current) return;
    if (template.bossSignature?.signedAt) return; // Already signed
    if (template.bossSignedFileUrl) return;        // Already has signed PDF

    if (template.status === 'boss_pending') {
      bossSignShownRef.current = true;
      const t = setTimeout(() => setShowBossSign(true), 600);
      return () => clearTimeout(t);
    }
  }, [template?.status, template?.bossSignature?.signedAt, template?.bossSignedFileUrl]);

  const stats = useMemo(() => {
    if (sessionStats) return sessionStats;
    const signed   = sessions.filter(s => s.status === 'signed').length;
    const declined = sessions.filter(s => s.status === 'declined').length;
    const viewed   = sessions.filter(s => s.viewedAt).length;
    const total    = sessions.length;
    const pending  = total - signed - declined;
    return { total, signed, declined, viewed, pending };
  }, [sessions, sessionStats]);

  const filtered = useMemo(() => {
    let list = sessions;
    if (sessionFilter !== 'all') {
      list = list.filter(s => s.status === sessionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.recipientName?.toLowerCase().includes(q)  ||
        s.recipientEmail?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [sessions, sessionFilter, search]);

  const handleResend = useCallback(async (sessionId) => {
    const res = await mutations.resendEmail(id, sessionId);
    if (res.success) {
      toast.success('Reminder sent!');
      optimisticSessionUpdate(sessionId, {
        reminderCount: 1,
        lastReminderAt: new Date().toISOString(),
      });
    } else {
      toast.error(res.error || 'Failed to send reminder.');
    }
  }, [id, mutations, optimisticSessionUpdate]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    const res = await mutations.deleteTemplate(id);
    if (res.success) {
      toast.success('Template deleted.');
      navigate('/templates', { replace: true });
    } else {
      toast.error(res.error || 'Delete failed.');
      setDeleting(false);
      setShowDelete(false);
    }
  }, [id, mutations, navigate]);

  // ✅ BUG 2 FIX: onSigned callback no longer used for navigation
  // Navigation now happens INSIDE BossSignModal itself
  const handleBossSigned = useCallback((updatedTemplate) => {
    setShowBossSign(false);
    if (updatedTemplate) setTemplate(updatedTemplate);
    refetch();
  }, [setTemplate, refetch]);

  if (loading) return <PageSkeleton />;

  if (error || !template) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
                      flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border
                        border-slate-100 dark:border-slate-800
                        p-8 max-w-sm w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-800 dark:text-white mb-1">
            {error || 'Template not found'}
          </p>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              onClick={() => navigate('/templates')}
              className="flex-1 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={refetch}
              className="flex-1 rounded-xl bg-[#28ABDF]
                         hover:bg-sky-600 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tmplStatus = TEMPLATE_STATUS[template.status] || TEMPLATE_STATUS.draft;
  const isBossSign  = template.status === 'boss_pending';
  const isActive    = template.status === 'active';
  const isCompleted = template.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">

      {/* ── Boss Sign Modal ────────────────────────────────── */}
      {showBossSign && (
        <BossSignModal
          template={template}
          onClose={() => setShowBossSign(false)}
          onSigned={handleBossSigned}
        />
      )}

      {/* ── Delete Confirm ──────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center
                        justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setShowDelete(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl
                          border border-slate-100 dark:border-slate-800
                          p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100
                            dark:bg-red-900/30 flex items-center
                            justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800
                           dark:text-white text-center mb-1">
              Delete Template?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              "{template.title}" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-red-500
                           hover:bg-red-600 text-white gap-2"
              >
                {deleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2  className="w-4 h-4" />
                }
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/templates')}
              className="h-9 w-9 rounded-xl border-slate-200
                         dark:border-slate-700 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="w-10 h-10 rounded-xl overflow-hidden
                            bg-sky-50 dark:bg-sky-900/30 shrink-0
                            flex items-center justify-center">
              {template.companyLogo ? (
                <img
                  src={template.companyLogo}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <LayoutTemplate className="w-5 h-5 text-sky-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900
                               dark:text-white truncate">
                  {template.title}
                </h1>
                <span className={`text-[11px] font-semibold px-2.5 py-1
                                  rounded-full ${tmplStatus.bg}
                                  ${tmplStatus.color}`}>
                  {tmplStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {template.companyName && (
                  <span className="text-slate-500 font-medium mr-1">
                    {template.companyName} ·
                  </span>
                )}
                Created {fmtDate(template.createdAt)}
                {' · '}{template.recipients?.length || 0} employees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              className="h-9 w-9 rounded-xl border-slate-200
                         dark:border-slate-700"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* ✅ BUG 2 FIX: Only show Sign Now button if not yet signed */}
            {isBossSign && !template.bossSignature?.signedAt && (
              <Button
                onClick={() => setShowBossSign(true)}
                className="h-9 px-4 rounded-xl font-semibold gap-2
                           bg-amber-500 hover:bg-amber-600 text-white
                           shadow-md shadow-amber-400/25
                           transition-all hover:-translate-y-0.5"
              >
                <Crown className="w-4 h-4" />
                Sign Now
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-slate-200
                             dark:border-slate-700"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {template.fileUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={template.bossSignedFileUrl || template.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View PDF
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
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
        </div>

        {/* BOSS SIGN BANNER */}
        {isBossSign && !template.bossSignature?.signedAt && (
          <div className="p-4 rounded-2xl bg-gradient-to-r
                          from-amber-50 to-orange-50
                          dark:from-amber-900/20 dark:to-orange-900/10
                          border border-amber-200 dark:border-amber-800/40
                          flex flex-col sm:flex-row sm:items-center
                          gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20
                              flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800
                              dark:text-amber-400">
                  Your signature is required
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                  Sign this template to distribute it to{' '}
                  {template.recipients?.length || 0} employees
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowBossSign(true)}
              className="h-9 px-5 rounded-xl font-semibold gap-2
                         bg-amber-500 hover:bg-amber-600 text-white
                         shadow-sm shrink-0"
            >
              <PenTool className="w-3.5 h-3.5" />
              Sign as Boss
            </Button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Employees"
            value={stats.total || template.recipients?.length || 0}
            icon={Users}
            color="sky"
          />
          <StatCard
            label="Signed"
            value={stats.signed || 0}
            icon={CheckCircle2}
            color="emerald"
            sub={stats.total
              ? `${Math.round(((stats.signed||0)/stats.total)*100)}% rate`
              : undefined
            }
          />
          <StatCard
            label="Pending"
            value={stats.pending || 0}
            icon={Clock3}
            color="amber"
          />
          <StatCard
            label="Declined"
            value={stats.declined || 0}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* PROGRESS */}
        {(isActive || isCompleted) && stats.total > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border
                          border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700
                             dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Signing Progress
              </h3>
              {isCompleted && (
                <span className="text-xs font-bold text-emerald-500
                                 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Signed!
                </span>
              )}
            </div>
            <ProgressBar
              signed={stats.signed || 0}
              total={stats.total || 0}
            />

            {template.bossSignature?.signedAt && (
              <div className="mt-4 pt-4 border-t border-slate-50
                              dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100
                                dark:bg-amber-900/30 flex items-center
                                justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700
                                dark:text-slate-300">
                    Boss signed{' '}
                    {fmtRelative(template.bossSignature.signedAt)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {[
                      template.bossSignature.city,
                      template.bossSignature.country,
                    ].filter(Boolean).join(', ') || 'Location unknown'}
                    {template.bossSignature.device && (
                      <span className="ml-1">
                        · {template.bossSignature.device}
                      </span>
                    )}
                  </p>
                </div>
                <span className="ml-auto text-[11px] font-semibold
                                 text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
            )}
          </div>
        )}

        {/* SESSIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border
                        border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Filter bar */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-50
                          dark:border-slate-800 flex flex-col
                          sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search employees…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl
                           border-slate-200 dark:border-slate-700
                           focus-visible:ring-[#28ABDF]/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto
                            no-scrollbar pb-0.5 sm:pb-0">
              {[
                { key: 'all',      label: 'All'      },
                { key: 'pending',  label: 'Pending'  },
                { key: 'viewed',   label: 'Viewed'   },
                { key: 'signed',   label: 'Signed'   },
                { key: 'declined', label: 'Declined' },
                { key: 'expired',  label: 'Expired'  },
              ].map(f => {
                const count = f.key === 'all'
                  ? sessions.length
                  : sessions.filter(s => s.status === f.key).length;
                return (
                  <button
                    key={f.key}
                    onClick={() => setSessionFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px]
                                font-semibold whitespace-nowrap transition-all
                      ${sessionFilter === f.key
                        ? 'bg-[#28ABDF] text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {f.label}
                    <span className="ml-1 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session list */}
          <div className="p-4 space-y-2">
            {loading && !sessions.length ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500
                              dark:text-slate-400">
                  {isBossSign
                    ? 'Sign as Boss to create employee sessions'
                    : 'No sessions found'
                  }
                </p>
                {!isBossSign && (
                  <p className="text-xs text-slate-400 mt-1">
                    Try a different filter or search
                  </p>
                )}
              </div>
            ) : (
              filtered.map(session => (
                <SessionRow
                  key={session._id}
                  session={session}
                  templateId={id}
                  onResend={handleResend}
                />
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className="px-4 pb-4 text-xs text-slate-400">
              Showing {filtered.length} of {sessions.length} employees
            </div>
          )}
        </div>

      </div>
    </div>
  );
}