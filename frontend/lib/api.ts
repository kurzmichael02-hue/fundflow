const API_BASE = '/api'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export const api = {
  login: (email: string, password: string, portal: 'founder' | 'investor' = 'founder') =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portal }),
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getInvestors: () => apiRequest('/investors'),

  addInvestor: (data: object) =>
    apiRequest('/investors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInvestor: (id: string, data: object) =>
    apiRequest(`/investors?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteInvestor: (id: string) =>
    apiRequest(`/investors?id=${id}`, { method: 'DELETE' }),
}