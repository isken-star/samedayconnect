import Link from "next/link";

import { db } from "@/src/lib/db";

function getJobTypeLabel(jobType: "SAME_DAY" | "DIRECT"): string {
  return jobType === "SAME_DAY" ? "Same Day Delivery" : "Direct Van Delivery (Dedicated)";
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingDraftId?: string }>;
}) {
  const params = await searchParams;
  const bookingDraftId = params.bookingDraftId;

  if (!bookingDraftId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">No booking draft found.</p>
        <Link href="/" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Back to quote
        </Link>
      </main>
    );
  }

  const bookingDraft = await db.bookingDraft.findUnique({
    where: { id: bookingDraftId },
    include: {
      quoteRequest: {
        include: { courier: true },
      },
    },
  });

  if (!bookingDraft) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">Booking draft not found.</p>
        <Link href="/" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Back to quote
        </Link>
      </main>
    );
  }

  const courierBusinessName = bookingDraft.quoteRequest.courier?.businessName ?? "Same Day Connect Courier";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="glass-card space-y-5 rounded-3xl p-6 shadow-[0_0_28px_rgba(168,85,247,0.12)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">
            You’re booking with: {courierBusinessName}
          </h1>
          <p className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--accent-soft)]">
            Part of Same Day Connect
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Service selected: {getJobTypeLabel(bookingDraft.jobTypeChosen)}
          </p>
        </header>

        <form className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Collection details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
                placeholder="Collection address line 1"
              />
              <input className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2" placeholder="Postcode" />
              <input className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2" placeholder="Contact name" />
              <input className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2" placeholder="Contact phone" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Delivery stops</h2>
            {bookingDraft.quoteRequest.deliveryPostcodes.map((postcode, index) => (
              <div key={`${postcode}-${index}`} className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
                  placeholder={`Delivery ${index + 1} address line 1`}
                />
                <input
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
                  defaultValue={postcode}
                  placeholder="Postcode"
                />
                <input
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
                  placeholder={`Delivery ${index + 1} contact name`}
                />
                <input
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
                  placeholder={`Delivery ${index + 1} contact phone`}
                />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Additional details</h2>
            <textarea
              className="min-h-24 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2"
              placeholder="Notes for your courier"
            />
            <input className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2" placeholder="Reference (optional)" />
          </section>

          <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--text-muted)]">
            Payment is taken by {courierBusinessName} via Direct Debit (GoCardless).
          </p>

          <button
            type="submit"
            className="gradient-button w-full rounded-xl px-4 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
          >
            Confirm booking
          </button>
        </form>
      </div>
    </main>
  );
}
