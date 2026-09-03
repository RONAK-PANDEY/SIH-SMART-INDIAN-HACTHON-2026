import { useEffect, useMemo, useState, useCallback } from "react";
import { getDoctorConsoleSocket } from "../lib/doctorConsoleSocket";

// ---------------------------------------------------------------------------
// NOTE FOR INTEGRATION:
// The exact socket event names/payloads for realtime/doctor_console have not
// been confirmed yet (pending confirmation from Rishikesh). All socket wiring
// is isolated in `src/lib/doctorConsoleSocket.ts` behind the
// `DoctorConsoleSocket` interface below — once the contract is known, only
// that file needs to change. Everywhere in this component, look for
// `// TODO(socket-contract)` markers.
// ---------------------------------------------------------------------------

interface CurrentToken {
  tokenNumber: string;
  patientName: string;
  isPriority: boolean;
}

interface QueueStats {
  todayTotal: number;
  completed: number;
  waiting: number;
  priority: number;
}

interface ConsultationForm {
  notes: string;
  prescriptionSummary: string;
  followUpDate: string;
  referral: string;
}

const emptyForm: ConsultationForm = {
  notes: "",
  prescriptionSummary: "",
  followUpDate: "",
  referral: "",
};

export default function DoctorPanel() {
  const [stats, setStats] = useState<QueueStats>({
    todayTotal: 0,
    completed: 0,
    waiting: 0,
    priority: 0,
  });
  const [currentToken, setCurrentToken] = useState<CurrentToken | null>(null);
  const [form, setForm] = useState<ConsultationForm>(emptyForm);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const doctorId = useMemo(() => getCurrentDoctorId(), []);

  const socket = useMemo(() => getDoctorConsoleSocket(), []);

  useEffect(() => {
    const unsubscribeConnect = socket.onConnectionChange(setConnected);

    // TODO(socket-contract): confirm these subscription handlers map to the
    // real event names emitted by realtime/doctor_console.
    const unsubscribeStats = socket.onStatsUpdate((next) => setStats(next));
    const unsubscribeToken = socket.onCurrentTokenUpdate((next) =>
      setCurrentToken(next)
    );
    const unsubscribeError = socket.onError((message) => setError(message));

    socket.joinDoctorRoom(doctorId);

    return () => {
      unsubscribeConnect();
      unsubscribeStats();
      unsubscribeToken();
      unsubscribeError();
      socket.leaveDoctorRoom(doctorId);
    };
  }, [socket, doctorId]);

  const handleCallNext = useCallback(async () => {
    setError(null);
    setIsCallingNext(true);
    try {
      // TODO(socket-contract): confirm event name + payload/ack shape.
      await socket.callNext(doctorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call next patient.");
    } finally {
      setIsCallingNext(false);
    }
  }, [socket, doctorId]);

  const handleFormChange = (
    field: keyof ConsultationForm
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCompleteConsultation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentToken) return;

      setError(null);
      setIsSubmitting(true);
      try {
        // TODO(socket-contract): confirm whether consultation completion is
        // a socket event or a REST call. Currently assumed socket-based to
        // match the rest of the doctor console realtime flow.
        await socket.completeConsultation(doctorId, {
          tokenNumber: currentToken.tokenNumber,
          notes: form.notes,
          prescriptionSummary: form.prescriptionSummary,
          followUpDate: form.followUpDate || null,
          referral: form.referral || null,
        });
        setForm(emptyForm);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete consultation."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [socket, doctorId, currentToken, form]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Header connected={connected} />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <StatsGrid stats={stats} />

        <CurrentTokenCard
          token={currentToken}
          isCallingNext={isCallingNext}
          onCallNext={handleCallNext}
        />

        <ConsultationFormCard
          disabled={!currentToken || isSubmitting}
          isSubmitting={isSubmitting}
          form={form}
          onChange={handleFormChange}
          onSubmit={handleCompleteConsultation}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function Header({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connected ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        {connected ? "Live" : "Connecting..."}
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: QueueStats }) {
  const cards = [
    { label: "Today's Patients", value: stats.todayTotal, accent: "text-gray-900" },
    { label: "Completed", value: stats.completed, accent: "text-green-600" },
    { label: "Waiting", value: stats.waiting, accent: "text-amber-600" },
    { label: "Priority", value: stats.priority, accent: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`mt-1 text-3xl font-semibold ${card.accent}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function CurrentTokenCard({
  token,
  isCallingNext,
  onCallNext,
}: {
  token: CurrentToken | null;
  isCallingNext: boolean;
  onCallNext: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-500">Current Token</p>
          {token ? (
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {token.tokenNumber}
              </span>
              <div>
                <p className="font-medium text-gray-900">{token.patientName}</p>
                {token.isPriority && (
                  <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Priority
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-1 text-lg text-gray-400">No patient in consultation</p>
          )}
        </div>

        <button
          onClick={onCallNext}
          disabled={isCallingNext}
          className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCallingNext ? "Calling..." : "Call Next"}
        </button>
      </div>
    </div>
  );
}

function ConsultationFormCard({
  disabled,
  isSubmitting,
  form,
  onChange,
  onSubmit,
}: {
  disabled: boolean;
  isSubmitting: boolean;
  form: ConsultationForm;
  onChange: (
    field: keyof ConsultationForm
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Complete Consultation
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={onChange("notes")}
          disabled={disabled}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Consultation notes..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Prescription Summary
        </label>
        <textarea
          value={form.prescriptionSummary}
          onChange={onChange("prescriptionSummary")}
          disabled={disabled}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Medicines, dosage, instructions..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Follow-up Date
          </label>
          <input
            type="date"
            value={form.followUpDate}
            onChange={onChange("followUpDate")}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Referral
          </label>
          <input
            type="text"
            value={form.referral}
            onChange={onChange("referral")}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Referred specialist / department"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="rounded-md bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Complete Consultation"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentDoctorId(): string {
  // TODO: replace with real auth/session lookup once available.
  return "current-doctor-id";
}
