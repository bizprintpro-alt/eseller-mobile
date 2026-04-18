/**
 * Thin wrapper over the shared axios client for herder endpoints.
 * Backend route prefix: /api/herder (the axios baseURL already includes /api).
 */

import { get, post } from '../../services/api';
import type {
  HerderListParams,
  HerderListResponse,
  HerderProduct,
  HerderRegisterPayload,
  HerderRegisterResponse,
} from './types';

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

  /**
   * Submit a herder registration application.
   * Backend endpoint contract (pending — PRD §6.1):
   *   POST /api/herder/register
   *   body: HerderRegisterPayload
   *   → 201 { success, applicationId, message? } | 4xx { message }
   * Image uploads (vet cert) are expected as a prior step via the existing
   * /upload endpoint that returns a CDN URL — this call accepts the URL.
   */
  register: async (payload: HerderRegisterPayload): Promise<HerderRegisterResponse> => {
    const res = await post('/herder/register', payload);
    const data = unwrap<HerderRegisterResponse>(res);
    return data ?? { success: false, message: 'Хариу боловсруулж чадсангүй' };
  },
};
