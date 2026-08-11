// src/components/editor/FieldToolbar.jsx
import React, { useState, useCallback } from 'react';
import {
  PenTool, Type, Calendar, CheckSquare,
  Fingerprint, ChevronDown, ChevronUp,
  MousePointer2, Palette, AlignLeft,
  Hash, Info,
} from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Party colors ─────────────────────────────────────────────────
const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
  '#6366f1', '#14b8a6',
];

// ─── Field types config ───────────────────────────────────────────
const FIELD_TYPES = [
  {
    id:    'signature',
    label: 'Signature',
    icon:  PenTool,
    desc:  'Hand-drawn or typed signature',
    color: 'sky',
  },
  {
    id:    'initial',
    label: 'Initial',
    icon:  Fingerprint,
    desc:  'Initials only',
    color: 'violet',
  },
  {
    id:    'date',
    label: 'Date',
    icon:  Calendar,
    desc:  'Auto-fills signing date',
    color: 'emerald',
  },
  {
    id:    'text',
    label: 'Text',
    icon:  Type,
    desc:  'Free text input field',
    color: 'amber',
  },
  {
    id:    'checkbox',
    label: 'Checkbox',
    icon:  CheckSquare,
    desc:  'Yes / No checkbox',
    color: 'rose',
  },
  {
    id:    'number',
    label: 'Number',
    icon:  Hash,
    desc:  'Numeric input field',
    color: 'indigo',
  },
];

const FIELD_COLORS = {
  sky:    'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 ring-sky-400',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 ring-violet-400',
  emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 ring-emerald-400',
  amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 ring-amber-400',
  rose:   'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 ring-rose-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 ring-indigo-400',
};

// ─── Font options ──────────────────────────────────────────────────
const FONT_FAMILIES = [
  { value: 'Inter',        label: 'Inter'        },
  { value: 'Georgia',      label: 'Georgia'      },
  { value: 'Courier New',  label: 'Courier New'  },
  { value: 'Arial',        label: 'Arial'        },
  { value: 'Dancing Script', label: 'Script'     },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

// ─── Section wrapper ──────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp   size={13} className="text-slate-400" />
          : <ChevronDown size={13} className="text-slate-400" />
        }
      </button>
      {open && (
        <div className="p-3 bg-white dark:bg-slate-900/40">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Custom select ────────────────────────────────────────────────
const NativeSelect = ({ value, onChange, children, className }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn(
        'w-full h-9 pl-3 pr-8 rounded-lg text-xs font-medium border appearance-none outline-none cursor-pointer',
        'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200',
        'border-slate-200 dark:border-slate-700',
        'focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20',
        'transition-colors',
        className,
      )}
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
    />
  </div>
);

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
export default function FieldToolbar({
  parties             = [],
  selectedPartyIndex  = 0,
  onPartySelect,
  onAddField,
  // optional font/style state lifted to parent
  fontFamily,
  fontSize,
  onFontFamilyChange,
  onFontSizeChange,
  // active field type (parent can track what user last clicked)
  activeFieldType,
  onActiveFieldTypeChange,
}) {
  const [showHint, setShowHint] = useState(false);

  // ── Selected party data ────────────────────────────────────────
  const selectedParty = parties[selectedPartyIndex];
  const partyColor    = selectedParty?.color
    || PARTY_COLORS[selectedPartyIndex % PARTY_COLORS.length];

  // ── Handle field add ───────────────────────────────────────────
  const handleAddField = useCallback((typeId) => {
    onActiveFieldTypeChange?.(typeId);
    onAddField?.(typeId, selectedPartyIndex);
  }, [onAddField, onActiveFieldTypeChange, selectedPartyIndex]);

  if (!parties.length) return null;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3 select-none">

      {/* ── Party selector ─────────────────────────────────────── */}
      <Section title="Assign to Party" icon={Palette} defaultOpen={true}>
        <div className="space-y-2">
          {parties.map((p, i) => {
            const pc      = p.color || PARTY_COLORS[i % PARTY_COLORS.length];
            const isActive = i === selectedPartyIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPartySelect?.(i)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-150',
                  isActive
                    ? 'border-current bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
                style={isActive ? { borderColor: pc, color: pc } : {}}
              >
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: pc }}
                />
                {/* Name */}
                <span className={cn(
                  'text-xs font-bold flex-1 truncate',
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400',
                )}>
                  {p.name || `Signer ${i + 1}`}
                </span>
                {/* Party number badge */}
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ backgroundColor: pc }}
                >
                  P{i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Field types ────────────────────────────────────────── */}
      <Section title="Field Types" icon={MousePointer2} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map(({ id, label, icon: Icon, desc, color }) => {
            const isActive = activeFieldType === id;
            const colorCls = FIELD_COLORS[color];

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleAddField(id)}
                title={desc}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 active:scale-[0.96] group',
                  isActive
                    ? cn(colorCls, 'border-current ring-2 ring-offset-1 shadow-sm')
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60',
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  isActive
                    ? colorCls
                    : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700',
                )}>
                  <Icon size={15} className={isActive ? 'inherit' : 'text-slate-500 dark:text-slate-400'} />
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-wide leading-none',
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400',
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active field indicator */}
        {activeFieldType && (
          <div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold"
            style={{
              backgroundColor: `${partyColor}15`,
              border: `1px solid ${partyColor}30`,
              color: partyColor,
            }}
          >
            <MousePointer2 size={11} className="animate-pulse" />
            Click on PDF to place{' '}
            <span className="font-black capitalize">{activeFieldType}</span>
            {' '}for{' '}
            <span className="font-black">
              {selectedParty?.name || `Signer ${selectedPartyIndex + 1}`}
            </span>
          </div>
        )}
      </Section>

      {/* ── Font controls (only for text fields) ──────────────── */}
      {(activeFieldType === 'text' || activeFieldType === 'number') && (
        <Section title="Text Style" icon={AlignLeft} defaultOpen={true}>
          <div className="space-y-2">
            {/* Font family */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Font Family
              </label>
              <NativeSelect
                value={fontFamily || 'Inter'}
                onChange={onFontFamilyChange || (() => {})}
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value}
                    style={{ fontFamily: f.value }}>
                    {f.label}
                  </option>
                ))}
              </NativeSelect>
            </div>

            {/* Font size */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <NativeSelect
                  value={fontSize || 14}
                  onChange={v => onFontSizeChange?.(Number(v))}
                  className="flex-1"
                >
                  {FONT_SIZES.map(s => (
                    <option key={s} value={s}>{s}px</option>
                  ))}
                </NativeSelect>

                {/* Quick size buttons */}
                <div className="flex gap-1">
                  {['-', '+'].map(op => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => {
                        const cur = fontSize || 14;
                        const idx = FONT_SIZES.indexOf(cur);
                        if (op === '-' && idx > 0)
                          onFontSizeChange?.(FONT_SIZES[idx - 1]);
                        if (op === '+' && idx < FONT_SIZES.length - 1)
                          onFontSizeChange?.(FONT_SIZES[idx + 1]);
                      }}
                      className="w-8 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-sky-300 transition-colors"
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span
                className="text-slate-700 dark:text-slate-300"
                style={{
                  fontFamily: fontFamily || 'Inter',
                  fontSize:   `${fontSize || 14}px`,
                  lineHeight: 1.4,
                }}
              >
                Sample Text Preview
              </span>
            </div>
          </div>
        </Section>
      )}

      {/* ── Hint ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowHint(o => !o)}
        className="w-full flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-sky-500 transition-colors"
      >
        <Info size={11} />
        How to place fields?
        {showHint ? <ChevronUp size={11} className="ml-auto" /> : <ChevronDown size={11} className="ml-auto" />}
      </button>

      {showHint && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <p>① Select a <span className="font-bold text-slate-700 dark:text-slate-300">party</span> above</p>
          <p>② Click a <span className="font-bold text-slate-700 dark:text-slate-300">field type</span> button</p>
          <p>③ Click anywhere on the <span className="font-bold text-slate-700 dark:text-slate-300">PDF</span> to place</p>
          <p>④ Drag to <span className="font-bold text-slate-700 dark:text-slate-300">reposition</span>, drag corners to <span className="font-bold text-slate-700 dark:text-slate-300">resize</span></p>
        </div>
      )}
    </div>
  );
}