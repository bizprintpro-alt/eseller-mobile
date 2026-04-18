/**
 * Thin wrapper over the shared axios client for herder endpoints.
 * Backend route prefix: /api/herder (the axios baseURL already includes /api).
 */

import { get } from '../../services/api';
import type { HerderListParams, HerderListResponse, HerderProduct } from './types';

function unwrap<T>(res: any): T {
  // Response interceptor returns res.data; some handlers wrap again as { success, data }.
  if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
    return res.data as T;
  }
  return res as T;
}

export const HerderAPI = {
  list: async (params: HerderListParams = {}): Promise<HerderListResponse> => {
    const res = await get('/herder/products', params);
    const data = unwrap<Partial<HerderListResponse>>(res);
    return {
      products: data.products ?? [],
      pages:    data.pages    ?? 0,
      total:    data.total,
    };
  },

  detail: async (id: string): Promise<HerderProduct | null> => {
    const res = await get(`/herder/products/${id}`);
    const data = unwrap<HerderProduct | null>(res);
    return data ?? null;
  },
};
