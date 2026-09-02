/* eslint-env serviceworker */
/**
 * sw.js — Patient Portal service worker
 *
 * Responsibilities:
 *  1. Precache the app shell so Register / Triage / MyToken screens still
 *     load their JS/CSS/HTML when there's no connection at all.
 *  2. Runtime-cache GET requests to the API (queue position, token status)
 *     with a "network falling back to cache" strategy, so the last known
 *     value is shown even when offline.
 *  3. Listen for a Background Sync event ("sync-queue") fired once the
 *     network returns, and ask the page(s) to flush the offline queue.
 *     (Background Sync isn't supported everywhere, so the page also
 *     retries on the browser's `online` event — see register.js.)
 */

const SHELL_CACHE = 'shell-v1';
const RUNTIME_CACHE = 'runtime-v1';

// Keep this list small and specific to what's needed to boot the app offline.
// Adjust to match the real build output (e.g. from your bundler's manifest).
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
];

// API routes we're willing to serve stale-but-cached data for when offline.
const CACHEABLE_API_PATTERNS = [
  /\/api\/queue\/position/,
  /\/api\/triage\/status/,
  /\/api\/token\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheableApiGet(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  return CACHEABLE_API_PATTERNS.some((re) => re.test(url.pathname));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET for caching strategies; POST/PUT are left to the page,
  // which queues them in IndexedDB via db.js when offline (see register.js).
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigations: try network, fall back to cached shell / offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () =>
          caches.match(request) ||
          caches.match('/index.html') ||
          caches.match('/offline.html')
      )
    );
    return;
  }

  // API reads we care about offline: network-first, cache fallback, and
  // always refresh the cache on success so the "last known" value is fresh.
  if (isCacheableApiGet(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (static assets): cache-first, network fallback.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});

// Background Sync: fired by the browser once connectivity is restored,
// if the page registered a sync tag (see register.js: requestBackgroundSync).
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(notifyClientsToFlushQueue());
  }
});

// Some browsers (iOS Safari, some desktop configs) don't support
// Background Sync at all — the page's own `online` listener is the
// primary mechanism there. This is a best-effort enhancement.
async function notifyClientsToFlushQueue() {
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach((client) => client.postMessage({ type: 'FLUSH_QUEUE' }));
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
