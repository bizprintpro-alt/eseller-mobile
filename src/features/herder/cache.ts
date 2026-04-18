/**
 * Offline-first cache for Malchnaas (direct-from-herder) data.
 *
 * Rationale: herders and buyers are often on flaky rural 3G. A failed
 * request should fall back to the last known response instead of a
 * blank screen. Cache is opaque JSON keyed by endpoint+params, 24h TTL.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'herder-cache:v1:';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface Envelope<T> {
  t: number;   // saved-at epoch ms
  v: T;
}

function key(endpoint: string, params?: Record<string, unknown>) {
  const sorted = params
    ? Object.keys(params)
        .sort()
        .map((k) => `${k}=${String(params[k] ?? '')}`)
        .join('&')
    : '';
  return `${PREFIX}${endpoint}${sorted ? '?' + sorted : ''}`;
}

export async function readCache<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key(endpoint, params));
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (Date.now() - env.t > TTL_MS) {
      AsyncStorage.removeItem(key(endpoint, params)).catch(() => {});
      return null;
    }
    return env.v;
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  endpoint: string,
  params: Record<string, unknown> | undefined,
  value: T,
): Promise<void> {
  try {
    const env: Envelope<T> = { t: Date.now(), v: value };
    await AsyncStorage.setItem(key(endpoint, params), JSON.stringify(env));
  } catch {
    // Cache write failures are non-fatal — swallow.
  }
}

export async function clearHerderCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(PREFIX));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // noop
  }
}

/**
 * Run `fetcher`; on success write-through to cache; on failure, fall back
 * to a cached value if one exists. Re-throws the original error if no cache.
 */
export async function withCache<T>(
  endpoint: string,
  params: Record<string, unknown> | undefined,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const fresh = await fetcher();
    writeCache(endpoint, params, fresh).catch(() => {});
    return fresh;
  } catch (err) {
    const cached = await readCache<T>(endpoint, params);
    if (cached !== null) return cached;
    throw err;
  }
}
