// src/pages/DocumentEditor.jsx
import React, {
  useState, useEffect, useCallback,
  useMemo, useRef,
} from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Upload, Send, ArrowLeft, FileText,
  Loader2, Mail, Trash2, ImagePlus,
  ChevronRight, CheckCircle2, Users,
  PenTool, AlertCircle, Building2,
  Eye, RotateCcw,
} from 'lucide-react';
import PartyManager         from '@/components/editor/PartyManager';
import FieldToolbar         from '@/components/editor/FieldToolbar';
import PdfViewer            from '@/components/editor/PdfViewer';
import FieldPropertiesPanel from '@/components/editor/FieldPropertiesPanel';
import { useFieldAutoSave } from '@/hooks/useFieldAutoSave';

const STEPS = [
  { id: 1, label: 'Upload',  desc: 'PDF & Branding',  icon: Upload       },
  { id: 2, label: 'Signers', desc: 'Signing Parties', icon: Users        },
  { id: 3, label: 'CC',      desc: 'Carbon Copy',     icon: Mail         },
  { id: 4, label: 'Fields',  desc: 'Place Fields',    icon: PenTool      },
  { id: 5, label: 'Review',  desc: 'Finalize & Send', icon: CheckCircle2 },
];

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function revokeBlob(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

// ─── StepProgress ─────────────────────────────────────────────────
function StepProgress({ current, onStepClick, maxReached }) {
  return (
    <div className="hidden lg:flex items-center gap-0">
      {STEPS.map((s, idx) => {
        const done   = current > s.id;
        const active = current === s.id;
        const canGo  = s.id <= maxReached;
        const Icon   = s.icon;
        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              disabled={!canGo}
              onClick={() => canGo && onStepClick(s.id)}
              className={`flex flex-col items-center gap-1.5
                          transition-all duration-200
                          ${canGo
                            ? 'cursor-pointer'
                            : 'cursor-default opacity-40'
                          }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center
                              justify-center transition-all duration-200
                ${done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-[#28ABDF] text-white shadow-md shadow-sky-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <Icon className="w-3.5 h-3.5" />
                }
              </div>
              <span className={`text-[9px] font-semibold tracking-wide
                               whitespace-nowrap transition-colors
                ${active
                  ? 'text-[#28ABDF]'
                  : done
                    ? 'text-emerald-500'
                    : 'text-slate-400'
                }`}>
                {s.label}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className={`w-10 h-px mx-1 mb-5 rounded-full
                              transition-all duration-500
                ${current > s.id
                  ? 'bg-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconBg, iconColor, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center
                      justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800
                       dark:text-white leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── ReviewRow ────────────────────────────────────────────────────
function ReviewRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between py-3
                    border-b border-slate-50 dark:border-slate-700/60
                    last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-semibold text-slate-800
                        dark:text-white text-right max-w-[60%]
                        truncate ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────
function DocLoadingSkeleton() {
  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950
                    overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-[360px] border-r border-slate-200
                      dark:border-slate-800 bg-white
                      dark:bg-slate-900 p-6 space-y-4 shrink-0">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700
                        rounded-xl animate-pulse" />
        <div className="h-44 w-full bg-slate-100 dark:bg-slate-800
                        rounded-2xl animate-pulse" />
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-800
                        rounded-xl animate-pulse" />
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-800
                        rounded-xl animate-pulse" />
        <div className="h-10 w-2/3 bg-slate-100 dark:bg-slate-800
                        rounded-xl animate-pulse" />
      </div>
      {/* PDF area skeleton */}
      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-2xl h-[800px] bg-slate-200
                        dark:bg-slate-800 rounded-2xl animate-pulse
                        flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function DocumentEditor() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { id: pathId } = useParams();
  const { user }       = useAuth();

  // ── Resolve doc ID ─────────────────────────────────────────
  const docId = useMemo(() => {
    if (pathId && pathId !== 'new') return pathId;
    const q = new URLSearchParams(location.search).get('id');
    return q === 'new' ? null : q;
  }, [pathId, location.search]);

  // ── Wizard ─────────────────────────────────────────────────
  const [step,       setStep]       = useState(1);
  const [maxReached, setMaxReached] = useState(1);

  // ── Core ───────────────────────────────────────────────────
  const [rawFile,   setRawFile]   = useState(null);
  const [title,     setTitle]     = useState('');
  const [fileUrl,   setFileUrl]   = useState('');
  const [fileReady, setFileReady] = useState(false);
  const [parties,   setParties]   = useState([{
    name:  user?.full_name || '',
    email: user?.email     || '',
    order: 0, status: 'pending', color: '#0ea5e9',
  }]);
  const [fields,  setFields]  = useState([]);
  const [ccList,  setCcList]  = useState([]);

  // ── Branding ───────────────────────────────────────────────
  const [companyLogo,        setCompanyLogo]        = useState('');
  const [companyLogoFile,    setCompanyLogoFile]    = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [companyName,        setCompanyName]        = useState('');

  // ── CC form ────────────────────────────────────────────────
  const [ccForm, setCcForm] = useState({
    name: '', email: '', designation: '',
  });

  // ── Editor ─────────────────────────────────────────────────
  const [currentPage,        setCurrentPage]       = useState(1);
  const [totalPages,         setTotalPages]         = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex]= useState(0);
  const [pendingFieldType,   setPendingFieldType]  = useState(null);
  const [processing,         setProcessing]        = useState(false);
  const [selectedFieldId,    setSelectedFieldId]   = useState(null);
  const [docLoading,         setDocLoading]        = useState(false);
  const [editorFontFamily,   setEditorFontFamily]  = useState('Helvetica');
  const [editorFontSize,     setEditorFontSize]    = useState(14);
  const [saveStatus,         setSaveStatus]        = useState('idle');

  // Mobile panel toggle
  const [mobilePanelView, setMobilePanelView] = useState('sidebar');

  const { save, saveNow } = useFieldAutoSave(docId);

  // ── Refs ───────────────────────────────────────────────────
  const fileUrlRef     = useRef(fileUrl);
  const logoPreviewRef = useRef(companyLogoPreview);
  const mountedRef     = useRef(true);

  useEffect(() => { fileUrlRef.current     = fileUrl;           }, [fileUrl]);
  useEffect(() => { logoPreviewRef.current = companyLogoPreview;}, [companyLogoPreview]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      revokeBlob(fileUrlRef.current);
      revokeBlob(logoPreviewRef.current);
    };
  }, []);

  // ── Selected field ─────────────────────────────────────────
  const selectedField = useMemo(
    () => fields.find(f => f.id === selectedFieldId),
    [fields, selectedFieldId],
  );

  // ── Load existing doc ──────────────────────────────────────
  useEffect(() => {
    if (!docId) return;
    setDocLoading(true);
    api.get(`/documents/${docId}`)
      .then(res => {
        if (!mountedRef.current) return;
        const d = res.data.document || res.data;
        setTitle(d.title || '');
        setFileUrl(d.fileUrl || '');
        setFileReady(!!d.fileUrl);
        setParties(
          d.parties?.length
            ? d.parties
            : [{
                name:  user?.full_name || '',
                email: user?.email     || '',
                order: 0, status: 'pending', color: '#0ea5e9',
              }],
        );
        setCcList(d.ccList || []);
        setCompanyLogo(d.companyLogo || '');
        setCompanyLogoPreview(d.companyLogo || '');
        setCompanyName(d.companyName || '');
        setFields(
          (d.fields || []).map(f =>
            typeof f === 'string' ? JSON.parse(f) : f,
          ),
        );
        setMaxReached(d.fileUrl ? 4 : 1);
      })
      .catch(() => toast.error('Failed to load document.'))
      .finally(() => {
        if (mountedRef.current) setDocLoading(false);
      });
  }, [docId]); // eslint-disable-line

  // ── File select ────────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF must be under 20 MB.');
      return;
    }
    revokeBlob(fileUrlRef.current);
    const url = URL.createObjectURL(file);
    setRawFile(file);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    setFileUrl(url);
    setFileReady(true);
    setFields([]);
    setCurrentPage(1);
    e.target.value = '';
  }, []);

  const handleLogoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeBlob(logoPreviewRef.current);
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  }, []);

  // ── CC ─────────────────────────────────────────────────────
  const addCc = useCallback(() => {
    const email = ccForm.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (ccList.some(c => c.email === email)) {
      toast.error('This email is already in the CC list.');
      return;
    }
    setCcList(prev => [...prev, {
      email,
      name:        ccForm.name.trim(),
      designation: ccForm.designation.trim(),
    }]);
    setCcForm({ name: '', email: '', designation: '' });
  }, [ccForm, ccList]);

  const removeCc = useCallback((idx) => {
    setCcList(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateSelectedField = useCallback((patch) => {
    if (!selectedFieldId) return;
    setFields(prev =>
      prev.map(f =>
        f.id === selectedFieldId ? { ...f, ...patch } : f,
      ),
    );
  }, [selectedFieldId]);

  const removeField = useCallback((id) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [selectedFieldId]);

  // ── Auto-save fields for existing documents ────────────────
  useEffect(() => {
    if (!docId || step !== 4) return;
    setSaveStatus('pending');
    save(fields);
    const t = setTimeout(() => setSaveStatus('saved'), 1600);
    return () => clearTimeout(t);
  }, [fields, docId, step, save]);

  // ── Step navigation ────────────────────────────────────────
  const goToStep = useCallback((target) => {
    setStep(target);
    setMaxReached(prev => Math.max(prev, target));
  }, []);

  const nextStep = useCallback(() => {
    if (step === 1) {
      if (!fileUrl)      return toast.error('Please upload a PDF first.');
      if (!title.trim()) return toast.error('Please enter a document title.');
    }
    if (step === 2) {
      if (!parties.length)
        return toast.error('Add at least one signer.');
      if (parties.some(p => !p.name?.trim() || !p.email?.trim()))
        return toast.error('All signers need a name and email.');
      if (parties.some(p => !isValidEmail(p.email)))
        return toast.error('One or more signer emails are invalid.');
    }
    if (step === 4 && !fields.length) {
      toast.error('Place at least one field on the PDF.');
      return;
    }
    if (step < 5) goToStep(step + 1);
  }, [step, fileUrl, title, parties, fields, goToStep]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep(s => s - 1);
  }, [step]);

  // ── Validate ───────────────────────────────────────────────
  const validate = useCallback(() => {
    if (!fileUrl)        { toast.error('No PDF uploaded.');            return false; }
    if (!title.trim())   { toast.error('Document title is required.'); return false; }
    if (!parties.length) { toast.error('Add at least one signer.');    return false; }
    if (parties.some(p => !p.name?.trim() || !p.email?.trim())) {
      toast.error('All signers need a name and email.');
      return false;
    }
    if (!fields.length)  { toast.error('Place at least one field.');   return false; }
    return true;
  }, [fileUrl, title, parties, fields]);

  // ── SEND ───────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!validate()) return;
    setProcessing(true);

    try {
      if (docId) await saveNow(fields);

      // ── Step 1: Logo upload (যদি নতুন file থাকে) ─────────
      let finalLogoUrl = companyLogo;

      if (companyLogoFile) {
        try {
          const lf = new FormData();
          lf.append('logo', companyLogoFile);
          const lr = await api.post('/documents/upload-logo', lf);
          if (lr.data?.logoUrl) {
            finalLogoUrl = lr.data.logoUrl;
          }
        } catch (logoErr) {
          // Logo upload fail হলেও document send চলবে
          console.error('[logo upload]', logoErr);
          toast.warning('Logo upload failed, continuing without logo.');
          finalLogoUrl = '';
        }
      }

      // ── Step 2: Build FormData ────────────────────────────
      const formData = new FormData();

      // PDF file (নতুন upload হলে)
      if (rawFile) {
        formData.append('file', rawFile);
      }

      // Document data
      formData.append('title',       title.trim());
      formData.append('parties',     JSON.stringify(parties));
      formData.append('fields',      JSON.stringify(fields));
      formData.append('ccList',      JSON.stringify(ccList));   // ← FIXED: 'ccList'
      formData.append('totalPages',  String(totalPages));
      formData.append('companyName', companyName.trim());
      formData.append('companyLogo', finalLogoUrl || '');

      // Existing doc ID
      if (docId && docId !== 'undefined' && docId !== 'null') {
        formData.append('docId', docId);
      }

      // ── Step 3: Send ──────────────────────────────────────
      await api.post('/documents/upload-and-send', formData);

      toast.success('Document sent for signing! ✉️');
      navigate('/dashboard');

    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.message
        || 'Failed to send document.';
      toast.error(msg);
    } finally {
      if (mountedRef.current) setProcessing(false);
    }
  }, [
    validate,
    rawFile, title, parties, ccList,
    fields, totalPages, companyName,
    docId, companyLogoFile, companyLogo,
    saveNow, navigate,
  ]);

  // ── Loading screen ─────────────────────────────────────────
  if (docLoading) return <DocLoadingSkeleton />;

  const currentStepMeta = STEPS[step - 1];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-screen bg-slate-50
                    dark:bg-slate-950 overflow-hidden">

      {/* ════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════ */}
      <header className="h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         px-4 sm:px-6 flex items-center justify-between
                         gap-4 z-50 shrink-0 shadow-sm">

        {/* Left: back + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="h-9 w-9 rounded-xl shrink-0
                       bg-slate-50 dark:bg-slate-800
                       hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600
                                   dark:text-slate-300" />
          </Button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full bg-transparent border-none outline-none
                         text-sm font-semibold text-slate-900
                         dark:text-white truncate
                         placeholder:text-slate-300
                         dark:placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-400 lg:hidden">
              Step {step} of 5 · {currentStepMeta.desc}
            </p>
          </div>
        </div>

        {/* Center: step progress (desktop) */}
        <StepProgress
          current={step}
          onStepClick={goToStep}
          maxReached={maxReached}
        />

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Mobile: toggle sidebar/viewer (only step 4) */}
          {step === 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setMobilePanelView(v =>
                  v === 'sidebar' ? 'viewer' : 'sidebar'
                )
              }
              className="lg:hidden h-9 px-3 rounded-xl
                         border-slate-200 dark:border-slate-700
                         text-slate-600 dark:text-slate-300
                         gap-1.5 text-xs font-medium"
            >
              {mobilePanelView === 'sidebar'
                ? <><Eye className="w-3.5 h-3.5" /> Preview</>
                : <><PenTool className="w-3.5 h-3.5" /> Edit</>
              }
            </Button>
          )}

          {step > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="h-9 px-4 rounded-xl
                         border-slate-200 dark:border-slate-700
                         text-slate-600 dark:text-slate-300
                         font-medium text-sm"
            >
              Back
            </Button>
          )}

          {step < 5 ? (
            <Button
              size="sm"
              onClick={nextStep}
              className="h-9 px-4 rounded-xl
                         bg-slate-900 dark:bg-white
                         dark:text-slate-900 text-white
                         font-semibold text-sm gap-1.5
                         shadow-md hover:shadow-lg
                         transition-all hover:-translate-y-0.5
                         active:translate-y-0"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={processing || !fileReady}
              className="h-9 px-5 rounded-xl
                         bg-[#28ABDF] hover:bg-[#2399c8] text-white
                         font-semibold text-sm gap-1.5
                         shadow-md shadow-sky-400/30
                         hover:shadow-sky-400/40
                         transition-all hover:-translate-y-0.5
                         active:translate-y-0
                         disabled:opacity-60
                         disabled:cursor-not-allowed
                         disabled:hover:translate-y-0"
            >
              {processing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
              {processing ? 'Sending…' : 'Send Now'}
            </Button>
          )}
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          BODY
      ════════════════════════════════════════════════════ */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── SIDEBAR ────────────────────────────────────── */}
        <aside className={`
          w-full lg:w-[360px] xl:w-[400px]
          border-r border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900
          overflow-y-auto shrink-0
          ${step === 4 && mobilePanelView === 'viewer'
            ? 'hidden lg:block'
            : 'block'
          }
        `}>

          {/* Mobile step pill */}
          <div className="lg:hidden flex items-center gap-2
                          px-4 pt-4 pb-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5
                            rounded-full bg-[#28ABDF]/10
                            text-[#28ABDF] text-xs font-semibold">
              <currentStepMeta.icon className="w-3 h-3" />
              {currentStepMeta.desc}
            </div>
          </div>

          {/* ╔══════════════════════════════════════════════╗
              STEP 1 — Upload & Branding
          ╚══════════════════════════════════════════════╝ */}
          {step === 1 && (
            <div className="p-5 sm:p-6 space-y-8">

              {/* Document upload */}
              <div className="space-y-4">
                <SectionHeader
                  icon={FileText}
                  iconBg="bg-sky-50 dark:bg-sky-900/30"
                  iconColor="text-[#28ABDF]"
                  title="Document"
                  subtitle="Upload the PDF to be signed"
                />

                {!fileReady ? (
                  <label className="flex flex-col items-center
                                    justify-center w-full h-44
                                    rounded-2xl border-2 border-dashed
                                    border-slate-200 dark:border-slate-700
                                    cursor-pointer group
                                    hover:border-[#28ABDF]
                                    hover:bg-sky-50/40
                                    dark:hover:bg-sky-900/10
                                    transition-all duration-200">
                    <div className="w-12 h-12 rounded-2xl
                                    bg-slate-100 dark:bg-slate-800
                                    flex items-center justify-center
                                    mb-3 group-hover:bg-sky-100
                                    dark:group-hover:bg-sky-900/30
                                    transition-colors">
                      <Upload className="w-5 h-5 text-slate-400
                                         group-hover:text-[#28ABDF]
                                         transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600
                                  dark:text-slate-400
                                  group-hover:text-slate-800
                                  dark:group-hover:text-slate-200">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max file size: 20 MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                ) : (
                  <div className="relative p-4 rounded-2xl
                                  bg-sky-50 dark:bg-sky-900/20
                                  border border-sky-200
                                  dark:border-sky-800/60
                                  flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl
                                    bg-white dark:bg-slate-800
                                    flex items-center justify-center
                                    shadow-sm shrink-0">
                      <FileText className="w-5 h-5 text-[#28ABDF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold
                                    text-slate-800 dark:text-white
                                    truncate">
                        {title || 'document'}.pdf
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          revokeBlob(fileUrl);
                          setFileReady(false);
                          setFileUrl('');
                          setRawFile(null);
                          setFields([]);
                        }}
                        className="text-xs text-[#28ABDF]
                                   hover:underline font-medium mt-0.5"
                      >
                        Replace
                      </button>
                    </div>
                    <div className="absolute -top-2 -right-2
                                    w-6 h-6 bg-emerald-500 rounded-full
                                    flex items-center justify-center
                                    shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Title input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500
                                    dark:text-slate-400">
                    Document Title
                  </Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Employment Contract 2024"
                    className="h-10 rounded-xl border-slate-200
                               dark:border-slate-700 text-sm
                               focus-visible:ring-[#28ABDF]/30
                               focus-visible:border-[#28ABDF]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100
                              dark:border-slate-800" />

              {/* Brand identity */}
              <div className="space-y-4">
                <SectionHeader
                  icon={Building2}
                  iconBg="bg-amber-50 dark:bg-amber-900/30"
                  iconColor="text-amber-500"
                  title="Brand Identity"
                  subtitle="Optional — appears in emails"
                />

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Company Name
                    </Label>
                    <Input
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="h-10 rounded-xl border-slate-200
                                 dark:border-slate-700 text-sm
                                 focus-visible:ring-[#28ABDF]/30
                                 focus-visible:border-[#28ABDF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Company Logo
                    </Label>
                    <div className="flex items-center gap-4">
                      <label className="relative h-16 w-16 rounded-xl
                                        cursor-pointer border-2 border-dashed
                                        border-slate-200 dark:border-slate-700
                                        flex items-center justify-center
                                        shrink-0 overflow-hidden
                                        bg-slate-50 dark:bg-slate-800
                                        hover:border-[#28ABDF]
                                        transition-colors group">
                        {companyLogoPreview ? (
                          <img
                            src={companyLogoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-slate-300
                                                group-hover:text-[#28ABDF]
                                                transition-colors" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoSelect}
                        />
                      </label>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600
                                      dark:text-slate-300">
                          Upload logo
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          PNG with transparent background recommended.
                          Shown in signing emails.
                        </p>
                        {companyLogoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              revokeBlob(companyLogoPreview);
                              setCompanyLogoPreview('');
                              setCompanyLogoFile(null);
                              setCompanyLogo('');
                            }}
                            className="text-xs text-red-400
                                       hover:text-red-500 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ╔══════════════════════════════════════════════╗
              STEP 2 — Signing Parties
          ╚══════════════════════════════════════════════╝ */}
          {step === 2 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={Users}
                iconBg="bg-purple-50 dark:bg-purple-900/30"
                iconColor="text-purple-500"
                title="Signing Parties"
                subtitle="Define who signs and in what order"
              />
              <PartyManager
                parties={parties}
                onChange={setParties}
              />
            </div>
          )}

          {/* ╔══════════════════════════════════════════════╗
              STEP 3 — CC Recipients
          ╚══════════════════════════════════════════════╝ */}
          {step === 3 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={Mail}
                iconBg="bg-blue-50 dark:bg-blue-900/30"
                iconColor="text-[#28ABDF]"
                title="CC Recipients"
                subtitle="These people receive a copy but don't sign"
              />

              {/* Add form */}
              <div className="bg-slate-50 dark:bg-slate-800/60
                              rounded-2xl p-4 space-y-3
                              border border-slate-100
                              dark:border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium
                                      text-slate-500 dark:text-slate-400">
                      Full Name
                    </Label>
                    <Input
                      value={ccForm.name}
                      onChange={e =>
                        setCcForm(p => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Jane Smith"
                      className="h-9 rounded-xl text-sm
                                 border-slate-200 dark:border-slate-700
                                 focus-visible:ring-[#28ABDF]/30
                                 focus-visible:border-[#28ABDF]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium
                                      text-slate-500 dark:text-slate-400">
                      Designation
                    </Label>
                    <Input
                      value={ccForm.designation}
                      onChange={e =>
                        setCcForm(p => ({
                          ...p, designation: e.target.value,
                        }))
                      }
                      placeholder="Manager"
                      className="h-9 rounded-xl text-sm
                                 border-slate-200 dark:border-slate-700
                                 focus-visible:ring-[#28ABDF]/30
                                 focus-visible:border-[#28ABDF]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium
                                    text-slate-500 dark:text-slate-400">
                    Email Address
                  </Label>
                  <Input
                    value={ccForm.email}
                    type="email"
                    onChange={e =>
                      setCcForm(p => ({ ...p, email: e.target.value }))
                    }
                    onKeyDown={e => e.key === 'Enter' && addCc()}
                    placeholder="jane@company.com"
                    className="h-9 rounded-xl text-sm
                               border-slate-200 dark:border-slate-700
                               focus-visible:ring-[#28ABDF]/30
                               focus-visible:border-[#28ABDF]"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addCc}
                  size="sm"
                  variant="outline"
                  className="w-full h-9 rounded-xl text-sm font-medium
                             border-slate-200 dark:border-slate-700
                             hover:border-[#28ABDF]
                             hover:text-[#28ABDF] transition-colors
                             gap-1.5"
                >
                  + Add CC Recipient
                </Button>
              </div>

              {/* CC list */}
              {ccList.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 px-0.5">
                    {ccList.length} recipient
                    {ccList.length !== 1 ? 's' : ''} added
                  </p>
                  {ccList.map((cc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl
                                 bg-white dark:bg-slate-800
                                 border border-slate-100
                                 dark:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#28ABDF]/10
                                      flex items-center justify-center
                                      shrink-0">
                        <Mail className="w-3.5 h-3.5 text-[#28ABDF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800
                                      dark:text-white truncate">
                          {cc.name || 'No name'}
                          {cc.designation && (
                            <span className="text-slate-400
                                             font-normal ml-1">
                              · {cc.designation}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {cc.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCc(i)}
                        className="p-1 rounded-lg text-slate-300
                                   hover:text-red-500
                                   hover:bg-red-50
                                   dark:hover:bg-red-900/20
                                   transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No CC recipients yet</p>
                  <p className="text-xs opacity-70">CC is optional</p>
                </div>
              )}
            </div>
          )}

          {/* ╔══════════════════════════════════════════════╗
              STEP 4 — Field Placement
          ╚══════════════════════════════════════════════╝ */}
          {step === 4 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={PenTool}
                iconBg="bg-indigo-50 dark:bg-indigo-900/30"
                iconColor="text-indigo-500"
                title="Field Placement"
                subtitle="Click a field type, then click on the PDF"
              />

              <FieldToolbar
                parties={parties}
                selectedPartyIndex={selectedPartyIndex}
                onPartySelect={setSelectedPartyIndex}
                activeFieldType={pendingFieldType}
                onActiveFieldTypeChange={setPendingFieldType}
                fontFamily={editorFontFamily}
                fontSize={editorFontSize}
                onFontFamilyChange={setEditorFontFamily}
                onFontSizeChange={setEditorFontSize}
                onAddField={type => {
                  setPendingFieldType(type);
                  setMobilePanelView('viewer');
                }}
              />

              {docId && (
                <p className="text-[10px] text-slate-400 font-medium">
                  {saveStatus === 'pending' ? 'Saving…' : saveStatus === 'saved' ? 'Fields saved' : 'Auto-save on'}
                </p>
              )}

              {/* Pending field indicator */}
              {pendingFieldType && (
                <div className="flex items-center justify-between
                                p-3 rounded-xl bg-[#28ABDF]/10
                                border border-[#28ABDF]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full
                                    bg-[#28ABDF] animate-ping" />
                    <p className="text-xs font-semibold text-[#28ABDF]">
                      Click on PDF to place{' '}
                      <span className="font-bold capitalize">
                        {pendingFieldType}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingFieldType(null)}
                    className="text-[#28ABDF] hover:text-sky-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile: field properties in sidebar */}
              {selectedField && (
                <div className="xl:hidden pt-4 border-t border-slate-100 dark:border-slate-800">
                  <FieldPropertiesPanel
                    field={selectedField}
                    parties={parties}
                    onUpdate={updateSelectedField}
                    onRemove={() => removeField(selectedField.id)}
                    onClose={() => setSelectedFieldId(null)}
                  />
                </div>
              )}

              {/* Fields summary */}
              {fields.length > 0 && (
                <div className="pt-4 border-t border-slate-100
                                dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    {fields.length} field
                    {fields.length !== 1 ? 's' : ''} placed
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {fields.map(f => {
                      const party = parties[f.partyIndex] || parties[0];
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFieldId(f.id)}
                          className={`flex items-center gap-2 p-2
                                      rounded-lg cursor-pointer
                                      transition-colors text-xs
                                      ${selectedFieldId === f.id
                                        ? 'bg-[#28ABDF]/10 text-[#28ABDF]'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: party.color }}
                          />
                          <span className="capitalize font-medium">
                            {f.type}
                          </span>
                          <span className="text-slate-400 ml-auto">
                            p.{f.page}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ╔══════════════════════════════════════════════╗
              STEP 5 — Final Review
          ╚══════════════════════════════════════════════╝ */}
          {step === 5 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={CheckCircle2}
                iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                iconColor="text-emerald-500"
                title="Final Review"
                subtitle="Confirm details before sending"
              />

              {/* Summary card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl
                              border border-slate-100 dark:border-slate-700
                              overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50
                                dark:border-slate-700 bg-slate-50/50
                                dark:bg-slate-800/50">
                  <p className="text-xs font-semibold text-slate-500
                                dark:text-slate-400 uppercase tracking-wide">
                    Document Summary
                  </p>
                </div>
                <div className="px-4 py-1">
                  <ReviewRow label="Title"  value={title || '—'} />
                  <ReviewRow
                    label="Fields"
                    value={`${fields.length} placed`}
                    valueClass="text-[#28ABDF]"
                  />
                  <ReviewRow
                    label="CC"
                    value={`${ccList.length} recipient${ccList.length !== 1 ? 's' : ''}`}
                  />
                  {companyName && (
                    <ReviewRow label="Company" value={companyName} />
                  )}
                </div>
              </div>

              {/* Signers */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500
                              dark:text-slate-400 uppercase tracking-wide">
                  Signing Order ({parties.length})
                </p>
                {parties.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl
                               bg-white dark:bg-slate-800
                               border border-slate-100
                               dark:border-slate-700"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center
                                  justify-center text-white text-xs
                                  font-bold shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800
                                    dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20
                              border border-sky-100 dark:border-sky-800">
                <div className="flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-sky-500
                                          shrink-0 mt-0.5" />
                  <p className="text-xs text-sky-700 dark:text-sky-400
                                leading-relaxed">
                    Signers will receive an email in the defined order.
                    Once all sign, everyone gets a completed copy.
                  </p>
                </div>
              </div>

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={processing || !fileReady}
                className="w-full h-11 rounded-xl
                           bg-[#28ABDF] hover:bg-[#2399c8] text-white
                           font-semibold gap-2 shadow-md
                           shadow-sky-400/25 transition-all
                           hover:-translate-y-0.5 active:translate-y-0
                           disabled:opacity-60
                           disabled:cursor-not-allowed"
              >
                {processing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                {processing ? 'Sending…' : 'Send for Signing'}
              </Button>
            </div>
          )}
        </aside>

        {/* ── PDF VIEWER ──────────────────────────────────── */}
        <section className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          bg-slate-100 dark:bg-slate-950
          ${step === 4 && mobilePanelView === 'sidebar'
            ? 'hidden lg:flex'
            : 'flex'
          }
        `}>
          {fileReady ? (
            <div className="flex-1 overflow-auto flex justify-center
                            items-start p-4 lg:p-8">
              <div className="shadow-2xl shadow-slate-300/40
                              dark:shadow-black/60 rounded-xl
                              overflow-hidden
                              ring-1 ring-slate-200/80
                              dark:ring-slate-700/50">
                <PdfViewer
                  fileUrl={fileUrl}
                  fields={fields}
                  onFieldsChange={setFields}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onTotalPagesChange={setTotalPages}
                  selectedPartyIndex={selectedPartyIndex}
                  pendingFieldType={pendingFieldType}
                  parties={parties}
                  onFieldPlaced={() => {
                    setPendingFieldType(null);
                    setMobilePanelView('sidebar');
                  }}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={setSelectedFieldId}
                  readOnly={step !== 4}
                  fontFamily={editorFontFamily}
                  fontSize={editorFontSize}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center
                            justify-center gap-4 p-8 text-center">
              <div className="w-24 h-24 rounded-3xl
                              bg-white dark:bg-slate-900
                              border-2 border-dashed
                              border-slate-200 dark:border-slate-700
                              flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-200
                                      dark:text-slate-700" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-400
                              dark:text-slate-600 mb-1">
                  No PDF loaded
                </p>
                <p className="text-sm text-slate-300 dark:text-slate-700">
                  Upload a PDF in Step 1 to preview it here
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── FIELD PROPERTIES (desktop) ───────────────── */}
        {step === 4 && selectedField && (
          <aside className="hidden xl:flex w-[300px] shrink-0 overflow-hidden
                            border-l border-slate-200 dark:border-slate-800">
            <FieldPropertiesPanel
              field={selectedField}
              parties={parties}
              onUpdate={updateSelectedField}
              onRemove={() => removeField(selectedField.id)}
              onClose={() => setSelectedFieldId(null)}
            />
          </aside>
        )}
      </main>
    </div>
  );
}
