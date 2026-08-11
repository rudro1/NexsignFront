// src/components/editor/PartyManager.jsx
import React, {
  useState, useRef, useCallback, useMemo,
} from 'react';
import {
  Plus, Trash2, GripVertical, User,
  ArrowDown, CheckCircle2, AlertCircle,
  Mail, Briefcase, ChevronUp, ChevronDown,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());

// ─── Party colors ──────────────────────────────────────────────────
const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
  '#6366f1', '#14b8a6',
];

const MAX_PARTIES = 8;

// ─── Field input ──────────────────────────────────────────────────
const Field = ({
  label, value, onChange, placeholder,
  type = 'text', error, icon: Icon,
}) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 rounded-xl border text-xs font-medium outline-none transition-colors',
          'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400',
          Icon ? 'pl-8 pr-3' : 'px-3',
          error
            ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15',
        )}
      />
      {/* Validation icon */}
      {type === 'email' && value && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {isValidEmail(value)
            ? <CheckCircle2 size={13} className="text-emerald-500" />
            : <AlertCircle  size={13} className="text-red-400" />
          }
        </div>
      )}
    </div>
    {error && (
      <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

// ─── Sequential arrow connector ───────────────────────────────────
const SequentialArrow = () => (
  <div className="flex flex-col items-center py-0.5 gap-0.5">
    <div className="w-px h-2 bg-slate-200 dark:bg-slate-700" />
    <ArrowDown size={12} className="text-slate-300 dark:text-slate-600" />
    <div className="w-px h-2 bg-slate-200 dark:bg-slate-700" />
  </div>
);

// ════════════════════════════════════════════════════════════════
// PARTY CARD
// ════════════════════════════════════════════════════════════════
const PartyCard = ({
  party, index, total,
  onUpdate, onRemove,
  onMoveUp, onMoveDown,
  isDragging, dragHandleProps,
  duplicateEmails,
}) => {
  const [expanded, setExpanded] = useState(true);

  const emailError = useMemo(() => {
    if (!party.email) return null;
    if (!isValidEmail(party.email)) return 'Invalid email address';
    if (duplicateEmails.has(party.email.toLowerCase()))
      return 'Duplicate email — each party must be unique';
    return null;
  }, [party.email, duplicateEmails]);

  const isComplete = party.name && isValidEmail(party.email) && !emailError;
  const color      = party.color || PARTY_COLORS[index % PARTY_COLORS.length];

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 overflow-hidden',
        'bg-white dark:bg-slate-900',
        'transition-all duration-200',
        isDragging
          ? 'shadow-2xl scale-[1.02] border-sky-300 dark:border-sky-700 rotate-1'
          : isComplete
            ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            : 'border-slate-200 dark:border-slate-700',
      )}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      <div className="pl-4 pr-3 pt-3 pb-3">

        {/* ── Card header ────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-0">

          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none"
          >
            <GripVertical size={16} />
          </div>

          {/* Party badge */}
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            {index + 1}
          </div>

          {/* Name preview */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
              {party.name || `Signer ${index + 1}`}
            </p>
            {party.email && !expanded && (
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {party.email}
              </p>
            )}
          </div>

          {/* Status dot */}
          <div className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            isComplete ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600',
          )} />

          {/* Move buttons */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp size={12} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(o => !o)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            {expanded
              ? <ChevronUp   size={14} />
              : <ChevronDown size={14} />
            }
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* ── Expanded fields ─────────────────────────────────── */}
        {expanded && (
          <div className="mt-3 space-y-2.5">
            {/* Name */}
            <Field
              label="Full Name"
              value={party.name}
              onChange={v => onUpdate('name', v)}
              placeholder={`Signer ${index + 1}`}
              icon={User}
            />

            {/* Email */}
            <Field
              label="Email Address"
              type="email"
              value={party.email}
              onChange={v => onUpdate('email', v)}
              placeholder="signer@example.com"
              error={emailError}
              icon={Mail}
            />

            {/* Designation */}
            <Field
              label="Designation (optional)"
              value={party.designation || ''}
              onChange={v => onUpdate('designation', v)}
              placeholder="e.g. CEO, Manager, Director"
              icon={Briefcase}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function PartyManager({ parties = [], onChange }) {

  const [dragging, setDragging] = useState(null); // index being dragged
  const dragOver                = useRef(null);

  // ── Duplicate email detection ──────────────────────────────────
  const duplicateEmails = useMemo(() => {
    const seen = new Map();
    const dups = new Set();
    parties.forEach(p => {
      const key = (p.email || '').toLowerCase().trim();
      if (!key) return;
      if (seen.has(key)) dups.add(key);
      else seen.set(key, true);
    });
    return dups;
  }, [parties]);

  // ── CRUD ───────────────────────────────────────────────────────
  const addParty = useCallback(() => {
    if (parties.length >= MAX_PARTIES) return;
    onChange([
      ...parties,
      {
        id:          crypto.randomUUID(),
        name:        '',
        email:       '',
        designation: '',
        order:       parties.length,
        status:      'pending',
        color:       PARTY_COLORS[parties.length % PARTY_COLORS.length],
      },
    ]);
  }, [parties, onChange]);

  const removeParty = useCallback((idx) => {
    const updated = parties
      .filter((_, i) => i !== idx)
      .map((p, i) => ({ ...p, order: i, color: PARTY_COLORS[i % PARTY_COLORS.length] }));
    onChange(updated);
  }, [parties, onChange]);

  const updateParty = useCallback((idx, field, value) => {
    const updated = [...parties];
    updated[idx]  = { ...updated[idx], [field]: value };
    onChange(updated);
  }, [parties, onChange]);

  const moveParty = useCallback((from, to) => {
    if (to < 0 || to >= parties.length) return;
    const updated = [...parties];
    const [item]  = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(
      updated.map((p, i) => ({ ...p, order: i, color: PARTY_COLORS[i % PARTY_COLORS.length] })),
    );
  }, [parties, onChange]);

  // ── Drag & drop (HTML5) ────────────────────────────────────────
  const handleDragStart = useCallback((e, idx) => {
    setDragging(idx);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault();
    dragOver.current = idx;
  }, []);

  const handleDrop = useCallback(() => {
    if (dragging !== null && dragOver.current !== null && dragging !== dragOver.current) {
      moveParty(dragging, dragOver.current);
    }
    setDragging(null);
    dragOver.current = null;
  }, [dragging, moveParty]);

  // ── Validation summary ─────────────────────────────────────────
  const readyCount = useMemo(
    () => parties.filter(p =>
      p.name && isValidEmail(p.email) &&
      !duplicateEmails.has((p.email || '').toLowerCase()),
    ).length,
    [parties, duplicateEmails],
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3 select-none">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
            <User size={14} className="text-sky-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
            Signing Parties
          </span>
          {parties.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-[10px] font-black">
              {readyCount}/{parties.length} ready
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={addParty}
          disabled={parties.length >= MAX_PARTIES}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all',
            parties.length >= MAX_PARTIES
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-800 hover:border-sky-300',
          )}
        >
          <Plus size={13} /> Add Party
        </button>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {parties.length === 0 ? (
        <button
          type="button"
          onClick={addParty}
          className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-3 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
            <Plus size={22} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Add First Signer</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Click to add signing parties</p>
          </div>
        </button>
      ) : (
        <div className="space-y-1">
          {parties.map((party, i) => (
            <React.Fragment key={party.id || i}>
              <div
                draggable
                onDragStart={e => handleDragStart(e, i)}
                onDragOver={e  => handleDragOver(e,  i)}
                onDrop={handleDrop}
                onDragEnd={() => { setDragging(null); dragOver.current = null; }}
                className={cn(
                  'transition-opacity duration-150',
                  dragging === i && 'opacity-50',
                )}
              >
                <PartyCard
                  party={party}
                  index={i}
                  total={parties.length}
                  onUpdate={(field, val) => updateParty(i, field, val)}
                  onRemove={() => removeParty(i)}
                  onMoveUp={()   => moveParty(i, i - 1)}
                  onMoveDown={() => moveParty(i, i + 1)}
                  isDragging={dragging === i}
                  duplicateEmails={duplicateEmails}
                  dragHandleProps={{
                    onMouseDown: () => {},   // HTML5 drag handles this
                  }}
                />
              </div>

              {/* Sequential arrow between cards */}
              {i < parties.length - 1 && <SequentialArrow />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Footer info ───────────────────────────────────────── */}
      {parties.length > 0 && (
        <div className="space-y-2">
          {/* Sequential flow info */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/40">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
            <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-relaxed font-medium">
              Parties sign <span className="font-black">sequentially</span> — Party 1 receives the document first.
              Each party is notified only after the previous one signs.
            </p>
          </div>

          {/* Max limit warning */}
          {parties.length >= MAX_PARTIES && (
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 px-1">
              <AlertCircle size={11} />
              Maximum {MAX_PARTIES} parties reached
            </p>
          )}

          {/* Duplicate warning */}
          {duplicateEmails.size > 0 && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 px-1">
              <AlertCircle size={11} />
              Duplicate emails detected — each party must have a unique email
            </p>
          )}
        </div>
      )}
    </div>
  );
}