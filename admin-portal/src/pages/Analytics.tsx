import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiGet, ApiError } from "../api/client";
import type {
  Department,
  Doctor,
  HospitalStatisticsRow,
  HospitalSummary,
  PeakHourBucket,
  Paginated,
} from "../types/analytics";

// Colors kept to a single restrained palette rather than default Recharts rainbow.
const ACCENT = "#2563EB"; // blue-600
const ACCENT_SOFT = "#93C5FD"; // blue-300
const WARN = "#F59E0B"; // amber-500
const OK = "#10B981"; // emerald-500
const NEUTRAL = "#94A3B8"; // slate-400
const PIE_COLORS = [OK, NEUTRAL];

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

interface DeptWait {
  name: string;
  avg_wait_time_minutes: number;
}

export default function Analytics() {
  const { hospitalId } = useParams<{ hospitalId: string }>();

  const [dateFrom, setDateFrom] = useState(todayISO(-6));
  const [dateTo, setDateTo] = useState(todayISO());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [daily, setDaily] = useState<HospitalStatisticsRow[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourBucket[]>([]);
  const [deptWaits, setDeptWaits] = useState<DeptWait[]>([]);
  const [doctorAvailability, setDoctorAvailability] = useState<{ name: string; value: number }[]>([]);
  const [summary, setSummary] = useState<HospitalSummary | null>(null);

  useEffect(() => {
    if (!hospitalId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [dailyRes, peakRes, summaryRes, deptsRes, doctorsRes] = await Promise.all([
          apiGet<{ data: HospitalStatisticsRow[] }>(`/analytics/hospitals/${hospitalId}/daily`, {
            date_from: dateFrom,
            date_to: dateTo,
          }),
          apiGet<{ data: PeakHourBucket[] }>(`/analytics/hospitals/${hospitalId}/peak-hours`, {
            date_from: dateFrom,
            date_to: dateTo,
          }),
          apiGet<HospitalSummary>(`/analytics/hospitals/${hospitalId}/summary`, {
            date_from: dateFrom,
            date_to: dateTo,
          }),
          apiGet<Paginated<Department>>(`/hospitals/${hospitalId}/departments`, {
            is_active: true,
            page_size: 100,
          }),
          apiGet<Paginated<Doctor>>(`/doctors`, {
            hospital_id: hospitalId,
            page_size: 100,
          }),
        ]);

        if (cancelled) return;

        setDaily(dailyRes.data);
        setPeakHours(peakRes.data);
        setSummary(summaryRes);

        // Department-wise avg wait: one summary call per active department.
        const deptResults = await Promise.all(
          deptsRes.data.map(async (dept) => {
            try {
              const s = await apiGet<HospitalSummary>(`/analytics/departments/${dept.id}/summary`, {
                date_from: dateFrom,
                date_to: dateTo,
              });
              return { name: dept.name, avg_wait_time_minutes: s.avg_wait_time_minutes ?? 0 };
            } catch {
              return { name: dept.name, avg_wait_time_minutes: 0 };
            }
          })
        );
        if (cancelled) return;
        setDeptWaits(deptResults);

        const activeCount = doctorsRes.data.filter((d) => d.is_active).length;
        const inactiveCount = doctorsRes.data.length - activeCount;
        setDoctorAvailability([
          { name: "Available", value: activeCount },
          { name: "Unavailable", value: inactiveCount },
        ]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [hospitalId, dateFrom, dateTo]);

  const completionRateByDay = useMemo(
    () =>
      daily.map((row) => ({
        date: row.stat_date,
        completion_rate:
          row.total_tokens_issued > 0
            ? Math.round((row.total_tokens_completed / row.total_tokens_issued) * 1000) / 10
            : 0,
      })),
    [daily]
  );

  const overallCompletionRate = useMemo(() => {
    if (!summary || summary.total_tokens_issued === 0) return 0;
    return Math.round((summary.total_tokens_completed / summary.total_tokens_issued) * 1000) / 10;
  }, [summary]);

  const topPeakHours = useMemo(
    () =>
      [...peakHours]
        .sort((a, b) => b.avg_volume - a.avg_volume)
        .slice(0, 6)
        .sort((a, b) => a.hour - b.hour)
        .map((p) => ({ ...p, label: `${p.hour.toString().padStart(2, "0")}:00` })),
    [peakHours]
  );

  const hourlyLine = useMemo(
    () => peakHours.map((p) => ({ ...p, label: `${p.hour.toString().padStart(2, "0")}:00` })),
    [peakHours]
  );

  if (!hospitalId) {
    return <div className="p-6 text-slate-600">No hospital selected.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Patient flow, waits, and staffing for the selected date range.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">
            From
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            To
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={todayISO()}
              onChange={(e) => setDateTo(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading analytics…</div>
      ) : (
        <>
          {/* Summary strip */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Patients" value={summary.total_patients} />
              <StatCard label="Tokens issued" value={summary.total_tokens_issued} />
              <StatCard label="Avg wait (min)" value={summary.avg_wait_time_minutes} />
              <StatCard label="Completion rate" value={`${overallCompletionRate}%`} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients / hour line */}
            <ChartCard title="Patients per hour">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={hourlyLine} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avg_volume"
                    name="Avg patients"
                    stroke={ACCENT}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Department-wise avg wait bar */}
            <ChartCard title="Average wait by department">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptWaits} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="m" />
                  <Tooltip formatter={(v: number) => [`${v} min`, "Avg wait"]} />
                  <Bar dataKey="avg_wait_time_minutes" name="Avg wait (min)" fill={ACCENT_SOFT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Hospital performance % (token completion rate over time) */}
            <ChartCard title="Token completion rate">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={completionRateByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Completed"]} />
                  <Bar dataKey="completion_rate" name="Completion rate (%)" fill={OK} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Doctor availability pie */}
            <ChartCard title="Doctor availability">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={doctorAvailability}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {doctorAvailability.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Peak hours bar */}
            <ChartCard title="Peak hours" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topPeakHours} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="avg_volume" name="Avg volume" fill={WARN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
      <h2 className="text-sm font-medium text-slate-700 mb-2">{title}</h2>
      {children}
    </div>
  );
}
