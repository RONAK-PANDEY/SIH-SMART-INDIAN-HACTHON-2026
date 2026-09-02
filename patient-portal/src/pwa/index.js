/**
 * Barrel file + app bootstrap hook.
 *
 * In your app's entry point (e.g. src/main.jsx / src/index.js):
 *
 *   import { registerServiceWorker } from './pwa';
 *
 *   registerServiceWorker();
 *
 * That's the only integration point needed globally. Individual screens
 * pull in `OfflineBanner` and `useOfflineSync` / `useCachedQueuePosition`
 * as shown in the *.example.jsx files in this folder.
 */
export { registerServiceWorker, submitOrQueue, flushQueue, isOnline } from './register';
export { useOfflineSync, useCachedQueuePosition } from './useOfflineSync';
export { default as OfflineBanner } from './OfflineBanner';
