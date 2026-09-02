/**
 * register.js
 * Public API the rest of the app (Register / Triage / MyToken screens) uses.
 * Wraps the service worker + IndexedDB queue behind a small, framework-agnostic
 * set of functions so React components stay simple (see useOfflineSync.js).
 */

import {
  cacheGet,
  cacheSet,
  queueAdd,
  queueAll,
  queueRemove,
  queueUpdate,
  queueCount,
} from './db';

const listeners = new Set();

function emit(state) {
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Register the service worker. Call once, e.g. in your app's entry point. */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/src/pwa/sw.js');

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'FLUSH_QUEUE') {
        flushQueue();
      }
    });

    return reg;
  } catch (err) {
    // Non-fatal: app should still work online, just without offline support.
    console.warn('[pwa] service worker registration failed', err);
    return null;
  }
}

/** Ask the browser to wake us up (via the SW) as soon as connectivity returns. */
async function requestBackgroundSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('sync' in reg) {
      await reg.sync.register('sync-queue');
    }
  } catch {
    // Background Sync unsupported (e.g. Safari) — the `online` listener below
    // is the fallback path, so this is safe to ignore.
  }
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Core helper: try to submit a request now; if it fails (offline, or a
 * network-level failure) queue it for later and tell the UI to show the
 * offline banner. Always resolves — never throws — so screens can treat
 * "queued" the same way as a slow-but-successful request.
 *
 * @param {'register'|'triage'|'mytoken'} screen
 * @param {{url: string, method?: string, headers?: object, body?: any}} req
 * @returns {Promise<{status: 'sent'|'queued', data?: any, queueId?: number}>}
 */
export async function submitOrQueue(screen, req) {
  const { url, method = 'POST', headers = {}, body } = req;

  if (!isOnline()) {
    const queueId = await queueAdd(screen, { url, method, headers, body });
    emitQueueChanged();
    return { status: 'queued', queueId };
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body != null ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await safeJson(response);
    return { status: 'sent', data };
  } catch (err) {
    // Treat any network-level failure the same as being offline: queue it.
    const queueId = await queueAdd(screen, { url, method, headers, body });
    await requestBackgroundSync();
    emitQueueChanged();
    return { status: 'queued', queueId, error: String(err) };
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Replay every queued submission. Called on `online` events and SW pings. */
export async function flushQueue() {
  if (!isOnline()) return { flushed: 0, remaining: await queueCount() };

  const items = await queueAll();
  let flushed = 0;

  for (const item of items) {
    if (item.status === 'done') continue;

    await queueUpdate(item.id, { status: 'syncing' });
    try {
      const { url, method, headers, body } = item.request;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await queueRemove(item.id);
      flushed += 1;
    } catch (err) {
      await queueUpdate(item.id, {
        status: 'failed',
        attempts: (item.attempts || 0) + 1,
        lastError: String(err),
      });
    }
  }

  const remaining = await queueCount();
  emitQueueChanged();
  return { flushed, remaining };
}

function emitQueueChanged() {
  queueCount().then((count) => emit({ type: 'queue', online: isOnline(), count }));
}

/* --------------------- last-known-good cache helpers -------------------- */

/** e.g. cacheQueuePosition('token123', { position: 4, etaMinutes: 12 }) */
export async function cacheQueuePosition(tokenId, snapshot) {
  return cacheSet(`queuePosition:${tokenId}`, snapshot);
}

export async function getLastKnownQueuePosition(tokenId) {
  const record = await cacheGet(`queuePosition:${tokenId}`);
  return record ? { ...record.value, cachedAt: record.updatedAt, stale: true } : null;
}

/* --------------------------- connectivity wiring ------------------------- */

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    emit({ type: 'connectivity', online: true });
    flushQueue();
  });
  window.addEventListener('offline', () => {
    emit({ type: 'connectivity', online: false });
  });
}

export { queueAll, queueCount };
