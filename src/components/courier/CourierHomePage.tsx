import type { Courier } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, MapPinned, Shield, Truck } from "lucide-react";

import { HeroSection } from "@/src/components/home/HeroSection";
import { MeetYourCourierCard } from "@/src/components/courier/MeetYourCourierCard";

interface CourierHomePageProps {
  courier: Courier;
  quoteHref?: string;
  contactHref?: string;
  aboutHref?: string;
}

const SERVICE_POINTS = [
  {
    title: "Same day delivery",
    body: "Urgent collections and deliveries handled directly, with clear pricing before you book.",
    Icon: Truck,
  },
  {
    title: "Direct van delivery",
    body: "A dedicated vehicle from collection to delivery for important, fragile, or time-sensitive loads.",
    Icon: ArrowRight,
  },
  {
    title: "Real independent courier",
    body: "Straightforward communication, accountable service, and nationwide collection and delivery.",
    Icon: Shield,
  },
] as const;

export function CourierHomePage({
  courier,
  quoteHref = "/quote",
  contactHref = "/contact",
  aboutHref = "/about",
}: CourierHomePageProps) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6">
      <HeroSection
        eyebrow={courier.businessName}
        headline="Independent courier service. Nationwide collection and delivery."
        supportingText={`${courier.businessName} is based in ${courier.baseArea} and provides clear route-based pricing, direct communication, and reliable collection and delivery for business and personal jobs.`}
        primaryCtaHref={quoteHref}
        secondaryCtaLabel="Contact me"
        secondaryCtaHref={contactHref}
      />

      <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <p className="eyebrow-label">Meet your courier</p>
            <h2 className="section-title">
              Book directly with {courier.businessName}.
            </h2>
            <p className="body-copy max-w-2xl">
              This page belongs to {courier.displayName}, an independent courier based in{" "}
              {courier.baseArea}. You can get a quote online, contact the courier directly, and book
              with the same business that will handle the delivery.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--text-main)]">
              <MapPinned className="h-4 w-4 text-[var(--accent-soft)]" />
              Based in {courier.baseArea}. Nationwide collection and delivery available.
            </div>
          </div>

          <MeetYourCourierCard courier={courier} contactHref={contactHref} aboutHref={aboutHref} />
        </div>
      </section>

      <section className="home-story-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="eyebrow-label">Services</p>
          <h2 className="section-title">
            Clear delivery options with direct courier contact.
          </h2>
          <p className="body-copy max-w-3xl">
            Use the instant quote to price the route, compare the service options, and move forward
            with confidence. If you need to check timings or talk the job through first, you can
            contact the courier directly from this site.
          </p>
        </header>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {SERVICE_POINTS.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="home-story-card rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6"
            >
              <span className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)] sm:text-base">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta-panel rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-8 lg:p-10">
        <header className="space-y-3">
          <p className="eyebrow-label">Next step</p>
          <h2 className="section-title">Get a quote, or get in touch directly.</h2>
          <p className="body-copy max-w-3xl">
            The quickest way to price the job is to use the quote page. If you need to check the
            service, vehicle fit, or timing before you book, use the contact page and speak to the
            courier directly.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={quoteHref}
            className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.26)]"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={contactHref}
            className="secondary-button inline-flex items-center rounded-xl px-5 py-3 font-semibold"
          >
            Contact me
          </Link>
        </div>
      </section>
    </main>
  );
}

