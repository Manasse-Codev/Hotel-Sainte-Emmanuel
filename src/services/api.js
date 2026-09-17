const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('hse_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('hse_token', token);
  } else {
    localStorage.removeItem('hse_token');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized, clear invalid token
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      setToken(null);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || `Erreur ${response.status}: requête impossible`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.access_token) {
        setToken(res.access_token);
      }
      return res;
    },
    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res?.access_token) {
        setToken(res.access_token);
      }
      return res;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setToken(null);
      }
    },
    getMe: () => request('/auth/me'),
    forgotPassword: (email) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token, newPassword) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      }),
  },

  // Rooms
  rooms: {
    getAll: () => request('/rooms'),
    getById: (id) => request(`/rooms/${id}`),
  },

  // Reservations
  reservations: {
    checkAvailability: (roomId, checkIn, checkOut) =>
      request('/reservations/check-availability', {
        method: 'POST',
        body: JSON.stringify({
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
        }),
      }),
    create: (reservationData) =>
      request('/reservations', {
        method: 'POST',
        body: JSON.stringify(reservationData),
      }),
    getMy: () => request('/reservations/my'),
    getById: (id) => request(`/reservations/${id}`),
    cancel: (id) => request(`/reservations/${id}/cancel`, { method: 'PATCH' }),
  },

  // Payments
  payments: {
    getMy: () => request('/payments/my'),
    create: (paymentData) =>
      request('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
  },

  // Reviews
  reviews: {
    getApproved: () => request('/reviews'),
    getMy: () => request('/reviews/my'),
    create: (reviewData) =>
      request('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
  },

  // Notifications
  notifications: {
    getMy: () => request('/notifications/my'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },

  // Activities
  activities: {
    getMy: () => request('/activities/my'),
  },

  // Users
  users: {
    updateProfile: (profileData) =>
      request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Admin
  admin: {
    getKpis: () => request('/admin/kpis'),
    getMovements: () => request('/admin/movements'),
    getReservations: () => request('/admin/reservations'),
    createReservation: (data) =>
      request('/admin/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateReservationStatus: (id, status) =>
      request(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getRooms: () => request('/admin/rooms'),
    updateRoomStatus: (id, status) =>
      request(`/admin/rooms/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateRoom: (id, data) =>
      request(`/admin/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getClients: () => request('/admin/users'),
    getPayments: () => request('/admin/payments'),
    updatePaymentStatus: (id, status) =>
      request(`/admin/payments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getReviews: () => request('/admin/reviews'),
    updateReviewStatus: (id, status) =>
      request(`/admin/reviews/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getActivities: () => request('/admin/activities'),
    getStatistics: () => request('/admin/statistics'),
    getSettings: () => request('/admin/settings'),
    updateSettings: (settings) =>
      request('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      }),
  },
};
