const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  auth: {
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },
  services: {
    list: () => request('/services'),
    create: (name, color) => request('/services', { method: 'POST', body: JSON.stringify({ name, color }) }),
    delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  },
  staff: {
    list: () => request('/staff'),
    create: (body) => request('/staff', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
  },
  patients: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/patients${q ? `?${q}` : ''}`);
    },
    stats: () => request('/patients/stats'),
    lookup: (medicalId) => request(`/patients/lookup?medicalId=${encodeURIComponent(medicalId)}`),
    get: (id) => request(`/patients/${id}`),
    create: (body) => request('/patients', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    transfer: (id, serviceId, updatedBy) =>
      request(`/patients/${id}/transfer`, { method: 'POST', body: JSON.stringify({ serviceId, updatedBy }) }),
    restore: (id, roomNumber, serviceId, restoredBy) =>
      request(`/patients/${id}/restore`, { method: 'POST', body: JSON.stringify({ roomNumber, serviceId, restoredBy }) }),
    addNote: (id, text, byName) =>
      request(`/patients/${id}/notes`, { method: 'POST', body: JSON.stringify({ text, byName }) }),
  },
  ai: {
    summary: (patient) => request('/ai/summary', { method: 'POST', body: JSON.stringify({ patient }) }),
  },
};
