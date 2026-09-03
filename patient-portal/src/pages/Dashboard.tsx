import { useEffect, useState } from "react";
import {
  Building2,
  Layers,
  UserPlus,
  UserCheck,
  ListOrdered,
  Clock,
  Siren,
  Stethoscope,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { fetchAnalyticsSummary, type AnalyticsSummary } from "@/lib/analytics";
import "./Dashboard.css";

type SummaryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AnalyticsSummary };

const numberFormatter = new Intl.NumberFormat("en-US");

function formatCount(n: number | undefined): string {
  return n === undefined ? "—" : numberFormatter.format(n);
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryState>({ status: "loading" });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSummary((prev) =>
        prev.status === "ready" ? prev : { status: "loading" }
      );
      try {
        const data = await fetchAnalyticsSummary();
        if (cancelled) return;
        setSummary({ status: "ready", data });
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        setSummary({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't reach the analytics service.",
        });
      }
    }

    load();
    // Command-centre view — keep the ledger current without a manual refresh.
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const data = summary.status === "ready" ? summary.data : undefined;
  const isLoading = summary.status === "loading";

  return (
    <div className="dashboard">
      <header className="dashboard__masthead">
        <div>
          <h1 className="dashboard__title">National Health Command Centre</h1>
          <p className="dashboard__subtitle">
            Live standing across every registered hospital
          </p>
        </div>
        <div className="dashboard__updated">
          Last refreshed
          <strong>
            {lastUpdated
              ? lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </strong>
        </div>
      </header>

      {summary.status === "error" && (
        <div className="dashboard__error" role="alert">
          Couldn't load the summary ledger: {summary.message}
        </div>
      )}

      <section className="stat-ledger" aria-label="System-wide statistics">
        <StatCard
          label="Hospitals"
          icon={<Building2 size={18} strokeWidth={1.6} />}
          value={formatCount(data?.hospitals_count)}
          loading={isLoading}
        />
        <StatCard
          label="Active Departments"
          icon={<Layers size={18} strokeWidth={1.6} />}
          value={formatCount(data?.active_departments_count)}
          loading={isLoading}
        />
        <StatCard
          label="Patients Registered"
          icon={<UserPlus size={18} strokeWidth={1.6} />}
          value={formatCount(data?.patients_registered)}
          loading={isLoading}
        />
        <StatCard
          label="Patients Served"
          icon={<UserCheck size={18} strokeWidth={1.6} />}
          value={formatCount(data?.patients_served)}
          loading={isLoading}
        />
        <StatCard
          label="Active Queues"
          icon={<ListOrdered size={18} strokeWidth={1.6} />}
          value={formatCount(data?.active_queues)}
          loading={isLoading}
        />
        <StatCard
          label="Avg Waiting Time"
          icon={<Clock size={18} strokeWidth={1.6} />}
          value={
            data ? String(Math.round(data.avg_waiting_time_minutes)) : "—"
          }
          unit="min"
          loading={isLoading}
        />
        <StatCard
          label="Emergency Cases"
          icon={<Siren size={18} strokeWidth={1.6} />}
          value={formatCount(data?.emergency_cases)}
          tone="alert"
          loading={isLoading}
        />
        <StatCard
          label="Doctors Available"
          icon={<Stethoscope size={18} strokeWidth={1.6} />}
          value={formatCount(data?.doctors_available)}
          loading={isLoading}
        />
      </section>

      <section className="panel-row">
        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Hospital Load Heatmap</h2>
            <span className="panel__hint">
              GET /api/v1/analytics/queues/live
            </span>
          </div>
          <div className="panel__body">
            {/*
              TODO(Alok): wire to fetchLiveQueues() from src/lib/analytics.ts,
              grouped by hospital_id, colour-scaled on waiting_count.
              Placeholder reserves the panel's shape/height so this slots in
              without a layout shift.
            */}
            <div className="panel__placeholder">
              Hospital heatmap component goes here
              <br />
              (waiting_count by hospital, from analytics/queues/live)
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Peak Hours</h2>
            <span className="panel__hint">
              GET /api/v1/analytics/hospitals/{"{hospital_id}"}/peak-hours
            </span>
          </div>
          <div className="panel__body">
            {/*
              TODO(Alok): wire to fetchPeakHours() from src/lib/analytics.ts
              and render with Recharts (BarChart, hour 0-23 on the x-axis,
              avg_volume on the y-axis). Placeholder reserves the panel's
              shape/height so the chart slots in without a layout shift.
            */}
            <div className="panel__placeholder">
              Peak-hours bar chart goes here
              <br />
              (Recharts BarChart, hour vs avg_volume)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
