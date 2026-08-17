// src/components/editor/PdfViewer.jsx
import React, {
  useRef, useState, useEffect,
  useCallback, useMemo,
} from 'react';
import {
  ChevronLeft, ChevronRight, Trash2,
  ZoomIn, ZoomOut, Maximize2, Loader2,
  AlertTriangle, RefreshCw, PenTool,
  Type, Calendar, CheckSquare,
  Fingerprint, Hash, RotateCcw, Lock,
} from 'lucide-react';
import { Rnd }       from 'react-rnd';
import { loadPdfDocument } from '@/utils/loadPdfDocument';

const cn = (...c) => c.filter(Boolean).join(' ');

const PARTY_COLORS = [
  '#0ea5e9','#8b5cf6','#f59e0b',
  '#10b981','#ef4444','#ec4899',
  '#6366f1','#14b8a6',
];

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];

const FIELD_META = {
  signature: { icon: PenTool,     label: 'Signature', defaultW: 20, defaultH: 8  },
  initial:   { icon: Fingerprint, label: 'Initial',   defaultW: 12, defaultH: 7  },
  date:      { icon: Calendar,    label: 'Date',      defaultW: 16, defaultH: 6  },
  text:      { icon: Type,        label: 'Text',      defaultW: 18, defaultH: 6  },
  checkbox:  { icon: CheckSquare, label: 'Checkbox',  defaultW: 6,  defaultH: 6  },
  number:    { icon: Hash,        label: 'Number',    defaultW: 14, defaultH: 6  },
};

// ─── IconBtn ──────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, title, children, className }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title}
    className={cn(
      'w-8 h-8 rounded-lg flex items-center justify-center',
      'transition-all text-slate-600 dark:text-slate-400',
      'hover:bg-slate-200 dark:hover:bg-slate-700',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      // ✅ larger touch target on mobile
      'min-w-[32px] min-h-[32px]',
      className,
    )}>
    {children}
  </button>
);

// ─── FieldOverlay ─────────────────────────────────────────────────
const FieldOverlay = React.memo(({
  field, canvasSize, canvasSizeRef,
  party, isSelected, readOnly,
  onSelect, onUpdate, onRemove,
}) => {
  const color     = party?.color ||
    PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
  const meta      = FIELD_META[field.type] || FIELD_META.text;
  const FieldIcon = meta.icon;

  const px = (field.x      / 100) * canvasSize.width;
  const py = (field.y      / 100) * canvasSize.height;
  const pw = (field.width  / 100) * canvasSize.width;
  const ph = (field.height / 100) * canvasSize.height;

  const locked = Boolean(field.locked);

  return (
    <Rnd
      size={{ width: pw, height: ph }}
      position={{ x: px, y: py }}
      bounds="parent"
      disableDragging={readOnly || locked}
      enableResizing={(readOnly || locked) ? false : {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true,
        bottomLeft: true, topLeft: true,
      }}
      minWidth={40}
      minHeight={20}
      className="z-20"
      style={{ position: 'absolute' }}
      // ✅ Touch support for drag
      enableUserSelectHack={false}
      onDragStop={(_, d) => {
        const s = canvasSizeRef.current;
        onUpdate(field.id, {
          x: +((d.x / s.width)  * 100).toFixed(4),
          y: +((d.y / s.height) * 100).toFixed(4),
        });
      }}
      onResizeStop={(_, __, ref, ___, pos) => {
        const s = canvasSizeRef.current;
        onUpdate(field.id, {
          width:  +((parseFloat(ref.style.width)  / s.width)  * 100).toFixed(4),
          height: +((parseFloat(ref.style.height) / s.height) * 100).toFixed(4),
          x:      +((pos.x / s.width)  * 100).toFixed(4),
          y:      +((pos.y / s.height) * 100).toFixed(4),
        });
      }}
    >
      <div
        onClick={e => {
          e.stopPropagation();
          if (!readOnly) onSelect?.(field.id);
        }}
        className={cn(
          'w-full h-full border-2 flex flex-col items-center',
          'justify-center relative group select-none',
          'transition-all duration-150 rounded-sm',
          isSelected ? 'border-amber-400' : 'border-dashed',
        )}
        style={{
          borderColor:     isSelected ? '#f59e0b' : color,
          backgroundColor: isSelected
            ? 'rgba(245,158,11,0.12)'
            : `${color}1a`,
          boxShadow: isSelected
            ? '0 0 0 2px rgba(245,158,11,0.4)'
            : 'none',
        }}
      >
        <div className="flex items-center gap-1 pointer-events-none px-1">
          <FieldIcon
            size={Math.min(pw * 0.18, 14)}
            style={{ color, flexShrink: 0 }}
          />
          <span className="font-black uppercase leading-none truncate"
            style={{
              color,
              fontSize: Math.max(Math.min(pw * 0.12, 11), 7),
              maxWidth: pw - 20,
            }}>
            {meta.label}
          </span>
        </div>

        <span className="font-bold leading-none truncate
                         pointer-events-none mt-0.5"
          style={{
            color:    `${color}bb`,
            fontSize: Math.max(Math.min(pw * 0.09, 9), 6),
            maxWidth: pw - 8,
          }}>
          {party?.name || `Party ${field.partyIndex + 1}`}
        </span>

        {/* Delete button — bigger on mobile */}
        {!readOnly && (
          <button type="button"
            onPointerDown={e => { e.stopPropagation(); e.preventDefault(); }}
            onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(field.id); }}
            className={cn(
              'absolute -top-3 -right-3',
              'w-6 h-6',
              'bg-red-500 hover:bg-red-600 text-white',
              'rounded-full flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 shadow-md',
              'transition-opacity z-[999]',
              isSelected && 'opacity-100',
              locked && '!opacity-60 pointer-events-none',
            )}>
            <Trash2 size={10} />
          </button>
        )}

        {/* Lock badge */}
        {locked && (
          <div className="absolute -top-3 -left-3 w-6 h-6
                          bg-amber-500 text-white
                          rounded-full flex items-center justify-center
                          shadow-md z-[999]">
            <Lock size={10} />
          </div>
        )}

        {isSelected && (
          <>
            {['-top-1 -left-1','-top-1 -right-1',
              '-bottom-1 -left-1','-bottom-1 -right-1'].map(pos => (
              <div key={pos}
                className={`absolute ${pos} w-2.5 h-2.5
                            bg-amber-400 rounded-sm z-10`} />
            ))}
          </>
        )}
      </div>
    </Rnd>
  );
});
FieldOverlay.displayName = 'FieldOverlay';

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
export default function PdfViewer({
  fileUrl,
  localFile          = null,
  fields             = [],
  onFieldsChange,
  currentPage        = 1,
  onPageChange,
  onTotalPagesChange,
  pendingFieldType,
  selectedPartyIndex = 0,
  parties            = [],
  onFieldPlaced,
  readOnly           = false,
  selectedFieldId,
  onFieldSelect,
  fontFamily         = 'Helvetica',
  fontSize           = 14,
}) {
  const canvasRef     = useRef(null);
  const containerRef  = useRef(null);
  const wrapRef       = useRef(null);
  const overlayRef    = useRef(null);
  const renderTaskRef = useRef(null);
  const pdfDocRef     = useRef(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const debounceRef   = useRef(null);
  const lastWidthRef  = useRef(0);
  const localFileKey  = useMemo(() => {
    if (!localFile) return '';
    return `${localFile.name}-${localFile.size}-${localFile.lastModified}`;
  }, [localFile]);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loading,    setLoading]    = useState(true);
  const [rendered,   setRendered]   = useState(false);
  const [error,      setError]      = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom,       setZoom]       = useState(1);
  const [loadKey,    setLoadKey]    = useState(0);

  const fieldsRef = useRef(fields);
  useEffect(() => { fieldsRef.current = fields; }, [fields]);

  const currentPageFields = useMemo(
    () => fields.filter(f => Number(f.page) === Number(currentPage)),
    [fields, currentPage],
  );

  // ── Load PDF ────────────────────────────────────────────────
  useEffect(() => {
    const source = localFile || fileUrl;
    if (!source) return;
    let cancelled = false;
    setLoading(true);
    setRendered(false);
    setError(null);
    setCanvasSize({ width: 0, height: 0 });
    canvasSizeRef.current = { width: 0, height: 0 };
    pdfDocRef.current = null;
    lastWidthRef.current = 0;

    (async () => {
      try {
        const doc = await loadPdfDocument(source, { timeoutMs: 45_000 });

        if (cancelled) return;
        pdfDocRef.current = doc;
        const pages = doc.numPages;
        setTotalPages(pages);
        onTotalPagesChange?.(pages);
      } catch (e) {
        if (!cancelled) {
          console.error('[PdfViewer load]', e);
          setError('Failed to load PDF.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        pdfDocRef.current?.destroy?.();
      } catch { /* ignore */ }
      pdfDocRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, localFileKey, loadKey]);

  // ── Render page ─────────────────────────────────────────────
  const renderPage = useCallback(async () => {
    const doc       = pdfDocRef.current;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container) return;

    const avail = container.clientWidth;
    if (avail < 80) return;

    try { renderTaskRef.current?.cancel(); } catch (_) {}

    try {
      const page  = await doc.getPage(currentPage);
      const base    = page.getViewport({ scale: 1 });
      const fit     = Math.max(avail - 8, 320) / base.width;
      const scale   = fit * zoom;
      const vp      = page.getViewport({ scale });
      const dpr     = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width        = vp.width  * dpr;
      canvas.height       = vp.height * dpr;
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, vp.width, vp.height);

      const size = { width: vp.width, height: vp.height };
      const prev = canvasSizeRef.current;
      canvasSizeRef.current = size;
      if (
        Math.abs(prev.width  - size.width)  > 1 ||
        Math.abs(prev.height - size.height) > 1
      ) {
        setCanvasSize(size);
      }

      renderTaskRef.current = page.render({ canvasContext: ctx, viewport: vp });
      await renderTaskRef.current.promise;
      setRendered(true);
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException')
        console.error('[PdfViewer render]', err);
    }
  }, [currentPage, zoom]);

  // Render when doc is ready and container has width
  useEffect(() => {
    if (loading || error || !pdfDocRef.current) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const w = containerRef.current?.clientWidth || 0;
      if (w < 80) {
        requestAnimationFrame(run);
        return;
      }
      renderPage();
    };
    run();
    return () => { cancelled = true; };
  }, [loading, error, renderPage]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new ResizeObserver(() => {
      if (loading || error || !pdfDocRef.current) return;
      const w = el.clientWidth;
      if (Math.abs(w - lastWidthRef.current) < 8) return;
      lastWidthRef.current = w;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => renderPage(), 250);
    });

    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(debounceRef.current);
    };
  }, [loading, error, renderPage]);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    if (readOnly) return;
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        onFieldsChange(fieldsRef.current.filter(f => f.id !== selectedFieldId));
        onFieldSelect?.(null);
      }
      if (e.key === 'Escape') onFieldSelect?.(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [readOnly, selectedFieldId, onFieldsChange, onFieldSelect]);

  // ════════════════════════════════════════════════════════════
  // ✅ FIXED: Field placement — supports BOTH mouse AND touch
  // ════════════════════════════════════════════════════════════
  const placeField = useCallback((clientX, clientY) => {
    if (readOnly || !pendingFieldType || !rendered) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = canvasSizeRef.current;
    if (!s.width || !s.height) return;

    const rect = canvas.getBoundingClientRect();
    const meta = FIELD_META[pendingFieldType] || FIELD_META.text;
    const fW   = meta.defaultW;
    const fH   = meta.defaultH;

    // ✅ coords relative to canvas
    const xPct = ((clientX - rect.left)  / s.width)  * 100 - fW / 2;
    const yPct = ((clientY - rect.top)   / s.height) * 100 - fH / 2;

    const newField = {
      id:         `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type:       pendingFieldType,
      page:       currentPage,
      x:          +Math.max(0, Math.min(100 - fW, xPct)).toFixed(4),
      y:          +Math.max(0, Math.min(100 - fH, yPct)).toFixed(4),
      width:      fW,
      height:     fH,
      partyIndex: Number(selectedPartyIndex),
      value:      '',
      fontFamily,
      fontSize,
    };

    onFieldsChange([...fieldsRef.current, newField]);
    onFieldSelect?.(newField.id);
    onFieldPlaced?.();
  }, [
    readOnly, pendingFieldType, rendered,
    currentPage, selectedPartyIndex,
    fontFamily, fontSize,
    onFieldsChange, onFieldPlaced, onFieldSelect,
  ]);

  // ✅ Mouse click handler
  const handleOverlayClick = useCallback((e) => {
    if (readOnly || !pendingFieldType || !rendered) return;
    // ✅ allow click anywhere on overlay — removed strict target check
    placeField(e.clientX, e.clientY);
  }, [readOnly, pendingFieldType, rendered, placeField]);

  // ✅ Touch handler — NEW
  const handleOverlayTouch = useCallback((e) => {
    if (readOnly || !pendingFieldType || !rendered) return;
    // Prevent scroll when placing field
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    placeField(touch.clientX, touch.clientY);
  }, [readOnly, pendingFieldType, rendered, placeField]);

  // ── Field update / remove ───────────────────────────────────
  const updateField = useCallback((id, patch) => {
    onFieldsChange(
      fieldsRef.current.map(f => f.id === id ? { ...f, ...patch } : f)
    );
  }, [onFieldsChange]);

  const removeField = useCallback((id) => {
    onFieldsChange(fieldsRef.current.filter(f => f.id !== id));
    if (selectedFieldId === id) onFieldSelect?.(null);
  }, [onFieldsChange, selectedFieldId, onFieldSelect]);

  // ── Zoom ────────────────────────────────────────────────────
  const zoomIdx    = ZOOM_STEPS.indexOf(zoom);
  const canZoomIn  = zoomIdx < ZOOM_STEPS.length - 1;
  const canZoomOut = zoomIdx > 0;
  const zoomIn  = () => { if (canZoomIn)  setZoom(ZOOM_STEPS[zoomIdx + 1]); };
  const zoomOut = () => { if (canZoomOut) setZoom(ZOOM_STEPS[zoomIdx - 1]); };
  const zoomFit = () => setZoom(1);

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div ref={wrapRef}
      className="flex-1 w-full h-full min-h-0 flex flex-col
                 bg-slate-100 dark:bg-slate-950
                 overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2
                      px-3 py-2 bg-white dark:bg-slate-900
                      border-b border-slate-200 dark:border-slate-800
                      sticky top-0 z-30 flex-wrap gap-y-1.5">

        {/* Page nav */}
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1} title="Previous page">
            <ChevronLeft size={15} />
          </IconBtn>

          <div className="flex items-center gap-1 px-2.5 py-1
                          bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-xs font-black text-slate-700
                             dark:text-slate-300 tabular-nums">
              {currentPage}
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-400 tabular-nums">
              {totalPages || '—'}
            </span>
          </div>

          <IconBtn
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages} title="Next page">
            <ChevronRight size={15} />
          </IconBtn>
        </div>

        {/* Pending field indicator */}
        {pendingFieldType && !readOnly && (
          <div className="flex items-center gap-1.5 px-2.5 py-1
                          rounded-xl bg-sky-50 dark:bg-sky-900/30
                          border border-sky-200 dark:border-sky-800
                          flex-1 min-w-0 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            <span className="text-[10px] font-black text-sky-600
                             dark:text-sky-400 uppercase tracking-wide
                             truncate">
              Tap PDF → {pendingFieldType}
            </span>
            <button type="button" onClick={() => onFieldPlaced?.()}
              className="text-sky-400 hover:text-sky-600 shrink-0 ml-1">
              <RotateCcw size={11} />
            </button>
          </div>
        )}

        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <IconBtn onClick={zoomOut} disabled={!canZoomOut} title="Zoom out">
            <ZoomOut size={14} />
          </IconBtn>
          <button type="button" onClick={zoomFit}
            className="px-2 h-8 rounded-lg text-xs font-black
                       text-slate-600 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800
                       transition-colors tabular-nums min-w-[2.8rem]"
            title="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn onClick={zoomIn} disabled={!canZoomIn} title="Zoom in">
            <ZoomIn size={14} />
          </IconBtn>
          <IconBtn onClick={zoomFit} title="Fit to width">
            <Maximize2 size={13} />
          </IconBtn>
        </div>
      </div>

      {/* ── Canvas area ─────────────────────────────────────── */}
      <div ref={containerRef}
        className="flex-1 overflow-auto w-full
                   p-3 sm:p-4
                   flex flex-col items-center
                   min-h-[480px] relative">

        {loading && !error && !rendered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 size={22} className="text-slate-300 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="w-full flex flex-col items-center
                          justify-center py-16 gap-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30
                            rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div className="text-center px-4">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                Failed to load PDF
              </p>
              <p className="text-sm text-slate-500 max-w-xs">{error}</p>
            </div>
            <button type="button" onClick={() => setLoadKey(k => k + 1)}
              className="flex items-center gap-2 px-5 py-2.5
                         bg-sky-500 hover:bg-sky-600 text-white
                         rounded-xl text-sm font-bold transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* PDF canvas + field overlays */}
        {!error && (
          <div
            className="relative bg-white w-full max-w-5xl mx-auto
                       shadow-sm rounded-sm mb-4"
            style={{
              width:     canvasSize.width  ? `${canvasSize.width}px`  : '100%',
              maxWidth:  '100%',
              minHeight: canvasSize.height ? undefined : 480,
              height:    canvasSize.height || undefined,
              opacity:   rendered ? 1 : 0,
            }}
          >

            {/* Canvas */}
            <canvas ref={canvasRef}
              className="block rounded-sm"
              style={{ display: 'block' }} />

            {/* ✅ Overlay — mouse + touch both handled */}
            <div
              ref={overlayRef}
              className="absolute inset-0"
              style={{
                cursor: pendingFieldType && !readOnly
                  ? 'crosshair' : 'default',
                // ✅ touch-action: none — prevent scroll when placing
                touchAction: pendingFieldType && !readOnly
                  ? 'none' : 'auto',
              }}
              onClick={handleOverlayClick}
              onTouchEnd={handleOverlayTouch}
            >
              {/* Field overlays */}
              {rendered && canvasSize.width > 0 && currentPageFields.map(field => (
                <FieldOverlay
                  key={field.id}
                  field={field}
                  canvasSize={canvasSize}
                  canvasSizeRef={canvasSizeRef}
                  party={parties[field.partyIndex]}
                  isSelected={selectedFieldId === field.id}
                  readOnly={readOnly}
                  onSelect={onFieldSelect}
                  onUpdate={updateField}
                  onRemove={removeField}
                />
              ))}
            </div>

            {/* Field count badge */}
            {currentPageFields.length > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5
                              bg-black/50 backdrop-blur-sm rounded-lg
                              text-[10px] font-black text-white
                              pointer-events-none">
                {currentPageFields.length} field
                {currentPageFields.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Page dots */}
        {totalPages > 1 && totalPages <= 20 && rendered && (
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} type="button"
                onClick={() => onPageChange?.(i + 1)}
                className={cn(
                  'transition-all duration-150 rounded-full',
                  currentPage === i + 1
                    ? 'w-5 h-2 bg-sky-500'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600',
                )} />
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint — desktop only */}
      {!readOnly && selectedFieldId && (
        <div className="hidden sm:flex px-4 py-2
                        bg-amber-50 dark:bg-amber-900/20
                        border-t border-amber-200 dark:border-amber-800/40
                        items-center gap-2">
          <span className="text-[10px] font-bold
                           text-amber-700 dark:text-amber-400">
            Field selected —
          </span>
          <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300
                          rounded text-[9px] font-mono
                          text-amber-700 dark:text-amber-400">
            Delete
          </kbd>
          <span className="text-[10px] text-amber-600">to remove</span>
        </div>
      )}
    </div>
  );
}