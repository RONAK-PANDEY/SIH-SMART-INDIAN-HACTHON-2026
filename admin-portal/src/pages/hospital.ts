// Shared types for the hospital list/detail views.
// Congestion status thresholds mirror docs/business-rules.md, Section 4.2:
//   GREEN  0–74   (score < congestion_green_max + 1, default 74)
//   YELLOW 75–99  (score <= congestion_yellow_max, default 99)
//   RED    100+   (score > congestion_yellow_max)
// Thresholds are configurable per facility, so the API returns both the
// raw score and the pre-computed status; the frontend never re-derives
// GREEN/YELLOW/RED from a hardcoded 74/99 split — it trusts the API's
// `congestion_status`, and only falls back to the default split if a
// facility genuinely has no status (defensive fallback only).

export type CongestionStatus = "GREEN" | "YELLOW" | "RED";

export interface HospitalSummary {
  id: string;
  name: string;
  state: string;
  district: string;
  congestion_status: CongestionStatus;
  congestion_score: number;
  active_patients_in_queue: number;
  staffed_capacity: number;
}

export interface HospitalListResponse {
  results: HospitalSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface DepartmentCongestion {
  department: string;
  congestion_status: CongestionStatus;
  congestion_score: number;
}

export interface HospitalDetail {
  id: string;
  name: string;
  state: string;
  district: string;
  address?: string;
  congestion_status: CongestionStatus;
  congestion_score: number;
  departments: DepartmentCongestion[];
  opd_capacity_pct: number; // 0-100
  emergency_capacity_pct: number; // 0-100
  avg_wait_minutes: number;
  doctors_available: number;
  doctors_on_shift: number;
  patients_today: number;
  last_updated: string; // ISO timestamp
}

export interface HospitalListFilters {
  state?: string;
  district?: string;
  status?: CongestionStatus;
  search?: string;
  page?: number;
  page_size?: number;
}
