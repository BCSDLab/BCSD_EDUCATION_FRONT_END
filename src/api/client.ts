import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const client = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableRequestConfig;

    if (error.response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      useAuthStore.getState().clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { refresh } = await import('./auth');
      const { accessToken } = await refresh(refreshToken);

      useAuthStore.getState().setTokens(accessToken, refreshToken);
      config.headers.Authorization = `Bearer ${accessToken}`;

      return client(config);
    } catch {
      useAuthStore.getState().clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
);

export default client;
