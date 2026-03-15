import Link from "next/link";
import { ArrowRight, Shield, Truck, Zap } from "lucide-react";

export default function ServicesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-10">
        <p className="eyebrow-label">Services</p>
        <h1 className="page-title-gradient headline-gradient mt-3">
          Independent courier service with nationwide collection and delivery
        </h1>
        <p className="body-copy-lg mt-4 max-w-3xl">
          Choose the service that fits your delivery, get an instant quote, and book with clear
          route-based pricing. We handle reliable collection and delivery nationwide for both
          business and personal deliveries.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
            <Zap className="h-4 w-4" />
          </div>
          <h2 className="card-title mt-4">Same Day Delivery</h2>
          <p className="body-copy mt-3">
            Same Day Delivery is for urgent deliveries that need collecting quickly and delivered as
            soon as possible the same day. It is a straightforward option for customers who need a
            professional courier without delay.
          </p>
          <p className="support-copy mt-3">
            It works well for time-sensitive business shipments, important documents, replacement
            parts, stock transfers, and personal deliveries that cannot wait.
          </p>
          <p className="support-copy mt-3">
            Choose this service when speed matters and you want a same day courier with nationwide
            collection and delivery, clear pricing, and VAT included.
          </p>
        </article>
        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-bg)] p-2 text-[var(--accent-soft)]">
            <Truck className="h-4 w-4" />
          </div>
          <h2 className="card-title mt-4">Direct Van Delivery — Fastest</h2>
          <p className="body-copy mt-3">
            Direct Van Delivery gives your load a dedicated vehicle from collection to delivery,
            with no unnecessary stops in between. It is the right choice when the job needs a more
            controlled and direct service.
          </p>
          <p className="support-copy mt-3">
            This service suits fragile items, important consignments, urgent deliveries, and
            time-sensitive loads where keeping the journey simple matters.
          </p>
          <p className="support-copy mt-3">
            Choose direct van delivery when you want the fastest, most direct collection and
            delivery option available nationwide.
          </p>
        </article>
      </section>

      <section className="content-panel mt-8 rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-8">
        <h2 className="section-title">Why customers choose our courier service</h2>
        <p className="body-copy mt-4">
          We keep the service simple and professional. You can see the delivery options clearly,
          get a courier quote quickly, and book knowing the pricing is based on the route rather
          than unclear extras.
        </p>
        <p className="body-copy mt-3">
          As an independent courier service, we focus on reliable collection and delivery, clear
          communication, and accountable service from collection through to completion.
        </p>
        <p className="body-copy mt-3 text-[var(--text-main)]">
          Whether the job is local or long-distance, the aim stays the same: make nationwide
          collection and delivery feel straightforward and dependable.
        </p>
        <p className="support-copy mt-4 font-medium text-[var(--accent-soft)]">
          Trusted courier. Clear pricing. Nationwide coverage.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Clear pricing, VAT included",
            body: "Route-based pricing that is simple to understand before you book.",
          },
          {
            title: "Nationwide coverage",
            body: "Collections can start anywhere in the UK, with delivery nationwide.",
          },
          {
            title: "Real courier business",
            body: "A professional courier service with clear accountability and direct contact.",
          },
        ].map((item) => (
          <div key={item.title} className="content-card rounded-2xl border border-[var(--border-subtle)] p-5">
            <Shield className="h-4 w-4 text-[var(--accent-soft)]" />
            <h3 className="card-title mt-3">{item.title}</h3>
            <p className="support-copy mt-2">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <p className="support-copy mb-3">
          Start with your route and get an instant quote in seconds.
        </p>
        <Link
          href="/quote"
          className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
        >
          Get a quote
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
