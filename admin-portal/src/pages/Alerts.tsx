import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { api } from "../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string; // e.g. hospital / department / system name
  createdAt: string;
  acknowledged?: boolean;
}

interface AlertsResponse {
  alerts: AlertItem[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 8_000;

const SEVERITY_META: Record<
  AlertSeverity,
  { label: string; dot: string; badge: string; order: number }
> = {
  CRITICAL: { label: "Critical", dot: "bg-red-500", badge: "bg-red-50 text-red-700 ring-red-200", order: 0 },
  WARNING: { label: "Warning", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-200", order: 1 },
  INFO: { label: "Info", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 ring-blue-200", order: 2 },
};

// ---------------------------------------------------------------------------
// Optional shared WebSocket hook — used if present in the project.
// Falls back silently to polling-only if unavailable at build/runtime.
// ---------------------------------------------------------------------------

function useAlertsSocket(onMessage: (data: AlertsResponse) => void) {
  const enabledRef = useRef(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    import("../hooks/useWebSocket")
      .then((mod) => {
        if (cancelled || !mod?.subscribeToChannel) {
          enabledRef.current = false;
          return;
        }
        cleanup = mod.subscribeToChannel("alerts:live", (payload: AlertsResponse) => {
          onMessage(payload);
        });
      })
      .catch(() => {
        enabledRef.current = false;
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return enabledRef;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [search, setSearch] = useState("");
  const [, forceTick] = useState(0); // re-render periodically to keep relative timestamps fresh

  const fetchAlerts = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get<AlertsResponse>("/api/v1/alerts");
      setAlerts(res.data.alerts);
      setGeneratedAt(res.data.generatedAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(false);
    const interval = setInterval(() => fetchAlerts(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Tick every 30s so "Xm ago" labels stay accurate without a full refetch
  useEffect(() => {
    const tick = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(tick);
  }, []);

  const wsEnabled = useAlertsSocket((data) => {
    setAlerts(data.alerts);
    setGeneratedAt(data.generatedAt);
    setError(null);
    setLoading(false);
  });

  const filtered = useMemo(() => {
    let result = alerts;

    if (severityFilter !== "all") {
      result = result.filter((a) => a.severity === severityFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      const sevDiff = SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order;
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, severityFilter, search]);

  const counts = useMemo(() => {
    return alerts.reduce(
      (acc, a) => {
        acc[a.severity] += 1;
        return acc;
      },
      { CRITICAL: 0, WARNING: 0, INFO: 0 } as Record<AlertSeverity, number>
    );
  }, [alerts]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            System &amp; hospital alerts
            {generatedAt && (
              <span className="ml-2 text-gray-400">
                · updated {new Date(generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            wsEnabled.current ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              wsEnabled.current ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          {wsEnabled.current ? "Live" : `Polling · ${POLL_INTERVAL_MS / 1000}s`}
        </span>
      </div>

      {/* Severity summary chips (also act as filters) */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterChip
          label="All"
          count={alerts.length}
          active={severityFilter === "all"}
          onClick={() => setSeverityFilter("all")}
        />
        {(Object.keys(SEVERITY_META) as AlertSeverity[]).map((sev) => (
          <FilterChip
            key={sev}
            label={SEVERITY_META[sev].label}
            count={counts[sev]}
            dot={SEVERITY_META[sev].dot}
            active={severityFilter === sev}
            onClick={() => setSeverityFilter(sev)}
          />
        ))}
      </div>

      <input
        type="text"
        placeholder="Search alerts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error} — retrying…
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-2">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-white border border-gray-200 rounded-lg">
            No alerts match your filters.
          </div>
        )}

        {!loading &&
          filtered.map((alert) => {
            const meta = SEVERITY_META[alert.severity];
            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-lg p-4 flex gap-3 items-start ${
                  alert.severity === "CRITICAL" ? "border-red-200" : "border-gray-200"
                }`}
              >
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{alert.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{alert.source}</span>
                    <span>·</span>
                    <span title={new Date(alert.createdAt).toLocaleString()}>
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                    {alert.acknowledged && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-600">Acknowledged</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : dot}`} />}
      {label}
      <span className={active ? "text-gray-300" : "text-gray-400"}>{count}</span>
    </button>
  );
}
