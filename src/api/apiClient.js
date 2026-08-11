// src/api/apiClient.js
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://nexsignbackendrepo.vercel.app/api'
    : 'http://localhost:5001/api')
).replace(/\/$/, '');

const TIMEOUT_NORMAL = 20_000;  // 20s
const TIMEOUT_UPLOAD = 90_000;  // 90s
const TIMEOUT_SIGN   = 60_000;  // 60s
const MAX_RETRIES    = 1;
const RETRY_DELAY_MS = 2_000;
const CACHE_TTL_MS   = 30_000;  // 30s

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getTimeout(config) {
  const url    = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  if (config.data instanceof FormData)                 return TIMEOUT_UPLOAD;
  if (url.includes('upload'))                          return TIMEOUT_UPLOAD;
  if (url.includes('upload-logo'))                     return TIMEOUT_UPLOAD;
  if (url.includes('sign/submit'))                     return TIMEOUT_SIGN;
  if (url.includes('boss-sign') && method === 'post')  return TIMEOUT_SIGN;
  return TIMEOUT_NORMAL;
}

function isRetryable(error) {
  if (axios.isCancel(error)) return false;
  if (!error.response)       return true;
  return [408, 429, 502, 503, 504].includes(error.response.status);
}

function getCacheKey(config) {
  const params = config.params
    ? JSON.stringify(config.params)
    : '';
  return `${(config.method || 'get').toUpperCase()}:${config.url || ''}${params}`;
}

// ═══════════════════════════════════════════════════════════════
// CACHE + DEDUP
// ═══════════════════════════════════════════════════════════════
const requestCache = new Map();
const inflightMap  = new Map();

export const apiCache = {
  invalidate(url, params = {}) {
    const key = `GET:${url}${JSON.stringify(params)}`;
    requestCache.delete(key);
    inflightMap.delete(key);
  },

  invalidatePattern(pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
        inflightMap.delete(key);
      }
    }
  },

  clear() {
    requestCache.clear();
    inflightMap.clear();
  },

  prefetch(url, params = {}) {
    api.get(url, { params }).catch(() => {});
  },

  inspect() {
    const result = {};
    requestCache.forEach((v, k) => {
      result[k] = {
        age:  `${Math.round((Date.now() - v.timestamp) / 1000)}s`,
        size: `${JSON.stringify(v.data).length} bytes`,
      };
    });
    return result;
  },
};

// ═══════════════════════════════════════════════════════════════
// ERROR NORMALIZER
// ═══════════════════════════════════════════════════════════════
function normalizeError(error) {
  const isOffline =
    typeof navigator !== 'undefined' && !navigator.onLine;

  if (!error.response) {
    return {
      __network: true,
      __offline: isOffline,
      __timeout: error.code === 'ECONNABORTED',
      message: isOffline
        ? 'No internet connection. Please check your network.'
        : error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach server. Please try again.',
      status: 0,
      retry:  true,
    };
  }

  const data = error.response.data;
  return {
    message: data?.message || data?.error ||
      `Server error (${error.response.status})`,
    code:   data?.code || null,
    status: error.response.status,
    data,
    retry:  isRetryable(error),
  };
}

// ═══════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════
export const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         TIMEOUT_NORMAL,
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ═══════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    // Auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData → browser নিজেই Content-Type set করবে
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }

    // Dynamic timeout
    config.timeout = getTimeout(config);

    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════════════════
api.interceptors.response.use(

  // ── Success ───────────────────────────────────────────────
  (response) => {
    const config = response.config;

    // GET → cache
    if (config?.method?.toLowerCase() === 'get') {
      const key = getCacheKey(config);
      requestCache.set(key, {
        data:      response.data,
        timestamp: Date.now(),
      });
      inflightMap.delete(key);
    }

    // upload-and-send → dashboard cache clear
    if (
      config?.method?.toLowerCase() === 'post' &&
      config?.url?.includes('upload-and-send')
    ) {
      apiCache.invalidatePattern('/documents');
    }

    return response;
  },

  // ── Error ─────────────────────────────────────────────────
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject({ __cancelled: true });
    }

    const config = error.config;
    if (!config) return Promise.reject(normalizeError(error));

    const key    = getCacheKey(config);
    const status = error.response?.status;

    // 401 → logout
    if (status === 401) {
      localStorage.removeItem('token');
      inflightMap.delete(key);

      const isPublicPage =
        window.location.pathname.includes('/login')    ||
        window.location.pathname.includes('/sign/')    ||
        window.location.pathname.includes('/register');

      if (typeof window !== 'undefined' && !isPublicPage) {
        window.location.href = '/login?expired=true';
      }

      return Promise.reject(normalizeError(error));
    }

    // Non-retryable 4xx
    if ([400, 403, 404, 409, 410, 422].includes(status)) {
      inflightMap.delete(key);
      return Promise.reject(normalizeError(error));
    }

    // Retry
    if (isRetryable(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;

      if (config.__retryCount <= MAX_RETRIES) {
        console.warn(
          `🔁 Retry ${config.__retryCount}/${MAX_RETRIES}: ${config.url}`,
        );

        // Stale cache hit → GET এ সাথে সাথে return
        const cached = requestCache.get(key);
        if (cached && config.method?.toLowerCase() === 'get') {
          setTimeout(
            () => api(config).catch(() => {}),
            RETRY_DELAY_MS,
          );
          return Promise.resolve({
            data:        cached.data,
            status:      200,
            __fromCache: true,
            __stale:     true,
          });
        }

        await sleep(RETRY_DELAY_MS);
        return api(config);
      }
    }

    inflightMap.delete(key);
    return Promise.reject(normalizeError(error));
  },
);

// ═══════════════════════════════════════════════════════════════
// OVERRIDE api.get — cache + dedup
// ═══════════════════════════════════════════════════════════════
const _originalGet = api.get.bind(api);

api.get = function cachedGet(url, config = {}) {
  const mergedConfig = { ...config, url, method: 'get' };
  const key          = getCacheKey(mergedConfig);

  // Fresh cache hit
  if (!config.noCache) {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve({
        data:        cached.data,
        status:      200,
        __fromCache: true,
      });
    }
  }

  // Dedup
  if (inflightMap.has(key)) {
    return inflightMap.get(key);
  }

  // New request
  const promise = _originalGet(url, config).finally(() => {
    inflightMap.delete(key);
  });

  inflightMap.set(key, promise);
  return promise;
};

// ═══════════════════════════════════════════════════════════════
// NAMED API METHODS
// ═══════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login',          data),
  register:       (data) => api.post('/auth/register',       data),
  googleAuth:     (data) => api.post('/auth/google',         data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile',         data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout:         ()     => api.post('/auth/logout'),
};

// ── Documents ─────────────────────────────────────────────────
export const documentApi = {
  getAll: (params = {}) =>
    api.get('/documents', { params }),

  getOne: (id) =>
    api.get(`/documents/${id}`),

  getAudit: (id) =>
    api.get(`/documents/${id}/audit`, { noCache: true }),

  upload: (formData) =>
    api.post('/documents/upload', formData),

  // image/* এখন server accept করে
  uploadLogo: (formData) =>
    api.post('/documents/upload-logo', formData),

  update: (id, data) =>
    api.put(`/documents/${id}`, data),

  // send হলে cache clear
  send: (formData) =>
    api.post('/documents/upload-and-send', formData).then(res => {
      apiCache.invalidatePattern('/documents');
      return res;
    }),

  // delete হলে cache clear
  delete: (id) =>
    api.delete(`/documents/${id}`).then(res => {
      apiCache.invalidatePattern('/documents');
      return res;
    }),

  // Public — no auth
  validateToken: (token) =>
    api.get(
      `/documents/sign/validate/${token}`,
      { noCache: true },
    ),

  submitSignature: (data) =>
    api.post('/documents/sign/submit', data),

  getPdfProxy: (token) =>
    `${BASE}/documents/sign/${token}/pdf`,
};

// ── Templates ─────────────────────────────────────────────────
export const templateApi = {
  getAll: (params = {}) =>
    api.get('/templates', { params }),

  getOne: (id) =>
    api.get(`/templates/${id}`),

  create: (formData) =>
    api.post('/templates', formData),

  update: (id, data) =>
    api.put(`/templates/${id}`, data),

  delete: (id) =>
    api.delete(`/templates/${id}`),

  bossSign: (id, data) =>
    api.post(`/templates/${id}/boss-sign`, data),

  distribute: (id, data) =>
    api.post(`/templates/${id}/distribute`, data),

  getSessions: (id) =>
    api.get(`/templates/${id}/sessions`, { noCache: true }),

  validateEmployeeToken: (token) =>
    api.get(
      `/templates/sign/validate/${token}`,
      { noCache: true },
    ),

  submitEmployeeSignature: (token, data) =>
    api.post(`/templates/sign/submit/${token}`, data),

  declineEmployee: (token, data) =>
    api.post(`/templates/sign/decline/${token}`, data),

  resendEmail: (templateId, sessionId) =>
    api.post(`/templates/${templateId}/sessions/${sessionId}/resend`),

  // ✅ NEW: PDF proxy URL — iframe X-Frame-Options bypass করে
  getPdfProxyUrl: (token) =>
    `${BASE}/templates/sign/${token}/pdf`,
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    api.get('/admin/stats', { noCache: true }),

  getUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  getUser: (id) =>
    api.get(`/admin/users/${id}`),

  updateRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }),

  toggleStatus: (id) =>
    api.put(`/admin/users/${id}/toggle-status`),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  getDocuments: (params = {}) =>
    api.get('/admin/documents', { params }),

  deleteDocument: (id) =>
    api.delete(`/admin/documents/${id}`),

  getAuditLogs: (params = {}) =>
    api.get('/admin/audit-logs', { params, noCache: true }),
};

// ── Feedback ──────────────────────────────────────────────────
export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
};

// ═══════════════════════════════════════════════════════════════
// MODULE 1 — Field Coordinates API
// ═══════════════════════════════════════════════════════════════
export const fieldApi = {
  /** Fetch all saved fields for a document */
  getFields: (docId) =>
    api.get(`/documents/${docId}/fields`),

  /** Auto-save: full replace of all fields (debounced by hook) */
  saveFields: (docId, fields) =>
    api.put(`/documents/${docId}/fields`, { fields }),

  /** Add a single new field */
  addField: (docId, field) =>
    api.post(`/documents/${docId}/fields`, field),

  /** Remove one field by its client-assigned ID */
  removeField: (docId, fieldId) =>
    api.delete(`/documents/${docId}/fields/${fieldId}`),

  /** Reorder fields (pass array of field IDs in new order) */
  reorderFields: (docId, order) =>
    api.post(`/documents/${docId}/fields/reorder`, { order }),
};

// ═══════════════════════════════════════════════════════════════
// PROXY URL BUILDER
// blob: / data: → সরাসরি return
// Cloudinary URL → সরাসরি use (CORS allow করা আছে)
// ═══════════════════════════════════════════════════════════════
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';

  // Local blob বা base64 → সরাসরি use
  if (
    cloudinaryUrl.startsWith('blob:') ||
    cloudinaryUrl.startsWith('data:')
  ) {
    return cloudinaryUrl;
  }

  // Cloudinary URL → সরাসরি return
  // (server side CORS allow করা আছে)
  return cloudinaryUrl;
}

// ═══════════════════════════════════════════════════════════════
// ONLINE / OFFLINE EVENTS
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('✅ Network restored — clearing cache');
    apiCache.clear();
  });

  window.addEventListener('offline', () => {
    console.warn('📵 Network offline — serving from cache');
  });
}

export default api;