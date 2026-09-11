import { useState, useEffect } from 'react';

export interface QueueState {
  currentToken: string;
  nextToken: string;
  userPosition: number;
  estimatedWaitMinutes: number;
  doctorStatus: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE';
  lastUpdated: string;
}

export function useQueue(hospitalId: string, departmentId: string) {
  const [queueState, setQueueState] = useState<QueueState>({
    currentToken: 'CARD-038',
    nextToken: 'CARD-039',
    userPosition: 3,
    estimatedWaitMinutes: 20,
    doctorStatus: 'ACTIVE',
    lastUpdated: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    // Simulated WebSocket ticker with auto updates
    const interval = setInterval(() => {
      setQueueState((prev) => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [hospitalId, departmentId]);

  return { queueState };
}
