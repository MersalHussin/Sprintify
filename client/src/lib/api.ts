import { auth } from './firebase';

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  // Vite inlines env vars at build time. When VITE_API_URL is missing on Vercel,
  // use same-origin /api (proxied via vercel.json) instead of localhost.
  if (import.meta.env.PROD) {
    return '/api';
  }

  return 'http://localhost:4000/api';
}

const BASE_URL = resolveApiBaseUrl();

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const token = await user.getIdToken();

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data.data;
}
