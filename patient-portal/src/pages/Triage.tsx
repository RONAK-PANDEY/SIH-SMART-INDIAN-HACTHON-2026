import { useState, FormEvent } from "react";

/**
 * Triage.tsx
 *
 * A structured self-triage questionnaire for patients. Collects a small,
 * fixed set of symptom signals and submits them for a risk categorization
 * (ROUTINE / PRIORITY / URGENT).
 *
 * IMPORTANT — API note:
 * The published API spec (docs/api-endpoints.md) only exposes
 * `POST /api/v1/triage-assessments`, which is restricted to
 * doctor/staff+ roles and expects a `severity_level` the clinician has
 * already determined — it does not accept raw patient-reported symptoms
 * or return a computed risk category. There is currently no documented
 * patient-facing endpoint that does symptom -> risk classification.
 *
 * This component posts to `POST /api/v1/patient-triage` as a placeholder.
 * Before shipping, confirm with the backend team whether:
 *   (a) a new patient-facing endpoint will be added at that path, or
 *   (b) this should instead create a `triage_assessment` in a pending
 *       state for a clinician to review/confirm (safer default, since
 *       it keeps a human in the loop on the actual risk determination).
 *
 * Also note: any "red flag" symptom (breathing difficulty, chest
 * discomfort, or altered consciousness) is force-escalated to URGENT
 * on the client as a conservative safety fallback, independent of
 * whatever the server returns. This is a stopgap, not a substitute for
 * a clinically-reviewed triage algorithm — that logic should ultimately
 * live server-side and be owned/signed off by clinical staff.
 */

type DurationOption = "<1h" | "1-6h" | "6-24h" | "1-3d" | ">3d";
type SeverityOption = "mild" | "moderate" | "severe";
type AgeGroup = "child_0_12" | "teen_13_17" | "adult_18_64" | "senior_65plus";
type RiskCategory = "ROUTINE" | "PRIORITY" | "URGENT";

interface TriageFormState {
  chiefComplaint: string;
  duration: DurationOption | "";
  severity: SeverityOption | "";
  fever: boolean;
  breathingDifficulty: boolean;
  chestDiscomfort: boolean;
  hasInjury: boolean;
  injuryDetails: string;
  consciousness: "alert" | "drowsy" | "unresponsive" | "";
  existingConditions: string;
  ageGroup: AgeGroup | "";
}

const initialState: TriageFormState = {
  chiefComplaint: "",
  duration: "",
  severity: "",
  fever: false,
  breathingDifficulty: false,
  chestDiscomfort: false,
  hasInjury: false,
  injuryDetails: "",
  consciousness: "",
  existingConditions: "",
  ageGroup: "",
};

const RISK_COPY: Record<
  RiskCategory,
  { label: string; description: string; accent: string }
> = {
  URGENT: {
    label: "Urgent",
    description:
      "Your answers suggest you should be seen right away. Please go to the nearest emergency department or call your local emergency number now.",
    accent: "#B3261E",
  },
  PRIORITY: {
    label: "Priority",
    description:
      "Your answers suggest you should be seen soon. A staff member will move your queue position up, but if things get worse before then, seek emergency care.",
    accent: "#9A6700",
  },
  ROUTINE: {
    label: "Routine",
    description:
      "Your answers don't indicate an immediate emergency. You'll be seen in the normal queue order. If your symptoms change or worsen, tell staff right away.",
    accent: "#1F6F4A",
  },
};

/**
 * Conservative client-side safety net. Red-flag combinations always
 * escalate regardless of what the server says, so a slow network or a
 * server bug can never silently downgrade someone with red-flag
 * symptoms to a lower-urgency category in the UI.
 */
function hasRedFlags(form: TriageFormState): boolean {
  return (
    form.breathingDifficulty ||
    form.chestDiscomfort ||
    form.consciousness === "unresponsive" ||
    form.consciousness === "drowsy"
  );
}

function escalate(a: RiskCategory, b: RiskCategory): RiskCategory {
  const order: RiskCategory[] = ["ROUTINE", "PRIORITY", "URGENT"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))];
}

export default function Triage() {
  const [form, setForm] = useState<TriageFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskCategory | null>(null);

  function update<K extends keyof TriageFormState>(
    key: K,
    value: TriageFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.chiefComplaint.trim()) return "Please describe your main symptom.";
    if (!form.duration) return "Please select how long you've had this symptom.";
    if (!form.severity) return "Please select a severity level.";
    if (!form.consciousness) return "Please select a consciousness level.";
    if (!form.ageGroup) return "Please select an age group.";
    if (form.hasInjury && !form.injuryDetails.trim())
      return "Please briefly describe the injury.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const token = window.localStorage?.getItem?.("access_token");
      const res = await fetch("/api/v1/patient-triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chief_complaint: form.chiefComplaint.trim(),
          duration: form.duration,
          severity: form.severity,
          fever: form.fever,
          breathing_difficulty: form.breathingDifficulty,
          chest_discomfort: form.chestDiscomfort,
          has_injury: form.hasInjury,
          injury_details: form.hasInjury ? form.injuryDetails.trim() : null,
          consciousness: form.consciousness,
          existing_conditions: form.existingConditions.trim() || null,
          age_group: form.ageGroup,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message || `Request failed (${res.status})`
        );
      }

      const data = await res.json();
      const serverRisk: RiskCategory = data.risk_category ?? "ROUTINE";
      const finalRisk = hasRedFlags(form)
        ? escalate(serverRisk, "URGENT")
        : serverRisk;

      setResult(finalRisk);
    } catch (err) {
      // Even if the network/API call fails, red-flag symptoms should
      // never be silently dropped — surface an urgent local fallback
      // rather than just an error message.
      if (hasRedFlags(form)) {
        setResult("URGENT");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong submitting your assessment. Please try again or speak to staff directly."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const risk = RISK_COPY[result];
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, borderTop: `4px solid ${risk.accent}` }}>
          <p style={styles.eyebrow}>Your result</p>
          <h1 style={{ ...styles.riskLabel, color: risk.accent }}>
            {risk.label}
          </h1>
          <p style={styles.riskDescription}>{risk.description}</p>

          <div style={styles.disclaimer}>
            This is a decision-support aid, not a diagnosis. It does not
            replace evaluation by a doctor or nurse. If you feel this result
            doesn't match how you feel, or your condition changes, tell
            hospital staff immediately.
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => {
              setResult(null);
              setForm(initialState);
            }}
          >
            Start a new assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <p style={styles.eyebrow}>Before you're seen</p>
        <h1 style={styles.title}>Tell us what's going on</h1>
        <p style={styles.subtitle}>
          These questions help staff understand how soon you should be seen.
          Answer as accurately as you can.
        </p>

        <Field label="What's your main symptom or concern?">
          <textarea
            style={styles.textarea}
            value={form.chiefComplaint}
            onChange={(e) => update("chiefComplaint", e.target.value)}
            placeholder="e.g. Sharp pain in my lower back"
            rows={3}
          />
        </Field>

        <Field label="How long have you had this symptom?">
          <SelectRow<DurationOption>
            value={form.duration}
            onChange={(v) => update("duration", v)}
            options={[
              { value: "<1h", label: "Less than 1 hour" },
              { value: "1-6h", label: "1–6 hours" },
              { value: "6-24h", label: "6–24 hours" },
              { value: "1-3d", label: "1–3 days" },
              { value: ">3d", label: "More than 3 days" },
            ]}
          />
        </Field>

        <Field label="How severe would you say it is?">
          <SelectRow<SeverityOption>
            value={form.severity}
            onChange={(v) => update("severity", v)}
            options={[
              { value: "mild", label: "Mild" },
              { value: "moderate", label: "Moderate" },
              { value: "severe", label: "Severe" },
            ]}
          />
        </Field>

        <Field label="Do you currently have a fever?">
          <ToggleRow
            value={form.fever}
            onChange={(v) => update("fever", v)}
          />
        </Field>

        <Field label="Are you having any difficulty breathing?">
          <ToggleRow
            value={form.breathingDifficulty}
            onChange={(v) => update("breathingDifficulty", v)}
          />
        </Field>

        <Field label="Any chest pain, pressure, or discomfort?">
          <ToggleRow
            value={form.chestDiscomfort}
            onChange={(v) => update("chestDiscomfort", v)}
          />
        </Field>

        <Field label="Is this related to an injury?">
          <ToggleRow
            value={form.hasInjury}
            onChange={(v) => update("hasInjury", v)}
          />
          {form.hasInjury && (
            <input
              style={{ ...styles.textInput, marginTop: 8 }}
              value={form.injuryDetails}
              onChange={(e) => update("injuryDetails", e.target.value)}
              placeholder="Briefly describe what happened"
            />
          )}
        </Field>

        <Field label="How alert do you feel right now?">
          <SelectRow<TriageFormState["consciousness"]>
            value={form.consciousness}
            onChange={(v) => update("consciousness", v)}
            options={[
              { value: "alert", label: "Fully alert" },
              { value: "drowsy", label: "Drowsy or confused" },
              { value: "unresponsive", label: "Very hard to wake / unresponsive" },
            ]}
          />
        </Field>

        <Field label="Any existing medical conditions we should know about?">
          <input
            style={styles.textInput}
            value={form.existingConditions}
            onChange={(e) => update("existingConditions", e.target.value)}
            placeholder="e.g. Diabetes, asthma — optional"
          />
        </Field>

        <Field label="Age group">
          <SelectRow<AgeGroup>
            value={form.ageGroup}
            onChange={(v) => update("ageGroup", v)}
            options={[
              { value: "child_0_12", label: "0–12" },
              { value: "teen_13_17", label: "13–17" },
              { value: "adult_18_64", label: "18–64" },
              { value: "senior_65plus", label: "65+" },
            ]}
          />
        </Field>

        {error && <div style={styles.errorBox}>{error}</div>}

        <button type="submit" style={styles.primaryButton} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit assessment"}
        </button>

        <p style={styles.footnote}>
          If you're experiencing a life-threatening emergency, don't wait for
          this form — alert staff or call your local emergency number now.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function SelectRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div style={styles.pillRow}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            ...styles.pill,
            ...(value === opt.value ? styles.pillActive : {}),
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={styles.pillRow}>
      <button
        type="button"
        onClick={() => onChange(true)}
        style={{ ...styles.pill, ...(value ? styles.pillActive : {}) }}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        style={{ ...styles.pill, ...(!value ? styles.pillActive : {}) }}
      >
        No
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F6F7F5",
    display: "flex",
    justifyContent: "center",
    padding: "48px 16px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#FFFFFF",
    borderRadius: 12,
    padding: "36px 32px",
    boxShadow: "0 1px 3px rgba(20,20,20,0.08)",
  },
  eyebrow: {
    fontSize: 13,
    color: "#6B7280",
    margin: "0 0 6px 0",
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
    margin: "0 0 8px 0",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    margin: "0 0 28px 0",
    lineHeight: 1.5,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#1F2937",
    marginBottom: 8,
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  textInput: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    padding: "8px 14px",
    fontSize: 13,
    borderRadius: 20,
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#374151",
    cursor: "pointer",
  },
  pillActive: {
    background: "#111827",
    borderColor: "#111827",
    color: "#FFFFFF",
  },
  primaryButton: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    marginTop: 8,
  },
  secondaryButton: {
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#111827",
    cursor: "pointer",
    marginTop: 20,
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#991B1B",
    fontSize: 13,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 16,
  },
  footnote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 16,
    lineHeight: 1.5,
  },
  riskLabel: {
    fontSize: 32,
    fontWeight: 700,
    margin: "8px 0 12px 0",
  },
  riskDescription: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 13,
    color: "#4B5563",
    background: "#F3F4F6",
    padding: "12px 14px",
    borderRadius: 8,
    lineHeight: 1.5,
  },
};
