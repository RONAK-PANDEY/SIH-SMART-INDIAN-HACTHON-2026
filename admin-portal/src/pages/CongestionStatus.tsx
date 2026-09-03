import type { CongestionStatus } from "../types/hospital";

// Colors follow business-rules.md Section 4.2:
//   GREEN 0-74, YELLOW 75-99, RED 100+
const STATUS_STYLES: Record<
  CongestionStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  GREEN: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    label: "Normal",
  },
  YELLOW: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    label: "Approaching capacity",
  },
  RED: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    label: "Overloaded",
  },
};

export function StatusDot({ status }: { status: CongestionStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`}
      title={s.label}
      aria-label={s.label}
    />
  );
}

export function StatusBadge({
  status,
  score,
}: {
  status: CongestionStatus;
  score?: number;
}) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${s.bg} ${s.text}`}
    >
      <StatusDot status={status} />
      {s.label}
      {typeof score === "number" && (
        <span className="text-xs opacity-70">({Math.round(score)})</span>
      )}
    </span>
  );
}
