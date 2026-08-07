const API_BASE_URL = 'http://localhost:5000/api';

async function fetchJson(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`API call to ${endpoint} failed, using local state fallback:`, error);
    return null;
  }
}

export const api = {
  // Auth API
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

    signup: (userData: any) =>
      fetchJson('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  },

  // Products API
  products: {
    getAll: (params: Record<string, string> = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson(`/products${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => fetchJson(`/products/${id}`),

    create: (productData: any) =>
      fetchJson('/products', { method: 'POST', body: JSON.stringify(productData) }),

    delete: (id: string, reason?: string) =>
      fetchJson(`/products/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),

    getUnlisted: () => fetchJson('/products/unlisted/all'),
  },

  // Orders API
  orders: {
    getAll: () => fetchJson('/orders'),
    create: (orderData: any) => fetchJson('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    updateStatus: (id: string, status: string) =>
      fetchJson(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  // Admin API
  admin: {
    getCommissionRules: () => fetchJson('/admin/commission-rules'),
    updateCommissionRules: (rules: any) =>
      fetchJson('/admin/commission-rules', { method: 'POST', body: JSON.stringify(rules) }),

    getSellers: () => fetchJson('/admin/sellers'),
    approveSeller: (id: string, status: 'Active' | 'Blocked' = 'Active') =>
      fetchJson(`/admin/sellers/${id}/approve`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  // Customer Reports & Warnings API
  reports: {
    getAll: () => fetchJson('/reports'),
    solve: (id: string) => fetchJson(`/reports/${id}/solve`, { method: 'PUT' }),
    reopen: (id: string) => fetchJson(`/reports/${id}/reopen`, { method: 'PUT' }),
    sendWarning: (id: string) => fetchJson(`/reports/${id}/warning`, { method: 'POST' }),
    getSellerWarnings: () => fetchJson('/reports/warnings/seller'),
  },
};
