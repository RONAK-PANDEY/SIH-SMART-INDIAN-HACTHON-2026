// patient-portal/src/pages/MyToken.tsx
//
// Shows the patient's own token: current status, "Now Serving", position in
// line, patients ahead, and estimated wait.
//
// Data flow:
//   1. On mount, fetch GET /api/v1/queue/:token once for the initial state.
//   2. Then subscribe via useQueueSocket for live updates.
//
// NOTE: useQueueSocket is currently a placeholder (see
// src/hooks/useQueueSocket.ts). Swap that file for the real
// backend/realtime hook — no changes should be needed here as long as the
// real hook satisfies the same return shape.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueueSocket } from "../hooks/useQueueSocket";
import type { QueueTokenStatus } from "../types/queue";

interface FetchState {
  loading: boolean;
  error: string | null;
  data: QueueTokenStatus | null;
}

export default function MyToken() {
  const { token } = useParams<{ token: string }>();
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: true,
    error: null,
    data: null,
  });

  // One-time REST fetch for initial state.
  useEffect(() => {
    if (!token) {
      setFetchState({
        loading: false,
        error: "No token provided.",
        data: null,
      });
      return;
    }

    let cancelled = false;
    setFetchState((prev) => ({ ...prev, loading: true, error: null }));

    fetch(`/api/v1/queue/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to load token status (HTTP ${res.status})`
          );
        }
        return (await res.json()) as QueueTokenStatus;
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
  }, [token]);

  // Live updates. While useQueueSocket is a placeholder, tokenStatus stays
  // null and the UI simply keeps showing the REST-fetched snapshot.
  const { connectionState, tokenStatus } = useQueueSocket({
    department: fetchState.data?.department ?? "",
    token,
  });

  // Prefer the live socket value once one arrives; otherwise fall back to
  // the initial REST snapshot.
  const current = tokenStatus ?? fetchState.data;

  if (fetchState.loading && !current) {
    return (
      <div className="my-token-page my-token-page--loading">
        <p>Loading your token status…</p>
      </div>
    );
  }

  if (fetchState.error && !current) {
    return (
      <div className="my-token-page my-token-page--error">
        <p>Couldn&apos;t load your token: {fetchState.error}</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="my-token-page my-token-page--error">
        <p>No token status available.</p>
      </div>
    );
  }

  const isBeingServed = current.status === "called" || current.status === "in_progress";

  return (
    <div className="my-token-page">
      <header className="my-token-page__header">
        <h1>Your Token</h1>
        <span className="my-token-page__connection-badge" data-state={connectionState}>
          {connectionState === "open" ? "Live" : "Connecting…"}
        </span>
      </header>

      <div className="my-token-page__token-card" data-being-served={isBeingServed}>
        <div className="my-token-page__token-value">{current.token}</div>
        <div className="my-token-page__department">{current.department}</div>
        <div className="my-token-page__status">
          Status: <strong>{formatStatus(current.status)}</strong>
        </div>
      </div>

      <dl className="my-token-page__stats">
        <div className="my-token-page__stat">
          <dt>Now Serving</dt>
          <dd>{current.nowServingToken ?? "—"}</dd>
        </div>
        <div className="my-token-page__stat">
          <dt>Your Position</dt>
          <dd>{current.position > 0 ? `#${current.position}` : "—"}</dd>
        </div>
        <div className="my-token-page__stat">
          <dt>Patients Ahead</dt>
          <dd>{current.patientsAhead}</dd>
        </div>
        <div className="my-token-page__stat">
          <dt>Estimated Wait</dt>
          <dd>
            {current.estimatedWaitMinutes != null
              ? `${current.estimatedWaitMinutes} min`
              : "—"}
          </dd>
        </div>
      </dl>

      {isBeingServed && (
        <div className="my-token-page__called-banner" role="status">
          It&apos;s your turn — please proceed to the counter.
        </div>
      )}

      <p className="my-token-page__updated-at">
        Last updated: {new Date(current.updatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

function formatStatus(status: QueueTokenStatus["status"]): string {
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
