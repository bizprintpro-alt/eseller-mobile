/**
 * Runtime feature-flag store, backed by (env default → AsyncStorage cache
 * → backend remote-config) in that layering order.
 *
 * Motivation: once a pilot is live, ops should be able to add an aimag
 * or pause the rollout without shipping a new Expo build. The master
 * kill-switch (`malchnaas.enabled`) and the pilot aimag list
 * (`malchnaas.pilotAimags`) are therefore both overridable at runtime.
 *
 * Contract with the backend (Sarana-eseller) — to be implemented on the
 * server side; this client tolerates 404 / missing fields / malformed
 * responses by falling back to env defaults:
 *
 *   GET /api/config/mobile
 *   → 200 {
 *       malchnaas?: { enabled?: boolean; pilotAimags?: string[] }
 *     }
 *
 * This is a public endpoint — no auth required. It must never return
 * anything user-specific or sensitive.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from '../services/api';
import {
  MALCHNAAS_ENABLED_DEFAULT,
  MALCHNAAS_PILOT_AIMAGS_DEFAULT,
} from './flags';

const CACHE_KEY  = 'remote-config:v1';
const REFRESH_MS = 15 * 60 * 1000; // 15 min — lazy refresh on foreground

export interface MalchnaasConfig {
  enabled:     boolean;
  pilotAimags: readonly string[];
}

interface RemoteConfigState {
  malchnaas:    MalchnaasConfig;
  source:       'default' | 'cache' | 'remote';
  lastFetched?: number;
  hydrate:      () => Promise<void>;
  refresh:      () => Promise<void>;
}

const DEFAULT_MALCHNAAS: MalchnaasConfig = {
  enabled:     MALCHNAAS_ENABLED_DEFAULT,
  pilotAimags: MALCHNAAS_PILOT_AIMAGS_DEFAULT,
};

interface CachedEnvelope {
  t: number;
  v: { malchnaas: MalchnaasConfig };
}

function coerceMalchnaas(raw: unknown): MalchnaasConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const enabled =
    typeof r.enabled === 'boolean'
      ? r.enabled
      : MALCHNAAS_ENABLED_DEFAULT;
  const pilotAimags = Array.isArray(r.pilotAimags)
    ? r.pilotAimags
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
        .map((s) => s.toUpperCase())
    : MALCHNAAS_PILOT_AIMAGS_DEFAULT;
  return { enabled, pilotAimags };
}

export const useRemoteConfig = create<RemoteConfigState>((set, getState) => ({
  malchnaas: DEFAULT_MALCHNAAS,
  source:    'default',

  // Read the most-recent cached payload (if any) into the store. Cheap,
  // synchronous-ish, called at app boot before the first network round-trip.
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const env = JSON.parse(raw) as CachedEnvelope;
      if (!env?.v?.malchnaas) return;
      set({
        malchnaas:    coerceMalchnaas(env.v.malchnaas),
        source:       'cache',
        lastFetched:  env.t,
      });
    } catch {
      // cache corrupt — ignore, defaults remain in place
    }
  },

  // Fetch fresh config from the backend and write-through to cache. 404s
  // and network errors are swallowed on purpose — the store stays on the
  // last-good value so a flaky connection never hides the marketplace.
  refresh: async () => {
    const last = getState().lastFetched ?? 0;
    if (Date.now() - last < REFRESH_MS && getState().source === 'remote') return;
    try {
      const res = await get('/config/mobile');
      const data = (res && typeof res === 'object' ? res : {}) as Record<string, unknown>;
      const malchnaas = coerceMalchnaas((data as { malchnaas?: unknown }).malchnaas);
      const now = Date.now();
      set({ malchnaas, source: 'remote', lastFetched: now });
      const env: CachedEnvelope = { t: now, v: { malchnaas } };
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(env)).catch(() => {});
    } catch {
      // Backend not shipped yet, or offline — keep whatever we had.
    }
  },
}));

// ─── Hooks & snapshots ────────────────────────────────────────────────
// Hooks subscribe to store updates so UI re-renders when ops flips a
// flag; snapshots are for non-reactive code paths (validators, filters
// inside event handlers) that don't need to re-render on change.

export const useMalchnaasEnabled = (): boolean =>
  useRemoteConfig((s) => s.malchnaas.enabled);

export const usePilotAimags = (): readonly string[] =>
  useRemoteConfig((s) => s.malchnaas.pilotAimags);

export function getMalchnaasEnabled(): boolean {
  return useRemoteConfig.getState().malchnaas.enabled;
}

export function getPilotAimags(): readonly string[] {
  return useRemoteConfig.getState().malchnaas.pilotAimags;
}

export function isPilotAimag(code: string | null | undefined): boolean {
  if (!code) return false;
  return getPilotAimags().includes(code.toUpperCase());
}
