import { useEffect, useState, useCallback } from 'react';
import {
  subscribe,
  isOnline,
  submitOrQueue,
  flushQueue,
  queueCount,
  cacheQueuePosition,
  getLastKnownQueuePosition,
} from './register';

/**
 * useOfflineSync
 *
 * Drop into Register, Triage, or MyToken screens to get:
 *  - `online`        : current connectivity
 *  - `pendingCount`   : number of queued submissions waiting to sync
 *  - `submit(req)`    : POST helper that queues automatically when offline
 *  - `flush()`        : manually trigger a retry of the queue (e.g. a "Retry now" button)
 *
 * @param {'register'|'triage'|'mytoken'} screen
 */
export function useOfflineSync(screen) {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    queueCount().then((c) => mounted && setPendingCount(c));

    const unsubscribe = subscribe((state) => {
      if (!mounted) return;
      if (state.type === 'connectivity') setOnline(state.online);
      if (state.type === 'queue') {
        setPendingCount(state.count);
        setOnline(state.online);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const submit = useCallback(
    async (req) => {
      const result = await submitOrQueue(screen, req);
      setLastSyncResult(result);
      return result;
    },
    [screen]
  );

  const flush = useCallback(async () => {
    const result = await flushQueue();
    setLastSyncResult(result);
    return result;
  }, []);

  return { online, pendingCount, submit, flush, lastSyncResult };
}

/**
 * useCachedQueuePosition
 * For MyToken / Triage: shows the last known queue position immediately,
 * then swaps in a live value once a fresh fetch succeeds. Falls back to the
 * cached (stale) value indefinitely if the network never returns.
 *
 * @param {string} tokenId
 * @param {string} liveUrl  e.g. `/api/queue/position?token=${tokenId}`
 */
export function useCachedQueuePosition(tokenId, liveUrl) {
  const [position, setPosition] = useState(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1. Show whatever we last knew, immediately.
    getLastKnownQueuePosition(tokenId).then((cached) => {
      if (mounted && cached) {
        setPosition(cached);
        setStale(true);
      }
    });

    // 2. Try to get a fresh value; cache it for next time.
    fetch(liveUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (!mounted) return;
        setPosition(data);
        setStale(false);
        cacheQueuePosition(tokenId, data);
      })
      .catch(() => {
        // Offline or request failed — the cached value set above (if any)
        // remains on screen, marked stale. Nothing else to do here.
      });

    return () => {
      mounted = false;
    };
  }, [tokenId, liveUrl]);

  return { position, stale };
}
