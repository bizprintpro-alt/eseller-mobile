/**
 * Offline write-queue for herder listings.
 *
 * Herders on rural 3G routinely lose connectivity mid-write. This queue
 * persists create/update payloads to AsyncStorage and drains them when
 * the network returns. It is intentionally *only* used for writes that
 * the caller has already classified as `isOffline` — retryable transport
 * failure, not a 4xx validation error that will just fail again.
 *
 * Contract:
 *  - enqueue() adds an item and returns the assigned id
 *  - list() returns all queued items (newest first)
 *  - drain() attempts each item in order, removing it on success; items
 *    that fail with `isOffline=true` stay queued with attempts+1, items
 *    that fail with a server error (4xx/5xx) stay queued with lastError
 *    set so the UI can surface it
 *  - remove() drops an item (used by "discard" UX)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HerderAPI } from './api';
import { isOfflineError } from '../../services/api';
import type { ProductWritable } from './types';

const STORAGE_KEY = 'herder-queue:v1';

export type QueueKind = 'create' | 'update';

export interface QueueItem {
  id:         string;
  kind:       QueueKind;
  productId?: string;      // required when kind === 'update'
  payload:    ProductWritable;
  createdAt:  number;
  attempts:   number;
  lastError?: string;      // server-side rejection (not offline)
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as QueueItem[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(items: QueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // queue is best-effort — swallow
  }
}

export async function list(): Promise<QueueItem[]> {
  const items = await readAll();
  return items.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function count(): Promise<number> {
  const items = await readAll();
  return items.length;
}

export async function enqueue(
  input: { kind: 'create'; payload: ProductWritable }
    | { kind: 'update'; productId: string; payload: ProductWritable },
): Promise<QueueItem> {
  const item: QueueItem = {
    id:        uid(),
    kind:      input.kind,
    productId: input.kind === 'update' ? input.productId : undefined,
    payload:   input.payload,
    createdAt: Date.now(),
    attempts:  0,
  };
  const items = await readAll();
  items.push(item);
  await writeAll(items);
  return item;
}

export async function remove(id: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((i) => i.id !== id));
}

export interface DrainResult {
  attempted: number;
  succeeded: number;
  failedOffline: number;   // stayed queued, network still down
  failedServer:  number;   // stayed queued with lastError set
}

/**
 * Attempt every queued write. Items that succeed are removed; items that
 * fail offline stay queued with attempts++ and no lastError; items that
 * fail with a server error stay queued with lastError populated so the
 * UI can distinguish "waiting for wifi" from "server rejected this".
 */
export async function drain(): Promise<DrainResult> {
  const items = await readAll();
  const result: DrainResult = { attempted: 0, succeeded: 0, failedOffline: 0, failedServer: 0 };
  if (!items.length) return result;

  const next: QueueItem[] = [];
  for (const item of items) {
    result.attempted += 1;
    try {
      if (item.kind === 'create') {
        await HerderAPI.my.products.create(item.payload);
      } else if (item.productId) {
        await HerderAPI.my.products.update(item.productId, item.payload);
      } else {
        // malformed — drop so we don't retry forever
        continue;
      }
      result.succeeded += 1;
    } catch (err) {
      const offline = isOfflineError(err);
      if (offline) {
        result.failedOffline += 1;
        next.push({ ...item, attempts: item.attempts + 1, lastError: undefined });
      } else {
        result.failedServer += 1;
        next.push({
          ...item,
          attempts:  item.attempts + 1,
          lastError: err instanceof Error ? err.message : 'Алдаа',
        });
      }
    }
  }
  await writeAll(next);
  return result;
}
