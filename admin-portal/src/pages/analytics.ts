export interface Hospital {
  id: string;
  name: string;
  code: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Doctor {
  id: string;
  hospital_id: string;
  department_id: string;
  full_name: string;
  specialization?: string;
  is_active: boolean;
}

export interface HospitalStatisticsRow {
  hospital_id: string;
  department_id?: string | null;
  stat_date: string;
  total_patients: number;
  total_appointments: number;
  total_walk_ins: number;
  total_tokens_issued: number;
  total_tokens_completed: number;
  total_tokens_cancelled: number;
  avg_wait_time_minutes: number;
  avg_consultation_time_minutes: number;
}

export interface HospitalSummary {
  hospital_id: string;
  department_id?: string | null;
  date_from: string;
  date_to: string;
  total_patients: number;
  total_appointments: number;
  total_walk_ins: number;
  total_tokens_issued: number;
  total_tokens_completed: number;
  total_tokens_cancelled: number;
  avg_wait_time_minutes: number;
  avg_consultation_time_minutes: number;
}

export interface DepartmentSummary extends Omit<HospitalSummary, "hospital_id"> {
  department_id: string;
}

export interface PeakHourBucket {
  hour: number; // 0-23
  avg_volume: number;
}

export interface LiveQueueSnapshot {
  queue_id: string;
  department_id: string;
  doctor_id: string | null;
  status: "open" | "paused" | "closed";
  current_token_number: number;
  last_token_number: number;
  waiting_count: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
