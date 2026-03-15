"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MapPinned, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface HeroSectionProps {
  eyebrow?: string;
  headline?: string;
  supportingText?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

const TRUST_POINTS = [
  "Nationwide collection and delivery",
  "Clear route-based pricing with VAT included",
  "Same day delivery and direct van delivery",
  "Trusted courier service for business and personal deliveries",
] as const;

const FEATURE_LOGOS = [
  { label: "Instant\nQuotes", Icon: Clock3 },
  { label: "Nationwide\nCoverage", Icon: MapPinned },
  { label: "Trusted\nCouriers", Icon: ShieldCheck },
] as const;

export function HeroSection({
  eyebrow = "Independent courier service",
  headline = "Independent courier service. Nationwide collection and delivery.",
  supportingText = "Get an instant quote in seconds with clear route-based pricing, VAT included, from a real courier business you can trust.",
  primaryCtaLabel = "Get a quote",
  primaryCtaHref = "/quote",
  secondaryCtaLabel = "How it works",
  secondaryCtaHref = "/services",
}: HeroSectionProps) {
  const [collection, setCollection] = useState("");
  const [delivery, setDelivery] = useState("");

  const [headlineTop, headlineBottom = ""] = headline
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (collection) params.set("collection", collection.toUpperCase());
    if (delivery) params.set("delivery", delivery.toUpperCase());

    const query = params.toString();
    window.location.href = `${primaryCtaHref}${query ? `?${query}` : ""}`;
  }

  return (
    <section className="hero-shell relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <div className="hero-ambient-glow pointer-events-none absolute -left-24 top-[-4rem] h-72 w-72 rounded-full blur-3xl" />
      <div className="hero-ambient-glow hero-ambient-glow--secondary pointer-events-none absolute -right-20 bottom-[-3rem] h-72 w-72 rounded-full blur-3xl" />
      <div className="hero-network-overlay pointer-events-none absolute inset-0 opacity-90" />

      <div className="relative grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-12">
        <div className="space-y-6 lg:pr-4">
          <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent-soft)]">
            {eyebrow}
          </span>

          <h1 className="max-w-[14ch] text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="hero-headline-top block">{headlineTop ?? headline}</span>
            {headlineBottom ? <span className="hero-headline-bottom mt-1 block">{headlineBottom}.</span> : null}
          </h1>

          <p className="max-w-[34rem] text-base leading-relaxed text-[var(--text-main)] sm:text-lg">
            {supportingText}
          </p>

          <ul className="space-y-2.5">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)] sm:text-base">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-soft)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={primaryCtaHref}
              className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-[0_0_26px_rgba(236,72,153,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={secondaryCtaHref}
              className="secondary-button inline-flex items-center rounded-xl px-5 py-3 font-semibold"
            >
              {secondaryCtaLabel}
            </Link>
          </div>

          <div className="grid max-w-[31rem] gap-4 pt-5 sm:grid-cols-3">
            {FEATURE_LOGOS.map(({ label, Icon }) => (
              <article key={label} className="feature-logo-tile">
                <span className="feature-logo-icon">
                  <Icon className="h-10 w-10" strokeWidth={1.8} />
                </span>
                <p className="feature-logo-label whitespace-pre-line">{label}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-quote-card rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-7 md:sticky md:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-soft)]">
            Get an instant quote
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Enter your route</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Add your collection and delivery postcodes to see clear pricing in seconds.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="hero-collection"
                className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]"
              >
                Collection postcode
              </label>
              <input
                id="hero-collection"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. EC1A 1BB"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="hero-input w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition focus:border-[var(--accent-soft)] focus:ring-2 focus:ring-[var(--accent-soft)]/25"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="hero-delivery"
                className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]"
              >
                Delivery postcode
              </label>
              <input
                id="hero-delivery"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. SW1A 2AA"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="hero-input w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-subtle)] outline-none transition focus:border-[var(--accent-soft)] focus:ring-2 focus:ring-[var(--accent-soft)]/25"
              />
            </div>

            <button
              type="submit"
              className="gradient-button mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Get a quote
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-[var(--text-subtle)]">
            Simple quote-first booking with no account needed to get started.
          </p>
        </aside>
      </div>
    </section>
  );
}
