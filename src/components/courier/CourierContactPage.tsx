import type { Courier } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPinned, Phone, Truck } from "lucide-react";

import {
  COURIER_IMAGE_FALLBACKS,
  resolveCourierImage,
} from "@/src/lib/courier/getActiveCourier";
import { getCourierPayloadKg, getCourierVanLabel } from "@/src/lib/courier/payload";

interface CourierContactPageProps {
  courier: Courier;
  quoteHref?: string;
}

export function CourierContactPage({
  courier,
  quoteHref = "/quote",
}: CourierContactPageProps) {
  const payloadKg = courier.vanPayloadKg || getCourierPayloadKg(courier.vanType);
  const vanLabel = getCourierVanLabel(courier.vanType);
  const vanImage = resolveCourierImage(courier.vanPhotoUrl, COURIER_IMAGE_FALLBACKS.van);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="content-panel rounded-3xl border border-[var(--border-subtle)] p-8 sm:p-10">
        <p className="eyebrow-label">Contact</p>
        <h1 className="page-title mt-3">Speak directly with {courier.businessName}.</h1>
        <p className="body-copy-lg mt-4 max-w-3xl">
          {courier.displayName} runs an independent courier service based in {courier.baseArea}, with
          nationwide collection and delivery for business and personal jobs. If you want to ask about
          timing, service fit, vehicle space, or anything else before booking, you can get in touch
          directly.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={quoteHref}
            className="gradient-button inline-flex rounded-xl px-5 py-2.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
          >
            Go to the quote page
          </Link>
          {courier.phone ? (
            <a
              href={`tel:${courier.phone}`}
              className="secondary-button inline-flex rounded-xl px-5 py-2.5 font-semibold"
            >
              Call me
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">Contact details</h2>
          <div className="mt-4 space-y-3">
            {courier.phone ? (
              <a
                href={`tel:${courier.phone}`}
                className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--border-strong)]"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                  <Phone className="h-4 w-4 text-[var(--accent-soft)]" />
                  Phone
                </p>
                <p className="mt-1 text-sm text-[var(--text-subtle)]">{courier.phone}</p>
              </a>
            ) : null}

            {courier.email ? (
              <a
                href={`mailto:${courier.email}`}
                className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--border-strong)]"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                  <Mail className="h-4 w-4 text-[var(--accent-soft)]" />
                  Email
                </p>
                <p className="mt-1 text-sm text-[var(--text-subtle)]">{courier.email}</p>
              </a>
            ) : null}
          </div>
        </article>

        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">What I can help with</h2>
          <ul className="body-copy mt-4 space-y-3">
            <li>Questions about instant quotes, bookings, and delivery options.</li>
            <li>Advice on same day delivery, direct van delivery, and urgent jobs.</li>
            <li>Checking route fit, vehicle size, and collection timing.</li>
          </ul>
          <p className="support-copy mt-5">
            If you mainly want a price, the quote page is the quickest place to start. If you want
            to talk the job through first, call or email me directly.
          </p>
        </article>

        <article className="content-card rounded-2xl border border-[var(--border-subtle)] p-6">
          <h2 className="card-title">Vehicle and service area</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
              <Image
                src={vanImage}
                alt={`${courier.businessName} van`}
                width={640}
                height={360}
                className="h-auto w-full rounded-lg border border-[var(--border-subtle)] object-cover"
              />
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <Truck className="h-4 w-4 text-[var(--accent-soft)]" />
                Vehicle
              </p>
              <p className="mt-3 text-sm text-[var(--text-subtle)]">{vanLabel} Van</p>
              <p className="mt-2 text-sm text-[var(--text-subtle)]">Up to {payloadKg} kg payload</p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
                <MapPinned className="h-4 w-4 text-[var(--accent-soft)]" />
                Based in
              </p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">{courier.baseArea}</p>
              <p className="mt-2 text-sm text-[var(--text-subtle)]">
                Collections and deliveries can be arranged nationwide, with the courier based in{" "}
                {courier.baseArea}.
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

