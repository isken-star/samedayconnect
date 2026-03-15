"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { formatGbp } from "@/src/lib/format/currency";

interface DraftStop {
  id: string;
  sequence: number;
  kind: "DELIVERY";
  postcode: string;
  addressLine1: string;
  contactName: string;
  contactPhone: string;
}

interface BookingDraftFormProps {
  bookingDraftId: string;
  courierBusinessName: string;
  jobTypeLabel: string;
  readySummary: string;
  vanSizeLabel: string;
  collectionPostcode: string;
  quotedTotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  collectionAddressLine1: string;
  collectionContactName: string;
  collectionContactPhone: string;
  notes: string;
  reference: string;
  draftStops: DraftStop[];
  checkoutCancelled?: boolean;
}

interface ValidationErrors {
  form?: string;
}

function StripeBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(99,91,255,0.35)] bg-[rgba(99,91,255,0.12)] px-3 py-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        Powered by
      </span>
      <span className="rounded-md bg-[#635bff] px-2 py-1 text-xs font-semibold tracking-[0.04em] text-white">
        Stripe
      </span>
    </div>
  );
}

export function BookingDraftForm(props: BookingDraftFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [savedSnapshot, setSavedSnapshot] = useState({
    customerName: props.customerName,
    customerEmail: props.customerEmail,
    customerPhone: props.customerPhone,
    collectionAddressLine1: props.collectionAddressLine1,
    collectionContactName: props.collectionContactName,
    collectionContactPhone: props.collectionContactPhone,
    notes: props.notes,
    reference: props.reference,
    draftStops: props.draftStops,
  });
  const [customerName, setCustomerName] = useState(props.customerName);
  const [customerEmail, setCustomerEmail] = useState(props.customerEmail);
  const [customerPhone, setCustomerPhone] = useState(props.customerPhone);
  const [collectionAddressLine1, setCollectionAddressLine1] = useState(props.collectionAddressLine1);
  const [collectionContactName, setCollectionContactName] = useState(props.collectionContactName);
  const [collectionContactPhone, setCollectionContactPhone] = useState(props.collectionContactPhone);
  const [notes, setNotes] = useState(props.notes);
  const [reference, setReference] = useState(props.reference);
  const [draftStops, setDraftStops] = useState(props.draftStops);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const missingRequiredFields = useMemo(() => {
    const missing: string[] = [];

    if (!customerName.trim()) missing.push("your name");
    if (!customerEmail.trim()) missing.push("your email");
    if (!customerPhone.trim()) missing.push("your phone number");
    if (!collectionAddressLine1.trim()) missing.push("the full collection address");
    if (!collectionContactName.trim()) missing.push("the collection contact name");
    if (!collectionContactPhone.trim()) missing.push("the collection contact phone");

    draftStops.forEach((stop, index) => {
      if (!stop.addressLine1.trim()) missing.push(`the full address for delivery stop ${index + 1}`);
      if (!stop.contactName.trim()) missing.push(`the contact name for delivery stop ${index + 1}`);
      if (!stop.contactPhone.trim()) missing.push(`the contact phone for delivery stop ${index + 1}`);
    });

    return missing;
  }, [
    collectionAddressLine1,
    collectionContactName,
    collectionContactPhone,
    customerEmail,
    customerName,
    customerPhone,
    draftStops,
  ]);

  function showFormError(message: string) {
    setErrors({ form: message });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const hasUnsavedChanges = useMemo(() => {
    return (
      customerName !== savedSnapshot.customerName ||
      customerEmail !== savedSnapshot.customerEmail ||
      customerPhone !== savedSnapshot.customerPhone ||
      collectionAddressLine1 !== savedSnapshot.collectionAddressLine1 ||
      collectionContactName !== savedSnapshot.collectionContactName ||
      collectionContactPhone !== savedSnapshot.collectionContactPhone ||
      notes !== savedSnapshot.notes ||
      reference !== savedSnapshot.reference ||
      JSON.stringify(draftStops) !== JSON.stringify(savedSnapshot.draftStops)
    );
  }, [
    collectionAddressLine1,
    collectionContactName,
    collectionContactPhone,
    customerEmail,
    customerName,
    customerPhone,
    draftStops,
    notes,
    reference,
    savedSnapshot,
  ]);

  function updateStop(
    stopId: string,
    field: "addressLine1" | "contactName" | "contactPhone",
    value: string,
  ) {
    setDraftStops((current) =>
      current.map((stop) => (stop.id === stopId ? { ...stop, [field]: value } : stop)),
    );
  }

  function buildPayload() {
    return {
      customerName,
      customerEmail,
      customerPhone,
      collectionAddressLine1,
      collectionContactName,
      collectionContactPhone,
      notes,
      reference,
      draftStops: draftStops.map((stop) => ({
        id: stop.id,
        sequence: stop.sequence,
        kind: "DELIVERY" as const,
        postcode: stop.postcode,
        addressLine1: stop.addressLine1,
        contactName: stop.contactName,
        contactPhone: stop.contactPhone,
      })),
    };
  }

  function getClientValidationMessage(): string | null {
    if (missingRequiredFields.length === 0) {
      return null;
    }

    return `Please complete ${missingRequiredFields[0]} before continuing.`;
  }

  async function saveDraft() {
    setErrors({});
    setSaveMessage(null);
    const validationMessage = getClientValidationMessage();
    if (validationMessage) {
      showFormError(validationMessage);
      return false;
    }
    setSaving(true);

    const response = await fetch(`/api/booking-draft/${encodeURIComponent(props.bookingDraftId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });

    const result = (await response.json().catch(() => null)) as
      | { error?: string; details?: unknown }
      | null;

    setSaving(false);
    if (!response.ok) {
      showFormError(result?.error ?? "We couldn’t save your booking details. Please try again.");
      return false;
    }

    setSavedSnapshot({
      customerName,
      customerEmail,
      customerPhone,
      collectionAddressLine1,
      collectionContactName,
      collectionContactPhone,
      notes,
      reference,
      draftStops,
    });
    setSaveMessage("Booking details saved.");
    return true;
  }

  async function proceedToPayment() {
    setErrors({});
    setSaveMessage(null);
    const validationMessage = getClientValidationMessage();
    if (validationMessage) {
      showFormError(validationMessage);
      return;
    }
    setRedirectingToCheckout(true);

    const saved = await saveDraft();
    if (!saved) {
      setRedirectingToCheckout(false);
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingDraftId: props.bookingDraftId,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response.ok || !result?.url) {
      setRedirectingToCheckout(false);
      showFormError(result?.error ?? "We couldn’t start secure payment. Please try again.");
      return;
    }

    window.location.href = result.url;
  }

  return (
    <div
      ref={formRef}
      className="glass-card space-y-6 rounded-3xl p-6 shadow-[0_0_28px_rgba(168,85,247,0.12)]"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Complete your booking</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              You are booking directly with {props.courierBusinessName}. Complete the details below,
              then pay securely online to confirm the job.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-soft)]">
              Total to pay
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--text-main)]">
              {formatGbp(props.quotedTotal)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">VAT included</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text-muted)] md:grid-cols-4">
          <p>
            <span className="font-semibold text-[var(--text-main)]">Service:</span> {props.jobTypeLabel}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-main)]">Van:</span> {props.vanSizeLabel}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-main)]">Collection postcode:</span>{" "}
            {props.collectionPostcode}
          </p>
          <p>
            <span className="font-semibold text-[var(--text-main)]">Timing:</span> {props.readySummary}
          </p>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          Collection and delivery postcodes are prefilled from your quote and cannot be changed here.
          Complete the full addresses and contact details to continue to payment.
        </p>

        {props.checkoutCancelled ? (
          <p className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--text-muted)]">
            Payment was not completed. Your booking details are still saved, so you can review them
            and try again.
          </p>
        ) : null}
      </header>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Your details</h2>
          <p className="text-sm text-[var(--text-muted)]">All fields in this section are required.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="app-input px-3 py-2"
            placeholder="Your full name"
            value={customerName}
            required
            aria-required="true"
            onChange={(event) => setCustomerName(event.target.value)}
          />
          <input
            className="app-input px-3 py-2"
            placeholder="Email address"
            type="email"
            value={customerEmail}
            required
            aria-required="true"
            onChange={(event) => setCustomerEmail(event.target.value)}
          />
          <input
            className="app-input px-3 py-2 sm:col-span-2"
            placeholder="Phone number"
            value={customerPhone}
            required
            aria-required="true"
            onChange={(event) => setCustomerPhone(event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Collection details</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Full address and collection phone number are required.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="app-input px-3 py-2"
            placeholder="Full collection address"
            value={collectionAddressLine1}
            required
            aria-required="true"
            onChange={(event) => setCollectionAddressLine1(event.target.value)}
          />
          <input
            className="app-input px-3 py-2 opacity-85"
            value={props.collectionPostcode}
            readOnly
            required
            aria-label="Collection postcode"
          />
          <input
            className="app-input px-3 py-2"
            placeholder="Collection contact name"
            value={collectionContactName}
            required
            aria-required="true"
            onChange={(event) => setCollectionContactName(event.target.value)}
          />
          <input
            className="app-input px-3 py-2"
            placeholder="Collection contact phone"
            value={collectionContactPhone}
            required
            aria-required="true"
            onChange={(event) => setCollectionContactPhone(event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Delivery stops</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Enter the full address and contact details for every delivery stop.
          </p>
        </div>
        <div className="space-y-4">
          {draftStops.map((stop, index) => (
            <div
              key={stop.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-[var(--text-main)]">Delivery stop {index + 1}</h3>
                <span className="text-sm text-[var(--text-muted)]">{stop.postcode}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="app-input px-3 py-2"
                  placeholder="Full delivery address"
                  value={stop.addressLine1}
                  required
                  aria-required="true"
                  onChange={(event) => updateStop(stop.id, "addressLine1", event.target.value)}
                />
                <input
                  className="app-input px-3 py-2 opacity-85"
                  value={stop.postcode}
                  readOnly
                  required
                  aria-label={`Delivery stop ${index + 1} postcode`}
                />
                <input
                  className="app-input px-3 py-2"
                  placeholder="Delivery contact name"
                  value={stop.contactName}
                  required
                  aria-required="true"
                  onChange={(event) => updateStop(stop.id, "contactName", event.target.value)}
                />
                <input
                  className="app-input px-3 py-2"
                  placeholder="Delivery contact phone"
                  value={stop.contactPhone}
                  required
                  aria-required="true"
                  onChange={(event) => updateStop(stop.id, "contactPhone", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Additional details</h2>
        <div className="space-y-3">
          <textarea
            className="app-input min-h-28 w-full px-3 py-2"
            placeholder="Notes for your courier"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <input
            className="app-input px-3 py-2"
            placeholder="Reference (optional)"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </div>
      </section>

      <div className="rounded-2xl border border-[rgba(99,91,255,0.28)] bg-[linear-gradient(145deg,rgba(16,24,66,0.95),rgba(12,18,48,0.92))] p-4 text-sm text-[var(--text-muted)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-medium text-[var(--text-main)]">
            <ShieldCheck className="h-4 w-4 text-[#8ea0ff]" />
            Secure online payment
          </p>
          <StripeBadge />
        </div>
        <p className="mt-2">
          When your booking details are complete, you will be sent to Stripe Checkout to pay securely
          by card and confirm the booking.
        </p>
      </div>

      {errors.form ? <p className="status-error text-sm">{errors.form}</p> : null}
      {saveMessage && !errors.form ? (
        <p className="text-sm text-[var(--success-text)]">{saveMessage}</p>
      ) : null}
      {hasUnsavedChanges ? (
        <p className="text-sm text-[var(--text-muted)]">
          You have unsaved booking details. Save them before leaving this page.
        </p>
      ) : null}
      {missingRequiredFields.length > 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Complete all required address and phone fields before payment is available.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveDraft}
          disabled={saving || redirectingToCheckout}
          className="secondary-button rounded-xl px-5 py-3 font-semibold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save details"}
        </button>
        <button
          type="button"
          onClick={proceedToPayment}
          disabled={saving || redirectingToCheckout || missingRequiredFields.length > 0}
          className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)] disabled:opacity-60"
        >
          {redirectingToCheckout ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            "Pay with Stripe to confirm booking"
          )}
        </button>
      </div>
    </div>
  );
}

