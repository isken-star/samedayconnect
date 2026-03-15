import Image from "next/image";
import Link from "next/link";
import { Mail, MapPinned, Phone, Truck } from "lucide-react";

import { CourierContactPage } from "@/src/components/courier/CourierContactPage";
import { getCurrentCourierContext } from "@/src/lib/courier/current";

const CONTACT_DETAILS = {
  phone: "07479600928",
  email: "iskender.davies@gmail.com",
} as const;

export default async function ContactPage() {
  const currentCourier = await getCurrentCourierContext();

  if (currentCourier.courier) {
    return <CourierContactPage courier={currentCourier.courier} />;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-10">
        <p className="eyebrow-label">Contact</p>
        <h1 className="page-title mt-3">
          Speak to me directly about your delivery.
        </h1>
        <p className="body-copy-lg mt-4 max-w-3xl">
          I run an independent courier service based in Devon, with nationwide collection and
          delivery for business and personal deliveries. If you would like to ask about a quote,
          booking, service option, timing, or delivery requirement, you can contact me directly.
          For the quickest price, please use the quote page.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/quote"
            className="gradient-button inline-flex rounded-xl px-5 py-2.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
          >
            Go to the quote page
          </Link>
          <a
            href={`tel:${CONTACT_DETAILS.phone}`}
            className="secondary-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
          >
            Call me
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">Contact me directly</h2>
          <div className="mt-4 space-y-3">
            <a
              href={`tel:${CONTACT_DETAILS.phone}`}
              className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--border-strong)]"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <Phone className="h-4 w-4 text-[var(--accent-soft)]" />
                Phone
              </p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">{CONTACT_DETAILS.phone}</p>
            </a>
            <a
              href={`mailto:${CONTACT_DETAILS.email}`}
              className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--border-strong)]"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <Mail className="h-4 w-4 text-[var(--accent-soft)]" />
                Email
              </p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">{CONTACT_DETAILS.email}</p>
            </a>
          </div>
        </article>

        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">What I can help with</h2>
          <ul className="body-copy mt-4 space-y-3">
            <li>Questions about instant quotes, bookings, and delivery options.</li>
            <li>Advice on same day delivery, direct van delivery, and urgent deliveries.</li>
            <li>Help deciding whether the service is right for your job and timing.</li>
          </ul>
          <p className="support-copy mt-5">
            If you mainly want a price, the quote page is the quickest place to start. If you want
            to talk it through first, call or email me.
          </p>
        </article>

        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">Vehicle and service area</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
              <Image
                src="/couriers/isken-van.png"
                alt="Vauxhall Vivaro LWB van"
                width={640}
                height={360}
                className="h-auto w-full rounded-lg border border-[var(--border-subtle)] object-cover"
              />
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <Truck className="h-4 w-4 text-[var(--accent-soft)]" />
                My vehicle
              </p>
              <p className="mt-3 text-sm text-[var(--text-subtle)]">Vauxhall Vivaro LWB</p>
              <p className="mt-2 text-sm text-[var(--text-subtle)]">Carries up to three euro pallets</p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">Up to 1100 kg payload</p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <MapPinned className="h-4 w-4 text-[var(--accent-soft)]" />
                Based in
              </p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">Devon</p>
              <p className="mt-2 text-sm text-[var(--text-subtle)]">
                I am based in Devon and provide nationwide collection and delivery, with collections
                able to start anywhere.
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
