// src/components/editor/CCInput.jsx
import React, {
  useState, useRef, useCallback, useMemo,
} from 'react';
import {
  Mail, UserPlus, X, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Users,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────
const cn  = (...c) => c.filter(Boolean).join(' ');
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// ─── Empty CC entry factory ───────────────────────────────────────
const newEntry = (email = '') => ({
  id:          crypto.randomUUID(),
  name:        '',
  email:       email.trim(),
  designation: '',
});

// ─── Single CC chip ───────────────────────────────────────────────
const CCChip = ({ entry, onRemove }) => {
  const valid = isValidEmail(entry.email);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold max-w-[220px] group',
      valid
        ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    )}>
      {valid
        ? <CheckCircle2 size={11} className="text-sky-500 flex-shrink-0" />
        : <AlertCircle  size={11} className="text-red-500 flex-shrink-0"  />
      }

      <span className="truncate">
        {entry.name
          ? <><span className="font-bold">{entry.name}</span><span className="opacity-60 ml-1">·</span><span className="opacity-60 ml-1">{entry.email}</span></>
          : entry.email
        }
      </span>

      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className={cn(
          'ml-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
          valid
            ? 'hover:bg-sky-200 dark:hover:bg-sky-700 text-sky-500'
            : 'hover:bg-red-200 dark:hover:bg-red-700 text-red-500',
        )}
      >
        <X size={9} strokeWidth={3} />
      </button>
    </span>
  );
};

// ─── Detail row (expanded name + designation) ─────────────────────
const DetailRow = ({ entry, onChange, onRemove }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 group">

    {/* Avatar initial */}
    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xs font-black flex-shrink-0">
      {entry.name?.[0]?.toUpperCase() || entry.email?.[0]?.toUpperCase() || '?'}
    </div>

    {/* Fields */}
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
      {/* Email */}
      <div className="relative">
        <input
          type="email"
          placeholder="email@example.com"
          value={entry.email}
          onChange={e => onChange(entry.id, 'email', e.target.value)}
          className={cn(
            'w-full h-9 pl-3 pr-3 rounded-lg text-xs font-medium border outline-none transition-colors',
            'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200',
            'placeholder:text-slate-400',
            isValidEmail(entry.email)
              ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20'
              : entry.email
                ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-1 focus:ring-red-400/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20',
          )}
        />
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Full name"
        value={entry.name}
        onChange={e => onChange(entry.id, 'name', e.target.value)}
        className="w-full h-9 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 transition-colors"
      />

      {/* Designation */}
      <input
        type="text"
        placeholder="Designation (optional)"
        value={entry.designation}
        onChange={e => onChange(entry.id, 'designation', e.target.value)}
        className="w-full h-9 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 transition-colors"
      />
    </div>

    {/* Remove */}
    <button
      type="button"
      onClick={() => onRemove(entry.id)}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
    >
      <X size={14} />
    </button>
  </div>
);

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const CCInput = ({ value = [], onChange }) => {
  /*
   * value  = array of {id, name, email, designation}
   * onChange(entries) → parent gets full objects for audit log
   */

  const [inputText, setInputText] = useState('');
  const [expanded,  setExpanded]  = useState(false);
  const [focused,   setFocused]   = useState(false);
  const inputRef = useRef(null);

  // ── Normalise incoming value (backward compat with string array) ─
  const entries = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map(v =>
      typeof v === 'string'
        ? newEntry(v)
        : { id: v.id || crypto.randomUUID(), name: v.name || '', email: v.email || '', designation: v.designation || '' },
    );
  }, [value]);

  // ── Add entry ──────────────────────────────────────────────────
  const addEmail = useCallback((raw) => {
    const emails = raw.split(/[,;\s]+/).map(e => e.trim()).filter(Boolean);
    if (!emails.length) return;

    const existing = new Set(entries.map(e => e.email.toLowerCase()));
    const toAdd    = emails
      .filter(e => !existing.has(e.toLowerCase()))
      .map(newEntry);

    if (toAdd.length) onChange([...entries, ...toAdd]);
    setInputText('');
    setExpanded(true);
  }, [entries, onChange]);

  // ── Remove entry ───────────────────────────────────────────────
  const removeEntry = useCallback((id) => {
    onChange(entries.filter(e => e.id !== id));
  }, [entries, onChange]);

  // ── Update field ───────────────────────────────────────────────
  const updateEntry = useCallback((id, field, val) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: val } : e));
  }, [entries, onChange]);

  // ── Keyboard handling ──────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputText.trim()) {
      e.preventDefault();
      addEmail(inputText);
    } else if (e.key === 'Backspace' && !inputText && entries.length) {
      removeEntry(entries[entries.length - 1].id);
    }
  }, [inputText, entries, addEmail, removeEntry]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (inputText.trim()) addEmail(inputText);
  }, [inputText, addEmail]);

  // ── Derived ────────────────────────────────────────────────────
  const validCount   = useMemo(() => entries.filter(e => isValidEmail(e.email)).length, [entries]);
  const invalidCount = entries.length - validCount;

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
            <UserPlus size={14} className="text-sky-500" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
            CC Recipients
          </span>
          {entries.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-[10px] font-black">
              {entries.length}
            </span>
          )}
        </div>

        {/* Expand/collapse toggle */}
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(o => !o)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-sky-500 transition-colors"
          >
            {expanded ? 'Collapse' : 'Edit details'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* ── Input box ──────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'min-h-[46px] flex flex-wrap items-center gap-1.5 px-3 py-2',
          'rounded-xl border-2 transition-colors duration-150 cursor-text',
          'bg-white dark:bg-slate-900',
          focused
            ? 'border-sky-400 ring-4 ring-sky-400/10'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
        )}
      >
        {/* Chips */}
        {entries.map(entry => (
          <CCChip key={entry.id} entry={entry} onRemove={removeEntry} />
        ))}

        {/* Type input */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onPaste={e => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text');
            addEmail(pasted);
          }}
          placeholder={entries.length === 0 ? 'Type email and press Enter or comma…' : ''}
          className="flex-1 min-w-[180px] h-7 text-xs font-medium outline-none bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
        />

        {/* Mail icon */}
        {entries.length === 0 && (
          <Mail size={14} className="text-slate-300 flex-shrink-0" />
        )}
      </div>

      {/* ── Validation summary ─────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {validCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={11} /> {validCount} valid
            </span>
          )}
          {invalidCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
              <AlertCircle size={11} /> {invalidCount} invalid — will be skipped
            </span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-mono">,</kbd> to add
          </span>
        </div>
      )}

      {/* ── Expanded detail rows ────────────────────────────────── */}
      {expanded && entries.length > 0 && (
        <div className="space-y-2 pt-1">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-3 gap-2 px-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Email</span>
            <span>Full Name</span>
            <span>Designation</span>
          </div>

          {entries.map(entry => (
            <DetailRow
              key={entry.id}
              entry={entry}
              onChange={updateEntry}
              onRemove={removeEntry}
            />
          ))}

          {/* Add another inline */}
          <button
            type="button"
            onClick={() => { onChange([...entries, newEntry()]); }}
            className="w-full h-9 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 hover:text-sky-500 hover:border-sky-300 dark:hover:border-sky-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Users size={13} /> Add another recipient
          </button>
        </div>
      )}

      {/* ── Hint ───────────────────────────────────────────────── */}
      {entries.length === 0 && (
        <p className="text-[10px] text-slate-400 leading-relaxed">
          CC recipients receive a copy of the signed document and are included in the audit trail. They do not need to sign.
        </p>
      )}
    </div>
  );
};

export default React.memo(CCInput);