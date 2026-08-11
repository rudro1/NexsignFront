// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ═══════════════════════════════════════════════════════════════
// TAILWIND MERGE
// ═══════════════════════════════════════════════════════════════
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════════════════════
// IFRAME CHECK
// ═══════════════════════════════════════════════════════════════
export const isIframe =
  typeof window !== 'undefined' && window.self !== window.top;

// ═══════════════════════════════════════════════════════════════
// DATE FORMATTERS
// ═══════════════════════════════════════════════════════════════

// "15 Jan 2025"
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  } catch {
    return '—';
  }
}

// "15 Jan 2025, 2:30 PM"
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-GB', {
      day:    '2-digit',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

// "2:30 PM"
export function formatTime(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

// Timezone-aware local time
// "15 Jan 2025, 2:30 PM (BST+6)"
export function formatLocalTime(dateString, timezone = 'Asia/Dhaka') {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const localStr = date.toLocaleString('en-GB', {
      timeZone: timezone,
      day:      '2-digit',
      month:    'short',
      year:     'numeric',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   true,
    });
    return localStr;
  } catch {
    return formatDateTime(dateString);
  }
}

// Relative time: "2 hours ago"
export function timeAgo(dateString) {
  if (!dateString) return '—';
  try {
    const now   = Date.now();
    const then  = new Date(dateString).getTime();
    const diff  = Math.floor((now - then) / 1000);

    if (diff < 60)           return 'Just now';
    if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000)      return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return '—';
  }
}

// ═══════════════════════════════════════════════════════════════
// STRING HELPERS
// ═══════════════════════════════════════════════════════════════

// "john doe" → "John Doe"
export function capitalize(str = '') {
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// "Annual Bonus Agreement.pdf" → "Annual Bonus..."
export function truncate(str = '', maxLen = 40) {
  if (!str) return '';
  return str.length > maxLen
    ? str.substring(0, maxLen) + '...'
    : str;
}

// Get initials: "John Smith" → "JS"
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Slugify: "Annual Report 2025" → "annual-report-2025"
export function slugify(str = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// FILE HELPERS
// ═══════════════════════════════════════════════════════════════

// Bytes → "1.2 MB"
export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// Check if file is PDF
export function isPdf(file) {
  return file?.type === 'application/pdf' ||
    (file?.name || '').toLowerCase().endsWith('.pdf');
}

// ═══════════════════════════════════════════════════════════════
// COLOR HELPERS (Party colors)
// ═══════════════════════════════════════════════════════════════
const PARTY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
];

export function getPartyColor(index = 0) {
  return PARTY_COLORS[index % PARTY_COLORS.length];
}

// Hex → rgba
export function hexToRgba(hex = '#000000', alpha = 1) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ═══════════════════════════════════════════════════════════════
// STATUS HELPERS
// ═══════════════════════════════════════════════════════════════
export function getStatusColor(status = '') {
  const map = {
    draft:       'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-600',
    declined:    'bg-red-100 text-red-600',
    pending:     'bg-yellow-100 text-yellow-700',
    sent:        'bg-blue-100 text-blue-600',
    viewed:      'bg-purple-100 text-purple-600',
    signed:      'bg-green-100 text-green-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function getStatusLabel(status = '') {
  const map = {
    draft:       'Draft',
    in_progress: 'In Progress',
    completed:   'Completed',
    cancelled:   'Cancelled',
    declined:    'Declined',
    pending:     'Pending',
    sent:        'Sent',
    viewed:      'Viewed',
    signed:      'Signed',
  };
  return map[status] || capitalize(status);
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG HELPERS
// ═══════════════════════════════════════════════════════════════

// Format location: "Rajshahi, BD - 6400"
export function formatLocation({ city, country, postalCode, region } = {}) {
  const parts = [city, country].filter(Boolean).join(', ');
  return postalCode ? `${parts} — ${postalCode}` : parts || 'Unknown';
}

// Format device: "iPhone 6 · Safari · iOS 12"
export function formatDevice({ device, browser, os } = {}) {
  return [device, browser, os].filter(Boolean).join(' · ') || 'Unknown';
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════
export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUrl(url = '') {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// SAFE STORAGE (replaces broken localStorage export)
// ═══════════════════════════════════════════════════════════════
export const safeStorage = {
  get(key, fallback = null) {
    try {
      const val = window.localStorage.getItem(key);
      if (!val) return fallback;
      try { return JSON.parse(val); } catch { return val; }
    } catch { return fallback; }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      );
    } catch (e) {
      console.warn('[storage] write failed:', e.message);
    }
  },
  remove(...keys) {
    keys.forEach(k => {
      try { window.localStorage.removeItem(k); } catch {}
    });
  },
  clear() {
    try { window.localStorage.clear(); } catch {}
  },
};

// ═══════════════════════════════════════════════════════════════
// MISC
// ═══════════════════════════════════════════════════════════════

// Generate unique ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Deep clone
export function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

// Debounce
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Copy to clipboard
export async function copyToClipboard(text = '') {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Download blob as file
export function downloadBlob(blob, filename = 'file.pdf') {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}