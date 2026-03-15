import Link from "next/link";
import { ArrowRight, Phone, Shield, Truck, Zap } from "lucide-react";

import { CourierHomePage } from "@/src/components/courier/CourierHomePage";
import { HeroSection } from "@/src/components/home/HeroSection";
import { getCurrentCourierContext } from "@/src/lib/courier/current";

const SERVICE_PILLARS = [
  {
    title: "Same Day Delivery",
    body: "Fast collection and delivery for urgent jobs that need to move quickly, with clear route-based pricing and VAT included.",
    Icon: Truck,
  },
  {
    title: "Direct Van Delivery — Fastest",
    body: "A dedicated van from collection to delivery with no unnecessary stops, ideal for important, fragile, or time-sensitive loads.",
    Icon: Zap,
  },
  {
    title: "Trusted independent service",
    body: "A real courier business with nationwide coverage, accountable service, and straightforward communication from quote to delivery.",
    Icon: Shield,
  },
] as const;

const STORY_POINTS = [
  "We operate as an independent courier service, which means reliable collection and delivery, clear communication, and accountable service matter on every job.",
  "Our pricing is based on journey miles, giving you a straightforward instant quote before you book, with VAT included from the start.",
  "From urgent business shipments to personal deliveries, we keep the process simple: get a quote, choose the right service, and book with confidence.",
] as const;

const CTA_CARDS = [
  {
    title: "Get a quote",
    body: "Enter your route, see clear pricing in seconds, and book nationwide collection and delivery with confidence.",
    href: "/quote",
    helper: "Instant quote. Clear pricing. VAT included.",
    Icon: ArrowRight,
  },
  {
    title: "Contact us",
    body: "If you want to check timings, service fit, or delivery details first, get in touch directly.",
    href: "/contact",
    helper: "Straightforward help from a real courier business.",
    Icon: Phone,
  },
] as const;

export default async function HomePage() {
  const currentCourier = await getCurrentCourierContext();

  if (currentCourier.courier) {
    return <CourierHomePage courier={currentCourier.courier} />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6">
      <HeroSection />

      <section className="home-story-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-soft)]">
            Nationwide collection and delivery
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Clear delivery options from a real independent courier service.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
            We provide reliable collection and delivery across the UK with a simple instant quote
            process and clear distance-based pricing. Whether the job is urgent, important, or just
            needs handling properly, you can choose the service that fits and book with confidence.
          </p>
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {SERVICE_PILLARS.map(({ title, body, Icon }) => (
            <article key={title} className="home-story-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
              <span className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)] sm:text-base">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-story-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-soft)]">
              Why choose us
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              A trusted courier service built around clarity, reliability, and accountability.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
              We keep things straightforward so you know what you are booking, what it will cost,
              and what service to expect.
            </p>
          </div>

          <div className="space-y-4">
            {STORY_POINTS.map((point, index) => (
              <article key={point} className="home-story-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] text-sm font-semibold text-[var(--accent-soft)]">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">{point}</p>
              </article>
            ))}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--text-main)]">
              <Shield className="h-4 w-4 text-[var(--accent-soft)]" />
              Real courier business. Clear pricing. Accountable service.
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-soft)]">
            Get started
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Get an instant quote, or contact us if you want to discuss the job first.
          </h2>
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {CTA_CARDS.map(({ title, body, href, helper, Icon }) => (
            <article key={title} className="home-cta-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                  <p className="max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">{body}</p>
                </div>
                <span className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={href}
                  className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.26)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
                >
                  {title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="max-w-xs text-sm text-[var(--text-subtle)]">{helper}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
