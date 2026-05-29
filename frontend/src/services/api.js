import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://alexandria-nu-black.vercel.app/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401 (expired or invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = import.meta.env.BASE_URL || '/';
        }
        return Promise.reject(error);
    }
);

export default api;
