import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, ApiError } from "../api/client";
import type { Hospital, LiveQueueSnapshot, Paginated } from "../types/analytics";

interface HospitalCongestion {
  hospital: Hospital;
  waitingCount: number;
  openQueues: number;
}

// Congestion buckets: quiet -> busy -> critical.
function congestionColor(score: number, max: number): string {
  if (max <= 0) return "#E2E8F0"; // slate-200, no data
  const ratio = score / max;
  if (ratio === 0) return "#E2E8F0"; // slate-200
  if (ratio < 0.33) return "#BBF7D0"; // green-200
  if (ratio < 0.66) return "#FDE68A"; // amber-200
  if (ratio < 0.9) return "#FCA5A5"; // red-300
  return "#EF4444"; // red-500
}

function congestionTextColor(score: number, max: number): string {
  if (max <= 0) return "#334155";
  const ratio = score / max;
  return ratio >= 0.66 ? "#7F1D1D" : "#334155";
}

export default function Heatmap() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<HospitalCongestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const hospitalsRes = await apiGet<Paginated<Hospital>>("/hospitals", {
          is_active: true,
          page_size: 100,
        });

        const results = await Promise.all(
          hospitalsRes.data.map(async (hospital) => {
            try {
              const live = await apiGet<{ data: LiveQueueSnapshot[] }>("/analytics/queues/live", {
                hospital_id: hospital.id,
              });
              const waitingCount = live.data.reduce((sum, q) => sum + q.waiting_count, 0);
              const openQueues = live.data.filter((q) => q.status === "open").length;
              return { hospital, waitingCount, openQueues };
            } catch {
              return { hospital, waitingCount: 0, openQueues: 0 };
            }
          })
        );

        if (cancelled) return;
        setRows(results);
        setLastUpdated(new Date());
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load hospital congestion.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const maxWaiting = useMemo(() => Math.max(0, ...rows.map((r) => r.waitingCount)), [rows]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hospital congestion</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live patients waiting across active queues, by hospital.
          </p>
        </div>
        {lastUpdated && (
          <div className="text-xs text-slate-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">Loading hospitals…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-slate-500">No active hospitals found.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {rows.map(({ hospital, waitingCount, openQueues }) => (
              <button
                key={hospital.id}
                onClick={() => navigate(`/hospitals/${hospital.id}`)}
                className="text-left rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ backgroundColor: congestionColor(waitingCount, maxWaiting) }}
              >
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: congestionTextColor(waitingCount, maxWaiting) }}
                >
                  {hospital.name}
                </div>
                {hospital.city && (
                  <div className="text-xs opacity-70 mt-0.5" style={{ color: congestionTextColor(waitingCount, maxWaiting) }}>
                    {hospital.city}
                  </div>
                )}
                <div
                  className="text-2xl font-semibold mt-3"
                  style={{ color: congestionTextColor(waitingCount, maxWaiting) }}
                >
                  {waitingCount}
                </div>
                <div className="text-xs opacity-70" style={{ color: congestionTextColor(waitingCount, maxWaiting) }}>
                  waiting · {openQueues} open queue{openQueues === 1 ? "" : "s"}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Quiet</span>
            <div className="flex h-3 w-40 overflow-hidden rounded-full">
              <div className="flex-1" style={{ backgroundColor: "#E2E8F0" }} />
              <div className="flex-1" style={{ backgroundColor: "#BBF7D0" }} />
              <div className="flex-1" style={{ backgroundColor: "#FDE68A" }} />
              <div className="flex-1" style={{ backgroundColor: "#FCA5A5" }} />
              <div className="flex-1" style={{ backgroundColor: "#EF4444" }} />
            </div>
            <span>Critical</span>
          </div>
        </>
      )}
    </div>
  );
}
