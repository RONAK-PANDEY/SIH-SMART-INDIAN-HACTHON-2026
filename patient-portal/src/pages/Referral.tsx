import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, ApiError } from "../lib/api";
import type { Referral, Hospital, Department } from "../lib/types";

// NOTE: docs/api-contracts.md defines the referral response as
// { referral: { id, patient_id, visit_id, referring_doctor_id,
//   referring_hospital_id, referred_to_doctor_id, referred_to_hospital_id,
//   referred_to_department_id, reason, status, notes, created_at,
//   updated_at } }.
// There is no "priority" field on referrals in the contract, so it is not
// rendered here. If priority should come from the linked triage
// assessment's severity_level, that needs a separate fetch against
// GET /api/v1/triage-assessments?visit_id=... and should be added
// explicitly rather than assumed.

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReferralPage() {
  const { referralId } = useParams<{ referralId: string }>();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [fromHospital, setFromHospital] = useState<Hospital | null>(null);
  const [toHospital, setToHospital] = useState<Hospital | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!referralId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { referral } = await apiGet<{ referral: Referral }>(
          `/referrals/${referralId}`
        );
        if (cancelled) return;
        setReferral(referral);

        // Resolve names for display. Hospitals/departments are public
        // GETs per the contract, so these can run in parallel without
        // extra auth concerns.
        const lookups: Promise<void>[] = [];

        lookups.push(
          apiGet<{ hospital: Hospital }>(
            `/hospitals/${referral.referring_hospital_id}`
          ).then((r) => {
            if (!cancelled) setFromHospital(r.hospital);
          })
        );

        if (referral.referred_to_hospital_id) {
          lookups.push(
            apiGet<{ hospital: Hospital }>(
              `/hospitals/${referral.referred_to_hospital_id}`
            ).then((r) => {
              if (!cancelled) setToHospital(r.hospital);
            })
          );
        }

        if (referral.referred_to_department_id) {
          lookups.push(
            apiGet<{ department: Department }>(
              `/departments/${referral.referred_to_department_id}`
            ).then((r) => {
              if (!cancelled) setDepartment(r.department);
            })
          );
        }

        // Name lookups are cosmetic; don't fail the whole page if one
        // of them 404s (e.g. a since-deactivated hospital record).
        await Promise.allSettled(lookups);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError ? err.message : "Failed to load referral.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [referralId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="animate-pulse rounded-lg border border-gray-200 p-6">
          <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-2/3 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          Referral not found.
        </div>
      </div>
    );
  }

  const statusStyle =
    STATUS_STYLES[referral.status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Referral
            </p>
            <p className="font-mono text-sm text-gray-700">{referral.id}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyle}`}
          >
            {referral.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              From hospital
            </p>
            <p className="text-sm font-medium text-gray-900">
              {fromHospital?.name ?? referral.referring_hospital_id}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              To hospital
            </p>
            <p className="text-sm font-medium text-gray-900">
              {referral.referred_to_hospital_id
                ? toHospital?.name ?? referral.referred_to_hospital_id
                : "Not yet assigned"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Department
            </p>
            <p className="text-sm font-medium text-gray-900">
              {referral.referred_to_department_id
                ? department?.name ?? referral.referred_to_department_id
                : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(referral.created_at)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Reason
          </p>
          <p className="mt-1 text-sm text-gray-800">{referral.reason}</p>
        </div>

        {referral.notes && (
          <div className="border-t border-gray-100 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Notes
            </p>
            <p className="mt-1 text-sm text-gray-800">{referral.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
