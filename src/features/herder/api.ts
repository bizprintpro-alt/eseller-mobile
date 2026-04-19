/**
 * Thin wrapper over the shared axios client for herder endpoints.
 * Backend route prefix: /api/herder (the axios baseURL already includes /api).
 *
 * Reads (list/detail/profile) are cache-wrapped: the network call is the
 * source of truth when online; on failure the last successful response
 * (≤ 24h old) is returned instead of throwing. Writes (register) are not
 * cached — callers handle retry semantics.
 */

import { get, post, put, del } from '../../services/api';
import { withCache } from './cache';
import type {
  ApplicationAction,
  ApplicationReviewResponse,
  ApplicationsResponse,
  ApplicationStatus,
  CoordinatorStats,
  EarningsSummary,
  HerderListParams,
  HerderListResponse,
  HerderOrderStatus,
  HerderProduct,
  HerderProfile,
  HerderRegisterPayload,
  HerderRegisterResponse,
  HerderRosterResponse,
  MyHerderOrder,
  MyHerderProduct,
  MyOrdersResponse,
  MyProductsResponse,
  ProductWritable,
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

  /**
   * Seller-side endpoints. All require an authenticated `herder` role whose
   * profile has `status === 'approved'` — 403 {status} is returned otherwise.
   * These are NOT cache-wrapped — writes must be authoritative, and seller
   * reads are small and personal enough that stale data would be misleading.
   */
  my: {
    products: {
      list: async (params: { status?: 'active' | 'all'; page?: number; limit?: number } = {}): Promise<MyProductsResponse> => {
        const res = await get('/herder/my/products', params);
        const data = unwrap<Partial<MyProductsResponse>>(res);
        return {
          products: data.products ?? [],
          total:    data.total    ?? 0,
          page:     data.page     ?? 1,
          pages:    data.pages    ?? 0,
        };
      },

      create: async (payload: ProductWritable): Promise<MyHerderProduct> => {
        const res = await post('/herder/my/products', payload);
        return unwrap<MyHerderProduct>(res);
      },

      update: async (id: string, payload: Partial<ProductWritable> & { isActive?: boolean }): Promise<MyHerderProduct> => {
        const res = await put(`/herder/my/products/${id}`, payload);
        return unwrap<MyHerderProduct>(res);
      },

      remove: async (id: string): Promise<{ success: boolean }> => {
        const res = await del(`/herder/my/products/${id}`);
        const data = unwrap<{ success?: boolean }>(res);
        return { success: data?.success ?? true };
      },
    },

    orders: {
      list: async (params: { status?: HerderOrderStatus; page?: number; limit?: number } = {}): Promise<MyOrdersResponse> => {
        const res = await get('/herder/my/orders', params);
        const data = unwrap<Partial<MyOrdersResponse>>(res);
        return {
          orders: data.orders ?? [],
          total:  data.total  ?? 0,
          page:   data.page   ?? 1,
          pages:  data.pages  ?? 0,
        };
      },

      updateStatus: async (id: string, status: HerderOrderStatus, note?: string): Promise<MyHerderOrder> => {
        const res = await put(`/herder/my/orders/${id}/status`, { status, note });
        return unwrap<MyHerderOrder>(res);
      },
    },

    earnings: async (): Promise<EarningsSummary> => {
      const res = await get('/herder/my/earnings');
      return unwrap<EarningsSummary>(res);
    },
  },

  /**
   * Coordinator-side endpoints. Require authenticated coordinator (or admin)
   * whose `coordinatorProvinces` scope covers the target aimag. Out-of-scope
   * writes return 404; the server deliberately hides whether an id exists
   * outside the coordinator's region.
   */
  coordinator: {
    applications: {
      list: async (
        params: { status?: ApplicationStatus | 'all'; page?: number; limit?: number } = {},
      ): Promise<ApplicationsResponse> => {
        const res = await get('/herder/coordinator/applications', params);
        const data = unwrap<Partial<ApplicationsResponse>>(res);
        return {
          applications: data.applications ?? [],
          total:        data.total        ?? 0,
          page:         data.page         ?? 1,
          pages:        data.pages        ?? 0,
        };
      },

      review: async (
        id: string,
        action: ApplicationAction,
        reason?: string,
      ): Promise<ApplicationReviewResponse> => {
        const res = await put(`/herder/coordinator/applications/${id}`, { action, reason });
        return unwrap<ApplicationReviewResponse>(res);
      },
    },

    herders: {
      list: async (params: { page?: number; limit?: number } = {}): Promise<HerderRosterResponse> => {
        const res = await get('/herder/coordinator/herders', params);
        const data = unwrap<Partial<HerderRosterResponse>>(res);
        return {
          herders: data.herders ?? [],
          total:   data.total   ?? 0,
          page:    data.page    ?? 1,
          pages:   data.pages   ?? 0,
        };
      },
    },

    stats: async (): Promise<CoordinatorStats> => {
      const res = await get('/herder/coordinator/stats');
      return unwrap<CoordinatorStats>(res);
    },
  },
};
