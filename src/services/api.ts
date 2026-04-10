import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE = 'https://eseller.mn/api';

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
    throw err.response?.data || new Error('Network error');
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
