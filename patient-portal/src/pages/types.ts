// Types mirror docs/api-contracts.md exactly. Do not add fields that
// aren't in the documented response shapes (e.g. referral has no
// "priority" field as of this writing).

export type ReferralStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Referral {
  id: string;
  patient_id: string;
  visit_id: string | null;
  referring_doctor_id: string;
  referring_hospital_id: string;
  referred_to_doctor_id: string | null;
  referred_to_hospital_id: string | null;
  referred_to_department_id: string | null;
  reason: string;
  status: ReferralStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  code: string;
  description?: string | null;
  floor?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string | null;
  medical_record_number?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  blood_group?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  allergies?: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  department_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
