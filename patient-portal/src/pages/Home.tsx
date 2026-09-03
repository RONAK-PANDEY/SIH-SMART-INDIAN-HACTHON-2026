import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Ticket,
  Activity,
  MapPin,
  Siren,
  Search,
  Users,
  Clock,
  Stethoscope,
  ListChecks,
} from "lucide-react";

/**
 * useStats
 * ---------------------------------------------------------------------------
 * Stub hook for the landing-page stats strip. Returns placeholder numbers
 * with a fake network delay so the UI already handles loading state.
 *
 * TODO(api): replace the setTimeout block with a real fetch, e.g.
 *   const res = await fetch("/api/v1/stats/summary");
 *   const data = await res.json();
 * Keep the return shape identical so no consuming component needs to change.
 * ---------------------------------------------------------------------------
 */
interface StatsData {
  patientsServed: number;
  activeQueues: number;
  averageWaitMinutes: number;
  doctorsAvailable: number;
}

function useStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        // Placeholder data — swap for a real API call (see TODO above).
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (cancelled) return;
        setData({
          patientsServed: 128430,
          activeQueues: 42,
          averageWaitMinutes: 14,
          doctorsAvailable: 96,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
}

function ActionButton({ label, icon, href, variant = "secondary" }: ActionButtonProps) {
  const base =
    "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold sm:text-base transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]";

  const variants: Record<string, string> = {
    primary:
      "bg-teal-600 text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700 focus-visible:ring-teal-500",
    secondary:
      "bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-teal-300 hover:text-teal-700 focus-visible:ring-teal-500",
    outline:
      "bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400",
    danger:
      "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-500",
  };

  return (
    <a href={href} className={`${base} ${variants[variant]}`}>
      {icon}
      <span>{label}</span>
    </a>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ label, value, icon, isLoading }: StatCardProps) {
  return (
    <div className="flex flex-1 min-w-[140px] items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-5 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              SmartCare
            </span>
          </div>
          <a
            href="/emergency"
            className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 sm:text-sm"
          >
            <Siren className="h-3.5 w-3.5" />
            Emergency
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            Digital-first patient care
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Less Waiting. Faster Care.{" "}
            <span className="text-teal-600">Smarter Hospitals.</span>
          </h1>
          <p className="mt-4 text-sm text-slate-600 sm:text-base">
            Book appointments, grab a digital token, and track your place in
            line — all from your phone, before you even leave home.
          </p>
        </div>

        {/* Primary actions */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          <ActionButton
            label="Book Appointment"
            icon={<CalendarCheck className="h-4 w-4" />}
            href="/appointments/book"
            variant="primary"
          />
          <ActionButton
            label="Get Digital Token"
            icon={<Ticket className="h-4 w-4" />}
            href="/token/new"
            variant="secondary"
          />
          <ActionButton
            label="Track Queue"
            icon={<ListChecks className="h-4 w-4" />}
            href="/queue/track"
            variant="secondary"
          />
          <ActionButton
            label="Find Hospital"
            icon={<MapPin className="h-4 w-4" />}
            href="/hospitals"
            variant="secondary"
          />
          <ActionButton
            label="Check Appointment"
            icon={<Search className="h-4 w-4" />}
            href="/appointments/status"
            variant="outline"
          />
          <ActionButton
            label="Emergency"
            icon={<Siren className="h-4 w-4" />}
            href="/emergency"
            variant="danger"
          />
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <StatCard
            label="Patients Served"
            value={stats ? formatNumber(stats.patientsServed) : "—"}
            icon={<Users className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <StatCard
            label="Active Queues"
            value={stats ? formatNumber(stats.activeQueues) : "—"}
            icon={<ListChecks className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <StatCard
            label="Average Wait"
            value={stats ? `${stats.averageWaitMinutes} min` : "—"}
            icon={<Clock className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <StatCard
            label="Doctors Available"
            value={stats ? formatNumber(stats.doctorsAvailable) : "—"}
            icon={<Stethoscope className="h-5 w-5" />}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
}
