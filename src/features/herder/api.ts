/**
 * Thin wrapper over the shared axios client for herder endpoints.
 * Backend route prefix: /api/herder (the axios baseURL already includes /api).
 *
 * Reads (list/detail/profile) are cache-wrapped: the network call is the
 * source of truth when online; on failure the last successful response
 * (≤ 24h old) is returned instead of throwing. Writes (register) are not
 * cached — callers handle retry semantics.
 */

import { get, post } from '../../services/api';
import { withCache } from './cache';
import type {
  HerderListParams,
  HerderListResponse,
  HerderProduct,
  HerderProfile,
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
  list: (params: HerderListParams = {}): Promise<HerderListResponse> =>
    withCache('/herder/products', params as Record<string, unknown>, async () => {
      const res = await get('/herder/products', params);
      const data = unwrap<Partial<HerderListResponse>>(res);
      return {
        products: data.products ?? [],
        pages:    data.pages    ?? 0,
        total:    data.total,
      };
    }),

  detail: (id: string): Promise<HerderProduct | null> =>
    withCache(`/herder/products/${id}`, undefined, async () => {
      const res = await get(`/herder/products/${id}`);
      const data = unwrap<HerderProduct | null>(res);
      return data ?? null;
    }),

  /**
   * Public herder profile. Backend endpoint contract:
   *   GET /api/herder/profile/:herderId
   *   → 200 HerderProfile | 404
   */
  profile: (herderId: string): Promise<HerderProfile | null> =>
    withCache(`/herder/profile/${herderId}`, undefined, async () => {
      const res = await get(`/herder/profile/${herderId}`);
      const data = unwrap<HerderProfile | null>(res);
      return data ?? null;
    }),

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
