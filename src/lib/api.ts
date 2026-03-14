// Local Custom API Client (Replacing Supabase)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('supabase-auth-token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  },

  post: async (endpoint: string, body: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  },

  put: async (endpoint: string, body: any) => {
    const token = localStorage.getItem('supabase-auth-token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  },

  delete: async (endpoint: string) => {
    const token = localStorage.getItem('supabase-auth-token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  }
};
