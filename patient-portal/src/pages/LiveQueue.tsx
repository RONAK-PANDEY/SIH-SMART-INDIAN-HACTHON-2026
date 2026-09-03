// patient-portal/src/pages/LiveQueue.tsx
//
// Shows the full department queue list, with the current patient's own
// token highlighted. Initial list comes from the same per-token endpoint's
// department context is not enough on its own — see TODO below — and is
// then kept live via useQueueSocket.
//
// NOTE: useQueueSocket is currently a placeholder (see
// src/hooks/useQueueSocket.ts). Swap that file for the real
// backend/realtime hook — no changes should be needed here as long as the
// real hook satisfies the same return shape.
//
// TODO: I don't see a documented REST endpoint for fetching the *full*
// department queue list (only GET /api/v1/queue/:token for a single
// token's status was specified). Confirm the correct endpoint — I've
// assumed GET /api/v1/queue/department/:department below as a reasonable
// guess; update fetchInitialQueue() once confirmed.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueueSocket } from "../hooks/useQueueSocket";
import type { DepartmentQueue, QueueListEntry } from "../types/queue";

interface FetchState {
  loading: boolean;
  error: string | null;
  data: DepartmentQueue | null;
}

interface LiveQueueProps {
  /** The current patient's own token, used to highlight their row. */
  myToken?: string;
}

export default function LiveQueue({ myToken }: LiveQueueProps) {
  const { department } = useParams<{ department: string }>();
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!department) {
      setFetchState({
        loading: false,
        error: "No department specified.",
        data: null,
      });
      return;
    }

    let cancelled = false;
    setFetchState((prev) => ({ ...prev, loading: true, error: null }));

    // TODO: confirm this endpoint with the backend team (see file header).
    fetch(`/api/v1/queue/department/${encodeURIComponent(department)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load queue (HTTP ${res.status})`);
        }
        return (await res.json()) as DepartmentQueue;
      })
      .then((data) => {
        if (!cancelled) {
          setFetchState({ loading: false, error: null, data });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setFetchState({ loading: false, error: err.message, data: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [department]);

  const { connectionState, departmentQueue } = useQueueSocket({
    department: department ?? "",
  });

  const current = departmentQueue ?? fetchState.data;

  if (fetchState.loading && !current) {
    return (
      <div className="live-queue-page live-queue-page--loading">
        <p>Loading queue…</p>
      </div>
    );
  }

  if (fetchState.error && !current) {
    return (
      <div className="live-queue-page live-queue-page--error">
        <p>Couldn&apos;t load the queue: {fetchState.error}</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="live-queue-page live-queue-page--error">
        <p>No queue data available.</p>
      </div>
    );
  }

  return (
    <div className="live-queue-page">
      <header className="live-queue-page__header">
        <h1>{current.department} — Live Queue</h1>
        <span
          className="live-queue-page__connection-badge"
          data-state={connectionState}
        >
          {connectionState === "open" ? "Live" : "Connecting…"}
        </span>
      </header>

      <div className="live-queue-page__now-serving">
        Now Serving: <strong>{current.nowServingToken ?? "—"}</strong>
      </div>

      <ol className="live-queue-page__list">
        {current.entries.map((entry) => (
          <QueueRow key={entry.token} entry={entry} isMine={entry.token === myToken} />
        ))}
      </ol>

      {current.entries.length === 0 && (
        <p className="live-queue-page__empty">No patients currently in queue.</p>
      )}

      <p className="live-queue-page__updated-at">
        Last updated: {new Date(current.updatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

function QueueRow({
  entry,
  isMine,
}: {
  entry: QueueListEntry;
  isMine: boolean;
}) {
  return (
    <li
      className="live-queue-page__row"
      data-mine={isMine}
      aria-current={isMine ? "true" : undefined}
    >
      <span className="live-queue-page__row-position">#{entry.position}</span>
      <span className="live-queue-page__row-token">
        {entry.token}
        {isMine && <span className="live-queue-page__row-you-badge">You</span>}
      </span>
      <span className="live-queue-page__row-status">
        {formatStatus(entry.status)}
      </span>
    </li>
  );
}

function formatStatus(status: QueueListEntry["status"]): string {
  switch (status) {
    case "waiting":
      return "Waiting";
    case "called":
      return "Called";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "no_show":
      return "No Show";
    default:
      return status;
  }
}
