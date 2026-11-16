/**
 * Centralized REST API Service Client:
 * Handles Authentication, Livelihood & Real Job Portals, Fisherman Telemetry,
 * Driver Safety, Multi-Model AI Chat (xAI Grok & Ollama), Emergency SOS (4 registered contacts),
 * Real-Time Weather Forecast, and Nearby Places Search.
 */
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    // Relative '/api' is automatically forwarded by Vite's proxy to the Flask backend (http://127.0.0.1:5000),
    // eliminating CORS or localhost mismatch errors when accessed from mobile devices on LAN (e.g. http://10.86.40.14:5174/api)
    return '/api';
  }
  return 'http://127.0.0.1:5000/api';
};

const BASE_URL = getBaseUrl();

async function fetchJSON(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
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
  } catch (err) {
    if (err.status) {
      throw err;
    }
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(
        'Unable to connect to backend server. Please verify the Flask backend is running on port 5000.'
      );
    }
    throw err;
  }
}

export const api = {
  // Authentication
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
  getRegistrationStatus: () => fetchJSON('/auth/registration-status'),
  logout: () => fetchJSON('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => fetchJSON('/auth/me'),
  forgotPassword: (email, new_password) =>
    fetchJSON('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password }),
    }),

  // Livelihood & Real Job Application Portals
  getJobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/livelihood/jobs${qs ? '?' + qs : ''}`);
  },
  getJobPortals: () => fetchJSON('/livelihood/portals'),
  getSchemes: (category) =>
    fetchJSON(`/livelihood/schemes${category ? '?category=' + encodeURIComponent(category) : ''}`),
  getFinancialAssistance: () => fetchJSON('/livelihood/financial-assistance'),
  getSkillDevelopment: (category) =>
    fetchJSON(`/livelihood/skill-development${category ? '?category=' + encodeURIComponent(category) : ''}`),

  // Fisherman Support
  getFishermanOverview: (lat, lon) => {
    const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
    return fetchJSON(`/fisherman/overview${qs}`);
  },
  getFishingAlerts: (severity) =>
    fetchJSON(`/fisherman/alerts${severity ? '?severity=' + severity : ''}`),

  // Driver Support
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

  // Nearby Places & Geolocation Search
  getNearbyPlaces: (lat, lon, category = 'all') => {
    const qs = new URLSearchParams({ lat, lon, category }).toString();
    return fetchJSON(`/places/nearby?${qs}`);
  },
  searchPlaces: (q, lat, lon) => {
    const params = { q };
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    const qs = new URLSearchParams(params).toString();
    return fetchJSON(`/places/search?${qs}`);
  },
  reverseGeocode: (lat, lon) => {
    const qs = new URLSearchParams({ lat, lon }).toString();
    return fetchJSON(`/places/reverse-geocode?${qs}`);
  },
  getIPLocation: () => fetchJSON('/places/ip-location'),

  // Multi-Engine AI Assistant (Grok Cloud + Ollama Local + ChatGPT Conversations)
  getAIStatus: () => fetchJSON('/ai/status'),
  getAIModels: () => fetchJSON('/ai/models'),
  pullAIModel: (model_name) =>
    fetchJSON('/ai/pull', {
      method: 'POST',
      body: JSON.stringify({ model_name }),
    }),

  // Conversations (ChatGPT Style History)
  getConversations: (userId = null, module = null) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (module) params.append('module', module);
    const qs = params.toString();
    return fetchJSON(`/ai/conversations${qs ? '?' + qs : ''}`);
  },
  createConversation: (data = {}) =>
    fetchJSON('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getConversation: (convId) => fetchJSON(`/ai/conversations/${convId}`),
  deleteConversation: (convId) =>
    fetchJSON(`/ai/conversations/${convId}`, { method: 'DELETE' }),
  clearConversation: (convId) =>
    fetchJSON(`/ai/conversations/${convId}/clear`, { method: 'POST' }),

  // Chat Execution
  chatAI: (message, moduleContext = 'general', history = [], userId = null, selectedModel = 'auto') =>
    fetchJSON('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        module_context: moduleContext,
        history,
        user_id: userId,
        selected_model: selectedModel,
      }),
    }),
  chatWithAI: (message, moduleContext = 'general', history = [], userId = null, selectedModel = 'auto') =>
    fetchJSON('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        module_context: moduleContext,
        history,
        user_id: userId,
        selected_model: selectedModel,
      }),
    }),
  sendChatMessage: (message, userId = null, moduleContext = 'general', history = [], selectedModel = 'auto', conversationId = null) =>
    fetchJSON('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        user_id: userId,
        module_context: moduleContext,
        history,
        selected_model: selectedModel,
        conversation_id: conversationId,
      }),
    }),

  // Real-Time Streaming Chat (ChatGPT typing effect)
  streamAIChat: async ({ message, moduleContext = 'general', history = [], userId = null, selectedModel = 'auto', conversationId = null, onChunk, onDone, onError, signal }) => {
    const url = `${BASE_URL}/ai/chat/stream`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          module_context: moduleContext,
          history,
          user_id: userId,
          selected_model: selectedModel,
          conversation_id: conversationId,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const rawJson = trimmed.slice(6).trim();
            if (!rawJson) continue;
            try {
              const data = JSON.parse(rawJson);
              if (data.error && onError) {
                onError(new Error(data.message || 'Stream error'));
              } else if (data.chunk && onChunk) {
                onChunk(data.chunk, data);
              }
              if (data.done && onDone) {
                onDone(data);
              }
            } catch (jsonErr) {
              // skip malformed line
            }
          }
        }
      }
      if (onDone) onDone();
    } catch (err) {
      if (err.name === 'AbortError') {
        if (onDone) onDone({ aborted: true });
        return;
      }
      if (onError) onError(err);
      else throw err;
    }
  },

  getChatHistory: (userId = null, moduleContext = null) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (moduleContext) params.append('module_context', moduleContext);
    const qs = params.toString();
    return fetchJSON(`/ai/history${qs ? '?' + qs : ''}`);
  },
  clearChatHistory: () => fetchJSON('/ai/clear', { method: 'POST' }),

  // Emergency SOS (with 4 registered contacts: 6374926569, 7305800510, 8122603655, 7395893275)
  sendSOS: (reportData) =>
    fetchJSON('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  createEmergencyReport: (reportData) =>
    fetchJSON('/emergency/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  getEmergencyContacts: () => fetchJSON('/emergency/contacts'),
  getEmergencyReports: () => fetchJSON('/emergency/list'),

  // Weather (Real-Time Open-Meteo with Forecast & Precipitation)
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
};
