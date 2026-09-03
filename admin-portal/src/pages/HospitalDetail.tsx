import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchHospitalDetail } from "../api/hospitals";
import { StatusBadge, StatusDot } from "../components/CongestionStatus";
import type { HospitalDetail as HospitalDetailType } from "../types/hospital";

export default function HospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<HospitalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchHospitalDetail(id, controller.signal)
      .then(setHospital)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-slate-500">
        Loading hospital…
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Hospital not found"}
        </div>
        <Link
          to="/hospitals"
          className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to hospitals
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to="/hospitals"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to hospitals
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {hospital.name}
          </h1>
          <p className="text-sm text-slate-500">
            {hospital.district}, {hospital.state}
            {hospital.address ? ` · ${hospital.address}` : ""}
          </p>
        </div>
        <StatusBadge
          status={hospital.congestion_status}
          score={hospital.congestion_score}
        />
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="OPD capacity" value={`${hospital.opd_capacity_pct}%`} />
        <Metric
          label="Emergency capacity"
          value={`${hospital.emergency_capacity_pct}%`}
        />
        <Metric
          label="Avg. wait"
          value={`${hospital.avg_wait_minutes} min`}
        />
        <Metric
          label="Doctors available"
          value={`${hospital.doctors_available}/${hospital.doctors_on_shift}`}
        />
      </section>

      <section className="mb-8">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Patients seen today</div>
          <div className="text-3xl font-semibold text-slate-900">
            {hospital.patients_today}
          </div>
        </div>
      </section>

      {hospital.departments.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-slate-500">
            Department congestion
          </h2>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {hospital.departments.map((dept) => (
              <li
                key={dept.department}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={dept.congestion_status} />
                  <span className="font-medium text-slate-900">
                    {dept.department}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  score {Math.round(dept.congestion_score)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Last updated {new Date(hospital.last_updated).toLocaleString()}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
