/** ISO date (YYYY-MM-DD) for date inputs and PDF embedding */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Pre-fill empty date fields when a signer opens the page */
export function initSigningFields(rawFields, { autoDate = true } = {}) {
  return (rawFields || []).map(f => {
    let value = f.value || '';
    if (autoDate && f.type === 'date' && !value) value = todayISO();
    return { ...f, value };
  });
}

export function toFieldValues(fields) {
  return fields
    .filter(f => f.value)
    .map(f => ({ fieldId: f.id, type: f.type, value: f.value }));
}

export function hasRequiredSignature(fields) {
  return fields.some(
    f => (f.type === 'signature' || f.type === 'initial') && f.required !== false,
  );
}

export function missingRequiredFields(fields) {
  return fields.filter(f => {
    if (f.required === false) return false;
    return !f.value;
  });
}
