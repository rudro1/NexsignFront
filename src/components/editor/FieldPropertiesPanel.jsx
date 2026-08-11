// src/components/editor/FieldPropertiesPanel.jsx
// Module 1 — Field Properties Panel
// Shows when a field is selected. Lets user edit label, font, required, party.
import React, { useCallback } from 'react';
import {
  PenTool, Type, Calendar, CheckSquare,
  Fingerprint, Hash, Trash2, X,
  AlignLeft, Bold, ChevronDown, Lock, Unlock,
} from 'lucide-react';

const FIELD_META = {
  signature: { icon: PenTool,     label: 'Signature Block',  color: 'text-violet-500' },
  initial:   { icon: Fingerprint, label: 'Initials Field',   color: 'text-indigo-500' },
  date:      { icon: Calendar,    label: 'Date Field',       color: 'text-amber-500'  },
  text:      { icon: Type,        label: 'Text Field',       color: 'text-sky-500'    },
  checkbox:  { icon: CheckSquare, label: 'Checkbox Field',   color: 'text-emerald-500'},
  number:    { icon: Hash,        label: 'Number Field',     color: 'text-rose-500'   },
};

const FONT_FAMILIES = [
  { label: 'Helvetica',       value: 'Helvetica'       },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier',         value: 'Courier'         },
  { label: 'Arial',           value: 'Arial'           },
  { label: 'Georgia',         value: 'Georgia'         },
];
const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32];

const PARTY_COLORS = [
  '#0ea5e9','#8b5cf6','#f59e0b',
  '#10b981','#ef4444','#ec4899',
  '#6366f1','#14b8a6',
];

// ── tiny helpers ─────────────────────────────────────────────────
const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 w-20">
      {label}
    </span>
    <div className="flex-1 flex justify-end">{children}</div>
  </div>
);

const Select = ({ value, onChange, children, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full appearance-none bg-slate-50 dark:bg-slate-800
                 border border-slate-200 dark:border-slate-700
                 rounded-lg px-2.5 py-1.5 pr-7
                 text-xs font-medium text-slate-700 dark:text-slate-200
                 focus:outline-none focus:ring-2 focus:ring-sky-400/50
                 cursor-pointer transition-all"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer
        ${checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}
      style={{ minWidth: 32, height: 18 }}
    >
      <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white
                        shadow transition-transform duration-200
                        ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
    <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>
  </label>
);

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
/**
 * FieldPropertiesPanel
 *
 * Props:
 *   field      {object}   — the selected field object
 *   parties    {array}    — [{name, email, color}, ...]
 *   onUpdate   {fn(patch)} — partial update to field (will be merged)
 *   onRemove   {fn()}     — delete the field
 *   onClose    {fn()}     — deselect / close panel
 */
export default function FieldPropertiesPanel({
  field,
  parties = [],
  onUpdate,
  onRemove,
  onClose,
}) {
  if (!field) return null;

  const meta    = FIELD_META[field.type] || FIELD_META.text;
  const Icon    = meta.icon;
  const isSig   = field.type === 'signature' || field.type === 'initial';
  const isCheck = field.type === 'checkbox';

  const update = useCallback((patch) => onUpdate(patch), [onUpdate]);

  return (
    <aside
      className="w-full h-full flex flex-col bg-white dark:bg-slate-900
                 border-l border-slate-200 dark:border-slate-800 overflow-hidden"
      aria-label="Field properties"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800
                          flex items-center justify-center">
            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
              {meta.label}
            </p>
            <p className="text-[10px] text-slate-400">
              Page {field.page} · {field.x?.toFixed(1)}%, {field.y?.toFixed(1)}%
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center
                     text-slate-400 hover:text-slate-600 hover:bg-slate-100
                     dark:hover:bg-slate-800 transition-all"
          aria-label="Close properties"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Scrollable body ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5">

        {/* Label */}
        <Row label="Label">
          <input
            type="text"
            value={field.label || ''}
            onChange={e => update({ label: e.target.value.slice(0, 100) })}
            placeholder={meta.label}
            maxLength={100}
            className="w-full bg-slate-50 dark:bg-slate-800
                       border border-slate-200 dark:border-slate-700
                       rounded-lg px-2.5 py-1.5 text-xs
                       text-slate-700 dark:text-slate-200
                       focus:outline-none focus:ring-2 focus:ring-sky-400/50
                       placeholder:text-slate-400 transition-all"
          />
        </Row>

        {/* Placeholder (text/number only) */}
        {!isSig && !isCheck && (
          <Row label="Hint text">
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={e => update({ placeholder: e.target.value.slice(0, 100) })}
              placeholder="e.g. Enter your name"
              maxLength={100}
              className="w-full bg-slate-50 dark:bg-slate-800
                         border border-slate-200 dark:border-slate-700
                         rounded-lg px-2.5 py-1.5 text-xs
                         text-slate-700 dark:text-slate-200
                         focus:outline-none focus:ring-2 focus:ring-sky-400/50
                         placeholder:text-slate-400 transition-all"
            />
          </Row>
        )}

        {/* Required toggle */}
        <Row label="Required">
          <Toggle
            checked={field.required !== false}
            onChange={v => update({ required: v })}
            label={field.required !== false ? 'Yes' : 'No'}
          />
        </Row>

        {/* Assigned party */}
        {parties.length > 0 && (
          <Row label="Assigned to">
            <Select
              value={String(field.partyIndex ?? 0)}
              onChange={v => update({ partyIndex: Number(v) })}
              className="w-full max-w-[140px]"
            >
              {parties.map((p, i) => (
                <option key={i} value={String(i)}>
                  {p.name || p.email || `Party ${i + 1}`}
                </option>
              ))}
            </Select>
          </Row>
        )}

        {/* Party color swatch indicator */}
        {parties.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 pb-2">
            {parties.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => update({ partyIndex: i })}
                title={p.name || `Party ${i + 1}`}
                className={`w-5 h-5 rounded-full ring-2 ring-offset-1 transition-all
                  ${(field.partyIndex ?? 0) === i
                    ? 'ring-slate-600 scale-110'
                    : 'ring-transparent hover:scale-105'
                  }`}
                style={{
                  backgroundColor: p.color || PARTY_COLORS[i % PARTY_COLORS.length],
                }}
              />
            ))}
          </div>
        )}

        {/* Typography — not for checkbox/signature */}
        {!isCheck && !isSig && (
          <>
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider
                            text-slate-400 dark:text-slate-500">
                Typography
              </p>
            </div>

            <Row label="Font">
              <Select
                value={field.fontFamily || 'Helvetica'}
                onChange={v => update({ fontFamily: v })}
                className="w-full max-w-[150px]"
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Select>
            </Row>

            <Row label="Size">
              <Select
                value={String(field.fontSize || 14)}
                onChange={v => update({ fontSize: Number(v) })}
                className="w-20"
              >
                {FONT_SIZES.map(s => (
                  <option key={s} value={String(s)}>{s}px</option>
                ))}
              </Select>
            </Row>

            <Row label="Weight">
              <div className="flex gap-1">
                {['normal', 'bold'].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => update({ fontWeight: w })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${(field.fontWeight || 'normal') === w
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {w === 'bold' ? <Bold className="w-3 h-3" /> : <AlignLeft className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={field.color || '#000000'}
                  onChange={e => update({ color: e.target.value })}
                  className="w-7 h-7 rounded-lg border-2 border-slate-200 cursor-pointer
                             dark:border-slate-700 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-500">
                  {field.color || '#000000'}
                </span>
              </div>
            </Row>
          </>
        )}

        {/* Dimensions (read-only display) */}
        <div className="pt-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider
                        text-slate-400 dark:text-slate-500">
            Position &amp; Size
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 pb-2">
          {[
            { k: 'x',      label: 'X',  suffix: '%', min: 0, max: 100, step: 0.1 },
            { k: 'y',      label: 'Y',  suffix: '%', min: 0, max: 100, step: 0.1 },
            { k: 'width',  label: 'W',  suffix: '%', min: 0.5, max: 100, step: 0.1 },
            { k: 'height', label: 'H',  suffix: '%', min: 0.5, max: 100, step: 0.1 },
          ].map(({ k, label, suffix, min, max, step }) => (
            <label
              key={k}
              className="bg-slate-50 dark:bg-slate-800
                          rounded-lg px-2 py-1.5 flex items-center gap-1.5
                          border border-slate-100 dark:border-slate-700
                          focus-within:ring-2 focus-within:ring-sky-400/50
                          focus-within:border-sky-400/50 transition-all"
            >
              <span className="text-[10px] text-slate-400 font-medium w-4 shrink-0">{label}</span>
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={Number(field[k] || 0).toFixed(1)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isNaN(v)) return;
                  const clamped = Math.min(max, Math.max(min, v));
                  update({ [k]: clamped });
                }}
                className="flex-1 bg-transparent outline-none text-right
                           text-xs font-mono text-slate-700 dark:text-slate-200
                           w-0 min-w-0 [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none
                           [&::-webkit-inner-spin-button]:appearance-none"
                disabled={Boolean(field.locked)}
              />
              <span className="text-[9px] text-slate-400 font-medium shrink-0 pr-0.5">{suffix}</span>
            </label>
          ))}
        </div>

        {/* ── Lock Field ────────────────────────────────── */}
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {field.locked ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Lock position & size
              </span>
            </div>
            <Toggle
              checked={Boolean(field.locked)}
              onChange={(v) => update({ locked: v })}
              label=""
            />
          </div>
          {field.locked && (
            <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400/90">
              Drag and resize are disabled. Unlock to reposition.
            </p>
          )}
        </div>

      </div>

      {/* ── Footer — Delete ─────────────────────────────── */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onRemove}
          className="w-full flex items-center justify-center gap-2
                     px-3 py-2 rounded-lg text-xs font-semibold
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                     border border-red-200 dark:border-red-800/50
                     transition-all duration-150"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Field
        </button>
      </div>
    </aside>
  );
}
