import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE = __DEV__
  ? 'http://192.168.1.9:3000/api'   // local dev
  : 'https://eseller.mn/api';        // production

export const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — token нэмэх
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — алдаа боловсруулах
api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    const data = err.response?.data;
    const message = data?.message || data?.error || 'Сервертэй холбогдож чадсангүй';
    throw new Error(message);
  },
);

export const get = (url: string, params?: any) =>
  api.get(url, { params });

export const post = (url: string, data?: any) =>
  api.post(url, data);

export const put = (url: string, data?: any) =>
  api.put(url, data);

export const del = (url: string) =>
  api.delete(url);
