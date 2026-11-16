// Shared Fetch API wrapper. The signed session token is attached automatically.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const stored = (() => { try { return JSON.parse(localStorage.getItem('lib_session')); } catch { return null; } })();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (stored?.token) headers.Authorization = `Bearer ${stored.token}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
