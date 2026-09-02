/**
 * db.js
 * Tiny IndexedDB wrapper used by the PWA layer.
 *
 * Two object stores:
 *  - "cache"  : last-known-good snapshots (queue position, triage status, token info)
 *               keyed by an arbitrary string, e.g. "queuePosition:token123"
 *  - "queue"  : pending form submissions (Register / Triage / MyToken actions)
 *               that couldn't reach the server, waiting to be replayed.
 */

const DB_NAME = 'patient-portal-offline';
const DB_VERSION = 1;
export const STORE_CACHE = 'cache';
export const STORE_QUEUE = 'queue';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('by_status', 'status', { unique: false });
        queueStore.createIndex('by_screen', 'screen', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function tx(storeName, mode) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        resolve({ transaction, store });
        transaction.onerror = () => reject(transaction.error);
      })
  );
}

/* ---------------------------- cache store ---------------------------- */

/** Save a snapshot of last-known-good data (e.g. queue position). */
export async function cacheSet(key, value) {
  const { transaction, store } = await tx(STORE_CACHE, 'readwrite');
  store.put({ key, value, updatedAt: Date.now() });
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

/** Read the last cached snapshot for a key, or null if none exists. */
export async function cacheGet(key) {
  const { transaction, store } = await tx(STORE_CACHE, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result : null);
    req.onerror = () => reject(req.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

/* ---------------------------- queue store ----------------------------- */

/**
 * Queue a form submission that failed (or was made while offline).
 * `screen` is one of "register" | "triage" | "mytoken" (used for UI grouping).
 * `request` describes how to replay it: { url, method, headers, body }.
 */
export async function queueAdd(screen, request) {
  const { transaction, store } = await tx(STORE_QUEUE, 'readwrite');
  const record = {
    screen,
    request,
    status: 'pending', // pending | syncing | failed
    attempts: 0,
    createdAt: Date.now(),
  };
  const addReq = store.add(record);
  return new Promise((resolve, reject) => {
    addReq.onsuccess = () => resolve(addReq.result); // returns new id
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function queueAll() {
  const { transaction, store } = await tx(STORE_QUEUE, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function queueRemove(id) {
  const { transaction, store } = await tx(STORE_QUEUE, 'readwrite');
  store.delete(id);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function queueUpdate(id, patch) {
  const { transaction, store } = await tx(STORE_QUEUE, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) return resolve(false);
      store.put({ ...existing, ...patch });
    };
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function queueCount() {
  const all = await queueAll();
  return all.filter((r) => r.status !== 'done').length;
}
