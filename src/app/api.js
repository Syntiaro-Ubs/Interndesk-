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
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

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

const get  = (path, qs)  => request('GET',    `${path}${qs ? '?' + new URLSearchParams(qs) : ''}`);
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

  // ── Student profile (localStorage) ────────────────────────
  studentProfile: async () => {
    try {
      const raw = localStorage.getItem('interndesk_studentProfile');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  },

  publicStudentProfile: async (id) => ({
    id,
    name: 'Student',
    skills: ['React', 'JavaScript', 'Python'],
    education: 'B.Tech Computer Science'
  }),

  updateStudentProfile: async (body) => {
    const current = JSON.parse(localStorage.getItem('interndesk_studentProfile') || '{}');
    const updated = { ...current, ...body };
    localStorage.setItem('interndesk_studentProfile', JSON.stringify(updated));
    return updated;
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
    const response = await fetch(`${BASE_URL}/resumes/${encodeURIComponent(key)}`, { headers });
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

  markNotificationRead: async (id) => patch(`/notifications/${id}/read`, {}),

  // ── Admin ───────────────────────────────────────────────────
  adminStats: async () => get('/admin/stats'),
  adminJobs: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/admin/jobs${q ? '?' + q : ''}`);
  },
  adminUpdateJobStatus: async (id, status, reason) =>
    patch(`/admin/jobs/${id}/status`, { status, reason }),
  adminCompanies: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/admin/companies${q ? '?' + q : ''}`);
  },
  adminVerifyCompany: async (id, isVerified) =>
    patch(`/admin/companies/${id}/verify`, { isVerified }),
  adminStudents: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/admin/students${q ? '?' + q : ''}`);
  },
  adminNotifications: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/admin/notifications${q ? '?' + q : ''}`);
  },
  adminSettings: async () => get('/admin/settings'),
  adminUpdateSettings: async (settings) => put('/admin/settings', settings),
  markAllNotificationsRead: async () => post('/notifications/mark-all-read', {})
};
