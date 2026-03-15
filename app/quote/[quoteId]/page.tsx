import Link from "next/link";

import { QuoteResultsClient } from "@/src/components/quote/QuoteResultsClient";
import { db } from "@/src/lib/db";

function getVanSizeLabel(vanType: "SMALL" | "MEDIUM" | "LARGE"): string {
  const labels: Record<typeof vanType, string> = {
    SMALL: "Small Van",
    MEDIUM: "Medium Van",
    LARGE: "Large Van",
  };
  return labels[vanType];
}

function formatReadySummary(input: {
  readyMode: "READY_NOW" | "PREBOOK";
  collectionDateTime: Date | null;
}): string {
  if (input.readyMode === "READY_NOW") {
    return "Ready now";
  }

  if (!input.collectionDateTime) {
    return "Pre-book";
  }

  return `Pre-book for ${input.collectionDateTime.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

export default async function QuoteResultPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;

  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id: quoteId },
    include: { quoteResults: true },
  });

  if (!quoteRequest) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">Quote not found.</p>
        <Link href="/quote" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Get a new quote
        </Link>
      </main>
    );
  }

  const sameDay = quoteRequest.quoteResults.find((item) => item.jobType === "SAME_DAY");
  const direct = quoteRequest.quoteResults.find((item) => item.jobType === "DIRECT");

  if (!sameDay || !direct) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[var(--text-muted)]">This quote is incomplete. Please try again.</p>
        <Link href="/quote" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Get a new quote
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/quote" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          New quote
        </Link>
      </div>

      <QuoteResultsClient
        quoteRequestId={quoteRequest.id}
        collectionPostcode={quoteRequest.collectionPostcode}
        deliveryPostcodes={quoteRequest.deliveryPostcodes}
        vanSizeLabel={getVanSizeLabel(quoteRequest.selectedVanType)}
        readySummary={formatReadySummary({
          readyMode: quoteRequest.readyMode,
          collectionDateTime: quoteRequest.collectionDateTime,
        })}
        options={{
          same_day: {
            milesRaw: sameDay.miles,
            distanceCharge: Number(sameDay.distanceCharge),
            minimumCharge: Number(sameDay.minimumCharge),
            minimumApplied: sameDay.minimumApplied,
            extraStopsCount: sameDay.extraStopsCount,
            stopsFee: Number(sameDay.stopsFee),
            congestionApplied: sameDay.congestionApplied,
            congestionFee: Number(sameDay.congestionFee),
            total: Number(sameDay.total),
          },
          direct: {
            milesRaw: direct.miles,
            distanceCharge: Number(direct.distanceCharge),
            minimumCharge: Number(direct.minimumCharge),
            minimumApplied: direct.minimumApplied,
            extraStopsCount: direct.extraStopsCount,
            stopsFee: Number(direct.stopsFee),
            congestionApplied: direct.congestionApplied,
            congestionFee: Number(direct.congestionFee),
            total: Number(direct.total),
          },
        }}
      />
    </main>
  );
}
