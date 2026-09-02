/**
 * Example integration for the MyToken screen.
 * Copy the relevant bits into your real src/screens/MyToken.jsx.
 */
import React from 'react';
import OfflineBanner from '../OfflineBanner';
import { useCachedQueuePosition } from '../useOfflineSync';

export default function MyTokenScreen({ tokenId }) {
  const { position, stale } = useCachedQueuePosition(
    tokenId,
    `/api/queue/position?token=${tokenId}`
  );

  return (
    <div>
      <OfflineBanner screen="mytoken" />
      <h2>My Token: {tokenId}</h2>

      {position ? (
        <>
          <p style={{ fontSize: '28px', margin: '8px 0' }}>
            Position {position.position}
          </p>
          <p>Estimated wait: ~{position.etaMinutes} min</p>
          {stale && (
            <p style={{ color: '#7a5b00', fontSize: '13px' }}>
              Last updated {formatAge(position.cachedAt)} — showing the most
              recent known position while offline.
            </p>
          )}
        </>
      ) : (
        <p>Looking up your queue position...</p>
      )}
    </div>
  );
}

function formatAge(timestamp) {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min ago`;
}
