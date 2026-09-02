import React from 'react';
import { useOfflineSync } from './useOfflineSync';

/**
 * OfflineBanner
 * Drop this near the top of Register, Triage, or MyToken screens.
 * Shows automatically when offline, or when there are queued submissions
 * still waiting to sync (covers the "just came back online, syncing now"
 * moment too) — useful for a live demo: turn off wifi, submit a form,
 * turn wifi back on, watch the banner change and disappear.
 */
export default function OfflineBanner({ screen = 'app' }) {
  const { online, pendingCount, flush } = useOfflineSync(screen);

  if (online && pendingCount === 0) return null;

  const mode = !online ? 'offline' : 'syncing';

  return (
    <div
      role="status"
      aria-live="polite"
      style={styles[mode].container}
    >
      <span style={styles.dot(mode)} />
      <span style={styles.text}>
        {mode === 'offline'
          ? pendingCount > 0
            ? `You're offline — ${pendingCount} submission${pendingCount === 1 ? '' : 's'} saved and will send automatically once you're back online.`
            : "You're offline — showing the last known information. Forms will be saved and sent automatically."
          : `Back online — syncing ${pendingCount} saved submission${pendingCount === 1 ? '' : 's'}...`}
      </span>
      {mode === 'syncing' && (
        <button type="button" onClick={flush} style={styles.retryButton}>
          Retry now
        </button>
      )}
    </div>
  );
}

const styles = {
  offline: {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      background: '#fff3cd',
      border: '1px solid #f5c542',
      borderRadius: '8px',
      color: '#7a5b00',
      fontSize: '14px',
      marginBottom: '12px',
    },
  },
  syncing: {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      background: '#e6f4ea',
      border: '1px solid #34a853',
      borderRadius: '8px',
      color: '#1e6b34',
      fontSize: '14px',
      marginBottom: '12px',
    },
  },
  text: { flex: 1 },
  dot: (mode) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: mode === 'offline' ? '#f5c542' : '#34a853',
    flexShrink: 0,
  }),
  retryButton: {
    border: 'none',
    background: 'transparent',
    color: '#1e6b34',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
  },
};
