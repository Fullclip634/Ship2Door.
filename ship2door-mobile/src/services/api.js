import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Auto-detect the dev machine's IP from Expo's debugger host
const getApiBase = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
    const ip = debuggerHost.split(':')[0]; // Extract IP, drop the Expo port
    if (ip) return `http://${ip}:5000/api`;
    return 'http://localhost:5000/api'; // Fallback
};

const api = axios.create({
    baseURL: getApiBase(),
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('ship2door_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('ship2door_token');
            await AsyncStorage.removeItem('ship2door_user');
        }
        return Promise.reject(error);
    }
);

export const setApiBaseUrl = (url) => {
    api.defaults.baseURL = url;
};

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleLogin: (data) => api.post('/auth/google-login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    registerPushToken: (pushToken) => api.post('/auth/push-token', { pushToken }),
};

export const tripAPI = {
    getActive: () => api.get('/trips/active'),
    getAll: (params) => api.get('/trips', { params }),
    getOne: (id) => api.get(`/trips/${id}`),
};

export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getMy: (params) => api.get('/bookings/my', { params }),
    getOne: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    edit: (id, data) => api.put(`/bookings/${id}/edit`, data),
};

export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export const announcementAPI = {
    getAll: (params) => api.get('/announcements', { params }),
};

export default api;
