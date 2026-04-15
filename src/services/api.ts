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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Wallet API — eseller.mn wallet + escrow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Backend wraps JSON with { success, data, error }. Mobile axios interceptor
// already unwraps axios `response.data`, so the raw body is returned here.
// Callers should accept `res?.data ?? res` to handle both wrapped and raw shapes.

export interface WalletHistoryEntry {
  type?: string;
  amount?: number;
  description?: string;
  status?: string;
  orderId?: string;
  reference?: string;
  createdAt?: string;
  date?: string; // legacy entries
  method?: string;
}

export const WalletAPI = {
  getWallet: () => get('/wallet'),

  getTransactions: (page = 1, type?: string) => {
    const params: Record<string, string | number> = { page };
    if (type) params.type = type;
    return get('/wallet/transactions', params);
  },

  topUp: (data: {
    amount: number;
    method: 'qpay' | 'socialpay' | 'card';
    reference: string;
  }) => post('/wallet/topup', data),

  requestPayout: (data: {
    amount: number;
    bankName: string;
    bankAccount: string;
  }) => post('/wallet/payout', data),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Loyalty API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LoyaltyAPI = {
  get: () => get('/loyalty'),
  redeemForCash: (points: number) => post('/loyalty/redeem-cash', { points }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Live Commerce API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LiveStreamItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  viewerCount?: number;
  startedAt?: string | null;
  shop?: { id: string; name: string; logo?: string | null } | null;
  products?: unknown[];
}

export interface LiveProductItem {
  id: string;
  productId: string;
  flashPrice?: number | null;
  flashStock?: number | null;
  soldCount: number;
  isPinned: boolean;
  product: { id: string; name: string; price: number; images?: string[] };
}

export interface LiveMessageItem {
  id: string;
  content: string;
  type: 'TEXT' | 'PURCHASE' | 'LIKE' | 'JOIN' | string;
  createdAt: string;
  user: { id: string; name: string };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POS Terminal API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface POSProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  barcode?: string;
  stock: number;
  category?: string;
}

export interface POSCartItem {
  product: POSProduct;
  qty: number;
  subtotal: number;
}

export interface POSOrderInput {
  items: { productId: string; qty: number; price: number }[];
  paymentMethod: 'cash' | 'qpay' | 'card';
  cashReceived?: number;
  total: number;
  vatIncluded: boolean;
}

export const POSAPI = {
  /** Product search for terminal (name / barcode) */
  searchProducts: (query: string) =>
    get('/products', { search: query, limit: 20 }),

  /**
   * Create QPay invoice — backend route requires `orderId`.
   * POS generates a synthetic `POS-<timestamp>` id so the invoice
   * can be looked up later when the POS order route lands.
   */
  createQPayInvoice: (orderId: string, amount: number, description?: string) =>
    post('/payment/qpay/create', {
      orderId,
      amount,
      description: description || 'POS захиалга',
    }),

  /** Poll payment status — POST body `{invoiceId}`; response `{paid, paidDate?}` */
  checkPayment: (invoiceId: string) =>
    post('/payment/qpay/check', { invoiceId }),

  /** POST /api/orders/pos — create completed POS sale */
  createOrder: (data: POSOrderInput) => post('/orders/pos', data),

  /** GET /api/orders/pos/history?date=YYYY-MM-DD — daily sales list */
  getSalesHistory: (date?: string) =>
    get('/orders/pos/history', {
      date: date ?? new Date().toISOString().split('T')[0],
    }),

  /** POST /api/orders/pos/refund — reverse a completed POS sale */
  refundOrder: (orderId: string, reason?: string) =>
    post('/orders/pos/refund', { orderId, reason }),

  /** POST /api/orders/pos/void — cancel within 5-minute window */
  voidOrder: (orderId: string) => post('/orders/pos/void', { orderId }),
};

export const LiveAPI = {
  /** GET /api/live?status=LIVE — currently broadcasting streams */
  getActive: () => get('/live', { status: 'LIVE' }),

  /** GET /api/live?status=SCHEDULED — upcoming streams */
  getScheduled: () => get('/live', { status: 'SCHEDULED' }),

  /** GET /api/live/[id] — stream detail + products + recent messages */
  getById: (id: string) => get(`/live/${id}`),

  /** POST /api/live/[id]/messages — send chat message (type TEXT default) */
  sendMessage: (id: string, content: string, type: string = 'TEXT') =>
    post(`/live/${id}/messages`, { content, type }),

  /** POST /api/live/[id]/purchase — buy a live product */
  purchase: (id: string, productId: string) =>
    post(`/live/${id}/purchase`, { productId }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Orders API — buyer/seller/driver
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const OrderAPI = {
  // Buyer
  myOrders: () => get('/buyer/orders'),
  detail: (id: string) => get(`/buyer/orders/${id}`),

  // Seller
  sellerOrders: (status?: string) =>
    get('/seller/orders', status ? { status } : undefined),
  updateStatus: (id: string, status: string) =>
    put(`/seller/orders/${id}/status`, { status }),

  // Driver
  availableOrders: () => get('/driver/orders', { type: 'available' }),
  myDeliveries: () => get('/driver/orders', { type: 'mine' }),
  accept: (id: string) => post(`/driver/orders/${id}/accept`),
  deliver: (id: string) => post(`/driver/orders/${id}/deliver`),
};
