"use client";

import { Check, ChevronDown, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { formatGbp } from "@/src/lib/format/currency";
import { PRICING_CONFIG } from "@/src/lib/pricing/config";

type OptionKey = "same_day" | "direct";

interface QuoteOption {
  milesRaw: number;
  distanceCharge: number;
  minimumCharge: number;
  minimumApplied: boolean;
  extraStopsCount: number;
  stopsFee: number;
  congestionApplied: boolean;
  congestionFee: number;
  total: number;
}

interface QuoteResultsClientProps {
  quoteRequestId: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  vanSizeLabel: string;
  readySummary: string;
  heading?: string;
  showEditDetailsLink?: boolean;
  quoteNote?: string;
  topAction?: ReactNode;
  options: {
    same_day: QuoteOption;
    direct: QuoteOption;
  };
}

function QuoteOptionCard({
  badge,
  title,
  subtitle,
  ctaLabel,
  variant,
  option,
  onBook,
  bookingInProgress,
}: {
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  variant: OptionKey;
  option: QuoteOption;
  onBook: () => Promise<void>;
  bookingInProgress: boolean;
}) {
  const isSameDay = variant === "same_day";

  return (
    <article
      className={`glass-card space-y-4 rounded-2xl p-5 shadow-[0_0_30px_rgba(168,85,247,0.14)] lg:p-6 ${
        isSameDay ? "border border-[var(--success-border)]" : "border border-[var(--border-strong)]"
      }`}
    >
      <div className="space-y-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isSameDay
              ? "status-success-chip ring-1 ring-[var(--success-border)]"
              : "bg-[var(--chip-bg)] text-[var(--accent-soft)] ring-1 ring-[var(--border-strong)]"
          }`}
        >
          {badge}
        </span>

        <div>
          <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
          <p className="mt-2 text-base text-[var(--text-muted)]">{subtitle}</p>
        </div>

        <div>
          <p className="price-gradient text-4xl font-bold leading-none sm:text-5xl">
            {formatGbp(option.total)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">VAT included</p>
        </div>
      </div>

      <details className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[var(--text-main)]">
          Price breakdown
          <ChevronDown className="h-4 w-4" />
        </summary>
        <div className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          <div className="flex justify-between">
            <span>Distance estimate</span>
            <span>{option.milesRaw.toFixed(2)} miles</span>
          </div>
          <div className="flex justify-between">
            <span>Distance charge</span>
            <span>{formatGbp(option.distanceCharge)}</span>
          </div>
          {option.minimumApplied ? (
            <div className="flex justify-between">
              <span>Minimum charge applied</span>
              <span>{formatGbp(option.minimumCharge)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Extra stops</span>
            <span>{formatGbp(option.stopsFee)}</span>
          </div>
          {option.congestionApplied ? (
            <div className="flex justify-between">
              <span>{PRICING_CONFIG.congestionCharge.label}</span>
              <span>{formatGbp(option.congestionFee)}</span>
            </div>
          ) : null}
          <div className="mt-3 space-y-1 border-t border-[var(--border-subtle)] pt-2 text-xs sm:text-sm">
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--accent-soft)]" />
              15 mins loading/unloading included
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[var(--accent-soft)]" />
              London Congestion Charge added if applicable
            </p>
          </div>
          <div className="mt-2 flex justify-between border-t border-[var(--border-subtle)] pt-2 font-semibold text-[var(--text-main)]">
            <span>Total (inc VAT)</span>
            <span>{formatGbp(option.total)}</span>
          </div>
        </div>
      </details>

      <button
        type="button"
        onClick={onBook}
        disabled={bookingInProgress}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${
          isSameDay
            ? "bg-[linear-gradient(to_right,rgba(67,211,137,0.94),rgba(16,185,129,0.94))] text-[var(--text-inverse)] shadow-[0_0_24px_rgba(34,197,94,0.22)]"
            : "gradient-button shadow-[0_0_24px_rgba(236,72,153,0.3)]"
        }`}
      >
        {bookingInProgress ? "Preparing booking..." : ctaLabel}
      </button>
    </article>
  );
}

export function QuoteResultsClient(props: QuoteResultsClientProps) {
  const router = useRouter();
  const [communityShareOptIn, setCommunityShareOptIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<OptionKey | null>(null);

  async function createBookingDraft(jobTypeChosen: OptionKey) {
    setError(null);
    setBookingType(jobTypeChosen);

    const response = await fetch("/api/booking-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteRequestId: props.quoteRequestId,
        jobTypeChosen,
        communityShareOptIn,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { bookingDraftId?: string; error?: string }
      | null;

    setBookingType(null);
    if (!response.ok || !result?.bookingDraftId) {
      setError(result?.error ?? "We couldn’t start your booking. Please try again.");
      return;
    }

    router.push(`/booking?bookingDraftId=${encodeURIComponent(result.bookingDraftId)}`);
  }

  const stopsCountLabel = `${props.deliveryPostcodes.length} stop${props.deliveryPostcodes.length === 1 ? "" : "s"}`;

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="headline-gradient text-2xl font-bold sm:text-3xl">{props.heading ?? "Your quote"}</h1>
          {props.topAction ?? null}
        </div>
        {props.quoteNote ? <p className="text-sm text-[var(--text-muted)]">{props.quoteNote}</p> : null}
        <div className="glass-card rounded-2xl p-5 shadow-[0_0_28px_rgba(168,85,247,0.1)]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">Quote summary</h2>
            {(props.showEditDetailsLink ?? true) ? (
              <Link
                href="/quote"
                className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4"
              >
                Edit details
              </Link>
            ) : null}
          </div>
          <div className="mt-3 grid gap-2 text-sm text-[var(--text-muted)] sm:grid-cols-2 lg:grid-cols-4">
            <p>
              <span className="font-semibold text-[var(--text-main)]">Collection:</span> {props.collectionPostcode}
            </p>
            <p>
              <span className="font-semibold text-[var(--text-main)]">Stops:</span> {stopsCountLabel}
            </p>
            <p>
              <span className="font-semibold text-[var(--text-main)]">Van size:</span> {props.vanSizeLabel}
            </p>
            <p>
              <span className="font-semibold text-[var(--text-main)]">Timing:</span> {props.readySummary}
            </p>
          </div>
          <details className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text-main)]">
              View stop postcodes
            </summary>
            <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
              {props.deliveryPostcodes.map((postcode, index) => (
                <li key={`${postcode}-${index}`}>
                  {index + 1}. {postcode}
                </li>
              ))}
            </ul>
          </details>
          <div className="mt-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] p-4">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">Community backup (optional)</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              If your chosen courier is busy, we can offer your job to another Same Day Connect courier — only with your approval.
            </p>
            <label className="mt-3 flex items-start gap-3 text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-[var(--border-strong)]"
                checked={communityShareOptIn}
                onChange={(event) => setCommunityShareOptIn(event.target.checked)}
              />
              <span>
                If my chosen courier is unavailable, I agree my job details can be shared with other
                Same Day Connect couriers to find availability.{" "}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1 font-medium text-[var(--accent-soft)] underline underline-offset-4"
                >
                  <Info className="h-3.5 w-3.5" />
                  Learn more
                </button>
              </span>
            </label>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            After you choose a service, you will complete the booking details and pay securely online
            to confirm the job.
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <QuoteOptionCard
          badge="Best value"
          title="Same Day Delivery"
          subtitle="Collected today, delivered today."
          ctaLabel="Continue with Same Day"
          variant="same_day"
          option={props.options.same_day}
          bookingInProgress={bookingType === "same_day"}
          onBook={() => createBookingDraft("same_day")}
        />
        <QuoteOptionCard
          badge="Fastest option"
          title="Direct Van Delivery — Fastest"
          subtitle="Straight from collection to delivery. No other stops."
          ctaLabel="Continue with Direct"
          variant="direct"
          option={props.options.direct}
          bookingInProgress={bookingType === "direct"}
          onBook={() => createBookingDraft("direct")}
        />
      </div>

      {error ? <p className="status-error text-sm">{error}</p> : null}

      {showModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Community matching</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-subtle)]">
              <li>We only share what’s needed to find availability.</li>
              <li>You’ll always see which courier accepts before confirming.</li>
              <li>You can choose not to share.</li>
            </ul>
            <button
              type="button"
              className="gradient-button mt-5 rounded-xl px-4 py-2 text-sm font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
