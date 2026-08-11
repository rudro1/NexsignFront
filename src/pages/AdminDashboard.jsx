
// import React, { useState, useEffect, useCallback, useMemo } from 'react'; // useMemo যোগ করা হয়েছে
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Shield, Users, Clock, Search, 
//   Trash2, Loader2, Activity, ChevronLeft, ChevronRight, 
//   Calendar, Plus, History, FileText 
// } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, isAdmin, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
  
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); 
  
//   const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
//   const [logPage, setLogPage] = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   // ১. ইউজার ফেচিং (অটো-রিফ্রেশ সাপোর্টেড)
//   const fetchUsers = useCallback(async (showLoading = true) => {
//     if (showLoading) setLoading(prev => ({ ...prev, users: true }));
//     try {
//       const res = await api.get('/admin/users');
//       const data = Array.isArray(res.data) ? res.data : (res.data?.users || []);
//       setUsers(data);
//     } catch { 
//       console.error("User load error");
//     } finally { 
//       setLoading(prev => ({ ...prev, users: false })); 
//     }
//   }, []);

//   // ২. ডকুমেন্ট ফেচিং (অটো-রিফ্রেশ সাপোর্টেড)
//   const fetchDocs = useCallback(async (showLoading = true) => {
//     if (showLoading) setLoading(prev => ({ ...prev, docs: true }));
//     try {
//       const res = await api.get('/admin/documents');
//       const data = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
//       setDocuments(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
//     } catch { 
//       console.error("Docs load error");
//     } finally { 
//       setLoading(prev => ({ ...prev, docs: false })); 
//     }
//   }, []);

//   // ৩. অডিট লগ ফেচিং
//   const fetchLogs = useCallback(async (pageNo = 1, showLoading = true) => {
//     if (showLoading) setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}&limit=15`);
//       const logData = res.data?.logs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
//       setLogs(logData);
//       setHasMoreLogs(logData.length >= 15);
//       setLogPage(pageNo);
//     } catch { 
//       console.error("Logs load error");
//     } finally { 
//       setLoading(prev => ({ ...prev, logs: false })); 
//     }
//   }, []);

//   const refreshAll = (showLoading = true) => {
//     fetchUsers(showLoading);
//     fetchDocs(showLoading);
//     fetchLogs(1, showLoading);
//   };

//   // 🌟 অটো-আপডেট লজিক (প্রতি ১০ সেকেন্ডে ডেটা রিফ্রেশ হবে)
//   useEffect(() => {
//     if (authLoading) return;
//     if (!isAdmin) { navigate('/dashboard'); return; }
    
//     // প্রথমবার লোড
//     refreshAll(true);

//     // ব্যাকগ্রাউন্ড ইন্টারভাল
//     const interval = setInterval(() => {
//       refreshAll(false); // ব্যাকগ্রাউন্ডে আপডেট হবে, লোডার দেখাবে না
//     }, 10000); 

//     return () => clearInterval(interval); // মেমোরি লিক রোধে ক্লিনিআপ
//   }, [isAdmin, authLoading, navigate]);

//   // ফিল্টারিং লজিক (useMemo দিয়ে পারফরম্যান্স অপ্টিমাইজড)
//   const filteredUsers = useMemo(() => 
//     users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
//   , [users, search]);

//   const filteredDocs = useMemo(() => 
//     documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()))
//   , [documents, search]);

//   const filteredLogs = useMemo(() => 
//     logs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()))
//   , [logs, search]);

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure? This action cannot be undone.")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(prev => prev.filter(u => u._id !== userId));
//       toast.success("User deleted");
//     } catch { toast.error("Deletion failed"); }
//   };

//   const handleDeleteDoc = async (docId) => {
//     if (!window.confirm("Remove this document permanently?")) return;
//     try {
//       await api.delete(`/admin/documents/${docId}`);
//       setDocuments(prev => prev.filter(d => d._id !== docId));
//       toast.success("Document removed");
//     } catch { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     if (!dateStr) return 'N/A';
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   if (authLoading) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
//       <Loader2 className="animate-spin text-sky-600 w-12 h-12" />
//       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Admin...</p>
//     </div>
//   );

//   return (
//     <div className="w-full mx-auto px-4 md:px-8 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
      
//       {/* Header */}
//       <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">Secure Admin Environment</span>
//           </div>
//           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Management Console</h1>
//         </div>
        
//         <div className="flex gap-3">
//           <Link to="/DocumentEditor">
//             <Button className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-6 h-12 font-black shadow-xl">
//               <Plus className="mr-2 w-5 h-5" /> NEW DOC
//             </Button>
//           </Link>
//           <Button onClick={() => refreshAll(true)} variant="outline" className="rounded-2xl px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50">
//             <Activity size={18} className={`mr-2 text-emerald-500 ${(loading.users || loading.docs) ? 'animate-spin' : ''}`}/> REFRESH
//           </Button>
//         </div>
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="max-w-[1600px] mx-auto space-y-8">
       
//         <TabsList className="bg-slate-200/40 dark:bg-slate-900/50 p-1.5 rounded-[20px] w-full md:w-fit border">
//           <TabsTrigger value="users" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Users</TabsTrigger>
//           <TabsTrigger value="documents" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Documents</TabsTrigger>
//           <TabsTrigger value="logs" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Audit Logs</TabsTrigger>
//         </TabsList>

//         <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center">
//           <div className="relative flex-1">
//             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
//             <Input 
//               placeholder={`Search ${tab}...`} 
//               value={search} 
//               onChange={e => setSearch(e.target.value)} 
//               className="pl-14 border-none bg-transparent h-14 text-base focus-visible:ring-0 font-medium dark:text-white" 
//             />
//           </div>
//           {loading[tab] && <Loader2 className="animate-spin text-sky-500 mr-4 w-5 h-5" />}
//         </div>

//         <div className="animate-in fade-in duration-500">
          
//           {tab === 'documents' && (
//             <div className="grid gap-6">
//               {filteredDocs.length === 0 ? (
//                 <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs bg-white dark:bg-slate-900 rounded-[2rem]">No Records Found</div>
//               ) : (
//                 filteredDocs.map(d => (
//                   <Card key={d._id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b dark:border-slate-800 pb-8">
//                       <div>
//                         <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">{d.title}</h2>
//                         <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
//                           <span className="flex items-center gap-2"><Users size={12} className="text-sky-500"/> {d.owner?.full_name || 'System'}</span>
//                           <span className="flex items-center gap-2"><Calendar size={12} className="text-sky-500"/> {safeFormatDate(d.createdAt)}</span>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 w-full lg:w-auto">
//                         {d.status === 'completed' && (
//                           <Button onClick={() => window.open(d.fileUrl, '_blank')} className="flex-1 lg:flex-none bg-white dark:bg-slate-800 text-sky-600 border border-sky-100 h-12 px-6 rounded-2xl font-black">
//                             <FileText size={16} className="mr-2" /> VIEW
//                           </Button>
//                         )}
//                         <Badge className={`px-6 h-12 rounded-2xl justify-center text-[10px] font-black uppercase tracking-widest flex-1 lg:flex-none ${d.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
//                           {d.status}
//                         </Badge>
//                         <Button onClick={() => handleDeleteDoc(d._id)} variant="ghost" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
//                           <Trash2 size={20}/>
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-6">
//                       {d.parties?.map((p, i) => (
//                         <div key={i} className="p-6 border border-slate-50 dark:border-slate-800 rounded-[1.5rem] bg-[#FCFEFF] dark:bg-slate-950/40">
//                           <div className="flex justify-between items-center mb-4">
//                             <span className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase">{p.name}</span>
//                             <Badge variant="outline" className={`text-[9px] font-black px-3 py-1 ${p.status === 'signed' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.status}</Badge>
//                           </div>
//                           <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-bold uppercase">
//                             <div className="flex flex-col"><span>IP Address</span><span className="text-slate-900 dark:text-slate-300 truncate">{p.ipAddress || '---'}</span></div>
//                             <div className="flex flex-col"><span>Location</span><span className="text-slate-900 dark:text-slate-300 truncate">{p.location || '---'}</span></div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </Card>
//                 ))
//               )}
//             </div>
//           )}

//           {tab === 'users' && (
//             <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
//               <div className="hidden md:block">
//                 <table className="w-full text-left">
//                   <thead>
//                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 dark:border-slate-800">
//                       <th className="pb-6 px-4">User Profile</th>
//                       <th className="pb-6 px-4">Role</th>
//                       <th className="pb-6 px-4">Created</th>
//                       <th className="pb-6 px-4 text-right">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y dark:divide-slate-800">
//                     {filteredUsers.map(u => (
//                       <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
//                         <td className="py-6 px-4">
//                           <div className="font-bold text-slate-900 dark:text-white text-base">{u.full_name}</div>
//                           <div className="text-xs text-slate-400 font-medium">{u.email}</div>
//                         </td>
//                         <td className="py-6 px-4">
//                           <Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1 border-slate-200 text-sky-600">{u.role}</Badge>
//                         </td>
//                         <td className="py-6 px-4 text-[11px] font-black text-slate-500">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</td>
//                         <td className="py-6 px-4 text-right">
//                           {u.role !== 'super_admin' && (
//                             <Button onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl h-12 w-12 p-0 bg-transparent">
//                               <Trash2 size={20}/>
//                             </Button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="md:hidden flex flex-col gap-4">
//                 {filteredUsers.map(u => (
//                   <div key={u._id} className="p-4 border dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
//                     <div className="flex justify-between items-start mb-2">
//                       <div><p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
//                       <Badge className="text-[9px]">{u.role}</Badge>
//                     </div>
//                     <div className="flex justify-between items-center mt-4">
//                       <span className="text-[10px] font-bold text-slate-500 uppercase">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</span>
//                       <Button onClick={() => handleDeleteUser(u._id)} variant="ghost" className="text-red-400 p-0 h-8 w-8"><Trash2 size={16}/></Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           )}

//           {tab === 'logs' && (
//             <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
//               <div className="flex items-center gap-3 mb-8">
//                 <History className="text-sky-500" size={24} />
//                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Audit Trail</h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left min-w-[600px]">
//                   <thead>
//                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 dark:border-slate-800">
//                       <th className="pb-6 px-4">Performed By</th>
//                       <th className="pb-6 px-4">Action</th>
//                       <th className="pb-6 px-4">Timestamp</th>
//                       <th className="pb-6 px-4 text-right">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y dark:divide-slate-800">
//                     {filteredLogs.map((log, i) => (
//                       <tr key={log._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
//                         <td className="py-6 px-4">
//                           <div className="font-bold text-slate-900 dark:text-white text-sm">{log.performed_by?.name || 'System'}</div>
//                           <div className="text-[10px] text-slate-400">{log.performed_by?.email || 'automated@system.com'}</div>
//                         </td>
//                         <td className="py-6 px-4">
//                           <Badge className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase px-3 py-1">
//                             {log.action}
//                           </Badge>
//                         </td>
//                         <td className="py-6 px-4 text-[11px] font-black text-slate-500 uppercase">{safeFormatDate(log.timestamp || log.createdAt)}</td>
//                         <td className="py-6 px-4 text-right">
//                           <div className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="mt-10 pt-8 border-t dark:border-slate-800 flex justify-between items-center">
//                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {logPage}</span>
//                 <div className="flex gap-4">
//                   <Button onClick={() => fetchLogs(logPage - 1, true)} disabled={logPage === 1} variant="outline" className="rounded-xl h-12 w-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><ChevronLeft size={20}/></Button>
//                   <Button onClick={() => fetchLogs(logPage + 1, true)} disabled={!hasMoreLogs} variant="outline" className="rounded-xl h-12 w-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><ChevronRight size={20}/></Button>
//                 </div>
//               </div>
//             </Card>
//           )}

//         </div>
//       </Tabs>
//     </div>
//   );
// }

// src/pages/AdminDashboard.jsx
// import React, {
//   useState, useEffect, useCallback, useMemo, useRef,
// } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Badge }  from '@/components/ui/badge';
// import { Input }  from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Shield, Users, Clock, Search,
//   Trash2, Loader2, Activity, ChevronLeft, ChevronRight,
//   Calendar, Plus, History, FileText, RefreshCw,
//   AlertCircle, CheckCircle2, TrendingUp, Eye,
// } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import { toast } from 'sonner';

// // ── Helpers ───────────────────────────────────────────────────────
// const safeDate = (d, f = 'dd MMM yyyy, hh:mm a') => {
//   if (!d) return '—';
//   const dt = new Date(d);
//   return isValid(dt) ? format(dt, f) : '—';
// };

// const STATUS_STYLE = {
//   completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
//   in_progress: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
//   draft:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
//   pending:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
//   signed:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
// };

// // ── Stat Card ────────────────────────────────────────────────────
// function AdminStatCard({ label, value, icon: Icon, color, loading }) {
//   const colors = {
//     sky:    'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
//     violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
//     emerald:'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
//     amber:  'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
//   };
//   return (
//     <div className="bg-white dark:bg-slate-900 rounded-2xl p-5
//                     border border-slate-100 dark:border-slate-800
//                     shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex items-center justify-between mb-3">
//         <div className={`w-10 h-10 rounded-xl flex items-center
//                          justify-center ${colors[color]}`}>
//           <Icon className="w-5 h-5" />
//         </div>
//         <TrendingUp className="w-4 h-4 text-slate-300" />
//       </div>
//       {loading ? (
//         <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800
//                         rounded-lg animate-pulse mb-1" />
//       ) : (
//         <p className="text-2xl font-extrabold text-slate-900
//                       dark:text-white">
//           {value}
//         </p>
//       )}
//       <p className="text-xs text-slate-500 dark:text-slate-400
//                     font-medium mt-0.5">
//         {label}
//       </p>
//     </div>
//   );
// }

// // ── Confirm Dialog ────────────────────────────────────────────────
// function ConfirmDialog({ open, message, onConfirm, onCancel }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center
//                     bg-black/50 backdrop-blur-sm p-4
//                     animate-in fade-in duration-200">
//       <div className="bg-white dark:bg-slate-900 rounded-2xl p-6
//                       shadow-2xl max-w-sm w-full
//                       animate-in zoom-in-95 duration-200">
//         <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20
//                         rounded-2xl flex items-center justify-center
//                         mx-auto mb-4">
//           <AlertCircle className="w-6 h-6 text-red-500" />
//         </div>
//         <h3 className="font-bold text-slate-900 dark:text-white
//                        text-center mb-2">
//           Confirm Action
//         </h3>
//         <p className="text-slate-500 text-sm text-center mb-6">
//           {message}
//         </p>
//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             onClick={onCancel}
//             className="flex-1 rounded-xl"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={onConfirm}
//             className="flex-1 rounded-xl bg-red-500 hover:bg-red-600
//                        text-white"
//           >
//             Delete
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ════════════════════════════════════════════════════════════════
// export default function AdminDashboard() {
//   const { isAdmin, loading: authLoading } = useAuth();
//   const navigate = useNavigate();

//   const [tab,    setTab]    = useState('users');
//   const [search, setSearch] = useState('');

//   const [users,     setUsers]     = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs,      setLogs]      = useState([]);

//   const [loading, setLoading] = useState({
//     users: true, docs: true, logs: true,
//   });

//   const [logPage,     setLogPage]     = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   // Delete confirm dialog
//   const [confirm, setConfirm] = useState({
//     open: false, message: '', onConfirm: null,
//   });

//   const isMounted = useRef(true);
//   useEffect(() => () => { isMounted.current = false; }, []);

//   // ── Fetchers ───────────────────────────────────────────────────
//   const fetchUsers = useCallback(async (show = true) => {
//     if (show) setLoading(p => ({ ...p, users: true }));
//     try {
//       const res  = await api.get('/admin/users');
//       const data = Array.isArray(res.data)
//         ? res.data
//         : (res.data?.users || []);
//       if (isMounted.current) setUsers(data);
//     } catch (e) {
//       console.error('fetchUsers:', e.message);
//     } finally {
//       if (isMounted.current)
//         setLoading(p => ({ ...p, users: false }));
//     }
//   }, []);

//   const fetchDocs = useCallback(async (show = true) => {
//     if (show) setLoading(p => ({ ...p, docs: true }));
//     try {
//       const res  = await api.get('/admin/documents');
//       const data = Array.isArray(res.data)
//         ? res.data
//         : (res.data?.documents || []);
//       if (isMounted.current)
//         setDocuments(
//           [...data].sort(
//             (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//           )
//         );
//     } catch (e) {
//       console.error('fetchDocs:', e.message);
//     } finally {
//       if (isMounted.current)
//         setLoading(p => ({ ...p, docs: false }));
//     }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1, show = true) => {
//     if (show) setLoading(p => ({ ...p, logs: true }));
//     try {
//       const res     = await api.get('/admin/audit-logs', {
//         params: { page: pageNo, limit: 15 },
//       });
//       const logData =
//         res.data?.logs ||
//         res.data?.data ||
//         (Array.isArray(res.data) ? res.data : []);

//       if (isMounted.current) {
//         setLogs(logData);
//         setHasMoreLogs(logData.length >= 15);
//         setLogPage(pageNo);
//       }
//     } catch (e) {
//       console.error('fetchLogs:', e.message);
//     } finally {
//       if (isMounted.current)
//         setLoading(p => ({ ...p, logs: false }));
//     }
//   }, []);

//   const refreshAll = useCallback((show = true) => {
//     fetchUsers(show);
//     fetchDocs(show);
//     fetchLogs(1, show);
//   }, [fetchUsers, fetchDocs, fetchLogs]);

//   // ── Auth + polling ─────────────────────────────────────────────
//   useEffect(() => {
//     if (authLoading) return;
//     if (!isAdmin) { navigate('/dashboard', { replace: true }); return; }

//     refreshAll(true);
//     const id = setInterval(() => refreshAll(false), 30_000);
//     return () => clearInterval(id);
//   }, [authLoading, isAdmin, navigate, refreshAll]);

//   // ── Stats ──────────────────────────────────────────────────────
//   const stats = useMemo(() => ({
//     users:     users.length,
//     docs:      documents.length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     active:    documents.filter(d => d.status === 'in_progress').length,
//   }), [users, documents]);

//   // ── Filtered data ──────────────────────────────────────────────
//   const q = search.toLowerCase().trim();

//   const filteredUsers = useMemo(() =>
//     users.filter(u =>
//       !q ||
//       u.full_name?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q)
//     ), [users, q]);

//   const filteredDocs = useMemo(() =>
//     documents.filter(d =>
//       !q || d.title?.toLowerCase().includes(q)
//     ), [documents, q]);

//   const filteredLogs = useMemo(() =>
//     logs.filter(l =>
//       !q ||
//       l.action?.toLowerCase().includes(q) ||
//       l.performed_by?.email?.toLowerCase().includes(q) ||
//       l.performed_by?.name?.toLowerCase().includes(q)
//     ), [logs, q]);

//   // ── Delete handlers ────────────────────────────────────────────
//   const deleteUser = useCallback((userId) => {
//     setConfirm({
//       open: true,
//       message: 'This will permanently delete the user and all their data.',
//       onConfirm: async () => {
//         setConfirm(p => ({ ...p, open: false }));
//         try {
//           await api.delete(`/admin/users/${userId}`);
//           setUsers(prev => prev.filter(u => u._id !== userId));
//           toast.success('User deleted.');
//         } catch {
//           toast.error('Failed to delete user.');
//         }
//       },
//     });
//   }, []);

//   const deleteDoc = useCallback((docId) => {
//     setConfirm({
//       open: true,
//       message: 'This document will be permanently removed.',
//       onConfirm: async () => {
//         setConfirm(p => ({ ...p, open: false }));
//         try {
//           await api.delete(`/admin/documents/${docId}`);
//           setDocuments(prev => prev.filter(d => d._id !== docId));
//           toast.success('Document deleted.');
//         } catch {
//           toast.error('Failed to delete document.');
//         }
//       },
//     });
//   }, []);

//   // ── Loading screen ─────────────────────────────────────────────
//   if (authLoading) {
//     return (
//       <div className="h-screen flex flex-col items-center
//                       justify-center bg-slate-50 dark:bg-slate-950 gap-4">
//         <Loader2 className="animate-spin text-sky-500 w-10 h-10" />
//         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//           Verifying Admin...
//         </p>
//       </div>
//     );
//   }

//   const isAnythingLoading =
//     loading.users || loading.docs || loading.logs;

//   return (
//     <>
//       {/* Confirm Dialog */}
//       <ConfirmDialog
//         open={confirm.open}
//         message={confirm.message}
//         onConfirm={confirm.onConfirm}
//         onCancel={() => setConfirm(p => ({ ...p, open: false }))}
//       />

//       <div className="min-h-screen bg-slate-50 dark:bg-slate-950
//                       pb-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
//                         pt-8">

//           {/* ── Header ──────────────────────────────────────────── */}
//           <div className="flex flex-col sm:flex-row sm:items-center
//                           justify-between gap-4 mb-8">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <Shield className="w-5 h-5 text-sky-500" />
//                 <span className="text-xs font-bold uppercase
//                                  tracking-widest text-sky-500">
//                   Admin Console
//                 </span>
//               </div>
//               <h1 className="text-2xl sm:text-3xl font-extrabold
//                              text-slate-900 dark:text-white tracking-tight">
//                 Management Dashboard
//               </h1>
//             </div>

//             <div className="flex gap-2 shrink-0">
//               <Link to="/DocumentEditor">
//                 <Button className="bg-sky-500 hover:bg-sky-600
//                                    text-white rounded-xl px-4 h-10
//                                    font-semibold gap-2 shadow-lg
//                                    shadow-sky-500/25 text-sm">
//                   <Plus className="w-4 h-4" /> New Doc
//                 </Button>
//               </Link>
//               <Button
//                 variant="outline"
//                 onClick={() => refreshAll(true)}
//                 className="rounded-xl px-4 h-10 font-semibold
//                            border-slate-200 dark:border-slate-800
//                            bg-white dark:bg-slate-900 gap-2 text-sm"
//               >
//                 <RefreshCw className={`w-4 h-4 text-emerald-500
//                   ${isAnythingLoading ? 'animate-spin' : ''}`} />
//                 Refresh
//               </Button>
//             </div>
//           </div>

//           {/* ── Stats Grid ──────────────────────────────────────── */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
//             <AdminStatCard
//               label="Total Users"
//               value={stats.users}
//               icon={Users}
//               color="sky"
//               loading={loading.users}
//             />
//             <AdminStatCard
//               label="Total Documents"
//               value={stats.docs}
//               icon={FileText}
//               color="violet"
//               loading={loading.docs}
//             />
//             <AdminStatCard
//               label="Completed"
//               value={stats.completed}
//               icon={CheckCircle2}
//               color="emerald"
//               loading={loading.docs}
//             />
//             <AdminStatCard
//               label="In Progress"
//               value={stats.active}
//               icon={Clock}
//               color="amber"
//               loading={loading.docs}
//             />
//           </div>

//           {/* ── Tabs ────────────────────────────────────────────── */}
//           <Tabs
//             value={tab}
//             onValueChange={v => { setTab(v); setSearch(''); }}
//             className="space-y-5"
//           >
//             <div className="flex flex-col sm:flex-row gap-3
//                             items-stretch sm:items-center">
//               {/* Tab switcher */}
//               <TabsList className="bg-white dark:bg-slate-900
//                                    border border-slate-200
//                                    dark:border-slate-800
//                                    rounded-xl p-1 w-full sm:w-auto
//                                    grid grid-cols-3 sm:flex h-11
//                                    shadow-sm">
//                 <TabsTrigger
//                   value="users"
//                   className="rounded-lg text-xs font-bold
//                              uppercase tracking-wide gap-1.5"
//                 >
//                   <Users className="w-3.5 h-3.5" />
//                   Users
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="documents"
//                   className="rounded-lg text-xs font-bold
//                              uppercase tracking-wide gap-1.5"
//                 >
//                   <FileText className="w-3.5 h-3.5" />
//                   Docs
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="logs"
//                   className="rounded-lg text-xs font-bold
//                              uppercase tracking-wide gap-1.5"
//                 >
//                   <History className="w-3.5 h-3.5" />
//                   Logs
//                 </TabsTrigger>
//               </TabsList>

//               {/* Search */}
//               <div className="relative flex-1 sm:max-w-xs">
//                 <Search className="absolute left-3 top-1/2
//                                    -translate-y-1/2 w-4 h-4
//                                    text-slate-400 pointer-events-none" />
//                 <Input
//                   placeholder={`Search ${tab}...`}
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   className="pl-9 h-11 rounded-xl
//                              border-slate-200 dark:border-slate-700
//                              bg-white dark:bg-slate-900
//                              focus:border-sky-400 focus:ring-sky-400"
//                 />
//                 {loading[tab] && (
//                   <Loader2 className="absolute right-3 top-1/2
//                                       -translate-y-1/2 w-4 h-4
//                                       animate-spin text-sky-500" />
//                 )}
//               </div>
//             </div>

//             {/* ── USERS TAB ─────────────────────────────────────── */}
//             {tab === 'users' && (
//               <div className="bg-white dark:bg-slate-900 rounded-2xl
//                               border border-slate-100 dark:border-slate-800
//                               shadow-sm overflow-hidden">
//                 {loading.users && users.length === 0 ? (
//                   <div className="p-6 space-y-4">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <div key={i} className="flex items-center gap-4">
//                         <div className="w-10 h-10 rounded-full
//                                         bg-slate-100 dark:bg-slate-800
//                                         animate-pulse shrink-0" />
//                         <div className="flex-1 space-y-2">
//                           <div className="h-4 bg-slate-100 dark:bg-slate-800
//                                           rounded animate-pulse w-1/3" />
//                           <div className="h-3 bg-slate-100 dark:bg-slate-800
//                                           rounded animate-pulse w-1/2" />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : filteredUsers.length === 0 ? (
//                   <div className="py-16 text-center">
//                     <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
//                     <p className="text-slate-400 font-medium text-sm">
//                       No users found
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Desktop Table */}
//                     <div className="hidden sm:block overflow-x-auto">
//                       <table className="w-full">
//                         <thead>
//                           <tr className="border-b border-slate-100
//                                          dark:border-slate-800">
//                             <th className="text-left px-6 py-4 text-xs
//                                            font-bold uppercase tracking-wide
//                                            text-slate-400">
//                               User
//                             </th>
//                             <th className="text-left px-6 py-4 text-xs
//                                            font-bold uppercase tracking-wide
//                                            text-slate-400">
//                               Role
//                             </th>
//                             <th className="text-left px-6 py-4 text-xs
//                                            font-bold uppercase tracking-wide
//                                            text-slate-400">
//                               Joined
//                             </th>
//                             <th className="text-right px-6 py-4 text-xs
//                                            font-bold uppercase tracking-wide
//                                            text-slate-400">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50
//                                           dark:divide-slate-800">
//                           {filteredUsers.map(u => (
//                             <tr key={u._id}
//                                 className="hover:bg-slate-50
//                                            dark:hover:bg-slate-800/30
//                                            transition-colors">
//                               <td className="px-6 py-4">
//                                 <div className="flex items-center gap-3">
//                                   <div className="w-9 h-9 rounded-full
//                                                   bg-gradient-to-br
//                                                   from-sky-400 to-sky-600
//                                                   flex items-center
//                                                   justify-center
//                                                   text-white text-sm
//                                                   font-bold shrink-0">
//                                     {(u.full_name?.[0] || '?').toUpperCase()}
//                                   </div>
//                                   <div>
//                                     <p className="font-semibold text-sm
//                                                   text-slate-900 dark:text-white">
//                                       {u.full_name}
//                                     </p>
//                                     <p className="text-xs text-slate-400">
//                                       {u.email}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`inline-flex px-2.5 py-1
//                                                   rounded-lg text-xs font-bold
//                                                   uppercase ${
//                                   u.role === 'super_admin'
//                                     ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
//                                     : u.role === 'admin'
//                                       ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
//                                       : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
//                                 }`}>
//                                   {u.role}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 text-xs
//                                              text-slate-500 font-medium">
//                                 {safeDate(u.createdAt, 'dd MMM yyyy')}
//                               </td>
//                               <td className="px-6 py-4 text-right">
//                                 {u.role !== 'super_admin' && (
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     onClick={() => deleteUser(u._id)}
//                                     className="w-9 h-9 rounded-xl
//                                                text-slate-300
//                                                hover:text-red-500
//                                                hover:bg-red-50
//                                                dark:hover:bg-red-900/20"
//                                   >
//                                     <Trash2 className="w-4 h-4" />
//                                   </Button>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Mobile Cards */}
//                     <div className="sm:hidden divide-y divide-slate-100
//                                     dark:divide-slate-800">
//                       {filteredUsers.map(u => (
//                         <div key={u._id}
//                              className="px-4 py-4
//                                         hover:bg-slate-50
//                                         dark:hover:bg-slate-800/30">
//                           <div className="flex items-start
//                                           justify-between gap-3">
//                             <div className="flex items-center gap-3 flex-1 min-w-0">
//                               <div className="w-9 h-9 rounded-full
//                                               bg-gradient-to-br
//                                               from-sky-400 to-sky-600
//                                               flex items-center
//                                               justify-center text-white
//                                               text-sm font-bold shrink-0">
//                                 {(u.full_name?.[0] || '?').toUpperCase()}
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="font-semibold text-sm
//                                               text-slate-900 dark:text-white
//                                               truncate">
//                                   {u.full_name}
//                                 </p>
//                                 <p className="text-xs text-slate-400 truncate">
//                                   {u.email}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2 shrink-0">
//                               <span className="text-xs font-bold
//                                                bg-slate-100 dark:bg-slate-800
//                                                text-slate-600 dark:text-slate-400
//                                                px-2 py-1 rounded-lg uppercase">
//                                 {u.role}
//                               </span>
//                               {u.role !== 'super_admin' && (
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   onClick={() => deleteUser(u._id)}
//                                   className="w-8 h-8 rounded-xl
//                                              text-slate-300
//                                              hover:text-red-500
//                                              hover:bg-red-50"
//                                 >
//                                   <Trash2 className="w-4 h-4" />
//                                 </Button>
//                               )}
//                             </div>
//                           </div>
//                           <p className="text-xs text-slate-400 mt-2 ml-12">
//                             Joined {safeDate(u.createdAt, 'dd MMM yyyy')}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}

//             {/* ── DOCUMENTS TAB ─────────────────────────────────── */}
//             {tab === 'documents' && (
//               <div className="space-y-4">
//                 {loading.docs && documents.length === 0 ? (
//                   Array.from({ length: 3 }).map((_, i) => (
//                     <div key={i}
//                          className="bg-white dark:bg-slate-900 rounded-2xl
//                                     border border-slate-100 dark:border-slate-800
//                                     p-6 animate-pulse">
//                       <div className="h-5 bg-slate-100 dark:bg-slate-800
//                                       rounded w-1/3 mb-3" />
//                       <div className="h-4 bg-slate-100 dark:bg-slate-800
//                                       rounded w-1/2" />
//                     </div>
//                   ))
//                 ) : filteredDocs.length === 0 ? (
//                   <div className="bg-white dark:bg-slate-900 rounded-2xl
//                                   border border-slate-100 dark:border-slate-800
//                                   py-16 text-center">
//                     <FileText className="w-10 h-10 text-slate-200
//                                          mx-auto mb-3" />
//                     <p className="text-slate-400 font-medium text-sm">
//                       No documents found
//                     </p>
//                   </div>
//                 ) : (
//                   filteredDocs.map(d => (
//                     <div key={d._id}
//                          className="bg-white dark:bg-slate-900 rounded-2xl
//                                     border border-slate-100 dark:border-slate-800
//                                     shadow-sm overflow-hidden
//                                     hover:shadow-md transition-shadow">
//                       {/* Doc Header */}
//                       <div className="flex flex-col sm:flex-row
//                                       sm:items-center justify-between
//                                       gap-3 p-5 pb-4
//                                       border-b border-slate-50
//                                       dark:border-slate-800">
//                         <div className="min-w-0">
//                           <h3 className="font-bold text-slate-900
//                                          dark:text-white truncate mb-1">
//                             {d.title}
//                           </h3>
//                           <div className="flex flex-wrap items-center
//                                           gap-3 text-xs text-slate-400 font-medium">
//                             <span className="flex items-center gap-1.5">
//                               <Users className="w-3.5 h-3.5 text-sky-400" />
//                               {d.owner?.full_name || 'System'}
//                             </span>
//                             <span className="flex items-center gap-1.5">
//                               <Calendar className="w-3.5 h-3.5 text-sky-400" />
//                               {safeDate(d.createdAt, 'dd MMM yyyy')}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 shrink-0">
//                           <span className={`text-xs font-bold px-3 py-1.5
//                                             rounded-xl uppercase tracking-wide
//                                             ${STATUS_STYLE[d.status] || STATUS_STYLE.draft}`}>
//                             {d.status?.replace('_', ' ')}
//                           </span>

//                           {d.signedFileUrl && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() =>
//                                 window.open(d.signedFileUrl, '_blank')
//                               }
//                               className="h-8 px-3 rounded-xl text-xs
//                                          font-semibold gap-1.5"
//                             >
//                               <Eye className="w-3.5 h-3.5" />
//                               View
//                             </Button>
//                           )}

//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => deleteDoc(d._id)}
//                             className="w-8 h-8 rounded-xl text-slate-300
//                                        hover:text-red-500 hover:bg-red-50
//                                        dark:hover:bg-red-900/20"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>

//                       {/* Parties */}
//                       {d.parties?.length > 0 && (
//                         <div className="p-5 pt-4 grid sm:grid-cols-2
//                                         lg:grid-cols-3 gap-3">
//                           {d.parties.map((p, i) => (
//                             <div key={i}
//                                  className="bg-slate-50 dark:bg-slate-950/40
//                                             rounded-xl p-3
//                                             border border-slate-100
//                                             dark:border-slate-800">
//                               <div className="flex items-center
//                                               justify-between mb-2">
//                                 <p className="font-semibold text-sm
//                                               text-slate-800 dark:text-slate-200
//                                               truncate">
//                                   {p.name}
//                                 </p>
//                                 <span className={`text-xs font-bold px-2 py-0.5
//                                                   rounded-lg
//                                                   ${STATUS_STYLE[p.status] || STATUS_STYLE.pending}`}>
//                                   {p.status}
//                                 </span>
//                               </div>
//                               <div className="space-y-1 text-xs text-slate-400">
//                                 {p.ip && (
//                                   <p className="truncate">
//                                     IP: {p.ip}
//                                   </p>
//                                 )}
//                                 {p.location && (
//                                   <p className="truncate">
//                                     📍 {p.location}
//                                   </p>
//                                 )}
//                                 {p.signedAt && (
//                                   <p>✅ {safeDate(p.signedAt)}</p>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}

//             {/* ── AUDIT LOGS TAB ────────────────────────────────── */}
//             {tab === 'logs' && (
//               <div className="bg-white dark:bg-slate-900 rounded-2xl
//                               border border-slate-100 dark:border-slate-800
//                               shadow-sm overflow-hidden">
//                 {loading.logs && logs.length === 0 ? (
//                   <div className="p-6 space-y-3">
//                     {Array.from({ length: 6 }).map((_, i) => (
//                       <div key={i}
//                            className="h-12 bg-slate-50 dark:bg-slate-800
//                                       rounded-xl animate-pulse" />
//                     ))}
//                   </div>
//                 ) : filteredLogs.length === 0 ? (
//                   <div className="py-16 text-center">
//                     <History className="w-10 h-10 text-slate-200
//                                         mx-auto mb-3" />
//                     <p className="text-slate-400 font-medium text-sm">
//                       No audit logs found
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="p-4 border-b border-slate-100
//                                     dark:border-slate-800 flex
//                                     items-center gap-2">
//                       <History className="w-5 h-5 text-sky-500" />
//                       <h3 className="font-bold text-slate-900 dark:text-white">
//                         Audit Trail
//                       </h3>
//                       <span className="ml-auto text-xs text-slate-400
//                                        bg-slate-100 dark:bg-slate-800
//                                        px-2 py-1 rounded-lg font-medium">
//                         Page {logPage}
//                       </span>
//                     </div>

//                     {/* Desktop */}
//                     <div className="hidden sm:block overflow-x-auto">
//                       <table className="w-full">
//                         <thead>
//                           <tr className="border-b border-slate-100
//                                          dark:border-slate-800">
//                             {['Performed By', 'Action', 'Time', 'Status'].map(h => (
//                               <th key={h}
//                                   className={`px-6 py-4 text-xs font-bold
//                                               uppercase tracking-wide
//                                               text-slate-400
//                                               ${h === 'Status' ? 'text-right' : 'text-left'}`}>
//                                 {h}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50
//                                           dark:divide-slate-800">
//                           {filteredLogs.map((log, i) => (
//                             <tr key={log._id || i}
//                                 className="hover:bg-slate-50
//                                            dark:hover:bg-slate-800/30
//                                            transition-colors">
//                               <td className="px-6 py-4">
//                                 <p className="font-semibold text-sm
//                                               text-slate-900 dark:text-white">
//                                   {log.performed_by?.name || 'System'}
//                                 </p>
//                                 <p className="text-xs text-slate-400 truncate
//                                               max-w-[200px]">
//                                   {log.performed_by?.email || '—'}
//                                 </p>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`text-xs font-bold px-2.5 py-1
//                                                   rounded-lg uppercase
//                                                   ${
//                                   log.action === 'signed' || log.action === 'completed'
//                                     ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
//                                     : log.action === 'sent'
//                                       ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
//                                       : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
//                                 }`}>
//                                   {log.action}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 text-xs
//                                              text-slate-500 font-medium">
//                                 {safeDate(log.timestamp || log.createdAt)}
//                               </td>
//                               <td className="px-6 py-4 text-right">
//                                 <div className="w-2 h-2 rounded-full
//                                                 bg-emerald-500 inline-block
//                                                 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Mobile */}
//                     <div className="sm:hidden divide-y divide-slate-100
//                                     dark:divide-slate-800">
//                       {filteredLogs.map((log, i) => (
//                         <div key={log._id || i} className="px-4 py-3">
//                           <div className="flex items-center
//                                           justify-between gap-2 mb-1">
//                             <p className="font-semibold text-sm
//                                           text-slate-900 dark:text-white">
//                               {log.performed_by?.name || 'System'}
//                             </p>
//                             <span className="text-xs font-bold px-2 py-0.5
//                                              rounded-lg uppercase
//                                              bg-slate-100 dark:bg-slate-800
//                                              text-slate-600 dark:text-slate-400">
//                               {log.action}
//                             </span>
//                           </div>
//                           <p className="text-xs text-slate-400">
//                             {safeDate(log.timestamp || log.createdAt)}
//                           </p>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Pagination */}
//                     <div className="flex items-center justify-between
//                                     p-4 border-t border-slate-100
//                                     dark:border-slate-800">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => fetchLogs(logPage - 1)}
//                         disabled={logPage === 1}
//                         className="rounded-xl gap-2"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                         Prev
//                       </Button>
//                       <span className="text-xs font-bold
//                                        text-slate-500 uppercase tracking-wide">
//                         Page {logPage}
//                       </span>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => fetchLogs(logPage + 1)}
//                         disabled={!hasMoreLogs}
//                         className="rounded-xl gap-2"
//                       >
//                         Next
//                         <ChevronRight className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </Tabs>
//         </div>
//       </div>
//     </>
//   );
// }
/**
 * AdminDashboard.jsx — NeXsign Enterprise
 * Optimized: 30s polling (was 10s), separate loading per tab, AbortController
 */// src/pages/AdminDashboard.jsx
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { format, isValid } from 'date-fns';
import { toast } from 'sonner';
import {
  Shield, Users, Clock, Search, Trash2, Loader2,
  Activity, ChevronLeft, ChevronRight, Calendar, Plus,
  History, FileText, RefreshCw, AlertTriangle, CheckCircle,
  XCircle, Database, BarChart3, Eye,
} from 'lucide-react';

// ─── tiny helpers (no shadcn dep) ────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

const Badge = ({ children, className }) => (
  <span className={cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
    className,
  )}>
    {children}
  </span>
);

// ─── SEO ─────────────────────────────────────────────────────────────────────
const SEO = ({ title, noIndex }) => {
  useEffect(() => {
    document.title = title;
    if (noIndex) {
      let m = document.querySelector('meta[name="robots"]');
      if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
      m.content = 'noindex,nofollow';
    }
  }, [title, noIndex]);
  return null;
};

// ─── Skeleton primitives ──────────────────────────────────────────────────────
const Pulse = ({ className }) => (
  <div className={cn('animate-pulse rounded bg-slate-200 dark:bg-slate-700/60', className)} />
);

const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-5 px-4">
        <Pulse className={cn('h-4', i === 0 ? 'w-40' : 'w-24')} />
        {i === 0 && <Pulse className="h-3 w-28 mt-1.5" />}
      </td>
    ))}
  </tr>
);

const CardSkeleton = () => (
  <div className="animate-pulse p-5 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl">
    <div className="flex justify-between items-start mb-6 pb-6 border-b dark:border-slate-800">
      <div className="space-y-2">
        <Pulse className="h-6 w-48" />
        <Pulse className="h-4 w-64" />
      </div>
      <Pulse className="h-10 w-24 rounded-2xl" />
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Pulse className="h-24 rounded-2xl" />
      <Pulse className="h-24 rounded-2xl" />
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-md border border-slate-100 dark:border-slate-800">
    <Pulse className="h-10 w-10 rounded-xl mb-4" />
    <Pulse className="h-8 w-20 mb-2" />
    <Pulse className="h-4 w-28" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, loading }) => {
  const colorMap = {
    sky:     'bg-sky-50 text-sky-600 dark:bg-sky-900/30',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-900/30',
  };
  if (loading) return <StatCardSkeleton />;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', colorMap[color])}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ open, onConfirm, onCancel, label }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800"
      >
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white text-center mb-2">
          Confirm Delete
        </h3>
        <p className="text-sm text-slate-400 text-center mb-8">
          {label} This action <span className="font-black text-red-500">cannot be undone</span>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-sm font-black text-white transition-colors shadow-lg shadow-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-300">
    <Icon size={40} strokeWidth={1.5} />
    <p className="text-xs font-black uppercase tracking-widest">{message}</p>
  </div>
);

// ─── Status badge helper ──────────────────────────────────────────────────────
const statusCfg = {
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  pending:   { label: 'Pending',   cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400'  },
  declined:  { label: 'Declined',  cls: 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-400'    },
  draft:     { label: 'Draft',     cls: 'bg-slate-100  text-slate-600  dark:bg-slate-800     dark:text-slate-400'  },
};
const StatusBadge = ({ status }) => {
  const cfg = statusCfg[status] || statusCfg.draft;
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
};

// ─── TABS config ──────────────────────────────────────────────────────────────
const TABS = [
  { val: 'users',     label: 'Users'      },
  { val: 'documents', label: 'Documents'  },
  { val: 'logs',      label: 'Audit Logs' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate  = useNavigate();
  const timerRef  = useRef(null);

  const [tab, setTab]       = useState('users');
  const [search, setSearch] = useState('');

  // data
  const [users,     setUsers]     = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs,      setLogs]      = useState([]);

  // loading
  const [loading, setLoading] = useState({ users: true, docs: true, logs: true });

  // pagination (logs)
  const [logPage,    setLogPage]    = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, label }

  // refresh countdown
  const [refreshIn, setRefreshIn] = useState(30);

  // ── date helper ─────────────────────────────────────────────────────────────
  const safeFormat = (d, f = 'hh:mm aa, d MMM yyyy') => {
    if (!d) return 'N/A';
    const dt = new Date(d);
    return isValid(dt) ? format(dt, f) : 'N/A';
  };

  // ── fetchers ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(p => ({ ...p, users: true }));
    try {
      const res  = await api.get('/admin/users');
      const data = Array.isArray(res.data) ? res.data : (res.data?.users ?? []);
      setUsers(data);
    } catch {
      /* silent — toast only on manual refresh */
    } finally {
      setLoading(p => ({ ...p, users: false }));
    }
  }, []);

  const fetchDocs = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(p => ({ ...p, docs: true }));
    try {
      const res  = await api.get('/admin/documents');
      const data = Array.isArray(res.data) ? res.data : (res.data?.documents ?? []);
      setDocuments([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { /* silent */ } finally {
      setLoading(p => ({ ...p, docs: false }));
    }
  }, []);

  const fetchLogs = useCallback(async (pageNo = 1, showLoading = true) => {
    if (showLoading) setLoading(p => ({ ...p, logs: true }));
    try {
      const res     = await api.get(`/admin/audit-logs?page=${pageNo}&limit=15`);
      const logData = res.data?.logs ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      setLogs(logData);
      setHasMoreLogs(logData.length >= 15);
      setLogPage(pageNo);
    } catch { /* silent */ } finally {
      setLoading(p => ({ ...p, logs: false }));
    }
  }, []);

  const refreshAll = useCallback((showLoading = false) => {
    fetchUsers(showLoading);
    fetchDocs(showLoading);
    fetchLogs(1, showLoading);
    setRefreshIn(30);
  }, [fetchUsers, fetchDocs, fetchLogs]);

  // ── countdown + auto-refresh ─────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    // initial load
    fetchUsers(true);
    fetchDocs(true);
    fetchLogs(1, true);

    // countdown tick
    const tick = setInterval(() => {
      setRefreshIn(n => {
        if (n <= 1) { refreshAll(false); return 30; }
        return n - 1;
      });
    }, 1000);

    timerRef.current = tick;
    return () => clearInterval(tick);
  }, [authLoading, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── redirect if not admin ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/dashboard', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  // ── filtered lists ────────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredUsers = useMemo(() => users.filter(u =>
    !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
  ), [users, q]);

  const filteredDocs = useMemo(() => documents.filter(d =>
    !q || d.title?.toLowerCase().includes(q),
  ), [documents, q]);

  const filteredLogs = useMemo(() => logs.filter(l =>
    !q ||
    l.action?.toLowerCase().includes(q) ||
    l.performed_by?.email?.toLowerCase().includes(q) ||
    l.performed_by?.name?.toLowerCase().includes(q),
  ), [logs, q]);

  // ── delete helpers ────────────────────────────────────────────────────────────
  const confirmDelete = (type, id, label) => setDeleteTarget({ type, id, label });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);

    // optimistic remove
    if (type === 'user') {
      setUsers(prev => prev.filter(u => u._id !== id));
    } else {
      setDocuments(prev => prev.filter(d => d._id !== id));
    }

    try {
      await api.delete(`/admin/${type === 'user' ? 'users' : 'documents'}/${id}`);
      toast.success(type === 'user' ? 'User deleted' : 'Document removed');
    } catch (err) {
      toast.error('Delete failed — restoring…');
      // rollback
      if (type === 'user') fetchUsers(false);
      else fetchDocs(false);
    }
  };

  // ── manual refresh ────────────────────────────────────────────────────────────
  const handleManualRefresh = () => {
    setLoading({ users: true, docs: true, logs: true });
    refreshAll(true);
    toast.success('Data refreshed');
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // AUTH LOADING SCREEN
  // ══════════════════════════════════════════════════════════════════════════════
  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-sky-600 w-10 h-10" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Admin…</p>
    </div>
  );

  const anyLoading = loading.users || loading.docs || loading.logs;
  const tabLoading = tab === 'users' ? loading.users : tab === 'documents' ? loading.docs : loading.logs;

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <SEO title="Admin Console — NexSign" noIndex />

      <DeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        label={deleteTarget?.label}
      />

      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 md:px-8 py-8">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="text-sky-600 w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">
                  Admin Environment
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Management Console
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Logged in as&nbsp;
                <span className="font-bold text-slate-600 dark:text-slate-300">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* refresh countdown pill */}
              <div className="flex items-center gap-1.5 px-4 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={13} className="text-sky-400" />
                Auto-refresh in {refreshIn}s
              </div>

              <button
                onClick={handleManualRefresh}
                className="flex items-center gap-2 px-5 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <RefreshCw size={15} className={cn('text-emerald-500', anyLoading && 'animate-spin')} />
                Refresh
              </button>

              <Link to="/document-editor">
                <button className="flex items-center gap-2 px-6 h-10 rounded-2xl bg-sky-600 hover:bg-sky-700 text-sm font-black text-white transition-colors shadow-lg shadow-sky-500/25">
                  <Plus size={16} /> New Doc
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stats row ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users}    label="Total Users"     value={users.length}     color="sky"     loading={loading.users} />
            <StatCard icon={FileText} label="Total Documents" value={documents.length} color="emerald" loading={loading.docs}  />
            <StatCard icon={History}  label="Audit Events"    value={logs.length}      color="violet"  loading={loading.logs}  />
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-[1.5rem] w-full md:w-fit border border-slate-200 dark:border-slate-800">
            {TABS.map(t => (
              <button
                key={t.val}
                onClick={() => { setTab(t.val); setSearch(''); }}
                className={cn(
                  'px-7 md:px-10 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all',
                  tab === t.val
                    ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-md'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Search bar ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm h-14">
            <Search size={16} className="text-slate-300 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Search ${tab}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent h-full text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 outline-none"
            />
            {tabLoading && <Loader2 size={16} className="animate-spin text-sky-400 flex-shrink-0" />}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs font-black text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-wider flex-shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              TAB: USERS
          ══════════════════════════════════════════════════════════════════ */}
          {tab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800">
                      {['User', 'Role', 'Joined', 'Action'].map(h => (
                        <th key={h} className={cn('py-5 px-6', h === 'Action' && 'text-right')}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {loading.users
                      ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                      : filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group">
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                {/* avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                                  {u.full_name?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                    {u.full_name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 leading-tight">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <Badge className={cn(
                                'border',
                                u.role === 'super_admin'
                                  ? 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:border-violet-800'
                                  : u.role === 'admin'
                                    ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:border-sky-800'
                                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
                              )}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-5 px-6 text-[11px] font-bold text-slate-500">
                              {safeFormat(u.createdAt, 'd MMM, yyyy')}
                            </td>
                            <td className="py-5 px-6 text-right">
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => confirmDelete('user', u._id, `Delete "${u.full_name}"?`)}
                                  className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-flex items-center justify-center"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {loading.users
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 animate-pulse flex gap-3">
                        <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <Pulse className="h-4 w-32" />
                          <Pulse className="h-3 w-44" />
                        </div>
                      </div>
                    ))
                  : filteredUsers.map(u => (
                      <div key={u._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                              {u.full_name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{u.full_name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800">{u.role}</Badge>
                            {u.role !== 'super_admin' && (
                              <button
                                onClick={() => confirmDelete('user', u._id, `Delete "${u.full_name}"?`)}
                                className="h-8 w-8 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 ml-12">
                          Joined {safeFormat(u.createdAt, 'd MMM, yyyy')}
                        </p>
                      </div>
                    ))}
              </div>

              {!loading.users && filteredUsers.length === 0 && (
                <EmptyState icon={Users} message="No users found" />
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB: DOCUMENTS
          ══════════════════════════════════════════════════════════════════ */}
          {tab === 'documents' && (
            <div className="space-y-5">
              {loading.docs
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : filteredDocs.length === 0
                  ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                      <EmptyState icon={FileText} message="No documents found" />
                    </div>
                  )
                  : filteredDocs.map(d => (
                      <div
                        key={d._id}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-5 md:p-8 hover:shadow-2xl transition-shadow"
                      >
                        {/* doc header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1.5 truncate">
                              {d.title}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Users size={11} className="text-sky-500" />
                                {d.owner?.full_name || d.owner?.name || 'System'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-sky-500" />
                                {safeFormat(d.createdAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users size={11} className="text-violet-400" />
                                {d.parties?.length ?? 0} parties
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                            {d.fileUrl && (
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-10 px-4 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-xs font-black hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                              >
                                <Eye size={13} /> View PDF
                              </a>
                            )}
                            <StatusBadge status={d.status} />
                            <button
                              onClick={() => confirmDelete('doc', d._id, `Remove "${d.title}"?`)}
                              className="h-10 w-10 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-flex items-center justify-center flex-shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* parties grid */}
                        {d.parties?.length > 0 && (
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {d.parties.map((p, i) => (
                              <div
                                key={i}
                                className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm truncate flex-1 mr-2">
                                    {p.name}
                                  </span>
                                  <Badge className={cn(
                                    p.status === 'signed'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                  )}>
                                    {p.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                  <div>
                                    <span className="block text-slate-300 mb-0.5">IP</span>
                                    <span className="text-slate-600 dark:text-slate-300 truncate block">
                                      {p.ipAddress || '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-300 mb-0.5">Location</span>
                                    <span className="text-slate-600 dark:text-slate-300 truncate block">
                                      {p.location || '—'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB: AUDIT LOGS
          ══════════════════════════════════════════════════════════════════ */}
          {tab === 'logs' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">

              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <History className="text-sky-500" size={20} />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Audit Trail
                </h3>
                <Badge className="ml-auto bg-slate-100 text-slate-500 dark:bg-slate-800">
                  Page {logPage}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[560px]">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      {['Performed By', 'Action', 'Timestamp', 'Status'].map(h => (
                        <th key={h} className={cn('py-4 px-6', h === 'Status' && 'text-right')}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {loading.logs
                      ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                      : filteredLogs.map((log, i) => (
                          <tr
                            key={log._id || i}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                {log.performed_by?.name || log.signerName || 'System'}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                {log.performed_by?.email || 'automated@system'}
                              </p>
                            </td>
                            <td className="py-5 px-6">
                              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                                {log.action?.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="py-5 px-6 text-[11px] font-bold text-slate-500">
                              {safeFormat(log.timestamp || log.createdAt)}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                OK
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {!loading.logs && filteredLogs.length === 0 && (
                <EmptyState icon={History} message="No audit events found" />
              )}

              {/* Pagination */}
              <div className="px-6 md:px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing {filteredLogs.length} events
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(logPage - 1, true)}
                    disabled={logPage === 1}
                    className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                  >
                    <ChevronLeft size={16} className="text-slate-500" />
                  </button>
                  <button
                    onClick={() => fetchLogs(logPage + 1, true)}
                    disabled={!hasMoreLogs}
                    className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                  >
                    <ChevronRight size={16} className="text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>{/* /max-w wrapper */}
      </div>{/* /page */}
    </>
  );
}