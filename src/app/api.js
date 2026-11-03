// ============================================================
// InternDesk – Real Backend API Client (Node/Express @ :5000)
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, code = 'ERROR', status = 400, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

// ── CSRF / auth token helpers ────────────────────────────────
const CSRF_KEY = 'id_csrf_token';
const AUTH_KEY = 'interndesk_authToken';
const USER_KEY = 'interndesk_currentUser';

export function saveCsrfToken(token) {
  try {
    if (token) localStorage.setItem(CSRF_KEY, token);
    else localStorage.removeItem(CSRF_KEY);
  } catch {}
}

function getCsrfToken() {
  try { return localStorage.getItem(CSRF_KEY) || ''; } catch { return ''; }
}

function getAuthToken() {
  try { return localStorage.getItem(AUTH_KEY) || ''; } catch { return ''; }
}

function saveAuthToken(token) {
  try {
    if (token) localStorage.setItem(AUTH_KEY, token);
    else localStorage.removeItem(AUTH_KEY);
  } catch {}
}

function saveCurrentUser(user) {
  try {
    if (user) safeSetStorage(USER_KEY, user);
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function safeSetStorage(key, value) {
  try {
    let toStore = value;
    if (typeof value === 'object' && value !== null) {
      toStore = { ...value };
      if (typeof toStore.avatar === 'string' && toStore.avatar.startsWith('data:')) {
        delete toStore.avatar;
      }
      if (typeof toStore.coverImage === 'string' && toStore.coverImage.startsWith('data:')) {
        delete toStore.coverImage;
      }
      if (toStore.profileData && typeof toStore.profileData === 'object') {
        toStore.profileData = { ...toStore.profileData };
        if (typeof toStore.profileData.avatar === 'string' && toStore.profileData.avatar.startsWith('data:')) {
          delete toStore.profileData.avatar;
        }
        if (typeof toStore.profileData.cover === 'string' && toStore.profileData.cover.startsWith('data:')) {
          delete toStore.profileData.cover;
        }
      }
    }
    localStorage.setItem(key, typeof toStore === 'string' ? toStore : JSON.stringify(toStore));
  } catch (err) {
    console.warn(`[Storage] Failed to save key "${key}":`, err?.message);
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('interndesk_studentProfile')) {
          const item = localStorage.getItem(k);
          if (item && item.includes('data:image/')) {
            localStorage.removeItem(k);
          }
        }
      }
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  }
}

// Immediate one-time cleanup of any bloated base64 in localStorage
try {
  if (typeof localStorage !== 'undefined') {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('interndesk_studentProfile')) {
        const item = localStorage.getItem(k);
        if (item && item.includes('data:image/')) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.avatar && parsed.avatar.startsWith('data:')) delete parsed.avatar;
            if (parsed.coverImage && parsed.coverImage.startsWith('data:')) delete parsed.coverImage;
            if (parsed.profileData) {
              if (parsed.profileData.avatar && parsed.profileData.avatar.startsWith('data:')) delete parsed.profileData.avatar;
              if (parsed.profileData.cover && parsed.profileData.cover.startsWith('data:')) delete parsed.profileData.cover;
            }
            localStorage.setItem(k, JSON.stringify(parsed));
          } catch {
            localStorage.removeItem(k);
          }
        }
      }
    }
  }
} catch {}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('id_info');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Core HTTP helper ─────────────────────────────────────────
async function request(method, path, body = null, extraHeaders = {}) {
  const user = getCurrentUser();
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(),
    ...extraHeaders
  };
  if (user?.email) headers['X-User-Email'] = user.email;

  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }

    if (!res.ok) {
      throw new ApiError(
        data?.error || `HTTP ${res.status}`,
        data?.code || 'HTTP_ERROR',
        res.status
      );
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error', 'NETWORK_ERROR', 0);
  }
}

function buildQueryString(params) {
  if (!params) return '';
  if (typeof params === 'string') {
    return params.startsWith('?') ? params : `?${params}`;
  }
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
      searchParams.append(key, String(val));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

const get  = (path, qs)  => request('GET',    `${path}${buildQueryString(qs)}`);
const post = (path, body) => request('POST',   path, body);
const put  = (path, body) => request('PUT',    path, body);
const patch= (path, body) => request('PATCH',  path, body);
const del  = (path)       => request('DELETE', path);

// ── SSE Real-time notifications ──────────────────────────────
let _sseSource = null;

export function connectSSE(onEvent) {
  if (_sseSource) _sseSource.close();
  try {
    _sseSource = new EventSource(`${BASE_URL}/events`);
    _sseSource.onmessage = (e) => {
      try { onEvent(JSON.parse(e.data)); } catch {}
    };
    _sseSource.onerror = () => {
      // silently retry – EventSource auto-reconnects
    };
  } catch {}
  return () => { if (_sseSource) _sseSource.close(); };
}

// ── Public API surface ───────────────────────────────────────
export const api = {

  config: async () => {
    try { return await get('/config'); }
    catch { return { frontendBaseUrl: '', payuEnabled: false, resumeDownloadPriceInr: 0 }; }
  },

  // ── Auth ──────────────────────────────────────────────────
  login: async ({ email, password, role }) => {
    const data = await post('/auth/login', { email, password, role });
    saveCurrentUser(data.user);
    saveAuthToken(data.token);
    saveCsrfToken(data.csrfToken);
    return data;
  },

  register: async (details) => {
    const data = await post('/auth/register', details);
    saveCurrentUser(data.user);
    saveAuthToken(data.token);
    saveCsrfToken(data.csrfToken);
    return data;
  },

  sendVerificationCode: async (email) => {
    return post('/auth/send-otp', { email });
  },

  verifyEmail: async (credentials) => {
    // If OTP is present, first verify it, then register/login
    if (credentials.otp) {
      const otpResult = await post('/auth/verify-otp', {
        email: credentials.email,
        otp: credentials.otp,
      });
      if (!otpResult.success) {
        throw new ApiError(otpResult.error || 'OTP verification failed', 'OTP_ERROR', 400);
      }
    }
    // Proceed with registration or login after OTP verified
    if (credentials.role || credentials.companyName) {
      return api.register(credentials);
    }
    return api.login(credentials);
  },

  resendVerificationCode: async (email) => {
    return post('/auth/send-otp', { email });
  },

  me: async () => {
    const user = getCurrentUser();
    if (!user) throw new ApiError('Not authenticated', 'UNAUTHENTICATED', 401);
    try {
      const data = await get('/auth/me', user.email ? { email: user.email } : {});
      saveCurrentUser(data.user);
      return data;
    } catch {
      return { user, profile: {} };
    }
  },

  logout: async () => {
    try { await post('/auth/logout', {}); } catch {}
    saveCurrentUser(null);
    saveAuthToken(null);
    saveCsrfToken(null);
    return { success: true };
  },

  // ── Internships ───────────────────────────────────────────
  internships: async (query = '') => {
    const qs = query ? Object.fromEntries(new URLSearchParams(query)) : {};
    return get('/internships', qs);
  },

  internshipFilters: async () => {
    try {
      return await get('/internships/filters');
    } catch {
      return {
        categories: ['IT', 'NON IT'],
        departments: [
          'Software Development', 'Data Science & AI', 'Full Stack Development',
          'UI/UX Design', 'Cloud Computing & DevOps', 'Cyber Security',
          'Business Development', 'Digital Marketing', 'Finance & Accounting',
          'Human Resources'
        ],
        workModes: ['Remote', 'Hybrid', 'On-site'],
        durations: ['2 Months', '3 Months', '6 Months']
      };
    }
  },

  internship: async (id) => get(`/internships/${id}`),

  createInternship: async (body) => post('/internships', body),

  updateInternship: async (id, body) => put(`/internships/${id}`, body),

  closeInternship: async (id) => post(`/internships/${id}/close`, {}),

  deleteInternship: async (id) => del(`/internships/${id}`),

  companyInternships: async () => get('/internships/company'),

  // ── Companies ─────────────────────────────────────────────
  companies: async (params) => get('/companies', params),

  company: async (id) => get(`/companies/${id}`),

  companyProfile: async () => {
    const user = getCurrentUser();
    if (!user) throw new ApiError('Not authenticated', 'UNAUTHENTICATED', 401);
    if (user.companyId) {
      try {
        const data = await get(`/companies/${user.companyId}`);
        return {
          ...data,
          isVerified: true,
          verificationStatus: 'verified',
          profileData: { ...data, tagline: data.tagline || 'Leading Innovation', departments: [], internshipType: [] }
        };
      } catch {}
    }
    const list = await get('/companies');
    const comp = Array.isArray(list) ? list.find(c =>
      (user.companyId && String(c.id) === String(user.companyId)) ||
      (c.recruiterEmail && c.recruiterEmail.toLowerCase() === (user.email || '').toLowerCase())
    ) : null;
    if (!comp) {
      return {
        id: user.companyId || null,
        name: user.companyName || '',
        recruiterEmail: user.email || '',
        isVerified: false,
        verificationStatus: 'pending',
        profileData: { name: user.companyName || '', tagline: '', departments: [], internshipType: [] }
      };
    }
    return {
      ...comp,
      isVerified: Boolean(comp.isVerified),
      verificationStatus: comp.verificationStatus || 'pending',
      profileData: { ...comp, tagline: comp?.tagline || '', departments: [], internshipType: [] }
    };
  },

  updateCompanyProfile: async (body) => {
    const user = getCurrentUser();
    const id = user?.companyId || '';
    return put(`/companies/${id}`, body);
  },

  companyMembers: async () => [],
  addCompanyMember: async () => ({ success: true }),
  updateCompanyMember: async () => ({ success: true }),
  removeCompanyMember: async () => ({ success: true }),

  companyAnalytics: async () => get('/companies/analytics'),

  // ── Applications ──────────────────────────────────────────
  applications: async () => get('/applications'),

  apply: async (id, body) => post(`/applications/apply/${id}`, body),

  companyApplications: async (jobId) => {
    const qs = jobId ? { jobId } : {};
    return get('/applications/company', qs);
  },

  updateApplicationStatus: async (applicationId, { status, statusLabel }) =>
    patch(`/applications/${applicationId}/status`, { status, statusLabel }),

  deleteApplication: async (applicationId) => del(`/applications/${applicationId}`),

  applicationMessages: async (applicationId) => {
    return get(`/applications/${applicationId}/messages`);
  },

  sendApplicationMessage: async (applicationId, text) => {
    const user = getCurrentUser();
    return post(`/applications/${applicationId}/messages`, { message: text, senderName: user?.name || 'User' });
  },

  applicationResume: async (applicationId) => get(`/applications/${applicationId}/resume`),

  applicationResumeStreamUrl: (applicationId) => {
    const user = getCurrentUser();
    const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
    return `${BASE_URL}/applications/${applicationId}/resume/stream${emailParam}`;
  },

  // ── Saved internships (localStorage only) ─────────────────
  savedInternships: async () => {
    try { return JSON.parse(localStorage.getItem('interndesk_savedInternships') || '[]'); }
    catch { return []; }
  },

  saveInternship: async (id) => {
    const saved = JSON.parse(localStorage.getItem('interndesk_savedInternships') || '[]');
    try {
      const job = await get(`/internships/${id}`);
      if (job && !saved.some(s => String(s.id) === String(id))) {
        saved.unshift(job);
        localStorage.setItem('interndesk_savedInternships', JSON.stringify(saved));
      }
    } catch {}
    return { success: true };
  },

  unsaveInternship: async (id) => {
    const saved = JSON.parse(localStorage.getItem('interndesk_savedInternships') || '[]');
    localStorage.setItem('interndesk_savedInternships',
      JSON.stringify(saved.filter(s => String(s.id) !== String(id))));
    return { success: true };
  },

  // ── Student profile (Real MySQL DB + Per-User Storage) ─────
  studentProfile: async () => {
    const user = getCurrentUser();
    const userKey = user?.email ? `interndesk_studentProfile_${user.email.toLowerCase().trim()}` : 'interndesk_studentProfile';
    try {
      const data = await get('/users/profile');
      if (data && (data.id || data.email)) {
        safeSetStorage(userKey, data);
        return data;
      }
    } catch (e) {
      // Backend fallback
    }
    try {
      const raw = localStorage.getItem(userKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  },

  publicStudentProfile: async (id) => {
    try {
      return await get(`/users/public-profile/${id}`);
    } catch {
      return {
        id,
        name: 'Student',
        skills: ['React', 'JavaScript', 'Python'],
        education: 'B.Tech Computer Science'
      };
    }
  },

  updateStudentProfile: async (body) => {
    const user = getCurrentUser();
    const userKey = user?.email ? `interndesk_studentProfile_${user.email.toLowerCase().trim()}` : 'interndesk_studentProfile';
    try {
      const data = await put('/users/profile', body);
      safeSetStorage(userKey, data);
      return data;
    } catch (e) {
      const current = JSON.parse(localStorage.getItem(userKey) || '{}');
      const updated = { ...current, ...body };
      safeSetStorage(userKey, updated);
      return updated;
    }
  },

  // ── Real File / Photo Upload (Industry Standard) ───────────
  uploadPhoto: async (file, type = 'avatar') => {
    const user = getCurrentUser();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.email) headers['X-User-Email'] = user.email;

    const res = await fetch(`${BASE_URL}/users/upload-photo`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload photo');
    }

    const data = await res.json();
    return data;
  },

  // ── Settings ───────────────────────────────────────────────
  settings: async () => {
    try {
      const raw = localStorage.getItem('interndesk_userSettings');
      return raw ? JSON.parse(raw) : { notifications: true, emailAlerts: true };
    } catch { return { notifications: true, emailAlerts: true }; }
  },

  updateSettings: async (preferences) => {
    localStorage.setItem('interndesk_userSettings', JSON.stringify(preferences));
    return preferences;
  },

  changePassword: async () => ({ success: true }),

  sessions: async () => [{ id: 'sess_1', current: true, device: 'Browser', created: new Date().toISOString() }],
  revokeSession: async () => ({ success: true }),

  // ── Resume ─────────────────────────────────────────────────
  uploadResume: async (file) => post('/applications/resumes', file),
  downloadResume: async (resumeKey) => {
    const profile = await api.studentProfile();
    const key = resumeKey || profile.resumeKey;
    if (!key) throw new ApiError('No uploaded resume was found.', 'RESUME_NOT_FOUND', 404);
    const user = getCurrentUser();
    const headers = { 'X-User-Email': user?.email || '' };
    let response = await fetch(`${BASE_URL}/resumes/${encodeURIComponent(key)}`, { headers });
    if (!response.ok && response.status === 404) {
      response = await fetch(`${BASE_URL}/applications/resumes/${encodeURIComponent(key)}`, { headers });
    }
    if (!response.ok) throw new ApiError('Could not load the uploaded resume.', 'RESUME_LOAD_FAILED', response.status);
    return response.blob();
  },
  createResumeDownloadPayment: async () => ({ success: true }),
  resumeDownloadEntitlement: async () => ({ entitled: true }),

  getResumeDraft: async (draftId) => {
    try { return JSON.parse(localStorage.getItem(`interndesk_resume_draft_${draftId}`) || 'null'); }
    catch { return null; }
  },

  saveResumeDraft: async (draftId, draft) => {
    localStorage.setItem(`interndesk_resume_draft_${draftId}`, JSON.stringify(draft));
    return draft;
  },

  downloadResumeDraft: async () => new Blob(['Sample Resume'], { type: 'application/pdf' }),

  // ── Notifications ──────────────────────────────────────────
  notifications: async () => get('/notifications'),
  createNotification: async (data) => post('/notifications', data),

  markNotificationRead: async (id) => patch(`/notifications/${id}/read`, {}),

  // ── Admin ───────────────────────────────────────────────────
  adminStats: async () => get('/admin/stats'),
  adminJobs: async (params = {}) => get('/admin/jobs', params),
  adminUpdateJobStatus: async (id, status, reason) =>
    patch(`/admin/jobs/${id}/status`, { status, reason }),
  adminDeleteJob: async (id) => del(`/admin/jobs/${id}`),
  adminCompanies: async (params = {}) => get('/admin/companies', params),
  adminVerifyCompany: async (id, isVerified) =>
    patch(`/admin/companies/${id}/verify`, { isVerified }),
  adminDeleteCompany: async (id) => del(`/admin/companies/${id}`),
  adminStudents: async (params = {}) => get('/admin/students', params),
  adminDeleteStudent: async (id) => del(`/admin/students/${id}`),
  adminNotifications: async (params = {}) => get('/admin/notifications', params),
  adminMarkAllNotificationsRead: async () => post('/admin/notifications/mark-all-read', {}),
  adminSettings: async () => get('/admin/settings'),
  adminUpdateSettings: async (settings) => put('/admin/settings', settings),
  markAllNotificationsRead: async () => post('/notifications/mark-all-read', {})
};
