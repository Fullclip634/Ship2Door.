import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ship2door_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('ship2door_admin_token');
            localStorage.removeItem('ship2door_admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    getCustomers: () => api.get('/auth/customers'),
};

// Trips
export const tripAPI = {
    getAll: (params) => api.get('/trips', { params }),
    getActive: () => api.get('/trips/active'),
    getOne: (id) => api.get(`/trips/${id}`),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    updateStatus: (id, data) => api.put(`/trips/${id}/status`, data),
    delete: (id) => api.delete(`/trips/${id}`),
    getStats: () => api.get('/trips/stats'),
};

// Bookings
export const bookingAPI = {
    getAll: (params) => api.get('/bookings/all', { params }),
    getMy: (params) => api.get('/bookings/my', { params }),
    getOne: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
    updatePickup: (id, data) => api.put(`/bookings/${id}/pickup`, data),
};

// Notifications
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

// Announcements
export const announcementAPI = {
    getAll: (params) => api.get('/announcements', { params }),
    create: (data) => api.post('/announcements', data),
    delete: (id) => api.delete(`/announcements/${id}`),
};

export default api;
