// src/pages/SignerView.jsx — PART 1
import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, PenLine, Send, Shield, ShieldCheck,
  RotateCcw, FileText, Lock, CheckSquare,
  Type, Calendar, Hash, Fingerprint, WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const cn = (...c) => c.filter(Boolean).join(' ');

function useDocumentTitle(t) {
  useEffect(() => {
    const p = document.title;
    if (t) document.title = t;
    return () => { document.title = p; };
  }, [t]);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

async function getBrowserGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p  => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: true },
    );
  });
}

// ════════════════════════════════════════════════════
// STATUS SCREEN
// ════════════════════════════════════════════════════
function StatusScreen({ icon: Icon, color, title, message, children }) {
  const palettes = {
    red:   { bg: 'bg-red-50',     ring: 'ring-red-100',     icon: 'text-red-500'     },
    green: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50',   ring: 'ring-amber-100',   icon: 'text-amber-500'   },
  };
  const p = palettes[color] || palettes.red;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50
                    via-sky-50/30 to-slate-100 flex items-center
                    justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border
                      border-slate-100 p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-2xl ${p.bg} ${p.ring}
                         ring-8 flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`w-8 h-8 ${p.icon}`} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        {children}
        <div className="mt-6 pt-5 border-t border-slate-100
                        flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-[#28ABDF] rounded-md
                          flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-slate-400">
            Secured by <span className="font-semibold">NeXsign</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// SIGNATURE MODAL
// ════════════════════════════════════════════════════
function SignatureModal({ isOpen, onClose, onAccept, fieldType = 'signature' }) {
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const [isEmpty,      setIsEmpty]      = useState(true);
  const [inputMode,    setInputMode]    = useState('draw');
  const [typedText,    setTypedText]    = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script, cursive');
  const [penColor,     setPenColor]     = useState('#1e293b');
  const [penWidth,     setPenWidth]     = useState(2.5);

  const FONTS = [
    { label: 'Script',  value: 'Dancing Script, cursive'  },
    { label: 'Serif',   value: 'Georgia, serif'           },
    { label: 'Print',   value: 'Arial, sans-serif'        },
    { label: 'Cursive', value: 'Brush Script MT, cursive' },
  ];
  const COLORS = ['#1e293b', '#1d4ed8', '#7c3aed', '#be185d'];

  useEffect(() => {
    if (!isOpen) return;
    setIsEmpty(true); setTypedText(''); setInputMode('draw');
    const link = document.createElement('link');
    link.rel   = 'stylesheet';
    link.href  = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || inputMode !== 'draw') return;
    const canvas  = canvasRef.current; if (!canvas) return;
    const rect    = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 500;
    canvas.height = rect.height || 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isOpen, inputMode]);

  useEffect(() => {
    if (!isOpen) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const getPos = useCallback((e, c) => {
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return {
      x: (s.clientX - r.left) * (c.width  / r.width),
      y: (s.clientY - r.top)  * (c.height / r.height),
    };
  }, []);

  const startDraw = useCallback(e => {
    e.preventDefault(); isDrawing.current = true;
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = penColor; ctx.lineWidth = penWidth;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    lastPos.current = getPos(e, c);
  }, [penColor, penWidth, getPos]);

  const draw = useCallback(e => {
    e.preventDefault(); if (!isDrawing.current) return;
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    const pos = getPos(e, c);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos; setIsEmpty(false);
  }, [getPos]);

  const stopDraw  = useCallback(() => { isDrawing.current = false; }, []);

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    setIsEmpty(true);
  }, []);

  const handleAccept = useCallback(() => {
    if (inputMode === 'draw') {
      if (isEmpty) { toast.error('Please draw your signature.'); return; }
      onAccept(canvasRef.current.toDataURL('image/png'));
    } else {
      if (!typedText.trim()) { toast.error('Please type your name.'); return; }
      const c = document.createElement('canvas');
      c.width = 500; c.height = 160;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 500, 160);
      ctx.font = `52px ${selectedFont}`;
      ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText.trim().slice(0, 30), 250, 80);
      onAccept(c.toDataURL('image/png'));
    }
  }, [inputMode, isEmpty, typedText, selectedFont, onAccept]);

  if (!isOpen) return null;
  const isInitials = fieldType === 'initial';

  return (
    <div
      role="dialog" aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg
                      shadow-2xl overflow-hidden rounded-t-3xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#28ABDF] to-[#1a8cbf]
                        px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20
                            flex items-center justify-center">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {isInitials ? 'Add Initials' : 'Add Signature'}
              </h2>
              <p className="text-white/70 text-xs">Legally binding</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30
                       text-white flex items-center justify-center
                       text-xl font-bold transition-colors">×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { v: 'draw', l: '✏️ Draw' },
            { v: 'type', l: '⌨️ Type' },
          ].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setInputMode(v)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold transition-all border-b-2',
                inputMode === v
                  ? 'border-[#28ABDF] text-[#28ABDF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              )}>
              {l}
            </button>
          ))}
        </div>

        <div className="p-5">
          {inputMode === 'draw' ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden
                              border-2 border-dashed border-slate-200 bg-white">
                <canvas ref={canvasRef}
                  className="w-full touch-none cursor-crosshair block"
                  style={{ height: 180 }}
                  onMouseDown={startDraw} onMouseMove={draw}
                  onMouseUp={stopDraw}   onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center
                                  justify-center pointer-events-none">
                    <div className="text-center">
                      <PenLine className="w-7 h-7 text-slate-200 mx-auto mb-1.5" />
                      <p className="text-sm text-slate-300 font-medium">
                        Draw your signature here
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setPenColor(c)}
                        className={cn(
                          'w-5 h-5 rounded-full transition-all',
                          penColor === c
                            ? 'ring-2 ring-offset-1 ring-slate-400 scale-125'
                            : 'hover:scale-110',
                        )}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[1.5, 2.5, 4].map(w => (
                      <button key={w} type="button" onClick={() => setPenWidth(w)}
                        className={cn(
                          'h-6 px-2 rounded-lg border text-[10px] font-bold',
                          penWidth === w
                            ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF]'
                            : 'border-slate-200 text-slate-400',
                        )}>
                        {w === 1.5 ? 'S' : w === 2.5 ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs
                             text-red-400 hover:text-red-500 font-medium">
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" value={typedText} maxLength={30} autoFocus
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type your full name"
                className="w-full h-12 border-2 border-slate-200 rounded-xl
                           px-4 text-lg focus:border-[#28ABDF] focus:outline-none"
                style={{ fontFamily: selectedFont }}
              />
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => (
                  <button key={f.value} type="button"
                    onClick={() => setSelectedFont(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm transition-all',
                      selectedFont === f.value
                        ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF] font-semibold'
                        : 'border-slate-200 text-slate-500',
                    )}
                    style={{ fontFamily: f.value }}>
                    {f.label}
                  </button>
                ))}
              </div>
              {typedText.trim() && (
                <div className="rounded-xl border-2 border-slate-100 p-4
                                text-center bg-slate-50/50 text-4xl text-slate-800"
                     style={{ fontFamily: selectedFont }}>
                  {typedText}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 rounded-xl h-11 border-slate-200">
              Cancel
            </Button>
            <Button type="button" onClick={handleAccept}
              className="flex-1 h-11 rounded-xl bg-[#28ABDF]
                         hover:bg-[#2399c8] text-white font-semibold gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Apply {isInitials ? 'Initials' : 'Signature'}
            </Button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-3">
            By clicking Apply, you agree this is your legal electronic signature.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// FIELD OVERLAY
// ════════════════════════════════════════════════════
const FIELD_META = {
  signature: { icon: PenLine,     label: 'Click to sign', color: '#28ABDF', border: 'border-[#28ABDF]',  bg: 'bg-sky-50/90'     },
  initial:   { icon: Fingerprint, label: 'Initials',      color: '#8b5cf6', border: 'border-violet-400', bg: 'bg-violet-50/90'  },
  text:      { icon: Type,        label: 'Text',          color: '#64748b', border: 'border-slate-300',  bg: 'bg-white/95'      },
  date:      { icon: Calendar,    label: 'Date',          color: '#10b981', border: 'border-emerald-400',bg: 'bg-emerald-50/90' },
  checkbox:  { icon: CheckSquare, label: '',              color: '#f59e0b', border: 'border-amber-400',  bg: 'bg-amber-50/90'   },
  number:    { icon: Hash,        label: 'Number',        color: '#6366f1', border: 'border-indigo-400', bg: 'bg-indigo-50/90'  },
};

function InlineInput({ field, onChange, type = 'text' }) {
  const ref   = useRef(null);
  const local = useRef(field.value || '');
  return (
    <input ref={ref} type={type}
      defaultValue={field.value || ''}
      placeholder={field.placeholder || (type === 'number' ? '0' : 'Type here...')}
      className="absolute inset-0 w-full h-full bg-white/95 px-2
                 text-xs border-none outline-none z-10 text-slate-700"
      onClick={e => e.stopPropagation()}
      onChange={e => { local.current = e.target.value; }}
      onBlur={() => { if (local.current !== field.value) onChange(field.id, local.current); }}
    />
  );
}

const FieldOverlay = React.memo(function FieldOverlay({
  field, isMine, isHighlighted, onClick, onChange, canvasW,
}) {
  const meta = FIELD_META[field.type] || FIELD_META.text;
  const Icon = meta.icon;
  const filled = !!field.value;
  const pxW  = canvasW ? (field.width / 100) * canvasW : 100;

  return (
    <div
      className={cn(
        'absolute rounded-lg transition-all duration-150',
        'flex items-center justify-center overflow-hidden select-none',
        'border-2',
        filled ? 'border-opacity-60' : 'border-dashed',
        meta.border, meta.bg,
        isMine ? 'cursor-pointer hover:brightness-95 hover:shadow-md'
               : 'opacity-40 cursor-not-allowed',
        isHighlighted && !filled
          ? 'ring-2 ring-offset-1 ring-yellow-400 animate-pulse shadow-lg'
          : '',
      )}
      style={{
        left:   `${field.x ?? 0}%`,
        top:    `${field.y ?? 0}%`,
        width:  `${field.width  ?? 20}%`,
        height: `${field.height ?? 6}%`,
      }}
      onClick={() => isMine && onClick(field)}
    >
      {filled ? (
        (field.type === 'signature' || field.type === 'initial') ? (
          <img src={field.value} alt={field.type}
            className="w-full h-full object-contain p-0.5" draggable={false} />
        ) : field.type === 'checkbox' ? (
          <CheckSquare className="w-5 h-5 text-amber-500" />
        ) : (
          <span className="px-1.5 truncate w-full text-center font-medium text-slate-700"
            style={{ fontSize: Math.min(pxW * 0.1, 13) }}>
            {field.value}
          </span>
        )
      ) : (
        <>
          {field.type !== 'text' && field.type !== 'number' && field.type !== 'date' && (
            <div className="flex items-center gap-1 px-1.5 pointer-events-none">
              {field.required && <span className="text-red-400 text-[9px] font-black">*</span>}
              <Icon size={Math.min(pxW * 0.12, 13)} style={{ color: meta.color, flexShrink: 0 }} />
              {meta.label && (
                <span className="font-semibold truncate"
                  style={{ color: meta.color, fontSize: Math.min(pxW * 0.09, 11) }}>
                  {meta.label}
                </span>
              )}
            </div>
          )}
          {isMine && field.type === 'text'   && <InlineInput field={field} onChange={onChange} type="text"   />}
          {isMine && field.type === 'number' && <InlineInput field={field} onChange={onChange} type="number" />}
          {isMine && field.type === 'date' && (
            <input type="date" defaultValue={field.value || ''}
              className="absolute inset-0 w-full h-full bg-white/95 px-1
                         text-xs border-none outline-none z-10 text-slate-700"
              onClick={e => e.stopPropagation()}
              onChange={e => onChange(field.id, e.target.value)} />
          )}
          {isMine && field.type === 'checkbox' && (
            <input type="checkbox"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onClick={e => { e.stopPropagation(); onChange(field.id, e.target.checked ? 'checked' : ''); }} />
          )}
        </>
      )}
    </div>
  );
});// ════════════════════════════════════════════════════
// PDF RENDERER — retry + progress + smooth loading
// ════════════════════════════════════════════════════
function PdfRenderer({
  pdfUrl, fields, signerIndex,
  onFieldClick, onFieldChange,
  currentPage, onPageChange,
  totalPages, onTotalPages,
}) {
  const canvasRef     = useRef(null);
  const containerRef  = useRef(null);
  const scrollRef     = useRef(null);
  const pdfDocRef     = useRef(null);
  const renderRef     = useRef(null);
  const debounceRef   = useRef(null);
  const retryTimerRef = useRef(null);
  const abortRef      = useRef(null);

  // pdfState: idle | loading | ready | error
  const [pdfState,     setPdfState]     = useState('idle');
  const [retryCount,   setRetryCount]   = useState(0);
  const [retryIn,      setRetryIn]      = useState(0);
  const [loadPct,      setLoadPct]      = useState(0);
  const [scale,        setScale]        = useState(1);
  const [canvasSize,   setCanvasSize]   = useState({ width: 0, height: 0 });

  const MAX_RETRIES = 3;

  const pageFields = useMemo(
    () => fields.filter(f => (f.page || 1) === currentPage),
    [fields, currentPage],
  );

  const firstUnfilledId = useMemo(() => {
    const f = pageFields.find(f => f.partyIndex === signerIndex && f.required && !f.value);
    return f?.id || null;
  }, [pageFields, signerIndex]);

  // ── LOAD PDF ─────────────────────────────────────
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const load = async () => {
      setPdfState('loading');
      setLoadPct(0);
      pdfDocRef.current = null;

      // Fake progress so user sees activity
      let fakePct = 0;
      const fakeTimer = setInterval(() => {
        fakePct = Math.min(fakePct + Math.random() * 12, 80);
        if (!cancelled) setLoadPct(Math.round(fakePct));
      }, 350);

      try {
        const loadTask = pdfjsLib.getDocument({
          url:             pdfUrl,
          withCredentials: false,
          cMapPacked:      true,
          disableStream:   false,
          rangeChunkSize:  65536,
        });

        // Real progress from pdf.js
        loadTask.onProgress = ({ loaded, total }) => {
          if (total > 0 && !cancelled) {
            setLoadPct(Math.round((loaded / total) * 90));
          }
        };

        // 35s hard timeout
        const doc = await Promise.race([
          loadTask.promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('PDF_TIMEOUT')), 35_000)
          ),
        ]);

        clearInterval(fakeTimer);
        if (cancelled) return;

        pdfDocRef.current = doc;
        onTotalPages?.(doc.numPages);
        setLoadPct(100);

        // Smooth transition
        await new Promise(r => setTimeout(r, 200));
        if (!cancelled) {
          setPdfState('ready');
          // Render right away
          renderPageFn(doc, currentPage, scale);
        }

      } catch (err) {
        clearInterval(fakeTimer);
        if (cancelled) return;
        console.error('[PDF] Load failed:', err?.message);
        setPdfState('error');

        // Auto-retry countdown
        if (retryCount < MAX_RETRIES) {
          const delay    = Math.pow(2, retryCount) * 2000;
          let countdown  = Math.ceil(delay / 1000);
          setRetryIn(countdown);
          retryTimerRef.current = setInterval(() => {
            countdown -= 1;
            setRetryIn(countdown);
            if (countdown <= 0) {
              clearInterval(retryTimerRef.current);
              if (!cancelled) setRetryCount(c => c + 1);
            }
          }, 1000);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      clearInterval(retryTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, retryCount]);

  // ── RENDER PAGE ───────────────────────────────────
  const renderPageFn = useCallback(async (docRef, page, sc) => {
    const doc    = docRef || pdfDocRef.current;
    const canvas = canvasRef.current;
    const wrap   = containerRef.current;
    if (!doc || !canvas || !wrap) return;

    try { renderRef.current?.cancel(); } catch (_) {}

    try {
      const pg    = await doc.getPage(page);
      const avail = Math.max(wrap.clientWidth - 32, 300);
      const base  = pg.getViewport({ scale: 1 });
      const fit   = avail / base.width;
      const vp    = pg.getViewport({ scale: fit * sc });
      const dpr   = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width        = vp.width  * dpr;
      canvas.height       = vp.height * dpr;
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.scale(dpr, dpr);
      setCanvasSize({ width: vp.width, height: vp.height });

      renderRef.current = pg.render({ canvasContext: ctx, viewport: vp });
      await renderRef.current.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error('[PDF render]', e);
    }
  }, []);

  // Re-render on page or scale change
  useEffect(() => {
    if (pdfState === 'ready' && pdfDocRef.current) {
      renderPageFn(pdfDocRef.current, currentPage, scale);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, scale, pdfState]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const obs = new ResizeObserver(() => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pdfState === 'ready' && pdfDocRef.current) {
          renderPageFn(pdfDocRef.current, currentPage, scale);
        }
      }, 150);
    });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(debounceRef.current); };
  }, [pdfState, currentPage, scale, renderPageFn]);

  // Scroll to first unfilled field
  useEffect(() => {
    if (!firstUnfilledId || !canvasSize.width || pdfState !== 'ready') return;
    const field = pageFields.find(f => f.id === firstUnfilledId);
    if (!field || !scrollRef.current) return;
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({
        top:      Math.max(0, (field.y / 100) * canvasSize.height - 120),
        behavior: 'smooth',
      });
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstUnfilledId, canvasSize, pdfState, currentPage]);

  const clamp   = d => setScale(s => Math.min(2, Math.max(0.5, Math.round((s + d) * 10) / 10)));
  const isLoading = pdfState === 'idle' || pdfState === 'loading';
  const isError   = pdfState === 'error';
  const isReady   = pdfState === 'ready';

  const manualRetry = () => {
    clearInterval(retryTimerRef.current);
    setRetryIn(0);
    setPdfState('idle');
    setRetryCount(0);
    // tiny delay then re-trigger
    setTimeout(() => setRetryCount(1), 50);
  };

  const myFieldCount = pageFields.filter(f => f.partyIndex === signerIndex).length;

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5
                      bg-white dark:bg-slate-900 border-b border-slate-200
                      dark:border-slate-800 shrink-0 gap-3 flex-wrap">
        {/* Pagination */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-600 min-w-[70px]
                           text-center tabular-nums">
            {isLoading ? '— / —' : `${currentPage} / ${totalPages || '?'}`}
          </span>
          <Button variant="outline" size="icon"
            onClick={() => onPageChange(Math.min(totalPages || 999, currentPage + 1))}
            disabled={currentPage >= (totalPages || 1) || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon"
            onClick={() => clamp(-0.1)} disabled={scale <= 0.5 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button type="button" onClick={() => setScale(1)} disabled={!isReady}
            className="text-xs text-slate-500 font-semibold w-12
                       text-center hover:text-[#28ABDF] transition-colors">
            {Math.round(scale * 100)}%
          </button>
          <Button variant="outline" size="icon"
            onClick={() => clamp(0.1)} disabled={scale >= 2 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          {myFieldCount} field{myFieldCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="h-1 bg-slate-100 shrink-0">
          <div className="h-full bg-[#28ABDF] transition-all duration-300 ease-out"
               style={{ width: `${loadPct}%` }} />
        </div>
      )}

      {/* Canvas area */}
      <div ref={scrollRef}
           className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-3 sm:p-5">
        <div ref={containerRef}>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-4 animate-pulse" style={{ minHeight: 550 }}>
                  <div className="h-6 bg-slate-200 rounded-lg w-2/3 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-32 bg-slate-100 rounded-xl w-full mt-4" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#28ABDF] animate-spin" />
                  <p className="text-sm font-semibold text-slate-600">
                    {loadPct < 25 ? 'Connecting to document...'
                      : loadPct < 55 ? 'Downloading PDF...'
                      : loadPct < 85 ? 'Processing pages...'
                      : 'Almost ready...'}
                  </p>
                </div>
                <div className="w-40 h-1.5 bg-slate-200 rounded-full
                                mx-auto overflow-hidden">
                  <div className="h-full bg-[#28ABDF] rounded-full
                                  transition-all duration-300"
                       style={{ width: `${loadPct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{loadPct}%</p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50
                              flex items-center justify-center">
                <WifiOff className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-1">
                  Failed to load PDF
                </p>
                <p className="text-sm text-slate-400 max-w-xs">
                  {retryCount >= MAX_RETRIES
                    ? 'Could not load after multiple attempts. Check your connection.'
                    : 'Trouble loading the document. Retrying automatically...'}
                </p>
              </div>

              {retryCount < MAX_RETRIES && retryIn > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                bg-amber-50 border border-amber-100">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <p className="text-sm text-amber-700 font-medium">
                    Retrying in {retryIn}s
                    <span className="text-amber-400 ml-1 text-xs">
                      ({retryCount}/{MAX_RETRIES})
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={manualRetry}
                  className="rounded-xl gap-1.5 border-slate-200">
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Now
                </Button>
                <Button size="sm" onClick={() => window.location.reload()}
                  className="rounded-xl bg-[#28ABDF] hover:bg-[#2399c8] text-white gap-1.5">
                  Reload Page
                </Button>
              </div>
            </div>
          )}

          {/* PDF canvas */}
          <div
            className={cn(
              'relative mx-auto bg-white shadow-2xl shadow-black/20 rounded-sm',
              'transition-opacity duration-300',
              isReady ? 'opacity-100' : 'opacity-0 absolute pointer-events-none',
            )}
            style={{
              width:  canvasSize.width  || 'auto',
              height: canvasSize.height || 'auto',
            }}
          >
            <canvas ref={canvasRef} className="block rounded-sm" />
            {isReady && canvasSize.width > 0 && pageFields.map(field => (
              <FieldOverlay
                key={field.id}
                field={field}
                isMine={field.partyIndex === signerIndex}
                isHighlighted={field.id === firstUnfilledId}
                onClick={onFieldClick}
                onChange={onFieldChange}
                canvasW={canvasSize.width}
              />
            ))}
          </div>

          {/* Page dots */}
          {isReady && totalPages > 1 && totalPages <= 20 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} type="button" onClick={() => onPageChange(i + 1)}
                  className={cn(
                    'transition-all duration-150 rounded-full',
                    currentPage === i + 1
                      ? 'w-5 h-2 bg-[#28ABDF]'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400',
                  )} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// FIELD PROGRESS
// ════════════════════════════════════════════════════
function FieldProgress({ fields, signerIndex }) {
  const mine   = fields.filter(f => f.partyIndex === signerIndex);
  const filled = mine.filter(f => f.value);
  const pct    = mine.length ? Math.round((filled.length / mine.length) * 100) : 100;
  const done   = mine.length > 0 && filled.length === mine.length;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white
                    dark:bg-slate-900 border-b border-slate-100
                    dark:border-slate-800 shrink-0">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100
                      dark:bg-slate-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            done ? 'bg-emerald-500' : 'bg-[#28ABDF]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-semibold whitespace-nowrap',
        done ? 'text-emerald-600' : 'text-slate-500',
      )}>
        {mine.length === 0 ? 'Read only'
          : done ? '✓ All complete'
          : `${filled.length} / ${mine.length} fields`}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════
// MAIN — SignerView
// ════════════════════════════════════════════════════
export default function SignerView() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [phase,       setPhase]       = useState('loading');
  const [docInfo,     setDocInfo]     = useState(null);
  const [signerInfo,  setSignerInfo]  = useState(null);
  const [pdfUrl,      setPdfUrl]      = useState('');
  const [fields,      setFields]      = useState([]);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useDocumentTitle(
    docInfo ? `Sign: ${docInfo.title} — NeXsign` : 'Sign Document — NeXsign',
  );

  const jumpToFirstFieldPage = useCallback((allFields, idx) => {
    const myF   = allFields.filter(f => f.partyIndex === idx);
    if (!myF.length) return;
    const pages = [...new Set(myF.map(f => f.page || 1))].sort((a, b) => a - b);
    if (pages[0] && pages[0] !== 1) setCurrentPage(pages[0]);
  }, []);

  // ── Validate token ────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg('No signing token provided.');
      setPhase('error');
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await api.get(`/documents/sign/validate/${token}`, {
          signal: ctrl.signal,
        });
        if (!mountedRef.current) return;

        const { document: doc, party } = res.data;
        const allFields = (doc.fields || []).map(f => ({
          ...f, value: f.value || '',
        }));

        setDocInfo(doc);
        setSignerInfo(party);
        setFields(allFields);
        setTotalPages(doc.totalPages || 1);

        // ✅ Proxy URL — avoids CORS & Cloudinary issues
        const base = (
          import.meta.env.VITE_API_URL ||
          'https://nextsignbackendfinal.vercel.app'
        ).replace(/\/api\/?$/, '').replace(/\/$/, '');

        setPdfUrl(`${base}/api/documents/sign/${token}/pdf`);
        setPhase('ready');
        jumpToFirstFieldPage(allFields, party.index);

      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        if (!mountedRef.current) return;
        const msg    = err.response?.data?.message || 'This link is invalid or expired.';
        const status = err.response?.status;
        setErrorMsg(msg);
        setPhase(status === 410 ? 'already_signed' : 'error');
      }
    })();

    return () => ctrl.abort();
  }, [token, jumpToFirstFieldPage]);

  const handleFieldClick = useCallback((field) => {
    if (field.partyIndex !== signerInfo?.index) {
      const name = docInfo?.parties?.[field.partyIndex]?.name || 'another signer';
      toast.info(`This field belongs to ${name}.`);
      return;
    }
    if (field.type === 'signature' || field.type === 'initial') {
      setActiveField(field);
      setShowModal(true);
    }
  }, [signerInfo, docInfo]);

  const handleFieldChange = useCallback((id, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: val } : f));
  }, []);

  const onSignatureAccept = useCallback((dataUrl) => {
    if (!activeField) return;
    handleFieldChange(activeField.id, dataUrl);
    setShowModal(false);
    setActiveField(null);
    toast.success('Signature applied! ✓');
  }, [activeField, handleFieldChange]);

  // ── Submit ────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const mine    = fields.filter(f => f.partyIndex === signerInfo?.index);
    const missing = mine.filter(f => f.required && !f.value);

    if (missing.length) {
      toast.error(`Complete ${missing.length} required field${missing.length > 1 ? 's' : ''} first.`);
      if (missing[0]?.page) setCurrentPage(missing[0].page);
      return;
    }

    setSubmitting(true);
    const gpsToast = toast.loading('Getting your location...');

    try {
      const gpsCoords = await getBrowserGPS().catch(() => null);
      toast.dismiss(gpsToast);

      const res = await api.post('/documents/sign/submit', {
        token, fields,
        clientTime: new Date().toISOString(),
        latitude:   gpsCoords?.latitude  ?? null,
        longitude:  gpsCoords?.longitude ?? null,
      });

      if (!mountedRef.current) return;
      setPhase(res.data.completed ? 'completed' : 'signed_next');

    } catch (err) {
      toast.dismiss(gpsToast);
      if (mountedRef.current) {
        toast.error(err.response?.data?.message || 'Submission failed. Try again.');
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [fields, signerInfo, token]);

  // ── Phase screens ─────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-gradient-to-br from-slate-50 to-sky-50 gap-4">
        <div className="w-16 h-16 bg-[#28ABDF]/10 rounded-2xl
                        flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#28ABDF]" />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-700">Loading secure document</p>
          <p className="text-sm text-slate-400 mt-1">Verifying your signing link…</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-[#28ABDF]" />
          Powered by NeXsign
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <StatusScreen icon={XCircle} color="red"
        title="Invalid Signing Link" message={errorMsg}>
        <Button onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold">
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'already_signed') {
    return (
      <StatusScreen icon={CheckCircle2} color="green"
        title="Already Signed"
        message="You've already signed this document. No further action needed.">
        <Button onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold">
          Visit NeXsign
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'signed_next') {
    return (
      <StatusScreen icon={CheckCircle2} color="green"
        title="Signature Submitted!"
        message="Your signature has been recorded. The next signer has been notified.">
        <Button onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-[#28ABDF] text-white font-semibold">
          Done
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'completed') {
    return (
      <StatusScreen icon={ShieldCheck} color="green"
        title="Document Fully Signed!"
        message={`All parties signed "${docInfo?.title}". A completed copy will be emailed to everyone.`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 text-left">
              Signed copy sent to <strong>{signerInfo?.email}</strong>
            </p>
          </div>
          <Button onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF] text-white font-semibold">
            Done
          </Button>
        </div>
      </StatusScreen>
    );
  }

  // ── Ready ─────────────────────────────────────────
  const myFields    = fields.filter(f => f.partyIndex === signerInfo?.index);
  const filledCount = myFields.filter(f => f.value).length;
  const allFilled   = myFields.length > 0 && filledCount === myFields.length;

  return (
    <div className="flex flex-col h-screen bg-slate-100
                    dark:bg-slate-950 overflow-hidden">

      {/* Header */}
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         flex items-center justify-between
                         px-4 sm:px-6 gap-4 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-xl
                          flex items-center justify-center shrink-0
                          shadow-md shadow-sky-400/30">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white
                           truncate max-w-[140px] sm:max-w-xs md:max-w-sm">
              {docInfo?.title}
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {docInfo?.companyName ? `${docInfo.companyName} · ` : ''}
              {docInfo?.createdAt && formatDate(docInfo.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {signerInfo?.name}
            </p>
            <p className="text-[10px] text-slate-400">{signerInfo?.email}</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'h-9 sm:h-10 px-4 sm:px-5 rounded-xl font-semibold text-sm',
              'gap-1.5 transition-all duration-150',
              'hover:-translate-y-0.5 active:translate-y-0',
              'shadow-md disabled:opacity-60 disabled:cursor-not-allowed',
              allFilled
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-400/30 text-white'
                : 'bg-[#28ABDF] hover:bg-[#2399c8] shadow-sky-400/25 text-white',
            )}
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">
              {submitting ? 'Submitting…' : 'Finish Signing'}
            </span>
          </Button>
        </div>
      </header>

      <FieldProgress fields={fields} signerIndex={signerInfo?.index} />

      <main className="flex-1 min-h-0">
        <PdfRenderer
          pdfUrl={pdfUrl}
          fields={fields}
          signerIndex={signerInfo?.index}
          onFieldClick={handleFieldClick}
          onFieldChange={handleFieldChange}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          onTotalPages={setTotalPages}
        />
      </main>

      <SignatureModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setActiveField(null); }}
        onAccept={onSignatureAccept}
        fieldType={activeField?.type}
      />
    </div>
  );
}