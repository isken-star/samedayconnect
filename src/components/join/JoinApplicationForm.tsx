"use client";

import { useMemo, useState } from "react";

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "businessName"
    | "email"
    | "phone"
    | "areasCovered"
    | "vanType"
    | "insuranceConfirmed"
    | "message",
    string[]
  >
>;

interface JoinFormState {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  areasCovered: string;
  vanType: "" | "SMALL" | "MEDIUM" | "LARGE";
  insuranceConfirmed: boolean;
  message: string;
}

const INPUT_CLASSNAME =
  "app-input px-3 py-2";

const initialState: JoinFormState = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  areasCovered: "",
  vanType: "",
  insuranceConfirmed: false,
  message: "",
};

function getFirstError(errors: FieldErrors, key: keyof FieldErrors): string | undefined {
  return errors[key]?.[0];
}

export function JoinApplicationForm() {
  const [form, setForm] = useState<JoinFormState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitDisabled = useMemo(() => submitting, [submitting]);

  function onChange<K extends keyof JoinFormState>(key: K, value: JoinFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    setSubmitted(false);

    try {
      const response = await fetch("/api/join-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          areasCovered: form.areasCovered,
          vanType: form.vanType,
          insuranceConfirmed: form.insuranceConfirmed,
          message: form.message.trim() ? form.message.trim() : undefined,
        }),
      });

      const json = (await response.json().catch(() => null)) as
        | {
            error?: string;
            details?: { fieldErrors?: FieldErrors };
          }
        | null;

      if (!response.ok) {
        setFieldErrors(json?.details?.fieldErrors ?? {});
        setFormError(json?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setForm(initialState);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="glass-card rounded-2xl p-6 sm:p-8" aria-live="polite">
        <h3 className="text-2xl font-semibold">Application received</h3>
        <p className="mt-2 text-[var(--text-subtle)]">
          Thanks — we’ll be in touch within business hours.
        </p>
      </section>
    );
  }

  const fullNameError = getFirstError(fieldErrors, "fullName");
  const businessNameError = getFirstError(fieldErrors, "businessName");
  const emailError = getFirstError(fieldErrors, "email");
  const phoneError = getFirstError(fieldErrors, "phone");
  const areasCoveredError = getFirstError(fieldErrors, "areasCovered");
  const vanTypeError = getFirstError(fieldErrors, "vanType");
  const insuranceError = getFirstError(fieldErrors, "insuranceConfirmed");

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-1">
          <label htmlFor="fullName" className="text-sm font-medium text-[var(--text-main)]">
            Full name
          </label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? "fullName-error" : undefined}
          />
          {fullNameError ? (
            <p id="fullName-error" className="status-error text-sm" role="alert">
              {fullNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-1">
          <label htmlFor="businessName" className="text-sm font-medium text-[var(--text-main)]">
            Business name
          </label>
          <input
            id="businessName"
            value={form.businessName}
            onChange={(event) => onChange("businessName", event.target.value)}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(businessNameError)}
            aria-describedby={businessNameError ? "businessName-error" : undefined}
          />
          {businessNameError ? (
            <p id="businessName-error" className="status-error text-sm" role="alert">
              {businessNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-1">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text-main)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError ? (
            <p id="email-error" className="status-error text-sm" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-1">
          <label htmlFor="phone" className="text-sm font-medium text-[var(--text-main)]">
            Phone
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? "phone-error" : undefined}
          />
          {phoneError ? (
            <p id="phone-error" className="status-error text-sm" role="alert">
              {phoneError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="areasCovered" className="text-sm font-medium text-[var(--text-main)]">
            Area(s) covered
          </label>
          <input
            id="areasCovered"
            value={form.areasCovered}
            onChange={(event) => onChange("areasCovered", event.target.value)}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(areasCoveredError)}
            aria-describedby={areasCoveredError ? "areasCovered-error" : undefined}
          />
          {areasCoveredError ? (
            <p id="areasCovered-error" className="status-error text-sm" role="alert">
              {areasCoveredError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="vanType" className="text-sm font-medium text-[var(--text-main)]">
            Van type
          </label>
          <select
            id="vanType"
            value={form.vanType}
            onChange={(event) => onChange("vanType", event.target.value as JoinFormState["vanType"])}
            className={INPUT_CLASSNAME}
            aria-invalid={Boolean(vanTypeError)}
            aria-describedby={vanTypeError ? "vanType-error" : undefined}
          >
            <option value="">Select van type</option>
            <option value="SMALL">Small</option>
            <option value="MEDIUM">Medium</option>
            <option value="LARGE">Large</option>
          </select>
          {vanTypeError ? (
            <p id="vanType-error" className="status-error text-sm" role="alert">
              {vanTypeError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="message" className="text-sm font-medium text-[var(--text-main)]">
            Anything we should know
          </label>
          <textarea
            id="message"
            value={form.message}
            onChange={(event) => onChange("message", event.target.value)}
            className="app-input min-h-28 px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="inline-flex items-start gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-3 text-sm text-[var(--text-main)]">
            <input
              type="checkbox"
              checked={form.insuranceConfirmed}
              onChange={(event) => onChange("insuranceConfirmed", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--accent-soft)]"
              aria-invalid={Boolean(insuranceError)}
              aria-describedby={insuranceError ? "insurance-error" : undefined}
            />
            I have Goods in Transit and Public Liability insurance.
          </label>
          {insuranceError ? (
            <p id="insurance-error" className="status-error mt-2 text-sm" role="alert">
              {insuranceError}
            </p>
          ) : null}
        </div>
      </div>

      {formError ? (
        <p className="status-error mt-4 text-sm" role="alert">
          {formError}
        </p>
      ) : null}

      <p className="mt-5 text-sm text-[var(--text-subtle)]">
        Next: we’ll confirm your details, van type, insurance, and your preferred service area.
      </p>
      <button
        type="submit"
        disabled={submitDisabled}
        className="gradient-button mt-3 inline-flex rounded-xl px-5 py-2.5 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Apply to join"}
      </button>
      <p className="mt-2 text-sm text-[var(--text-subtle)]">We reply within business hours.</p>
    </form>
  );
}
