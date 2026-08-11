// src/components/signing/SignaturePad.jsx
import React, {
  useRef, useState, useCallback,
  useEffect,
} from 'react';
import {
  Trash2, Check, PenTool, Type,
  Upload, ChevronDown, X,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const cn = (...c) => c.filter(Boolean).join(' ');

const clampFontSize = (len) => {
  if (len <= 6)  return 44;
  if (len <= 12) return 36;
  if (len <= 20) return 28;
  return 22;
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const SIG_FONTS = [
  { label: 'Cursive',   value: "'Brush Script MT', cursive"         },
  { label: 'Elegant',   value: "'Great Vibes', cursive"             },
  { label: 'Classic',   value: "'Times New Roman', Georgia, serif"  },
  { label: 'Modern',    value: "'Arial', 'Helvetica', sans-serif"   },
  { label: 'Monospace', value: "'Courier New', monospace"           },
];

const INK_COLORS = [
  { label: 'Black',     value: '#1a202c' },
  { label: 'Dark Blue', value: '#1e3a5f' },
  { label: 'Blue',      value: '#2563eb' },
  { label: 'Dark Green',value: '#14532d' },
];

const TABS = [
  { id: 'draw',   label: 'Draw',   icon: PenTool },
  { id: 'type',   label: 'Type',   icon: Type    },
  { id: 'upload', label: 'Upload', icon: Upload  },
];

// ═══════════════════════════════════════════════════════════════
// TAB BUTTON
// ═══════════════════════════════════════════════════════════════
function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5',
        'py-2.5 rounded-xl text-xs font-bold uppercase',
        'tracking-wider transition-all duration-150',
        active
          ? 'bg-white dark:bg-slate-800 text-[#28ABDF] shadow-sm'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400',
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// DRAW TAB
// ═══════════════════════════════════════════════════════════════
function DrawTab({ onConfirm, inkColor, height = 160 }) {
  const canvasRef   = useRef(null);
  const wrapRef     = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef({ x: 0, y: 0 });
  const lastTime    = useRef(0);
  const points      = useRef([]);

  const [isEmpty, setIsEmpty] = useState(true);

  // ── Setup ────────────────────────────────────────────────
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = wrap.clientWidth  || 300;
    const h   = height;

    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    setIsEmpty(true);
  }, [height]);

  useEffect(() => { setup(); }, [setup]);

  useEffect(() => {
    const obs = new ResizeObserver(setup);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [setup]);

  // ── Pointer ──────────────────────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches?.[0] || e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastTime.current  = Date.now();
    const pos = getPos(e);
    lastPos.current = pos;
    points.current  = [pos];

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;

    const now  = Date.now();
    const pos  = getPos(e);
    points.current.push(pos);

    // Speed → pressure sim
    const dx    = pos.x - lastPos.current.x;
    const dy    = pos.y - lastPos.current.y;
    const dist  = Math.sqrt(dx * dx + dy * dy);
    const dt    = Math.max(now - lastTime.current, 1);
    const speed = dist / dt;
    const lw    = Math.max(0.8, Math.min(3.5, 3.5 - speed * 0.6));

    ctx.strokeStyle = inkColor;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Smooth bezier
    const pts = points.current;
    if (pts.length >= 3) {
      const p1  = pts[pts.length - 3];
      const p2  = pts[pts.length - 2];
      const p3  = pts[pts.length - 1];
      const cp1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const cp2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(cp1.x, cp1.y);
      ctx.quadraticCurveTo(p2.x, p2.y, cp2.x, cp2.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current  = pos;
    lastTime.current = now;
    if (isEmpty) setIsEmpty(false);
  }, [getPos, inkColor, isEmpty]);

  const endDraw = useCallback((e) => {
    e?.preventDefault();
    isDrawing.current = false;
    points.current    = [];
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    points.current = [];
    setIsEmpty(true);
  }, []);

  const handleApply = useCallback(() => {
    if (isEmpty) return;
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (dataUrl) onConfirm(dataUrl);
  }, [isEmpty, onConfirm]);

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div
        ref={wrapRef}
        className="relative rounded-2xl overflow-hidden border-2
                   border-dashed border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-900/50"
        style={{ touchAction: 'none', minHeight: height }}
      >
        {/* Baseline guide */}
        <div className="absolute bottom-10 left-5 right-5 h-px
                        bg-slate-100 dark:bg-slate-800
                        pointer-events-none" />

        <canvas
          ref={canvasRef}
          className="block cursor-crosshair w-full"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center
                          justify-center gap-2 pointer-events-none">
            <PenTool size={22} className="text-slate-200
                                         dark:text-slate-700" />
            <p className="text-sm text-slate-300 dark:text-slate-600
                          font-medium">
              Draw your signature here
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={isEmpty}
          className="flex-1 h-10 rounded-xl border border-slate-200
                     dark:border-slate-700 flex items-center justify-center
                     gap-2 text-sm font-semibold text-slate-600
                     dark:text-slate-400 hover:bg-slate-50
                     dark:hover:bg-slate-800 disabled:opacity-40
                     transition-colors"
        >
          <Trash2 size={14} /> Clear
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={isEmpty}
          className="flex-1 h-10 rounded-xl bg-emerald-500
                     hover:bg-emerald-600 text-white flex items-center
                     justify-center gap-2 text-sm font-semibold
                     disabled:opacity-40 transition-colors shadow-sm"
        >
          <Check size={14} /> Apply
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TYPE TAB
// ═══════════════════════════════════════════════════════════════
function TypeTab({ onConfirm, inkColor }) {
  const [text,      setText]      = useState('');
  const [fontIdx,   setFontIdx]   = useState(0);
  const [showFonts, setShowFonts] = useState(false);

  const selectedFont = SIG_FONTS[fontIdx];

  const handleApply = useCallback(() => {
    if (!text.trim()) return;

    // ✅ Use a Promise to wait for font to load
    const canvas = document.createElement('canvas');
    canvas.width  = 600;
    canvas.height = 200;

    const render = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let fSize = 72;
      ctx.font  = `italic ${fSize}px ${selectedFont.value}`;
      const maxW = canvas.width - 40;
      while (
        ctx.measureText(text.trim()).width > maxW && fSize > 20
      ) {
        fSize -= 2;
        ctx.font = `italic ${fSize}px ${selectedFont.value}`;
      }

      ctx.fillStyle    = inkColor;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.trim(), canvas.width / 2, canvas.height / 2);

      onConfirm(canvas.toDataURL('image/png'));
    };

    // ✅ Load font first
    if ('fonts' in document) {
      document.fonts
        .load(`italic 72px ${selectedFont.value}`)
        .then(render)
        .catch(render); // fallback
    } else {
      render();
    }
  }, [text, selectedFont, inkColor, onConfirm]);

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Type your full name…"
          autoFocus
          className="w-full h-14 px-4 rounded-2xl border-2 outline-none
                     bg-white dark:bg-slate-900
                     border-slate-200 dark:border-slate-700
                     focus:border-[#28ABDF] dark:focus:border-[#28ABDF]
                     focus:ring-4 focus:ring-[#28ABDF]/10
                     transition-all text-2xl text-slate-800 dark:text-white
                     placeholder:text-slate-300 dark:placeholder:text-slate-600"
          style={{
            fontFamily: selectedFont.value,
            fontStyle:  'italic',
          }}
        />
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       w-6 h-6 rounded-full bg-slate-100
                       dark:bg-slate-800 flex items-center
                       justify-center text-slate-400
                       hover:text-slate-600 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Font picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowFonts(o => !o)}
          className="w-full flex items-center justify-between px-4
                     h-10 rounded-xl border border-slate-200
                     dark:border-slate-700 bg-white dark:bg-slate-900
                     text-sm hover:border-slate-300
                     dark:hover:border-slate-600 transition-colors"
        >
          <span className="text-slate-400 text-xs font-bold
                           uppercase tracking-wider">
            Font:
          </span>
          <span
            style={{
              fontFamily: selectedFont.value,
              fontStyle:  'italic',
              fontSize:   18,
            }}
            className="text-slate-800 dark:text-slate-200"
          >
            {selectedFont.label}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-slate-400 transition-transform',
              showFonts && 'rotate-180',
            )}
          />
        </button>

        {showFonts && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20
                          bg-white dark:bg-slate-900 border
                          border-slate-200 dark:border-slate-700
                          rounded-xl shadow-xl overflow-hidden">
            {SIG_FONTS.map((f, i) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFontIdx(i); setShowFonts(false); }}
                className={cn(
                  'w-full flex items-center justify-between',
                  'px-4 py-3 text-sm transition-colors',
                  i === fontIdx
                    ? 'bg-[#28ABDF]/10 text-[#28ABDF]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                )}
              >
                <span className="text-xs font-bold text-slate-400">
                  {f.label}
                </span>
                <span
                  style={{
                    fontFamily: f.value,
                    fontStyle:  'italic',
                    fontSize:   20,
                  }}
                >
                  {text || 'Preview'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live preview */}
      {text.trim() && (
        <div className="relative border-2 border-dashed
                        border-slate-200 dark:border-slate-700
                        rounded-2xl bg-white dark:bg-slate-900/50
                        min-h-[80px] flex items-center
                        justify-center overflow-hidden px-4">
          <div className="absolute bottom-4 left-6 right-6 h-px
                          bg-slate-100 dark:bg-slate-800" />
          <span
            className="select-none z-10 text-center"
            style={{
              fontFamily: selectedFont.value,
              fontStyle:  'italic',
              fontSize:   clampFontSize(text.length),
              color:      inkColor,
            }}
          >
            {text}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleApply}
        disabled={!text.trim()}
        className="w-full h-10 rounded-xl bg-emerald-500
                   hover:bg-emerald-600 text-white flex items-center
                   justify-center gap-2 text-sm font-semibold
                   disabled:opacity-40 transition-colors shadow-sm"
      >
        <Check size={14} /> Apply Signature
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UPLOAD TAB
// ═══════════════════════════════════════════════════════════════
function UploadTab({ onConfirm }) {
  const inputRef   = useRef(null);
  const [preview,  setPreview]  = useState(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }, [processFile]);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          'rounded-2xl border-2 border-dashed cursor-pointer',
          'transition-all duration-200 py-8',
          dragging
            ? 'border-[#28ABDF] bg-sky-50 dark:bg-sky-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-[#28ABDF]/50 bg-white dark:bg-slate-900/50',
        )}
      >
        <div className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center',
          'transition-colors',
          dragging
            ? 'bg-[#28ABDF]/10'
            : 'bg-slate-100 dark:bg-slate-800',
        )}>
          <Upload
            size={20}
            className={dragging ? 'text-[#28ABDF]' : 'text-slate-400'}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {dragging ? 'Drop here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            PNG, JPG (transparent background recommended)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => processFile(e.target.files?.[0])}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative rounded-2xl border-2
                        border-slate-200 dark:border-slate-700
                        bg-white dark:bg-slate-900 overflow-hidden">
          {/* Checkerboard for transparency */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)',
              backgroundSize: '16px 16px',
            }}
          />
          <img
            src={preview}
            alt="Signature"
            className="relative z-10 w-full h-28 object-contain p-3"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 z-20 w-6 h-6
                       bg-red-500 hover:bg-red-600 rounded-full
                       flex items-center justify-center text-white
                       transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => preview && onConfirm(preview)}
        disabled={!preview}
        className="w-full h-10 rounded-xl bg-emerald-500
                   hover:bg-emerald-600 text-white flex items-center
                   justify-center gap-2 text-sm font-semibold
                   disabled:opacity-40 transition-colors shadow-sm"
      >
        <Check size={14} /> Use This Signature
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN — SignaturePad
// ═══════════════════════════════════════════════════════════════
export default function SignaturePad({
  // ✅ Both props supported
  onChange,              // called on every confirm (TemplateDetail)
  onSignatureComplete,   // legacy alias
  height = 160,          // canvas height
  partyName,
  partyColor,
  showApplyButton = true,// hide if parent controls submit
}) {
  const [activeTab, setActiveTab] = useState('draw');
  const [inkColor,  setInkColor]  = useState('#1a202c');
  const [confirmed, setConfirmed] = useState(null);

  const handleConfirm = useCallback((dataUrl) => {
    setConfirmed(dataUrl);
    // ✅ Call both — whichever is provided
    onChange?.(dataUrl);
    onSignatureComplete?.(dataUrl);
  }, [onChange, onSignatureComplete]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setConfirmed(null);
  };

  return (
    <div className="space-y-4">

      {/* Party label */}
      {partyName && (
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: partyColor || '#28ABDF' }}
          />
          <span className="text-xs font-bold uppercase tracking-wider
                           text-slate-500 dark:text-slate-400">
            Signing as{' '}
            <span className="text-slate-900 dark:text-white">
              {partyName}
            </span>
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60
                      rounded-2xl p-1.5 border border-slate-200
                      dark:border-slate-700">
        {TABS.map(t => (
          <TabBtn
            key={t.id}
            active={activeTab === t.id}
            onClick={() => handleTabChange(t.id)}
            icon={t.icon}
            label={t.label}
          />
        ))}
      </div>

      {/* Ink color */}
      {activeTab !== 'upload' && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase
                           tracking-wider text-slate-400">
            Ink:
          </span>
          <div className="flex gap-2">
            {INK_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setInkColor(c.value)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-transform',
                  inkColor === c.value
                    ? 'border-[#28ABDF] scale-125'
                    : 'border-transparent hover:scale-110',
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'draw' && (
        <DrawTab
          onConfirm={handleConfirm}
          inkColor={inkColor}
          height={height}
        />
      )}
      {activeTab === 'type' && (
        <TypeTab
          onConfirm={handleConfirm}
          inkColor={inkColor}
        />
      )}
      {activeTab === 'upload' && (
        <UploadTab onConfirm={handleConfirm} />
      )}

      {/* Confirmed preview (optional feedback) */}
      {confirmed && (
        <div className="flex items-center gap-2 px-3 py-2
                        rounded-xl bg-emerald-50 dark:bg-emerald-900/20
                        border border-emerald-200
                        dark:border-emerald-800/50">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold text-emerald-700
                           dark:text-emerald-400">
            Signature ready
          </span>
          <img
            src={confirmed}
            alt="sig"
            className="ml-auto h-8 max-w-[80px] object-contain"
          />
        </div>
      )}
    </div>
  );
}