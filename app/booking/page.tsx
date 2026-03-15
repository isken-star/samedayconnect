import Link from "next/link";

import { BookingDraftForm } from "@/src/components/booking/BookingDraftForm";
import {
  formatReadySummary,
  getBookingJobTypeLabel,
  getVanSizeLabel,
} from "@/src/lib/booking/helpers";
import { db } from "@/src/lib/db";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingDraftId?: string; checkout?: string }>;
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
      draftStops: {
        orderBy: { sequence: "asc" },
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
        <p className="text-[var(--text-muted)]">Booking draft not found.</p>
        <Link href="/" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Back to quote
        </Link>
      </main>
    );
  }

  const courierBusinessName = bookingDraft.quoteRequest.courier?.businessName ?? "Same Day Connect Courier";
  const readySummary = formatReadySummary({
    readyMode: bookingDraft.quoteRequest.readyMode,
    collectionDateTime: bookingDraft.quoteRequest.collectionDateTime,
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <BookingDraftForm
        bookingDraftId={bookingDraft.id}
        courierBusinessName={courierBusinessName}
        jobTypeLabel={getBookingJobTypeLabel(bookingDraft.jobTypeChosen)}
        readySummary={readySummary}
        vanSizeLabel={getVanSizeLabel(bookingDraft.quoteRequest.selectedVanType)}
        collectionPostcode={bookingDraft.quoteRequest.collectionPostcode}
        quotedTotal={Number(bookingDraft.quotedTotal)}
        customerName={bookingDraft.customerName ?? ""}
        customerEmail={bookingDraft.customerEmail ?? ""}
        customerPhone={bookingDraft.customerPhone ?? ""}
        collectionAddressLine1={bookingDraft.collectionAddressLine1 ?? ""}
        collectionContactName={bookingDraft.collectionContactName ?? ""}
        collectionContactPhone={bookingDraft.collectionContactPhone ?? ""}
        notes={bookingDraft.notes ?? ""}
        reference={bookingDraft.reference ?? ""}
        draftStops={bookingDraft.draftStops.map((stop) => ({
          id: stop.id,
          sequence: stop.sequence,
          kind: "DELIVERY" as const,
          postcode: stop.postcode,
          addressLine1: stop.addressLine1 ?? "",
          contactName: stop.contactName ?? "",
          contactPhone: stop.contactPhone ?? "",
        }))}
        checkoutCancelled={params.checkout === "cancelled"}
      />

      <div className="mt-6">
        <Link href={`/quote/${encodeURIComponent(bookingDraft.quoteRequestId)}`} className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Back to quote
        </Link>
      </div>
    </main>
  );
}
