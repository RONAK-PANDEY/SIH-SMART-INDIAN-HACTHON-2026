import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { api } from "../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueueStatus = "normal" | "busy" | "critical" | "offline";

interface LiveQueueRow {
  id: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  queueLength: number;
  avgWaitMinutes: number;
  status: QueueStatus;
  updatedAt: string;
}

interface LiveQueuesResponse {
  queues: LiveQueueRow[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 10_000;

const STATUS_META: Record<QueueStatus, { label: string; dot: string; text: string }> = {
  normal: { label: "Normal", dot: "bg-emerald-500", text: "text-emerald-700" },
  busy: { label: "Busy", dot: "bg-amber-500", text: "text-amber-700" },
  critical: { label: "Critical", dot: "bg-red-500", text: "text-red-700" },
  offline: { label: "Offline", dot: "bg-gray-400", text: "text-gray-500" },
};

// ---------------------------------------------------------------------------
// Optional shared WebSocket hook — used if present in the project.
// Falls back silently to polling-only if unavailable at build/runtime.
// ---------------------------------------------------------------------------

function useLiveQueueSocket(onMessage: (data: LiveQueuesResponse) => void) {
  const enabledRef = useRef(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Dynamic import so this page still works even if the shared hook
    // doesn't exist yet in this codebase.
    import("../hooks/useWebSocket")
      .then((mod) => {
        if (cancelled || !mod?.subscribeToChannel) {
          enabledRef.current = false;
          return;
        }
        cleanup = mod.subscribeToChannel("queues:live", (payload: LiveQueuesResponse) => {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type SortKey = "hospitalName" | "department" | "queueLength" | "avgWaitMinutes" | "status";

export default function LiveQueues() {
  const [rows, setRows] = useState<LiveQueueRow[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("queueLength");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchQueues = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get<LiveQueuesResponse>("/api/v1/queues/live");
      setRows(res.data.queues);
      setGeneratedAt(res.data.generatedAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live queues.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load + polling fallback
  useEffect(() => {
    fetchQueues(false);
    const interval = setInterval(() => fetchQueues(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchQueues]);

  // Live WebSocket updates, when available, replace polled data as it arrives
  const wsEnabled = useLiveQueueSocket((data) => {
    setRows(data.queues);
    setGeneratedAt(data.generatedAt);
    setError(null);
    setLoading(false);
  });

  const filteredSorted = useMemo(() => {
    let result = rows;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.hospitalName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }

    const dir = sortDir === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    return result;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "hospitalName" || key === "department" ? "asc" : "desc");
    }
  };

  const summary = useMemo(() => {
    const totalQueued = rows.reduce((sum, r) => sum + r.queueLength, 0);
    const critical = rows.filter((r) => r.status === "critical").length;
    const avgWait =
      rows.length > 0
        ? Math.round(rows.reduce((sum, r) => sum + r.avgWaitMinutes, 0) / rows.length)
        : 0;
    return { totalQueued, critical, avgWait };
  }, [rows]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Queues</h1>
          <p className="text-sm text-gray-500 mt-1">
            Queue status across all hospitals
            {generatedAt && (
              <span className="ml-2 text-gray-400">
                · updated {new Date(generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
              wsEnabled.current
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Total Queued Patients" value={summary.totalQueued} />
        <SummaryCard
          label="Critical Departments"
          value={summary.critical}
          accent={summary.critical > 0 ? "text-red-600" : undefined}
        />
        <SummaryCard label="Avg Wait Time" value={`${summary.avgWait} min`} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search hospital or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QueueStatus | "all")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-red-600 ml-auto">
            {error} — retrying…
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <Th label="Hospital" active={sortKey === "hospitalName"} dir={sortDir} onClick={() => toggleSort("hospitalName")} />
              <Th label="Department" active={sortKey === "department"} dir={sortDir} onClick={() => toggleSort("department")} />
              <Th label="Queue Length" active={sortKey === "queueLength"} dir={sortDir} onClick={() => toggleSort("queueLength")} align="right" />
              <Th label="Avg Wait" active={sortKey === "avgWaitMinutes"} dir={sortDir} onClick={() => toggleSort("avgWaitMinutes")} align="right" />
              <Th label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-28" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-3 bg-gray-200 rounded w-10 ml-auto" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-3 bg-gray-200 rounded w-12 ml-auto" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                </tr>
              ))}

            {!loading && filteredSorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No queues match your filters.
                </td>
              </tr>
            )}

            {!loading &&
              filteredSorted.map((row) => {
                const meta = STATUS_META[row.status];
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.hospitalName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.department}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900">{row.queueLength}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">{row.avgWaitMinutes} min</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${meta.text}`}>
                        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent ?? "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 font-medium text-gray-500 cursor-pointer select-none text-${align}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <span className="text-gray-400">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );
}
