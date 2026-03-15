import Link from "next/link";

import { getBookingJobTypeLabel } from "@/src/lib/booking/helpers";
import { formatGbp } from "@/src/lib/format/currency";
import { db } from "@/src/lib/db";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingDraftId?: string }>;
}) {
  const params = await searchParams;
  const bookingDraftId = params.bookingDraftId;

  if (!bookingDraftId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">Booking confirmation not found.</p>
        <Link
          href="/quote"
          className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4"
        >
          Back to quote
        </Link>
      </main>
    );
  }

  const bookingDraft = await db.bookingDraft.findUnique({
    where: { id: bookingDraftId },
    include: {
      booking: {
        include: {
          stops: {
            orderBy: { sequence: "asc" },
          },
        },
      },
      quoteRequest: {
        include: {
          courier: true,
        },
      },
    },
  });

  if (!bookingDraft) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">Booking confirmation not found.</p>
      </main>
    );
  }

  if (!bookingDraft.booking) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-10">
          <p className="eyebrow-label">Payment received</p>
          <h1 className="page-title mt-3">We are finalising your booking.</h1>
          <p className="body-copy mt-4 max-w-2xl">
            Your payment has been received and your booking is being confirmed. Refresh this page in
            a moment if the confirmation does not appear straight away.
          </p>
        </section>
      </main>
    );
  }

  const booking = bookingDraft.booking;
  const collectionStop = booking.stops.find((stop) => stop.kind === "COLLECTION");
  const deliveryStops = booking.stops.filter((stop) => stop.kind === "DELIVERY");
  const courierBusinessName = bookingDraft.quoteRequest.courier?.businessName ?? "Same Day Connect";

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6">
      <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-10">
        <p className="eyebrow-label">Booking confirmed</p>
        <h1 className="page-title mt-3">Your booking has been confirmed.</h1>
        <p className="body-copy mt-4 max-w-2xl">
          Payment has been received and your booking with {courierBusinessName} is now confirmed.
          Keep this page for your reference while the courier prepares for collection.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="text-sm font-semibold text-[var(--text-main)]">Booking reference</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{booking.id}</p>
          </div>
          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="text-sm font-semibold text-[var(--text-main)]">Amount paid</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{formatGbp(Number(booking.quotedTotal))}</p>
          </div>
          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="text-sm font-semibold text-[var(--text-main)]">Service</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{getBookingJobTypeLabel(booking.jobTypeChosen)}</p>
          </div>
          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="text-sm font-semibold text-[var(--text-main)]">Customer email</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{booking.customerEmail}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <h2 className="card-title">Collection</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {collectionStop?.addressLine1}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {collectionStop?.postcode}
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {collectionStop?.contactName} • {collectionStop?.contactPhone}
            </p>
          </div>

          <div className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <h2 className="card-title">Delivery stops</h2>
            <ul className="mt-3 space-y-3 text-sm text-[var(--text-muted)]">
              {deliveryStops.map((stop) => (
                <li key={stop.id}>
                  <p>{stop.addressLine1}</p>
                  <p>{stop.postcode}</p>
                  <p className="mt-1">
                    {stop.contactName} • {stop.contactPhone}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="secondary-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
          >
            Contact me
          </Link>
          <Link
            href="/quote"
            className="gradient-button inline-flex rounded-xl px-5 py-2.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
          >
            Price another delivery
          </Link>
        </div>
      </section>
    </main>
  );
}

