import axios from 'axios';

// Phone physique: remplace par l'IP locale de ton PC (ex: 192.168.1.42)
// Émulateur Android: garde 10.0.2.2
// iOS Simulator: garde localhost
const API_HOST = '192.168.1.11';

const api = axios.create({
  baseURL: `http://${API_HOST}:3000/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const store = require('../../features/auth/store').useAuthStore;
  const token = store.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const store = require('../../features/auth/store').useAuthStore;
      store.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
