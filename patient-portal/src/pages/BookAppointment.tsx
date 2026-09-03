import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// ---- Types, matching docs/api-reference.md ----------------------------

interface Slot {
  start_time: string; // "HH:MM"
  end_time: string;
  available: boolean;
}

interface AvailabilityResponse {
  doctor_id: string;
  date: string;
  slots: Slot[];
}

interface Doctor {
  id: string;
  full_name: string;
  specialization?: string;
  department_id: string;
  hospital_id: string;
  consultation_duration_minutes?: number;
}

interface Department {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  department_id: string;
  scheduled_at: string;
  status: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Token {
  id: string;
  queue_id: string;
  token_number: number;
  status: string;
  estimated_wait_minutes: number | null;
}

interface QueueSnapshot {
  current_token_number: number | null;
  last_token_number: number | null;
}

interface AppointmentCardData {
  patientName: string;
  department: string;
  doctor: string;
  date: string;
  time: string;
  tokenNumber: number | null;
  queuePosition: number | null;
  estimatedWaitMinutes: number | null;
}

// ---- API helpers ---------------------------------------------------------
// NOTE: the availability endpoint per docs/api-reference.md is
// GET /api/v1/appointments/availability?doctor_id=&date=  (not "/slots").

const API_BASE = "/api/v1";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// ---- Component ------------------------------------------------------------

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctor_id") ?? "";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [patientName, setPatientName] = useState<string>("");

  const [date, setDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState<string>("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmedCard, setConfirmedCard] = useState<AppointmentCardData | null>(null);

  // Load doctor + department + current patient, for display context.
  useEffect(() => {
    if (!doctorId) return;
    (async () => {
      try {
        const { doctor: d } = await apiGet<{ doctor: Doctor }>(`/doctors/${doctorId}`);
        setDoctor(d);
        const { department: dep } = await apiGet<{ department: Department }>(
          `/departments/${d.department_id}`
        );
        setDepartment(dep);
        const { user } = await apiGet<{ user: { full_name: string } }>(`/auth/me`);
        setPatientName(user.full_name);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load doctor details.");
      }
    })();
  }, [doctorId]);

  // Load availability whenever doctor or date changes.
  useEffect(() => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);
    apiGet<AvailabilityResponse>(
      `/appointments/availability?doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`
    )
      .then((res) => setSlots(res.slots))
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load available times."))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  async function confirmBooking() {
    if (!doctor || !department || !selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      const scheduledAt = `${date}T${selectedSlot.start_time}:00Z`;
      const { appointment } = await apiPost<{ appointment: Appointment }>("/appointments", {
        doctor_id: doctor.id,
        hospital_id: doctor.hospital_id,
        department_id: doctor.department_id,
        scheduled_at: scheduledAt,
        reason: reason || undefined,
      });

      // Best-effort: pull token + queue position if a same-day queue/token
      // already exists for this appointment (issued at check-in in most
      // deployments). Booking still succeeds without this.
      let tokenData: Token | null = null;
      let queueSnapshot: QueueSnapshot | null = null;
      try {
        const queues = await apiGet<{ data: Array<{ id: string }> }>(
          `/queues?department_id=${department.id}&doctor_id=${doctor.id}&queue_date=${date}`
        );
        const queueId = queues.data[0]?.id;
        if (queueId) {
          const tokens = await apiGet<{ data: Token[] }>(
            `/queues/${queueId}/tokens?status=active`
          );
          tokenData = tokens.data.find((t) => t.status === "waiting") ?? null;
          const snap = await apiGet<QueueSnapshot>(`/queues/${queueId}/current`);
          queueSnapshot = snap;
        }
      } catch {
        // Non-fatal: no queue/token yet for a future-dated appointment.
      }

      const queuePosition =
        tokenData && queueSnapshot?.current_token_number != null
          ? Math.max(tokenData.token_number - queueSnapshot.current_token_number, 0)
          : null;

      setConfirmedCard({
        patientName,
        department: department.name,
        doctor: doctor.full_name,
        date,
        time: formatTime12h(selectedSlot.start_time),
        tokenNumber: tokenData?.token_number ?? null,
        queuePosition,
        estimatedWaitMinutes: tokenData?.estimated_wait_minutes ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't complete the booking. Try again.");
    } finally {
      setBooking(false);
    }
  }

  if (confirmedCard) {
    return <AppointmentTicket data={confirmedCard} onDone={() => setConfirmedCard(null)} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Book an appointment</p>
        <h1 style={styles.h1}>
          {doctor ? doctor.full_name : "Choose a time"}
        </h1>
        {doctor && (
          <p style={styles.subhead}>
            {doctor.specialization ? `${doctor.specialization} · ` : ""}
            {department?.name ?? ""}
          </p>
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          style={styles.dateInput}
        />
      </div>

      <div style={styles.field}>
        <p style={styles.label}>Available times</p>
        {loadingSlots && <p style={styles.hint}>Loading times…</p>}
        {!loadingSlots && slots.length === 0 && (
          <p style={styles.hint}>No times returned for this date. Try another date.</p>
        )}
        {!loadingSlots && slots.length > 0 && (
          <div style={styles.slotGrid}>
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    ...styles.slotButton,
                    ...(isSelected ? styles.slotButtonSelected : {}),
                    ...(!slot.available ? styles.slotButtonDisabled : {}),
                  }}
                >
                  {formatTime12h(slot.start_time)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="reason">
          Reason for visit (optional)
        </label>
        <input
          id="reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Follow-up, new symptom, prescription renewal…"
          style={styles.textInput}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button
        type="button"
        disabled={!selectedSlot || booking}
        onClick={confirmBooking}
        style={{
          ...styles.confirmButton,
          ...((!selectedSlot || booking) ? styles.confirmButtonDisabled : {}),
        }}
      >
        {booking ? "Booking…" : "Confirm appointment"}
      </button>
    </div>
  );
}

// ---- Digital appointment card (boarding-pass style) ------------------------

function AppointmentTicket({
  data,
  onDone,
}: {
  data: AppointmentCardData;
  onDone: () => void;
}) {
  return (
    <div style={styles.page}>
      <div style={styles.ticketWrap}>
        <div style={styles.ticketMain}>
          <div style={styles.ticketTopRow}>
            <div>
              <p style={styles.ticketEyebrow}>Boarding pass</p>
              <p style={styles.ticketDept}>{data.department}</p>
            </div>
            <div style={styles.ticketStatus}>Confirmed</div>
          </div>

          <div style={styles.ticketNameRow}>
            <p style={styles.ticketName}>{data.patientName}</p>
            <p style={styles.ticketDoctor}>seeing {data.doctor}</p>
          </div>

          <div style={styles.ticketDetailsGrid}>
            <TicketField label="Date" value={formatDisplayDate(data.date)} />
            <TicketField label="Time" value={data.time} />
            <TicketField
              label="Token"
              value={data.tokenNumber != null ? `#${data.tokenNumber}` : "At check-in"}
            />
            <TicketField
              label="Queue position"
              value={data.queuePosition != null ? String(data.queuePosition) : "—"}
            />
          </div>

          {data.estimatedWaitMinutes != null && (
            <p style={styles.ticketWait}>
              Estimated wait: about {data.estimatedWaitMinutes} min
            </p>
          )}
        </div>

        <div style={styles.ticketStubDivider}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={styles.perforationDot} />
          ))}
        </div>

        <div style={styles.ticketStub}>
          <p style={styles.stubLabel}>Token</p>
          <p style={styles.stubToken}>
            {data.tokenNumber != null ? `#${data.tokenNumber}` : "—"}
          </p>
          <p style={styles.stubLabel}>{formatDisplayDate(data.date)}</p>
          <p style={styles.stubTime}>{data.time}</p>
        </div>
      </div>

      <button type="button" onClick={onDone} style={styles.confirmButton}>
        Book another appointment
      </button>
    </div>
  );
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={styles.ticketFieldLabel}>{label}</p>
      <p style={styles.ticketFieldValue}>{value}</p>
    </div>
  );
}

// ---- Styles -----------------------------------------------------------------
// Clinical-ticket palette: deep clinical teal for confirmed status, warm
// paper base for the ticket body, and a coral accent reserved for the token
// stub — the one number a patient needs to find fast.

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "32px 20px 64px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1F2421",
  },
  header: { marginBottom: 28 },
  eyebrow: {
    fontSize: 13,
    color: "#5B6B63",
    margin: "0 0 4px",
  },
  h1: {
    fontSize: 26,
    fontWeight: 500,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  subhead: { fontSize: 14, color: "#5B6B63", margin: "6px 0 0" },
  field: { marginBottom: 24 },
  label: {
    fontSize: 13,
    color: "#5B6B63",
    display: "block",
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: "#8A968E" },
  dateInput: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    border: "1px solid #D8DED9",
    padding: "0 12px",
    fontSize: 15,
    boxSizing: "border-box",
  },
  textInput: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    border: "1px solid #D8DED9",
    padding: "0 12px",
    fontSize: 15,
    boxSizing: "border-box",
  },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
    gap: 8,
  },
  slotButton: {
    height: 40,
    borderRadius: 8,
    border: "1px solid #D8DED9",
    background: "#FFFFFF",
    fontSize: 14,
    cursor: "pointer",
    color: "#1F2421",
  },
  slotButtonSelected: {
    background: "#0F4C3A",
    borderColor: "#0F4C3A",
    color: "#FFFFFF",
  },
  slotButtonDisabled: {
    background: "#F1F3F1",
    color: "#B7C0BA",
    cursor: "not-allowed",
    borderColor: "#E5E9E6",
  },
  error: {
    fontSize: 13,
    color: "#A32D2D",
    marginBottom: 16,
  },
  confirmButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    border: "none",
    background: "#0F4C3A",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
  confirmButtonDisabled: {
    background: "#B7C0BA",
    cursor: "not-allowed",
  },

  // Ticket
  ticketWrap: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    borderRadius: 12,
    overflow: "hidden",
  },
  ticketMain: {
    flex: 1,
    background: "#FBFAF6",
    padding: "24px 24px 20px",
  },
  ticketTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  ticketEyebrow: {
    fontSize: 12,
    color: "#8A968E",
    margin: "0 0 2px",
  },
  ticketDept: {
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
    color: "#1F2421",
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: 500,
    color: "#0F4C3A",
    background: "#E1F0E8",
    padding: "4px 10px",
    borderRadius: 100,
  },
  ticketNameRow: {
    borderTop: "1px dashed #D8DED9",
    borderBottom: "1px dashed #D8DED9",
    padding: "14px 0",
    marginBottom: 18,
  },
  ticketName: { fontSize: 19, fontWeight: 500, margin: 0 },
  ticketDoctor: { fontSize: 13, color: "#5B6B63", margin: "4px 0 0" },
  ticketDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    rowGap: 16,
    columnGap: 12,
  },
  ticketFieldLabel: {
    fontSize: 11,
    color: "#8A968E",
    margin: "0 0 3px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  ticketFieldValue: { fontSize: 15, fontWeight: 500, margin: 0 },
  ticketWait: {
    fontSize: 13,
    color: "#5B6B63",
    marginTop: 18,
    marginBottom: 0,
  },
  ticketStubDivider: {
    width: 0,
    borderLeft: "1px dashed #D8DED9",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    position: "relative",
  },
  perforationDot: { display: "none" },
  ticketStub: {
    width: 120,
    background: "#0F4C3A",
    color: "#FFFFFF",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 4,
  },
  stubLabel: {
    fontSize: 10,
    color: "#B9D6C7",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  stubToken: {
    fontSize: 28,
    fontWeight: 500,
    margin: "0 0 10px",
    color: "#F5A97F",
  },
  stubTime: { fontSize: 14, fontWeight: 500, margin: "2px 0 0" },
};
