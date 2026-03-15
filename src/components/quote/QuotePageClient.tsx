"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { QuoteWidget, type QuoteWidgetInitialValues } from "@/src/components/quote/QuoteWidget";
import { formatGbp } from "@/src/lib/format/currency";
import type { VanSize } from "@/src/lib/pricing/config";
import {
  clearRecentQuotes,
  loadRecentQuotes,
  type RecentQuoteItem,
} from "@/src/lib/recentQuotes";

interface QuotePageClientProps {
  courierId?: string;
  courierBusinessName?: string;
  courierDisplayName?: string;
}

function getVanSizeLabel(vanType: VanSize): string {
  const labels: Record<VanSize, string> = {
    small: "Small Van",
    medium: "Medium Van",
    large: "Large Van",
  };
  return labels[vanType];
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  return parsed.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function QuotePageClient({
  courierId,
  courierBusinessName,
  courierDisplayName,
}: QuotePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentQuotes, setRecentQuotes] = useState<RecentQuoteItem[]>(() => loadRecentQuotes());
  const [formInitialValues, setFormInitialValues] = useState<QuoteWidgetInitialValues | undefined>(undefined);
  const [quoteWidgetKey, setQuoteWidgetKey] = useState(0);
  const [autoSubmitNonce, setAutoSubmitNonce] = useState(0);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [busyRecentActionId, setBusyRecentActionId] = useState<string | null>(null);
  const collectionParam = searchParams.get("collection")?.trim() ?? "";
  const deliveryParam = searchParams.get("delivery")?.trim() ?? "";
  const queryInitialValues = useMemo<QuoteWidgetInitialValues | undefined>(() => {
    if (!collectionParam || !deliveryParam) {
      return undefined;
    }

    return {
      collectionPostcode: collectionParam.toUpperCase(),
      deliveryPostcodes: [deliveryParam.toUpperCase()],
      readyMode: "ready_now",
      vanSize: "medium",
      jobType: "same_day",
    };
  }, [collectionParam, deliveryParam]);
  const effectiveInitialValues = queryInitialValues ?? formInitialValues;
  const effectiveQuoteWidgetKey = queryInitialValues
    ? `query:${queryInitialValues.collectionPostcode}:${queryInitialValues.deliveryPostcodes.join(",")}`
    : `manual:${quoteWidgetKey}`;
  const effectiveAutoSubmitNonce = queryInitialValues ? 1 : autoSubmitNonce;
  const introCopy = courierBusinessName
    ? `Get an instant quote for nationwide collection and delivery from ${courierBusinessName}, compare Same Day and Direct Van options, and see clear pricing with VAT included.`
    : "Get an instant quote for nationwide collection and delivery, compare Same Day and Direct Van options, and see clear pricing with VAT included. The service is suitable for business and personal deliveries and keeps the process simple from the start.";
  const closingCopy = courierDisplayName
    ? `Enter your route, compare your options, and book the service that suits your delivery best. If you need to talk the job through first, you can contact ${courierDisplayName} directly.`
    : "Enter your route, compare your options, and book the service that suits your delivery best. If you need to talk the job through first, you can contact me directly.";

  function loadQuoteIntoForm(item: RecentQuoteItem) {
    router.replace("/quote");
    setFormInitialValues({
      collectionPostcode: item.collectionPostcode,
      deliveryPostcodes: item.deliveryPostcodes,
      readyMode: item.readyMode,
      collectionDate: item.collectionDate,
      readyTime: item.readyTime,
      vanSize: item.vanType,
      jobType: item.selectedJobType ?? "same_day",
    });
    setQuoteWidgetKey((current) => current + 1);
  }

  function triggerRequote(item: RecentQuoteItem) {
    setRecentError(null);
    setBusyRecentActionId(item.id);
    loadQuoteIntoForm(item);
    setAutoSubmitNonce((current) => current + 1);
  }

  async function onBookFromRecent(item: RecentQuoteItem) {
    if (!item.quoteRequestId) {
      setRecentError("Run a requote first to create a bookable quote.");
      return;
    }

    setBusyRecentActionId(item.id);
    setRecentError(null);

    const response = await fetch("/api/booking-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteRequestId: item.quoteRequestId,
        jobTypeChosen: item.selectedJobType ?? "same_day",
        communityShareOptIn: false,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { bookingDraftId?: string; error?: string }
      | null;

    setBusyRecentActionId(null);
    if (!response.ok || !result?.bookingDraftId) {
      setRecentError(result?.error ?? "We couldn’t start your booking. Please try again.");
      return;
    }

    router.push(`/booking?bookingDraftId=${encodeURIComponent(result.bookingDraftId)}`);
  }

  function onClearHistory() {
    if (!window.confirm("Clear all recent quote history on this device?")) {
      return;
    }

    clearRecentQuotes();
    setRecentQuotes([]);
    setRecentError(null);
  }

  function onQuoteError(message: string) {
    setBusyRecentActionId(null);
    setRecentError(message);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <Link href="/" className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
          Back to home
        </Link>
        <header className="space-y-2">
          <p className="eyebrow-label">Quote page</p>
          <h1 className="page-title-gradient headline-gradient">Price your delivery</h1>
          <p className="body-copy max-w-3xl">{introCopy}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <section className="space-y-4">
            <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
              <h2 className="card-title">Choose the service that fits your job</h2>
              <p className="body-copy mt-3">
                Same Day Delivery is for urgent deliveries that need collecting quickly and
                delivered as soon as possible. Direct Van Delivery gives your load a dedicated
                vehicle with no unnecessary stops, which is ideal for important, fragile, or
                time-sensitive items.
              </p>
              <ul className="support-copy mt-4 space-y-2">
                <li>Instant quote for nationwide collection and delivery</li>
                <li>Clear pricing shown before you book</li>
                <li>VAT included</li>
                <li>Suitable for business and personal deliveries</li>
              </ul>
            </article>
            <QuoteWidget
              key={effectiveQuoteWidgetKey}
              courierId={courierId}
              initialValues={effectiveInitialValues}
              autoSubmitNonce={effectiveAutoSubmitNonce}
              onQuoteError={onQuoteError}
            />
            <p className="support-copy">{closingCopy}</p>
          </section>

          <aside className="content-panel space-y-4 rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="card-title">Recent quotes</h2>
              <button
                type="button"
                className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4"
                onClick={onClearHistory}
              >
                Clear history
              </button>
            </div>

            {recentQuotes.length === 0 ? (
              <p className="support-copy rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                No recent quotes yet. Enter postcodes to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentQuotes.map((item) => {
                  const firstDelivery = item.deliveryPostcodes[0] ?? "N/A";
                  const extraStops = Math.max(item.deliveryPostcodes.length - 1, 0);
                  const isBusy = busyRecentActionId === item.id;
                  const quoteRequestId = item.quoteRequestId;
                  const prebookText =
                    item.readyMode === "prebook"
                      ? `Pre-book${
                          item.collectionDate && item.readyTime
                            ? ` • ${formatDateTime(`${item.collectionDate}T${item.readyTime}:00`)}`
                            : ""
                        }`
                      : "Ready now";

                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4"
                    >
                      <p className="font-medium text-[var(--text-main)]">
                        {item.collectionPostcode} → {firstDelivery}
                        {extraStops > 0 ? ` +${extraStops} stop${extraStops > 1 ? "s" : ""}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {getVanSizeLabel(item.vanType)} • {prebookText}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-subtle)]">
                        Last calculated {formatDateTime(item.calculatedAt)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {typeof item.totals?.same_day === "number" ? (
                          <span className="status-success-chip rounded-full px-2.5 py-1 text-xs font-medium">
                            Same Day {formatGbp(item.totals.same_day)}
                          </span>
                        ) : null}
                        {typeof item.totals?.direct === "number" ? (
                          <span className="rounded-full border border-[var(--border-strong)] bg-[var(--chip-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-soft)]">
                            Fastest {formatGbp(item.totals.direct)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        {quoteRequestId ? (
                          <button
                            type="button"
                            className="font-medium text-[var(--accent-soft)] underline underline-offset-4"
                            onClick={() => router.push(`/quote/${encodeURIComponent(quoteRequestId)}`)}
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-[var(--text-subtle)]">View</span>
                        )}
                        <button
                          type="button"
                          disabled={isBusy}
                          className="font-medium text-[var(--accent-soft)] underline underline-offset-4 disabled:opacity-60"
                          onClick={() => triggerRequote(item)}
                        >
                          Requote
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || !quoteRequestId}
                          className="font-medium text-[var(--accent-soft)] underline underline-offset-4 disabled:text-[var(--text-subtle)] disabled:no-underline"
                          onClick={() => onBookFromRecent(item)}
                        >
                          Book
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {recentError ? <p className="status-error text-sm">{recentError}</p> : null}
          </aside>
        </div>

        <section className="content-panel rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-8">
          <p className="eyebrow-label">Need help first?</p>
          <h2 className="section-title mt-3">
            Use the quote page for the quickest price, or contact me if you want to talk it through.
          </h2>
          <p className="body-copy mt-4 max-w-3xl">
            If you already know your route, the instant quote is the quickest way to price your
            delivery. If you have questions about timings, service options, or the best fit for the
            job, get in touch and I will be happy to help.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="secondary-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
            >
              Contact me
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

