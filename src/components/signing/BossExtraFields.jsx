import React from 'react';

const INPUT_CLASS =
  'signing-field-input w-full h-10 px-3 rounded-xl border border-slate-200 ' +
  'dark:border-slate-600 text-sm outline-none ' +
  'focus:ring-2 focus:ring-[#28ABDF]/30 focus:border-[#28ABDF]/50';

/** Boss text/date/number/checkbox fields shown below the signature pad */
export default function BossExtraFields({ fields, onChange }) {
  const extras = (fields || []).filter(
    f => f.type !== 'signature' && f.type !== 'initial',
  );
  if (!extras.length) return null;

  const setValue = (id, value) => {
    onChange(prev => prev.map(f => (f.id === id ? { ...f, value } : f)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Authoriser fields
      </p>
      {extras.map(f => (
        <div key={f.id}>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
            {f.label || f.type}
            {f.required !== false && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {f.type === 'date' && (
            <input
              type="date"
              value={f.value || ''}
              onChange={e => setValue(f.id, e.target.value)}
              className={INPUT_CLASS}
            />
          )}
          {(f.type === 'text' || f.type === 'number') && (
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={f.value || ''}
              placeholder={f.placeholder || ''}
              onChange={e => setValue(f.id, e.target.value)}
              className={INPUT_CLASS}
            />
          )}
          {f.type === 'checkbox' && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!f.value && f.value !== 'false'}
                onChange={e => setValue(f.id, e.target.checked ? 'checked' : '')}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              {f.label || 'Check to confirm'}
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
