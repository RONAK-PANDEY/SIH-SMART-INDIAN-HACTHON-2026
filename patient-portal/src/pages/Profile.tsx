import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, ApiError } from "../lib/api";
import type { Patient, Appointment, Referral, Pagination } from "../lib/types";

// NOTE: docs/api-contracts.md has no GET /api/v1/patients/{id}/profile
// endpoint. This page composes the same information from three
// documented endpoints instead:
//   GET /api/v1/patients/{patient_id}                -> { patient }
//   GET /api/v1/patients/{patient_id}/appointments    -> { data, pagination }
//   GET /api/v1/patients/{patient_id}/referrals       -> { data, pagination }
// If a real aggregate /profile endpoint gets added later, swap the
// three calls below for one and drop the Promise.all.

const APPT_STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-800",
};

const REFERRAL_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  value,
  styles,
}: {
  value: string;
  styles: Record<string, string>;
}) {
  const style = styles[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {value.replace("_", " ")}
    </span>
  );
}

export default function ProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [appointmentsPagination, setAppointmentsPagination] =
    useState<Pagination | null>(null);
  const [referralsPagination, setReferralsPagination] =
    useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [patientRes, appointmentsRes, referralsRes] = await Promise.all(
          [
            apiGet<{ patient: Patient }>(`/patients/${patientId}`),
            apiGet<{ data: Appointment[]; pagination: Pagination }>(
              `/patients/${patientId}/appointments?page=1&page_size=25`
            ),
            apiGet<{ data: Referral[]; pagination: Pagination }>(
              `/patients/${patientId}/referrals?page=1&page_size=25`
            ),
          ]
        );

        if (cancelled) return;
        setPatient(patientRes.patient);
        setAppointments(appointmentsRes.data);
        setAppointmentsPagination(appointmentsRes.pagination);
        setReferrals(referralsRes.data);
        setReferralsPagination(referralsRes.pagination);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load profile.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-lg border border-gray-200" />
          <div className="h-40 rounded-lg border border-gray-200" />
          <div className="h-40 rounded-lg border border-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          Patient not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Patient info */}
      <section className="rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {patient.full_name}
          </h1>
          {patient.medical_record_number && (
            <p className="font-mono text-xs text-gray-500">
              MRN: {patient.medical_record_number}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Date of birth
            </p>
            <p className="text-sm text-gray-900">
              {formatDate(patient.date_of_birth)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Gender
            </p>
            <p className="text-sm capitalize text-gray-900">
              {patient.gender ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Blood group
            </p>
            <p className="text-sm text-gray-900">
              {patient.blood_group ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Phone
            </p>
            <p className="text-sm text-gray-900">{patient.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Email
            </p>
            <p className="text-sm text-gray-900">{patient.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Emergency contact
            </p>
            <p className="text-sm text-gray-900">
              {patient.emergency_contact_name
                ? `${patient.emergency_contact_name} (${
                    patient.emergency_contact_phone ?? "no phone"
                  })`
                : "—"}
            </p>
          </div>
          {patient.address && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Address
              </p>
              <p className="text-sm text-gray-900">{patient.address}</p>
            </div>
          )}
          {patient.allergies && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Allergies
              </p>
              <p className="text-sm text-gray-900">{patient.allergies}</p>
            </div>
          )}
        </div>
      </section>

      {/* Appointment history */}
      <section className="rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Appointment history
          </h2>
          {appointmentsPagination && (
            <span className="text-xs text-gray-500">
              {appointmentsPagination.total} total
            </span>
          )}
        </div>
        {appointments.length === 0 ? (
          <p className="px-6 py-6 text-sm text-gray-500">
            No appointments yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {appointments.map((appt) => (
              <li
                key={appt.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(appt.scheduled_at)}
                  </p>
                  {appt.reason && (
                    <p className="text-xs text-gray-500">{appt.reason}</p>
                  )}
                </div>
                <StatusBadge value={appt.status} styles={APPT_STATUS_STYLES} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Referral history */}
      <section className="rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Referral history
          </h2>
          {referralsPagination && (
            <span className="text-xs text-gray-500">
              {referralsPagination.total} total
            </span>
          )}
        </div>
        {referrals.length === 0 ? (
          <p className="px-6 py-6 text-sm text-gray-500">No referrals yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {referrals.map((ref) => (
              <li
                key={ref.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm text-gray-900">{ref.reason}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(ref.created_at)}
                  </p>
                </div>
                <StatusBadge
                  value={ref.status}
                  styles={REFERRAL_STATUS_STYLES}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
