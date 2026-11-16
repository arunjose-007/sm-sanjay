const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add admin role header if logged in as admin
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.role === 'admin') {
        defaultHeaders['X-Admin-Role'] = 'admin';
      }
    } catch (e) {}
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (payload) =>
    fetchJSON('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () => fetchJSON('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => fetchJSON('/auth/me'),
  forgotPassword: (email, new_password) =>
    fetchJSON('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password }),
    }),

  // Livelihood
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/livelihood/jobs${qs ? '?' + qs : ''}`);
  },
  getSchemes: (category) =>
    fetchJSON(`/livelihood/schemes${category ? '?category=' + encodeURIComponent(category) : ''}`),
  getFinancialAssistance: () => fetchJSON('/livelihood/financial-assistance'),
  getSkillDevelopment: (category) =>
    fetchJSON(`/livelihood/skill-development${category ? '?category=' + encodeURIComponent(category) : ''}`),

  // Fisherman
  getFishermanOverview: (lat, lon) => {
    const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
    return fetchJSON(`/fisherman/overview${qs}`);
  },
  getFishingAlerts: (severity) =>
    fetchJSON(`/fisherman/alerts${severity ? '?severity=' + severity : ''}`),

  // Driver
  getDriverOverview: (lat, lon) => {
    const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
    return fetchJSON(`/driver/overview${qs}`);
  },
  getHospitals: (lat, lon) => {
    const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
    return fetchJSON(`/driver/hospitals${qs}`);
  },
  getRoadAlerts: (type) =>
    fetchJSON(`/driver/road-alerts${type ? '?type=' + encodeURIComponent(type) : ''}`),

  // Local Offline AI
  getAIStatus: () => fetchJSON('/ai/status'),
  chatWithAI: (message, moduleContext = 'general', history = [], userId = null) =>
    fetchJSON('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        module_context: moduleContext,
        history,
        user_id: userId,
      }),
    }),
  getChatHistory: (userId = null, moduleContext = null) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (moduleContext) params.append('module_context', moduleContext);
    const qs = params.toString();
    return fetchJSON(`/ai/history${qs ? '?' + qs : ''}`);
  },
  clearChatHistory: () => fetchJSON('/ai/clear', { method: 'POST' }),

  // Emergency SOS
  createEmergencyReport: (reportData) =>
    fetchJSON('/emergency/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  getEmergencyContacts: () => fetchJSON('/emergency/contacts'),
  getEmergencyReports: () => fetchJSON('/emergency/list'),

  // Weather
  getCurrentWeather: (lat, lon, name) => {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lon) params.append('lon', lon);
    if (name) params.append('name', name);
    const qs = params.toString();
    return fetchJSON(`/weather/current${qs ? '?' + qs : ''}`);
  },

  // Admin
  getAdminStats: () => fetchJSON('/admin/stats'),
  getAdminUsers: () => fetchJSON('/admin/users'),
  deleteUser: (id) => fetchJSON(`/admin/users/${id}`, { method: 'DELETE' }),

  addJob: (data) => fetchJSON('/admin/jobs', { method: 'POST', body: JSON.stringify(data) }),
  deleteJob: (id) => fetchJSON(`/admin/jobs/${id}`, { method: 'DELETE' }),

  addScheme: (data) => fetchJSON('/admin/schemes', { method: 'POST', body: JSON.stringify(data) }),
  deleteScheme: (id) => fetchJSON(`/admin/schemes/${id}`, { method: 'DELETE' }),

  addFinancialAssistance: (data) =>
    fetchJSON('/admin/financial-assistance', { method: 'POST', body: JSON.stringify(data) }),
  deleteFinancialAssistance: (id) =>
    fetchJSON(`/admin/financial-assistance/${id}`, { method: 'DELETE' }),

  addSkill: (data) =>
    fetchJSON('/admin/skill-development', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (id) =>
    fetchJSON(`/admin/skill-development/${id}`, { method: 'DELETE' }),

  addFishingAlert: (data) =>
    fetchJSON('/admin/fishing-alerts', { method: 'POST', body: JSON.stringify(data) }),
  deleteFishingAlert: (id) =>
    fetchJSON(`/admin/fishing-alerts/${id}`, { method: 'DELETE' }),

  addRoadAlert: (data) =>
    fetchJSON('/admin/road-alerts', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoadAlert: (id) =>
    fetchJSON(`/admin/road-alerts/${id}`, { method: 'DELETE' }),

  getAdminEmergencyReports: () => fetchJSON('/admin/emergency-reports'),
};
