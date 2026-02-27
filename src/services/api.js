const BASE = '/api';

function getAuthHeaders() {
  const stored = localStorage.getItem('fixmybanglore_user');
  const token = stored ? (JSON.parse(stored)?.token ?? null) : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `Request failed: ${res.status}`);
  }
  return data;
}

const api = {
  async getIssues() {
    const res = await fetch(`${BASE}/issues`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getIssue(id) {
    const res = await fetch(`${BASE}/issues/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getMyIssues() {
    const res = await fetch(`${BASE}/issues/mine`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createIssue(payload) {
    const res = await fetch(`${BASE}/issues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateIssue(id, payload) {
    const res = await fetch(`${BASE}/issues/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getUsers() {
    const res = await fetch(`${BASE}/auth/users`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getReports() {
    const res = await fetch(`${BASE}/reports`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getMyReports() {
    const res = await fetch(`${BASE}/reports/mine`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getReport(id) {
    const res = await fetch(`${BASE}/reports/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createReport(payload) {
    const res = await fetch(`${BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async uploadImages(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const token = (() => {
      const stored = localStorage.getItem('fixmybanglore_user');
      return stored ? (JSON.parse(stored)?.token ?? null) : null;
    })();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? `Upload failed: ${res.status}`);
    return data;
  },
};

export default api;
