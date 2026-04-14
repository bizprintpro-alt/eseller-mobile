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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Social Commerce API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SocialAPI = {
  feed: (params?: { page?: number; limit?: number }) =>
    get('/social/feed', params),
  like: (postId: string) =>
    post(`/social/posts/${postId}/like`),
  unlike: (postId: string) =>
    del(`/social/posts/${postId}/like`),
  comments: (postId: string) =>
    get(`/social/posts/${postId}/comment`),
  comment: (postId: string, content: string) =>
    post(`/social/posts/${postId}/comment`, { content }),
  create: (data: { content?: string; images?: string[]; productIds?: string[] }) =>
    post('/social/posts', data),
};

// Cart is local (zustand + AsyncStorage). Use `useCart` from src/store/cart.
// This CartAPI is kept as a noop stub for legacy callers. Prefer useCart().add().
export const CartAPI = {
  add: async (_data: { productId: string; quantity: number }) => {
    // Local cart is primary — see src/store/cart.ts
    return { ok: true };
  },
};
