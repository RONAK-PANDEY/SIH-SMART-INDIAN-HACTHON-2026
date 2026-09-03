import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Cascading picker: Hospital -> District -> Department -> Doctor -> Date -> Time
 *
 * API shapes (see docs/api-reference.md):
 *   GET /api/v1/hospitals            -> { data: Hospital[], pagination }
 *   GET /api/v1/hospitals/{id}/departments -> { data: Department[], pagination }
 *   GET /api/v1/doctors?hospital_id&department_id -> { data: Doctor[], pagination }
 *   GET /api/v1/appointments/availability?doctor_id&date
 *       -> { doctor_id, date, slots: [{ start_time, end_time, available }] }
 *
 * NOTE / ASSUMPTION: the hospital object has no explicit "district" field —
 * only city/state/country. "District" here is derived from `hospital.city`.
 * Since each hospital has a single city, picking a hospital effectively
 * fixes the district too; the District dropdown is kept as its own step
 * (auto-selecting the hospital's city) to match the requested UX flow, and
 * to leave room for a real `district` field later without changing the
 * component's shape.
 */

const API_BASE = "/api/v1";

interface Hospital {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

interface Department {
  id: string;
  hospital_id: string;
  name: string;
  code: string;
  is_active?: boolean;
}

interface Doctor {
  id: string;
  hospital_id: string;
  department_id: string;
  full_name: string;
  specialization?: string;
  is_active?: boolean;
  consultation_duration_minutes?: number;
}

interface Slot {
  start_time: string;
  end_time: string;
  available: boolean;
}

interface Paginated<T> {
  data: T[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      /* ignore parse errors, fall back to default message */
    }
    throw new Error(message);
  }
  return res.json();
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Next 14 days, as YYYY-MM-DD, for the Date step.
function upcomingDates(count = 14): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push(toDateInputValue(d));
  }
  return out;
}

export default function HospitalSelect() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [hospitalId, setHospitalId] = useState("");
  const [district, setDistrict] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState<
    "hospitals" | "departments" | "doctors" | "slots" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const selectedHospital = useMemo(
    () => hospitals.find((h) => h.id === hospitalId) ?? null,
    [hospitals, hospitalId]
  );
  const selectedDepartment = useMemo(
    () => departments.find((d) => d.id === departmentId) ?? null,
    [departments, departmentId]
  );
  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === doctorId) ?? null,
    [doctors, doctorId]
  );

  const dateOptions = useMemo(() => upcomingDates(), []);

  // Step 1: load hospitals once.
  useEffect(() => {
    let cancelled = false;
    setLoading("hospitals");
    setError(null);
    fetchJson<Paginated<Hospital>>(`${API_BASE}/hospitals?is_active=true&page_size=100`)
      .then((res) => {
        if (!cancelled) setHospitals(res.data);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(null));
    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: district auto-derives from the chosen hospital's city.
  useEffect(() => {
    setDistrict(selectedHospital?.city ?? "");
    setDepartmentId("");
    setDoctorId("");
    setDate("");
    setStartTime("");
    setDepartments([]);
    setDoctors([]);
    setSlots([]);

    if (!hospitalId) return;

    let cancelled = false;
    setLoading("departments");
    setError(null);
    fetchJson<Paginated<Department>>(
      `${API_BASE}/hospitals/${hospitalId}/departments?is_active=true&page_size=100`
    )
      .then((res) => {
        if (!cancelled) setDepartments(res.data);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(null));
    return () => {
      cancelled = true;
    };
  }, [hospitalId, selectedHospital]);

  // Step 3: doctors filtered by hospital + department.
  useEffect(() => {
    setDoctorId("");
    setDate("");
    setStartTime("");
    setDoctors([]);
    setSlots([]);

    if (!hospitalId || !departmentId) return;

    let cancelled = false;
    setLoading("doctors");
    setError(null);
    const params = new URLSearchParams({
      hospital_id: hospitalId,
      department_id: departmentId,
      is_active: "true",
      page_size: "100",
    });
    fetchJson<Paginated<Doctor>>(`${API_BASE}/doctors?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setDoctors(res.data);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(null));
    return () => {
      cancelled = true;
    };
  }, [hospitalId, departmentId]);

  // Step 5: available time slots, once doctor + date are chosen.
  useEffect(() => {
    setStartTime("");
    setSlots([]);

    if (!doctorId || !date) return;

    let cancelled = false;
    setLoading("slots");
    setError(null);
    const params = new URLSearchParams({ doctor_id: doctorId, date });
    fetchJson<{ doctor_id: string; date: string; slots: Slot[] }>(
      `${API_BASE}/appointments/availability?${params.toString()}`
    )
      .then((res) => {
        if (!cancelled) setSlots(res.slots);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(null));
    return () => {
      cancelled = true;
    };
  }, [doctorId, date]);

  const canSubmit = Boolean(hospitalId && departmentId && doctorId && date && startTime);

  function handleContinue() {
    if (!canSubmit || !selectedHospital || !selectedDepartment || !selectedDoctor) return;
    navigate("/book-appointment", {
      state: {
        hospitalId,
        hospitalName: selectedHospital.name,
        district,
        departmentId,
        departmentName: selectedDepartment.name,
        doctorId,
        doctorName: selectedDoctor.full_name,
        date,
        startTime,
      },
    });
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Book an appointment</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Hospital */}
        <Field label="Hospital" busy={loading === "hospitals"}>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
          >
            <option value="">Select a hospital…</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
                {h.city ? ` — ${h.city}` : ""}
              </option>
            ))}
          </select>
        </Field>

        {/* District (derived) */}
        <Field label="District">
          <input
            className="w-full rounded-md border bg-gray-50 px-3 py-2 text-gray-600"
            value={district}
            placeholder="Auto-filled from hospital"
            disabled
            readOnly
          />
        </Field>

        {/* Department */}
        <Field label="Department" busy={loading === "departments"} disabled={!hospitalId}>
          <select
            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={!hospitalId}
          >
            <option value="">
              {hospitalId ? "Select a department…" : "Select a hospital first"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Doctor */}
        <Field label="Doctor" busy={loading === "doctors"} disabled={!departmentId}>
          <select
            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={!departmentId}
          >
            <option value="">
              {departmentId ? "Select a doctor…" : "Select a department first"}
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
                {d.specialization ? ` — ${d.specialization}` : ""}
              </option>
            ))}
          </select>
        </Field>

        {/* Date */}
        <Field label="Date" disabled={!doctorId}>
          <select
            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!doctorId}
          >
            <option value="">{doctorId ? "Select a date…" : "Select a doctor first"}</option>
            {dateOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        {/* Time */}
        <Field label="Time" busy={loading === "slots"} disabled={!date}>
          <select
            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={!date}
          >
            <option value="">{date ? "Select a time…" : "Select a date first"}</option>
            {slots.map((s) => (
              <option key={s.start_time} value={s.start_time} disabled={!s.available}>
                {s.start_time}
                {!s.available ? " (booked)" : ""}
              </option>
            ))}
          </select>
          {date && !loading && slots.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">No slots returned for this date.</p>
          )}
        </Field>
      </div>

      <button
        type="button"
        className="mt-8 w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:bg-gray-300"
        disabled={!canSubmit}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
}

function Field({
  label,
  busy,
  disabled,
  children,
}: {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={disabled ? "opacity-60" : undefined}>
      <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
        {label}
        {busy && <span className="text-xs font-normal text-gray-400">Loading…</span>}
      </label>
      {children}
    </div>
  );
}
