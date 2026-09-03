import { apiClient } from "./api-client";

// Response shape for GET /api/v1/analytics/summary
// NOTE: this cross-hospital rollup endpoint is not yet listed in
// docs/api-reference.md (only per-hospital/department/doctor summaries
// exist there today). It's assumed here as the admin command-centre
// aggregate; add it to the API doc in the same PR that implements it
// server-side, per the doc's own conventions.
export interface AnalyticsSummary {
  hospitals_count: number;
  active_departments_count: number;
  patients_registered: number;
  patients_served: number;
  active_queues: number;
  avg_waiting_time_minutes: number;
  emergency_cases: number;
  doctors_available: number;
}

export interface PeakHourPoint {
  hour: number; // 0-23
  avg_volume: number;
}

export interface HospitalLoadPoint {
  hospital_id: string;
  hospital_name: string;
  waiting_count: number;
  avg_wait_time_minutes: number;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get<AnalyticsSummary>(
    "/api/v1/analytics/summary"
  );
  return data;
}

// Fills the peak-hours panel. Falls back to hospital_id-less scope so the
// admin sees a system-wide view; pass hospital_id to scope it.
export async function fetchPeakHours(params: {
  hospital_id?: string;
  date_from: string;
  date_to: string;
  department_id?: string;
}): Promise<PeakHourPoint[]> {
  const { hospital_id, ...rest } = params;
  const { data } = await apiClient.get<{ data: PeakHourPoint[] }>(
    `/api/v1/analytics/hospitals/${hospital_id}/peak-hours`,
    { params: rest }
  );
  return data.data;
}

export async function fetchLiveQueues(params: {
  hospital_id?: string;
  department_id?: string;
}) {
  const { data } = await apiClient.get<{
    data: {
      queue_id: string;
      department_id: string;
      doctor_id: string;
      status: "open" | "paused" | "closed";
      current_token_number: number;
      last_token_number: number;
      waiting_count: number;
    }[];
  }>("/api/v1/analytics/queues/live", { params });
  return data.data;
}
