const BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
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
    login: (username: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },
  services: {
    list: () => request('/services'),
    create: (name: string, color: string) =>
      request('/services', { method: 'POST', body: JSON.stringify({ name, color }) }),
    delete: (id: number) => request(`/services/${id}`, { method: 'DELETE' }),
  },
  staff: {
    list: () => request('/staff'),
    create: (body: Record<string, unknown>) =>
      request('/staff', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, unknown>) =>
      request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request(`/staff/${id}`, { method: 'DELETE' }),
  },
  patients: {
    list: (params: Record<string, string> = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/patients${q ? `?${q}` : ''}`);
    },
    stats: () => request('/patients/stats'),
    lookup: (medicalId: string) =>
      request(`/patients/lookup?medicalId=${encodeURIComponent(medicalId)}`),
    get: (id: number) => request(`/patients/${id}`),
    create: (body: Record<string, unknown>) =>
      request('/patients', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, unknown>) =>
      request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    transfer: (id: number, serviceId: number, updatedBy: string) =>
      request(`/patients/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ serviceId, updatedBy }),
      }),
    restore: (id: number, roomNumber: string, serviceId: number, restoredBy: string) =>
      request(`/patients/${id}/restore`, {
        method: 'POST',
        body: JSON.stringify({ roomNumber, serviceId, restoredBy }),
      }),
    addNote: (id: number, text: string, byName: string) =>
      request(`/patients/${id}/notes`, { method: 'POST', body: JSON.stringify({ text, byName }) }),
  },
  ai: {
    summary: (patient: Record<string, unknown>) =>
      request('/ai/summary', { method: 'POST', body: JSON.stringify({ patient }) }),
  },
};
