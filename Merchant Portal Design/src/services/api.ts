// Merchant Portal Design/src/services/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (userId) {
    headers['user-id'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const data = await apiCall<{ success: boolean; user: any; merchant: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success) {
      localStorage.setItem('user_id', data.user.id.toString());
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.merchant) {
        localStorage.setItem('merchant_id', data.merchant.id.toString());
        localStorage.setItem('merchant', JSON.stringify(data.merchant));
      }
      // Dispatch event to update UI
      window.dispatchEvent(new Event('userDataUpdated'));
    }
    
    return data;
  },

  async signup(email: string, password: string, business_name?: string) {
    const data = await apiCall<{ success: boolean; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, business_name }),
    });
    
    if (data.success && data.user) {
      localStorage.setItem('user_id', data.user.id.toString());
      // Store user with all available data
      const userData = {
        ...data.user,
        business_name: business_name || data.user.business_name || email.split('@')[0]
      };
      localStorage.setItem('user', JSON.stringify(userData));
      // Dispatch event to update UI
      window.dispatchEvent(new Event('userDataUpdated'));
    }
    
    return data;
  },

  async getCurrentUser() {
    return apiCall<{ success: boolean; user: any; merchant: any }>('/auth/me');
  },

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user');
    localStorage.removeItem('merchant_id');
    localStorage.removeItem('merchant');
    localStorage.removeItem('auth_token');
    // Dispatch event to update UI
    window.dispatchEvent(new Event('userDataUpdated'));
  },
};

// Bookings API
export const bookingsAPI = {
  async getAll(params?: { merchant_id?: number; date?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.merchant_id) queryParams.append('merchant_id', params.merchant_id.toString());
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return apiCall<any[]>(`/bookings${query ? `?${query}` : ''}`);
  },

  async getById(id: number) {
    return apiCall<any>(`/bookings/${id}`);
  },

  async create(booking: {
    merchant_id: number;
    service_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    booking_date: string;
    booking_time: string;
    party_size?: number;
    total_price?: number;
    notes?: string;
    staff_name?: string;
  }) {
    return apiCall<{ success: boolean; booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  },

  async update(id: number, updates: Partial<{
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    booking_date: string;
    booking_time: string;
    party_size: number;
    total_price: number;
    notes: string;
    status: string;
    staff_name: string;
  }>) {
    return apiCall<{ success: boolean; booking: any }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async cancel(id: number) {
    return apiCall<{ success: boolean; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  async exportCSV(params?: { merchant_id?: number; start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.merchant_id) queryParams.append('merchant_id', params.merchant_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const query = queryParams.toString();
    const url = `${API_BASE_URL}/bookings/export/csv${query ? `?${query}` : ''}`;
    const userId = localStorage.getItem('user_id');
    
    const headers: HeadersInit = {};
    if (userId) {
      headers['user-id'] = userId;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to export bookings');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Merchants API
export const merchantsAPI = {
  async getAll() {
    return apiCall<any[]>('/merchants');
  },

  async getBySlug(slug: string) {
    return apiCall<any>(`/merchants/${slug}`);
  },
};

