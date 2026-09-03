import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Gender = "male" | "female" | "other";
type Language = "en" | "hi" | "pa";
type PatientMode = "new" | "existing";

interface FormState {
  fullName: string;
  age: string;
  gender: Gender | "";
  mobile: string;
  address: string;
  idNumber: string; // optional govt/medical ID -> mapped to medical_record_number
  language: Language;
  mode: PatientMode;
}

interface FormErrors {
  fullName?: string;
  age?: string;
  gender?: string;
  mobile?: string;
  address?: string;
}

const initialState: FormState = {
  fullName: "",
  age: "",
  gender: "",
  mobile: "",
  address: "",
  idNumber: "",
  language: "en",
  mode: "new",
};

const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers starting 6-9

function ageToDateOfBirth(age: string): string | undefined {
  const n = Number(age);
  if (!n || n <= 0) return undefined;
  const today = new Date();
  const year = today.getFullYear() - n;
  // Use Jan 1 of the birth year as an approximation since only age was collected.
  return `${year}-01-01`;
}

export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    field: keyof FormState
  ) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (values: FormState): FormErrors => {
    const next: FormErrors = {};

    if (!values.fullName.trim()) {
      next.fullName = "Name is required.";
    } else if (values.fullName.trim().length < 2) {
      next.fullName = "Name must be at least 2 characters.";
    }

    if (!values.age.trim()) {
      next.age = "Age is required.";
    } else {
      const n = Number(values.age);
      if (!Number.isInteger(n) || n <= 0 || n > 120) {
        next.age = "Enter a valid age between 1 and 120.";
      }
    }

    if (!values.gender) {
      next.gender = "Please select a gender.";
    }

    if (!values.mobile.trim()) {
      next.mobile = "Mobile number is required.";
    } else if (!MOBILE_REGEX.test(values.mobile.trim())) {
      next.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!values.address.trim()) {
      next.address = "Address is required.";
    }

    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // Note: the /api/v1/patients schema has no `age` or `language` fields.
    // Age is converted to an approximate date_of_birth. Preferred language is
    // kept in local/session state for the portal UI to use elsewhere (e.g.
    // notification preferences), since the Patient Service doesn't store it.
    const payload = {
      full_name: form.fullName.trim(),
      date_of_birth: ageToDateOfBirth(form.age),
      gender: form.gender,
      phone: form.mobile.trim(),
      address: form.address.trim(),
      medical_record_number: form.idNumber.trim() || undefined,
    };

    try {
      const token = window.sessionStorage.getItem("access_token");
      const res = await fetch("/api/v1/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.error?.message ||
          "Something went wrong while registering. Please try again.";
        setSubmitError(message);
        setSubmitting(false);
        return;
      }

      // Stash preferred language + patient mode for downstream screens.
      window.sessionStorage.setItem("preferred_language", form.language);
      window.sessionStorage.setItem("patient_mode", form.mode);
      window.sessionStorage.setItem("patient_id", data.patient.id);

      navigate("/hospital-select");
    } catch (err) {
      setSubmitError(
        "Unable to reach the server. Please check your connection and try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Patient Registration</h1>

      <div className="patient-mode-toggle" role="radiogroup" aria-label="Patient type">
        <button
          type="button"
          className={form.mode === "new" ? "active" : ""}
          onClick={() => setForm((prev) => ({ ...prev, mode: "new" }))}
        >
          New Patient
        </button>
        <button
          type="button"
          className={form.mode === "existing" ? "active" : ""}
          onClick={() => setForm((prev) => ({ ...prev, mode: "existing" }))}
        >
          Existing Patient
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange("fullName")}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <span id="fullName-error" className="error">
              {errors.fullName}
            </span>
          )}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              min={1}
              max={120}
              value={form.age}
              onChange={handleChange("age")}
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? "age-error" : undefined}
            />
            {errors.age && (
              <span id="age-error" className="error">
                {errors.age}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={form.gender}
              onChange={handleChange("gender")}
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? "gender-error" : undefined}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <span id="gender-error" className="error">
                {errors.gender}
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={handleChange("mobile")}
            aria-invalid={!!errors.mobile}
            aria-describedby={errors.mobile ? "mobile-error" : undefined}
            placeholder="10-digit mobile number"
          />
          {errors.mobile && (
            <span id="mobile-error" className="error">
              {errors.mobile}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            value={form.address}
            onChange={handleChange("address") as unknown as (
              e: React.ChangeEvent<HTMLTextAreaElement>
            ) => void}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
          />
          {errors.address && (
            <span id="address-error" className="error">
              {errors.address}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="idNumber">ID Number (optional)</label>
          <input
            id="idNumber"
            type="text"
            value={form.idNumber}
            onChange={handleChange("idNumber")}
            placeholder="Aadhaar / other ID (optional)"
          />
        </div>

        <div className="field">
          <label htmlFor="language">Preferred Language</label>
          <select id="language" value={form.language} onChange={handleChange("language")}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="pa">Punjabi</option>
          </select>
        </div>

        {submitError && <div className="submit-error">{submitError}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
