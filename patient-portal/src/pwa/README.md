# PWA offline layer

Makes **Register**, **Triage**, and **MyToken** degrade gracefully when the
network drops: last-known data stays visible, form submissions queue up
locally, and everything auto-syncs the moment connectivity returns.

## Files

| File | Purpose |
|---|---|
| `sw.js` | Service worker: precaches the app shell, caches GETs to queue/triage/token endpoints ("last known good"), listens for Background Sync. |
| `db.js` | IndexedDB wrapper — two stores: `cache` (last-known snapshots) and `queue` (pending submissions). |
| `register.js` | Public API: `registerServiceWorker`, `submitOrQueue`, `flushQueue`, `cacheQueuePosition`, `getLastKnownQueuePosition`, connectivity events. |
| `useOfflineSync.js` | React hooks: `useOfflineSync(screen)` for forms, `useCachedQueuePosition(tokenId, url)` for read-heavy screens. |
| `OfflineBanner.jsx` | Drop-in banner: shows "You're offline" or "Syncing N submissions" automatically. |
| `manifest.webmanifest`, `offline.html` | Installability + last-resort fallback page. |
| `examples/*.example.jsx` | Reference wiring for each of the three screens. |

## Wiring it up

**1. Register the service worker once, at app startup:**

```js
// src/main.jsx
import { registerServiceWorker } from './pwa';
registerServiceWorker();
```

**2. In each screen**, add the banner and swap direct `fetch` calls for the
offline-aware helpers:

- Forms (Register, Triage) → `useOfflineSync(screenName).submit({ url, method, body })`.
  Returns `{ status: 'sent' }` or `{ status: 'queued' }` — always resolves,
  never throws, so the UI can show a friendly message either way.
- Read-heavy screens (MyToken, and Triage's live status) →
  `useCachedQueuePosition(tokenId, url)` for instant last-known values with
  a `stale` flag once you're back online with the API.

See `examples/Register.example.jsx`, `examples/Triage.example.jsx`, and
`examples/MyToken.example.jsx` for full, copy-pasteable implementations.

## How the pieces fit together

```
online:  screen -> submitOrQueue -> fetch() succeeds -> done
offline: screen -> submitOrQueue -> fetch() fails/skipped
                    -> IndexedDB "queue" store
                    -> OfflineBanner shows "N saved submissions"
                    -> browser 'online' event OR Background Sync fires
                    -> flushQueue() replays each queued request
                    -> banner clears once queue is empty
```

Reads (queue position, triage status) go through the service worker's
network-first-with-cache-fallback strategy in `sw.js`, *and* through
`cacheQueuePosition` / `getLastKnownQueuePosition` in `db.js` for an
instant, framework-level "last known" value shown before the network
request even resolves.

## Demoing it

1. Open the app, visit Register / Triage / MyToken once each (so the shell
   and their data get cached).
2. Open DevTools → Network tab → set to **Offline** (or turn off wifi on a
   real device).
3. The `OfflineBanner` appears immediately. MyToken keeps showing the last
   position it saw, labeled "Last updated Ns ago". Submitting a Register or
   Triage form shows "Saved — will send automatically" instead of erroring.
4. Go back online. Within a second or two the banner switches to "Syncing
   N submissions..." and then disappears once `flushQueue()` finishes. Check
   your API logs / network tab to confirm the queued requests actually went
   out.
5. Optional: click "Retry now" in the banner to trigger a flush manually
   instead of waiting for the automatic retry.

## Notes / limitations (worth mentioning in a demo)

- Background Sync (`sync-queue`) isn't supported in every browser (notably
  Safari); the `window.addEventListener('online', ...)` listener in
  `register.js` is the primary, universally-supported retry path — Background
  Sync is just a nice-to-have on top.
- The service worker path (`/src/pwa/sw.js`) and `APP_SHELL` list in `sw.js`
  assume this sits in a Vite/CRA-style static build; adjust the registration
  path and precache list to match your actual build output paths.
- Queued requests are replayed in the order they were created and are
  removed from the queue only after a successful (2xx) response; failed
  replays are marked `failed` with an `attempts` counter rather than
  silently dropped, so nothing is lost even across multiple failed sync
  attempts.
