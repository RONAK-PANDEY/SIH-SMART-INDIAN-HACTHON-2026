import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  tone?: "default" | "alert";
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  tone = "default",
  loading,
}: StatCardProps) {
  return (
    <div className="stat-card" data-tone={tone}>
      <div className="stat-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        {loading ? (
          <div className="stat-card__skeleton" />
        ) : (
          <p className="stat-card__value">
            {value}
            {unit && <span className="stat-card__unit">{unit}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
