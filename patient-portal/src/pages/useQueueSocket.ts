// patient-portal/src/hooks/useQueueSocket.ts
//
// ⚠️ PLACEHOLDER — NOT THE REAL HOOK ⚠️
//
// This file stands in for whatever `backend/realtime` actually exports.
// I have not seen docs/api-contracts.md and I'm not going to invent socket
// event names, so none of the strings/shapes below are confirmed.
//
// TODO before merging:
//   1. Replace this file's contents with the real import, e.g.:
//        export { useQueueSocket } from "backend/realtime/hooks/useQueueSocket";
//      (or whatever the actual package/path is)
//   2. Confirm with Rishikesh's team:
//        - the real hook's name and import path
//        - the actual event name(s) it listens for (I used
//          "queue:token_update" and "queue:list_update" purely as
//          descriptive placeholders — CONFIRM OR REPLACE)
//        - the exact payload shape per event (does it send a full
//          QueueTokenStatus/DepartmentQueue object, or a partial diff?)
//        - reconnect/backoff behavior — does the hook auto-resubscribe
//          after a reconnect, or does the caller need to re-emit a
//          "subscribe" message with the token/department?
//        - auth: does the socket need a token/session passed at connect
//          time, or does it ride on an existing cookie/session?
//   3. Delete the mock implementation below once the real hook is wired in.
//
// The two pages in this PR depend only on the TYPE SIGNATURES below,
// so swapping this file out for the real hook should require no changes
// to MyToken.tsx or LiveQueue.tsx — only to this file's contents.

import { useEffect, useRef, useState } from "react";
import type { QueueTokenStatus, DepartmentQueue } from "../types/queue";

export type SocketConnectionState =
  | "connecting"
  | "open"
  | "closed"
  | "error";

interface UseQueueSocketOptions {
  /** Department the queue belongs to. */
  department: string;
  /** If provided, subscribe to updates scoped to this single token. */
  token?: string;
}

interface UseQueueSocketResult {
  connectionState: SocketConnectionState;
  /** Latest single-token status, if `token` was provided and an update has arrived. */
  tokenStatus: QueueTokenStatus | null;
  /** Latest full department queue, if an update has arrived. */
  departmentQueue: DepartmentQueue | null;
}

/**
 * MOCK IMPLEMENTATION — see file header.
 *
 * Currently this just reports "connecting" forever and never delivers
 * updates, so pages using it will correctly fall back to their initial
 * REST fetch and simply not receive live updates until this is replaced.
 * This is intentional: it fails safe (stale-but-correct) rather than
 * fabricating fake live data.
 */
export function useQueueSocket({
  department,
  token,
}: UseQueueSocketOptions): UseQueueSocketResult {
  const [connectionState, setConnectionState] =
    useState<SocketConnectionState>("connecting");
  const [tokenStatus, setTokenStatus] = useState<QueueTokenStatus | null>(
    null
  );
  const [departmentQueue, setDepartmentQueue] =
    useState<DepartmentQueue | null>(null);

  const warnedRef = useRef(false);

  useEffect(() => {
    if (!warnedRef.current) {
      // eslint-disable-next-line no-console
      console.warn(
        "[useQueueSocket] Using placeholder hook — no real WebSocket " +
          "connection is being made. Replace src/hooks/useQueueSocket.ts " +
          "with the real backend/realtime hook before shipping."
      );
      warnedRef.current = true;
    }
    setConnectionState("connecting");
    // No actual socket wiring here on purpose — see file header.
  }, [department, token]);

  return { connectionState, tokenStatus, departmentQueue };
}
