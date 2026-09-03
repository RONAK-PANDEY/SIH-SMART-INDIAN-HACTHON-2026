import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHospitals } from "../api/hospitals";
import { StatusDot } from "../components/CongestionStatus";
import type {
  CongestionStatus,
  HospitalSummary,
} from "../types/hospital";

type DrillLevel = "state" | "district" | "hospitals";

export default function HospitalList() {
  const [hospitals, setHospitals] = useState<HospitalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<CongestionStatus | "ALL">(
    "ALL"
  );
  const [search, setSearch] = useState("");

  // Fetch the full unfiltered set once to build the State -> District tree
  // client-side, then re-fetch filtered results once a hospital-level list
  // is being shown. For very large datasets, replace this with dedicated
  // /states and /districts endpoints.
  const [allHospitals, setAllHospitals] = useState<HospitalSummary[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHospitals({ page_size: 2000 }, controller.signal)
      .then((res) => setAllHospitals(res.results))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, []);

  const states = useMemo(() => {
    return Array.from(new Set(allHospitals.map((h) => h.state))).sort();
  }, [allHospitals]);

  const districts = useMemo(() => {
    if (!selectedState) return [];
    return Array.from(
      new Set(
        allHospitals
          .filter((h) => h.state === selectedState)
          .map((h) => h.district)
      )
    ).sort();
  }, [allHospitals, selectedState]);

  const level: DrillLevel = !selectedState
    ? "state"
    : !selectedDistrict
    ? "district"
    : "hospitals";

  useEffect(() => {
    if (level !== "hospitals" || !selectedState || !selectedDistrict) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchHospitals(
      {
        state: selectedState,
        district: selectedDistrict,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search || undefined,
        page_size: 200,
      },
      controller.signal
    )
      .then((res) => setHospitals(res.results))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [level, selectedState, selectedDistrict, statusFilter, search]);

  const districtCongestionCounts = (district: string) => {
    const items = allHospitals.filter(
      (h) => h.state === selectedState && h.district === district
    );
    return {
      total: items.length,
      red: items.filter((h) => h.congestion_status === "RED").length,
      yellow: items.filter((h) => h.congestion_status === "YELLOW").length,
    };
  };

  const stateCongestionCounts = (state: string) => {
    const items = allHospitals.filter((h) => h.state === state);
    return {
      total: items.length,
      red: items.filter((h) => h.congestion_status === "RED").length,
      yellow: items.filter((h) => h.congestion_status === "YELLOW").length,
    };
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Hospitals</h1>
        <Breadcrumbs
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          onReset={() => {
            setSelectedState(null);
            setSelectedDistrict(null);
          }}
          onSelectState={() => setSelectedDistrict(null)}
        />
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {level === "state" && (
        <ListPanel
          title="Select a state"
          rows={states.map((state) => {
            const counts = stateCongestionCounts(state);
            return {
              key: state,
              label: state,
              meta: `${counts.total} facilities`,
              alert:
                counts.red > 0
                  ? `${counts.red} at capacity`
                  : counts.yellow > 0
                  ? `${counts.yellow} approaching capacity`
                  : undefined,
              onClick: () => setSelectedState(state),
            };
          })}
        />
      )}

      {level === "district" && selectedState && (
        <ListPanel
          title={`Districts in ${selectedState}`}
          rows={districts.map((district) => {
            const counts = districtCongestionCounts(district);
            return {
              key: district,
              label: district,
              meta: `${counts.total} facilities`,
              alert:
                counts.red > 0
                  ? `${counts.red} at capacity`
                  : counts.yellow > 0
                  ? `${counts.yellow} approaching capacity`
                  : undefined,
              onClick: () => setSelectedDistrict(district),
            };
          })}
        />
      )}

      {level === "hospitals" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search hospital name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <div className="flex gap-1">
              {(["ALL", "GREEN", "YELLOW", "RED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusFilter === s
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading hospitals…
            </div>
          ) : hospitals.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No hospitals match this filter.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {hospitals.map((h) => (
                <li key={h.id}>
                  <Link
                    to={`/hospitals/${h.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={h.congestion_status} />
                      <div>
                        <div className="font-medium text-slate-900">
                          {h.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {h.district}, {h.state}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div>
                        {h.active_patients_in_queue}/{h.staffed_capacity} in
                        queue
                      </div>
                      <div className="text-xs">
                        score {Math.round(h.congestion_score)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Breadcrumbs({
  selectedState,
  selectedDistrict,
  onReset,
  onSelectState,
}: {
  selectedState: string | null;
  selectedDistrict: string | null;
  onReset: () => void;
  onSelectState: () => void;
}) {
  return (
    <nav className="mt-1 flex items-center gap-1 text-sm text-slate-500">
      <button onClick={onReset} className="hover:text-slate-900">
        All states
      </button>
      {selectedState && (
        <>
          <span>/</span>
          <button onClick={onSelectState} className="hover:text-slate-900">
            {selectedState}
          </button>
        </>
      )}
      {selectedDistrict && (
        <>
          <span>/</span>
          <span className="text-slate-900">{selectedDistrict}</span>
        </>
      )}
    </nav>
  );
}

function ListPanel({
  title,
  rows,
}: {
  title: string;
  rows: {
    key: string;
    label: string;
    meta: string;
    alert?: string;
    onClick: () => void;
  }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-slate-500">{title}</h2>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              onClick={row.onClick}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            >
              <div>
                <div className="font-medium text-slate-900">{row.label}</div>
                <div className="text-xs text-slate-500">{row.meta}</div>
              </div>
              {row.alert && (
                <span className="text-xs font-medium text-red-600">
                  {row.alert}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
